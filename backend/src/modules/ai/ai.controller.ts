import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AiService } from './ai.service';
import { AiAutofillService, checkAiRateLimit } from './aiAutofill.service';
import { formatResponse } from '../../utils/responseFormatter';

export class AiController {
  private aiService = new AiService();
  private aiAutofillService = new AiAutofillService();

  chat = asyncHandler(async (req: Request, res: Response) => {
    res.json(formatResponse(true, {}, 'AI Chat template'));
  });

  quiz = asyncHandler(async (req: Request, res: Response) => {
    res.json(formatResponse(true, {}, 'AI Quiz template'));
  });

  assignment = asyncHandler(async (req: Request, res: Response) => {
    res.json(formatResponse(true, {}, 'AI Assignment template'));
  });

  summary = asyncHandler(async (req: Request, res: Response) => {
    res.json(formatResponse(true, {}, 'AI Summary template'));
  });

  /**
   * Generates course metadata from title
   * POST /api/ai/autofill-course
   */
  autofillCourse = asyncHandler(async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkAiRateLimit(clientIp, 15)) {
      return res.status(429).json(formatResponse(false, null, 'Rate limit exceeded for AI generation. Please wait a minute.'));
    }

    const { title, category, level } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json(formatResponse(false, null, 'Please provide a valid course title with at least 3 characters.'));
    }

    const result = await this.aiAutofillService.autofillCourse({
      title: title.trim(),
      category: category ? String(category).trim() : undefined,
      level: level ? String(level).trim() : undefined
    });

    res.json(formatResponse(true, result, 'Course metadata generated successfully.'));
  });

  /**
   * Generates complete lesson markdown notes from title and course context
   * POST /api/ai/autofill-lesson
   */
  autofillLesson = asyncHandler(async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkAiRateLimit(clientIp, 15)) {
      return res.status(429).json(formatResponse(false, null, 'Rate limit exceeded for AI generation. Please wait a minute.'));
    }

    const { lessonTitle, courseTitle, category, level } = req.body;
    if (!lessonTitle || typeof lessonTitle !== 'string' || lessonTitle.trim().length < 3) {
      return res.status(400).json(formatResponse(false, null, 'Please provide a valid lesson title with at least 3 characters.'));
    }

    const result = await this.aiAutofillService.autofillLesson({
      lessonTitle: lessonTitle.trim(),
      courseTitle: courseTitle ? String(courseTitle).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      level: level ? String(level).trim() : undefined
    });

    res.json(formatResponse(true, result, 'Lesson content generated successfully.'));
  });
}