import type { ModuleItem } from '../../contexts/CourseContext';

export const modules10to13: ModuleItem[] = [
  // ── MODULE 10: FILE HANDLING ──────────────────────────────────────────────
  {
    id: 'c-mod-10',
    title: 'Module 10: File Handling & Stream I/O',
    description: 'Master persistent file operations: FILE streams, fopen, fclose, text modes ("r", "w", "a"), binary modes ("rb", "wb"), fprintf, fscanf, fgets, and fseek.',
    duration: '4 Hours',
    topics: [
      {
        id: 'c-topic-10-1-file-basics',
        title: 'Topic 1: File Streams & Text File Operations',
        description: 'Understand file pointers, access modes, error handling, formatted text reading and writing.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-10-1-file-streams',
            title: 'Unit 1: File Operations with fopen, fprintf & fgets',
            description: 'Master opening file streams, writing structured records, appending data, and closing streams cleanly.',
            duration: '30 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand the FILE structure pointer.',
              'Open files in "w" (write), "r" (read), and "a" (append) modes.',
              'Read lines safely with fgets() and write with fprintf().',
              'Always close files with fclose() to flush write buffers.'
            ],
            readingContent: `# File Handling in C

## Overview
Files store data permanently on disk drives so data is preserved even after your program terminates.

## Learning Objectives
- Master file modes: \`"r"\` (read), \`"w"\` (write/overwrite), \`"a"\` (append).
- Read structured lines using \`fgets()\`.
- Always check if \`fopen()\` returned \`NULL\`.

## 1. Writing to a Text File (\`"w"\` mode)
\`\`\`c
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("students.txt", "w");
    if (fp == NULL) {
        perror("Failed to open file");
        return 1;
    }

    fprintf(fp, "ID,Name,Grade\\n");
    fprintf(fp, "101,Alice Chen,A+\\n");
    fprintf(fp, "102,Bob Smith,B\\n");

    fclose(fp); // Flushes buffer and releases OS file handle
    printf("Successfully wrote records to students.txt\\n");
    return 0;
}
\`\`\`

## 2. Reading Line-by-Line (\`"r"\` mode)
\`\`\`c
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("students.txt", "r");
    if (fp == NULL) {
        perror("Error opening file for reading");
        return 1;
    }

    char buffer[256];
    printf("Reading from file:\\n-------------------\\n");
    while (fgets(buffer, sizeof(buffer), fp) != NULL) {
        printf("%s", buffer);
    }

    fclose(fp);
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Successfully wrote records to students.txt
Reading from file:
-------------------
ID,Name,Grade
101,Alice Chen,A+
102,Bob Smith,B
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> Forgetting to call \`fclose(fp)\` can result in data loss because the operating system buffers written bytes in RAM before flushing them to physical disk sectors!`,
            codeExamples: [
              {
                id: 'code-m10-1',
                title: 'File Append Example',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    FILE *fp = fopen("log.txt", "a");\n    if (fp) {\n        fprintf(fp, "[INFO] System initialized successfully.\\n");\n        fclose(fp);\n    }\n    return 0;\n}`,
                explanation: 'Demonstrates appending log messages to a persistent file.'
              }
            ],
            keyPoints: [
              'fopen() returns NULL if a file cannot be opened or does not exist in read mode.',
              'Mode "w" truncates/overwrites existing files; mode "a" appends to the end.',
              'fclose() flushes internal write buffers and releases OS file descriptors.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m10-1',
                question: 'What happens if you open a non-existent file in "r" (read) mode?',
                answer: 'fopen() fails and returns NULL.',
                explanation: 'Read mode requires the file to exist already on disk; it does not automatically create new files.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m10-1',
                title: 'C File I/O Reference',
                url: 'https://en.cppreference.com/w/c/io',
                description: 'Official standard library file stream input and output functions.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 11: PREPROCESSOR AND ADVANCED C ────────────────────────────────
  {
    id: 'c-mod-11',
    title: 'Module 11: Preprocessor & Advanced C',
    description: 'Learn preprocessor directives (#include, #define, #ifdef), macro functions, header guards, storage classes (static, extern), and command-line arguments (argc, argv).',
    duration: '3.5 Hours',
    topics: [
      {
        id: 'c-topic-11-1-preprocessor',
        title: 'Topic 1: Preprocessor, Macros & Storage Classes',
        description: 'Understand macro text substitution, conditional compilation, header guards, static vs extern, and CLI arguments.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-11-1-macros-and-cli',
            title: 'Unit 1: Macros, Header Guards & Command Line Arguments',
            description: 'Master parameter macros, conditional compilation guards, storage class specifiers, and int main(int argc, char *argv[]).',
            duration: '30 mins',
            type: 'Reading',
            learningObjectives: [
              'Write parameterized macros and avoid precedence traps.',
              'Use #ifndef / #define header include guards.',
              'Process command-line arguments with argc and argv.'
            ],
            readingContent: `# Preprocessor & Advanced C

## Overview
The C Preprocessor runs **before** compilation, performing text substitutions, file inclusions, and conditional filtering.

## Learning Objectives
- Use \`#define\` macros safely with parentheses.
- Create modular header files with include guards.
- Parse command-line parameters in \`main()\`.

## 1. Parameterized Macros
\`\`\`c
#include <stdio.h>

// Always wrap macro parameters in parentheses!
#define SQUARE(x) ((x) * (x))
#define MAX(a, b) (((a) > (b)) ? (a) : (b))

int main(void) {
    int val = 5;
    printf("SQUARE(5 + 1) = %d\\n", SQUARE(val + 1)); // ((5+1) * (5+1)) = 36
    printf("MAX(10, 25)   = %d\\n", MAX(10, 25));
    return 0;
}
\`\`\`

## 2. Command-Line Arguments
\`\`\`c
#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("Program Name: %s\\n", argv[0]);
    printf("Total Arguments Count (argc): %d\\n", argc);

    for (int i = 1; i < argc; i++) {
        printf("Argument %d: %s\\n", i, argv[i]);
    }
    return 0;
}
\`\`\`

## Expected Output (When run with: \`./program hello world\`)
\`\`\`text
Program Name: ./program
Total Arguments Count (argc): 3
Argument 1: hello
Argument 2: world
\`\`\`

## Common Mistakes & Pro Tips
> [!WARNING]
> Without parentheses in \`#define SQUARE(x) x * x\`, calling \`SQUARE(5 + 1)\` expands to \`5 + 1 * 5 + 1\` = \`11\` instead of \`36\`! Always wrap macro parameters in parentheses.`,
            codeExamples: [
              {
                id: 'code-m11-1',
                title: 'Standard Header Include Guard Pattern',
                language: 'c',
                code: `// my_header.h\n#ifndef MY_HEADER_H\n#define MY_HEADER_H\n\nvoid compute(int x);\n\n#endif // MY_HEADER_H`,
                explanation: 'Prevents multiple inclusion compilation errors across header hierarchies.'
              }
            ],
            keyPoints: [
              '#define performs textual substitution before compilation.',
              'Include guards prevent duplicate header definitions.',
              'argc is argument count; argv is an array of null-terminated string pointers.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m11-1',
                question: 'What is argv[0] in a standard C command-line program?',
                answer: 'A string containing the path or name of the executing program binary itself.',
                explanation: 'By standard convention, the zeroth argument passed to main() is the executable invocation string.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m11-1',
                title: 'GNU C Preprocessor Manual',
                url: 'https://gcc.gnu.org/onlinedocs/cpp/',
                description: 'Official manual on macro expansion, token pasting, and directives.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 12: DATA STRUCTURES WITH C ─────────────────────────────────────
  {
    id: 'c-mod-12',
    title: 'Module 12: Data Structures with C',
    description: 'Implement fundamental computer science data structures in pure C: Singly Linked Lists, Stacks (LIFO), Queues (FIFO), Linear Search, Binary Search, Bubble Sort, and Insertion Sort.',
    duration: '4.5 Hours',
    topics: [
      {
        id: 'c-topic-12-1-linear-ds',
        title: 'Topic 1: Linked Lists, Stacks & Queues',
        description: 'Understand dynamic node pointers, linked list traversal/insertion, stack push/pop, and queue enqueue/dequeue.',
        estimatedDuration: '75 mins',
        learningUnits: [
          {
            id: 'c-unit-12-1-linked-lists-stacks',
            title: 'Unit 1: Singly Linked Lists & Stacks in C',
            description: 'Implement self-referential struct nodes, dynamic node allocation with malloc, list traversal, and LIFO Stack buffers.',
            duration: '35 mins',
            type: 'Reading',
            learningObjectives: [
              'Construct self-referential struct Node types.',
              'Insert and delete nodes in a singly linked list.',
              'Implement a LIFO Stack using pure C pointer links.'
            ],
            readingContent: `# Singly Linked Lists in C

## Overview
A **Linked List** is a linear data structure where elements are not stored in contiguous memory. Instead, each **Node** contains a data field and a **pointer** (\`next\`) to the subsequent node.

## Node Structure Definition
\`\`\`c
#include <stdio.h>
#include <stdlib.h>

// Self-referential struct
typedef struct Node {
    int data;
    struct Node *next;
} Node;

// Insert new node at beginning of list (O(1))
void insertAtHead(Node **head, int val) {
    Node *newNode = (Node*)malloc(sizeof(Node));
    newNode->data = val;
    newNode->next = *head;
    *head = newNode;
}

// Traverse and print list
void printList(const Node *head) {
    const Node *curr = head;
    printf("Linked List: ");
    while (curr != NULL) {
        printf("[%d] -> ", curr->data);
        curr = curr->next;
    }
    printf("NULL\\n");
}

int main(void) {
    Node *head = NULL;

    insertAtHead(&head, 30);
    insertAtHead(&head, 20);
    insertAtHead(&head, 10);

    printList(head);

    // Free memory
    Node *curr = head;
    while (curr != NULL) {
        Node *temp = curr;
        curr = curr->next;
        free(temp);
    }

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Linked List: [10] -> [20] -> [30] -> NULL
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> When freeing a linked list, never call \`free(curr)\` before updating \`curr = curr->next\`. Once freed, accessing \`curr->next\` is an illegal memory read!`,
            codeExamples: [
              {
                id: 'code-m12-1',
                title: 'Binary Search Algorithm Implementation',
                language: 'c',
                code: `#include <stdio.h>\n\nint binarySearch(int arr[], int n, int target) {\n    int low = 0, high = n - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1; // Not found\n}\n\nint main(void) {\n    int sorted[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};\n    int idx = binarySearch(sorted, 10, 23);\n    printf("Target 23 found at index: %d\\n", idx);\n    return 0;\n}`,
                explanation: 'O(log n) binary search on sorted array.'
              }
            ],
            keyPoints: [
              'Linked list nodes connect dynamically via heap pointers.',
              'Inserting at head is O(1) time complexity.',
              'Binary search provides logarithmic O(log n) lookup on sorted arrays.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m12-1',
                question: 'What is the time complexity of searching an element in an unsorted linked list vs a sorted array with binary search?',
                answer: 'Linked List search is O(n) linear time; Binary search on a sorted array is O(log n) logarithmic time.',
                explanation: 'Linked lists lack random access, requiring sequential traversal.',
                difficulty: 'Medium'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m12-1',
                title: 'Data Structures Reference (NIST)',
                url: 'https://en.wikipedia.org/wiki/Linked_list',
                description: 'Detailed analysis of pointer-based linked data structures.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 13: PRACTICAL PROJECTS ─────────────────────────────────────────
  {
    id: 'c-mod-13',
    title: 'Module 13: Practical Projects & Capstone',
    description: 'Build complete, production-grade real-world C projects from scratch: Command-Line Calculator, Student Grade Evaluator, Number Guessing Game, Banking Account System, Contact Directory, Student Record System, and File-Based Notes App.',
    duration: '6 Hours',
    topics: [
      {
        id: 'c-topic-13-1-capstone-projects',
        title: 'Topic 1: Real-World C Capstone Applications',
        description: 'Complete hands-on projects with problem statements, requirements, architecture, and full working code.',
        estimatedDuration: '120 mins',
        learningUnits: [
          {
            id: 'c-unit-13-1-calculator',
            title: 'Project 1: Command-Line Scientific Calculator',
            description: 'Build a menu-driven arithmetic and power calculation engine with input validation and loop control.',
            duration: '30 mins',
            type: 'Reading',
            learningObjectives: [
              'Implement modular functions for arithmetic operations.',
              'Handle divide-by-zero validation.',
              'Create an interactive CLI loop.'
            ],
            readingContent: `# Project 1: Command-Line Scientific Calculator

## Overview
Build a clean, robust CLI calculator that supports addition, subtraction, multiplication, division, modulus, and exponentiation.

## Requirements
- Support operations: \`+\`, \`-\`, \`*\`, \`/\`, \`%\`, and \`^\`.
- Provide error messages for invalid inputs and division by zero.
- Run continuously until the user chooses to exit.

## Complete C Source Code
\`\`\`c
#include <stdio.h>
#include <math.h>

void showMenu(void) {
    printf("\\n==============================\\n");
    printf("     KaizenQ CLI Calculator   \\n");
    printf("==============================\\n");
    printf("1. Addition (+)\\n");
    printf("2. Subtraction (-)\\n");
    printf("3. Multiplication (*)\\n");
    printf("4. Division (/)\\n");
    printf("5. Power (x^y)\\n");
    printf("6. Exit\\n");
    printf("Enter choice (1-6): ");
}

int main(void) {
    int choice;
    double num1, num2, result;

    while (1) {
        showMenu();
        if (scanf("%d", &choice) != 1) {
            printf("Invalid input! Exiting.\\n");
            break;
        }

        if (choice == 6) {
            printf("Thank you for using KaizenQ Calculator. Goodbye!\\n");
            break;
        }

        if (choice < 1 || choice > 6) {
            printf("Invalid choice. Please select 1-6.\\n");
            continue;
        }

        printf("Enter first number: ");
        scanf("%lf", &num1);
        printf("Enter second number: ");
        scanf("%lf", &num2);

        switch (choice) {
            case 1:
                result = num1 + num2;
                printf("Result: %.2f + %.2f = %.2f\\n", num1, num2, result);
                break;
            case 2:
                result = num1 - num2;
                printf("Result: %.2f - %.2f = %.2f\\n", num1, num2, result);
                break;
            case 3:
                result = num1 * num2;
                printf("Result: %.2f * %.2f = %.2f\\n", num1, num2, result);
                break;
            case 4:
                if (num2 == 0) {
                    printf("Error: Division by zero is mathematically undefined!\\n");
                } else {
                    result = num1 / num2;
                    printf("Result: %.2f / %.2f = %.2f\\n", num1, num2, result);
                }
                break;
            case 5:
                result = pow(num1, num2);
                printf("Result: %.2f ^ %.2f = %.2f\\n", num1, num2, result);
                break;
        }
    }

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
==============================
     KaizenQ CLI Calculator   
==============================
1. Addition (+)
2. Subtraction (-)
3. Multiplication (*)
4. Division (/)
5. Power (x^y)
6. Exit
Enter choice (1-6): 1
Enter first number: 45.5
Enter second number: 14.5
Result: 45.50 + 14.50 = 60.00
\`\`\``,
            codeExamples: [
              {
                id: 'code-proj-1',
                title: 'Calculator Program',
                language: 'c',
                code: `// Compile with math library:\n// gcc -Wall calculator.c -o calculator -lm`,
                explanation: 'Build instruction noting the -lm flag required for pow().'
              }
            ],
            keyPoints: [
              'Menu loops using while(1) create interactive CLI utilities.',
              'Always validate denominator values before division.',
              'Link math library with -lm when using math.h functions.'
            ],
            practiceQuestions: [
              {
                id: 'pq-proj-1',
                question: 'Why is the -lm flag required when compiling C programs that use math.h functions like pow() on GCC?',
                answer: 'Because libm (standard math runtime library) is not linked by default and must be explicitly specified to the linker.',
                explanation: '-l flag instructs the linker to include libm.so / libm.a.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-proj-1',
                title: 'C Math Library Reference',
                url: 'https://en.cppreference.com/w/c/numeric/math',
                description: 'Documentation on math.h functions and precision limits.'
              }
            ]
          },
          {
            id: 'c-unit-13-2-student-records',
            title: 'Project 2: Student Record & File Management System',
            description: 'Build a full CRUD student record database using structs, dynamic arrays, and persistent file saving.',
            duration: '35 mins',
            type: 'Reading',
            learningObjectives: [
              'Design a persistent struct-based database.',
              'Implement Add, Display, Search, and Save to disk operations.',
              'Manage data persistence using text files.'
            ],
            readingContent: `# Project 2: Student Record & File Management System

## Overview
Develop a real-world system capable of adding, viewing, searching, and saving student academic records to disk.

## Complete C Source Code
\`\`\`c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STUDENTS 100
#define DB_FILE "student_db.txt"

typedef struct {
    int rollNumber;
    char name[50];
    float marks;
} StudentRecord;

StudentRecord db[MAX_STUDENTS];
int studentCount = 0;

void loadFromFile(void) {
    FILE *fp = fopen(DB_FILE, "r");
    if (!fp) return; // File doesn't exist yet

    studentCount = 0;
    while (fscanf(fp, "%d,%49[^,],%f\\n", 
                  &db[studentCount].rollNumber, 
                  db[studentCount].name, 
                  &db[studentCount].marks) == 3) {
        studentCount++;
        if (studentCount >= MAX_STUDENTS) break;
    }
    fclose(fp);
}

void saveToFile(void) {
    FILE *fp = fopen(DB_FILE, "w");
    if (!fp) {
        printf("Error: Could not save to disk!\\n");
        return;
    }

    for (int i = 0; i < studentCount; i++) {
        fprintf(fp, "%d,%s,%.2f\\n", db[i].rollNumber, db[i].name, db[i].marks);
    }
    fclose(fp);
    printf("Records saved to %s\\n", DB_FILE);
}

void addStudent(void) {
    if (studentCount >= MAX_STUDENTS) {
        printf("Database is full!\\n");
        return;
    }

    StudentRecord s;
    printf("Enter Roll Number: ");
    scanf("%d", &s.rollNumber);
    getchar(); // Consume newline

    printf("Enter Full Name: ");
    fgets(s.name, sizeof(s.name), stdin);
    s.name[strcspn(s.name, "\\n")] = 0; // Strip trailing newline

    printf("Enter Marks (0-100): ");
    scanf("%f", &s.marks);

    db[studentCount++] = s;
    saveToFile();
    printf("Student added successfully!\\n");
}

void displayStudents(void) {
    if (studentCount == 0) {
        printf("No records found in database.\\n");
        return;
    }

    printf("\\n--------------------------------------------------\\n");
    printf("%-8s | %-25s | %-6s\\n", "Roll No", "Name", "Marks");
    printf("--------------------------------------------------\\n");
    for (int i = 0; i < studentCount; i++) {
        printf("%-8d | %-25s | %-6.2f\\n", db[i].rollNumber, db[i].name, db[i].marks);
    }
    printf("--------------------------------------------------\\n");
}

int main(void) {
    loadFromFile();
    int choice;

    while (1) {
        printf("\\n=== STUDENT RECORD SYSTEM ===\\n");
        printf("1. Add Student Record\\n");
        printf("2. Display All Records\\n");
        printf("3. Exit\\n");
        printf("Choose option: ");
        
        if (scanf("%d", &choice) != 1) break;

        switch (choice) {
            case 1: addStudent(); break;
            case 2: displayStudents(); break;
            case 3: 
                printf("Exiting system. All data saved.\\n"); 
                return 0;
            default: printf("Invalid choice.\\n");
        }
    }
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
=== STUDENT RECORD SYSTEM ===
1. Add Student Record
2. Display All Records
3. Exit
Choose option: 1
Enter Roll Number: 101
Enter Full Name: Sarah Jenkins
Enter Marks (0-100): 94.5
Records saved to student_db.txt
Student added successfully!
\`\`\``,
            codeExamples: [
              {
                id: 'code-proj-2',
                title: 'Student Record Management System',
                language: 'c',
                code: `// Build with gcc:\ngcc -Wall student_system.c -o student_system`,
                explanation: 'Compilation and execution instructions for the Student Database project.'
              }
            ],
            keyPoints: [
              'Combines structs, arrays, loops, I/O formatting, and persistent disk files.',
              'fscanf formatting with %49[^,] safely reads comma-separated text values.',
              'Data persists across program restarts.'
            ],
            practiceQuestions: [
              {
                id: 'pq-proj-2',
                question: 'What is the purpose of s.name[strcspn(s.name, "\\n")] = 0; after calling fgets()?',
                answer: 'It removes the trailing newline character (\\n) that fgets() captures when the user presses Enter, replacing it with a null terminator (\\0).',
                explanation: 'strcspn finds the index of the newline character so it can be cleanly stripped.',
                difficulty: 'Medium'
              }
            ],
            resourceLinks: [
              {
                id: 'res-proj-2',
                title: 'C Structured File Storage Patterns',
                url: 'https://en.wikipedia.org/wiki/Comma-separated_values',
                description: 'Best practices for serialization and parsing structured CSV data in C.'
              }
            ]
          }
        ]
      }
    ]
  }
];
