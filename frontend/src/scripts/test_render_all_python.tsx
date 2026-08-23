import React from 'react';
import { renderToString } from 'react-dom/server';
import { LmsCourseRenderer } from '../components/learning/LmsCourseRenderer';
import { pythonCourseModules } from '../data/pythonCourseFullData';

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

function testAllModules() {
  console.log(`Starting LmsCourseRenderer test on all ${pythonCourseModules.length} default Python modules...`);
  
  pythonCourseModules.forEach((mod, index) => {
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
          courseId: 'python-through-oops-course-id'
        })
      );
      console.log(`[Success] Module ${modNum}: "${mod.title}" rendered successfully. HTML length: ${html.length}`);
    } catch (err: any) {
      console.error(`[Error] Module ${modNum}: "${mod.title}" failed to render!`, err);
    }
  });
}

testAllModules();
