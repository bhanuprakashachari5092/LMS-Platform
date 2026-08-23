import { db } from '../firebase';

async function listAllCourses() {
  console.log('Querying all courses in Firestore...');
  if (!db) {
    console.error('Firebase DB not initialized');
    return;
  }
  const snap = await db.collection('courses').get();
  console.log(`Total courses found: ${snap.size}`);
  snap.forEach(doc => {
    console.log(`- ID: ${doc.id}, Title: ${doc.data().title}, Slug: ${doc.data().slug}`);
  });
}

listAllCourses();
