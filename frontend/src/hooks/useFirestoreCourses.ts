/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USE FIRESTORE COURSES HOOK — KaizenQ LMS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * React hook for consuming standardized Firestore courses.
 * - Returns mapped `ICourse[]` for direct drop-in use in existing components
 * - Also provides `rawCourses` (`FirestoreCourseDoc[]`) for Firestore-specific views
 * - Handles loading and error states gracefully
 * - Utilizes client-side cached data to avoid redundant Firestore reads
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import type { ICourse } from '../../../shared/types/course';
import {
  firestoreCourseToICourse,
  type FirestoreCourseDoc,
} from '../../../shared/types/firestoreCourse';
import { firestoreCourseService } from '@/services/firestoreCourseService';

export interface UseFirestoreCoursesResult {
  courses: ICourse[];
  rawCourses: FirestoreCourseDoc[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFirestoreCourses(): UseFirestoreCoursesResult {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [rawCourses, setRawCourses] = useState<FirestoreCourseDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const raw = await firestoreCourseService.getPublishedCourses(force);
      const mapped = raw.map(firestoreCourseToICourse);
      setRawCourses(raw);
      setCourses(mapped);
    } catch (err: any) {
      console.error('[useFirestoreCourses] Hook fetch error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setCourses([]);
      setRawCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(false);
  }, [fetchCourses]);

  const refetch = useCallback(async () => {
    await fetchCourses(true);
  }, [fetchCourses]);

  return {
    courses,
    rawCourses,
    loading,
    error,
    refetch,
  };
}

export default useFirestoreCourses;
