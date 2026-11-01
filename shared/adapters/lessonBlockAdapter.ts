/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LESSON BLOCK ADAPTER — KaizenQ LMS (Phase 1 Data Foundation)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides bidirectional translation between legacy lesson document structures
 * and the modern discrete Content Block architecture.
 *
 * Guarantees:
 * - Legacy lessons can be rendered as blocks on-demand without mutating the DB.
 * - Blocks can be compiled back into legacy fields for 100% backward compatibility
 *   with the student player and legacy admin components.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type {
  ILessonItem,
  ILessonBlock,
  TextBlockData,
  CodeBlockData,
  CalloutBlockData,
  ListBlockData,
  LinkBlockData,
  QuizBlockData,
  VideoBlockData,
} from '../types/course';

/**
 * Converts a legacy lesson item into an array of discrete, typed content blocks.
 */
export function lessonToBlocks(lesson: Partial<ILessonItem> & { id?: string; readingContent?: string; conceptTheory?: string; videoUrl?: string }): ILessonBlock[] {
  const blocks: ILessonBlock[] = [];
  const lessonId = lesson.id || lesson.lessonId || 'unknown-lesson';
  const now = new Date().toISOString();
  let order = 0;

  // 1. Video Block (if present)
  if (lesson.videoUrl && String(lesson.videoUrl).trim().length > 0) {
    const vUrl = String(lesson.videoUrl).trim();
    let provider: VideoBlockData['provider'] = 'custom';
    if (vUrl.includes('youtube.com') || vUrl.includes('youtu.be')) provider = 'youtube';
    else if (vUrl.includes('vimeo.com')) provider = 'vimeo';
    else if (vUrl.includes('cloudinary.com')) provider = 'cloudinary';
    else if (vUrl.includes('firebasestorage.googleapis.com')) provider = 'firebase-storage';

    blocks.push({
      id: `${lessonId}-block-video`,
      lessonId,
      type: 'video',
      order: order++,
      data: {
        provider,
        url: vUrl,
        thumbnailUrl: lesson.topicImageUrl || undefined,
      } as VideoBlockData,
      isVisible: true,
      createdAt: lesson.createdAt || now,
      updatedAt: lesson.updatedAt || now,
    });
  }

  // 2. Learning Objectives (as list block)
  if (Array.isArray(lesson.learningObjectives) && lesson.learningObjectives.filter(Boolean).length > 0) {
    blocks.push({
      id: `${lessonId}-block-objectives`,
      lessonId,
      type: 'list',
      order: order++,
      data: {
        style: 'checklist',
        items: lesson.learningObjectives.filter(Boolean),
      } as ListBlockData,
      isVisible: true,
      createdAt: lesson.createdAt || now,
      updatedAt: lesson.updatedAt || now,
    });
  }

  // 3. Theory / Reading Markdown Content (as text block)
  const theory = (lesson.conceptTheory || lesson.readingContent || (lesson as any).content || '').trim();
  if (theory.length > 0) {
    blocks.push({
      id: `${lessonId}-block-theory`,
      lessonId,
      type: 'text',
      order: order++,
      data: {
        markdown: theory,
      } as TextBlockData,
      isVisible: true,
      createdAt: lesson.createdAt || now,
      updatedAt: lesson.updatedAt || now,
    });
  }

  // 4. Code Examples (as code blocks)
  if (Array.isArray((lesson as any).codeExamples) && (lesson as any).codeExamples.length > 0) {
    (lesson as any).codeExamples.forEach((c: any, idx: number) => {
      if (c && c.code && String(c.code).trim().length > 0) {
        blocks.push({
          id: c.id || `${lessonId}-block-code-${idx}`,
          lessonId,
          type: 'code',
          order: order++,
          data: {
            title: c.title || `Code Example ${idx + 1}`,
            language: c.language || 'python',
            code: c.code,
            explanation: c.explanation || '',
          } as CodeBlockData,
          isVisible: true,
          createdAt: lesson.createdAt || now,
          updatedAt: lesson.updatedAt || now,
        });
      }
    });
  }

  // 5. Key Points (as callout block)
  if (Array.isArray((lesson as any).keyPoints) && (lesson as any).keyPoints.filter(Boolean).length > 0) {
    blocks.push({
      id: `${lessonId}-block-keypoints`,
      lessonId,
      type: 'callout',
      order: order++,
      data: {
        tone: 'tip',
        title: 'Key Takeaways',
        message: (lesson as any).keyPoints.filter(Boolean).map((pt: string) => `• ${pt}`).join('\n'),
      } as CalloutBlockData,
      isVisible: true,
      createdAt: lesson.createdAt || now,
      updatedAt: lesson.updatedAt || now,
    });
  }

  // 6. Notes (as note callout block)
  if (lesson.notes && String(lesson.notes).trim().length > 0) {
    blocks.push({
      id: `${lessonId}-block-notes`,
      lessonId,
      type: 'callout',
      order: order++,
      data: {
        tone: 'note',
        title: 'Instructor Note',
        message: String(lesson.notes).trim(),
      } as CalloutBlockData,
      isVisible: true,
      createdAt: lesson.createdAt || now,
      updatedAt: lesson.updatedAt || now,
    });
  }

  // 7. Resource Links (as link blocks)
  if (Array.isArray((lesson as any).resourceLinks) && (lesson as any).resourceLinks.length > 0) {
    (lesson as any).resourceLinks.forEach((r: any, idx: number) => {
      if (r && r.url) {
        blocks.push({
          id: r.id || `${lessonId}-block-res-${idx}`,
          lessonId,
          type: 'link',
          order: order++,
          data: {
            title: r.title || 'Resource Link',
            url: r.url,
            description: r.description || '',
            isExternal: true,
          } as LinkBlockData,
          isVisible: true,
          createdAt: lesson.createdAt || now,
          updatedAt: lesson.updatedAt || now,
        });
      }
    });
  }

  // 8. Quiz Questions (as quiz block)
  if (Array.isArray((lesson as any).quizQuestions) && (lesson as any).quizQuestions.length > 0) {
    blocks.push({
      id: `${lessonId}-block-quiz`,
      lessonId,
      type: 'quiz',
      order: order++,
      data: {
        title: `${lesson.title || 'Lesson'} Evaluation Quiz`,
        questions: (lesson as any).quizQuestions.map((q: any, qIdx: number) => ({
          questionId: q.id || `q-${qIdx}`,
          questionNumber: qIdx + 1,
          question: q.questionText || q.question || '',
          type: 'mcq',
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswerIndex ?? q.correctAnswer ?? 0,
          explanation: q.explanation || '',
          points: q.marks || q.points || 5,
        })),
      } as QuizBlockData,
      isVisible: true,
      createdAt: lesson.createdAt || now,
      updatedAt: lesson.updatedAt || now,
    });
  }

  return blocks;
}

