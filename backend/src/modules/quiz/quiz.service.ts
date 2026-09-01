import { QuizRepository, QuizDocument, QuizAttemptDocument, QuizQuestionData } from './quiz.repository';
import logger from '../../config/logger';

export class QuizService {
  private quizRepository: QuizRepository;

  constructor() {
    this.quizRepository = new QuizRepository();
  }

  /**
   * Sanitizes a quiz before sending to a student (strips correct answers & explanations)
   */
  sanitizeQuizForStudent(quiz: QuizDocument): Omit<QuizDocument, 'questions'> & { questions: any[] } {
    return {
      ...quiz,
      questions: (quiz.questions || []).map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options || [],
        difficulty: q.difficulty || 'Medium',
        points: q.points || 1,
        order: q.order || 0,
      })),
    };
  }

  /**
   * Get Quiz by ID
   */
  async getQuizById(quizId: string, isAdmin: boolean = false): Promise<QuizDocument | null> {
    const quiz = await this.quizRepository.findQuizById(quizId);
    if (!quiz) return null;
    if (isAdmin) return quiz;
    return this.sanitizeQuizForStudent(quiz) as any;
  }

  /**
   * Get Quizzes by Course ID
   */
  async getQuizzesByCourse(courseId: string, isAdmin: boolean = false): Promise<QuizDocument[]> {
    const list = await this.quizRepository.findQuizzesByCourse(courseId);
    if (isAdmin) return list;
    return list.filter(q => q.isPublished).map(q => this.sanitizeQuizForStudent(q) as any);
  }

  /**
   * Get Quiz for a Lesson / Unit
   */
  async getQuizByLesson(lessonId: string, isAdmin: boolean = false): Promise<QuizDocument | null> {
    const quiz = await this.quizRepository.findQuizByLesson(lessonId);
    if (!quiz) return null;
    if (isAdmin) return quiz;
    return this.sanitizeQuizForStudent(quiz) as any;
  }

  /**
   * Create or update Quiz (Admin)
   */
  async saveQuiz(payload: Partial<QuizDocument> & { title: string; courseId: string }): Promise<QuizDocument> {
    const id = payload.id || `quiz_${payload.courseId}_${Date.now()}`;
    const now = new Date().toISOString();

    // Validate questions
    const formattedQuestions: QuizQuestionData[] = (payload.questions || []).map((q, idx) => {
      if (!q.question || !q.question.trim()) {
        throw new Error(`Question #${idx + 1} cannot be empty.`);
      }
      if ((q.type === 'mcq' || q.type === 'ms') && (!q.options || q.options.length < 2)) {
        throw new Error(`Question "${q.question.substring(0, 30)}..." must have at least 2 options.`);
      }
      if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer === '') {
        throw new Error(`Question "${q.question.substring(0, 30)}..." must specify a correct answer.`);
      }

      return {
        id: q.id || `q_${Date.now()}_${idx}`,
        type: q.type || 'mcq',
        question: q.question.trim(),
        options: q.options ? q.options.map(o => o.trim()).filter(Boolean) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'Medium',
        points: Number(q.points) > 0 ? Number(q.points) : 1,
        order: q.order !== undefined ? q.order : idx + 1,
      };
    });

    const quizDoc: QuizDocument = {
      id,
      courseId: String(payload.courseId),
      courseTitle: payload.courseTitle || '',
      moduleId: payload.moduleId || undefined,
      topicId: payload.topicId || undefined,
      lessonId: payload.lessonId || undefined,
      title: payload.title.trim(),
      description: payload.description || '',
      instructions: payload.instructions || '',
      timeLimit: Number(payload.timeLimit) >= 0 ? Number(payload.timeLimit) : 15,
      passingScore: Number(payload.passingScore) > 0 ? Number(payload.passingScore) : 70,
      maxAttempts: Number(payload.maxAttempts) >= 0 ? Number(payload.maxAttempts) : 3,
      isPublished: payload.isPublished !== undefined ? Boolean(payload.isPublished) : true,
      questions: formattedQuestions,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };

    return await this.quizRepository.saveQuiz(quizDoc);
  }

  /**
   * Delete Quiz (Admin)
   */
  async deleteQuiz(quizId: string): Promise<boolean> {
    return await this.quizRepository.deleteQuiz(quizId);
  }

  /**
   * Start a Quiz Attempt (Student)
   */
  async startAttempt(quizId: string, student: { uid: string; name?: string; email?: string }): Promise<{ attemptId: string; expiresAt: string; timeLimitSec: number; quiz: any }> {
    const rawQuiz = await this.quizRepository.findQuizById(quizId);
    if (!rawQuiz) {
      throw new Error('Quiz not found or has been removed.');
    }
    if (!rawQuiz.isPublished) {
      throw new Error('This assessment is currently in draft mode and not available.');
    }

    // Check attempt limits
    if (rawQuiz.maxAttempts > 0) {
      const existingAttempts = await this.quizRepository.findStudentAttempts(quizId, student.uid);
      const completedAttempts = existingAttempts.filter(a => a.status === 'submitted' || a.status === 'timed-out');
      if (completedAttempts.length >= rawQuiz.maxAttempts) {
        throw new Error(`Maximum attempts reached (${rawQuiz.maxAttempts}/${rawQuiz.maxAttempts}).`);
      }
    }

    const now = new Date();
    const timeLimitMinutes = rawQuiz.timeLimit || 0;
    const timeLimitSec = timeLimitMinutes * 60;
    const expiresAt = timeLimitSec > 0 ? new Date(now.getTime() + (timeLimitSec + 30) * 1000).toISOString() : new Date(now.getTime() + 86400 * 1000).toISOString();

    const attemptId = `att_${Date.now()}_${student.uid.substring(0, 6)}`;
    const attemptDoc: QuizAttemptDocument = {
      id: attemptId,
      quizId,
      quizTitle: rawQuiz.title,
      courseId: rawQuiz.courseId,
      lessonId: rawQuiz.lessonId,
      studentId: student.uid,
      studentName: student.name || 'Student',
      studentEmail: student.email || '',
      startedAt: now.toISOString(),
      timeLimitSec,
      expiresAt,
      status: 'in-progress',
      answers: {},
      totalQuestions: rawQuiz.questions.length,
      correctAnswersCount: 0,
      wrongAnswersCount: 0,
      unansweredCount: rawQuiz.questions.length,
      score: 0,
      totalPoints: rawQuiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
      percentage: 0,
      passed: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await this.quizRepository.saveAttempt(attemptDoc);

    return {
      attemptId,
      expiresAt,
      timeLimitSec,
      quiz: this.sanitizeQuizForStudent(rawQuiz),
    };
  }

  /**
   * Submit and Grade Quiz Attempt (Server-Side Evaluation)
   */
  async submitAttempt(
    attemptId: string,
    studentId: string,
    answers: Record<string, string | string[]>
  ): Promise<QuizAttemptDocument> {
    const attempt = await this.quizRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new Error('Attempt session not found.');
    }
    if (attempt.studentId !== studentId) {
      throw new Error('Unauthorized attempt submission.');
    }
    if (attempt.status === 'submitted') {
      return attempt; // Idempotent return if already submitted
    }

    const rawQuiz = await this.quizRepository.findQuizById(attempt.quizId);
    if (!rawQuiz) {
      throw new Error('Associated quiz was not found.');
    }

    const now = new Date();
    // Verify server-side expiration (with 30-second network buffer)
    const isExpired = attempt.timeLimitSec > 0 && now.getTime() > new Date(attempt.expiresAt).getTime() + 30000;

    let totalPoints = 0;
    let earnedScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const questionResults = (rawQuiz.questions || []).map((q) => {
      const qPoints = q.points || 1;
      totalPoints += qPoints;

      const studentAns = answers[q.id];
      let isCorrect = false;

      if (studentAns === undefined || studentAns === null || studentAns === '') {
        unansweredCount++;
      } else {
        if (q.type === 'mcq' || q.type === 'tf') {
          isCorrect = String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        } else if (q.type === 'ms') {
          const studentArr = Array.isArray(studentAns) ? studentAns.map(s => String(s).trim().toLowerCase()).sort() : [String(studentAns).trim().toLowerCase()];
          const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer.map(s => String(s).trim().toLowerCase()).sort() : [String(q.correctAnswer).trim().toLowerCase()];
          isCorrect = studentArr.length === correctArr.length && studentArr.every((val, i) => val === correctArr[i]);
        } else if (q.type === 'short') {
          isCorrect = String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        }

        if (isCorrect) {
          correctCount++;
          earnedScore += qPoints;
        } else {
          wrongCount++;
        }
      }

      return {
        questionId: q.id,
        question: q.question,
        studentAnswer: studentAns || '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        pointsAwarded: isCorrect ? qPoints : 0,
        explanation: q.explanation || '',
      };
    });

    const percentage = totalPoints > 0 ? Math.round((earnedScore / totalPoints) * 100) : 0;
    const passed = percentage >= (rawQuiz.passingScore || 70);

    const evaluatedAttempt: QuizAttemptDocument = {
      ...attempt,
      answers,
      submittedAt: now.toISOString(),
      status: isExpired ? 'timed-out' : 'submitted',
      totalQuestions: rawQuiz.questions.length,
      correctAnswersCount: correctCount,
      wrongAnswersCount: wrongCount,
      unansweredCount,
      score: earnedScore,
      totalPoints,
      percentage,
      passed,
      questionResults,
      updatedAt: now.toISOString(),
    };

    await this.quizRepository.saveAttempt(evaluatedAttempt);
    return evaluatedAttempt;
  }

  /**
   * Get student's attempt history
   */
  async getStudentAttempts(quizId: string, studentId: string): Promise<QuizAttemptDocument[]> {
    return await this.quizRepository.findStudentAttempts(quizId, studentId);
  }

  /**
   * Get Quiz Analytics (Admin)
   */
  async getQuizAnalytics(quizId: string): Promise<{
    totalAttempts: number;
    passCount: number;
    failCount: number;
    passRate: number;
    averageScore: number;
    questionPerformance: Array<{ questionId: string; question: string; correctPercentage: number }>;
  }> {
    const quiz = await this.quizRepository.findQuizById(quizId);
    if (!quiz) throw new Error('Quiz not found.');

    const attempts = await this.quizRepository.findAllQuizAttempts(quizId);
    const completedAttempts = attempts.filter(a => a.status === 'submitted' || a.status === 'timed-out');

    if (completedAttempts.length === 0) {
      return {
        totalAttempts: 0,
        passCount: 0,
        failCount: 0,
        passRate: 0,
        averageScore: 0,
        questionPerformance: (quiz.questions || []).map(q => ({
          questionId: q.id,
          question: q.question,
          correctPercentage: 0,
        })),
      };
    }

    const passCount = completedAttempts.filter(a => a.passed).length;
    const failCount = completedAttempts.length - passCount;
    const passRate = Math.round((passCount / completedAttempts.length) * 100);
    const averageScore = Math.round(
      completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAttempts.length
    );

    const questionPerformance = (quiz.questions || []).map(q => {
      let qCorrect = 0;
      let qTotal = 0;
      completedAttempts.forEach(att => {
        const res = (att.questionResults || []).find(r => r.questionId === q.id);
        if (res) {
          qTotal++;
          if (res.isCorrect) qCorrect++;
        }
      });
      return {
        questionId: q.id,
        question: q.question,
        correctPercentage: qTotal > 0 ? Math.round((qCorrect / qTotal) * 100) : 0,
      };
    });

    return {
      totalAttempts: completedAttempts.length,
      passCount,
      failCount,
      passRate,
      averageScore,
      questionPerformance,
    };
  }
}
