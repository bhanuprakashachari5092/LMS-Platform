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
      name: 'Node.js Backend Development Notes.pdf',
      description: 'Comprehensive Node.js & Express reference guide.',
      category: 'PDF',
      fileSize: '4.8 MB',
      downloadPermission: true,
      url: '/nodejs-complete-notes.pdf'
    }
  ]
});

const nodeSyllabusNotes: Record<number, string> = {
  1: `# Module 1: Introduction to Node.js & V8 Engine

## Overview
Node.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. Created by Ryan Dahl in 2009, Node.js enables developers to run JavaScript outside the browser to build scalable, high-performance network applications.

## Learning Objectives
- Understand the architecture of the V8 JavaScript engine and libuv C library.
- Understand single-threaded non-blocking asynchronous event-driven I/O.
- Run JavaScript scripts via Node REPL and execute CLI files.

## Concept: Node.js Architecture
\`\`\`text
┌─────────────────────────────────────────────────────────────┐
│                       Node.js Application                   │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │            Node.js Core API (fs, http, crypto)       │  │
│   └──────────────────────────┬───────────────────────────┘  │
│                              ▼                              │
│   ┌──────────────────────────┬───────────────────────────┐  │
│   │     V8 JavaScript Engine │      libuv C++ Library    │  │
│   │  (JS Execution & JIT)    │ (Event Loop & Thread Pool)│  │
│   └──────────────────────────┴───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

> 💡 **Tip:** Node.js executes CPU-light, I/O-heavy workloads (REST APIs, microservices, websockets) with extreme memory efficiency compared to multi-threaded server architectures.

> 📌 **Note:** While JavaScript executes on a single thread, libuv maintains a background C++ Thread Pool (default 4 threads) for intensive tasks like file system access and cryptography.

## Example
\`\`\`javascript
// Check Node.js runtime process details
console.log('Node.js Version:', process.version);
console.log('Architecture:', process.arch);
console.log('Platform:', process.platform);
console.log('Current Memory Usage:', process.memoryUsage());
\`\`\`
`,

  2: `# Module 2: Node Modules, NPM & File System

## Overview
Modular code design is central to Node.js. Node supports both the classic CommonJS module system (\`require\` / \`module.exports\`) and modern ES Modules (\`import\` / \`export\`). The built-in \`fs\` and \`path\` modules provide robust file storage manipulation.

## Learning Objectives
- Understand CommonJS vs ES Modules in Node.js.
- Work with \`package.json\`, semantic versioning, and \`npm\` package management.
- Perform synchronous and asynchronous file operations with the \`fs/promises\` module.
- Resolve cross-platform file paths using the \`path\` module.

## Example: Asynchronous File I/O
\`\`\`javascript
const fs = require('fs/promises');
const path = require('path');

async function manageCourseData() {
  const filePath = path.join(__dirname, 'data', 'courses.json');
  try {
    // 1. Read JSON file
    const rawData = await fs.readFile(filePath, 'utf8');
    const courses = JSON.parse(rawData);
    console.log('Total Courses:', courses.length);

    // 2. Append new course
    courses.push({ id: 'node-101', title: 'Node.js Backend Mastery' });
    await fs.writeFile(filePath, JSON.stringify(courses, null, 2), 'utf8');
    console.log('Successfully updated course database file.');
  } catch (error) {
    console.error('File operation error:', error.message);
  }
}
\`\`\`

> 💡 **Tip:** Always use \`fs/promises\` and \`path.join()\` instead of hardcoding OS path separators (\`/\` or \`\\\`).
`,

  3: `# Module 3: Asynchronous Programming & Event Loop

## Overview
Mastering the 6 phases of the Node.js Event Loop is critical to diagnosing performance bottlenecks and concurrency deadlocks.

## Learning Objectives
- Master the 6 phases of the libuv Event Loop: Timers, Pending Callbacks, Idle/Prepare, Poll, Check (\`setImmediate\`), and Close Callbacks.
- Understand \`process.nextTick()\` vs \`setImmediate()\` vs \`setTimeout()\`.
- Build custom event-driven architectures with \`EventEmitter\`.

## Concept: Event Loop Sequence
\`\`\`text
   ┌───────────────────────┐
┌─>│        timers         │  (setTimeout, setInterval)
│  └──────────┬────────────┘
│  ┌──────────▼────────────┐
│  │    pending callbacks  │  (I/O callbacks deferred)
│  └──────────┬────────────┘
│  ┌──────────▼────────────┐
│  │      poll phase       │  (retrieve new I/O events)
│  └──────────┬────────────┘
│  ┌──────────▼────────────┐
│  │      check phase      │  (setImmediate callbacks)
│  └──────────┬────────────┘
│  ┌──────────▼────────────┐
└──│    close callbacks    │  (socket.on('close'))
   └───────────────────────┘
\`\`\`

> 📌 **Note:** \`process.nextTick()\` executes immediately after the current operation finishes, before the Event Loop continues to the next phase.
`,

  4: `# Module 4: Express.js Framework & Routing

## Overview
Express.js is the standard de-facto minimalist web framework for Node.js. It provides lightweight routing, parameter parsing, and extensible middleware pipelines.

## Learning Objectives
- Initialize Express server applications and configure listening ports.
- Define HTTP route handlers for \`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, and \`DELETE\`.
- Extract route parameters (\`req.params\`), query strings (\`req.query\`), and JSON request bodies (\`req.body\`).

## Example: REST Route Controller
\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json()); // Body parser

const courses = [
  { id: '1', title: 'C Programming', level: 'Beginner' },
  { id: '2', title: 'Node.js Backend', level: 'Intermediate' }
];

// GET /api/courses?level=Beginner
app.get('/api/courses', (req, res) => {
  const { level } = req.query;
  const filtered = level ? courses.filter(c => c.level === level) : courses;
  res.json({ success: true, count: filtered.length, data: filtered });
});

// GET /api/courses/:id
app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  res.json({ success: true, data: course });
});
\`\`\`
`,

  5: `# Module 5: Middleware & Request Processing

## Overview
Middleware functions have access to the request object (\`req\`), the response object (\`res\`), and the \`next\` middleware function in the application’s request-response cycle.

## Learning Objectives
- Understand application-level, router-level, error-handling, and third-party middleware.
- Create request logging, timing, and payload sanitation middleware.
- Understand the role of the \`next()\` function and how errors propagate.

## Example
\`\`\`javascript
// Custom Request Timing Logger Middleware
const requestTimer = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(\`[\${req.method}] \${req.originalUrl} - \${res.statusCode} (\${duration}ms)\`);
  });
  next();
};

app.use(requestTimer);
\`\`\`

> 💡 **Tip:** Always call \`next()\` inside your custom middleware; otherwise, the client request will hang indefinitely!
`,

  6: `# Module 6: RESTful API Design & Validation

## Overview
Designing clean, RESTful APIs adhering to Richardson Maturity Model standards ensures interoperability, consistency, and security.

## Learning Objectives
- Use standard HTTP status codes (\`200 OK\`, \`201 Created\`, \`400 Bad Request\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`, \`500 Internal Server Error\`).
- Implement schema validation using Zod or Joi to reject malformed payloads before processing.
- Design consistent JSON API envelope responses.

## Example: Zod Validation Middleware
\`\`\`javascript
const { z } = require('zod');

const CourseSchema = z.object({
  title: z.string().min(3).max(100),
  durationHours: z.number().positive(),
  category: z.enum(['Programming', 'Web Development', 'Backend Development', 'Database'])
});

const validateCourse = (req, res, next) => {
  const result = CourseSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.format()
    });
  }
  req.validatedBody = result.data;
  next();
};
\`\`\`
`,

  7: `# Module 7: Database Integration (SQL & MongoDB)

## Overview
Node.js seamlessly connects to relational databases (PostgreSQL/MySQL) via Knex/Prisma ORMs and NoSQL document stores (MongoDB) via Mongoose.

## Learning Objectives
- Connect to database pools safely with retry logic.
- Perform CRUD operations with parameterized queries to prevent SQL Injection.
- Implement pagination, sorting, and indexing on high-cardinality collections.

## Example: Parameterized Database Query
\`\`\`javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getPublishedCourses(category, limit = 10, offset = 0) {
  const query = \`
    SELECT id, title, category, duration, status 
    FROM courses 
    WHERE status = $1 AND ($2::text IS NULL OR category = $2)
    ORDER BY created_at DESC 
    LIMIT $3 OFFSET $4;
  \`;
  const values = ['Published', category || null, limit, offset];
  const { rows } = await pool.query(query, values);
  return rows;
}
\`\`\`

> ⚠️ **Warning:** Never concatenate unsanitized user input strings directly into SQL queries! Always use parameterized bindings (\`$1\`, \`$2\`).
`,

  8: `# Module 8: Authentication, Authorization & JWT

## Overview
Securing backend REST APIs requires stateless authentication with JSON Web Tokens (JWT) and cryptographic password hashing with bcrypt.

## Learning Objectives
- Hash and salt passwords using \`bcrypt\`.
- Generate and verify signed \`jsonwebtoken\` (JWT) access tokens.
- Build Role-Based Access Control (RBAC) middleware to protect admin routes.

## Example: JWT Auth Middleware
\`\`\`javascript
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { uid, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
  }
  next();
};
\`\`\`
`,

  9: `# Module 9: Error Handling, Logging & Security

## Overview
Production backends must handle uncaught exceptions, log structured metrics, and protect against common web vulnerabilities.

## Learning Objectives
- Implement Express centralized 4-parameter error-handling middleware \`(err, req, res, next)\`.
- Configure security headers with \`helmet\` and cross-origin resource sharing with \`cors\`.
- Mitigate Brute-Force and Denial of Service (DoS) attacks with \`express-rate-limit\`.
- Write structured JSON logs with \`winston\`.

## Example: Global Error Handler
\`\`\`javascript
// Global 4-argument error handling middleware
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(\`[ERROR] \${req.method} \${req.url} -> \${message}\`, {
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});
\`\`\`
`,

  10: `# Module 10: Full-Stack Production Project & Deployment

## Overview
Construct a full production-ready REST API backend with modular directory structure, PM2 process management, Docker containerization, and automated health checks.

## Learning Objectives
- Structure enterprise Node applications using Controller-Service-Repository architecture.
- Write production-grade health check endpoints (\`/health\`, \`/metrics\`).
- Manage background processes with PM2 (\`pm2 start\`, \`pm2 cluster mode\`).
- Implement Graceful Shutdown on \`SIGTERM\` and \`SIGINT\` signals.

## Example: Graceful Shutdown Pattern
\`\`\`javascript
const server = app.listen(process.env.PORT || 5000, () => {
  console.log('KaizenQ Node.js Server listening on port 5000');
});

const gracefulShutdown = (signal) => {
  console.log(\`\${signal} received. Closing HTTP server gracefully...\`);
  server.close(async () => {
    console.log('HTTP server closed. Terminating database connections...');
    await pool.end();
    console.log('All connections closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
\`\`\`
`
};

