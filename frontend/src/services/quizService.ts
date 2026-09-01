import { auth } from '@/firebase';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'ms' | 'tf' | 'short';
  question: string;
  options?: string[];
  correctAnswer?: string | string[]; // Provided only for admin or after attempt evaluation
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  points?: number;
  order?: number;
}

export interface Quiz {
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
  questions: QuizQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  studentAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  pointsAwarded: number;
  explanation: string;
}

export interface QuizAttempt {
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
  questionResults?: QuestionResult[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAnalytics {
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
  averageScore: number;
  questionPerformance: Array<{
    questionId: string;
    question: string;
    correctPercentage: number;
  }>;
}

class QuizService {
  private apiBase = import.meta.env.VITE_API_URL || '/api';

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const localToken = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`;
        }
      }
    } catch {
      /* ignore */
    }
    return headers;
  }

  /**
   * Get Quiz by ID
   */
  async getQuiz(quizId: string): Promise<Quiz | null> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/${quizId}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  }

  /**
   * Get Quizzes for a Course
   */
  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/course/${courseId}`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  }

  /**
   * Get Quiz for a specific Lesson / Unit
   */
  async getQuizByLesson(lessonId: string): Promise<Quiz | null> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/lesson/${lessonId}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  }

  /**
   * Create or update a Quiz (Admin)
   */
  async saveQuiz(quiz: Partial<Quiz> & { title: string; courseId: string }): Promise<Quiz> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(quiz),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save quiz.');
    }
    return data.data;
  }

  /**
   * Delete a Quiz (Admin)
   */
  async deleteQuiz(quizId: string): Promise<boolean> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/${quizId}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  }

  /**
   * Start a Quiz Attempt
   */
  async startAttempt(quizId: string): Promise<{ attemptId: string; expiresAt: string; timeLimitSec: number; quiz: Quiz }> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/${quizId}/start`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to start quiz attempt.');
    }
    return data.data;
  }

  /**
   * Submit a Quiz Attempt (Server-Side Evaluation)
   */
  async submitAttempt(quizId: string, attemptId: string, answers: Record<string, string | string[]>): Promise<QuizAttempt> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ attemptId, answers }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to submit quiz.');
    }
    return data.data;
  }

  /**
   * Get Student's previous attempts for a Quiz
   */
  async getAttemptHistory(quizId: string): Promise<QuizAttempt[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/${quizId}/attempts`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  }

  /**
   * Get Quiz Analytics (Admin)
   */
  async getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.apiBase}/quizzes/${quizId}/analytics`, { headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch quiz analytics.');
    }
    return data.data;
  }
}

export const quizService = new QuizService();
