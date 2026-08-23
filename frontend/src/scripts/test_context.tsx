import React, { useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { CourseProvider, useCourses } from '../contexts/CourseContext';
import { AuthProvider } from '../contexts/AuthContext';

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
  },
  localStorage: {
    store: {} as Record<string, string>,
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, val: string) { this.store[key] = val; },
    removeItem(key: string) { delete this.store[key]; },
    clear() { this.store = {}; }
  }
};
(global as any).localStorage = (global as any).window.localStorage;

// Mock fetch
const mockCoursesResponse = {
  success: true,
  data: {
    courses: [
      {
        id: 'python-through-oops-course-id',
        title: 'Python Through OOPs',
        slug: 'python-through-oops',
        status: 'published',
        modules: [
          {
            id: 'python-mod-1',
            title: 'Module 1: Introduction to Python',
            topics: [
              {
                id: 'python-topic-1',
                title: 'Topic 1: Module 1 Content',
                learningUnits: [
                  {
                    id: 'python-unit-1-notes',
                    title: 'Module 1 - Complete Notes',
                    readingContent: 'FLIGHT_TEST_CONTENT_OF_MODULE_1_PYTHON',
                    type: 'Reading'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

(global as any).fetch = async (url: string) => {
  console.log(`Mock fetch called for URL: ${url}`);
  return {
    ok: true,
    json: async () => mockCoursesResponse
  } as any;
};

const TestComponent = () => {
  const { courses } = useCourses();
  
  useEffect(() => {
    console.log(`React Context Courses Count: ${courses.length}`);
    const python = courses.find(c => c.id === 'python-through-oops-course-id');
    if (python) {
      console.log('Found Python course in React State!');
      const m1 = python.modules?.[0];
      const u1 = m1?.topics?.[0]?.learningUnits?.[0];
      console.log(`Module 1 Title: ${m1?.title}`);
      console.log(`Unit 1 Title: ${u1?.title}`);
      console.log(`Unit 1 readingContent: ${u1?.readingContent}`);
    } else {
      console.log('Python course NOT found in React State!');
    }
  }, [courses]);

  return <div>Test</div>;
};

async function main() {
  console.log('Rendering CourseProvider inside AuthProvider...');
  renderToString(
    React.createElement(AuthProvider, {}, 
      React.createElement(CourseProvider, {}, 
        React.createElement(TestComponent)
      )
    )
  );

  // Wait 1 second to let async fetch/refreshCourses finish
  await new Promise(resolve => setTimeout(resolve, 1000));
}

main();
