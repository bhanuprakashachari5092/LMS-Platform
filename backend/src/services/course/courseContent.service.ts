import { db } from '../../firebase';
import { coursesCollection, modulesCollection, lessonsCollection } from '../../firebase/collections';
import { CourseModuleDoc, CourseLessonDoc, CourseContentSummary, LessonQueryOptions } from '../../types/courseContent.types';
import { fromDocument, toDocument } from '../../utils/firestore';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CourseContentService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttlMs = this.DEFAULT_TTL_MS): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public invalidateCache(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retrieves all modules for a given course, ordered by 'order' ascending.
   */
  async getCourseModules(courseId: string): Promise<CourseModuleDoc[]> {
    const cacheKey = `modules:${courseId}`;
    const cached = this.getFromCache<CourseModuleDoc[]>(cacheKey);
    if (cached) return cached;

    try {
      // 1. Try course subcollection: courses/{courseId}/modules
      let snapshot = await db.collection('courses').doc(courseId).collection('modules').get().catch(() => null);

      if (!snapshot || snapshot.empty) {
        // 2. Fallback to top-level modules collection with courseId filter
        snapshot = await modulesCollection().where('courseId', '==', courseId).get();
      }

      if (!snapshot || snapshot.empty) {
        // 3. Fallback: check if the course doc itself has embedded modules array
        const courseDoc = await coursesCollection().doc(courseId).get();
        if (courseDoc.exists) {
          const cData = courseDoc.data();
          if (cData && Array.isArray(cData.modules) && cData.modules.length > 0) {
            const modules: CourseModuleDoc[] = cData.modules.map((m: any, index: number) => {
              const idx = m.orderIndex ?? m.order ?? (index + 1);
              return {
                id: m.id || `${courseId}-mod-${index + 1}`,
                courseId,
                title: m.title || `Module ${index + 1}`,
                description: m.description || '',
                orderIndex: idx,
                order: idx,
                duration: m.duration || '2 Hours',
                topics: m.topics || [],
                lessonsCount: Array.isArray(m.topics) ? m.topics.reduce((acc: number, t: any) => acc + (t.learningUnits?.length || 0), 0) : 1,
              };
            });
            modules.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
            this.setCache(cacheKey, modules);
            return modules;
          }
        }
        return [];
      }

      const modules: CourseModuleDoc[] = [];
      snapshot.forEach((doc) => {
        const raw = fromDocument<any>(doc);
        const idx = raw.orderIndex ?? raw.order ?? 1;
        modules.push({
          ...raw,
          orderIndex: idx,
          order: idx,
        });
      });

      modules.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
      this.setCache(cacheKey, modules);
      return modules;
    } catch (error) {
      console.error(`Error fetching modules for course ${courseId}:`, error);
      return [];
    }
  }

  /**
   * Retrieves lessons for a given module.
   * If includeContent is false (default), excludes massive reading content string.
   */
  async getModuleLessons(courseId: string, moduleId: string, options: LessonQueryOptions = {}): Promise<CourseLessonDoc[]> {
    const includeContent = options.includeContent === true;
    const cacheKey = `lessons:${courseId}:${moduleId}:${includeContent}`;
    const cached = this.getFromCache<CourseLessonDoc[]>(cacheKey);
    if (cached) return cached;

    try {
      // 1. Try course subcollection: courses/{courseId}/modules/{moduleId}/lessons
      let snapshot = await db
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(moduleId)
        .collection('lessons')
        .get()
        .catch(() => null);

      if (!snapshot || snapshot.empty) {
        // 2. Fallback to top-level lessons collection with moduleId filter
        snapshot = await lessonsCollection().where('moduleId', '==', moduleId).get();
      }

      if (!snapshot || snapshot.empty) {
        return [];
      }

      const lessons: CourseLessonDoc[] = [];
      snapshot.forEach((doc) => {
        const raw = fromDocument<any>(doc);
        const idx = raw.orderIndex ?? raw.order ?? 1;
        const normalized: CourseLessonDoc = {
          ...raw,
          orderIndex: idx,
          order: idx,
        };
        if (!includeContent) {
          // Remove heavy content payload for lightweight summary
          const { content, ...summary } = normalized;
          lessons.push(summary as CourseLessonDoc);
        } else {
          lessons.push(normalized);
        }
      });

      lessons.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
      this.setCache(cacheKey, lessons);
      return lessons;
    } catch (error) {
      console.error(`Error fetching lessons for module ${moduleId}:`, error);
      return [];
    }
  }

  /**
   * Retrieves full lesson content by lessonId.
   */
  async getLessonById(lessonId: string, courseId?: string, moduleId?: string): Promise<CourseLessonDoc | null> {
    const cacheKey = `lesson:${lessonId}`;
    const cached = this.getFromCache<CourseLessonDoc>(cacheKey);
    if (cached) return cached;

    try {
      // 1. Check canonical nested subcollection first if courseId & moduleId are provided
      if (courseId && moduleId) {
        const subDoc = await db
          .collection('courses')
          .doc(courseId)
          .collection('modules')
          .doc(moduleId)
          .collection('lessons')
          .doc(lessonId)
          .get();
        if (subDoc.exists) {
          const raw = fromDocument<any>(subDoc);
          const idx = raw.orderIndex ?? raw.order ?? 1;
          const lesson: CourseLessonDoc = {
            ...raw,
            orderIndex: idx,
            order: idx,
          };
          this.setCache(cacheKey, lesson);
          return lesson;
        }
      }

      // 2. Fallback to top-level legacy lessons collection
      const docSnap = await lessonsCollection().doc(lessonId).get();
      if (docSnap.exists) {
        const raw = fromDocument<any>(docSnap);
        const idx = raw.orderIndex ?? raw.order ?? 1;
        const lesson: CourseLessonDoc = {
          ...raw,
          orderIndex: idx,
          order: idx,
        };
        this.setCache(cacheKey, lesson);
        return lesson;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching lesson ${lessonId}:`, error);
      return null;
    }
  }

  /**
   * Creates or updates a module document in Firestore.
   * Canonical write target: courses/{courseId}/modules/{moduleId}
   */
  async saveModule(courseId: string, moduleDoc: CourseModuleDoc): Promise<void> {
    const orderIndex = moduleDoc.orderIndex ?? moduleDoc.order ?? 1;
    const cleanDoc = toDocument({
      ...moduleDoc,
      courseId,
      orderIndex,
      order: orderIndex,
      updatedAt: new Date(),
    });

    // Primary Canonical Subcollection: courses/{courseId}/modules/{moduleId}
    await db.collection('courses').doc(courseId).collection('modules').doc(moduleDoc.id).set(cleanDoc, { merge: true });

    this.invalidateCache(`modules:${courseId}`);
  }

  /**
   * Creates or updates a lesson document in Firestore.
   * Canonical write target: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
   */
  async saveLesson(courseId: string, moduleId: string, lessonDoc: CourseLessonDoc): Promise<void> {
    const orderIndex = lessonDoc.orderIndex ?? lessonDoc.order ?? 1;
    const cleanDoc = toDocument({
      ...lessonDoc,
      courseId,
      moduleId,
      orderIndex,
      order: orderIndex,
      updatedAt: new Date(),
    });

    // Primary Canonical Subcollection: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
    await db
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(moduleId)
      .collection('lessons')
      .doc(lessonDoc.id)
      .set(cleanDoc, { merge: true });

    this.invalidateCache(`lessons:${courseId}:${moduleId}`);
    this.invalidateCache(`lesson:${lessonDoc.id}`);
  }

  /**
   * Deletes a lesson and clears cache.
   */
  async deleteLesson(lessonId: string, courseId?: string, moduleId?: string): Promise<boolean> {
    try {
      const batch = db.batch();
      batch.delete(lessonsCollection().doc(lessonId));

      if (courseId && moduleId) {
        const subRef = db
          .collection('courses')
          .doc(courseId)
          .collection('modules')
          .doc(moduleId)
          .collection('lessons')
          .doc(lessonId);
        batch.delete(subRef);
      }

      await batch.commit();
      this.invalidateCache(`lesson:${lessonId}`);
      if (courseId && moduleId) {
        this.invalidateCache(`lessons:${courseId}:${moduleId}`);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting lesson ${lessonId}:`, error);
      return false;
    }
  }
}

export const courseContentService = new CourseContentService();
