import { db } from '../src/firebase';
import { coursesCollection, modulesCollection, lessonsCollection } from '../src/firebase/collections';

async function inspectCourseHierarchy() {
  console.log('=== KAIZENQ V2: FIRESTORE COURSE HIERARCHY INSPECTION ===\n');

  if (!db) {
    console.error('❌ Firestore db is not initialized.');
    process.exit(1);
  }

  // 1. Inspect root courses
  const coursesSnap = await coursesCollection().get();
  console.log(`Found ${coursesSnap.size} courses in root 'courses' collection.\n`);

  const coursesReport: any[] = [];
  const allCanonicalModules: any[] = [];
  const allCanonicalLessons: any[] = [];

  for (const doc of coursesSnap.docs) {
    const data = doc.data();
    const docSizeEstimate = JSON.stringify(data).length;
    const hasEmbeddedModules = Array.isArray(data.modules) && data.modules.length > 0;
    const hasEmbeddedTopics = Array.isArray(data.modules) && data.modules.some((m: any) => Array.isArray(m?.topics) && m.topics.length > 0);
    const hasEmbeddedSyllabus = Array.isArray(data.syllabus) && data.syllabus.length > 0;

    // Check canonical subcollection modules: courses/{id}/modules
    const subModulesSnap = await db.collection('courses').doc(doc.id).collection('modules').get().catch(() => ({ size: 0, docs: [] } as any));
    
    let subLessonsCount = 0;
    for (const modDoc of subModulesSnap.docs) {
      const modData = modDoc.data();
      allCanonicalModules.push({
        courseId: doc.id,
        moduleId: modDoc.id,
        title: modData.title,
        orderIndex: modData.orderIndex ?? modData.order,
      });

      const subLessonsSnap = await db
        .collection('courses')
        .doc(doc.id)
        .collection('modules')
        .doc(modDoc.id)
        .collection('lessons')
        .get()
        .catch(() => ({ size: 0, docs: [] } as any));
      
      subLessonsCount += subLessonsSnap.size;
      for (const lesDoc of subLessonsSnap.docs) {
        const lesData = lesDoc.data();
        allCanonicalLessons.push({
          courseId: doc.id,
          moduleId: modDoc.id,
          lessonId: lesDoc.id,
          title: lesData.title,
          orderIndex: lesData.orderIndex ?? lesData.order,
          hasContent: Boolean(lesData.content),
          contentSize: (lesData.content || '').length,
        });
      }
    }

    // Check top-level modules for this course
    const topModulesSnap = await modulesCollection().where('courseId', '==', doc.id).get().catch(() => ({ size: 0, docs: [] } as any));

    coursesReport.push({
      courseId: doc.id,
      title: data.title || 'Untitled',
      docSizeBytes: docSizeEstimate,
      embeddedModulesCount: data.modules?.length || 0,
      embeddedSyllabusCount: data.syllabus?.length || 0,
      hasEmbeddedTopics: Boolean(hasEmbeddedTopics),
      canonicalModulesCount: subModulesSnap.size,
      canonicalLessonsCount: subLessonsCount,
      topLevelModulesCount: topModulesSnap.size,
    });
  }

  console.table(coursesReport);

  // 2. Inspect root 'modules' collection
  const topModulesSnap = await modulesCollection().get();
  console.log(`\nFound ${topModulesSnap.size} documents in top-level 'modules' collection.`);

  // 3. Inspect root 'lessons' collection
  const topLessonsSnap = await lessonsCollection().get();
  console.log(`Found ${topLessonsSnap.size} documents in top-level 'lessons' collection.`);

  // Check for other collections: course_modules, course_lessons
  const courseModulesSnap = await db.collection('course_modules').get().catch(() => ({ size: 0 } as any));
  const courseLessonsSnap = await db.collection('course_lessons').get().catch(() => ({ size: 0 } as any));
  console.log(`Found ${courseModulesSnap.size} documents in 'course_modules' collection.`);
  console.log(`Found ${courseLessonsSnap.size} documents in 'course_lessons' collection.`);

  console.log('\n=== CANONICAL COVERAGE SUMMARY ===');
  console.log(`Total Canonical Modules: ${allCanonicalModules.length}`);
  console.log(`Total Canonical Lessons: ${allCanonicalLessons.length}`);

  process.exit(0);
}

inspectCourseHierarchy().catch((err) => {
  console.error('Error during inspection:', err);
  process.exit(1);
});
