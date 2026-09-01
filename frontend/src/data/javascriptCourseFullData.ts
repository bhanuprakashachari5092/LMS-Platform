import type { ModuleItem, LearningUnitItem } from '../contexts/CourseContext';

const createLesson = (
  id: string,
  title: string,
  desc: string,
  duration: string,
  type: 'Video' | 'Reading' | 'Assignment' | 'Quiz',
  readingContent: string,
  codeExamples?: Array<{ title: string; language: string; code: string; explanation?: string }>,
  keyPoints?: string[],
  practiceQuestions?: Array<{ question: string; answer: string; explanation?: string; difficulty?: 'Easy' | 'Medium' | 'Hard' }>,
  resourceLinks?: Array<{ title: string; url: string; description?: string }>
): LearningUnitItem => ({
  id,
  title,
  description: desc,
  duration,
  type,
  readingContent,
  practiceLabChallenge: undefined,
  codeExamples,
  keyPoints,
  practiceQuestions: practiceQuestions?.map((pq, idx) => ({ id: `pq-${id}-${idx}`, ...pq })),
  resourceLinks: resourceLinks?.map((rl, idx) => ({ id: `res-${id}-${idx}`, ...rl })),
  resources: [
    {
      id: `res-${id}-pdf-notes`,
      name: 'JavaScript Complete Notes.pdf',
      description: 'Comprehensive JavaScript textbook reference PDF.',
      category: 'PDF',
      fileSize: '4.2 MB',
      downloadPermission: true,
      url: '/javascript-complete-notes.pdf'
    }
  ]
});

