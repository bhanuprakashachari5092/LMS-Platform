import React from 'react';
import { renderToString } from 'react-dom/server';
import { LmsCourseRenderer } from '../components/learning/LmsCourseRenderer';

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

const sampleContent = `
# Module 1: Introduction to Python & Basics

===== PDF PAGE 6 =====
1.1 What is Python?
Python is a high-level, general-purpose programming language.

Example: print("Hello World")
print("Hello World")

● Option 1
● Option 2

Note: This is an important note.
`;

function test() {
  try {
    console.log('Starting renderToString test...');
    const html = renderToString(
      React.createElement(LmsCourseRenderer, {
        content: sampleContent,
        isNightMode: true,
        courseId: 'python-through-oops-course-id'
      })
    );
    console.log('Render successful! Length of HTML:', html.length);
    console.log('HTML preview:', html.slice(0, 500));
  } catch (err: any) {
    console.error('Render failed with error:', err);
  }
}

test();
