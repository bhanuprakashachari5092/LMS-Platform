import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  console.log('--- DIAGNOSING PYTHON THROUGH OOPS COURSE DOCUMENT ---');
  
  const courseId = 'python-through-oops-course-id';
  const doc = await db.collection('courses').doc(courseId).get();
  
  if (!doc.exists) {
    console.log(`Course document "${courseId}" does not exist in courses collection!`);
    process.exit(1);
  }
  
  const data = doc.data();
  console.log(`Course ID: ${doc.id}`);
  console.log(`Course Title: ${data?.title}`);
  
  const modules = data?.modules;
  if (!modules) {
    console.log('No nested "modules" field found in the course document.');
  } else {
    console.log(`Found nested "modules" field. Length: ${modules.length}`);
    if (modules.length > 0) {
      const m1 = modules[0];
      console.log(`Module 1: "${m1?.title}" (ID: ${m1?.id})`);
      const t1 = m1?.topics?.[0];
      console.log(`  Topic 1: "${t1?.title}" (ID: ${t1?.id})`);
      const u1 = t1?.learningUnits?.[0];
      console.log(`    Learning Unit 1.1: "${u1?.title}" (ID: ${u1?.id})`);
      console.log(`    Unit keys: ${Object.keys(u1 || {})}`);
      console.log(`    Unit readingContent length: ${u1?.readingContent?.length}`);
    }
  }
  
  // Check the lessons collection for a python lesson
  const lessonDoc = await db.collection('lessons').doc('python-unit-1-notes').get();
  if (lessonDoc.exists) {
    console.log(`Lesson 'python-unit-1-notes' exists! Content length: ${lessonDoc.data()?.content?.length}`);
  } else {
    console.log(`Lesson 'python-unit-1-notes' DOES NOT exist in lessons collection!`);
  }
  
  process.exit(0);
}

main();
