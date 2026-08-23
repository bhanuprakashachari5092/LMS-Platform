import * as fs from 'fs';
import * as path from 'path';

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

function generateMockData() {
  const jsonPath = path.resolve(__dirname, '../../../Linux_Complete_Course_Content.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found at:', jsonPath);
    return;
  }
  
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  
  const modules = data.modules.map((m: any) => {
    const num = m.moduleNumber;
    const title = userRequestedTitles[num - 1] || m.title;
    
    // Extract first 200 chars for description
    const desc = m.readingContent.substring(0, 200).replace(/\n/g, ' ').trim() + '...';
    
    return {
      id: `linux-mod-${num}`,
      title: title,
      description: desc,
      duration: "4 Hours",
      topics: [
        {
          id: `linux-topic-${num}`,
          title: `${title} - Complete Notes`,
          description: `${title} Complete Notes.`,
          estimatedDuration: "4 Hours",
          learningUnits: [
            {
              id: `linux-unit-${num}-notes`,
              title: `${title} - Complete Notes`,
              description: `${title} Complete Notes.`,
              duration: "4 Hours",
              type: "Reading",
              readingContent: m.readingContent
            }
          ]
        }
      ]
    };
  });
  
  const outputPath = path.resolve(__dirname, '../../../frontend/src/data/linuxCourseFullData.ts');
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const fileContent = `import type { ModuleItem } from '@/contexts/CourseContext';\n\nexport const linuxCourseModules: ModuleItem[] = ${JSON.stringify(modules, null, 2)};\n`;
  
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log('Successfully generated linuxCourseFullData.ts at:', outputPath);
}

generateMockData();