const jsSyllabusNotes: Record<number, string> = {
  1: `# Module 1: JavaScript Fundamentals & Syntax

## Overview
JavaScript is the premier programming language of the modern web. Initially created by Brendan Eich at Netscape in 1995 to add interactivity to web pages, it has evolved via the ECMAScript standard (ES6+) into a versatile multi-paradigm language executed across browsers and server environments.

## Learning Objectives
- Understand the JavaScript runtime environment, the V8 execution engine, and Call Stack mechanics.
- Learn how to integrate JavaScript into HTML documents using inline, internal, and external \`<script>\` tags.
- Master basic syntax, tokens, comments, and browser DevTools debugging workflows.

## Concept & Execution Model
JavaScript is a **single-threaded, dynamically typed, interpreted/JIT-compiled language** with non-blocking event-driven concurrency.

\`\`\`text
┌─────────────────────────────────────────────────────────────┐
│                    JavaScript Runtime                       │
│                                                             │
│   ┌─────────────────────┐       ┌────────────────────────┐  │
│   │     Memory Heap     │       │       Call Stack       │  │
│   │ (Variable Storage)  │       │ (Function Executions)  │  │
│   └─────────────────────┘       └────────────────────────┘  │
│                                              │              │
│                                              ▼              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                   Web APIs / libuv                   │  │
│   │           (DOM, Timers, Fetch, File I/O)             │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

> 💡 **Tip:** Always use \`console.log()\`, \`console.table()\`, and \`console.time()\` inside browser DevTools (F12) to inspect data structures and measure execution benchmarks.

> 📌 **Note:** JavaScript is dynamically typed, meaning variable types are determined at runtime, and variables can hold values of different types over their lifecycle.

## Example
\`\`\`javascript
// 1. Logging and basic arithmetic
console.log("Hello, KaizenQ JavaScript Platform!");

// 2. Dynamic typing showcase
let runtimeVersion = 2026;
console.log("Type of runtimeVersion:", typeof runtimeVersion); // number

runtimeVersion = "ECMAScript 2026";
console.log("Updated Type:", typeof runtimeVersion);           // string
\`\`\`

## Common Mistakes & Pro Tips
- ⚠️ **Mistake**: Placing external \`<script>\` tags at the top of the \`<head>\` without \`defer\` or \`async\`, which blocks HTML parsing.
- 💡 **Pro Tip**: Use \`<script defer src="app.js"></script>\` to ensure the HTML document is fully parsed before script execution starts.
`,

  2: `# Module 2: Variables, Data Types & Operators

## Overview
Understanding memory storage and type systems is fundamental to writing defect-free JavaScript. Modern JavaScript provides three variable declaration keywords (\`let\`, \`const\`, \`var\`) and two categories of data types: Primitives and Reference Objects.

## Learning Objectives
- Understand the scoping differences and hoisting behaviors of \`let\`, \`const\`, and legacy \`var\`.
- Master JavaScript's 7 Primitive data types (\`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`, \`symbol\`, \`bigint\`) and the Reference \`Object\` type.
- Master arithmetic, logical, comparison, ternary, nullish coalescing (\`??\`), and optional chaining (\`?.\`) operators.

## Concept: Scope and Hoisting
- \`var\`: Function-scoped, hoisted and initialized to \`undefined\`.
- \`let\`: Block-scoped, hoisted into a Temporal Dead Zone (TDZ) until evaluation.
- \`const\`: Block-scoped, immutable variable binding (cannot be reassigned).

> 💡 **Tip:** Default to \`const\` for all variable bindings. Only use \`let\` when you know the variable value needs to be reassigned. Avoid \`var\` in modern codebases.

> 📌 **Note:** Strict equality (\`===\`) compares both value and type without coercion, whereas loose equality (\`==\`) coerces types before comparing. Always prefer \`===\`.

## Example
\`\`\`javascript
const platformName = "KaizenQ LMS";
let activeStudents = 1420;

// Type comparison
console.log(5 == "5");   // true (type coercion)
console.log(5 === "5");  // false (strict equality)

// Nullish Coalescing (??) vs Logical OR (||)
const userScore = 0;
const displayScoreOR = userScore || 100;     // 100 (falsy check treats 0 as false)
const displayScoreNC = userScore ?? 100;     // 0   (nullish check only targets null/undefined)

console.log({ displayScoreOR, displayScoreNC });
\`\`\`
`,

  3: `# Module 3: Control Flow & Functions

## Overview
Control flow structures direct code execution based on conditional checks and loops. Functions serve as the foundational building blocks of modular, maintainable JavaScript applications.

## Learning Objectives
- Master branching statements: \`if / else if / else\` and multi-way \`switch\`.
- Understand iterative loops: \`for\`, \`while\`, \`do...while\`, \`for...of\` (iterables), and \`for...in\` (object keys).
- Write function declarations, function expressions, arrow functions, and higher-order functions.
- Understand lexical scope, closures, and default parameters.

## Concept: Arrow Functions vs Traditional Functions
Arrow functions (\`() => {}\`) provide concise syntax and inherit the \`this\` value lexically from their enclosing execution context, unlike regular functions which bind their own \`this\`.

> 💡 **Tip:** Use \`for...of\` when iterating over Array values and strings, and \`for...in\` when iterating over Object property keys.

> 📌 **Note:** A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables even after the outer function has closed.

## Example
\`\`\`javascript
// Higher-Order Function returning a Closure
function createCounter(initialValue = 0) {
  let count = initialValue;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.getValue());  // 12
\`\`\`
`,

  4: `# Module 4: Arrays & Object Manipulation

## Overview
Arrays and Objects are the primary reference data structures in JavaScript used to store ordered sequences and key-value collections. Mastering functional array methods and modern object manipulation enables clean, immutable data transformations.

## Learning Objectives
- Use essential Array transformation methods: \`map()\`, \`filter()\`, \`reduce()\`, \`find()\`, \`some()\`, and \`every()\`.
- Master object destructuring, array destructuring, and the spread/rest operator (\`...\`).
- Understand Object utilities: \`Object.keys()\`, \`Object.values()\`, \`Object.entries()\`, and \`Object.freeze()\`.

## Concept: Immutable Array Transformations
Functional array methods like \`map\` and \`filter\` return brand-new arrays rather than mutating the original array in place, making state tracking predictable.

\`\`\`javascript
const courses = [
  { id: 1, title: 'JavaScript', hours: 25, price: 0 },
  { id: 2, title: 'Python', hours: 35, price: 0 },
  { id: 3, title: 'Kubernetes', hours: 30, price: 0 }
];

// Total learning hours using reduce
const totalHours = courses.reduce((acc, course) => acc + course.hours, 0);
console.log(\`Total Catalog Hours: \${totalHours}\`); // 90

// Filter and Map in a clean pipeline
const titles = courses
  .filter(c => c.hours >= 25)
  .map(c => c.title.toUpperCase());

console.log(titles); // ['JAVASCRIPT', 'PYTHON', 'KUBERNETES']
\`\`\`

> 💡 **Tip:** Use object and array destructuring with default values to write self-documenting function signatures.
`,

  5: `# Module 5: DOM Manipulation & Browser Events

## Overview
The Document Object Model (DOM) is a tree-like object representation of an HTML document constructed by the browser engine. JavaScript interacts with the DOM to dynamically update element styles, content, and listen to user input events.

## Learning Objectives
- Select elements efficiently using \`querySelector()\`, \`querySelectorAll()\`, and \`getElementById()\`.
- Modify DOM elements, attributes, and CSS class lists with \`classList.add()\`, \`classList.toggle()\`.
- Master event handling with \`addEventListener()\`, understanding Event Bubbling, Event Capturing, and Event Delegation.

## Concept: Event Delegation
Instead of attaching individual click listeners to hundreds of list items, attach a single listener to their common parent container and inspect \`event.target\`.

\`\`\`html
<ul id="course-list">
  <li data-course="js">JavaScript</li>
  <li data-course="python">Python</li>
  <li data-course="react">React</li>
</ul>

<script>
  const list = document.querySelector('#course-list');
  list.addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'LI') {
      console.log('Selected Course:', e.target.dataset.course);
    }
  });
</script>
\`\`\`

> 💡 **Tip:** Always use \`event.preventDefault()\` on form submission events to prevent full-page browser reloads.
`,

  6: `# Module 6: Asynchronous JavaScript, Promises & Fetch API

## Overview
JavaScript is single-threaded, but it achieves non-blocking asynchronous operations through the Browser / libuv Event Loop. Network calls, file reads, and timers execute asynchronously in the background.

## Learning Objectives
- Understand the Event Loop, Call Stack, Task Queue (Macrotasks), and Microtask Queue (Promises).
- Create and handle ES6 \`Promise\` objects (\`resolve\`, \`reject\`, \`then\`, \`catch\`, \`finally\`).
- Master \`async / await\` syntax with robust \`try / catch\` error boundaries.
- Perform HTTP REST API requests using the native \`fetch()\` API.

## Concept: Microtasks vs Macrotasks
Promise callbacks in the Microtask queue always execute before setTimeout/setInterval callbacks in the Task queue.

\`\`\`javascript
async function fetchCourseData(courseId) {
  try {
    const response = await fetch(\`https://api.kaizenq.in/courses/\${courseId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP Error: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load course details:', error.message);
    throw error;
  }
}
\`\`\`

> 💡 **Tip:** Use \`Promise.all()\` to execute independent API requests in parallel rather than chaining multiple \`await\` calls sequentially.
`,

  7: `# Module 7: Modern ES6+ Features & Modules

## Overview
Since ECMAScript 2015 (ES6), JavaScript has gained major language enhancements that make code more expressive, safer, and modular.

## Learning Objectives
- Understand ES Modules (\`import\` and \`export\`, default vs named exports).
- Master Optional Chaining (\`?.\`), Nullish Coalescing (\`??\`), and Logical Assignment operators (\`&&=\`, \`||=\`, \`??=\`).
- Harness Template Literals with embedded expressions and multi-line strings.
- Work with \`Set\` (unique values) and \`Map\` (keyed collections).

## Example
\`\`\`javascript
// mathUtils.js
export const add = (a, b) => a + b;
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { add } from './mathUtils.js';

const studentProfile = {
  name: 'Alex',
  preferences: {
    theme: 'dark'
  }
};

// Safe deep property navigation with optional chaining
const fontSize = studentProfile?.preferences?.layout?.fontSize ?? 16;
console.log(\`Calculated Font Size: \${fontSize}px\`);
\`\`\`

> 📌 **Note:** ES Modules are statically analyzable, enabling modern bundlers (such as Vite and Rollup) to perform tree-shaking (dead code elimination).
`,

  8: `# Module 8: Object-Oriented JS & Prototypes

## Overview
Under the hood, JavaScript utilizes prototype-based inheritance. ES6 \`class\` syntax provides clean syntactic sugar over JavaScript's existing prototype mechanism.

## Learning Objectives
- Understand the Prototype Chain, \`prototype\`, and \`__proto__\`.
- Define classes using \`class\`, constructors, instance methods, and static methods.
- Master class inheritance using \`extends\` and \`super()\`.
- Implement private class fields (\`#privateField\`) and getters/setters.

## Example
\`\`\`javascript
class User {
  #passwordHash; // Private field

  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.#passwordHash = this.#hash(password);
  }

  #hash(pass) {
    return \`hashed_\${pass}_secure\`;
  }

  getDetails() {
    return \`Student: \${this.name} (\${this.email})\`;
  }
}

class Instructor extends User {
  constructor(name, email, password, domain) {
    super(name, email, password);
    this.domain = domain;
  }

  getDetails() {
    return \`\${super.getDetails()} - Specialist in \${this.domain}\`;
  }
}

const tutor = new Instructor('Banu Prakash', 'banu@kaizenq.in', 'secret', 'System Design');
console.log(tutor.getDetails());
\`\`\`
`,

  9: `# Module 9: Practical JavaScript Projects

## Overview
Apply all foundational concepts to construct real-world client-side applications including interactive calculators, task trackers, and live API-driven applications.

## Learning Objectives
- Build a persistent Todo / Kanban Application with LocalStorage persistence.
- Implement real-time search filtering, sorting, and pagination algorithms.
- Structure client-side JavaScript following modular MVC (Model-View-Controller) architecture.

## Example Project: LocalStorage Task Manager
\`\`\`javascript
class TaskStore {
  constructor(storageKey = 'kaizenq_tasks') {
    this.key = storageKey;
  }

  getTasks() {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : [];
  }

  addTask(taskTitle) {
    const tasks = this.getTasks();
    const newTask = { id: Date.now(), title: taskTitle, done: false };
    tasks.push(newTask);
    localStorage.setItem(this.key, JSON.stringify(tasks));
    return newTask;
  }

  toggleTask(taskId) {
    const tasks = this.getTasks().map(t => 
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    localStorage.setItem(this.key, JSON.stringify(tasks));
  }
}
\`\`\`
`,

  10: `# Module 10: JavaScript Interview Mastery & Best Practices

## Overview
Comprehensive review of advanced interview questions, memory management, garbage collection, and clean coding best practices.

## Learning Objectives
- Understand Hoisting, Temporal Dead Zone, Currying, and Debounce/Throttle functions.
- Master memory leaks prevention, garbage collection mark-and-sweep algorithm, and event loop microtask sequencing.
- Review top coding interview challenges and patterns.

## Concept: Debounce Implementation
\`\`\`javascript
function debounce(fn, delayMs = 300) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delayMs);
  };
}

const handleLiveSearch = debounce((query) => {
  console.log('Searching API for:', query);
}, 400);
\`\`\`

> 💡 **Tip:** In technical interviews, always clarify time and space complexity ($O(N)$ vs $O(1)$) before implementing array and object lookup operations.
`
};