export const nodejsCourseModules: ModuleItem[] = [
  {
    id: 'node-mod-1',
    title: 'Module 1: Introduction to Node.js & V8 Engine',
    description: 'Node runtime, V8 architecture, REPL, and executing scripts.',
    duration: '2 Hours',
    topics: [
      {
        id: 'node-top-1',
        title: 'Node.js Fundamentals & Architecture',
        description: 'V8 engine, libuv, thread pool, and non-blocking I/O.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-1-notes',
            'Module 1 - Complete Notes',
            'Node.js Fundamentals & V8 Architecture.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[1]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-2',
    title: 'Module 2: Node Modules, NPM & File System',
    description: 'CommonJS vs ES Modules, fs module, path, and package management.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-2',
        title: 'Modules & File I/O',
        description: 'File reading, writing, path resolution, and NPM workflows.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-2-notes',
            'Module 2 - Complete Notes',
            'Node Modules, NPM & File System I/O.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[2]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-3',
    title: 'Module 3: Asynchronous Programming & Event Loop',
    description: 'Event emitter, buffer, streams, and non-blocking I/O lifecycle.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-3',
        title: 'Event Loop & Streams',
        description: 'Phases of event loop, EventEmitter, and streams.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-3-notes',
            'Module 3 - Complete Notes',
            'Event Loop Mechanics & Asynchronous Architecture.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[3]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-4',
    title: 'Module 4: Express.js Framework & Routing',
    description: 'Express setup, routing, URL parameters, and query strings.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-4',
        title: 'Express Server & Routes',
        description: 'HTTP methods, parameters, and query parsing.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-4-notes',
            'Module 4 - Complete Notes',
            'Express.js Framework & Routing Architecture.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[4]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-5',
    title: 'Module 5: Middleware & Request Processing',
    description: 'Built-in, third-party, and custom middleware patterns.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-5',
        title: 'Middleware Pipelines',
        description: 'Creating custom logging, timing, and authentication middleware.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-5-notes',
            'Module 5 - Complete Notes',
            'Express Middleware & Request Processing Pipelines.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[5]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-6',
    title: 'Module 6: RESTful API Design & Validation',
    description: 'HTTP verbs, status codes, JSON responses, and input validation with Zod.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-6',
        title: 'REST Architecture & Zod',
        description: 'REST principles, status codes, and schema validation.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-6-notes',
            'Module 6 - Complete Notes',
            'REST API Design & Schema Validation.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[6]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-7',
    title: 'Module 7: Database Integration (SQL & MongoDB)',
    description: 'Connecting PostgreSQL and MongoDB, ORMs, and CRUD operations.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-7',
        title: 'Database Persistence',
        description: 'PostgreSQL pools, parameterized queries, and MongoDB schemas.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-7-notes',
            'Module 7 - Complete Notes',
            'Database Connections & Parameterized Queries.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[7]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-8',
    title: 'Module 8: Authentication, Authorization & JWT',
    description: 'Password hashing with bcrypt, JWT token generation, and protected routes.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-8',
        title: 'Security & Auth Middleware',
        description: 'JWT issuance, bcrypt salting, and role-based guards.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-8-notes',
            'Module 8 - Complete Notes',
            'JWT Authentication & RBAC Authorization.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[8]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-9',
    title: 'Module 9: Error Handling, Logging & Security',
    description: 'Global error handlers, Winston logging, CORS, Helmet, and rate limiting.',
    duration: '2 Hours',
    topics: [
      {
        id: 'node-top-9',
        title: 'Production Resilience & Hardening',
        description: 'Central error handlers, rate limiting, and security headers.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-9-notes',
            'Module 9 - Complete Notes',
            'Error Boundaries, Winston Logging & Security Hardening.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[9]
          )
        ]
      }
    ]
  },
  {
    id: 'node-mod-10',
    title: 'Module 10: Production Backend Project & Deployment',
    description: 'Building and deploying a production-ready REST API backend.',
    duration: '3 Hours',
    topics: [
      {
        id: 'node-top-10',
        title: 'Production Deployment & PM2',
        description: 'Graceful shutdown, PM2 clustering, and containerization.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'node-unit-10-notes',
            'Module 10 - Complete Notes',
            'Production Architecture & Graceful Shutdown.',
            '45 mins',
            'Reading',
            nodeSyllabusNotes[10]
          )
        ]
      }
    ]
  }
];
