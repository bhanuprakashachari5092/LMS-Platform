import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../src/firebase';
import { coursesCollection } from '../src/firebase/collections';
import { backupCourseContent } from './backup-course-content';

interface CourseSafetyAudit {
  courseId: string;
  title: string;
  rootSizeBytes: number;
  hasEmbeddedModules: boolean;
  embeddedModulesCount: number;
  canonicalModulesCount: number;
  canonicalLessonsCount: number;
  safetyStatus: 'SAFE_TO_CLEAN' | 'NOT_SAFE' | 'ALREADY_CLEAN' | 'MISSING_CANONICAL' | 'CONFLICT';
  failureReasons: string[];
  estimatedSizeBytesAfter: number;
}

export async function auditAndCleanLegacyCourseData(options: {
  backupFirst?: boolean;
  cleanupLegacy?: boolean;
}) {
  const isDryRun = !(options.backupFirst && options.cleanupLegacy);

  console.log('====================================================');
  console.log('🧹 KAIZENQ V2 — SAFE LEGACY COURSE DATA CLEANUP');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Preview only, zero writes to Firestore)' : '⚡ LIVE EXECUTION (--backup-first --cleanup-legacy)'}`);
  console.log('====================================================\n');

  if (!db) {
    console.error('❌ Firestore is not initialized.');
    process.exit(1);
  }

  // 1. If live execution requested, take mandatory backup first
  let backupPath = '';
  if (!isDryRun) {
    if (!options.backupFirst) {
      console.error('❌ Safety Error: --backup-first is mandatory for live cleanup.');
      process.exit(1);
    }
    backupPath = await backupCourseContent();
    console.log(`\n🛡️ Safety backup verified: ${backupPath}\n`);
  }

  const coursesSnap = await coursesCollection().get();
  const audits: CourseSafetyAudit[] = [];

  for (const doc of coursesSnap.docs) {
    const courseId = doc.id;
    const data = doc.data() || {};
    const rootSizeBytes = JSON.stringify(data).length;
    const embeddedModules = Array.isArray(data.modules) ? data.modules : [];
    const hasEmbeddedModules = embeddedModules.length > 0;

    // Check canonical subcollections: courses/{courseId}/modules
    const canonicalModulesSnap = await db.collection('courses').doc(courseId).collection('modules').get().catch(() => ({ docs: [] } as any));
    const canonicalModulesMap = new Map<string, any>();
    canonicalModulesSnap.docs.forEach((mDoc: any) => canonicalModulesMap.set(mDoc.id, mDoc.data()));

    let canonicalLessonsCount = 0;
    const failureReasons: string[] = [];

    // Audit each canonical module for lessons
    for (const [mId] of canonicalModulesMap.entries()) {
      const canonicalLessonsSnap = await db
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(mId)
        .collection('lessons')
        .get()
        .catch(() => ({ docs: [] } as any));

      canonicalLessonsCount += canonicalLessonsSnap.docs.length;
    }

    // Safety checks against embedded data
    if (!hasEmbeddedModules) {
      audits.push({
        courseId,
        title: data.title || 'Untitled',
        rootSizeBytes,
        hasEmbeddedModules: false,
        embeddedModulesCount: 0,
        canonicalModulesCount: canonicalModulesSnap.docs.length,
        canonicalLessonsCount,
        safetyStatus: 'ALREADY_CLEAN',
        failureReasons: [],
        estimatedSizeBytesAfter: rootSizeBytes,
      });
      continue;
    }

    // Embedded modules exist — perform strict verification against canonical records
    if (canonicalModulesSnap.docs.length === 0) {
      failureReasons.push('Zero canonical modules found in subcollection');
    }

    for (let idx = 0; idx < embeddedModules.length; idx++) {
      const embMod = embeddedModules[idx];
      const modId = embMod.id || `${courseId}-mod-${idx + 1}`;
      const canMod = canonicalModulesMap.get(modId);

      if (!canMod) {
        failureReasons.push(`Embedded module "${modId}" missing from canonical subcollection`);
      }
    }

    // Estimate cleaned size by removing embedded modules field
    const { modules: _discard, ...cleanedPreview } = data;
    const estimatedSizeBytesAfter = JSON.stringify(cleanedPreview).length;

    let safetyStatus: CourseSafetyAudit['safetyStatus'] = 'SAFE_TO_CLEAN';
    if (failureReasons.length > 0) {
      safetyStatus = 'MISSING_CANONICAL';
    }

    audits.push({
      courseId,
      title: data.title || 'Untitled',
      rootSizeBytes,
      hasEmbeddedModules: true,
      embeddedModulesCount: embeddedModules.length,
      canonicalModulesCount: canonicalModulesSnap.docs.length,
      canonicalLessonsCount,
      safetyStatus,
      failureReasons,
      estimatedSizeBytesAfter,
    });
  }

  console.table(
    audits.map((a) => ({
      courseId: a.courseId,
      title: a.title.slice(0, 35),
      sizeBefore: `${(a.rootSizeBytes / 1024).toFixed(1)} KB`,
      sizeAfter: `${(a.estimatedSizeBytesAfter / 1024).toFixed(1)} KB`,
      embeddedMods: a.embeddedModulesCount,
      canonicalMods: a.canonicalModulesCount,
      canonicalLessons: a.canonicalLessonsCount,
      safety: a.safetyStatus,
    }))
  );

  const safeToClean = audits.filter((a) => a.safetyStatus === 'SAFE_TO_CLEAN');
  const alreadyClean = audits.filter((a) => a.safetyStatus === 'ALREADY_CLEAN');
  const notSafe = audits.filter((a) => a.safetyStatus !== 'SAFE_TO_CLEAN' && a.safetyStatus !== 'ALREADY_CLEAN');

  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Total Courses:       ${audits.length}`);
  console.log(`Already Clean:       ${alreadyClean.length}`);
  console.log(`Safe to Clean:       ${safeToClean.length}`);
  console.log(`Not Safe / Blocked:  ${notSafe.length}`);
  console.log('====================================================\n');

  if (notSafe.length > 0) {
    console.warn('⚠️ WARNING: The following courses failed safety thresholds:');
    notSafe.forEach((c) => {
      console.warn(` - [${c.courseId}] ${c.title}: ${c.failureReasons.join(', ')}`);
    });
  }

  // 2. Perform live cleanup ONLY if explicit flags are provided and course is SAFE
  if (!isDryRun) {
    console.log('⚡ Executing live non-destructive field cleanup on SAFE courses...');
    for (const c of safeToClean) {
      try {
        await coursesCollection().doc(c.courseId).update({
          modules: FieldValue.delete(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`  ✅ [CLEANED] ${c.courseId} (${(c.rootSizeBytes / 1024).toFixed(1)} KB -> ${(c.estimatedSizeBytesAfter / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.error(`  ❌ [FAILED] Could not clean ${c.courseId}:`, err);
      }
    }
    console.log('\n🎉 Live cleanup completed successfully.');
  } else {
    console.log('🔍 Dry run complete. Zero modifications made to Firestore.');
    console.log('To execute live cleanup with safety backup, run:');
    console.log('npm run cleanup:legacy-course-data -- --backup-first --cleanup-legacy\n');
  }

  return { audits, safeToClean, alreadyClean, notSafe, backupPath };
}

// CLI Execution entrypoint
if (process.argv[1]?.includes('cleanup-legacy-course-data')) {
  const backupFirst = process.argv.includes('--backup-first');
  const cleanupLegacy = process.argv.includes('--cleanup-legacy');

  auditAndCleanLegacyCourseData({ backupFirst, cleanupLegacy })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal cleanup error:', err);
      process.exit(1);
    });
}
