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

## Key Characteristics of RDBMS
- **Tabular Structure**: Data is modeled strictly as tuples (records) within relations (tables).
- **Schema-Enforced Integrity**: Primary keys, Foreign keys, Unique, and Check constraints.
- **Declarative Querying**: SQL allows developers to specify *what* data to retrieve rather than *how*.
`,

  2: `# Module 2: SQL Fundamentals & Data Definition Language (DDL)

## Overview
Data Definition Language (DDL) defines, alters, and drops schema objects. Understanding data types, primary keys, and foreign keys forms the backbone of any relational database.

## Learning Objectives
- Master \`CREATE TABLE\`, \`ALTER TABLE\`, \`DROP TABLE\`, and \`TRUNCATE TABLE\`.
- Implement constraints: \`PRIMARY KEY\`, \`FOREIGN KEY\`, \`NOT NULL\`, \`UNIQUE\`, and \`CHECK\`.
- Configure Cascade rules: \`ON DELETE CASCADE\` and \`ON UPDATE CASCADE\`.

## Example: Production Student Table
\`\`\`sql
CREATE TABLE students (
    student_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    xp_points INT DEFAULT 0 CHECK (xp_points >= 0),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`
`,

  3: `# Module 3: Data Manipulation Language (DML) & Basic Queries

## Overview
Data Manipulation Language (DML) allows inserting, updating, deleting, and querying records. 

## Learning Objectives
- Master \`INSERT INTO\`, \`UPDATE\`, and \`DELETE FROM\`.
- Execute targeted \`SELECT\` queries with \`WHERE\`, \`ORDER BY\`, \`LIMIT\`, and \`OFFSET\`.
- Utilize Pattern Matching with \`LIKE\` and SQL Wildcards (\`%\`, \`_\`).
- Perform Aggregations with \`COUNT()\`, \`SUM()\`, \`AVG()\`, \`MIN()\`, \`MAX()\`, and \`GROUP BY\`.

## Example: Querying Top Students
\`\`\`sql
SELECT full_name, email, xp_points
FROM students
WHERE xp_points > 250
ORDER BY xp_points DESC
LIMIT 10;
\`\`\`
`,

  4: `# Module 4: Relational JOINs & Subqueries

## Overview
Relational power comes from linking normalized tables together through foreign keys and querying them efficiently using JOIN operations.

## Learning Objectives
- Master JOIN types:
  - **INNER JOIN**: Returns records matching in both tables.
  - **LEFT (OUTER) JOIN**: Returns all left table records and matched right records.
  - **RIGHT (OUTER) JOIN**: Returns all right table records and matched left records.
  - **FULL (OUTER) JOIN**: Returns all records when there is a match in either table.
  - **CROSS JOIN**: Cartesian product of two tables.
- Write correlated and non-correlated Subqueries.

## Example: Student Course Enrollments Query
\`\`\`sql
SELECT 
    s.full_name,
    c.title AS course_title,
    e.progress_percentage
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
- Identify Functional Dependencies ($X \\to Y$).
- **First Normal Form (1NF)**: Atomic attributes, no repeating groups, unique primary key.
- **Second Normal Form (2NF)**: In 1NF and no partial dependencies (every non-prime attribute is fully functionally dependent on the candidate key).
- **Third Normal Form (3NF)**: In 2NF and no transitive dependencies ($A \\to B$ and $B \\to C$).
- **Boyce-Codd Normal Form (BCNF)**: For every functional dependency $X \\to Y$, $X$ must be a super key.

> 💡 **Tip:** 3NF is the universal industry sweet-spot for OLTP applications balancing normalization cleanliness with query performance.
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
    title: 'Module 3: Data Manipulation Language & Basic Queries',
    description: 'INSERT, UPDATE, DELETE, filtering, aggregation, and grouping.',
    duration: '4 Hours',
    topics: [
      {
        id: 'dbms-top-3',
        title: 'DML, WHERE & Aggregations',
        description: 'CRUD operations, aggregate functions, and GROUP BY / HAVING.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-3-notes',
            'Module 3 - Complete Notes',
            'SQL DML, Filtering, Aggregations & Grouping.',
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
    title: 'Module 4: Relational JOINs & Complex Subqueries',
    description: 'INNER, LEFT, RIGHT, FULL OUTER joins, nested and correlated subqueries.',
    duration: '5 Hours',
    topics: [
      {
        id: 'dbms-top-4',
        title: 'SQL JOINs & Subquery Patterns',
        description: 'Joining multiple tables, subqueries, and set operations.',
        estimatedDuration: '50 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-4-notes',
            'Module 4 - Complete Notes',
            'Relational JOINs, Outer Joins & Subqueries.',
            '50 mins',
            'Reading',
            dbmsSyllabusNotes[4]
          )
        ]
      }
    ]
  },
  {
    id: 'dbms-mod-5',
    title: 'Module 5: Database Normalization (1NF, 2NF, 3NF, BCNF)',
    description: 'Functional dependencies, decomposing anomalies, and normal forms.',
    duration: '5 Hours',
    topics: [
      {
        id: 'dbms-top-5',
        title: 'Normalization Principles & Normal Forms',
        description: '1NF, 2NF, 3NF, BCNF decomposition and dependency preservation.',
        estimatedDuration: '50 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-5-notes',
            'Module 5 - Complete Notes',
            'Database Normalization & Functional Dependencies.',
            '50 mins',
            'Reading',
            dbmsSyllabusNotes[5]
          )
        ]
      }
    ]
  },
  {
    id: 'dbms-mod-6',
    title: 'Module 6: Transactions, ACID & Concurrency Control',
    description: 'ACID transactions, locking protocols, deadlocks, and isolation levels.',
    duration: '4 Hours',
    topics: [
      {
        id: 'dbms-top-6',
        title: 'Transactions & ACID Guarantees',
        description: 'Transaction isolation levels, WAL logs, and concurrency control.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'dbms-unit-6-notes',
            'Module 6 - Complete Notes',
            'Database Transactions, ACID & Concurrency.',
            '45 mins',
            'Reading',
            dbmsSyllabusNotes[6]
          )
        ]
      }
    ]
  }
];
