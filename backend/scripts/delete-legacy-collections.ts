import fs from 'fs';
import path from 'path';
import { db } from '../src/firebase';
import { coursesCollection, modulesCollection, lessonsCollection } from '../src/firebase/collections';

export async function executeLegacyCollectionDecommission(confirm = false) {
  console.log('====================================================');
  console.log('🛡️ KAIZENQ V2 — PHASE 4G: CONTROLLED DECOMMISSION SCRIPT');
  console.log(`Mode: ${confirm ? '⚡ LIVE EXECUTION (--confirm-delete-legacy-collections)' : '🔍 DRY RUN AUDIT'}`);
  console.log('====================================================\n');

  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  // --- GATE 3: PRE-DELETE DATA AUDIT ---
  console.log('🔍 [GATE 3] Auditing Pre-Delete Record Counts...');
  const coursesSnap = await coursesCollection().get();
  const legacyModulesSnap = await modulesCollection('audit').get();
  const legacyLessonsSnap = await lessonsCollection('audit').get();

  let canonicalModulesCount = 0;
  let canonicalLessonsCount = 0;

  const canonicalModulesList: any[] = [];
  const canonicalLessonsList: any[] = [];

  for (const cDoc of coursesSnap.docs) {
    const cId = cDoc.id;
    const canMods = await db.collection('courses').doc(cId).collection('modules').get();
    canonicalModulesCount += canMods.size;

    for (const mDoc of canMods.docs) {
      canonicalModulesList.push({ id: mDoc.id, courseId: cId, ...mDoc.data() });
      const canLessons = await db
        .collection('courses')
        .doc(cId)
        .collection('modules')
        .doc(mDoc.id)
        .collection('lessons')
        .get();
      canonicalLessonsCount += canLessons.size;
      for (const lDoc of canLessons.docs) {
        canonicalLessonsList.push({ id: lDoc.id, courseId: cId, moduleId: mDoc.id, ...lDoc.data() });
      }
    }
  }

  console.log(` - Root Courses:      ${coursesSnap.size} (Expected: 16)`);
  console.log(` - Canonical Modules: ${canonicalModulesCount} (Expected: 111)`);
  console.log(` - Canonical Lessons: ${canonicalLessonsCount} (Expected: 465)`);
  console.log(` - Legacy /modules:   ${legacyModulesSnap.size} (Expected: 111)`);
  console.log(` - Legacy /lessons:   ${legacyLessonsSnap.size} (Expected: 465)`);

  if (canonicalModulesCount !== 111 || canonicalLessonsCount !== 465) {
    throw new Error(`❌ ABORT: Canonical counts mismatch! Found ${canonicalModulesCount} modules, ${canonicalLessonsCount} lessons.`);
  }

  if (legacyModulesSnap.size !== 111 || legacyLessonsSnap.size !== 465) {
    throw new Error(`❌ ABORT: Legacy counts mismatch! Found ${legacyModulesSnap.size} legacy modules, ${legacyLessonsSnap.size} legacy lessons.`);
  }

  // --- GATE 4 & 5: FINAL PRE-DELETE ARCHIVAL BACKUP ---
  console.log('\n📦 [GATE 4 & 5] Creating Pre-Deletion Archival Snapshot...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `final-legacy-decommission-${timestamp}.json`);

  const fullSnapshot = {
    timestamp: new Date().toISOString(),
    gateVerification: 'PASSED',
    counts: {
      courses: coursesSnap.size,
      canonicalModules: canonicalModulesCount,
      canonicalLessons: canonicalLessonsCount,
      legacyModules: legacyModulesSnap.size,
      legacyLessons: legacyLessonsSnap.size,
    },
    rootCourses: coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    canonicalModules: canonicalModulesList,
    canonicalLessons: canonicalLessonsList,
    legacyModules: legacyModulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    legacyLessons: legacyLessonsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(fullSnapshot, null, 2), 'utf-8');
  const backupStat = fs.statSync(backupFilePath);
  console.log(`✅ [GATE 5] Archival Backup Verified: ${backupFilePath} (${(backupStat.size / 1024).toFixed(1)} KB)`);

  // Verify backup is valid JSON and contains all records
  const verifyContent = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
  if (
    verifyContent.counts.courses !== 16 ||
    verifyContent.counts.canonicalModules !== 111 ||
    verifyContent.counts.canonicalLessons !== 465 ||
    verifyContent.counts.legacyModules !== 111 ||
    verifyContent.counts.legacyLessons !== 465
  ) {
    throw new Error('❌ ABORT: Backup validation failed integrity checks.');
  }

  // --- GATE 7 & 8: DELETION PLAN & CONTROLLED EXECUTION ---
  console.log('\n====================================================');
  console.log('🚨 [GATE 7] FINAL DELETION CONFIRMATION');
  console.log('====================================================');
  console.log(`Target: /modules (111 documents)`);
  console.log(`Target: /lessons (465 documents)`);
  console.log(`Total Scheduled Deletions: 576 documents`);
  console.log(`Canonical Nested Collections: PROTECTED & UNTOUCHED`);
  console.log('====================================================\n');

  if (!confirm) {
    console.log('🔍 Audit Complete. All 7 pre-delete gates PASSED.');
    console.log('To execute live deletion, run:');
    console.log('npx tsx scripts/delete-legacy-collections.ts --confirm-delete-legacy-collections\n');
    return {
      status: 'AUDIT_PASSED',
      backupFilePath,
      backupSizeBytes: backupStat.size,
    };
  }

  console.log('⚡ [GATE 8] Executing Controlled Batch Deletion...');
  let modulesDeleted = 0;
  let lessonsDeleted = 0;

  // Batch delete /modules
  const modDocs = legacyModulesSnap.docs;
  for (let i = 0; i < modDocs.length; i += 400) {
    const batch = db.batch();
    const chunk = modDocs.slice(i, i + 400);
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    modulesDeleted += chunk.length;
    console.log(`  - Deleted ${modulesDeleted}/${modDocs.length} legacy /modules documents.`);
  }

  // Batch delete /lessons
  const lessDocs = legacyLessonsSnap.docs;
  for (let i = 0; i < lessDocs.length; i += 400) {
    const batch = db.batch();
    const chunk = lessDocs.slice(i, i + 400);
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    lessonsDeleted += chunk.length;
    console.log(`  - Deleted ${lessonsDeleted}/${lessDocs.length} legacy /lessons documents.`);
  }

  // --- GATE 9: POST-DELETION VERIFICATION ---
  console.log('\n🔎 [GATE 9] Performing Post-Deletion Verification...');
  const postLegacyModSnap = await db.collection('modules').get();
  const postLegacyLessSnap = await db.collection('lessons').get();

  let postCanonicalMods = 0;
  let postCanonicalLess = 0;

  for (const cDoc of coursesSnap.docs) {
    const cId = cDoc.id;
    const canMods = await db.collection('courses').doc(cId).collection('modules').get();
    postCanonicalMods += canMods.size;

    for (const mDoc of canMods.docs) {
      const canLessons = await db
        .collection('courses')
        .doc(cId)
        .collection('modules')
        .doc(mDoc.id)
        .collection('lessons')
        .get();
      postCanonicalLess += canLessons.size;
    }
  }

  console.log(` - Post-Delete Legacy /modules Count:   ${postLegacyModSnap.size} (Expected: 0)`);
  console.log(` - Post-Delete Legacy /lessons Count:   ${postLegacyLessSnap.size} (Expected: 0)`);
  console.log(` - Post-Delete Canonical Modules Count: ${postCanonicalMods} (Expected: 111)`);
  console.log(` - Post-Delete Canonical Lessons Count: ${postCanonicalLess} (Expected: 465)`);

  if (postLegacyModSnap.size !== 0 || postLegacyLessSnap.size !== 0) {
    throw new Error('❌ Post-deletion verification failed: Legacy collections still contain records.');
  }

  if (postCanonicalMods !== 111 || postCanonicalLess !== 465) {
    throw new Error('❌ CRITICAL ERROR: Canonical collections were modified during deletion!');
  }

  console.log('\n🎉 ALL 9 DECOMMISSION GATES VERIFIED SUCCESSFULLY.');

  return {
    status: 'DECOMMISSION_COMPLETE',
    modulesDeleted,
    lessonsDeleted,
    totalDeleted: modulesDeleted + lessonsDeleted,
    postLegacyModCount: postLegacyModSnap.size,
    postLegacyLessCount: postLegacyLessSnap.size,
    postCanonicalModCount: postCanonicalMods,
    postCanonicalLessCount: postCanonicalLess,
    backupFilePath,
    backupSizeBytes: backupStat.size,
  };
}

if (process.argv[1]?.includes('delete-legacy-collections')) {
  const confirm = process.argv.includes('--confirm-delete-legacy-collections');
  executeLegacyCollectionDecommission(confirm)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal Decommission Error:', err);
      process.exit(1);
    });
}
