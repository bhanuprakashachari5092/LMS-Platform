import type { ModuleItem } from '../../contexts/CourseContext';

export const modules1to3: ModuleItem[] = [
  // ── MODULE 1: INTRODUCTION TO C ──────────────────────────────────────────
  {
    id: 'c-mod-1',
    title: 'Module 1: Introduction to C',
    description: 'Understand the foundations of programming, the origins of C, compiler installation, and writing your first C program.',
    duration: '3 Hours',
    topics: [
      {
        id: 'c-topic-1-intro-prog',
        title: 'Topic 1: Introduction to Programming',
        description: 'Explore what computer programming is, how CPUs execute code, and programming paradigms.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-1-what-is-programming',
            title: 'Unit 1: What is Programming?',
            description: 'Learn the definition of computer programming, algorithms, and how instructions control computer hardware.',
            duration: '15 mins',
            type: 'Reading',
            learningObjectives: [
              'Define what a computer program and algorithm are.',
              'Understand the role of instructions in controlling CPU and memory.',
              'Differentiate between source code and machine code.'
            ],
            readingContent: `# What is Programming?

## Overview
Programming is the process of writing precise instructions for a computer to perform tasks, process data, and solve computational problems.

## Learning Objectives
- Understand how software instructs computer hardware.
- Learn the concept of input, processing, and output (IPO model).
- Understand why programming is fundamental to engineering.

## Concept
Computers operate using binary electrical states (**0s and 1s**, called **Machine Language**). Because writing raw machine code is extremely difficult, programmers write code in high-level or middle-level languages like **C**.

\`\`\`text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Source Code   │ ----> │    Compiler     │ ----> │ Machine Code    │
│  (Human-Readable)│       │  (Translator)   │       │ (Binary 0s & 1s)│
└─────────────────┘       └─────────────────┘       └─────────────────┘
\`\`\`

A program consists of:
1. **Input**: Data received from user, files, or sensors.
2. **Processing**: Mathematical or logical transformation.
3. **Storage**: Variables saved in RAM.
4. **Output**: Displaying results to console, GUI, or disk.

## Example
Here is how an algorithm translates to basic pseudo-code and C logic:

\`\`\`c
#include <stdio.h>

int main(void) {
    // 1. Storage & Input
    int length = 10;
    int width = 5;

    // 2. Processing (Calculate Area)
    int area = length * width;

    // 3. Output
    printf("Rectangle Area: %d\\n", area);
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Rectangle Area: 50
\`\`\`

## Common Mistakes & Pro Tips
> [!WARNING]
> Computers do not "guess" intent. Every statement must follow exact syntax rules. Missing a semicolon or misnaming a variable halts execution.

## Practice Challenge
Write an algorithm in plain English to calculate the simple interest given Principal ($P$), Rate ($R$), and Time ($T$).`,
            codeExamples: [
              {
                id: 'code-m1-1',
                title: 'Basic Program Input/Output Structure',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    printf("Computer programming solves real-world problems!\\n");\n    return 0;\n}`,
                explanation: 'A fundamental C program executing a sequential printing instruction and returning zero status code.'
              }
            ],
            keyPoints: [
              'Programming translates human logic into executable binary machine instructions.',
              'The standard model of execution is Input -> Processing -> Output.',
              'Compilers translate human-readable source code into machine-executable binaries.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m1-1',
                question: 'What is the primary function of a compiler?',
                answer: 'To translate high-level source code into binary machine code that the CPU can directly execute.',
                explanation: 'CPUs only understand machine instructions (0s and 1s). The compiler converts human-readable C syntax into native machine instructions.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m1-1',
                title: 'Computer Science Fundamentals (ISO C)',
                url: 'https://en.cppreference.com/w/c',
                description: 'Official ISO C programming standard index and documentation.'
              }
            ]
          },
          {
            id: 'c-unit-2-prog-languages',
            title: 'Unit 2: Programming Languages',
            description: 'Explore the classification of programming languages: Low-Level, Middle-Level (C), and High-Level languages.',
            duration: '15 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand the hierarchy of programming languages.',
              'Understand why C is classified as a Middle-Level language.',
              'Compare compiled vs interpreted languages.'
            ],
            readingContent: `# Programming Languages Hierarchy

## Overview
Programming languages are categorized based on their level of abstraction from computer hardware.

## Learning Objectives
- Classify low-level, middle-level, and high-level languages.
- Understand the trade-offs between speed, portability, and convenience.
- Explain why C is ideal for system programming.

## Concept
1. **Low-Level (Assembly & Machine Code)**:
   - Tied directly to CPU architecture (x86, ARM).
   - Fast, but non-portable and tedious to write.
2. **Middle-Level (C)**:
   - Combines the structured readability of high-level languages with the direct memory control of assembly (via pointers).
3. **High-Level (Python, Java, JavaScript)**:
   - High abstraction; memory is managed automatically by garbage collectors or runtime interpreters.

\`\`\`text
High-Level   │ Python, JavaScript, Java (Garbage Collected, Interpreted/VM)
Middle-Level │ C, C++                   (Direct Memory Access, Pointers, Native)
Low-Level    │ Assembly, Machine Code   (Hardware Register Specific)
\`\`\`

## Example: Comparing Execution Speed
C compiles directly to native instructions, making it 10x to 50x faster than interpreted languages for heavy numerical computation:

\`\`\`c
#include <stdio.h>

int main(void) {
    long long sum = 0;
    // Fast 1-billion iteration loop in native C
    for (long long i = 1; i <= 100000000; i++) {
        sum += i;
    }
    printf("Computed sum: %lld\\n", sum);
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Computed sum: 5000000050000000
\`\`\`

## Common Mistakes & Pro Tips
> [!TIP]
> C provides zero memory safety net. With great power comes the responsibility to manually allocate, manage, and free system memory.

## Practice Challenge
Explain in your own words why operating system kernels (like Linux and Windows) are written in C rather than Python.`,
            codeExamples: [
              {
                id: 'code-m1-2',
                title: 'High-Performance Loop in C',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    printf("C executes directly on hardware without virtual machines.\\n");\n    return 0;\n}`,
                explanation: 'Shows native binary execution flow in C.'
              }
            ],
            keyPoints: [
              'C bridges high-level syntax with low-level memory manipulation.',
              'Compiled native binaries run directly on CPU without virtual machines or runtime interpreters.',
              'C is the standard language for operating systems, device drivers, and game engines.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m1-2',
                question: 'Why is C considered a middle-level language?',
                answer: 'Because it combines high-level structured control constructs with low-level direct memory addressing using pointers.',
                explanation: 'C offers both user-friendly control statements and byte-level hardware manipulation capabilities.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m1-2',
                title: 'Language Comparison Reference',
                url: 'https://en.wikipedia.org/wiki/C_(programming_language)',
                description: 'Technical analysis and design history of the C language.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-2-intro-c',
        title: 'Topic 2: Introduction to C',
        description: 'Discover the history, architecture, and core structure of C programs.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-3-what-is-c',
            title: 'Unit 3: What is C?',
            description: 'Introduction to Dennis Ritchie, Bell Labs, UNIX, and the enduring importance of C.',
            duration: '15 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand the purpose and features of C.',
              'Learn the origins of C at AT&T Bell Laboratories.',
              'Identify industry domains where C remains dominant.'
            ],
            readingContent: `# What is C?

## Overview
C is a general-purpose, procedural computer programming language created by **Dennis Ritchie** between 1969 and 1973 at **AT&T Bell Labs**.

## Learning Objectives
- Learn the key characteristics of C.
- Understand the relationship between C and UNIX.
- Recognize the core features: speed, portability, and modularity.

## Concept
C was originally developed to rewrite the **UNIX** operating system. Before C, operating systems were written in assembly code specific to a single computer model. By writing UNIX in C, UNIX became the first truly portable operating system.

### Core Features of C:
1. **Procedural**: Programs are structured as collections of functions.
2. **Deterministic Memory**: Exact control over byte alignment and pointer addresses.
3. **Small Standard Library**: Lean footprint suitable for embedded microcontrollers with only kilobytes of RAM.
4. **Rich Operators**: Over 40 built-in operators including bitwise shifts and logical gates.

## Example
\`\`\`c
#include <stdio.h>

int main(void) {
    printf("Dennis Ritchie developed C in 1972 at Bell Labs.\\n");
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Dennis Ritchie developed C in 1972 at Bell Labs.
\`\`\`

## Common Mistakes & Pro Tips
> [!NOTE]
> C is case-sensitive! \`main\`, \`Main\`, and \`MAIN\` are completely different identifiers. In C, the entry point function must always be lowercase \`main\`.`,
            codeExamples: [
              {
                id: 'code-m1-3',
                title: 'Case Sensitivity Example',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    int score = 100;\n    int SCORE = 200;\n    printf("score: %d, SCORE: %d\\n", score, SCORE);\n    return 0;\n}`,
                explanation: 'Demonstrates case sensitivity in C variable declarations.'
              }
            ],
            keyPoints: [
              'C was created by Dennis Ritchie at Bell Labs to implement the UNIX OS.',
              'C is strictly case-sensitive.',
              'C is the foundation for C++, Java, C#, and Python runtimes.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m1-3',
                question: 'Who created the C programming language and at which research facility?',
                answer: 'Dennis Ritchie at AT&T Bell Laboratories.',
                explanation: 'Dennis Ritchie created C in the early 1970s while developing the UNIX operating system.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m1-3',
                title: 'Bell Labs History of C',
                url: 'https://www.bell-labs.com/usr/dmr/www/chist.html',
                description: 'Original historical paper by Dennis M. Ritchie on the creation of C.'
              }
            ]
          },
          {
            id: 'c-unit-4-structure-of-c-program',
            title: 'Unit 4: Structure of a C Program',
            description: 'Deconstruct sections of a C source file: Documentation, Preprocessor, Globals, main(), and Subprograms.',
            duration: '20 mins',
            type: 'Reading',
            learningObjectives: [
              'Identify the standard layout of a C source file.',
              'Understand preprocessor directives (#include).',
              'Understand the role of the main() function.'
            ],
            readingContent: `# Structure of a C Program

## Overview
Every standard C program follows a modular, top-to-bottom structural blueprint.

## Learning Objectives
- Learn the 6 canonical sections of a C source file.
- Understand the entry point function \`main()\`.
- Master single-line (\`//\`) and multi-line (\`/* */\`) comments.

## Concept
A typical C program contains:

\`\`\`text
┌──────────────────────────────────────────────┐
│ 1. Documentation Section (Comments)          │
│ 2. Preprocessor Section (#include, #define)  │
│ 3. Global Declarations & Typedefs            │
│ 4. main() Function Entry Point               │
│    {                                         │
│        Variable Declarations;                │
│        Executable Statements;                │
│        return 0;                             │
│    }                                         │
│ 5. User-Defined Functions Subprogram Section │
└──────────────────────────────────────────────┘
\`\`\`

## Example
\`\`\`c
/*
 * Program: circle_area.c
 * Description: Calculates circle area given radius
 */

// 1. Preprocessor Header Inclusion
#include <stdio.h>

// 2. Macro Definition
#define PI 3.14159

// 3. User Function Prototype
double calculateArea(double r);

// 4. Main Entry Point
int main(void) {
    double radius = 7.0;
    double area = calculateArea(radius);

    printf("Radius: %.2f | Area: %.2f\\n", radius, area);
    return 0; // Signifies successful exit
}

// 5. User Function Implementation
double calculateArea(double r) {
    return PI * r * r;
}
\`\`\`

## Expected Output
\`\`\`text
Radius: 7.00 | Area: 153.94
\`\`\`

## Common Mistakes & Pro Tips
> [!WARNING]
> Forgetting to return an exit code or omitting \`#include <stdio.h>\` causes compiler warnings and undefined behavior. Always return \`0\` on successful completion.`,
            codeExamples: [
              {
                id: 'code-m1-4',
                title: 'Clean Structural Template',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    printf("Well-structured code is easy to debug.\\n");\n    return 0;\n}`,
                explanation: 'A clean baseline template for any standard C program.'
              }
            ],
            keyPoints: [
              '#include <stdio.h> provides access to standard input/output functions like printf().',
              'main() is the designated execution start point.',
              'Statements end with a semicolon (;).'
            ],
            practiceQuestions: [
              {
                id: 'pq-m1-4',
                question: 'What is the significance of the return 0 statement inside main()?',
                answer: 'It returns an exit status code of 0 to the host operating system, indicating that the program terminated successfully without errors.',
                explanation: 'By POSIX and ANSI conventions, non-zero return codes indicate error conditions.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m1-4',
                title: 'Standard C Program Structure',
                url: 'https://en.cppreference.com/w/c/language/main_function',
                description: 'ISO C reference on main function signatures and termination semantics.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-3-setup-env',
        title: 'Topic 3: Setting Up C Development Environment',
        description: 'Install compilers (GCC, Clang, MSVC) and master compilation workflows.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-5-install-compiler',
            title: 'Unit 5: Installing a C Compiler',
            description: 'Setup GCC via MinGW on Windows, GCC/Clang on macOS, and build-essential on Linux.',
            duration: '15 mins',
            type: 'Reading',
            learningObjectives: [
              'Install GCC using package managers across Windows, macOS, and Linux.',
              'Verify compiler installation via CLI with gcc --version.',
              'Configure PATH environment variables.'
            ],
            readingContent: `# Installing a C Compiler

## Overview
A C compiler is required to translate human-written \`.c\` files into runnable machine binaries.

## Learning Objectives
- Install GCC on Windows (MinGW-w64), Linux (Ubuntu/Debian), and macOS.
- Check compiler availability on the command line.

## Installation by Operating System

### 1. Windows (MinGW-w64)
1. Install MSYS2 from \`https://www.msys2.org\` or use \`winget\`:
   \`\`\`bash
   winget install MSYS2.MSYS2
   pacman -S --noconfirm mingw-w64-ucrt-x86_64-gcc
   \`\`\`
2. Add \`C:\\msys64\\ucrt64\\bin\` to your Windows system **PATH**.

### 2. Linux (Ubuntu / Debian / Raspberry Pi)
\`\`\`bash
sudo apt update
sudo apt install -y build-essential
\`\`\`

### 3. macOS (Apple Silicon / Intel)
\`\`\`bash
xcode-select --install
\`\`\`

## Verification
Open your terminal or command prompt and run:
\`\`\`bash
gcc --version
\`\`\`
You should see output similar to:
\`\`\`text
gcc (GCC) 13.2.0 or clang version 16.0.0
\`\`\``,
            codeExamples: [
              {
                id: 'code-m1-5',
                title: 'Verifying Compiler Installation',
                language: 'bash',
                code: `gcc --version\nclang --version`,
                explanation: 'Commands to check GCC or Clang toolchain versions.'
              }
            ],
            keyPoints: [
              'GCC (GNU Compiler Collection) and Clang are the industry-standard free C compilers.',
              'MinGW-w64 provides native Windows GCC toolchains.',
              'build-essential on Ubuntu installs gcc, g++, and make.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m1-5',
                question: 'Which terminal command verifies that GCC is installed and accessible in PATH?',
                answer: 'gcc --version',
                explanation: 'Running gcc --version displays compiler version and target architecture information.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m1-5',
                title: 'GNU GCC Installation Guide',
                url: 'https://gcc.gnu.org/install/',
                description: 'Official GNU documentation on configuring and building the GCC toolchain.'
              }
            ]
          },
          {
            id: 'c-unit-6-compile-run',
            title: 'Unit 6: Compiling and Running a C Program',
            description: 'Master the complete compilation pipeline: Preprocessor, Compiler, Assembler, and Linker.',
            duration: '20 mins',
            type: 'Reading',
            learningObjectives: [
              'Execute gcc commands to build executables.',
              'Understand the 4 phases: Preprocessing (.i), Compiling (.s), Assembling (.o), Linking.',
              'Run compiled binaries on command line.'
            ],
            readingContent: `# Compiling and Running a C Program

## Overview
Learn how to compile a source file \`hello.c\` into a native executable and run it in the terminal.

## Learning Objectives
- Use \`gcc -Wall -Wextra\` for strict error checking.
- Specify custom output executable names using \`-o\`.
- Execute the compiled program.

## Compilation Workflow

\`\`\`bash
# 1. Compile with standard flags
gcc -Wall -Wextra -O2 hello.c -o hello

# 2. Run on Linux / macOS
./hello

# 2. Run on Windows (PowerShell / CMD)
.\\hello.exe
\`\`\`

### Explanation of GCC Flags:
- \`-Wall\`: Enables all standard compiler warnings (helps catch bugs early).
- \`-Wextra\`: Enables extra pedantic warnings.
- \`-o hello\`: Sets output executable name to \`hello\` (default is \`a.out\` or \`a.exe\`).
- \`-O2\`: Enables level-2 compiler optimizations.

## Example: hello.c
\`\`\`c
#include <stdio.h>

int main(void) {
    printf("======================================\\n");
    printf("  Welcome to KaizenQ C Programming!  \\n");
    printf("======================================\\n");
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
======================================
  Welcome to KaizenQ C Programming!  
======================================
\`\`\`

## Common Mistakes & Pro Tips
> [!TIP]
> Always enable \`-Wall\` when compiling! It will warn you if you use uninitialized variables, format specifier mismatches, or missing return values.`,
            codeExamples: [
              {
                id: 'code-m1-6',
                title: 'Complete Build & Run Script',
                language: 'bash',
                code: `gcc -Wall -Wextra hello.c -o hello && ./hello`,
                explanation: 'One-liner to compile and immediately execute upon successful build.'
              }
            ],
            keyPoints: [
              'gcc filename.c -o outputname compiles source to binary.',
              '-Wall flag turns on helpful compilation warnings.',
              './program executes the native binary in current directory.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m1-6',
                question: 'What is the default executable file name produced by GCC on Linux if you do not specify the -o flag?',
                answer: 'a.out',
                explanation: 'Historical UNIX convention creates "a.out" (assembler output) when no output target is specified.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m1-6',
                title: 'GCC Command Options Manual',
                url: 'https://gcc.gnu.org/onlinedocs/gcc/Invoking-GCC.html',
                description: 'Official manual on compiler flags, optimization switches, and linker controls.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 2: C BASICS ────────────────────────────────────────────────────
  {
    id: 'c-mod-2',
    title: 'Module 2: C Basics & Data Types',
    description: 'Master C tokens, keywords, identifiers, variables, basic data types (int, float, char), constants, and formatted input/output.',
    duration: '3.5 Hours',
    topics: [
      {
        id: 'c-topic-2-1-tokens',
        title: 'Topic 1: Tokens & Syntax',
        description: 'Understand the smallest individual units of a C program: Keywords, Identifiers, Literals, Operators, and Punctuators.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-2-1-c-tokens',
            title: 'Unit 1: C Tokens & Keywords',
            description: 'Explore the 32 standard ANSI C keywords, naming rules for identifiers, and token classification.',
            duration: '20 mins',
            type: 'Reading',
            learningObjectives: [
              'Identify the 5 types of C tokens.',
              'Memorize key reserved keywords in C.',
              'Apply valid naming rules for variables and functions.'
            ],
            readingContent: `# C Tokens & Keywords

## Overview
A **Token** is the smallest individual building block that the C compiler recognizes during the lexical analysis phase.

## Learning Objectives
- Categorize tokens into Keywords, Identifiers, Constants, Strings, Special Symbols, and Operators.
- Recognize reserved keywords.
- Follow identifier naming rules.

## 1. The 32 Standard ANSI C Keywords
Keywords are reserved words with predefined meanings. You **cannot** use keywords as variable or function names.

| Data Types | Control Flow | Storage Classes | Other |
| :--- | :--- | :--- | :--- |
| \`int\`, \`char\` | \`if\`, \`else\` | \`auto\`, \`register\` | \`sizeof\` |
| \`float\`, \`double\` | \`switch\`, \`case\` | \`static\`, \`extern\` | \`typedef\` |
| \`short\`, \`long\` | \`for\`, \`while\` | \`const\`, \`volatile\` | \`struct\` |
| \`signed\`, \`unsigned\` | \`do\`, \`break\` | | \`union\` |
| \`void\` | \`continue\`, \`goto\` | | \`enum\` |
| | \`default\`, \`return\` | | |

## 2. Identifier Naming Rules
An **Identifier** is a user-defined name for variables, arrays, structures, and functions.
- **Allowed Characters**: Letters (\`a-z\`, \`A-Z\`), Digits (\`0-9\`), and Underscore (\`_\`).
- **First Character**: Must be a letter or underscore (cannot begin with a digit).
- **No Whitespace**: \`student name\` is invalid; use \`student_name\` or \`studentName\`.
- **No Keywords**: You cannot name a variable \`int\` or \`return\`.

## Example
\`\`\`c
#include <stdio.h>

int main(void) {
    // Valid Identifiers
    int student_age = 20;
    float _gpa = 3.85f;
    int totalScore100 = 95;

    printf("Age: %d, GPA: %.2f, Score: %d\\n", student_age, _gpa, totalScore100);
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Age: 20, GPA: 3.85, Score: 95
\`\`\`

## Common Mistakes & Pro Tips
> [!WARNING]
> Naming a variable \`2ndScore\` causes a compiler syntax error because identifiers cannot start with numbers. Use \`secondScore\` or \`score_2\` instead.`,
            codeExamples: [
              {
                id: 'code-m2-1',
                title: 'Valid vs Invalid Identifier Examples',
                language: 'c',
                code: `// Valid:\nint student_count;\nint _system_flag;\nint level3_boss;\n\n// Invalid (Will fail to compile):\n// int 3rd_player;   // Error: starts with digit\n// int float;        // Error: keyword reserved\n// int my salary;    // Error: contains space`,
                explanation: 'Examples showing legal and illegal variable names in C.'
              }
            ],
            keyPoints: [
              'Tokens are the foundational units in C syntax.',
              'C has 32 standard reserved keywords.',
              'Identifiers must start with a letter or underscore and contain no whitespace.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m2-1',
                question: 'Which of the following is a valid C identifier: 1value, total_sum, my-var, default?',
                answer: 'total_sum',
                explanation: '1value starts with a digit (illegal), my-var has a hyphen operator (illegal), and default is a reserved keyword. total_sum is valid.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m2-1',
                title: 'C Keywords Reference',
                url: 'https://en.cppreference.com/w/c/keyword',
                description: 'Full list of standard C reserved keywords and definitions.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-2-2-data-types',
        title: 'Topic 2: Variables & Data Types',
        description: 'Understand memory sizes, ranges, and representations of int, float, double, char, and modifiers.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-2-2-fundamental-types',
            title: 'Unit 2: Fundamental Data Types & sizeof',
            description: 'Master int, float, double, char, their byte sizes in memory, and the sizeof operator.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand fundamental data types and their standard memory footprints.',
              'Use the sizeof operator to measure byte allocations.',
              'Understand type qualifiers: signed, unsigned, short, long.'
            ],
            readingContent: `# Fundamental Data Types in C

## Overview
Every variable in C must have an explicit data type that determines how much memory is allocated and how bits are interpreted.

## Learning Objectives
- Master the primary data types: \`int\`, \`float\`, \`double\`, and \`char\`.
- Use \`sizeof\` to inspect memory sizes on your architecture.
- Understand \`signed\` vs \`unsigned\` integers.

## Data Type Summary (64-bit Architecture)

| Type | Typical Size | Format Specifier | Typical Range |
| :--- | :--- | :--- | :--- |
| \`char\` | 1 Byte | \`%c\` | -128 to +127 (or 0 to 255) |
| \`unsigned char\` | 1 Byte | \`%u\` | 0 to 255 |
| \`short int\` | 2 Bytes | \`%hd\` | -32,768 to +32,767 |
| \`int\` | 4 Bytes | \`%d\` or \`%i\` | -2,147,483,648 to +2,147,483,647 |
| \`unsigned int\` | 4 Bytes | \`%u\` | 0 to 4,294,967,295 |
| \`long long int\` | 8 Bytes | \`%lld\` | $\\approx -9 \\times 10^{18}$ to $+9 \\times 10^{18}$ |
| \`float\` | 4 Bytes | \`%f\` | 6-7 decimal digits precision |
| \`double\` | 8 Bytes | \`%lf\` | 15-17 decimal digits precision |

## Example: Inspecting Memory Sizes
\`\`\`c
#include <stdio.h>

int main(void) {
    printf("Size of char:        %zu byte(s)\\n", sizeof(char));
    printf("Size of short:       %zu byte(s)\\n", sizeof(short));
    printf("Size of int:         %zu byte(s)\\n", sizeof(int));
    printf("Size of long long:   %zu byte(s)\\n", sizeof(long long));
    printf("Size of float:       %zu byte(s)\\n", sizeof(float));
    printf("Size of double:      %zu byte(s)\\n", sizeof(double));
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Size of char:        1 byte(s)
Size of short:       2 byte(s)
Size of int:         4 byte(s)
Size of long long:   8 byte(s)
Size of float:       4 byte(s)
Size of double:      8 byte(s)
\`\`\`

## Common Mistakes & Pro Tips
> [!TIP]
> For financial or high-precision calculations, always prefer \`double\` over \`float\` to prevent floating-point rounding inaccuracies.`,
            codeExamples: [
              {
                id: 'code-m2-2',
                title: 'Data Types and Format Specifiers',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    int age = 21;\n    double salary = 75450.50;\n    char grade = 'A';\n\n    printf("Age: %d | Salary: $%.2f | Grade: %c\\n", age, salary, grade);\n    return 0;\n}`,
                explanation: 'Demonstrates declaration and printing with %d, %.2f, and %c.'
              }
            ],
            keyPoints: [
              'char is 1 byte, int is typically 4 bytes, double is 8 bytes.',
              'sizeof returns the memory size in bytes as type size_t.',
              'unsigned types cannot hold negative values but double the positive range.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m2-2',
                question: 'What is the format specifier used in printf() to print a double value?',
                answer: '%lf (or %f in printf, %lf in scanf)',
                explanation: 'In printf(), %f and %lf are interchangeable due to default argument promotion, but %lf is strictly required in scanf() for double.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m2-2',
                title: 'C Data Types Reference',
                url: 'https://en.cppreference.com/w/c/language/type',
                description: 'Complete specification on fundamental C object types.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-2-3-io',
        title: 'Topic 3: Formatted Input & Output',
        description: 'Master printf() formatting, scanf() address operator (&), buffer mechanics, and interactive CLI programs.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-2-3-printf-scanf',
            title: 'Unit 3: printf() and scanf() in Depth',
            description: 'Master field width, precision flags, escape characters, and user input validation with scanf.',
            duration: '20 mins',
            type: 'Reading',
            learningObjectives: [
              'Use printf formatting specifiers, width pads, and precision limits.',
              'Use scanf with address-of (&) operator to capture user input.',
              'Handle common input buffer pitfalls.'
            ],
            readingContent: `# Formatted Input & Output in C

## Overview
The C Standard I/O library (\`<stdio.h>\`) provides \`printf()\` for writing formatted text to stdout, and \`scanf()\` for reading formatted input from stdin.

## Learning Objectives
- Format numbers with leading zeros, width padding, and decimal precision.
- Read integer, float, and character inputs from the keyboard.
- Understand why \`scanf()\` requires memory addresses (\`&\`).

## 1. Advanced printf() Formatting
- \`%10d\`: Right-aligned in a 10-character wide field.
- \`%-10d\`: Left-aligned in a 10-character wide field.
- \`%05d\`: Padded with leading zeros (e.g. \`00042\`).
- \`%.2f\`: Formatted to exactly 2 decimal places.

## 2. Reading Input with scanf()
\`scanf()\` needs to know **where** in computer memory to store the user's input. Therefore, you must pass the memory address using the address-of operator \`&\`:

\`\`\`c
#include <stdio.h>

int main(void) {
    int age;
    double height;

    printf("Enter your age: ");
    if (scanf("%d", &age) != 1) {
        printf("Invalid input!\\n");
        return 1;
    }

    printf("Enter your height in meters (e.g., 1.75): ");
    scanf("%lf", &height);

    printf("\\n--- Profile Summary ---\\n");
    printf("Age:    %d years\\n", age);
    printf("Height: %.2f meters\\n", height);

    return 0;
}
\`\`\`

## Expected Interactive Output
\`\`\`text
Enter your age: 22
Enter your height in meters (e.g., 1.75): 1.82

--- Profile Summary ---
Age:    22 years
Height: 1.82 meters
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> Forgetting the \`&\` before variable names in \`scanf("%d", age)\` causes a **Segmentation Fault** crash because \`scanf\` treats the uninitialized value of \`age\` as a memory pointer!`,
            codeExamples: [
              {
                id: 'code-m2-3',
                title: 'Formatted Table Output Example',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    printf("%-10s | %-12s | %-6s\\n", "Item", "Category", "Price");\n    printf("-----------------------------------\\n");\n    printf("%-10s | %-12s | $%5.2f\\n", "Apple", "Fruit", 1.25);\n    printf("%-10s | %-12s | $%5.2f\\n", "Notebook", "Stationery", 4.50);\n    return 0;\n}`,
                explanation: 'Shows width alignment for tabular console outputs.'
              }
            ],
            keyPoints: [
              'printf() writes formatted strings to stdout.',
              'scanf() requires the address-of operator (&) for scalar variables.',
              'Check scanf() return value to verify successful input conversions.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m2-3',
                question: 'Why does scanf("%d", &num) require the & operator before num?',
                answer: 'Because C passes arguments by value. scanf() needs the memory address of num so it can write the input data directly into num\'s memory location.',
                explanation: 'Without &, scanf receives a copy of num\'s current value and cannot modify the original variable.',
                difficulty: 'Medium'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m2-3',
                title: 'printf and scanf Specification',
                url: 'https://en.cppreference.com/w/c/io/vfprintf',
                description: 'Complete reference for formatted input/output format conversion specifiers.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 3: OPERATORS ───────────────────────────────────────────────────
  {
    id: 'c-mod-3',
    title: 'Module 3: Operators & Expressions',
    description: 'Master Arithmetic, Relational, Logical, Assignment, Increment/Decrement (++ / --), Conditional (Ternary), and Bitwise operators with precedence rules.',
    duration: '3 Hours',
    topics: [
      {
        id: 'c-topic-3-1-arithmetic-logic',
        title: 'Topic 1: Arithmetic, Relational & Logical Operators',
        description: 'Explore mathematical computations, comparison checks, boolean logic, and short-circuit evaluation.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-3-1-arith-rel-log',
            title: 'Unit 1: Arithmetic & Logical Mechanics',
            description: 'Learn integer division vs floating division, modulus (%), logical AND (&&), OR (||), and NOT (!).',
            duration: '20 mins',
            type: 'Reading',
            learningObjectives: [
              'Master all arithmetic operators including modulus (%).',
              'Understand integer division truncation (5 / 2 = 2).',
              'Apply logical operators (&&, ||, !) with short-circuit evaluation.'
            ],
            readingContent: `# Arithmetic, Relational & Logical Operators

## Overview
Operators are special symbols that instruct the compiler to perform mathematical, relational, or logical evaluations.

## Learning Objectives
- Calculate values using \`+\`, \`-\`, \`*\`, \`/\`, and \`%\`.
- Compare values using \`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`.
- Combine expressions using \`&&\` (AND), \`||\` (OR), and \`!\` (NOT).

## 1. Integer Division vs Modulus
- In C, when two integers are divided, the result is truncated to an integer:
  \`\`\`c
  int a = 7, b = 2;
  int result = a / b;    // Result is 3 (NOT 3.5!)
  int remainder = a % b; // Result is 1
  double exact = (double)a / b; // Result is 3.5
  \`\`\`

## 2. Logical Short-Circuiting
- **\`&&\` (AND)**: If the left operand is false (\`0\`), the right operand is **never evaluated**.
- **\`||\` (OR)**: If the left operand is true (\`1\`), the right operand is **never evaluated**.

## Example Program
\`\`\`c
#include <stdio.h>

int main(void) {
    int score = 85;
    int attendance = 90;

    // Relational and Logical expression
    if (score >= 80 && attendance >= 75) {
        printf("Student qualifies for Distinction honors!\\n");
    } else {
        printf("Standard qualification.\\n");
    }

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Student qualifies for Distinction honors!
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> Confusing assignment (\`=\`) with equality (\`==\`) is the #1 beginner bug! \`if (x = 5)\` assigns 5 to x (which is true) instead of comparing x with 5. Always use \`if (x == 5)\`.`,
            codeExamples: [
              {
                id: 'code-m3-1',
                title: 'Modulus and Integer Division Demo',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    int seconds = 3725;\n    int hours = seconds / 3600;\n    int minutes = (seconds % 3600) / 60;\n    int secs = seconds % 60;\n    printf("%d seconds = %02d:%02d:%02d\\n", seconds, hours, minutes, secs);\n    return 0;\n}`,
                explanation: 'Splits total seconds into Hours, Minutes, and Seconds using division and modulus.'
              }
            ],
            keyPoints: [
              'Modulus (%) returns the remainder of integer division.',
              'Logical AND (&&) and OR (||) feature short-circuit evaluation.',
              'Always use == for comparison and = for assignment.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m3-1',
                question: 'What is the output of 15 % 4 in C?',
                answer: '3',
                explanation: '15 divided by 4 equals 3 with a remainder of 3. Modulus returns the remainder: 3.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m3-1',
                title: 'C Operators Precedence Table',
                url: 'https://en.cppreference.com/w/c/language/operator_precedence',
                description: 'Full reference hierarchy for operator binding and associativity in C.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-3-2-bitwise-precedence',
        title: 'Topic 2: Bitwise Operators & Precedence',
        description: 'Master low-level bit manipulation (&, |, ^, ~, <<, >>), conditional operator (?:), and precedence rules.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-3-2-bitwise-and-shifts',
            title: 'Unit 2: Bitwise Operations & Precedence',
            description: 'Understand bit masking, bit shifting, ternary operator, and evaluation order.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand bitwise AND (&), OR (|), XOR (^), NOT (~).',
              'Use left shift (<<) and right shift (>>).',
              'Use the ternary conditional operator (condition ? expr1 : expr2).',
              'Understand operator precedence and associativity.'
            ],
            readingContent: `# Bitwise Operators & Precedence

## Overview
C gives programmers the unique capability to directly manipulate individual binary bits of integers.

## Learning Objectives
- Learn the bitwise operations: \`&\`, \`|\`, \`^\`, \`~\`, \`<<\`, \`>>\`.
- Apply bit shifting for high-speed multiplication/division by powers of 2.
- Master the Ternary Operator \`? :\`.

## 1. Bitwise Truth Table
| Bit A | Bit B | A & B (AND) | A \| B (OR) | A ^ B (XOR) | ~A (NOT) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 |

## 2. Fast Bit Shifts
- **Left Shift (\`x << n\`)**: Shifts bits left by $n$ positions (multiplies $x$ by $2^n$).
  \`5 << 1\` $\to$ \`00000101 << 1\` = \`00001010\` (10).
- **Right Shift (\`x >> n\`)**: Shifts bits right by $n$ positions (divides $x$ by $2^n$).
  \`20 >> 2\` $\to$ \`5\`.

## 3. Ternary Operator
Syntax: \`condition ? value_if_true : value_if_false\`

\`\`\`c
#include <stdio.h>

int main(void) {
    int a = 12; // Binary: 00001100
    int b = 25; // Binary: 00011001

    // Bitwise AND
    int bit_and = a & b; // Binary: 00001000 = 8
    printf("a & b = %d\\n", bit_and);

    // Fast multiplication by 4 using left shift
    int num = 7;
    int multiplied = num << 2; // 7 * 4 = 28
    printf("7 << 2 = %d\\n", multiplied);

    // Ternary operator
    int maxVal = (a > b) ? a : b;
    printf("Max value: %d\\n", maxVal);

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
a & b = 8
7 << 2 = 28
Max value: 25
\`\`\`

## Common Mistakes & Pro Tips
> [!TIP]
> In complex arithmetic and logical expressions, always use parentheses \`()\` to enforce intended evaluation order rather than relying solely on memory of operator precedence tables.`,
            codeExamples: [
              {
                id: 'code-m3-2',
                title: 'Checking Odd/Even with Bitwise AND',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    int n = 43;\n    // Lowest bit of any odd number is 1\n    if (n & 1) {\n        printf("%d is ODD\\n", n);\n    } else {\n        printf("%d is EVEN\\n", n);\n    }\n    return 0;\n}`,
                explanation: 'High-speed odd/even check using bitwise & instead of modulus % 2.'
              }
            ],
            keyPoints: [
              'Bitwise operators operate directly on binary bits of integer data types.',
              'x << n multiplies x by 2^n; x >> n divides x by 2^n.',
              'The ternary operator provides concise inline conditional evaluation.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m3-2',
                question: 'What is the result of the expression 8 << 2 in C?',
                answer: '32',
                explanation: 'Left shifting by 2 multiplies by 2^2 (4). 8 * 4 = 32.',
                difficulty: 'Medium'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m3-2',
                title: 'Bitwise Operators in C',
                url: 'https://en.wikipedia.org/wiki/Bitwise_operations_in_C',
                description: 'Comprehensive guide to bit manipulation masks and registers.'
              }
            ]
          }
        ]
      }
    ]
  }
];