/**
 * Compiles modern content blocks back into legacy fields for full backwards compatibility.
 */
export function blocksToLegacyFields(blocks: ILessonBlock[]): {
  readingContent: string;
  conceptTheory: string;
  videoUrl?: string;
  learningObjectives?: string[];
  codeExamples?: any[];
  keyPoints?: string[];
  resourceLinks?: any[];
  quizQuestions?: any[];
  assignmentInstructions?: string;
  notes?: string;
} {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  let readingContent = '';
  let conceptTheory = '';
  let videoUrl: string | undefined = undefined;
  const learningObjectives: string[] = [];
  const codeExamples: any[] = [];
  const keyPoints: string[] = [];
  const resourceLinks: any[] = [];
  let quizQuestions: any[] | undefined = undefined;
  let assignmentInstructions: string | undefined = undefined;
  let notes: string | undefined = undefined;

  for (const block of sortedBlocks) {
    if (!block.isVisible) continue;

    switch (block.type) {
      case 'video': {
        const data = block.data as VideoBlockData;
        if (data?.url) videoUrl = data.url;
        break;
      }
      case 'text':
      case 'heading': {
        const textData = block.data as TextBlockData;
        const text = textData?.markdown || (block.data as any)?.text || '';
        if (text) {
          conceptTheory = conceptTheory ? `${conceptTheory}\n\n${text}` : text;
        }
        break;
      }
      case 'code': {
        const codeData = block.data as CodeBlockData;
        if (codeData?.code) {
          codeExamples.push({
            id: block.id,
            title: codeData.title || 'Code Example',
            language: codeData.language || 'python',
            code: codeData.code,
            explanation: codeData.explanation || '',
          });
        }
        break;
      }
      case 'callout': {
        const callout = block.data as CalloutBlockData;
        if (callout?.tone === 'note') {
          notes = notes ? `${notes}\n\n${callout.message}` : callout.message;
        } else if (callout?.title === 'Key Takeaways' || callout?.tone === 'tip') {
          const lines = callout.message.split('\n').map((l) => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
          keyPoints.push(...lines);
        }
        break;
      }
      case 'list': {
        const listData = block.data as ListBlockData;
        if (Array.isArray(listData?.items)) {
          learningObjectives.push(...listData.items.filter(Boolean));
        }
        break;
      }
      case 'link':
      case 'download':
      case 'pdf': {
        const linkData = block.data as any;
        if (linkData?.url) {
          resourceLinks.push({
            id: block.id,
            title: linkData.title || 'Resource Link',
            url: linkData.url,
            type: block.type === 'pdf' ? 'pdf' : 'link',
            description: linkData.description || '',
          });
        }
        break;
      }
      case 'quiz': {
        const quizData = block.data as QuizBlockData;
        if (Array.isArray(quizData?.questions)) {
          quizQuestions = quizData.questions.map((q, idx) => ({
            id: q.questionId || `q-${idx}`,
            questionText: q.question,
            options: q.options,
            correctAnswerIndex: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
            explanation: q.explanation || '',
            marks: q.points || 5,
          }));
        }
        break;
      }
      case 'assignment': {
        const assignData = block.data as any;
        if (assignData?.instructions) {
          assignmentInstructions = assignData.instructions;
        }
        break;
      }
      default:
        break;
    }
  }

  readingContent = conceptTheory;
  if (notes) {
    readingContent = `${readingContent}\n\n> **Important Note:** ${notes}`;
  }

  return {
    readingContent,
    conceptTheory,
    videoUrl,
    learningObjectives: learningObjectives.length > 0 ? learningObjectives : undefined,
    codeExamples: codeExamples.length > 0 ? codeExamples : undefined,
    keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
    resourceLinks: resourceLinks.length > 0 ? resourceLinks : undefined,
    quizQuestions,
    assignmentInstructions,
    notes,
  };
}
