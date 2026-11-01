import { describe, it, expect, afterAll } from '@jest/globals';
import * as admin from 'firebase-admin';
import { lessonToBlocks, blocksToLegacyFields } from '../../shared/adapters/lessonBlockAdapter';
import { ConflictError, ErrorCode } from '../src/utils/errors';
import { courseContentService } from '../src/services/course/courseContent.service';
import type { ILessonBlock } from '../../shared/types/course';

describe('Phase 1: Lesson Block Adapter (Bidirectional Compatibility)', () => {
  it('should transform a legacy lesson document into structured content blocks', () => {
    const legacyLesson = {
      id: 'lesson-arch-101',
      title: 'Architecture Overview',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      learningObjectives: ['Master Transactions', 'Understand Concurrency'],
      conceptTheory: '## Theoretical Overview\nTransactions provide ACID guarantees.',
      codeExamples: [
        {
          id: 'code-1',
          title: 'Transaction Example',
          language: 'typescript',
          code: 'await db.runTransaction(...)',
          explanation: 'Executes atomic operations.',
        },
      ],
      keyPoints: ['Use runTransaction for concurrency', 'Never read outside the transaction'],
      notes: 'Review before attempting lab.',
      resourceLinks: [
        {
          id: 'res-1',
          title: 'Firestore Docs',
          url: 'https://firebase.google.com/docs/firestore',
        },
      ],
      quizQuestions: [
        {
          id: 'q-1',
          questionText: 'What is ACID?',
          options: ['Atomicity...', 'B...', 'C...', 'D...'],
          correctAnswerIndex: 0,
          marks: 5,
        },
      ],
    };

    const blocks = lessonToBlocks(legacyLesson as any);
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBe(8);

    // Verify individual block types
    const types = blocks.map((b) => b.type);
    expect(types).toContain('video');
    expect(types).toContain('list');
    expect(types).toContain('text');
    expect(types).toContain('code');
    expect(types).toContain('callout');
    expect(types).toContain('link');
    expect(types).toContain('quiz');

    const videoBlock = blocks.find((b) => b.type === 'video');
    expect(videoBlock?.data.provider).toBe('youtube');
    expect(videoBlock?.data.url).toBe(legacyLesson.videoUrl);

    const codeBlock = blocks.find((b) => b.type === 'code');
    expect(codeBlock?.data.language).toBe('typescript');
    expect(codeBlock?.data.code).toContain('runTransaction');
  });

  it('should compile structured blocks back into legacy lesson representation', () => {
    const blocks: ILessonBlock[] = [
      {
        id: 'b-1',
        lessonId: 'les-test',
        type: 'text',
        order: 0,
        data: { markdown: 'Compiled markdown theory' },
        isVisible: true,
        createdAt: '2026-09-23T00:00:00Z',
        updatedAt: '2026-09-23T00:00:00Z',
      },
      {
        id: 'b-2',
        lessonId: 'les-test',
        type: 'code',
        order: 1,
        data: { title: 'Sample Code', language: 'python', code: 'print("Hello")', explanation: 'Prints greeting' },
        isVisible: true,
        createdAt: '2026-09-23T00:00:00Z',
        updatedAt: '2026-09-23T00:00:00Z',
      },
    ];

    const legacy = blocksToLegacyFields(blocks);
    expect(legacy.conceptTheory).toBe('Compiled markdown theory');
    expect(legacy.readingContent).toContain('Compiled markdown theory');
    expect(Array.isArray(legacy.codeExamples)).toBe(true);
    expect(legacy.codeExamples?.length).toBe(1);
    expect(legacy.codeExamples?.[0].code).toBe('print("Hello")');
  });
});

describe('Phase 1: Conflict Error Standard Architecture', () => {
  it('should instantiate ConflictError with code 409 and revision metadata', () => {
    const err = new ConflictError(
      'Conflict: Lesson "les-1" was modified by another session.',
      5,
      4
    );

    expect(err.statusCode).toBe(409);
    expect(err.conflict).toBe(true);
    expect(err.code).toBe(ErrorCode.CONFLICT);
    expect(err.currentRevision).toBe(5);
    expect(err.expectedRevision).toBe(4);
    expect(err.message).toContain('Conflict');
  });
});

