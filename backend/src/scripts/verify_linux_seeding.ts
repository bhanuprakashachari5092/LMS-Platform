import { db } from '../firebase';

async function verifySeeding() {
  console.log('Verifying Linux course seeding in Firestore...');
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }

  // 1. Check Course Document
  const courseDoc = await db.collection('courses').doc('course_linux_101').get();
  if (!courseDoc.exists) {
    console.error('FAIL: course_linux_101 doc does not exist!');
    process.exit(1);
  }
  const courseData = courseDoc.data()!;
  console.log(`Course Found: "${courseData.title}"`);
  console.log(`Modules Count declared: ${courseData.modulesCount}`);
  console.log(`Lessons Count declared: ${courseData.lessonsCount}`);
  
  const nestedModules = courseData.modules || [];
  console.log(`Nested modules length: ${nestedModules.length}`);
  if (nestedModules.length !== 15) {
    console.error(`FAIL: Nested modules length is ${nestedModules.length}, expected 15!`);
    process.exit(1);
  }

  // 2. Query Modules collection
  const modulesSnap = await db.collection('modules').where('courseId', '==', 'course_linux_101').get();
  console.log(`Firestore modules collection count: ${modulesSnap.size}`);
  if (modulesSnap.size !== 15) {
    console.error(`FAIL: Modules collection count is ${modulesSnap.size}, expected 15!`);
    process.exit(1);
  }

  // 3. Query Lessons collection
  const lessonsSnap = await db.collection('lessons').where('courseId', '==', 'course_linux_101').get();
  console.log(`Firestore lessons collection count: ${lessonsSnap.size}`);
  if (lessonsSnap.size !== 15) {
    console.error(`FAIL: Lessons collection count is ${lessonsSnap.size}, expected 15!`);
    process.exit(1);
  }

  // 4. Verify Module boundaries and content
  console.log('\nVerifying module boundaries and content...');
  
  const userRequestedTitles = [
    "Module 1 – Introduction to Linux",
    "Module 2 – Installing Linux",
    "Module 3 – Linux File System",
    "Module 4 – Linux File Management Commands",
    "Module 5 – File Permissions and Ownership",
    "Module 6 – Text Processing Commands",
    "Module 7 – Package Management",
    "Module 8 – Process Management",
    "Module 9 – Shell Scripting",
    "Module 10 – Networking in Linux",
    "Module 11 – Disk Management",
    "Module 12 – User & Group Management",
    "Module 13 – Linux Services & System Administration",
    "Module 14 – Linux Security & Best Practices",
    "Module 15 – Linux Interview Preparation & Projects"
  ];

  nestedModules.forEach((m: any, index: number) => {
    const num = index + 1;
    const expectedTitle = userRequestedTitles[index];
    if (m.title !== expectedTitle) {
      console.error(`FAIL: Module ${num} title is "${m.title}", expected "${expectedTitle}"!`);
      process.exit(1);
    }
    
    const topic = m.topics?.[0];
    const unit = topic?.learningUnits?.[0];
    if (!unit) {
      console.error(`FAIL: Module ${num} has no learning unit!`);
      process.exit(1);
    }
    
    const content = unit.readingContent || '';
    if (!content) {
      console.error(`FAIL: Module ${num} learning unit has empty readingContent!`);
      process.exit(1);
    }
    
    console.log(`- Module ${num}: "${m.title}" -> Content character count: ${content.length}`);
    
    // Check specific boundary constraints
    if (num === 1) {
      if (content.toLowerCase().includes('installing linux') || content.toLowerCase().includes('virtualbox')) {
        // Module 1 shouldn't contain Module 2's distinct headers
        if (content.includes('2.1 Introduction')) {
          console.error(`FAIL: Module 1 contains Module 2 content!`);
          process.exit(1);
        }
      }
    }
    
    if (num === 2) {
      if (content.toLowerCase().includes('absolute path') || content.toLowerCase().includes('relative path')) {
        if (content.includes('3.1 Introduction')) {
          console.error(`FAIL: Module 2 contains Module 3 content!`);
          process.exit(1);
        }
      }
    }
    
    // Check that Module 14 and 15 do not appear in earlier modules
    if (num < 14) {
      if (content.toLowerCase().includes('module 14') || content.toLowerCase().includes('module 15')) {
        // A simple text check: if it lists the TOC that is fine, but it shouldn't contain their full body texts
        if (content.includes('14.1 Introduction') || content.includes('15.1 Introduction')) {
          console.error(`FAIL: Module ${num} contains Module 14/15 content body!`);
          process.exit(1);
        }
      }
    }
  });

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

verifySeeding();
