import { db } from '../firebase';

interface LessonDefinition {
  id: string;
  title: string;
  order: number;
  moduleTitle: string;
  moduleId: string;
  duration: string;
  type: 'Reading' | 'Video' | 'Quiz' | 'Assignment';
  content: string;
}

interface ModuleDefinition {
  id: string;
  title: string;
  order: number;
  duration: string;
  description: string;
  lessons: LessonDefinition[];
}

interface CourseDefinition {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  level: string;
  shortDescription: string;
  fullDescription: string;
  learningOutcomes: string[];
  thumbnailUrl: string;
  durationHours: number;
  duration: string;
  order: number;
  modules: ModuleDefinition[];
}

// Calculate estimated reading time (~200 words per minute)
function calculateReadMinutes(markdownContent: string): number {
  if (!markdownContent) return 3;
  const wordCount = markdownContent.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(wordCount / 200));
}

// Markdown syntax validator
function validateMarkdown(content: string, lessonTitle: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!content || content.trim().length === 0) {
    issues.push(`Lesson "${lessonTitle}" has empty content.`);
    return { isValid: false, issues };
  }

  // Check balanced code block backticks (```)
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    issues.push(`Lesson "${lessonTitle}" has unbalanced triple backtick code fences (count: ${codeBlockMatches.length}).`);
  }

  // Check for proper headings
  if (!content.includes('# ') && !content.includes('## ') && !content.includes('### ')) {
    issues.push(`Lesson "${lessonTitle}" is missing standard markdown headings (# or ##).`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

function mapModules(rawModules: any[]): ModuleDefinition[] {
  return rawModules.map((m: any, mIdx: number) => ({
    id: m.id,
    title: m.title,
    order: mIdx + 1,
    duration: m.duration || '2 Hours',
    description: m.description || m.title,
    lessons: (m.topics || []).flatMap((t: any) =>
      (t.learningUnits || []).map((u: any, uIdx: number) => ({
        id: u.id,
        title: u.title,
        order: uIdx + 1,
        moduleTitle: m.title,
        moduleId: m.id,
        duration: u.duration || '20 mins',
        type: (u.type as any) || 'Reading',
        content: u.readingContent || ''
      }))
    )
  }));
}

// Import all structured course curriculum datasets
import { gitCourseModules } from '../../../frontend/src/data/gitCourseFullData';
import { linuxCourseModules } from '../../../frontend/src/data/linuxCourseFullData';
import { kubernetesCourseModules } from '../../../frontend/src/data/kubernetesCourseFullData';
import { reactCourseModules } from '../../../frontend/src/data/reactCourseFullData';
import { cCourseModules } from '../../../frontend/src/data/cCourseFullData';
import { pythonCourseModules } from '../../../frontend/src/data/pythonCourseFullData';
import { javaCourseModules } from '../../../frontend/src/data/javaCourseFullData';
import { javascriptCourseModules } from '../../../frontend/src/data/javascriptCourseFullData';
import { nodejsCourseModules } from '../../../frontend/src/data/nodejsCourseFullData';
import { dsaCourseModules } from '../../../frontend/src/data/dsaCourseFullData';
import { webDevCourseModules } from '../../../frontend/src/data/webDevCourseFullData';
import { dbmsCourseModules } from '../../../frontend/src/data/dbmsCourseFullData';

const ALL_COURSES: CourseDefinition[] = [
  {
    id: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    slug: 'git-github-mastery',
    category: 'Development Tools',
    tags: ['git', 'github', 'devops', 'version-control', 'ci-cd', 'collaboration'],
    level: 'all_levels',
    shortDescription: 'Master Git version control from fundamental architecture to advanced rebasing, conflict resolution, GitHub pull request workflows, and GitHub Actions CI/CD automation.',
    fullDescription: 'Master Git and GitHub from foundational architecture to enterprise DevOps collaboration. This comprehensive, production-ready track takes you step-by-step through local version control mechanics, 3-tier tree architectures, branching models, 3-way merges, complex conflict resolutions, rebasing, forensic debugging with bisect, and automated CI/CD pipelines with GitHub Actions.',
    learningOutcomes: [
      'Master local repository mechanics: Working Directory, Staging Index, and Commit Tree.',
      'Design and execute professional branching models and resolve complex merge conflicts.',
      'Apply safe rollback strategies using git revert, git reset (soft/mixed/hard), and git restore.',
      'Collaborate on enterprise GitHub workflows using Forks, Pull Requests, and Code Reviews.',
      'Utilize advanced tools: Interactive Rebase, Cherry-Pick, Stash, and Git Bisect debugging.',
      'Build automated CI/CD test and deployment pipelines with GitHub Actions.'
    ],
    thumbnailUrl: '/assets/images/github_course_banner.webp',
    durationHours: 20,
    duration: '20 Hours',
    order: 1,
    modules: mapModules(gitCourseModules)
  },
  {
    id: 'course_linux_101',
    title: 'Linux Systems & Administration Mastery',
    slug: 'linux-systems-administration-mastery',
    category: 'Linux & Systems',
    tags: ['linux', 'sysadmin', 'bash', 'kernel', 'devops', 'security'],
    level: 'all_levels',
    shortDescription: 'Master Linux terminal navigation, bash scripting, file systems, permissions, networking, and server administration.',
    fullDescription: 'Comprehensive Linux curriculum covering Kernel mechanics, File System Hierarchy, Systemd service daemons, POSIX/ACL permissions, Bash scripting automation, and SSH network security.',
    learningOutcomes: [
      'Understand Monolithic Kernel architecture, LKMs, and System Call execution.',
      'Manage User & Group security permissions using octal notation and ACLs.',
      'Control system daemons using systemctl and inspect binary logs with journalctl.',
      'Write modular Bash automation scripts with control loops and position arguments.',
      'Harden remote SSH daemons and configure UFW firewall rules.'
    ],
    thumbnailUrl: '/assets/images/linux_course_thumbnail.webp',
    durationHours: 32,
    duration: '32 Hours',
    order: 2,
    modules: mapModules(linuxCourseModules)
  },
  {
    id: 'database-management-system',
    title: 'Database Management System (DBMS) for Beginners',
    slug: 'database-management-system',
    category: 'Database',
    tags: ['sql', 'database', 'rdbms', 'normalization', 'acid', 'postgresql'],
    level: 'beginner',
    shortDescription: 'Comprehensive DBMS curriculum covering Relational Model, SQL queries, Joins, Normalization, and ACID Transactions.',
    fullDescription: 'Comprehensive Database Management Systems (DBMS) course covering relational database fundamentals, SQL queries, DDL, DML, joins, subqueries, normalization, and ACID transactions.',
    learningOutcomes: [
      'Design normalized relational database schemas (1NF, 2NF, 3NF, BCNF).',
      'Write complex multi-table SQL joins, nested subqueries, and window functions.',
      'Understand ACID transaction properties, WAL logs, and concurrency locking.',
      'Optimize queries using B-Tree and Hash index strategies.'
    ],
    thumbnailUrl: '/assets/images/dbms_banner.webp',
    durationHours: 25,
    duration: '25 Hours',
    order: 3,
    modules: mapModules(dbmsCourseModules)
  },
  {
    id: 'kubernetes-complete-course-beginner-to-advanced',
    title: 'Kubernetes Complete Course (Beginner to Advanced)',
    slug: 'kubernetes-complete-course-beginner-to-advanced',
    category: 'DevOps & Cloud',
    tags: ['kubernetes', 'k8s', 'docker', 'containers', 'devops', 'cloud'],
    level: 'intermediate',
    shortDescription: 'Master container orchestration with Kubernetes: Pods, Services, Ingress, Helm, and production deployments.',
    fullDescription: 'Learn container orchestration with Kubernetes: Pods, Deployments, Services, ConfigMaps, Secrets, Ingress, Volumes, Helm, and production cluster architecture.',
    learningOutcomes: [
      'Architect and deploy multi-tier microservices on Kubernetes clusters.',
      'Manage networking with ClusterIP, NodePort, LoadBalancer, and Ingress controllers.',
      'Configure persistent storage with PV, PVC, and StorageClasses.',
      'Package and distribute production charts using Helm.'
    ],
    thumbnailUrl: '/assets/images/kubernetes_course_banner.webp',
    durationHours: 30,
    duration: '30 Hours',
    order: 4,
    modules: mapModules(kubernetesCourseModules)
  },
  {
    id: 'react-js-complete-course',
    title: 'React JS Complete Course',
    slug: 'react-js-complete-course',
    category: 'Web Development',
    tags: ['react', 'frontend', 'javascript', 'hooks', 'redux', 'web'],
    level: 'all_levels',
    shortDescription: 'Master modern React JS development: JSX, Hooks, State Management, Routing, and Redux Toolkit.',
    fullDescription: 'Learn modern React with JSX, components, props, state, hooks, routing, Context API, Redux Toolkit, and performance optimization.',
    learningOutcomes: [
      'Build scalable single-page web applications with React 19 and Vite.',
      'Master built-in hooks: useState, useEffect, useMemo, useCallback, useRef.',
      'Implement global state management with Redux Toolkit and Zustand.',
      'Optimize rendering performance with memoization and code-splitting.'
    ],
    thumbnailUrl: '/assets/images/react_course_banner.webp',
    durationHours: 24,
    duration: '24 Hours',
    order: 5,
    modules: mapModules(reactCourseModules)
  },
  {
    id: 'c-programming-course-id',
    title: 'C Programming',
    slug: 'c-programming',
    category: 'Programming',
    tags: ['c', 'programming', 'memory', 'pointers', 'algorithms'],
    level: 'all_levels',
    shortDescription: 'Build a solid foundation in low-level programming with C: syntax, memory pointers, structures, and file I/O.',
    fullDescription: 'Learn C programming from fundamentals to practical problem solving, including syntax, variables, control flow, functions, arrays, pointers, structures, file handling, and memory management.',
    learningOutcomes: [
      'Understand low-level compilation stages: Preprocessing, Compiling, Assembly, Linking.',
      'Master pointers, pointer arithmetic, dynamic memory allocation (malloc/free).',
      'Implement memory-efficient data structures using structs and unions.',
      'Perform reliable file handling and binary serialization.'
    ],
    thumbnailUrl: '/assets/images/c_programming_banner.webp',
    durationHours: 35,
    duration: '35 Hours',
    order: 6,
    modules: mapModules(cCourseModules)
  },
  {
    id: 'python-through-oops-course-id',
    title: 'Python Through OOPs',
    slug: 'python-through-oops',
    category: 'Programming',
    tags: ['python', 'oops', 'classes', 'backend', 'programming'],
    level: 'all_levels',
    shortDescription: 'Master Python programming from syntax basics to Advanced Object-Oriented Programming (OOP) and real-world projects.',
    fullDescription: 'Complete Python Through OOPs course covering Python fundamentals, core Python, OOPs main section, intermediate Python, and real-world projects.',
    learningOutcomes: [
      'Master Python syntax, collections (lists, dicts, tuples, sets), and generators.',
      'Implement the 4 pillars of OOP: Encapsulation, Abstraction, Inheritance, Polymorphism.',
      'Write modular, clean code using Python decorators, dunder methods, and context managers.',
      'Build full-fledged CLI and backend projects with unit tests.'
    ],
    thumbnailUrl: '/assets/images/python_course_banner.webp',
    durationHours: 35,
    duration: '35 Hours',
    order: 7,
    modules: mapModules(pythonCourseModules)
  },
  {
    id: 'java-through-oops-course-id',
    title: 'Java Through OOPs',
    slug: 'java-through-oops',
    category: 'Programming',
    tags: ['java', 'oops', 'jvm', 'spring', 'enterprise'],
    level: 'all_levels',
    shortDescription: 'Comprehensive Java curriculum covering JDK/JVM, Core OOP Pillars, Collections, Exceptions, and System Design.',
    fullDescription: 'Complete Java Through OOPs course covering Java fundamentals, core Java, OOPs main section, intermediate Java, and practice & interview preparation.',
    learningOutcomes: [
      'Understand JVM memory architecture, Garbage Collection, and ClassLoader mechanics.',
      'Design clean enterprise systems using SOLID principles and Design Patterns.',
      'Master the Java Collections Framework (List, Set, Map, Queue, Streams API).',
      'Handle concurrency, multithreading, and synchronization safely.'
    ],
    thumbnailUrl: '/assets/images/java_course_banner.webp',
    durationHours: 35,
    duration: '35 Hours',
    order: 8,
    modules: mapModules(javaCourseModules)
  }
];

export async function importLessonsToFirestore(targetCourseId?: string) {
  console.log('===============================================================');
  console.log('🚀 KAIZEN Q — FIRESTORE LESSON CONTENT IMPORT PIPELINE');
  console.log('===============================================================');

  if (!db) {
    throw new Error('Firebase DB is not initialized. Please verify service account credentials.');
  }

  const coursesToImport = targetCourseId
    ? ALL_COURSES.filter(c => c.id === targetCourseId || c.slug === targetCourseId)
    : ALL_COURSES;

  if (coursesToImport.length === 0) {
    console.warn(`⚠️ No courses matched the filter: "${targetCourseId}". Available courses: ${ALL_COURSES.map(c => c.id).join(', ')}`);
    return;
  }

  console.log(`🎯 Target: Importing ${coursesToImport.length} course(s) into Firestore...`);

  const now = new Date().toISOString();
  let totalCourses = 0;
  let totalModules = 0;
  let totalLessons = 0;
  let totalValidationIssues = 0;

  for (const course of coursesToImport) {
    const totalLessonsInCourse = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    console.log(`\n📚 Processing Course: [${course.id}] - "${course.title}" (${course.modules.length} Modules, ${totalLessonsInCourse} Lessons)`);

    // 1. Validate markdown for all lessons in this course
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        const val = validateMarkdown(lesson.content, lesson.title);
        if (!val.isValid) {
          totalValidationIssues += val.issues.length;
          val.issues.forEach(iss => console.warn(`   ⚠️ [VALIDATION WARNING]: ${iss}`));
        }
      }
    }

    // 2. Prepare syllabus outline for top-level course document
    const syllabus = course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessonsCount: m.lessons.length,
      duration: m.duration
    }));

    // 3. Upsert Course document to top-level "courses" collection
    const coursePayload = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      tags: course.tags,
      level: course.level,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      description: course.shortDescription,
      learningOutcomes: course.learningOutcomes,
      thumbnailUrl: course.thumbnailUrl,
      thumbnail: course.thumbnailUrl,
      durationHours: course.durationHours,
      duration: course.duration,
      totalLessons: totalLessonsInCourse,
      price: 0,
      currency: 'INR',
      rating: 4.9,
      reviewCount: 145,
      isPublished: true,
      isFeatured: true,
      status: 'published',
      visibility: 'public',
      order: course.order,
      syllabus,
      modules: course.modules.map(m => ({
        id: m.id,
        title: m.title,
        order: m.order,
        duration: m.duration,
        description: m.description,
        topics: [
          {
            id: `${m.id}-top-1`,
            title: `${m.title} Topics & Reading Notes`,
            description: m.description,
            estimatedDuration: m.duration,
            learningUnits: m.lessons.map(l => ({
              id: l.id,
              title: l.title,
              description: `${l.title} in ${m.title}`,
              duration: l.duration,
              type: l.type,
              readingContent: l.content,
              estimatedReadMinutes: calculateReadMinutes(l.content),
              order: l.order,
              orderIndex: l.order
            }))
          }
        ]
      })),
      createdAt: now,
      updatedAt: now
    };

    await db.collection('courses').doc(course.id).set(coursePayload, { merge: true });
    totalCourses++;

    // 4. Upsert Modules and Lessons subcollections
    for (const mod of course.modules) {
      await db.collection('courses').doc(course.id).collection('modules').doc(mod.id).set(
        {
          id: mod.id,
          courseId: course.id,
          title: mod.title,
          order: mod.order,
          orderIndex: mod.order,
          duration: mod.duration,
          description: mod.description,
          lessonsCount: mod.lessons.length,
          updatedAt: now,
          createdAt: now
        },
        { merge: true }
      );
      totalModules++;

      for (const lesson of mod.lessons) {
        const readMins = calculateReadMinutes(lesson.content);
        const lessonPayload = {
          id: lesson.id,
          title: lesson.title,
          moduleTitle: lesson.moduleTitle,
          moduleId: mod.id,
          courseId: course.id,
          order: lesson.order,
          orderIndex: lesson.order,
          type: lesson.type,
          duration: lesson.duration,
          estimatedReadMinutes: readMins,
          content: lesson.content,
          readingContent: lesson.content,
          updatedAt: now,
          createdAt: now
        };

        // Write to canonical nested subcollection: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
        await db
          .collection('courses')
          .doc(course.id)
          .collection('modules')
          .doc(mod.id)
          .collection('lessons')
          .doc(lesson.id)
          .set(lessonPayload, { merge: true });

        // Write to direct subcollection for fast single-level querying: courses/{courseId}/lessons/{lessonId}
        await db
          .collection('courses')
          .doc(course.id)
          .collection('lessons')
          .doc(lesson.id)
          .set(lessonPayload, { merge: true });

        totalLessons++;
      }
    }

    console.log(`   ✅ Successfully wrote Course [${course.id}], ${course.modules.length} Modules, and ${totalLessonsInCourse} Lessons.`);
  }

  console.log('\n===============================================================');
  console.log('🎉 FIRESTORE IMPORT COMPLETE!');
  console.log(`📊 Result: ${totalCourses} Course(s) | ${totalModules} Module(s) | ${totalLessons} Lesson(s) | Validation Warnings: ${totalValidationIssues}`);
  console.log('===============================================================');
}

// Check command line arguments for specific course target
const rawArgs = process.argv.slice(2);
const courseFlag = rawArgs.find(arg => arg.startsWith('--course='));
const positionalArg = rawArgs.find(arg => !arg.startsWith('-') && !arg.includes('.js') && !arg.includes('.ts'));
const targetCourse = courseFlag ? courseFlag.replace('--course=', '').trim() : positionalArg?.trim();

importLessonsToFirestore(targetCourse)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Import failed with error:', err);
    process.exit(1);
  });
