import { db } from '../firebase';

async function checkLinuxCourse() {
  console.log('Checking Linux course in Firestore...');
  if (!db) {
    console.error('Firebase DB not initialized');
    return;
  }
  const courseDoc = await db.collection('courses').doc('course_linux_101').get();
  if (courseDoc.exists) {
    console.log('Linux Course Doc Found!');
    console.log(JSON.stringify(courseDoc.data(), null, 2).substring(0, 1000));
  } else {
    console.log('Linux Course Doc course_linux_101 NOT found in courses collection!');
  }
}

checkLinuxCourse();
