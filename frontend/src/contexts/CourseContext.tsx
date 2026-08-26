import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { gitCourseModules } from '@/data/gitCourseFullData';
import { kubernetesCourseModules } from '@/data/kubernetesCourseFullData';
import { reactCourseModules } from '@/data/reactCourseFullData';
import { cCourseModules } from '@/data/cCourseFullData';
import { pythonCourseModules } from '@/data/pythonCourseFullData';
import { javaCourseModules } from '@/data/javaCourseFullData';
import { linuxCourseModules } from '@/data/linuxCourseFullData';
import { courseService } from '@/services/courseService';

export type LearningUnitType = 'Video' | 'Reading' | 'Quiz' | 'Assignment';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  marks?: number;
}

export interface LearningUnitItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: LearningUnitType;
  videoUrl?: string;
  readingContent?: string;
  quizQuestions?: QuizQuestion[];
  quizDifficulty?: 'Easy' | 'Medium' | 'Hard';
  quizPassingScore?: number;
  quizTimer?: number;
  assignmentInstructions?: string;
  assignmentReferenceFiles?: string;
  assignmentMaxMarks?: number;
  assignmentDeadline?: string;
  assignmentAllowedTypes?: string;
  assignmentRubric?: string;
  assignmentSubmissionStatus?: string;
  assignmentTeacherFeedback?: string;
  practiceLabChallenge?: any;
  resources?: any[];
}

export interface TopicItem {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  learningUnits: LearningUnitItem[];
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: TopicItem[];
}

export interface CourseItem {
  id: number | string;
  title: string;
  subtitle?: string;
  instructor: string;
  role?: string;
  avatar?: string;
  rating: number;
  reviews?: number;
  students: string;
  duration: string;
  category: string;
  level?: string;
  badge?: string;
  tracks?: string;
  thumbnail: string;
  status: 'Published' | 'Draft';
  price?: number;
  description: string;
  syllabus: string[];
  modules?: ModuleItem[];
  createdAt?: string;
}



interface CourseContextType {
  courses: CourseItem[];
  publishedCourses: CourseItem[];
  addCourse: (course: Partial<CourseItem>) => Promise<void>;
  toggleCourseStatus: (id: number | string) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  getCourseById: (id: number | string) => CourseItem | undefined;
  refreshCourses: () => Promise<void>;
  updateCourse: (id: number | string, updates: Partial<CourseItem>) => Promise<void>;
}

const mergeCourseModules = (defModules?: ModuleItem[], cachedModules?: any[]): ModuleItem[] => {
  if (!defModules) return cachedModules || [];
  if (!cachedModules || cachedModules.length === 0) return defModules;
  return defModules.map(defMod => {
    const cachedMod = cachedModules.find(m => m.id === defMod.id);
    if (!cachedMod) return defMod;
    const mergedTopics = defMod.topics.map(defTopic => {
      const cachedTopic = cachedMod.topics?.find((t: any) => t.id === defTopic.id);
      if (!cachedTopic) return defTopic;
      const mergedUnits = defTopic.learningUnits.map(defUnit => {
        const cachedUnit = cachedTopic.learningUnits?.find((u: any) => u.id === defUnit.id);
        if (!cachedUnit) return defUnit;
        return {
          ...defUnit,
          ...cachedUnit
        };
      });
      return {
        ...defTopic,
        ...cachedTopic,
        learningUnits: mergedUnits
      };
    });
    return {
      ...defMod,
      ...cachedMod,
      topics: mergedTopics
    };
  });
};

