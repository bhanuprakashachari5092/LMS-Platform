import fs from 'fs';
import path from 'path';
import { db } from '../src/firebase';
import { coursesCollection, modulesCollection, lessonsCollection } from '../src/firebase/collections';

export async function backupCourseContent(): Promise<string> {
  console.log('📦 Starting full Firestore course content backup...');

  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `courses_backup_${timestamp}.json`);

  const coursesSnap = await coursesCollection().get();
  const backupData: {
    timestamp: string;
    coursesCount: number;
    courses: any[];
  } = {
    timestamp: new Date().toISOString(),
    coursesCount: coursesSnap.size,
    courses: [],
  };

  for (const courseDoc of coursesSnap.docs) {
    const courseId = courseDoc.id;
    const courseRawData = courseDoc.data();

    // Fetch canonical modules: courses/{id}/modules
    const canonicalModulesSnap = await db.collection('courses').doc(courseId).collection('modules').get().catch(() => ({ docs: [] } as any));
    const canonicalModules = [];

    for (const modDoc of canonicalModulesSnap.docs) {
      const modData = modDoc.data();
      // Fetch canonical lessons: courses/{id}/modules/{mId}/lessons
      const canonicalLessonsSnap = await db
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(modDoc.id)
        .collection('lessons')
        .get()
        .catch(() => ({ docs: [] } as any));

      const canonicalLessons = canonicalLessonsSnap.docs.map((lDoc: any) => ({
        id: lDoc.id,
        ...lDoc.data(),
      }));

      canonicalModules.push({
        id: modDoc.id,
        ...modData,
        lessons: canonicalLessons,
      });
    }

    // Fetch top-level fallback modules for this course
    const topModulesSnap = await modulesCollection().where('courseId', '==', courseId).get().catch(() => ({ docs: [] } as any));
    const topModules = topModulesSnap.docs.map((m: any) => ({ id: m.id, ...m.data() }));

    backupData.courses.push({
      id: courseId,
      rootDocument: courseRawData,
      canonicalModules,
      topLevelModules: topModules,
    });
  }

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✅ Backup successfully saved to: ${backupFilePath} (${(fs.statSync(backupFilePath).size / 1024).toFixed(1)} KB)`);

  return backupFilePath;
}

if (process.argv[1]?.includes('backup-course-content')) {
  backupCourseContent()
    .then((filePath) => {
      console.log(`Backup completed: ${filePath}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Backup failed:', err);
      process.exit(1);
    });
}
