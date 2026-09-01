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
      name: 'DBMS Complete Notes.pdf',
      description: 'Database Management Systems & SQL Complete Notes.',
      category: 'PDF',
      fileSize: '4.9 MB',
      downloadPermission: true,
      url: '/dbms-complete-notes.pdf'
    }
  ]
});

const dbmsSyllabusNotes: Record<number, string> = {
  1: `# Module 1: Introduction to DBMS & Relational Model

## Overview
A Database Management System (DBMS) is enterprise software designed to store, manage, query, and secure electronic data. Relational Database Management Systems (RDBMS) model data into two-dimensional tables (relations) comprising rows (tuples) and columns (attributes).

## Learning Objectives
- Differentiate between Raw Data, Information, Metadata, and Database Schemas.
- Understand the limitations of File Systems (Data Redundancy, Inconsistency, Lack of Concurrency).
- Master 3-Tier ANSI-SPARC DBMS Architecture (Physical, Conceptual, External Views).

## Architecture: 3-Tier ANSI/SPARC Framework
\`\`\`text
┌─────────────────────────────────────────────────────────────┐
│                       External Level                        │
│            View 1 (Student)        View 2 (Instructor)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ (External/Conceptual Mapping)
┌──────────────────────────────▼──────────────────────────────┐
│                      Conceptual Level                       │
│             Logical Schema (Entities, Relationships)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Conceptual/Internal Mapping)
┌──────────────────────────────▼──────────────────────────────┐
│                       Internal Level                        │
│               Physical Storage (B-Trees, Blocks)            │
└─────────────────────────────────────────────────────────────┘
\`\`\`

> 💡 **Tip:** Logical Data Independence allows changing the conceptual schema (adding columns/tables) without altering the user views or external application code.
`,

  2: `# Module 2: SQL Fundamentals & Data Definition Language (DDL)

## Overview
Structured Query Language (SQL) is the standardized declarative domain-specific language for interacting with relational databases.

## Learning Objectives
- Master Data Definition Language commands: \`CREATE TABLE\`, \`ALTER TABLE\`, \`DROP TABLE\`, \`TRUNCATE TABLE\`.
- Enforce Integrity Constraints: \`PRIMARY KEY\`, \`FOREIGN KEY\`, \`UNIQUE\`, \`NOT NULL\`, and \`CHECK\`.
- Understand SQL data types (\`INT\`, \`VARCHAR\`, \`BOOLEAN\`, \`TIMESTAMP\`, \`DECIMAL\`).

## Example: Relational Schema Definition
\`\`\`sql
CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  xp_points INT DEFAULT 0 CHECK (xp_points >= 0)
);

CREATE TABLE course_enrollments (
  enrollment_id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

> 📌 **Note:** \`ON DELETE CASCADE\` ensures child records in \`course_enrollments\` are automatically pruned when the referenced parent student is deleted.
`,

  3: `# Module 3: Data Manipulation Language (DML) & Complex Queries

## Overview
Data Manipulation Language (DML) queries allow applications to retrieve, filter, sort, aggregate, and update stored records.

## Learning Objectives
- Execute CRUD operations: \`INSERT INTO\`, \`SELECT\`, \`UPDATE\`, and \`DELETE\`.
- Filter with \`WHERE\`, \`LIKE\`, \`IN\`, \`BETWEEN\`, \`IS NULL\`, and Logical Operators (\`AND\`, \`OR\`, \`NOT\`).
- Aggregate data using \`COUNT()\`, \`SUM()\`, \`AVG()\`, \`MIN()\`, \`MAX()\`, paired with \`GROUP BY\` and \`HAVING\`.

## Example: Aggregation & Grouping
\`\`\`sql
-- Find courses with more than 5 enrolled students
SELECT 
  course_id,
  COUNT(student_id) AS total_enrolled,
  AVG(xp_points) AS average_student_xp
FROM course_enrollments e
JOIN students s ON e.student_id = s.student_id
GROUP BY course_id
HAVING COUNT(student_id) > 5
ORDER BY total_enrolled DESC;
\`\`\`

> 💡 **Tip:** Use \`WHERE\` to filter individual rows *before* aggregation, and use \`HAVING\` to filter grouped aggregates *after* grouping.
`,

  4: `# Module 4: SQL Joins, Subqueries & Set Operations

## Overview
Relational power derives from joining disparate normalized tables together at query time via primary-foreign key relationships.

## Learning Objectives
- Master all Join types: \`INNER JOIN\`, \`LEFT (OUTER) JOIN\`, \`RIGHT (OUTER) JOIN\`, \`FULL (OUTER) JOIN\`, and \`CROSS JOIN\`.
- Write correlated and non-correlated Subqueries in \`SELECT\`, \`FROM\`, and \`WHERE\` clauses.
- Perform Set Operations: \`UNION\`, \`UNION ALL\`, \`INTERSECT\`, and \`EXCEPT\`.

## Example: Complex Multi-Table Join
\`\`\`sql
SELECT 
  s.student_id,
  s.full_name,
  s.email,
  c.title AS course_title,
  e.completed
FROM students s
LEFT JOIN course_enrollments e ON s.student_id = e.student_id
LEFT JOIN courses c ON e.course_id = c.id
WHERE s.xp_points >= 100;
\`\`\`
`,

  5: `# Module 5: Database Normalization (1NF, 2NF, 3NF, BCNF)

## Overview
Normalization is the systematic formal process of decomposing tables to eliminate update, insertion, and deletion anomalies while minimizing data redundancy.

## Learning Objectives
- Identify Functional Dependencies ($X \to Y$).
- **First Normal Form (1NF)**: Atomic attributes, no repeating groups, unique primary key.
- **Second Normal Form (2NF)**: In 1NF and no partial dependencies (every non-prime attribute is fully functionally dependent on the candidate key).
- **Third Normal Form (3NF)**: In 2NF and no transitive dependencies ($A \to B$ and $B \to C$).
- **Boyce-Codd Normal Form (BCNF)**: For every functional dependency $X \to Y$, $X$ must be a super key.

> 💡 **Tip:** 3NF is the universal industry sweet-spot for OLTP (Online Transaction Processing) applications balancing normalization cleanliness with query performance.
`,

  6: `# Module 6: Transactions, ACID Properties & Concurrency

## Overview
A Transaction is a logical unit of database processing consisting of one or more SQL operations executed as an indivisible atomic block.

## Learning Objectives
- Master the ACID Properties:
  - **Atomicity**: All operations succeed or all are rolled back (\`COMMIT\` / \`ROLLBACK\`).
  - **Consistency**: The database transitions from one valid state to another satisfying all integrity constraints.
  - **Isolation**: Concurrent transactions execute without interfering with one another.
  - **Durability**: Committed data persists across crashes and power losses (Write-Ahead Logging).
- Understand Concurrency Anomalies: Dirty Reads, Non-Repeatable Reads, and Phantom Reads.
- Master ANSI Transaction Isolation Levels: \`READ UNCOMMITTED\`, \`READ COMMITTED\`, \`REPEATABLE READ\`, and \`SERIALIZABLE\`.

## Example: ACID Transaction Block
\`\`\`sql
BEGIN TRANSACTION;

-- Deduct balance from student wallet
UPDATE user_wallets 
SET balance = balance - 49.99 
WHERE user_id = 'user_123' AND balance >= 49.99;

-- Record course enrollment
INSERT INTO enrollments (user_id, course_id, enrolled_at)
VALUES ('user_123', 'c-programming-course-id', CURRENT_TIMESTAMP);

COMMIT;
\`\`\`
`
};