describe('Phase 1: CourseContentService Concurrency & Transactions', () => {
  const testCourseId = 'test-course-phase1';
  const testModuleId = 'mod-phase1';
  const testLessonId = `test-les-${Date.now()}`;

  it('should successfully save a new lesson and advance revision to 1', async () => {
    const lessonDoc = {
      id: testLessonId,
      courseId: testCourseId,
      moduleId: testModuleId,
      title: 'Initial Concurrency Lesson',
      duration: '10 mins',
      type: 'Reading' as any,
      content: 'Initial lesson content.',
    };

    const saved = await courseContentService.saveLesson(testCourseId, testModuleId, lessonDoc as any, 'test-admin');
    expect(saved).toBeDefined();
    expect(saved.id).toBe(testLessonId);
    expect(saved.revision).toBe(1);
  }, 30000);

  it('should save with matching expectedRevision and advance revision atomically', async () => {
    const updateDoc = {
      id: testLessonId,
      courseId: testCourseId,
      moduleId: testModuleId,
      title: 'Updated Concurrency Lesson (Rev 1)',
      duration: '12 mins',
      type: 'Reading' as any,
      content: 'Updated content with expected revision 1.',
      expectedRevision: 1,
    };

    const updated = await courseContentService.saveLesson(testCourseId, testModuleId, updateDoc as any, 'test-admin');
    expect(updated).toBeDefined();
    expect(updated.revision).toBe(2);
  }, 30000);

  it('should reject a stale write with 409 Conflict when expectedRevision does not match current', async () => {
    const staleDoc = {
      id: testLessonId,
      courseId: testCourseId,
      moduleId: testModuleId,
      title: 'Stale Concurrency Lesson Update',
      duration: '12 mins',
      type: 'Reading' as any,
      content: 'Stale update content.',
      expectedRevision: 1, // Current revision is 2!
    };

    await expect(
      courseContentService.saveLesson(testCourseId, testModuleId, staleDoc as any, 'test-admin')
    ).rejects.toThrow(/Conflict: Lesson/);

    try {
      await courseContentService.saveLesson(testCourseId, testModuleId, staleDoc as any, 'test-admin');
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
      expect(err.conflict).toBe(true);
      expect(err.currentRevision).toBe(2);
      expect(err.expectedRevision).toBe(1);
    }
  }, 30000);

  it('should retrieve synthesized blocks for the lesson via getLessonBlocks', async () => {
    const blocks = await courseContentService.getLessonBlocks(testCourseId, testModuleId, testLessonId);
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0].type).toBe('text');
  }, 30000);

  it('should persist and query course assets in course_assets collection', async () => {
    const asset = await courseContentService.createCourseAsset(
      {
        courseId: testCourseId,
        url: 'https://res.cloudinary.com/kaizenq/image/upload/v1/sample.png',
        filename: 'sample.png',
        type: 'image',
        mimeType: 'image/png',
        size: 10240,
      },
      'test-admin'
    );

    expect(asset).toBeDefined();
    expect(asset.id).toBeDefined();
    expect(asset.provider).toBe('cloudinary');

    const assets = await courseContentService.getCourseAssets(testCourseId);
    expect(Array.isArray(assets)).toBe(true);
    const found = assets.find((a) => a.id === asset.id);
    expect(found).toBeDefined();
    expect(found?.filename).toBe('sample.png');
  }, 30000);

  it('should ensure two sequential saves do not lose data and increment revision sequentially', async () => {
    // Sequential Save 1: Revision 2 -> 3
    const save1 = await courseContentService.saveLesson(
      testCourseId,
      testModuleId,
      {
        id: testLessonId,
        courseId: testCourseId,
        moduleId: testModuleId,
        title: 'Sequential Step 1',
        content: 'Content from step 1',
        duration: '15 mins',
        type: 'reading',
        orderIndex: 1,
        expectedRevision: 2,
      } as any,
      'test-admin'
    );
    expect(save1.revision).toBe(3);
    expect(save1.title).toBe('Sequential Step 1');

    // Sequential Save 2: Revision 3 -> 4
    const save2 = await courseContentService.saveLesson(
      testCourseId,
      testModuleId,
      {
        id: testLessonId,
        courseId: testCourseId,
        moduleId: testModuleId,
        title: 'Sequential Step 2',
        content: 'Content from step 2 with additional theory',
        duration: '20 mins',
        type: 'reading',
        orderIndex: 1,
        expectedRevision: 3,
      } as any,
      'test-admin'
    );
    expect(save2.revision).toBe(4);
    expect(save2.title).toBe('Sequential Step 2');
    expect(save2.content).toContain('Content from step 2');

    // Verify fetched document retains latest content
    const verified = await courseContentService.getLessonById(testLessonId, testCourseId, testModuleId);
    expect(verified).not.toBeNull();
    expect(verified?.revision).toBe(4);
    expect(verified?.title).toBe('Sequential Step 2');
  }, 30000);

  it('should save a module atomically with transaction and increment revision', async () => {
    const freshModId = `mod-phase1-${Date.now()}`;
    const modDoc = {
      id: freshModId,
      courseId: testCourseId,
      title: 'Phase 1 Concurrency Module',
      description: 'Testing module transactions',
      orderIndex: 1,
    };

    const savedMod = await courseContentService.saveModule(testCourseId, modDoc as any, 'test-admin');
    expect(savedMod).toBeDefined();
    expect(savedMod.id).toBe(freshModId);
    expect(savedMod.revision).toBe(1);
    expect(savedMod.status).toBe('draft');
  }, 30000);

  it('should create course with builderVersion, contentVersion, and revision defaults', async () => {
    const { CourseRepository } = await import('../src/modules/courses/course.repository');
    const repo = new CourseRepository();
    const course = await repo.create(
      {
        title: `Phase 1 Architecture Test Course ${Date.now()}`,
        shortDescription: 'Testing architectural defaults',
        description: 'Comprehensive test of builderVersion and contentVersion',
        category: 'Testing',
        level: 'beginner',
        thumbnail: 'https://example.com/test.png',
        duration: '5 hours',
        language: 'English',
        price: 0,
        status: 'draft',
        visibility: 'public',
        featured: false,
        tags: ['test'],
        skills: ['architecture'],
        prerequisites: [],
        learningOutcomes: ['Verify defaults'],
        instructor: { name: 'Test Instructor' },
      } as any,
      'test-admin'
    );

    expect(course.builderVersion).toBe(1);
    expect(course.contentVersion).toBe(1);
    expect(course.draftRevision).toBe(0);
    expect(course.publishedRevision).toBe(0);
    expect(course.revision).toBe(1);
  }, 30000);
});

afterAll(async () => {
  await Promise.all(admin.apps.map((app) => app?.delete()));
});
