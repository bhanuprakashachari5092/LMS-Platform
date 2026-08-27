import { db, isFirebaseAdminInitialized } from './index';
import { CollectionReference } from 'firebase-admin/firestore';

/**
 * Safely retrieves a Firestore collection reference.
 */
export const getCollection = (collectionName: string): CollectionReference => {
  return db.collection(collectionName);
};

/**
 * Safely checks if the real Firestore database is initialized.
 */
export const isFirestoreInitialized = (): boolean => {
  return isFirebaseAdminInitialized();
};

/**
 * Canonical Collection Getters
 */
export const usersCollection = () => getCollection('users');
export const studentsCollection = () => getCollection('students');
export const instructorsCollection = () => getCollection('instructors');
export const adminsCollection = () => getCollection('admins');
export const coursesCollection = () => getCollection('courses');
export const modulesCollection = () => getCollection('modules');
export const lessonsCollection = () => getCollection('lessons');
export const enrollmentsCollection = () => getCollection('enrollments');
export const studentProgressCollection = () => getCollection('student_progress');
export const studentAnalysisCollection = () => getCollection('student_analysis');
export const quizzesCollection = () => getCollection('quizzes');
export const quizAttemptsCollection = () => getCollection('quiz_attempts');
export const assignmentsCollection = () => getCollection('assignments');
export const assignmentSubmissionsCollection = () => getCollection('assignment_submissions');
export const certificatesCollection = () => getCollection('certificates');
export const liveClassesCollection = () => getCollection('liveClasses');
export const notificationsCollection = () => getCollection('notifications');
export const emailLogsCollection = () => getCollection('email_logs');
export const resourcesCollection = () => getCollection('resources');
export const courseKnowledgeCollection = () => getCollection('course_knowledge');
export const questionBankCollection = () => getCollection('question_bank');
export const generatedQuizzesCollection = () => getCollection('generated_quizzes');
export const certificateJobsCollection = () => getCollection('certificateJobs');


