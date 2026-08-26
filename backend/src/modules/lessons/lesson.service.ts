import { courseContentService } from '../../services/course/courseContent.service';
import { CourseLessonDoc } from '../../types/courseContent.types';

export class LessonService {
  /**
   * Retrieves lesson by ID from Firestore with in-memory caching.
   */
  async getLessonById(lessonId: string, courseId?: string, moduleId?: string): Promise<CourseLessonDoc | null> {
    return courseContentService.getLessonById(lessonId, courseId, moduleId);
  }

  /**
   * Creates or updates a lesson document.
   */
  async saveLesson(courseId: string, moduleId: string, lessonDoc: CourseLessonDoc): Promise<void> {
    return courseContentService.saveLesson(courseId, moduleId, lessonDoc);
  }

  /**
   * Deletes a lesson document.
   */
  async deleteLesson(lessonId: string, courseId?: string, moduleId?: string): Promise<boolean> {
    return courseContentService.deleteLesson(lessonId, courseId, moduleId);
  }
}