export const dbmsCourseModules: ModuleItem[] = [
  {
    id: 'dbms-mod-1',
    title: 'Module 1: Introduction to DBMS & Relational Model',
    description: 'DBMS fundamentals, 3-tier architecture, and relational concepts.',
    duration: '4 Hours',
    topics: [
      {
        id: 'dbms-top-1',
        title: 'Data, DBMS & Relational Architecture',
        description: 'Data vs information, metadata, file systems vs DBMS, and ANSI-SPARC architecture.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-1-notes',
            'Module 1 - Complete Notes',
            'DBMS Architecture & Relational Data Model.',
            '45 mins',
            'Reading',
            dbmsSyllabusNotes[1]
          )
        ]
      }
    ]
  },
  {
    id: 'dbms-mod-2',
    title: 'Module 2: SQL Fundamentals & Data Definition Language',
    description: 'DDL commands, CREATE, ALTER, DROP, constraints, and data types.',
    duration: '4 Hours',
    topics: [
      {
        id: 'dbms-top-2',
        title: 'DDL & Schema Constraints',
        description: 'Creating tables, foreign keys, cascade deletes, and constraints.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-2-notes',
            'Module 2 - Complete Notes',
            'SQL DDL & Relational Schema Constraints.',
            '45 mins',
            'Reading',
            dbmsSyllabusNotes[2]
          )
        ]
      }
    ]
  },
  {
    id: 'dbms-mod-3',
    title: 'Module 3: Data Manipulation Language & Aggregation',
    description: 'DML CRUD operations, WHERE clauses, GROUP BY, and HAVING.',
    duration: '4 Hours',
    topics: [
      {
        id: 'dbms-top-3',
        title: 'DML & Aggregate Functions',
        description: 'Filtering, grouping, count, sum, average, and sorting.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-3-notes',
            'Module 3 - Complete Notes',
            'SQL DML, Aggregation & Grouping.',
            '45 mins',
            'Reading',
            dbmsSyllabusNotes[3]
          )
        ]
      }
    ]
  },
  {
    id: 'dbms-mod-4',
    title: 'Module 4: SQL Joins, Subqueries & Set Operations',
    description: 'Inner joins, outer joins, nested subqueries, and union operations.',
    duration: '5 Hours',
    topics: [
      {
        id: 'dbms-top-4',
        title: 'Joins & Subqueries',
        description: 'Multi-table queries, subqueries, and set operations.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-4-notes',
            'Module 4 - Complete Notes',
            'SQL Joins, Subqueries & Set Operations.',
            '45 mins',
            'Reading',
            dbmsSyllabusNotes[4]
          )
        ]
      }
    ]
  },
  {
    id: 'dbms-mod-5',
    title: 'Module 5: Database Normalization',
    description: 'Functional dependencies, 1NF, 2NF, 3NF, and BCNF normalization.',
    duration: '4 Hours',
    topics: [
      {
        id: 'dbms-top-5',
        title: 'Relational Normalization & Anomalies',
        description: 'Eliminating anomalies through 1NF, 2NF, 3NF, and BCNF decomposition.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-5-notes',
            'Module 5 - Complete Notes',
            'Relational Normalization & Functional Dependencies.',
            '45 mins',
            'Reading',
            dbmsSyllabusNotes[5]
          )
        ]
      }
    ]
  },
  {
    id: 'dbms-mod-6',
    title: 'Module 6: Transactions, ACID Properties & Concurrency',
    description: 'Transactions, ACID rules, serializability, and lock management.',
    duration: '4 Hours',
    topics: [
      {
        id: 'dbms-top-6',
        title: 'ACID Transactions & Isolation Levels',
        description: 'Concurrency control, dirty reads, isolation levels, and WAL.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-6-notes',
            'Module 6 - Complete Notes',
            'Database Transactions, ACID & Concurrency Control.',
            '45 mins',
            'Reading',
            dbmsSyllabusNotes[6]
          )
        ]
      }
    ]
  }
];
