import { Router } from 'express';
import { AiController } from './ai.controller';

const router = Router();
const controller = new AiController();

router.post('/chat', controller.chat);
router.post('/quiz', controller.quiz);
router.post('/assignment', controller.assignment);
router.post('/summary', controller.summary);

// Topic-to-Content AI Autofill Routes
router.post('/autofill-course', controller.autofillCourse);
router.post('/autofill-lesson', controller.autofillLesson);

export default router;