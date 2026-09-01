import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { formatResponse } from '../../utils/responseFormatter';
import { QuizService } from './quiz.service';

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  /**
   * GET /api/quizzes/:id
   */
  getQuiz = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'instructor';
    const quiz = await this.quizService.getQuizById(id, isAdmin);
    if (!quiz) {
      res.status(404).json(formatResponse(false, null, 'Quiz not found.'));
      return;
    }
    res.json(formatResponse(true, quiz, 'Quiz retrieved successfully.'));
  });

  /**
   * GET /api/quizzes/course/:courseId
   */
  getQuizzesByCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = String(req.params.courseId);
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'instructor';
    const list = await this.quizService.getQuizzesByCourse(courseId, isAdmin);
    res.json(formatResponse(true, list, `Found ${list.length} quizzes.`));
  });

  /**
   * GET /api/quizzes/lesson/:lessonId
   */
  getQuizByLesson = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lessonId = String(req.params.lessonId);
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'instructor';
    const quiz = await this.quizService.getQuizByLesson(lessonId, isAdmin);
    if (!quiz) {
      res.status(404).json(formatResponse(false, null, 'No quiz attached to this lesson.'));
      return;
    }
    res.json(formatResponse(true, quiz, 'Lesson quiz retrieved.'));
  });

  /**
   * POST /api/quizzes (Admin/Instructor)
   */
  saveQuiz = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body;
    if (!body.title || !body.courseId) {
      res.status(400).json(formatResponse(false, null, 'Title and Course ID are required.'));
      return;
    }
    const saved = await this.quizService.saveQuiz(body);
    res.status(201).json(formatResponse(true, saved, 'Quiz saved successfully.'));
  });

  /**
   * DELETE /api/quizzes/:id (Admin only)
   */
  deleteQuiz = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const deleted = await this.quizService.deleteQuiz(id);
    if (!deleted) {
      res.status(400).json(formatResponse(false, null, 'Failed to delete quiz.'));
      return;
    }
    res.json(formatResponse(true, { id }, 'Quiz deleted.'));
  });

  /**
   * POST /api/quizzes/:id/start (Student)
   */
  startAttempt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const student = {
      uid: req.user?.uid || 'anonymous_user',
      name: req.user?.name || 'Student',
      email: req.user?.email || '',
    };

    const session = await this.quizService.startAttempt(id, student);
    res.json(formatResponse(true, session, 'Quiz attempt session started.'));
  });

  /**
   * POST /api/quizzes/:id/submit (Student)
   */
  submitAttempt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { attemptId, answers } = req.body;

    if (!attemptId || !answers) {
      res.status(400).json(formatResponse(false, null, 'Attempt ID and answers payload are required.'));
      return;
    }

    const studentId = req.user?.uid || 'anonymous_user';
    const result = await this.quizService.submitAttempt(attemptId, studentId, answers);
    res.json(formatResponse(true, result, 'Quiz evaluated successfully.'));
  });

  /**
   * GET /api/quizzes/:id/attempts (Student)
   */
  getAttemptHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const studentId = req.user?.uid || 'anonymous_user';
    const history = await this.quizService.getStudentAttempts(id, studentId);
    res.json(formatResponse(true, history, `Found ${history.length} attempts.`));
  });

  /**
   * GET /api/quizzes/:id/analytics (Admin)
   */
  getQuizAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const analytics = await this.quizService.getQuizAnalytics(id);
    res.json(formatResponse(true, analytics, 'Quiz analytics generated.'));
  });
}
