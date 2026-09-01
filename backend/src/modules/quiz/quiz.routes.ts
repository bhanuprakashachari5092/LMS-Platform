import { Router } from 'express';
import { QuizController } from './quiz.controller';
import { verifyFirebaseToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const controller = new QuizController();

// Public / Student Routes
router.get('/:id', controller.getQuiz);
router.get('/course/:courseId', controller.getQuizzesByCourse);
router.get('/lesson/:lessonId', controller.getQuizByLesson);

// Authenticated Student Attempt Routes
router.post('/:id/start', verifyFirebaseToken as any, controller.startAttempt);
router.post('/:id/submit', verifyFirebaseToken as any, controller.submitAttempt);
router.get('/:id/attempts', verifyFirebaseToken as any, controller.getAttemptHistory);

// Admin & Instructor Management Routes
router.post('/', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, controller.saveQuiz);
router.put('/:id', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, controller.saveQuiz);
router.delete('/:id', verifyFirebaseToken as any, requireRole('admin') as any, controller.deleteQuiz);
router.get('/:id/analytics', verifyFirebaseToken as any, requireRole(['admin', 'instructor']) as any, controller.getQuizAnalytics);

export default router;
