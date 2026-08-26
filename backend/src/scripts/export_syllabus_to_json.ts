import * as fs from 'fs';
import * as path from 'path';
import { cSyllabusNotes } from '../../data/syllabus_backup/cSyllabusData';
import { gitSyllabusNotes } from '../../data/syllabus_backup/gitSyllabusData';
import { javaSyllabusNotes } from '../../data/syllabus_backup/javaSyllabusData';
import { pythonSyllabusNotes } from '../../data/syllabus_backup/pythonSyllabusData';

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'c_syllabus_data.json'), JSON.stringify(cSyllabusNotes, null, 2), 'utf-8');
console.log('Saved c_syllabus_data.json');

fs.writeFileSync(path.join(dataDir, 'git_syllabus_data.json'), JSON.stringify(gitSyllabusNotes, null, 2), 'utf-8');
console.log('Saved git_syllabus_data.json');

fs.writeFileSync(path.join(dataDir, 'java_syllabus_data.json'), JSON.stringify(javaSyllabusNotes, null, 2), 'utf-8');
console.log('Saved java_syllabus_data.json');

fs.writeFileSync(path.join(dataDir, 'python_syllabus_data.json'), JSON.stringify(pythonSyllabusNotes, null, 2), 'utf-8');
console.log('Saved python_syllabus_data.json');

console.log('All syllabus data exported to backend/data JSON successfully.');