// Helper to enrich learning units with default content if missing
const enrichCourseMockContent = (course: CourseItem): CourseItem => {
  if (!course.modules) return course;
  const enrichedModules = course.modules.map(m => {
    const enrichedTopics = m.topics.map(t => {
      const enrichedUnits = t.learningUnits.map(u => {
        const enrichedUnit = { ...u };
        if (u.type === 'Video' && !u.videoUrl) {
          enrichedUnit.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        } else if (u.type === 'Reading' && !u.readingContent) {
          enrichedUnit.readingContent = `## ${u.title}\n\n${u.description}\n\n### Core Study Guide\nGit and system configurations are essential to maintain workspace integrity. Ensure that you follow step-by-step instructions carefully.\n\n#### Key Takeaways\n- Verify configuration details using validation flags.\n- Log descriptive commit titles to ease review actions.\n- Push changes early to prevent merge conflicts.`;
        } else if (u.type === 'Quiz' && (!u.quizQuestions || u.quizQuestions.length === 0)) {
          enrichedUnit.quizDifficulty = 'Medium';
          enrichedUnit.quizPassingScore = 70;
          enrichedUnit.quizTimer = 10;
          enrichedUnit.quizQuestions = [
            {
              id: `q-${u.id}-1`,
              questionText: `Which of the following describes the core goal of "${u.title}"?`,
              options: [
                'Establishing structural configuration guidelines',
                'Simulating production environments locally',
                'Optimizing workspace pipeline runs',
                'All of the above'
              ],
              correctAnswerIndex: 3,
              explanation: 'This topic covers configurations, local simulations, and optimization pipelines, which are all part of the core goals.',
              marks: 5
            },
            {
              id: `q-${u.id}-2`,
              questionText: `What is a common best practice associated with this topic?`,
              options: [
                'Committing directly without branch validations',
                'Using descriptive commit logs and peer reviews',
                'Disabling branch protections for fast merges',
                'Ignoring configuration scopes'
              ],
              correctAnswerIndex: 1,
              explanation: 'Descriptive commit logs and robust peer review workflows maintain software codebase quality and tracking history.',
              marks: 5
            }
          ];
        } else if (u.type === 'Assignment' && !u.assignmentInstructions) {
          enrichedUnit.assignmentMaxMarks = 100;
          enrichedUnit.assignmentDeadline = '7 days after module start';
          enrichedUnit.assignmentAllowedTypes = 'PDF, ZIP, MD';
          enrichedUnit.assignmentReferenceFiles = 'git-cheat-sheet.pdf, lab-setup-guide.md';
          enrichedUnit.assignmentRubric = 'Completeness (50%), Correctness (30%), Quality (20%)';
          enrichedUnit.assignmentSubmissionStatus = 'Not Submitted';
          enrichedUnit.assignmentTeacherFeedback = 'Assignment pending student upload response.';
          enrichedUnit.assignmentInstructions = `### Practical Assignment: ${u.title}\n\n**Goal**: Implement the tasks described in the description: *${u.description}*.\n\n#### Instructions & Deliverables:\n1. Open your terminal or workspace panel.\n2. Perform the required steps as outlined in the lessons.\n3. Verify your configuration outputs run without errors.\n4. Write a short summary (150-300 words) describing your findings and commit your configuration file.\n\n#### Grading Rubric:\n- **Completeness (50%)**: All steps executed and logged.\n- **Correctness (30%)**: Correct parameters and inputs.\n- **Documentation (20%)**: Clean descriptions and summaries.`;
        }
        return enrichedUnit;
      });
      return { ...t, learningUnits: enrichedUnits };
    });
    return { ...m, topics: enrichedTopics };
  });
  return { ...course, modules: enrichedModules };
};