export const javascriptCourseModules: ModuleItem[] = [
  {
    id: 'js-mod-1',
    title: 'Module 1: JavaScript Fundamentals & Syntax',
    description: 'JavaScript origins, V8 engine, browser DevTools, and runtime execution.',
    duration: '2 Hours',
    topics: [
      {
        id: 'js-top-1',
        title: 'JavaScript Introduction & Execution Model',
        description: 'V8 engine, Script tags, console debugging, and dynamic typing.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-1-notes',
            'Module 1 - Complete Notes',
            'JavaScript Fundamentals, Runtime & Syntax Overview.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[1]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-2',
    title: 'Module 2: Variables, Data Types & Operators',
    description: 'let, const, var, scoping, hoisting, primitives, and operators.',
    duration: '2 Hours',
    topics: [
      {
        id: 'js-top-2',
        title: 'Memory, Types & Operators',
        description: 'Primitives, reference objects, strict equality, and nullish coalescing.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-2-notes',
            'Module 2 - Complete Notes',
            'Variables, Scoping, Types & Operators.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[2]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-3',
    title: 'Module 3: Control Flow & Functions',
    description: 'Conditionals, loops, arrow functions, closures, and scope.',
    duration: '3 Hours',
    topics: [
      {
        id: 'js-top-3',
        title: 'Functions & Execution Control',
        description: 'Loops, Higher-order functions, arrow functions, and closures.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-3-notes',
            'Module 3 - Complete Notes',
            'Conditionals, Loops, Arrow Functions & Closures.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[3]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-4',
    title: 'Module 4: Arrays & Object Manipulation',
    description: 'map, filter, reduce, destructuring, spread, and object methods.',
    duration: '3 Hours',
    topics: [
      {
        id: 'js-top-4',
        title: 'Data Collections & Immutability',
        description: 'Functional array pipelines and modern object destructuring.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-4-notes',
            'Module 4 - Complete Notes',
            'Arrays, Functional Methods & Object Manipulation.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[4]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-5',
    title: 'Module 5: DOM & Browser Event Handling',
    description: 'DOM tree querying, classList manipulation, and event delegation.',
    duration: '3 Hours',
    topics: [
      {
        id: 'js-top-5',
        title: 'DOM Tree & Event Lifecycle',
        description: 'Selecting elements, adding listeners, bubbling, and delegation.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-5-notes',
            'Module 5 - Complete Notes',
            'DOM Manipulation & Event Handling.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[5]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-6',
    title: 'Module 6: Asynchronous JavaScript & Promises',
    description: 'Event loop, Promises, async/await, and Fetch API.',
    duration: '3 Hours',
    topics: [
      {
        id: 'js-top-6',
        title: 'Asynchronous Programming',
        description: 'Call stack, microtasks, Promise chaining, and fetch API.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-6-notes',
            'Module 6 - Complete Notes',
            'Async JavaScript, Promises & Fetch API.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[6]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-7',
    title: 'Module 7: Modern ES6+ Features & Modules',
    description: 'ES Modules, optional chaining, nullish coalescing, Map and Set.',
    duration: '2 Hours',
    topics: [
      {
        id: 'js-top-7',
        title: 'ES6+ Language Enhancements',
        description: 'Imports, exports, template literals, and modern collections.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-7-notes',
            'Module 7 - Complete Notes',
            'Modern ES6+ Syntax & ES Modules.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[7]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-8',
    title: 'Module 8: Object-Oriented JS & Prototypes',
    description: 'Prototypes, classes, inheritance, private fields, and getters/setters.',
    duration: '2 Hours',
    topics: [
      {
        id: 'js-top-8',
        title: 'Object-Oriented Programming in JS',
        description: 'Prototypes, classes, extends, super, and encapsulation.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-8-notes',
            'Module 8 - Complete Notes',
            'Prototypes, Classes & OOP Inheritance.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[8]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-9',
    title: 'Module 9: Practical JavaScript Projects',
    description: 'Building end-to-end interactive applications and state stores.',
    duration: '3 Hours',
    topics: [
      {
        id: 'js-top-9',
        title: 'Hands-on Application Building',
        description: 'LocalStorage task managers and client-side architecture.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-9-notes',
            'Module 9 - Complete Notes',
            'Practical Real-World JavaScript Projects.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[9]
          )
        ]
      }
    ]
  },
  {
    id: 'js-mod-10',
    title: 'Module 10: JavaScript Interview Mastery',
    description: 'Debounce, throttle, closures, memory leaks, and technical Q&A.',
    duration: '2 Hours',
    topics: [
      {
        id: 'js-top-10',
        title: 'Interview Preparation & Patterns',
        description: 'Advanced patterns, memory optimization, and interview algorithms.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'js-unit-10-notes',
            'Module 10 - Complete Notes',
            'JavaScript Interview Questions & Advanced Patterns.',
            '45 mins',
            'Reading',
            jsSyllabusNotes[10]
          )
        ]
      }
    ]
  }
];
