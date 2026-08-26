import { Router } from 'express';
import { LessonController } from './lesson.controller';
import { verifyFirebaseToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const controller = new LessonController();

// Public / Student endpoint: get single lesson content
router.get('/:id', controller.getLessonById);

// Admin-only endpoints
router.post('/', verifyFirebaseToken, requireRole('admin'), controller.saveLesson);
router.put('/:id', verifyFirebaseToken, requireRole('admin'), controller.saveLesson);
router.delete('/:id', verifyFirebaseToken, requireRole('admin'), controller.deleteLesson);

export default router;
