import * as fs from 'fs';
import * as path from 'path';

function analyzeJson() {
  const jsonPath = path.join(__dirname, '../../../Linux_Complete_Course_Content.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found at:', jsonPath);
    return;
  }
  
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  
  console.log('Course ID:', data.courseId);
  console.log('Course Title:', data.courseTitle);
  console.log('Total Modules declared:', data.totalModules);
  console.log('Number of modules parsed:', data.modules?.length);
  
  if (Array.isArray(data.modules)) {
    data.modules.forEach((mod: any) => {
      console.log(`- Module ${mod.moduleNumber}: "${mod.title}" (ID: ${mod.moduleId})`);
      console.log(`  readingContent length: ${mod.readingContent?.length || 0}`);
    });
  }
}

analyzeJson();