const initialDefaultCoursesRaw: CourseItem[] = [
  {
    id: 'course_linux_101',
    title: 'Linux Systems & Administration Mastery',
    subtitle: '🐧 Linux Systems Mastery',
    instructor: 'KaizenQ Team',
    role: 'Linux Systems Architect & AI Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 145,
    students: '3',
    duration: '32 hrs',
    category: 'Linux & Systems',
    level: 'Beginner to Advanced',
    badge: 'Featured Track',
    tracks: '15 Modules',
    status: 'Published',
    thumbnail: '/assets/images/linux_course_thumbnail.webp',
    description: `Welcome to Linux Systems & Administration Mastery! Linux powers modern cloud infrastructure, supercomputers, and enterprise AI clusters. In this comprehensive production-ready track, you will explore Linux Kernel mechanics, master file system hierarchy standards (FHS), manage systemd background daemons, automate workflows via Bash scripts, and harden network security using SSH and host firewalls.`,
    syllabus: [
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
    ],
    createdAt: new Date('2026-07-01').toISOString(),
    modules: linuxCourseModules
  },
  {
    id: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    subtitle: '⚡ Git & GitHub Mastery',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '15 Hours',
    category: 'Development Tools',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '15 Modules (15 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/github_course_banner.webp',
    description: 'Transform your development velocity by mastering Git and GitHub. Learn version control, branching, PR review workflows, GitHub Actions, CI/CD, and enterprise release management patterns.',
    syllabus: [
      'Module 1: Introduction to Version Control, Git & GitHub',
      'Module 2: Installing Git and Initial Configuration',
      'Module 3: Git Repository Fundamentals',
      'Module 4: Basic Git Commands',
      'Module 5: Branching and Merging',
      'Module 6: GitHub Basics',
      'Module 7: Remote Repository Management',
      'Module 8: Git Collaboration',
      'Module 9: Advanced Git Commands',
      'Module 10: Git Internals',
      'Module 11: GitHub Features',
      'Module 12: Git Best Practices',
      'Module 13: Real-World Git Workflow',
      'Module 14: Git & GitHub Projects',
      'Module 15: Git & GitHub Interview Preparation'
    ],
    modules: gitCourseModules
  },
  {
    id: 'database-management-system',
    title: 'Database Management System (DBMS): Beginner to Advanced',
    subtitle: '🗄️ Database Management System',
    instructor: 'Kaizen-Q Academy',
    role: 'Database Systems Specialists',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 120,
    students: '0',
    duration: '25 Hours',
    category: 'Database',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '6 Modules (25 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/dbms_course_thumbnail.png',
    description: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects.',
    syllabus: [
      'Module 1: Database Fundamentals',
      'Module 2: Relational Database Concepts',
      'Module 3: SQL Fundamentals',
      'Module 4: Advanced SQL',
      'Module 5: Database Design',
      'Module 6: Real World Database Project',
    ],
    modules: [
      {
        id: 'dbms-mod-1',
        title: 'Module 1 - Database Fundamentals',
        description: 'Fundamentals of databases, DBMS vs File System, advantages, and database types.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-1-1',
            title: 'Database Fundamentals',
            description: 'Introduction to data, databases, and DBMS.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-1-1-1', title: 'What is Data?', description: 'Concept of data, information, and metadata.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-1-1-2', title: 'What is Database?', description: 'Structure and purpose of a database.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-1-1-3', title: 'DBMS Introduction', description: 'What is a Database Management System?', duration: '25 mins', type: 'Reading' },
              { id: 'dbms-unit-1-1-4', title: 'Database vs File System', description: 'Comparing traditional file storage vs DBMS.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-1-1-5', title: 'Advantages of DBMS', description: 'Data integrity, security, and redundancy management.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-1-1-6', title: 'Types of Databases', description: 'Relational, NoSQL, NewSQL, Graph, and Document DBs.', duration: '15 mins', type: 'Quiz' },
              { id: 'dbms-unit-1-1-7', title: 'Practice Terminal (For Practice Only)', description: 'Simulated environment for basic DB connection exercises.', duration: '10 mins', type: 'Assignment' },
              { id: 'dbms-unit-1-1-8', title: 'Module Notes', description: 'Comprehensive reading notes for Module 1.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-2',
        title: 'Module 2 - Relational Database Concepts',
        description: 'Tables, keys, constraints, ER model and diagram.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-2-1',
            title: 'Relational Model & Design',
            description: 'Keys, constraints, and entity-relationship modelling.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-2-1-1', title: 'Tables, Rows & Columns', description: 'Introduction to relational schemas.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-2-1-2', title: 'Keys', description: 'Primary keys, candidate keys, foreign keys, super keys.', duration: '25 mins', type: 'Video' },
              { id: 'dbms-unit-2-1-3', title: 'Constraints', description: 'Domain, entity integrity, and referential integrity constraints.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-2-1-4', title: 'ER Model', description: 'Entity, Attribute, Relationship sets.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-2-1-5', title: 'ER Diagram', description: 'Drawing entity-relationship diagrams.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-2-1-6', title: 'Practice Terminal (For Practice Only)', description: 'Draw ER schema diagrams or model schemas.', duration: '15 mins', type: 'Assignment' },
              { id: 'dbms-unit-2-1-7', title: 'Module Notes', description: 'Comprehensive reading notes for Module 2.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-3',
        title: 'Module 3 - SQL Fundamentals',
        description: 'DDL, DML, and core query syntax.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-3-1',
            title: 'Structured Query Language (SQL)',
            description: 'Fundamental SQL queries and modifications.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-3-1-1', title: 'SQL Introduction', description: 'Introduction to SQL syntax.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-3-1-2', title: 'CREATE', description: 'Creating tables and databases.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-3', title: 'INSERT', description: 'Adding records to tables.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-4', title: 'SELECT', description: 'Retrieving data from tables.', duration: '25 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-5', title: 'UPDATE', description: 'Modifying existing records.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-6', title: 'DELETE', description: 'Deleting records from tables.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-7', title: 'WHERE', description: 'Filtering records using conditional statements.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-8', title: 'ORDER BY', description: 'Sorting query results.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-9', title: 'Practice Terminal (For Practice Only)', description: 'Simulated SQL execution terminal exercises.', duration: '20 mins', type: 'Assignment' },
              { id: 'dbms-unit-3-1-10', title: 'Module Notes', description: 'Comprehensive reading notes for Module 3.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-4',
        title: 'Module 4 - Advanced SQL',
        description: 'Joins, aggregations, subqueries, views, and indexes.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-4-1',
            title: 'Advanced SQL Querying',
            description: 'Complex queries, joining tables, and database efficiency.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-4-1-1', title: 'GROUP BY', description: 'Aggregating rows.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-2', title: 'HAVING', description: 'Filtering aggregated rows.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-3', title: 'JOINS', description: 'Inner join, outer joins, cross join.', duration: '30 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-4', title: 'UNION', description: 'Combining query result sets.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-5', title: 'Subqueries', description: 'Nested and correlated subqueries.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-6', title: 'Views', description: 'Creating virtual tables.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-7', title: 'Indexes', description: 'Improving database search speed.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-8', title: 'Practice Terminal (For Practice Only)', description: 'Execute complex multi-table joins.', duration: '20 mins', type: 'Assignment' },
              { id: 'dbms-unit-4-1-9', title: 'Module Notes', description: 'Comprehensive reading notes for Module 4.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-5',
        title: 'Module 5 - Database Design',
        description: 'Functional dependencies, normalization, transactions, concurrency, and security.',
        duration: '5 Hours',
        topics: [
          {
            id: 'dbms-topic-5-1',
            title: 'Normalization & Transactions',
            description: 'Designing anomalies out of databases and transactional safety.',
            estimatedDuration: '150 mins',
            learningUnits: [
              { id: 'dbms-unit-5-1-1', title: 'Functional Dependency', description: 'A determines B dependency concepts.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-2', title: 'Normalization', description: '1NF, 2NF, 3NF, BCNF.', duration: '30 mins', type: 'Video' },
              { id: 'dbms-unit-5-1-3', title: 'Transactions', description: 'Introduction to database transactions.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-5-1-4', title: 'ACID Properties', description: 'Atomicity, Consistency, Isolation, Durability.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-5', title: 'Concurrency Control', description: 'Locks, serializability, and deadlocks.', duration: '25 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-6', title: 'Database Security', description: 'Privileges, SQL injection protection, and backup policies.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-7', title: 'Practice Terminal (For Practice Only)', description: 'Transaction isolation level tests.', duration: '20 mins', type: 'Assignment' },
              { id: 'dbms-unit-5-1-8', title: 'Module Notes', description: 'Comprehensive reading notes for Module 5.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-6',
        title: 'Module 6 - Real World Database Project',
        description: 'Creating production databases for real-world scenarios and final assessment.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-6-1',
            title: 'Database Capstones',
            description: 'Hands-on projects and final evaluations.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-6-1-1', title: 'Student Management System', description: 'Designing student registration schema.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-6-1-2', title: 'Library Management System', description: 'Modeling book inventory and borrowing schemas.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-6-1-3', title: 'E-Commerce Database', description: 'Creating orders, products, and user schemas.', duration: '30 mins', type: 'Reading' },
              { id: 'dbms-unit-6-1-4', title: 'SQL Mini Project', description: 'Implementation of the capstone schemas.', duration: '40 mins', type: 'Assignment' },
              { id: 'dbms-unit-6-1-5', title: 'Final Assessment', description: 'DBMS course comprehensive examination.', duration: '30 mins', type: 'Quiz' },
              { id: 'dbms-unit-6-1-6', title: 'Course Completion', description: 'Verify completion status and unlock certificate.', duration: '10 mins', type: 'Reading' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'kubernetes-complete-course-beginner-to-advanced',
    title: 'Kubernetes Complete Course – Beginner to Advanced',
    subtitle: '☸️ Kubernetes Complete Course',
    instructor: 'Kaizen-Q Academy',
    role: 'DevOps & Cloud Engineers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 100,
    students: '0',
    duration: '30 Hours',
    category: 'DevOps / Cloud / Containers',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '15 Modules (30 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    description: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning. Understand Kubernetes architecture, Pods, Deployments, Services, Networking, Storage, Security, Scheduling, Helm, CI/CD, and real-world application deployment.',
    syllabus: [
      'Module 1: Introduction to Kubernetes',
      'Module 2: Kubernetes Architecture',
      'Module 3: Installing Kubernetes',
      'Module 4: Basic Kubernetes Objects & Pods',
      'Module 5: Services & Networking',
      'Module 6: Kubernetes Storage',
      'Module 7: Configuration Management',
      'Module 8: Advanced Workloads',
      'Module 9: Kubernetes Security',
      'Module 10: Monitoring & Logging',
      'Module 11: Helm — Package Manager',
      'Module 12: CI/CD with Kubernetes',
      'Module 13: Troubleshooting Kubernetes',
      'Module 14: Real-World Projects',
      'Module 15: Interview Preparation & Cheat Sheet'
    ],
    createdAt: new Date('2026-08-08').toISOString(),
    modules: kubernetesCourseModules
  },
  {
    id: 'react-js-complete-course',
    title: 'React JS Complete Course',
    subtitle: '⚛️ React JS Complete Course',
    instructor: 'KaizenQ Systems Team',
    role: 'React Systems Architect & LMS Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 120,
    students: '0',
    duration: '24 Hours',
    category: 'Web Development / Frontend Development',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '15 Modules (24 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    description: 'A complete beginner-to-advanced React JS course covering React fundamentals, development environment setup, JSX, components, props, state, hooks, events, forms, conditional rendering, routing, API integration, state management, styling, real-time projects, and interview preparation.',
    syllabus: [
      'Module 1: Introduction to React JS',
      'Module 2: Setting Up React Environment',
      'Module 3: JSX (JavaScript XML)',
      'Module 4: React Components',
      'Module 5: React Props',
      'Module 6: React State & Hooks',
      'Module 7: React Events & Forms',
      'Module 8: Lists & Conditional Rendering',
      'Module 9: React Hooks',
      'Module 10: React Router',
      'Module 11: API Integration',
      'Module 12: State Management',
      'Module 13: Styling React',
      'Module 14: Real-Time Projects',
      'Module 15: Interview Preparation',
    ],
    createdAt: new Date('2026-08-08').toISOString(),
    modules: reactCourseModules
  },
  {
    id: 'c-programming-course-id',
    title: 'C Programming',
    subtitle: '💻 C Programming',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '35 Hours',
    category: 'Programming',
    level: 'All Levels',
    badge: 'Standard Track',
    tracks: '15 Modules (35 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/c_course_thumbnail.png',
    description: 'Complete C Programming course covering fundamentals, programming concepts, advanced C, data structures, practical programs, interview preparation, and final revision.',
    syllabus: [
      'Module 1: Introduction to C Programming',
      'Module 2: Variables, Constants & Data Types',
      'Module 3: Operators & Expressions',
      'Module 4: Input, Output & Decision-Making Statements',
      'Module 5: Loops & Iteration',
      'Module 6: Functions',
      'Module 7: Arrays',
      'Module 8: Strings',
      'Module 9: Pointers',
      'Module 10: Structures, Unions & Enumerations',
      'Module 11: Dynamic Memory Allocation',
      'Module 12: File Handling',
      'Module 13: Preprocessor & Advanced C',
      'Module 14: Data Structures & C Projects',
      'Module 15: Advanced C Concepts & Final Revision',
    ],
    createdAt: new Date('2026-08-10').toISOString(),
    modules: cCourseModules
  },
  {
    id: 'python-through-oops-course-id',
    title: 'Python Through OOPs',
    subtitle: '💻 Python Through OOPs',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '35 Hours',
    category: 'Programming',
    level: 'All Levels',
    badge: 'Standard Track',
    tracks: '15 Modules (35 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/python_course_thumbnail.png',
    description: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, intermediate concepts, object-oriented programming, and practical application.',
    syllabus: [
      'Module 1: Introduction to Python',
      'Module 2: Variables & Data Types',
      'Module 3: Operators',
      'Module 4: Input, Output & Basic Programs',
      'Module 5: Conditional Statements',
      'Module 6: Loops',
      'Module 7: Strings',
      'Module 8: Python Collections',
      'Module 9: Functions',
      'Module 10: Modules, Packages & Exception Handling',
      'Module 11: File Handling',
      'Module 12: OOP Fundamentals',
      'Module 13: Four Pillars of OOP',
      'Module 14: Advanced OOP in Python',
      'Module 15: Intermediate Python & OOP Project',
    ],
    createdAt: new Date('2026-08-11').toISOString(),
    modules: pythonCourseModules
  },
  {
    id: 'java-through-oops-course-id',
    title: 'Java Through OOPs',
    subtitle: '💻 Java Through OOPs',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '35 Hours',
    category: 'Programming',
    level: 'All Levels',
    badge: 'Standard Track',
    tracks: '24 Modules (35 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/java_course_thumbnail.png',
    description: 'Complete Java Through OOPs course covering Java fundamentals, core Java, OOPs main section, intermediate Java, and practice & interview preparation.',
    syllabus: [
      'Module 1 — Introduction to Java',
      'Module 2 — Variables & Data Types',
      'Module 3 — Operators',
      'Module 4 — Input & Output',
      'Module 5 — Conditional Statements',
      'Module 6 — Loops',
      'Module 7 — Arrays',
      'Module 8 — Strings',
      'Module 9 — Methods',
      'Module 10 — Exception Handling',
      'Module 11 — Packages & Access Modifiers',
      'Module 12 — Classes & Objects',
      'Module 13 — Encapsulation',
      'Module 14 — Inheritance',
      'Module 15 — Polymorphism',
      'Module 16 — Abstraction',
      'Module 17 — Interfaces',
      'Module 18 — Collections Framework',
      'Module 19 — Wrapper Classes & Generics',
      'Module 20 — File Handling',
      'Module 21 — Important Java Concepts',
      'Module 22 — Java Coding Problems',
      'Module 23 — OOP Mini Project',
      'Module 24 — Java & OOP Interview Questions'
    ],
    createdAt: new Date('2026-08-11').toISOString(),
    modules: javaCourseModules
  }
];

const initialDefaultCourses = initialDefaultCoursesRaw.map(enrichCourseMockContent);
const sanitizeCourseList = (list: CourseItem[]): CourseItem[] => {
  const map = new Map<string, CourseItem>();
  list.forEach((c) => {
    const title = (c.title || '').toLowerCase();
    const slug = ((c as any).slug || '').toLowerCase();

    // Completely remove/ignore 'Linux Essentials' sample course
    if (title === 'linux essentials' || slug === 'linux-essentials' || String(c.id) === 'linux-essentials') {
      return;
    }

    if (
      title.includes('linux systems') ||
      title.includes('introduction to linux') ||
      String(c.id) === '1' ||
      String(c.id) === 'course_linux_101'
    ) {
      const key = 'course_linux_101';
      const defaultLinuxCourse = initialDefaultCourses.find(item => item.id === 'course_linux_101') || c;
      const updatedItem: CourseItem = {
        ...defaultLinuxCourse,
        ...c,
        id: 'course_linux_101',
        title: 'Linux Systems & Administration Mastery',
        subtitle: '🐧 Linux Systems Mastery',
        thumbnail: c.thumbnail || '/assets/images/linux_course_thumbnail.webp',
        modules: mergeCourseModules(defaultLinuxCourse.modules, c.modules),
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('git & github') ||
      title.includes('git and github') ||
      String(c.id) === 'git-github-mastery' ||
      String(c.id) === 'git-github-mastery-course-id'
    ) {
      const key = 'git-github-mastery';
      const defaultGitCourse = initialDefaultCourses[1];
      const updatedItem: CourseItem = {
        ...defaultGitCourse,
        ...c,
        id: 'git-github-mastery',
        title: 'Git & GitHub Mastery',
        subtitle: '⚡ Git & GitHub Mastery',
        thumbnail: '/assets/images/github_course_banner.webp',
        modules: mergeCourseModules(defaultGitCourse.modules || gitCourseModules, c.modules),
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('database management system') ||
      title.includes('dbms') ||
      String(c.id) === 'database-management-system'
    ) {
      const key = 'database-management-system';
      const defaultDbmsCourse = initialDefaultCourses.find(item => item.id === 'database-management-system') || c;
      const updatedItem: CourseItem = {
        ...defaultDbmsCourse,
        ...c,
        id: 'database-management-system',
        title: 'Database Management System (DBMS): Beginner to Advanced',
        subtitle: '🗄️ Database Management System',
        thumbnail: '/assets/images/dbms_course_thumbnail.png',
        modules: mergeCourseModules(defaultDbmsCourse.modules, c.modules),
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('kubernetes') ||
      String(c.id) === 'kubernetes-complete-course-beginner-to-advanced'
    ) {
      const key = 'kubernetes-complete-course-beginner-to-advanced';
      const defaultK8sCourse = initialDefaultCourses.find(item => item.id === 'kubernetes-complete-course-beginner-to-advanced') || c;
      const updatedItem: CourseItem = {
        ...defaultK8sCourse,
        ...c,
        id: 'kubernetes-complete-course-beginner-to-advanced',
        title: 'Kubernetes Complete Course – Beginner to Advanced',
        subtitle: '☸️ Kubernetes Complete Course',
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
        modules: mergeCourseModules(defaultK8sCourse.modules, c.modules),
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('react js') ||
      title.includes('react complete') ||
      String(c.id) === 'react-js-complete-course'
    ) {
      const key = 'react-js-complete-course';
      const defaultReactCourse = initialDefaultCourses.find(item => item.id === 'react-js-complete-course') || c;
      const updatedItem: CourseItem = {
        ...defaultReactCourse,
        ...c,
        id: 'react-js-complete-course',
        title: 'React JS Complete Course',
        subtitle: '⚛️ React JS Complete Course',
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
        modules: mergeCourseModules(defaultReactCourse.modules, c.modules),
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('c programming') ||
      title.includes('c language') ||
      String(c.id) === 'c-programming-course-id'
    ) {
      const key = 'c-programming-course-id';
      const defaultCCourse = initialDefaultCourses.find(item => item.id === 'c-programming-course-id') || c;
      const updatedItem: CourseItem = {
        ...defaultCCourse,
        ...c,
        id: 'c-programming-course-id',
        title: 'C Programming',
        subtitle: '💻 C Programming',
        thumbnail: '/assets/images/c_course_thumbnail.png',
        modules: mergeCourseModules(defaultCCourse.modules, c.modules),
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('python through oops') ||
      title.includes('python') ||
      String(c.id) === 'python-through-oops-course-id'
    ) {
      const key = 'python-through-oops-course-id';
      const defaultPythonCourse = initialDefaultCourses.find(item => item.id === 'python-through-oops-course-id') || c;
      const updatedItem: CourseItem = {
        ...defaultPythonCourse,
        ...c,
        id: 'python-through-oops-course-id',
        title: 'Python Through OOPs',
        subtitle: '💻 Python Through OOPs',
        thumbnail: '/assets/images/python_course_thumbnail.png',
        modules: mergeCourseModules(defaultPythonCourse.modules, c.modules),
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('java through oops') ||
      title.includes('java') ||
      String(c.id) === 'java-through-oops-course-id'
    ) {
      const key = 'java-through-oops-course-id';
      const defaultJavaCourse = initialDefaultCourses.find(item => item.id === 'java-through-oops-course-id') || c;
      const updatedItem: CourseItem = {
        ...defaultJavaCourse,
        ...c,
        id: 'java-through-oops-course-id',
        title: 'Java Through OOPs',
        subtitle: '💻 Java Through OOPs',
        thumbnail: '/assets/images/java_course_thumbnail.png',
        modules: mergeCourseModules(defaultJavaCourse.modules, c.modules),
      };
      map.set(key, updatedItem);
    } else {
      map.set(String(c.id), c);
    }
  });

  if (!map.has('course_linux_101')) {
    map.set('course_linux_101', initialDefaultCourses[0]);
  }
  if (!map.has('git-github-mastery')) {
    map.set('git-github-mastery', initialDefaultCourses[1]);
  }
  if (!map.has('database-management-system')) {
    map.set('database-management-system', initialDefaultCourses[2]);
  }
  if (!map.has('kubernetes-complete-course-beginner-to-advanced')) {
    map.set('kubernetes-complete-course-beginner-to-advanced', initialDefaultCourses.find(item => item.id === 'kubernetes-complete-course-beginner-to-advanced') || initialDefaultCourses[3]);
  }
  if (!map.has('react-js-complete-course')) {
    map.set('react-js-complete-course', initialDefaultCourses.find(item => item.id === 'react-js-complete-course') || initialDefaultCourses[4]);
  }
  if (!map.has('c-programming-course-id')) {
    map.set('c-programming-course-id', initialDefaultCourses.find(item => item.id === 'c-programming-course-id') || initialDefaultCourses[5]);
  }
  if (!map.has('python-through-oops-course-id')) {
    map.set('python-through-oops-course-id', initialDefaultCourses.find(item => item.id === 'python-through-oops-course-id') || initialDefaultCourses[6]);
  }
  if (!map.has('java-through-oops-course-id')) {
    map.set('java-through-oops-course-id', initialDefaultCourses.find(item => item.id === 'java-through-oops-course-id') || initialDefaultCourses[7]);
  }

  return Array.from(map.values()).filter(item => !String(item.title || '').toLowerCase().includes('untitled'));
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as CourseItem[];
        const normalizedParsed = parsed
          .filter((c: any) => !String(c.title || '').toLowerCase().includes('untitled'))
          .map((c: any) => {
            const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
            const instructorName = typeof c.instructor === 'object' && c.instructor !== null
              ? (c.instructor.name || 'Kaizen Q Team')
              : (c.instructor || 'Kaizen Q Team');
            return {
              ...c,
              status: statusVal,
              instructor: instructorName,
            } as CourseItem;
          });

        // Auto-heal missing default modules or missing content fields
        const merged = initialDefaultCourses.map((def) => {
          const match = normalizedParsed.find((p) => String(p.id) === String(def.id));
          if (!match) return def;
          // Merge modules to inherit new lesson definitions and content
          const mergedModules = mergeCourseModules(def.modules, match.modules);
          return enrichCourseMockContent({ ...def, ...match, modules: mergedModules });
        });

        // Retain other custom admin courses
        normalizedParsed.forEach((p) => {
          if (!merged.find((m) => String(m.id) === String(p.id))) {
            if (!String(p.title || '').toLowerCase().includes('untitled')) {
              merged.push(enrichCourseMockContent(p));
            }
          }
        });

        return merged.filter((item) => !String(item.title || '').toLowerCase().includes('untitled'));
      } catch (e) {
        console.warn('LocalStorage courses parse warning:', e);
      }
    }
    return initialDefaultCourses;
  });

  const refreshCourses = useCallback(async () => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    let localList = initialDefaultCourses;
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          const mapped = parsed
            .filter((c: any) => !String(c.title || '').toLowerCase().includes('untitled'))
            .map((c: any) => {
              const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
              const instructorName = typeof c.instructor === 'object' && c.instructor !== null
                ? (c.instructor.name || 'Kaizen Q Team')
                : (c.instructor || 'Kaizen Q Team');
              return {
                ...c,
                status: statusVal,
                instructor: instructorName,
              } as CourseItem;
            });
          localList = sanitizeCourseList(mapped);
        }
      } catch (e) {
        console.warn('LocalStorage courses parse warning in refreshCourses:', e);
      }
    }
    
    setCourses(localList);

    if (!db) return;
    let merged = localList;
    try {
      const loadedResult = await courseService.getCourses();
      const loaded = loadedResult.courses;
      if (loaded && loaded.length > 0) {
        const normalized = loaded
          .filter((c: any) => !String(c.title || '').toLowerCase().includes('untitled'))
          .map((c: any) => {
            const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
            const instructorName = typeof c.instructor === 'object' && c.instructor !== null
              ? (c.instructor.name || 'Kaizen Q Team')
              : (c.instructor || 'Kaizen Q Team');
            return {
              ...c,
              status: statusVal,
              instructor: instructorName,
            } as CourseItem;
          });

        merged = sanitizeCourseList([...localList, ...normalized]);
      }
    } catch (err) {
      console.warn('Firestore courses fetch notice in refreshCourses:', err);
    }

    try {
      const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', 'react-js-complete-course'));
      const lessonsSnap = await getDocs(lessonsQuery);
      const lessonsMap = new Map<string, string>();
      lessonsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.content) {
          lessonsMap.set(docSnap.id, data.content);
        }
      });

      if (lessonsMap.size > 0) {
        merged = merged.map((c) => {
          if (String(c.id) === 'react-js-complete-course') {
            const nextModules = c.modules?.map((m) => {
              const nextTopics = m.topics?.map((t) => {
                const nextUnits = t.learningUnits?.map((u) => {
                  if (lessonsMap.has(u.id)) {
                    return {
                      ...u,
                      readingContent: lessonsMap.get(u.id),
                    };
                  }
                  return u;
                });
                return { ...t, learningUnits: nextUnits };
              });
              return { ...m, topics: nextTopics };
            });
            return { ...c, modules: nextModules };
          }
          return c;
        });
      }
    } catch (e) {
      console.warn('Failed to fetch/merge React lessons content from Firestore:', e);
    }

    setCourses(merged);
    localStorage.setItem('shaivika_courses_data', JSON.stringify(merged));
  }, []);

  // Sync with Firestore if available
  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  // Real-time synchronization for course updates across all tabs and components
  useEffect(() => {
    const handleCoursesChanged = () => {
      try {
        const stored = localStorage.getItem('shaivika_courses_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('shaivika_courses_updated', handleCoursesChanged);
    window.addEventListener('storage', handleCoursesChanged);
    return () => {
      window.removeEventListener('shaivika_courses_updated', handleCoursesChanged);
      window.removeEventListener('storage', handleCoursesChanged);
    };
  }, []);

  // Update LocalStorage whenever courses state changes
  useEffect(() => {
    localStorage.setItem('shaivika_courses_data', JSON.stringify(courses));
  }, [courses]);

  const publishedCourses = courses.filter((c) => c.status === 'Published');

  const addCourse = async (coursePayload: Partial<CourseItem>) => {
    const newId = Date.now();
    const created: CourseItem = {
      id: newId,
      title: coursePayload.title || 'Untitled Technical Course',
      subtitle: coursePayload.subtitle || '⚡ Enterprise Track',
      instructor: coursePayload.instructor || 'KaizenQ Team',
      role: coursePayload.role || 'Senior Technical Instructor',
      avatar: coursePayload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 1,
      students: '0',
      duration: coursePayload.duration || '20 hrs',
      category: coursePayload.category || 'Linux & Systems',
      level: coursePayload.level || 'Beginner to Advanced',
      badge: 'New Track',
      status: coursePayload.status || 'Published',
      price: coursePayload.price !== undefined ? coursePayload.price : 299,
      thumbnail: coursePayload.thumbnail || '/assets/images/linux_course_thumbnail.webp',
      description: coursePayload.description || 'Enterprise technical course with hands-on labs and automated AI evaluations.',
      syllabus: coursePayload.syllabus || [
        'Module 1: Fundamental Concepts & Environment Setup',
        'Module 2: Core Command Line & Configuration',
        'Module 3: Advanced Optimization & Security',
        'Module 4: Final Capstone Assessment',
      ],
    };

    const enriched = enrichCourseMockContent(created);
    setCourses((prev) => [enriched, ...prev]);

    try {
      await courseService.createCourse(enriched as any);
    } catch (e) {
      console.warn('Firestore sync failed in addCourse:', e);
    }
  };

  const toggleCourseStatus = async (id: number | string) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    const target = courses.find((c) => String(c.id) === targetId);
    if (!target) return;

    const nextStatus: 'Published' | 'Draft' = target.status === 'Published' ? 'Draft' : 'Published';
    setCourses((prev) => prev.map((c) => (String(c.id) === targetId ? { ...c, status: nextStatus } : c)));

    try {
      await courseService.updateCourse(targetId, { status: nextStatus.toLowerCase() as any });
    } catch (e) {
      console.warn('Firestore sync failed in toggleCourseStatus:', e);
    }
  };

  const deleteCourse = async (id: number | string) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    setCourses((prev) => prev.filter((c) => String(c.id) !== targetId));

    try {
      await courseService.deleteCourse(targetId);
    } catch (e) {
      console.warn('Firestore sync failed in deleteCourse:', e);
    }
  };

  const getCourseById = (idOrSlug: number | string): CourseItem | undefined => {
    const target = String(idOrSlug).toLowerCase().trim();
    if (!target) return undefined;
    return courses.find((c) => {
      const cId = String(c.id).toLowerCase().trim();
      const cSlug = String((c as any).slug || '').toLowerCase().trim();
      return cId === target || 
             (cId === 'course_linux_101' && target === '1') || 
             (cId === '1' && target === 'course_linux_101') ||
             cSlug === target;
    });
  };

  const updateCourse = async (id: number | string, updates: Partial<CourseItem>) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    setCourses((prev) => {
      const next = prev.map((c) => {
        const cId = String(c.id);
        const cSlug = String((c as any).slug || '');
        if (
          cId === targetId ||
          cSlug === targetId ||
          (cId === '1' && targetId === 'course_linux_101') ||
          (cId === 'course_linux_101' && targetId === '1')
        ) {
          return { ...c, ...updates };
        }
        return c;
      });
      localStorage.setItem('shaivika_courses_data', JSON.stringify(next));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shaivika_courses_updated', { detail: { courseId: targetId, updates } }));
      }
      return next;
    });

    try {
      await courseService.updateCourse(targetId, updates as any);
    } catch (e) {
      console.warn('Firestore sync failed in updateCourse:', e);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        publishedCourses,
        addCourse,
        toggleCourseStatus,
        deleteCourse,
        getCourseById,
        refreshCourses,
        updateCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
