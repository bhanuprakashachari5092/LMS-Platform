import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChallengeArena } from '../components/learning/ChallengeArena';
import { getChallengeForLesson } from '../services/challengeEngine';

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

const allLessons = [
  {
    id: 'python-unit-1-notes',
    title: 'Module 1 - Complete Notes',
    description: 'Module 1 Complete Notes from PDF.',
    content: sampleContent,
    type: 'reading'
  }
];

function test() {
  try {
    console.log('Resolving challenge...');
    const challenge = getChallengeForLesson(
      'Python Through OOPs',
      'python-unit-1-notes',
      'Module 1 - Complete Notes',
      sampleContent,
      allLessons
    );
    console.log('Challenge resolved successfully:', challenge.title);
    
    console.log('Starting renderToString test for ChallengeArena...');
    const html = renderToString(
      React.createElement(ChallengeArena, {
        challenge,
        isCompleted: false,
        onToggleComplete: () => {},
        onNextLesson: () => {},
        hasNextLesson: false,
        onBackToMap: () => {},
        lessonContent: sampleContent,
        courseId: 'python-through-oops-course-id'
      })
    );
    console.log('ChallengeArena render successful! HTML length:', html.length);
  } catch (err: any) {
    console.error('ChallengeArena render failed with error:', err);
  }
}

test();
