/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIRESTORE COURSE SEED SCRIPT — KaizenQ LMS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Populates the "courses" collection in Firestore with standardized course documents.
 *
 * How to run:
 *   Option A (via tsx/ts-node):
 *     npx tsx scripts/seedFirestoreCourses.ts
 *
 *   Option B (via backend npm script):
 *     cd backend && npx tsx ../scripts/seedFirestoreCourses.ts
 *
 * Prerequisites:
 *   - GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account JSON
 *     OR Firebase Admin default credentials configured.
 *   - Alternatively, use scripts/courses-template.json for manual console entry.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { generateSlug, type FirestoreCourseLevel } from '../shared/types/firestoreCourse';

/* ── Course Seed Input Interface ───────────────────────────────────────────── */
interface CourseSeedInput {
  id?: string;
  title: string;
  category: string;
  tags: string[];
  level: FirestoreCourseLevel;
  shortDescription: string;
  fullDescription: string;
  learningOutcomes: string[];
  thumbnailUrl: string;
  durationHours: number;
  totalLessons: number;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
}

/* ── 7 Production Seed Courses ─────────────────────────────────────────────── */
const SEED_COURSES: CourseSeedInput[] = [
  {
    id: 'linux-systems-administration-mastery',
    title: 'Linux Systems & Administration Mastery',
    category: 'Linux & Systems',
    tags: ['linux', 'sysadmin', 'bash', 'kernel', 'devops', 'security'],
    level: 'All Levels',
    shortDescription: 'Enterprise curriculum covering Linux Architecture, Kernel Mechanics, Permissions, Systemd, Bash Scripting, and SSH Security.',
    fullDescription: 'Welcome to Linux Systems & Administration Mastery! Linux powers modern cloud infrastructure, supercomputers, and enterprise AI clusters. In this comprehensive production-ready track, you will explore Linux Kernel mechanics, master file system hierarchy standards (FHS), manage systemd background daemons, automate workflows via Bash scripts, and harden network security using SSH and host firewalls.',
    learningOutcomes: [
      'Understand Monolithic Kernel architecture, LKMs, and System Call execution',
      'Manage User & Group security permissions using octal notation and ACLs',
      'Control system daemons using systemctl and inspect binary logs with journalctl',
      'Write modular Bash automation scripts with control loops and positional arguments',
      'Harden remote SSH daemons and configure UFW firewall rules'
    ],
    thumbnailUrl: '/assets/images/linux_course_thumbnail.webp',
    durationHours: 32,
    totalLessons: 18,
    price: 0,
    currency: 'INR',
    rating: 5.0,
    reviewCount: 145,
    isPublished: true,
    isFeatured: true,
    order: 1,
  },
  {
    id: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    category: 'Development Tools',
    tags: ['git', 'github', 'devops', 'version-control', 'ci-cd'],
    level: 'All Levels',
    shortDescription: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, and CI/CD.',
    fullDescription: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, GitHub Actions, CI/CD, Codespaces, and Copilot. Designed for students, software engineers, DevOps specialists, and engineering managers.',
    learningOutcomes: [
      'Master version control concepts and the local Git commit cycle',
      'Create pull requests and manage collaborative branching strategies',
      'Build continuous integration pipelines using GitHub Actions',
      'Manage issues, milestones, and Kanban boards with GitHub Projects'
    ],
    thumbnailUrl: '/assets/images/github_course_banner.webp',
    durationHours: 20,
    totalLessons: 15,
    price: 0,
    currency: 'INR',
    rating: 5.0,
    reviewCount: 180,
    isPublished: true,
    isFeatured: true,
    order: 2,
  },
  {
    id: 'database-management-system',
    title: 'Database Management System (DBMS): Beginner to Advanced',
    category: 'Database',
    tags: ['database', 'dbms', 'sql', 'normalization', 'acid', 'indexing'],
    level: 'All Levels',
    shortDescription: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects.',
    fullDescription: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects. Master Relational Models, ER Diagrams, DDL/DML, indexing strategies, and ACID integrity.',
    learningOutcomes: [
      'Understand relational database design and normalization rules (1NF to BCNF)',
      'Write efficient SQL queries including joins, aggregations, and subqueries',
      'Handle database transactions, concurrency control, and ACID properties',
      'Build production database schemas for real-world application scenarios'
    ],
    thumbnailUrl: '/assets/images/dbms_course_thumbnail.png',
    durationHours: 25,
    totalLessons: 48,
    price: 0,
    currency: 'INR',
    rating: 5.0,
    reviewCount: 120,
    isPublished: true,
    isFeatured: true,
    order: 3,
  },
  {
    id: 'kubernetes-complete-course-beginner-to-advanced',
    title: 'Kubernetes Complete Course – Beginner to Advanced',
    category: 'DevOps & Cloud',
    tags: ['kubernetes', 'k8s', 'devops', 'docker', 'containers', 'helm'],
    level: 'All Levels',
    shortDescription: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning.',
    fullDescription: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning. Understand Kubernetes architecture, Pods, Deployments, Services, Networking, Storage, Security, Scheduling, Helm, CI/CD, and real-world application deployment.',
    learningOutcomes: [
      'Understand Kubernetes architecture, control plane, and worker node mechanics',
      'Deploy and scale applications using Pods, ReplicaSets, and Deployments',
      'Expose services with ClusterIP, NodePort, LoadBalancer, and Ingress routing',
      'Manage persistent storage with PersistentVolumes and Claims (PV/PVC)',
      'Secure clusters using ServiceAccounts, RBAC, and Security Contexts'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    durationHours: 30,
    totalLessons: 46,
    price: 0,
    currency: 'INR',
    rating: 5.0,
    reviewCount: 100,
    isPublished: true,
    isFeatured: true,
    order: 4,
  },
  {
    id: 'react-js-complete-course',
    title: 'React JS Complete Course',
    category: 'Web Development',
    tags: ['react', 'frontend', 'javascript', 'webdev', 'redux', 'tailwind'],
    level: 'All Levels',
    shortDescription: 'A complete beginner-to-advanced React JS course covering React fundamentals, environment setup, Hooks, Routing, APIs, Redux, and styling.',
    fullDescription: 'A complete beginner-to-advanced React JS course covering React fundamentals, development environment setup, JSX, components, props, state, hooks, events, forms, conditional rendering, routing, API integration, state management with Redux Toolkit, and interview preparation.',
    learningOutcomes: [
      'Understand Component-Based Architecture and the Virtual DOM lifecycle',
      'Use JSX syntax, props, conditional rendering, and custom hooks',
      'Coordinate single-page routing using React Router DOM',
      'Implement global state management via Context API and Redux Toolkit',
      'Build and deploy responsive real-time production applications'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    durationHours: 24,
    totalLessons: 220,
    price: 0,
    currency: 'INR',
    rating: 5.0,
    reviewCount: 160,
    isPublished: true,
    isFeatured: true,
    order: 5,
  },
  {
    id: 'c-programming',
    title: 'C Programming Mastery',
    category: 'Programming',
    tags: ['c', 'programming', 'basics', 'pointers', 'data-structures'],
    level: 'All Levels',
    shortDescription: 'Complete C Programming course covering fundamentals, programming concepts, advanced C, data structures, practical programs, interview preparation, and final revision.',
    fullDescription: 'Complete C Programming course covering fundamentals, compiler mechanics, memory management, pointers, structures, file I/O, linked lists, stacks, queues, and interview problem-solving.',
    learningOutcomes: [
      'Understand C fundamentals, compiler mechanics, variables, and data types',
      'Master control flow, loops, functions, and recursion in C',
      'Harness pointers, arrays, strings, and dynamic memory allocation (malloc/free)',
      'Implement fundamental data structures (lists, stacks, queues) and file handlers'
    ],
    thumbnailUrl: '/assets/images/c_course_thumbnail.webp',
    durationHours: 35,
    totalLessons: 15,
    price: 0,
    currency: 'INR',
    rating: 5.0,
    reviewCount: 180,
    isPublished: true,
    isFeatured: true,
    order: 6,
  },
  {
    id: 'python-through-oops',
    title: 'Python Through OOPs',
    category: 'Programming',
    tags: ['python', 'programming', 'basics', 'oop', 'object-oriented'],
    level: 'All Levels',
    shortDescription: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, intermediate concepts, and object-oriented programming.',
    fullDescription: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, collections, modules, exception handling, and deep dive into the four OOP pillars (Encapsulation, Inheritance, Polymorphism, Abstraction).',
    learningOutcomes: [
      'Understand Python fundamentals, variables, and built-in collection types',
      'Master control flow, conditional branching, loops, and modular functions',
      'Harness modules, packages, and exception handling architectures',
      'Implement OOP pillars (classes, inheritance, polymorphism, abstract base classes)'
    ],
    thumbnailUrl: '/assets/images/python_course_thumbnail.webp',
    durationHours: 35,
    totalLessons: 15,
    price: 0,
    currency: 'INR',
    rating: 5.0,
    reviewCount: 180,
    isPublished: true,
    isFeatured: true,
    order: 7,
  }
];

/* ── Seeder Logic ──────────────────────────────────────────────────────────── */
async function runSeeder() {
  console.log('🚀 [KAIZENQ] Starting Firestore Course Document Seeder...\n');

  // Initialize Firebase Admin if not already initialized
  if (admin.apps.length === 0) {
    // Try resolving service account from standard locations
    const possiblePaths = [
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      path.resolve(__dirname, '../backend/config/firebase-service-account.json'),
      path.resolve(__dirname, '../../shaivika-lms-ai-b9743e12511c.json'),
      'S:/shaivika-lms-ai-b9743e12511c.json',
    ].filter(Boolean) as string[];

    let initialized = false;
    for (const keyPath of possiblePaths) {
      if (fs.existsSync(keyPath)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id || 'shaivika-lms-ai',
          });
          console.log(`✅ Initialized Firebase Admin via key: ${keyPath}`);
          initialized = true;
          break;
        } catch (e) {
          // try next
        }
      }
    }

    if (!initialized) {
      // Try default credentials
      try {
        admin.initializeApp({
          projectId: 'shaivika-lms-ai',
        });
        console.log('ℹ️ Initialized Firebase Admin with default project credentials.');
      } catch (err) {
        console.error('❌ Could not initialize Firebase Admin. Please configure service account credentials.');
        console.log('\n📄 Alternatively, you can use scripts/courses-template.json for manual Firebase Console entry.');
        process.exit(1);
      }
    }
  }

  const db = admin.firestore();
  const coursesCollection = db.collection('courses');

  let successCount = 0;

  for (const course of SEED_COURSES) {
    const slug = course.id || generateSlug(course.title);
    const docRef = coursesCollection.doc(slug);

    const firestorePayload = {
      title: course.title,
      slug: slug,
      category: course.category,
      tags: course.tags,
      level: course.level,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      learningOutcomes: course.learningOutcomes,
      thumbnailUrl: course.thumbnailUrl,
      durationHours: course.durationHours,
      totalLessons: course.totalLessons,
      price: course.price,
      currency: course.currency,
      rating: course.rating,
      reviewCount: course.reviewCount,
      isPublished: course.isPublished,
      isFeatured: course.isFeatured,
      order: course.order,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await docRef.set(firestorePayload, { merge: true });
      console.log(`  ✓ Seeded course: [${slug}] "${course.title}" (Order: ${course.order})`);
      successCount++;
    } catch (err: any) {
      console.error(`  ✗ Failed to seed [${slug}]:`, err?.message || err);
    }
  }

  console.log(`\n🎉 Completed: ${successCount}/${SEED_COURSES.length} courses seeded successfully into collection "courses".`);
}

// Execute if called directly
if (require.main === module || process.argv[1]?.includes('seedFirestoreCourses')) {
  runSeeder().catch((err) => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });
}

export { SEED_COURSES, runSeeder };
