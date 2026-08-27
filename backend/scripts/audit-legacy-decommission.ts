import { db } from '../src/firebase';
import { coursesCollection, modulesCollection, lessonsCollection } from '../src/firebase/collections';
import { courseContentService } from '../src/services/course/courseContent.service';

interface RecordComparison {
  id: string;
  type: 'module' | 'lesson';
  courseId: string;
  moduleId?: string;
  status: 'MATCH' | 'LEGACY_ONLY' | 'CANONICAL_ONLY' | 'CONTENT_CONFLICT';
  details?: string;
}

export async function runDecommissionAudit() {
  console.log('====================================================');
  console.log('🔍 KAIZENQ V2 — PHASE 4E: LEGACY DECOMMISSION AUDIT');
  console.log('====================================================\n');

  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  // 1. Audit Modules
  console.log('📦 Auditing Legacy vs Canonical Modules...');
  const topModulesSnap = await modulesCollection().get();
  const coursesSnap = await coursesCollection().get();

  const moduleComparisons: RecordComparison[] = [];
  const canonicalModulesMap = new Map<string, { doc: any; courseId: string }>();

  for (const cDoc of coursesSnap.docs) {
    const courseId = cDoc.id;
    const canModsSnap = await db.collection('courses').doc(courseId).collection('modules').get().catch(() => ({ docs: [] } as any));
    for (const mDoc of canModsSnap.docs) {
      canonicalModulesMap.set(mDoc.id, { doc: mDoc.data(), courseId });
    }
  }

  for (const topDoc of topModulesSnap.docs) {
    const modId = topDoc.id;
    const topData = topDoc.data();
    const canEntry = canonicalModulesMap.get(modId);

    if (!canEntry) {
      moduleComparisons.push({
        id: modId,
        type: 'module',
        courseId: topData.courseId || 'unknown',
        status: 'LEGACY_ONLY',
        details: 'Exists in top-level /modules only',
      });
    } else {
      const canData = canEntry.doc;
      const titleMatch = (topData.title || '').trim() === (canData.title || '').trim();
      if (titleMatch) {
        moduleComparisons.push({
          id: modId,
          type: 'module',
          courseId: canEntry.courseId,
          status: 'MATCH',
        });
      } else {
        moduleComparisons.push({
          id: modId,
          type: 'module',
          courseId: canEntry.courseId,
          status: 'CONTENT_CONFLICT',
          details: `Title mismatch: "${topData.title}" vs "${canData.title}"`,
        });
      }
    }
  }

  // Check for CANONICAL_ONLY modules
  for (const [canId, canEntry] of canonicalModulesMap.entries()) {
    const topExists = topModulesSnap.docs.some((d) => d.id === canId);
    if (!topExists) {
      moduleComparisons.push({
        id: canId,
        type: 'module',
        courseId: canEntry.courseId,
        status: 'CANONICAL_ONLY',
        details: 'Exists in canonical subcollection only',
      });
    }
  }

  // 2. Audit Lessons
  console.log('📖 Auditing Legacy vs Canonical Lessons...');
  const topLessonsSnap = await lessonsCollection().get();
  const lessonComparisons: RecordComparison[] = [];
  const canonicalLessonsMap = new Map<string, { doc: any; courseId: string; moduleId: string }>();

  for (const cDoc of coursesSnap.docs) {
    const courseId = cDoc.id;
    const canModsSnap = await db.collection('courses').doc(courseId).collection('modules').get().catch(() => ({ docs: [] } as any));
    for (const mDoc of canModsSnap.docs) {
      const moduleId = mDoc.id;
      const canLessSnap = await db
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(moduleId)
        .collection('lessons')
        .get()
        .catch(() => ({ docs: [] } as any));

      for (const lDoc of canLessSnap.docs) {
        canonicalLessonsMap.set(lDoc.id, { doc: lDoc.data(), courseId, moduleId });
      }
    }
  }

  for (const topDoc of topLessonsSnap.docs) {
    const lessId = topDoc.id;
    const topData = topDoc.data();
    const canEntry = canonicalLessonsMap.get(lessId);

    if (!canEntry) {
      lessonComparisons.push({
        id: lessId,
        type: 'lesson',
        courseId: topData.courseId || 'unknown',
        moduleId: topData.moduleId || 'unknown',
        status: 'LEGACY_ONLY',
        details: 'Exists in top-level /lessons only',
      });
    } else {
      const canData = canEntry.doc;
      const titleMatch = (topData.title || '').trim() === (canData.title || '').trim();
      const contentLenMatch = Math.abs((topData.content || '').length - (canData.content || '').length) < 50;

      if (titleMatch && contentLenMatch) {
        lessonComparisons.push({
          id: lessId,
          type: 'lesson',
          courseId: canEntry.courseId,
          moduleId: canEntry.moduleId,
          status: 'MATCH',
        });
      } else {
        lessonComparisons.push({
          id: lessId,
          type: 'lesson',
          courseId: canEntry.courseId,
          moduleId: canEntry.moduleId,
          status: 'CONTENT_CONFLICT',
          details: `Mismatch: title=${titleMatch}, contentLenTop=${(topData.content || '').length}, contentLenCan=${(canData.content || '').length}`,
        });
      }
    }
  }

  for (const [canId, canEntry] of canonicalLessonsMap.entries()) {
    const topExists = topLessonsSnap.docs.some((d) => d.id === canId);
    if (!topExists) {
      lessonComparisons.push({
        id: canId,
        type: 'lesson',
        courseId: canEntry.courseId,
        moduleId: canEntry.moduleId,
        status: 'CANONICAL_ONLY',
        details: 'Exists in canonical subcollection only',
      });
    }
  }

  // 3. Fallback Telemetry Test
  console.log('🧪 Testing Canonical vs Fallback Read Telemetry...');
  courseContentService.resetTelemetry();
  courseContentService.invalidateCache();

  // Test read canonical courses
  const sampleCourses = ['course_linux_101', 'c-programming-course-id', 'react-js-complete-course'];
  for (const cId of sampleCourses) {
    const mods = await courseContentService.getCourseModules(cId);
    if (mods.length > 0) {
      const lessons = await courseContentService.getModuleLessons(cId, mods[0].id);
      if (lessons.length > 0) {
        await courseContentService.getLessonById(lessons[0].id, cId, mods[0].id);
      }
    }
  }

  const telemetry = courseContentService.getTelemetry();

  // Summary Metrics
  const modMatches = moduleComparisons.filter((m) => m.status === 'MATCH').length;
  const modLegacyOnly = moduleComparisons.filter((m) => m.status === 'LEGACY_ONLY').length;
  const modCanonicalOnly = moduleComparisons.filter((m) => m.status === 'CANONICAL_ONLY').length;
  const modConflicts = moduleComparisons.filter((m) => m.status === 'CONTENT_CONFLICT').length;

  const lesMatches = lessonComparisons.filter((l) => l.status === 'MATCH').length;
  const lesLegacyOnly = lessonComparisons.filter((l) => l.status === 'LEGACY_ONLY').length;
  const lesCanonicalOnly = lessonComparisons.filter((l) => l.status === 'CANONICAL_ONLY').length;
  const lesConflicts = lessonComparisons.filter((l) => l.status === 'CONTENT_CONFLICT').length;

  console.log('\n====================================================');
  console.log('📊 MODULE AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Top-Level Legacy /modules Total: ${topModulesSnap.size}`);
  console.log(`Canonical Subcollection Modules: ${canonicalModulesMap.size}`);
  console.log(`Exact Matches:                   ${modMatches}`);
  console.log(`Legacy Only:                     ${modLegacyOnly}`);
  console.log(`Canonical Only:                  ${modCanonicalOnly}`);
  console.log(`Content Conflicts:               ${modConflicts}`);

  console.log('\n====================================================');
  console.log('📊 LESSON AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Top-Level Legacy /lessons Total: ${topLessonsSnap.size}`);
  console.log(`Canonical Subcollection Lessons: ${canonicalLessonsMap.size}`);
  console.log(`Exact Matches:                   ${lesMatches}`);
  console.log(`Legacy Only:                     ${lesLegacyOnly}`);
  console.log(`Canonical Only:                  ${lesCanonicalOnly}`);
  console.log(`Content Conflicts:               ${lesConflicts}`);

  console.log('\n====================================================');
  console.log('📊 FALLBACK TELEMETRY TEST');
  console.log('====================================================');
  console.log(`Legacy Modules Fallback Invocations: ${telemetry.legacyModulesFallbackCount}`);
  console.log(`Legacy Lessons Fallback Invocations: ${telemetry.legacyLessonsFallbackCount}`);
  console.log('====================================================\n');

  let readinessScore: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  if (modLegacyOnly > 0 || lesLegacyOnly > 0 || modConflicts > 0 || lesConflicts > 0) {
    readinessScore = 'YELLOW';
  }

  console.log(`🎯 DECOMMISSION READINESS: [${readinessScore}]\n`);

  return {
    topModulesCount: topModulesSnap.size,
    canonicalModulesCount: canonicalModulesMap.size,
    modMatches,
    modLegacyOnly,
    modCanonicalOnly,
    modConflicts,
    topLessonsCount: topLessonsSnap.size,
    canonicalLessonsCount: canonicalLessonsMap.size,
    lesMatches,
    lesLegacyOnly,
    lesCanonicalOnly,
    lesConflicts,
    telemetry,
    readinessScore,
  };
}

if (process.argv[1]?.includes('audit-legacy-decommission')) {
  runDecommissionAudit()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Audit failed:', err);
      process.exit(1);
    });
}
