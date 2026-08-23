import React from 'react';
import { renderToString } from 'react-dom/server';
import { LmsCourseRenderer } from '../components/learning/LmsCourseRenderer';
import { linuxCourseModules } from '../data/linuxCourseFullData';

// Mock window globals for SSR/Node execution
(global as any).window = {
  matchMedia: () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
  location: {
    origin: 'http://localhost:3000'
  }
};

function testAllLinuxModules() {
  console.log(`Starting LmsCourseRenderer validation on all ${linuxCourseModules.length} Linux modules...\n`);
  
  const modulesToCheck = [1, 2, 5, 10, 14, 15];

  linuxCourseModules.forEach((mod, index) => {
    const modNum = index + 1;
    const unit = mod.topics?.[0]?.learningUnits?.[0];
    const content = unit?.readingContent || '';
    
    if (!content) {
      console.warn(`[Warning] Module ${modNum} has empty or undefined readingContent!`);
      return;
    }
    
    try {
      const html = renderToString(
        React.createElement(LmsCourseRenderer, {
          content,
          isNightMode: true,
          courseId: 'course_linux_101'
        })
      );
      
      console.log(`[Success] Module ${modNum}: "${mod.title}" rendered successfully. HTML length: ${html.length}`);
      
      // Perform structural assertions for required modules
      if (modulesToCheck.includes(modNum)) {
        console.log(`  -> Verification for Module ${modNum}:`);
        
        // 1. Heading check
        const hasHeading = html.includes('font-black text-primary tracking-tight uppercase');
        console.log(`     - Heading Highlighted: ${hasHeading ? 'PASS' : 'FAIL'}`);
        if (!hasHeading) { process.exit(1); }
        
        // 2. Paragraph check
        const hasParagraph = html.includes('<p class="text-sm sm:text-base leading-relaxed my-3');
        console.log(`     - Paragraphs Formatted: ${hasParagraph ? 'PASS' : 'FAIL'}`);
        if (!hasParagraph) { process.exit(1); }
        
        // 3. Bullets check (check circle / bullets)
        if (modNum !== 15) {
          const hasBullets = html.includes('CheckCircle2') || html.includes('❌') || html.includes('●') || html.includes('✔');
          console.log(`     - Bullets/List Formatted: ${hasBullets ? 'PASS' : 'FAIL'}`);
          if (!hasBullets) { process.exit(1); }
        }
        
        // 4. Code Blocks/Commands check
        const hasCodeBlock = html.includes('CodeBlock') || html.includes('<pre') || html.includes('font-mono');
        console.log(`     - Commands/Code formatted: ${hasCodeBlock ? 'PASS' : 'FAIL'}`);
        if (!hasCodeBlock) { process.exit(1); }
        
        // 5. Flowchart check
        if (modNum === 2 || modNum === 10) {
          const hasFlowchart = html.includes('Flowchart Path') || html.includes('FLOW COMPLETE');
          console.log(`     - Flowcharts/Diagrams: ${hasFlowchart ? 'PASS' : 'FAIL'}`);
          if (!hasFlowchart) { process.exit(1); }
        }
        
        // 6. Tables check
        if (modNum === 1 || modNum === 2 || modNum === 5 || modNum === 10 || modNum === 14) {
          const hasTable = html.includes('<table') || html.includes('border-slate-900') || html.includes('grid') || html.includes('flex');
          console.log(`     - Tables: ${hasTable ? 'PASS' : 'FAIL'}`);
          if (!hasTable) { process.exit(1); }
        }
        
        // 7. Q&A check
        if (modNum === 2 || modNum === 5 || modNum === 10 || modNum === 14 || modNum === 15) {
          const hasQA = html.includes('QuestionCard') || html.includes('❓');
          console.log(`     - Interview Q&A Cards: ${hasQA ? 'PASS' : 'FAIL'}`);
          if (!hasQA) { process.exit(1); }
        }
      }
    } catch (err: any) {
      console.error(`[Error] Module ${modNum}: "${mod.title}" failed to render!`, err);
      process.exit(1);
    }
  });

  console.log('\nALL RENDER VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

testAllLinuxModules();
