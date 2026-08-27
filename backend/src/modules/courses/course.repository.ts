import { db } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../types/course';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CourseRepository {
  private collectionName = 'courses';
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes bounded TTL
  private readonly MAX_CACHE_ENTRIES = 100; // Safe bounded memory limit (<1MB RAM)

  private catalogCache = new Map<string, CacheEntry<CoursePaginationResult>>();
  private courseCache = new Map<string, CacheEntry<ICourse | null>>();

  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      return null;
    }
    return db.collection(this.collectionName);
  }

  /**
   * Helper to retrieve from bounded cache
   */
  private getFromCache<T>(cacheMap: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cacheMap.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cacheMap.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Helper to save to bounded cache with LRU eviction guard
   */
  private setInCache<T>(cacheMap: Map<string, CacheEntry<T>>, key: string, data: T): void {
    if (cacheMap.size >= this.MAX_CACHE_ENTRIES) {
      const firstKey = cacheMap.keys().next().value;
      if (firstKey) cacheMap.delete(firstKey);
    }
    cacheMap.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }

  /**
   * Invalidates course catalog and individual course caches on mutation
   */
  public invalidateCache(): void {
    this.catalogCache.clear();
    this.courseCache.clear();
  }

  /**
   * Sanitizes course document for lightweight catalog transport (removes heavy embedded modules)
   */
  private sanitizeForCatalog(raw: any): ICourse {
    const { modules, ...lightweight } = raw;
    return lightweight as ICourse;
  }

  async create(data: CreateCourseDTO): Promise<ICourse> {
    const docRef = this.collection ? this.collection.doc() : null;
    const now = new Date().toISOString();
    const id = docRef ? docRef.id : data.id || `course_${Date.now()}`;

    const newCourse: ICourse = {
      ...data,
      id,
      slug: data.slug || this.generateSlug(data.title),
      enrollmentCount: 0,
      rating: 5.0,
      ratingCount: 0,
      banner: data.banner || '',
      syllabus: data.syllabus || [],
      tags: data.tags || [],
      skills: data.skills || [],
      prerequisites: data.prerequisites || [],
      learningOutcomes: data.learningOutcomes || [],
      createdAt: now,
      updatedAt: now,
    };

    if (docRef) {
      await docRef.set(newCourse);
    }

    this.invalidateCache();
    return newCourse;
  }

  async findById(id: string): Promise<ICourse | null> {
    const cacheKey = `id:${id}`;
    const cached = this.getFromCache(this.courseCache, cacheKey);
    if (cached !== null) return cached;

    if (!this.collection) return null;
    const docSnap = await this.collection.doc(id).get();
    if (!docSnap.exists) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = { ...docSnap.data(), id: docSnap.id } as ICourse;
    this.setInCache(this.courseCache, cacheKey, course);
    return course;
  }

  async findBySlug(slug: string): Promise<ICourse | null> {
    const cacheKey = `slug:${slug.toLowerCase()}`;
    const cached = this.getFromCache(this.courseCache, cacheKey);
    if (cached !== null) return cached;

    if (!this.collection) return null;
    const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as ICourse;
    this.setInCache(this.courseCache, cacheKey, course);
    return course;
  }

  async update(id: string, updates: UpdateCourseDTO): Promise<ICourse | null> {
    if (!this.collection) return null;
    const docRef = this.collection.doc(id);
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatedData: Partial<ICourse> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title && !updates.slug) {
      updatedData.slug = this.generateSlug(updates.title);
    }

    await docRef.update(updatedData);
    this.invalidateCache();
    return { ...existing, ...updatedData } as ICourse;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.collection) return false;
    await this.collection.doc(id).delete();
    this.invalidateCache();
    return true;
  }

  async findAll(options: CourseFilterOptions = {}): Promise<CoursePaginationResult> {
    const cacheKey = `catalog:${JSON.stringify(options)}`;
    const cached = this.getFromCache(this.catalogCache, cacheKey);
    if (cached) return cached;

    if (!this.collection) {
      return { courses: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    const snapshot = await this.collection.get();
    let courses: ICourse[] = snapshot.docs.map((doc: QueryDocumentSnapshot) =>
      this.sanitizeForCatalog({
        ...doc.data(),
        id: doc.id,
      })
    );

    // 1. Filter by status (case-insensitive)
    if (options.status && options.status !== 'all') {
      const selectedStatus = options.status.toLowerCase();
      courses = courses.filter((c) => {
        if (!c.status) return false;
        const s = c.status.toLowerCase();
        return s === selectedStatus || 
               (selectedStatus === 'published' && s === 'published') ||
               (selectedStatus === 'draft' && s === 'draft');
      });
    }

    // 2. Filter by category (case-insensitive, substring/smart matching)
    if (options.category && options.category !== 'All') {
      const selectedCat = options.category.toLowerCase();
      courses = courses.filter((c) => {
        if (!c.category) return false;
        const courseCat = c.category.toLowerCase();
        return courseCat === selectedCat ||
               (selectedCat.includes('development') && courseCat.includes('development')) ||
               (selectedCat.includes('linux') && courseCat.includes('linux')) ||
               (selectedCat.includes('sys') && courseCat.includes('sys'));
      });
    }

    // 3. Filter by level (case-insensitive, smart matching)
    if (options.level && options.level !== 'all') {
      const selectedLevel = options.level.toLowerCase();
      courses = courses.filter((c) => {
        if (!c.level) return false;
        const l = c.level.toLowerCase();
        if (selectedLevel === 'all_levels' || l === 'all_levels') return true;
        if (selectedLevel.includes('begin') && l.includes('begin')) return true;
        if (selectedLevel.includes('inter') && l.includes('inter')) return true;
        if (selectedLevel.includes('adv') && l.includes('adv')) return true;
        return l === selectedLevel;
      });
    }

    // 4. Filter by featured
    if (options.featured) {
      courses = courses.filter((c) => c.featured === true);
    }

    // 5. In-memory filter for search terms (keyword in title, description, skills, category)
    if (options.search) {
      const term = options.search.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          (c.shortDescription && c.shortDescription.toLowerCase().includes(term)) ||
          (c.description && c.description.toLowerCase().includes(term)) ||
          c.category.toLowerCase().includes(term) ||
          (c.skills && c.skills.some((s) => s.toLowerCase().includes(term)))
      );
    }

    // In-memory sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    courses.sort((a, b) => {
      let valA = (a as any)[sortBy] ?? '';
      let valB = (b as any)[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = options.page || 1;
    const limit = options.limit || 10;
    const total = courses.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedCourses = courses.slice((page - 1) * limit, page * limit);

    const result: CoursePaginationResult = {
      courses: paginatedCourses,
      total,
      page,
      limit,
      totalPages,
    };

    this.setInCache(this.catalogCache, cacheKey, result);
    return result;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
