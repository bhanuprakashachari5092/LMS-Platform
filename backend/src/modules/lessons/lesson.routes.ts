import { Router } from 'express';
import { LessonController } from './lesson.controller';
import { verifyFirebaseToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const controller = new LessonController();

// Public / Student endpoint: get single lesson content and content blocks
router.get('/:id', controller.getLessonById);
router.get('/:id/blocks', controller.getLessonBlocks);

// Admin-only endpoints
router.post('/batch-reorder', verifyFirebaseToken, requireRole('admin'), controller.batchReorder);
router.delete('/modules/:id', verifyFirebaseToken, requireRole('admin'), controller.deleteModule);
router.post('/', verifyFirebaseToken, requireRole('admin'), controller.saveLesson);
router.put('/:id', verifyFirebaseToken, requireRole('admin'), controller.saveLesson);
router.put('/:id/blocks', verifyFirebaseToken, requireRole('admin'), controller.saveLessonBlocks);
router.delete('/:id', verifyFirebaseToken, requireRole('admin'), controller.deleteLesson);

export default router;
