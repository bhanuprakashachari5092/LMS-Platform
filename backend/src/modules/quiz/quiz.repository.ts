import { db } from '../../firebase';
import logger from '../../config/logger';

export interface QuizQuestionData {
  id: string;
  type: 'mcq' | 'ms' | 'tf' | 'short';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  points?: number;
  order?: number;
}

export interface QuizDocument {
  id: string;
  courseId: string;
  courseTitle?: string;
  moduleId?: string;
  topicId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number; // In minutes (0 = unlimited)
  passingScore: number; // Percentage (e.g. 70)
  maxAttempts: number; // 0 = unlimited
  isPublished: boolean;
  questions: QuizQuestionData[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptDocument {
  id: string;
  quizId: string;
  quizTitle: string;
  courseId: string;
  lessonId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  startedAt: string;
  submittedAt?: string;
  timeLimitSec: number;
  expiresAt: string;
  status: 'in-progress' | 'submitted' | 'timed-out' | 'expired';
  answers: Record<string, string | string[]>;
  totalQuestions: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  unansweredCount: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  questionResults?: Array<{
    questionId: string;
    question: string;
    studentAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    pointsAwarded: number;
    explanation: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export class QuizRepository {
  private quizzesCollection = 'quizzes';
  private attemptsCollection = 'quiz_attempts';

  /**
   * Find a quiz by ID
   */
  async findQuizById(quizId: string): Promise<QuizDocument | null> {
    if (!db) return null;
    try {
      const snap = await db.collection(this.quizzesCollection).doc(quizId).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() } as QuizDocument;
    } catch (err: any) {
      logger.error(`[QuizRepository] findQuizById error for ${quizId}:`, err);
      return null;
    }
  }

  /**
   * Find quizzes belonging to a course
   */
  async findQuizzesByCourse(courseId: string): Promise<QuizDocument[]> {
    if (!db) return [];
    try {
      const snap = await db.collection(this.quizzesCollection).where('courseId', '==', String(courseId)).get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizDocument));
    } catch (err: any) {
      logger.error(`[QuizRepository] findQuizzesByCourse error for ${courseId}:`, err);
      return [];
    }
  }

  /**
   * Find quiz attached to a specific lesson or topic
   */
  async findQuizByLesson(lessonId: string): Promise<QuizDocument | null> {
    if (!db) return null;
    try {
      const snap = await db.collection(this.quizzesCollection).where('lessonId', '==', String(lessonId)).limit(1).get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() } as QuizDocument;
    } catch (err: any) {
      logger.error(`[QuizRepository] findQuizByLesson error for ${lessonId}:`, err);
      return null;
    }
  }

  /**
   * Create or update a quiz document
   */
  async saveQuiz(quiz: QuizDocument): Promise<QuizDocument> {
    if (!db) return quiz;
    try {
      await db.collection(this.quizzesCollection).doc(quiz.id).set(quiz, { merge: true });
      return quiz;
    } catch (err: any) {
      logger.error(`[QuizRepository] saveQuiz error for ${quiz.id}:`, err);
      throw err;
    }
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: string): Promise<boolean> {
    if (!db) return false;
    try {
      await db.collection(this.quizzesCollection).doc(quizId).delete();
      return true;
    } catch (err: any) {
      logger.error(`[QuizRepository] deleteQuiz error for ${quizId}:`, err);
      return false;
    }
  }

  /**
   * Create a quiz attempt record
   */
  async saveAttempt(attempt: QuizAttemptDocument): Promise<QuizAttemptDocument> {
    if (!db) return attempt;
    try {
      await db.collection(this.attemptsCollection).doc(attempt.id).set(attempt, { merge: true });
      return attempt;
    } catch (err: any) {
      logger.error(`[QuizRepository] saveAttempt error for ${attempt.id}:`, err);
      throw err;
    }
  }

  /**
   * Find an attempt by ID
   */
  async findAttemptById(attemptId: string): Promise<QuizAttemptDocument | null> {
    if (!db) return null;
    try {
      const snap = await db.collection(this.attemptsCollection).doc(attemptId).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() } as QuizAttemptDocument;
    } catch (err: any) {
      logger.error(`[QuizRepository] findAttemptById error for ${attemptId}:`, err);
      return null;
    }
  }

  /**
   * Find student's attempts for a quiz
   */
  async findStudentAttempts(quizId: string, studentId: string): Promise<QuizAttemptDocument[]> {
    if (!db) return [];
    try {
      const snap = await db.collection(this.attemptsCollection)
        .where('quizId', '==', quizId)
        .where('studentId', '==', studentId)
        .get();

      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttemptDocument));
      // Sort in-memory to prevent requiring composite indexes in Firestore
      return list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    } catch (err: any) {
      logger.error(`[QuizRepository] findStudentAttempts error:`, err);
      return [];
    }
  }

  /**
   * Find all attempts for a quiz (Admin analytics)
   */
  async findAllQuizAttempts(quizId: string): Promise<QuizAttemptDocument[]> {
    if (!db) return [];
    try {
      const snap = await db.collection(this.attemptsCollection).where('quizId', '==', quizId).get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttemptDocument));
    } catch (err: any) {
      logger.error(`[QuizRepository] findAllQuizAttempts error:`, err);
      return [];
    }
  }
}
