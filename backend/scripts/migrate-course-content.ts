import { db } from '../src/firebase';
import { coursesCollection, modulesCollection, lessonsCollection } from '../src/firebase/collections';
import { fromDocument, toDocument } from '../src/utils/firestore';

interface MigrationStats {
  coursesScanned: number;
  modulesScanned: number;
  lessonsScanned: number;
  modulesMigrated: number;
  modulesAlreadyCanonical: number;
  lessonsMigrated: number;
  lessonsAlreadyCanonical: number;
  missingSource: number;
  conflicts: number;
  failed: number;
}

export async function runCourseMigration(options: { execute?: boolean; courseId?: string }) {
  const isExecute = options.execute === true;
  const targetCourseId = options.courseId;

  console.log('====================================================');
  console.log(`🚀 KAIZENQ V2 — COURSE CONTENT MIGRATION PIPELINE`);
  console.log(`Mode: ${isExecute ? '⚡ LIVE EXECUTION (--execute)' : '🔍 DRY RUN (Preview only, no writes)'}`);
  if (targetCourseId) {
    console.log(`Target: Course ID "${targetCourseId}"`);
  } else {
    console.log(`Target: All Production Courses`);
  }
  console.log('====================================================\n');

  if (!db) {
    console.error('❌ Firestore is not initialized.');
    process.exit(1);
  }

  const stats: MigrationStats = {
    coursesScanned: 0,
    modulesScanned: 0,
    lessonsScanned: 0,
    modulesMigrated: 0,
    modulesAlreadyCanonical: 0,
    lessonsMigrated: 0,
    lessonsAlreadyCanonical: 0,
    missingSource: 0,
    conflicts: 0,
    failed: 0,
  };

  let coursesQuery: any = coursesCollection();
  if (targetCourseId) {
    const singleDoc = await coursesCollection().doc(targetCourseId).get();
    if (!singleDoc.exists) {
      console.error(`❌ Course "${targetCourseId}" not found in Firestore.`);
      process.exit(1);
    }
    coursesQuery = { docs: [singleDoc] };
  } else {
    coursesQuery = await coursesCollection().get();
  }

  stats.coursesScanned = coursesQuery.docs.length;

  for (const courseDoc of coursesQuery.docs) {
    const courseId = courseDoc.id;
    const courseData = courseDoc.data() || {};
    console.log(`\n📚 Auditing Course [${courseId}] - "${courseData.title || 'Untitled'}"...`);

    // 1. Gather all potential modules for this course
    // Source A: Subcollection courses/{courseId}/modules
    const subModulesSnap = await db.collection('courses').doc(courseId).collection('modules').get().catch(() => ({ docs: [] } as any));
    const subModulesMap = new Map<string, any>();
    subModulesSnap.docs.forEach((d: any) => subModulesMap.set(d.id, { id: d.id, ...d.data() }));

    // Source B: Top-level modules collection where courseId == courseId
    const topModulesSnap = await modulesCollection().where('courseId', '==', courseId).get().catch(() => ({ docs: [] } as any));
    const topModulesMap = new Map<string, any>();
    topModulesSnap.docs.forEach((d: any) => topModulesMap.set(d.id, { id: d.id, ...d.data() }));

    // Source C: Embedded modules array in course doc
    const embeddedModules: any[] = Array.isArray(courseData.modules) ? courseData.modules : [];

    // Union of all module IDs
    const allModuleIds = new Set<string>([
      ...subModulesMap.keys(),
      ...topModulesMap.keys(),
      ...embeddedModules.map((m, idx) => m.id || `${courseId}-mod-${idx + 1}`),
    ]);

    stats.modulesScanned += allModuleIds.size;

    for (const moduleId of allModuleIds) {
      const canonicalMod = subModulesMap.get(moduleId);
      const topMod = topModulesMap.get(moduleId);
      const embeddedMod = embeddedModules.find((m, idx) => (m.id || `${courseId}-mod-${idx + 1}`) === moduleId);

      const sourceMod = canonicalMod || topMod || embeddedMod;
      if (!sourceMod) {
        stats.missingSource++;
        continue;
      }

      const orderIndex = sourceMod.orderIndex ?? sourceMod.order ?? 1;
      const normalizedModule = toDocument({
        ...sourceMod,
        id: moduleId,
        courseId,
        orderIndex,
        order: orderIndex,
        updatedAt: sourceMod.updatedAt || new Date(),
      });

      if (canonicalMod && canonicalMod.orderIndex === orderIndex && canonicalMod.title) {
        stats.modulesAlreadyCanonical++;
      } else {
        if (isExecute) {
          try {
            await db.collection('courses').doc(courseId).collection('modules').doc(moduleId).set(normalizedModule, { merge: true });
            stats.modulesMigrated++;
            console.log(`  ✅ [MODULE MIGRATED] courses/${courseId}/modules/${moduleId} ("${normalizedModule.title}")`);
          } catch (err) {
            console.error(`  ❌ [MODULE FAILED] courses/${courseId}/modules/${moduleId}:`, err);
            stats.failed++;
          }
        } else {
          stats.modulesMigrated++;
          console.log(`  🔍 [DRY-RUN MODULE] Would write courses/${courseId}/modules/${moduleId} (orderIndex: ${orderIndex})`);
        }
      }

      // 2. Gather lessons for this module
      // Source A: Subcollection courses/{courseId}/modules/{moduleId}/lessons
      const subLessonsSnap = await db
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(moduleId)
        .collection('lessons')
        .get()
        .catch(() => ({ docs: [] } as any));
      const subLessonsMap = new Map<string, any>();
      subLessonsSnap.docs.forEach((d: any) => subLessonsMap.set(d.id, { id: d.id, ...d.data() }));

      // Source B: Top-level lessons collection where moduleId == moduleId
      const topLessonsSnap = await lessonsCollection().where('moduleId', '==', moduleId).get().catch(() => ({ docs: [] } as any));
      const topLessonsMap = new Map<string, any>();
      topLessonsSnap.docs.forEach((d: any) => topLessonsMap.set(d.id, { id: d.id, ...d.data() }));

      const allLessonIds = new Set<string>([...subLessonsMap.keys(), ...topLessonsMap.keys()]);
      stats.lessonsScanned += allLessonIds.size;

      for (const lessonId of allLessonIds) {
        const canonicalLes = subLessonsMap.get(lessonId);
        const topLes = topLessonsMap.get(lessonId);

        const sourceLes = canonicalLes || topLes;
        if (!sourceLes) {
          stats.missingSource++;
          continue;
        }

        const lesOrderIndex = sourceLes.orderIndex ?? sourceLes.order ?? 1;
        const normalizedLesson = toDocument({
          ...sourceLes,
          id: lessonId,
          courseId,
          moduleId,
          orderIndex: lesOrderIndex,
          order: lesOrderIndex,
          updatedAt: sourceLes.updatedAt || new Date(),
        });

        if (canonicalLes && canonicalLes.orderIndex === lesOrderIndex && canonicalLes.title && canonicalLes.content) {
          stats.lessonsAlreadyCanonical++;
        } else {
          if (isExecute) {
            try {
              await db
                .collection('courses')
                .doc(courseId)
                .collection('modules')
                .doc(moduleId)
                .collection('lessons')
                .doc(lessonId)
                .set(normalizedLesson, { merge: true });
              stats.lessonsMigrated++;
              console.log(`    ✅ [LESSON MIGRATED] .../lessons/${lessonId} ("${normalizedLesson.title}")`);
            } catch (err) {
              console.error(`    ❌ [LESSON FAILED] .../lessons/${lessonId}:`, err);
              stats.failed++;
            }
          } else {
            stats.lessonsMigrated++;
            console.log(`    🔍 [DRY-RUN LESSON] Would write .../lessons/${lessonId} (orderIndex: ${lesOrderIndex})`);
          }
        }
      }
    }
  }

  console.log('\n====================================================');
  console.log('📊 MIGRATION EXECUTION SUMMARY');
  console.log('====================================================');
  console.log(`Courses Scanned:             ${stats.coursesScanned}`);
  console.log(`Modules Scanned:             ${stats.modulesScanned}`);
  console.log(`Lessons Scanned:             ${stats.lessonsScanned}`);
  console.log(`Modules Already Canonical:   ${stats.modulesAlreadyCanonical}`);
  console.log(`Modules Migrated:            ${stats.modulesMigrated}`);
  console.log(`Lessons Already Canonical:   ${stats.lessonsAlreadyCanonical}`);
  console.log(`Lessons Migrated:            ${stats.lessonsMigrated}`);
  console.log(`Missing Sources:             ${stats.missingSource}`);
  console.log(`Conflicts:                   ${stats.conflicts}`);
  console.log(`Failures:                    ${stats.failed}`);
  console.log('====================================================\n');

  return stats;
}

// CLI Execution entrypoint
if (process.argv[1]?.includes('migrate-course-content')) {
  const isExecute = process.argv.includes('--execute');
  const courseArg = process.argv.find((a) => a.startsWith('--course='));
  const courseId = courseArg ? courseArg.split('=')[1] : undefined;

  runCourseMigration({ execute: isExecute, courseId })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
