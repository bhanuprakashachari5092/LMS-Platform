/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIRESTORE COURSE SERVICE — KaizenQ LMS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dedicated data-fetching layer for the standardized "courses" Firestore collection.
 * - Reads only published courses (`isPublished == true`)
 * - Sorts by `order` ascending
 * - 5-minute in-memory caching to minimize Firestore read operations
 * - Safe fallback & error resilience (never crashes UI)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import type { FirestoreCourse, FirestoreCourseDoc } from '../../../shared/types/firestoreCourse';

class FirestoreCourseService {
  private cache: { data: FirestoreCourseDoc[]; expiry: number } | null = null;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetches all published courses from Firestore, ordered by `order` ascending.
   * Returns cached data if available and fresh.
   */
  async getPublishedCourses(forceRefresh = false): Promise<FirestoreCourseDoc[]> {
    const now = Date.now();

    if (!forceRefresh && this.cache && this.cache.expiry > now) {
      return this.cache.data;
    }

    if (!db) {
      console.warn('[FirestoreCourseService] Firestore instance (db) is not initialized.');
      return [];
    }

    try {
      const coursesRef = collection(db, 'courses');
      let docsData: FirestoreCourseDoc[] = [];

      try {
        // Preferred: query with where + orderBy
        const q = query(
          coursesRef,
          where('isPublished', '==', true),
          orderBy('order', 'asc')
        );
        const snapshot = await getDocs(q);
        docsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as FirestoreCourse),
        }));
      } catch (queryErr: any) {
        // Fallback in case composite index (isPublished + order) is pending in Firestore
        console.warn(
          '[FirestoreCourseService] Ordered query failed (index may be required), falling back to client sort:',
          queryErr?.message || queryErr
        );
        const fallbackQ = query(coursesRef, where('isPublished', '==', true));
        const snapshot = await getDocs(fallbackQ);
        docsData = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as FirestoreCourse),
          }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }

      this.cache = {
        data: docsData,
        expiry: now + this.CACHE_TTL_MS,
      };

      return docsData;
    } catch (err) {
      console.error('[FirestoreCourseService] Error fetching courses from Firestore:', err);
      // Return empty array and don't crash
      return [];
    }
  }

  /**
   * Clears the in-memory cache manually.
   */
  clearCache(): void {
    this.cache = null;
  }
}

export const firestoreCourseService = new FirestoreCourseService();
export default firestoreCourseService;
