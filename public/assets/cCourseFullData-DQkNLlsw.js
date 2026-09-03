var e=[{id:`c-mod-1`,title:`Module 1: Introduction to C`,description:`Understand the foundations of programming, the origins of C, compiler installation, and writing your first C program.`,duration:`3 Hours`,topics:[{id:`c-topic-1-intro-prog`,title:`Topic 1: Introduction to Programming`,description:`Explore what computer programming is, how CPUs execute code, and programming paradigms.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-1-what-is-programming`,title:`Unit 1: What is Programming?`,description:`Learn the definition of computer programming, algorithms, and how instructions control computer hardware.`,duration:`15 mins`,type:`Reading`,learningObjectives:[`Define what a computer program and algorithm are.`,`Understand the role of instructions in controlling CPU and memory.`,`Differentiate between source code and machine code.`],readingContent:`# What is Programming?

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
Write an algorithm in plain English to calculate the simple interest given Principal ($P$), Rate ($R$), and Time ($T$).`,codeExamples:[{id:`code-m1-1`,title:`Basic Program Input/Output Structure`,language:`c`,code:`#include <stdio.h>

int main(void) {
    printf("Computer programming solves real-world problems!\\n");
    return 0;
}`,explanation:`A fundamental C program executing a sequential printing instruction and returning zero status code.`}],keyPoints:[`Programming translates human logic into executable binary machine instructions.`,`The standard model of execution is Input -> Processing -> Output.`,`Compilers translate human-readable source code into machine-executable binaries.`],practiceQuestions:[{id:`pq-m1-1`,question:`What is the primary function of a compiler?`,answer:`To translate high-level source code into binary machine code that the CPU can directly execute.`,explanation:`CPUs only understand machine instructions (0s and 1s). The compiler converts human-readable C syntax into native machine instructions.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m1-1`,title:`Computer Science Fundamentals (ISO C)`,url:`https://en.cppreference.com/w/c`,description:`Official ISO C programming standard index and documentation.`}]},{id:`c-unit-2-prog-languages`,title:`Unit 2: Programming Languages`,description:`Explore the classification of programming languages: Low-Level, Middle-Level (C), and High-Level languages.`,duration:`15 mins`,type:`Reading`,learningObjectives:[`Understand the hierarchy of programming languages.`,`Understand why C is classified as a Middle-Level language.`,`Compare compiled vs interpreted languages.`],readingContent:`# Programming Languages Hierarchy

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
Explain in your own words why operating system kernels (like Linux and Windows) are written in C rather than Python.`,codeExamples:[{id:`code-m1-2`,title:`High-Performance Loop in C`,language:`c`,code:`#include <stdio.h>

int main(void) {
    printf("C executes directly on hardware without virtual machines.\\n");
    return 0;
}`,explanation:`Shows native binary execution flow in C.`}],keyPoints:[`C bridges high-level syntax with low-level memory manipulation.`,`Compiled native binaries run directly on CPU without virtual machines or runtime interpreters.`,`C is the standard language for operating systems, device drivers, and game engines.`],practiceQuestions:[{id:`pq-m1-2`,question:`Why is C considered a middle-level language?`,answer:`Because it combines high-level structured control constructs with low-level direct memory addressing using pointers.`,explanation:`C offers both user-friendly control statements and byte-level hardware manipulation capabilities.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m1-2`,title:`Language Comparison Reference`,url:`https://en.wikipedia.org/wiki/C_(programming_language)`,description:`Technical analysis and design history of the C language.`}]}]},{id:`c-topic-2-intro-c`,title:`Topic 2: Introduction to C`,description:`Discover the history, architecture, and core structure of C programs.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-3-what-is-c`,title:`Unit 3: What is C?`,description:`Introduction to Dennis Ritchie, Bell Labs, UNIX, and the enduring importance of C.`,duration:`15 mins`,type:`Reading`,learningObjectives:[`Understand the purpose and features of C.`,`Learn the origins of C at AT&T Bell Laboratories.`,`Identify industry domains where C remains dominant.`],readingContent:`# What is C?

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
> C is case-sensitive! \`main\`, \`Main\`, and \`MAIN\` are completely different identifiers. In C, the entry point function must always be lowercase \`main\`.`,codeExamples:[{id:`code-m1-3`,title:`Case Sensitivity Example`,language:`c`,code:`#include <stdio.h>

int main(void) {
    int score = 100;
    int SCORE = 200;
    printf("score: %d, SCORE: %d\\n", score, SCORE);
    return 0;
}`,explanation:`Demonstrates case sensitivity in C variable declarations.`}],keyPoints:[`C was created by Dennis Ritchie at Bell Labs to implement the UNIX OS.`,`C is strictly case-sensitive.`,`C is the foundation for C++, Java, C#, and Python runtimes.`],practiceQuestions:[{id:`pq-m1-3`,question:`Who created the C programming language and at which research facility?`,answer:`Dennis Ritchie at AT&T Bell Laboratories.`,explanation:`Dennis Ritchie created C in the early 1970s while developing the UNIX operating system.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m1-3`,title:`Bell Labs History of C`,url:`https://www.bell-labs.com/usr/dmr/www/chist.html`,description:`Original historical paper by Dennis M. Ritchie on the creation of C.`}]},{id:`c-unit-4-structure-of-c-program`,title:`Unit 4: Structure of a C Program`,description:`Deconstruct sections of a C source file: Documentation, Preprocessor, Globals, main(), and Subprograms.`,duration:`20 mins`,type:`Reading`,learningObjectives:[`Identify the standard layout of a C source file.`,`Understand preprocessor directives (#include).`,`Understand the role of the main() function.`],readingContent:`# Structure of a C Program

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
> Forgetting to return an exit code or omitting \`#include <stdio.h>\` causes compiler warnings and undefined behavior. Always return \`0\` on successful completion.`,codeExamples:[{id:`code-m1-4`,title:`Clean Structural Template`,language:`c`,code:`#include <stdio.h>

int main(void) {
    printf("Well-structured code is easy to debug.\\n");
    return 0;
}`,explanation:`A clean baseline template for any standard C program.`}],keyPoints:[`#include <stdio.h> provides access to standard input/output functions like printf().`,`main() is the designated execution start point.`,`Statements end with a semicolon (;).`],practiceQuestions:[{id:`pq-m1-4`,question:`What is the significance of the return 0 statement inside main()?`,answer:`It returns an exit status code of 0 to the host operating system, indicating that the program terminated successfully without errors.`,explanation:`By POSIX and ANSI conventions, non-zero return codes indicate error conditions.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m1-4`,title:`Standard C Program Structure`,url:`https://en.cppreference.com/w/c/language/main_function`,description:`ISO C reference on main function signatures and termination semantics.`}]}]},{id:`c-topic-3-setup-env`,title:`Topic 3: Setting Up C Development Environment`,description:`Install compilers (GCC, Clang, MSVC) and master compilation workflows.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-5-install-compiler`,title:`Unit 5: Installing a C Compiler`,description:`Setup GCC via MinGW on Windows, GCC/Clang on macOS, and build-essential on Linux.`,duration:`15 mins`,type:`Reading`,learningObjectives:[`Install GCC using package managers across Windows, macOS, and Linux.`,`Verify compiler installation via CLI with gcc --version.`,`Configure PATH environment variables.`],readingContent:`# Installing a C Compiler

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
\`\`\``,codeExamples:[{id:`code-m1-5`,title:`Verifying Compiler Installation`,language:`bash`,code:`gcc --version
clang --version`,explanation:`Commands to check GCC or Clang toolchain versions.`}],keyPoints:[`GCC (GNU Compiler Collection) and Clang are the industry-standard free C compilers.`,`MinGW-w64 provides native Windows GCC toolchains.`,`build-essential on Ubuntu installs gcc, g++, and make.`],practiceQuestions:[{id:`pq-m1-5`,question:`Which terminal command verifies that GCC is installed and accessible in PATH?`,answer:`gcc --version`,explanation:`Running gcc --version displays compiler version and target architecture information.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m1-5`,title:`GNU GCC Installation Guide`,url:`https://gcc.gnu.org/install/`,description:`Official GNU documentation on configuring and building the GCC toolchain.`}]},{id:`c-unit-6-compile-run`,title:`Unit 6: Compiling and Running a C Program`,description:`Master the complete compilation pipeline: Preprocessor, Compiler, Assembler, and Linker.`,duration:`20 mins`,type:`Reading`,learningObjectives:[`Execute gcc commands to build executables.`,`Understand the 4 phases: Preprocessing (.i), Compiling (.s), Assembling (.o), Linking.`,`Run compiled binaries on command line.`],readingContent:`# Compiling and Running a C Program

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
> Always enable \`-Wall\` when compiling! It will warn you if you use uninitialized variables, format specifier mismatches, or missing return values.`,codeExamples:[{id:`code-m1-6`,title:`Complete Build & Run Script`,language:`bash`,code:`gcc -Wall -Wextra hello.c -o hello && ./hello`,explanation:`One-liner to compile and immediately execute upon successful build.`}],keyPoints:[`gcc filename.c -o outputname compiles source to binary.`,`-Wall flag turns on helpful compilation warnings.`,`./program executes the native binary in current directory.`],practiceQuestions:[{id:`pq-m1-6`,question:`What is the default executable file name produced by GCC on Linux if you do not specify the -o flag?`,answer:`a.out`,explanation:`Historical UNIX convention creates "a.out" (assembler output) when no output target is specified.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m1-6`,title:`GCC Command Options Manual`,url:`https://gcc.gnu.org/onlinedocs/gcc/Invoking-GCC.html`,description:`Official manual on compiler flags, optimization switches, and linker controls.`}]}]}]},{id:`c-mod-2`,title:`Module 2: C Basics & Data Types`,description:`Master C tokens, keywords, identifiers, variables, basic data types (int, float, char), constants, and formatted input/output.`,duration:`3.5 Hours`,topics:[{id:`c-topic-2-1-tokens`,title:`Topic 1: Tokens & Syntax`,description:`Understand the smallest individual units of a C program: Keywords, Identifiers, Literals, Operators, and Punctuators.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-2-1-c-tokens`,title:`Unit 1: C Tokens & Keywords`,description:`Explore the 32 standard ANSI C keywords, naming rules for identifiers, and token classification.`,duration:`20 mins`,type:`Reading`,learningObjectives:[`Identify the 5 types of C tokens.`,`Memorize key reserved keywords in C.`,`Apply valid naming rules for variables and functions.`],readingContent:'# C Tokens & Keywords\n\n## Overview\nA **Token** is the smallest individual building block that the C compiler recognizes during the lexical analysis phase.\n\n## Learning Objectives\n- Categorize tokens into Keywords, Identifiers, Constants, Strings, Special Symbols, and Operators.\n- Recognize reserved keywords.\n- Follow identifier naming rules.\n\n## 1. The 32 Standard ANSI C Keywords\nKeywords are reserved words with predefined meanings. You **cannot** use keywords as variable or function names.\n\n| Data Types | Control Flow | Storage Classes | Other |\n| :--- | :--- | :--- | :--- |\n| `int`, `char` | `if`, `else` | `auto`, `register` | `sizeof` |\n| `float`, `double` | `switch`, `case` | `static`, `extern` | `typedef` |\n| `short`, `long` | `for`, `while` | `const`, `volatile` | `struct` |\n| `signed`, `unsigned` | `do`, `break` | | `union` |\n| `void` | `continue`, `goto` | | `enum` |\n| | `default`, `return` | | |\n\n## 2. Identifier Naming Rules\nAn **Identifier** is a user-defined name for variables, arrays, structures, and functions.\n- **Allowed Characters**: Letters (`a-z`, `A-Z`), Digits (`0-9`), and Underscore (`_`).\n- **First Character**: Must be a letter or underscore (cannot begin with a digit).\n- **No Whitespace**: `student name` is invalid; use `student_name` or `studentName`.\n- **No Keywords**: You cannot name a variable `int` or `return`.\n\n## Example\n```c\n#include <stdio.h>\n\nint main(void) {\n    // Valid Identifiers\n    int student_age = 20;\n    float _gpa = 3.85f;\n    int totalScore100 = 95;\n\n    printf("Age: %d, GPA: %.2f, Score: %d\\n", student_age, _gpa, totalScore100);\n    return 0;\n}\n```\n\n## Expected Output\n```text\nAge: 20, GPA: 3.85, Score: 95\n```\n\n## Common Mistakes & Pro Tips\n> [!WARNING]\n> Naming a variable `2ndScore` causes a compiler syntax error because identifiers cannot start with numbers. Use `secondScore` or `score_2` instead.',codeExamples:[{id:`code-m2-1`,title:`Valid vs Invalid Identifier Examples`,language:`c`,code:`// Valid:
int student_count;
int _system_flag;
int level3_boss;

// Invalid (Will fail to compile):
// int 3rd_player;   // Error: starts with digit
// int float;        // Error: keyword reserved
// int my salary;    // Error: contains space`,explanation:`Examples showing legal and illegal variable names in C.`}],keyPoints:[`Tokens are the foundational units in C syntax.`,`C has 32 standard reserved keywords.`,`Identifiers must start with a letter or underscore and contain no whitespace.`],practiceQuestions:[{id:`pq-m2-1`,question:`Which of the following is a valid C identifier: 1value, total_sum, my-var, default?`,answer:`total_sum`,explanation:`1value starts with a digit (illegal), my-var has a hyphen operator (illegal), and default is a reserved keyword. total_sum is valid.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m2-1`,title:`C Keywords Reference`,url:`https://en.cppreference.com/w/c/keyword`,description:`Full list of standard C reserved keywords and definitions.`}]}]},{id:`c-topic-2-2-data-types`,title:`Topic 2: Variables & Data Types`,description:`Understand memory sizes, ranges, and representations of int, float, double, char, and modifiers.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-2-2-fundamental-types`,title:`Unit 2: Fundamental Data Types & sizeof`,description:`Master int, float, double, char, their byte sizes in memory, and the sizeof operator.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Understand fundamental data types and their standard memory footprints.`,`Use the sizeof operator to measure byte allocations.`,`Understand type qualifiers: signed, unsigned, short, long.`],readingContent:'# Fundamental Data Types in C\n\n## Overview\nEvery variable in C must have an explicit data type that determines how much memory is allocated and how bits are interpreted.\n\n## Learning Objectives\n- Master the primary data types: `int`, `float`, `double`, and `char`.\n- Use `sizeof` to inspect memory sizes on your architecture.\n- Understand `signed` vs `unsigned` integers.\n\n## Data Type Summary (64-bit Architecture)\n\n| Type | Typical Size | Format Specifier | Typical Range |\n| :--- | :--- | :--- | :--- |\n| `char` | 1 Byte | `%c` | -128 to +127 (or 0 to 255) |\n| `unsigned char` | 1 Byte | `%u` | 0 to 255 |\n| `short int` | 2 Bytes | `%hd` | -32,768 to +32,767 |\n| `int` | 4 Bytes | `%d` or `%i` | -2,147,483,648 to +2,147,483,647 |\n| `unsigned int` | 4 Bytes | `%u` | 0 to 4,294,967,295 |\n| `long long int` | 8 Bytes | `%lld` | $\\approx -9 \\times 10^{18}$ to $+9 \\times 10^{18}$ |\n| `float` | 4 Bytes | `%f` | 6-7 decimal digits precision |\n| `double` | 8 Bytes | `%lf` | 15-17 decimal digits precision |\n\n## Example: Inspecting Memory Sizes\n```c\n#include <stdio.h>\n\nint main(void) {\n    printf("Size of char:        %zu byte(s)\\n", sizeof(char));\n    printf("Size of short:       %zu byte(s)\\n", sizeof(short));\n    printf("Size of int:         %zu byte(s)\\n", sizeof(int));\n    printf("Size of long long:   %zu byte(s)\\n", sizeof(long long));\n    printf("Size of float:       %zu byte(s)\\n", sizeof(float));\n    printf("Size of double:      %zu byte(s)\\n", sizeof(double));\n    return 0;\n}\n```\n\n## Expected Output\n```text\nSize of char:        1 byte(s)\nSize of short:       2 byte(s)\nSize of int:         4 byte(s)\nSize of long long:   8 byte(s)\nSize of float:       4 byte(s)\nSize of double:      8 byte(s)\n```\n\n## Common Mistakes & Pro Tips\n> [!TIP]\n> For financial or high-precision calculations, always prefer `double` over `float` to prevent floating-point rounding inaccuracies.',codeExamples:[{id:`code-m2-2`,title:`Data Types and Format Specifiers`,language:`c`,code:`#include <stdio.h>

int main(void) {
    int age = 21;
    double salary = 75450.50;
    char grade = 'A';

    printf("Age: %d | Salary: $%.2f | Grade: %c\\n", age, salary, grade);
    return 0;
}`,explanation:`Demonstrates declaration and printing with %d, %.2f, and %c.`}],keyPoints:[`char is 1 byte, int is typically 4 bytes, double is 8 bytes.`,`sizeof returns the memory size in bytes as type size_t.`,`unsigned types cannot hold negative values but double the positive range.`],practiceQuestions:[{id:`pq-m2-2`,question:`What is the format specifier used in printf() to print a double value?`,answer:`%lf (or %f in printf, %lf in scanf)`,explanation:`In printf(), %f and %lf are interchangeable due to default argument promotion, but %lf is strictly required in scanf() for double.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m2-2`,title:`C Data Types Reference`,url:`https://en.cppreference.com/w/c/language/type`,description:`Complete specification on fundamental C object types.`}]}]},{id:`c-topic-2-3-io`,title:`Topic 3: Formatted Input & Output`,description:`Master printf() formatting, scanf() address operator (&), buffer mechanics, and interactive CLI programs.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-2-3-printf-scanf`,title:`Unit 3: printf() and scanf() in Depth`,description:`Master field width, precision flags, escape characters, and user input validation with scanf.`,duration:`20 mins`,type:`Reading`,learningObjectives:[`Use printf formatting specifiers, width pads, and precision limits.`,`Use scanf with address-of (&) operator to capture user input.`,`Handle common input buffer pitfalls.`],readingContent:`# Formatted Input & Output in C

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
> Forgetting the \`&\` before variable names in \`scanf("%d", age)\` causes a **Segmentation Fault** crash because \`scanf\` treats the uninitialized value of \`age\` as a memory pointer!`,codeExamples:[{id:`code-m2-3`,title:`Formatted Table Output Example`,language:`c`,code:`#include <stdio.h>

int main(void) {
    printf("%-10s | %-12s | %-6s\\n", "Item", "Category", "Price");
    printf("-----------------------------------\\n");
    printf("%-10s | %-12s | $%5.2f\\n", "Apple", "Fruit", 1.25);
    printf("%-10s | %-12s | $%5.2f\\n", "Notebook", "Stationery", 4.50);
    return 0;
}`,explanation:`Shows width alignment for tabular console outputs.`}],keyPoints:[`printf() writes formatted strings to stdout.`,`scanf() requires the address-of operator (&) for scalar variables.`,`Check scanf() return value to verify successful input conversions.`],practiceQuestions:[{id:`pq-m2-3`,question:`Why does scanf("%d", &num) require the & operator before num?`,answer:`Because C passes arguments by value. scanf() needs the memory address of num so it can write the input data directly into num's memory location.`,explanation:`Without &, scanf receives a copy of num's current value and cannot modify the original variable.`,difficulty:`Medium`}],resourceLinks:[{id:`res-m2-3`,title:`printf and scanf Specification`,url:`https://en.cppreference.com/w/c/io/vfprintf`,description:`Complete reference for formatted input/output format conversion specifiers.`}]}]}]},{id:`c-mod-3`,title:`Module 3: Operators & Expressions`,description:`Master Arithmetic, Relational, Logical, Assignment, Increment/Decrement (++ / --), Conditional (Ternary), and Bitwise operators with precedence rules.`,duration:`3 Hours`,topics:[{id:`c-topic-3-1-arithmetic-logic`,title:`Topic 1: Arithmetic, Relational & Logical Operators`,description:`Explore mathematical computations, comparison checks, boolean logic, and short-circuit evaluation.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-3-1-arith-rel-log`,title:`Unit 1: Arithmetic & Logical Mechanics`,description:`Learn integer division vs floating division, modulus (%), logical AND (&&), OR (||), and NOT (!).`,duration:`20 mins`,type:`Reading`,learningObjectives:[`Master all arithmetic operators including modulus (%).`,`Understand integer division truncation (5 / 2 = 2).`,`Apply logical operators (&&, ||, !) with short-circuit evaluation.`],readingContent:'# Arithmetic, Relational & Logical Operators\n\n## Overview\nOperators are special symbols that instruct the compiler to perform mathematical, relational, or logical evaluations.\n\n## Learning Objectives\n- Calculate values using `+`, `-`, `*`, `/`, and `%`.\n- Compare values using `==`, `!=`, `<`, `>`, `<=`, `>=`.\n- Combine expressions using `&&` (AND), `||` (OR), and `!` (NOT).\n\n## 1. Integer Division vs Modulus\n- In C, when two integers are divided, the result is truncated to an integer:\n  ```c\n  int a = 7, b = 2;\n  int result = a / b;    // Result is 3 (NOT 3.5!)\n  int remainder = a % b; // Result is 1\n  double exact = (double)a / b; // Result is 3.5\n  ```\n\n## 2. Logical Short-Circuiting\n- **`&&` (AND)**: If the left operand is false (`0`), the right operand is **never evaluated**.\n- **`||` (OR)**: If the left operand is true (`1`), the right operand is **never evaluated**.\n\n## Example Program\n```c\n#include <stdio.h>\n\nint main(void) {\n    int score = 85;\n    int attendance = 90;\n\n    // Relational and Logical expression\n    if (score >= 80 && attendance >= 75) {\n        printf("Student qualifies for Distinction honors!\\n");\n    } else {\n        printf("Standard qualification.\\n");\n    }\n\n    return 0;\n}\n```\n\n## Expected Output\n```text\nStudent qualifies for Distinction honors!\n```\n\n## Common Mistakes & Pro Tips\n> [!CAUTION]\n> Confusing assignment (`=`) with equality (`==`) is the #1 beginner bug! `if (x = 5)` assigns 5 to x (which is true) instead of comparing x with 5. Always use `if (x == 5)`.',codeExamples:[{id:`code-m3-1`,title:`Modulus and Integer Division Demo`,language:`c`,code:`#include <stdio.h>

int main(void) {
    int seconds = 3725;
    int hours = seconds / 3600;
    int minutes = (seconds % 3600) / 60;
    int secs = seconds % 60;
    printf("%d seconds = %02d:%02d:%02d\\n", seconds, hours, minutes, secs);
    return 0;
}`,explanation:`Splits total seconds into Hours, Minutes, and Seconds using division and modulus.`}],keyPoints:[`Modulus (%) returns the remainder of integer division.`,`Logical AND (&&) and OR (||) feature short-circuit evaluation.`,`Always use == for comparison and = for assignment.`],practiceQuestions:[{id:`pq-m3-1`,question:`What is the output of 15 % 4 in C?`,answer:`3`,explanation:`15 divided by 4 equals 3 with a remainder of 3. Modulus returns the remainder: 3.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m3-1`,title:`C Operators Precedence Table`,url:`https://en.cppreference.com/w/c/language/operator_precedence`,description:`Full reference hierarchy for operator binding and associativity in C.`}]}]},{id:`c-topic-3-2-bitwise-precedence`,title:`Topic 2: Bitwise Operators & Precedence`,description:`Master low-level bit manipulation (&, |, ^, ~, <<, >>), conditional operator (?:), and precedence rules.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-3-2-bitwise-and-shifts`,title:`Unit 2: Bitwise Operations & Precedence`,description:`Understand bit masking, bit shifting, ternary operator, and evaluation order.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Understand bitwise AND (&), OR (|), XOR (^), NOT (~).`,`Use left shift (<<) and right shift (>>).`,`Use the ternary conditional operator (condition ? expr1 : expr2).`,`Understand operator precedence and associativity.`],readingContent:`# Bitwise Operators & Precedence

## Overview
C gives programmers the unique capability to directly manipulate individual binary bits of integers.

## Learning Objectives
- Learn the bitwise operations: \`&\`, \`|\`, \`^\`, \`~\`, \`<<\`, \`>>\`.
- Apply bit shifting for high-speed multiplication/division by powers of 2.
- Master the Ternary Operator \`? :\`.

## 1. Bitwise Truth Table
| Bit A | Bit B | A & B (AND) | A | B (OR) | A ^ B (XOR) | ~A (NOT) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 |

## 2. Fast Bit Shifts
- **Left Shift (\`x << n\`)**: Shifts bits left by $n$ positions (multiplies $x$ by $2^n$).
  \`5 << 1\` $	o$ \`00000101 << 1\` = \`00001010\` (10).
- **Right Shift (\`x >> n\`)**: Shifts bits right by $n$ positions (divides $x$ by $2^n$).
  \`20 >> 2\` $	o$ \`5\`.

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
> In complex arithmetic and logical expressions, always use parentheses \`()\` to enforce intended evaluation order rather than relying solely on memory of operator precedence tables.`,codeExamples:[{id:`code-m3-2`,title:`Checking Odd/Even with Bitwise AND`,language:`c`,code:`#include <stdio.h>

int main(void) {
    int n = 43;
    // Lowest bit of any odd number is 1
    if (n & 1) {
        printf("%d is ODD\\n", n);
    } else {
        printf("%d is EVEN\\n", n);
    }
    return 0;
}`,explanation:`High-speed odd/even check using bitwise & instead of modulus % 2.`}],keyPoints:[`Bitwise operators operate directly on binary bits of integer data types.`,`x << n multiplies x by 2^n; x >> n divides x by 2^n.`,`The ternary operator provides concise inline conditional evaluation.`],practiceQuestions:[{id:`pq-m3-2`,question:`What is the result of the expression 8 << 2 in C?`,answer:`32`,explanation:`Left shifting by 2 multiplies by 2^2 (4). 8 * 4 = 32.`,difficulty:`Medium`}],resourceLinks:[{id:`res-m3-2`,title:`Bitwise Operators in C`,url:`https://en.wikipedia.org/wiki/Bitwise_operations_in_C`,description:`Comprehensive guide to bit manipulation masks and registers.`}]}]}]}],t=[{id:`c-mod-4`,title:`Module 4: Control Flow Structures`,description:`Master conditional branching (if, if-else, switch), iterative loops (for, while, do-while), jump statements (break, continue), and nested pattern algorithms.`,duration:`4 Hours`,topics:[{id:`c-topic-4-1-conditionals`,title:`Topic 1: Conditional Statements`,description:`Understand if, if-else, else-if ladder, nested conditionals, and switch-case control.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-4-1-if-else-switch`,title:`Unit 1: Conditionals & Switch Statements`,description:`Master branching control structures, boolean truth evaluation, and multi-way switch-case constructs.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Write clean if, else-if, and else statements.`,`Use switch-case with break and default clauses.`,`Understand fall-through behavior in switch statements.`],readingContent:`# Decision-Making in C

## Overview
Control flow statements allow a program to make decisions and execute different blocks of code based on conditions.

## Learning Objectives
- Master \`if\`, \`if-else\`, and \`else-if\` ladders.
- Implement multi-way branching with \`switch-case\`.
- Prevent accidental switch fall-through.

## 1. if-else Ladder
\`\`\`c
#include <stdio.h>

int main(void) {
    int marks = 88;

    if (marks >= 90) {
        printf("Grade: A+\\n");
    } else if (marks >= 80) {
        printf("Grade: A\\n");
    } else if (marks >= 70) {
        printf("Grade: B\\n");
    } else if (marks >= 60) {
        printf("Grade: C\\n");
    } else {
        printf("Grade: F\\n");
    }

    return 0;
}
\`\`\`

## 2. switch-case Statements
A \`switch\` expression must evaluate to an **integral type** (\`int\` or \`char\`). Each \`case\` constant must be unique:

\`\`\`c
#include <stdio.h>

int main(void) {
    char operation = '*';
    double a = 12.0, b = 4.0;

    switch (operation) {
        case '+':
            printf("Result: %.2f\\n", a + b);
            break;
        case '-':
            printf("Result: %.2f\\n", a - b);
            break;
        case '*':
            printf("Result: %.2f\\n", a * b);
            break;
        case '/':
            if (b != 0) printf("Result: %.2f\\n", a / b);
            else printf("Error: Division by zero!\\n");
            break;
        default:
            printf("Invalid operator!\\n");
            break;
    }

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Grade: A
Result: 48.00
\`\`\`

## Common Mistakes & Pro Tips
> [!WARNING]
> Forgetting the \`break;\` statement at the end of a \`case\` block causes execution to "fall through" into the next case regardless of whether its condition matches. Always include \`break;\` unless intentional fall-through is required.`,codeExamples:[{id:`code-m4-1`,title:`Menu-Driven CLI Switch Example`,language:`c`,code:`#include <stdio.h>

int main(void) {
    int choice = 2;
    switch(choice) {
        case 1: printf("Balance Inquiry\\n"); break;
        case 2: printf("Withdraw Funds\\n"); break;
        case 3: printf("Deposit Funds\\n"); break;
        default: printf("Exit\\n"); break;
    }
    return 0;
}`,explanation:`Standard menu selector using switch-case in C.`}],keyPoints:[`if-else evaluates boolean truth (non-zero is true, 0 is false).`,`switch expression must evaluate to integer or char constant.`,`break prevents fall-through to subsequent case blocks.`],practiceQuestions:[{id:`pq-m4-1`,question:`Can you use a float or double variable in a switch statement condition in C?`,answer:`No, switch statements in C strictly require integral types (int, char, enum).`,explanation:`Floating-point numbers cannot be exactly matched against discrete case constants due to precision representation.`,difficulty:`Medium`}],resourceLinks:[{id:`res-m4-1`,title:`C Statements & Branching Reference`,url:`https://en.cppreference.com/w/c/language/if`,description:`ISO C reference on if, else, and switch branching mechanics.`}]}]},{id:`c-topic-4-2-loops-patterns`,title:`Topic 2: Loops, Jump Statements & Patterns`,description:`Master for, while, do-while loops, break, continue, and nested pattern printing algorithms.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-4-2-loops-and-patterns`,title:`Unit 2: Loops & Pattern Generation`,description:`Master for, while, do-while iteration, loop control keywords, and 2D nested loop patterns.`,duration:`30 mins`,type:`Reading`,learningObjectives:[`Compare for, while, and do-while loops.`,`Use break to terminate loops and continue to skip iterations.`,`Construct nested loops for number triangles and pyramids.`],readingContent:`# Loops & Iteration in C

## Overview
Loops repeat a block of code until a specified termination condition is met.

## Learning Objectives
- **for loop**: Best when iteration count is known in advance.
- **while loop**: Best for condition-based iteration (unknown count).
- **do-while loop**: Guarantees at least one execution before condition check.

## Loop Syntax Comparison

\`\`\`c
#include <stdio.h>

int main(void) {
    // 1. for loop
    printf("for loop: ");
    for (int i = 1; i <= 5; i++) {
        printf("%d ", i);
    }
    printf("\\n");

    // 2. while loop
    int count = 5;
    printf("while loop: ");
    while (count > 0) {
        printf("%d ", count);
        count--;
    }
    printf("\\n");

    // 3. do-while loop (Runs at least once)
    int n = 1;
    printf("do-while: ");
    do {
        printf("%d ", n);
        n++;
    } while (n <= 3);
    printf("\\n");

    return 0;
}
\`\`\`

## Nested Loops: Right-Angled Number Triangle
\`\`\`c
#include <stdio.h>

int main(void) {
    int rows = 5;
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d ", j);
        }
        printf("\\n");
    }
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
for loop: 1 2 3 4 5 
while loop: 5 4 3 2 1 
do-while: 1 2 3 

1 
1 2 
1 2 3 
1 2 3 4 
1 2 3 4 5 
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> Forgetting to update loop control variables (e.g. \`i++\` or \`count--\`) creates an **infinite loop**, freezing program execution and consuming 100% CPU core capacity.`,codeExamples:[{id:`code-m4-2`,title:`Prime Number Checker Algorithm`,language:`c`,code:`#include <stdio.h>
#include <stdbool.h>

int main(void) {
    int num = 29;
    bool isPrime = true;
    if (num <= 1) isPrime = false;
    for (int i = 2; i * i <= num; i++) {
        if (num % i == 0) {
            isPrime = false;
            break;
        }
    }
    printf("%d is %s\\n", num, isPrime ? "PRIME" : "NOT PRIME");
    return 0;
}`,explanation:`Efficient O(sqrt(n)) prime number test using loop break optimization.`}],keyPoints:[`for loops package initialization, condition, and increment into one line.`,`break immediately exits the enclosing loop; continue skips to next iteration.`,`Nested loops are essential for multi-dimensional coordinate grids and matrices.`],practiceQuestions:[{id:`pq-m4-2`,question:`What is the fundamental difference between a while loop and a do-while loop?`,answer:`A while loop tests the condition before executing the loop body (entry-controlled), while a do-while loop executes the body first and tests the condition at the end (exit-controlled), guaranteeing at least one execution.`,explanation:`do-while is ideal for input menus where you must prompt the user at least once.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m4-2`,title:`C Iteration Statements`,url:`https://en.cppreference.com/w/c/language/for`,description:`Complete specification on for, while, and do-while loops in C.`}]}]}]},{id:`c-mod-5`,title:`Module 5: Functions & Modular Programming`,description:`Learn function prototypes, definitions, parameters, return values, call-by-value mechanics, variable scope (local vs global vs static), and recursion.`,duration:`3.5 Hours`,topics:[{id:`c-topic-5-1-basics`,title:`Topic 1: Function Basics & Scope`,description:`Understand modular design, prototypes, return types, call-by-value, and memory stack frames.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-5-1-function-anatomy`,title:`Unit 1: Function Declarations, Definitions & Calls`,description:`Master modular code decomposition, parameters, return values, and call-by-value mechanics.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Deconstruct the 3 parts of functions: Declaration, Definition, and Invocation.`,`Understand return types and void functions.`,`Understand why C is strictly Call by Value by default.`],readingContent:`# Functions in C

## Overview
A **Function** is a self-contained block of reusable code that performs a specific subtask, making programs modular, readable, and maintainable.

## Learning Objectives
- Declare function prototypes before \`main()\`.
- Pass arguments and receive return values.
- Understand Call-by-Value parameter passing.

## Anatomy of a C Function
\`\`\`c
// 1. FUNCTION DECLARATION (PROTOTYPE)
int addNumbers(int a, int b);

// 2. MAIN CALLER
int main(void) {
    int sum = addNumbers(15, 25); // FUNCTION CALL
    printf("Sum: %d\\n", sum);
    return 0;
}

// 3. FUNCTION DEFINITION
int addNumbers(int a, int b) {
    return a + b;
}
\`\`\`

## Call by Value Concept
In C, when you pass a variable to a function, the function receives a **copy** of the value. Any modifications made to the parameter inside the function do **not** affect the original variable in the caller.

\`\`\`c
#include <stdio.h>

void tryToModify(int x) {
    x = 999; // Only modifies local copy
}

int main(void) {
    int num = 42;
    tryToModify(num);
    printf("num is still: %d\\n", num); // Prints 42
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
num is still: 42
\`\`\`

## Common Mistakes & Pro Tips
> [!NOTE]
> To modify the original variable from inside a function, you must pass its **memory pointer** (covered in Module 7).`,codeExamples:[{id:`code-m5-1`,title:`Power Function Implementation`,language:`c`,code:`#include <stdio.h>

long long power(int base, int exp) {
    long long result = 1;
    for(int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

int main(void) {
    printf("2^10 = %lld\\n", power(2, 10));
    return 0;
}`,explanation:`Calculates exponentiation using modular function abstraction.`}],keyPoints:[`Function prototypes tell the compiler parameter types and return type before main().`,`C passes arguments by value (copies values to the function stack frame).`,`void return type signifies a function that returns no value.`],practiceQuestions:[{id:`pq-m5-1`,question:`Why are function prototypes recommended at the top of C source files?`,answer:`Prototypes allow the compiler to perform strict type-checking on function calls before it has seen the actual function definition body.`,explanation:`Without a prototype, calling a function defined below main() produces compiler warnings or compilation errors.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m5-1`,title:`C Functions Specification`,url:`https://en.cppreference.com/w/c/language/functions`,description:`Official ISO C reference on function declarations and definitions.`}]}]},{id:`c-topic-5-2-recursion`,title:`Topic 2: Recursion & Scope Rules`,description:`Understand recursive algorithms, base cases, call stacks, and static vs local variables.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-5-2-recursion-mechanics`,title:`Unit 2: Recursive Functions & Call Stacks`,description:`Master recursion base conditions, call stack memory unwinding, and classic recursive problems.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Understand the recursive mechanism (function calling itself).`,`Identify mandatory base conditions to prevent stack overflow.`,`Implement Factorial and Fibonacci recursively.`],readingContent:`# Recursion in C

## Overview
**Recursion** is a programming technique where a function solves a problem by calling itself with smaller instances of the same problem.

## Learning Objectives
- Structure recursive functions with **Base Case** and **Recursive Step**.
- Visualize Call Stack growth and return unwinding.
- Prevent stack overflow crashes.

## Recursive Factorial ($n! = n \\times (n-1)!$)
\`\`\`c
#include <stdio.h>

long long factorial(int n) {
    // 1. Base Case (Halts recursion)
    if (n <= 1) {
        return 1;
    }
    // 2. Recursive Case
    return n * factorial(n - 1);
}

int main(void) {
    int num = 6;
    printf("Factorial of %d is %lld\\n", num, factorial(num));
    return 0;
}
\`\`\`

## Visualizing the Call Stack for factorial(3):
\`\`\`text
factorial(3) = 3 * factorial(2)
                 |-> 2 * factorial(1)
                           |-> returns 1 (Base Case reached!)
                     |-> returns 2 * 1 = 2
|-> returns 3 * 2 = 6
\`\`\`

## Expected Output
\`\`\`text
Factorial of 6 is 720
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> Omitting a base case causes infinite recursion, leading to a **Stack Overflow** crash when CPU stack memory is exhausted.`,codeExamples:[{id:`code-m5-2`,title:`Recursive Fibonacci Sequence`,language:`c`,code:`#include <stdio.h>

int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main(void) {
    for (int i = 0; i < 8; i++) {
        printf("%d ", fibonacci(i));
    }
    printf("\\n");
    return 0;
}`,explanation:`Prints first 8 Fibonacci terms using recursive tree evaluation.`}],keyPoints:[`Every recursive function requires a base case to terminate execution.`,`Stack frames store local state for each active recursive call.`,`Excessive recursive depth without tail call optimization causes stack overflow.`],practiceQuestions:[{id:`pq-m5-2`,question:`What happens if a recursive function does not define a valid base case?`,answer:`It calls itself infinitely until system stack memory is exhausted, triggering a Segmentation Fault (Stack Overflow).`,explanation:`Each call allocates a new stack frame; without termination, stack limits are quickly breached.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m5-2`,title:`Recursion in Computer Science`,url:`https://en.wikipedia.org/wiki/Recursion_(computer_science)`,description:`Deep dive into call stack frames, induction, and recurrence relations.`}]}]}]},{id:`c-mod-6`,title:`Module 6: Arrays & String Processing`,description:`Master 1D arrays, 2D matrices, linear/bubble search algorithms, C-style null-terminated strings, and string.h library functions.`,duration:`4 Hours`,topics:[{id:`c-topic-6-1-arrays`,title:`Topic 1: One-Dimensional & Two-Dimensional Arrays`,description:`Understand contiguous memory layout, indexing, bounds, and matrix mathematics.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-6-1-1d-2d-arrays`,title:`Unit 1: Array Fundamentals & Matrices`,description:`Learn array indexing, contiguous memory layout, matrix arithmetic, and boundary safety.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Declare, initialize, and traverse 1D arrays.`,`Understand row-major memory order in 2D arrays.`,`Perform matrix addition and transformations.`],readingContent:`# Arrays in C

## Overview
An **Array** is a fixed-size, sequential collection of elements of the same data type stored in **contiguous** memory locations.

## Learning Objectives
- Index array elements from \`0\` to \`size - 1\`.
- Traverse arrays with \`for\` loops.
- Work with 2D matrices.

## 1. 1D Array Fundamentals
\`\`\`c
#include <stdio.h>

int main(void) {
    int scores[5] = {85, 92, 78, 96, 88};
    int count = sizeof(scores) / sizeof(scores[0]);
    int sum = 0;

    for (int i = 0; i < count; i++) {
        sum += scores[i];
    }

    double average = (double)sum / count;
    printf("Total Sum: %d | Class Average: %.2f\\n", sum, average);
    return 0;
}
\`\`\`

## 2. 2D Arrays (Matrix Operations)
\`\`\`c
#include <stdio.h>

int main(void) {
    int matrix[2][3] = {
        {1, 2, 3},
        {4, 5, 6}
    };

    printf("2D Matrix Grid:\\n");
    for (int r = 0; r < 2; r++) {
        for (int c = 0; c < 3; c++) {
            printf("%d ", matrix[r][c]);
        }
        printf("\\n");
    }
    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Total Sum: 439 | Class Average: 87.80
2D Matrix Grid:
1 2 3 
4 5 6 
\`\`\`

## Common Mistakes & Pro Tips
> [!WARNING]
> C does **NOT** perform array bounds checking! Accessing \`arr[10]\` in an array of size 5 reads garbage memory or causes memory corruption. Always keep loop counters within \`0 <= i < size\`.`,codeExamples:[{id:`code-m6-1`,title:`Finding Maximum and Minimum in Array`,language:`c`,code:`#include <stdio.h>

int main(void) {
    int arr[] = {14, 52, 9, 87, 43, 65};
    int n = sizeof(arr)/sizeof(arr[0]);
    int max = arr[0], min = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
    }
    printf("Max: %d, Min: %d\\n", max, min);
    return 0;
}`,explanation:`Scans array elements sequentially in O(n) time to find extremes.`}],keyPoints:[`Array elements are stored contiguously in physical memory.`,`Array indexing starts at 0 and ends at size - 1.`,`sizeof(arr) / sizeof(arr[0]) calculates the element count of stack-allocated arrays.`],practiceQuestions:[{id:`pq-m6-1`,question:`If int arr[5] is declared at memory address 1000, and sizeof(int) is 4 bytes, what is the address of arr[3]?`,answer:`1012`,explanation:`Address = Base + (Index * sizeof(type)) = 1000 + (3 * 4) = 1012.`,difficulty:`Medium`}],resourceLinks:[{id:`res-m6-1`,title:`C Array Documentation`,url:`https://en.cppreference.com/w/c/language/array`,description:`ISO C technical reference on multi-dimensional array memory layouts.`}]}]},{id:`c-topic-6-2-strings`,title:`Topic 2: C Strings & String.h Functions`,description:`Understand null-terminated character arrays, strlen, strcpy, strcat, strcmp, and safe buffer handling.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-6-2-c-strings`,title:`Unit 2: String Manipulation & Library Utilities`,description:`Master null terminator (\0), safe string input with fgets, and core string.h library functions.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Understand how C represents strings using null-terminated char arrays (\\0).`,`Use fgets() for safe multi-word string input.`,`Apply strlen(), strcpy(), strcat(), and strcmp() from <string.h>.`],readingContent:`# Strings in C

## Overview
In C, a **String** is simply an array of characters terminated by a special null character (**\`\\0\`**, ASCII value 0).

## Learning Objectives
- Understand the role of the null terminator \`\\0\`.
- Use \`<string.h>\` functions safely.
- Compare strings using \`strcmp()\`.

## 1. Core <string.h> Functions
| Function | Description | Example |
| :--- | :--- | :--- |
| \`strlen(s)\` | Returns number of characters (excluding \`\\0\`) | \`strlen("Kaizen")\` $	o$ \`6\` |
| \`strcpy(dest, src)\` | Copies source string into destination | Copies \`src\` to \`dest\` |
| \`strcat(dest, src)\` | Concatenates \`src\` onto end of \`dest\` | Joins strings |
| \`strcmp(s1, s2)\` | Compares lexicographically (returns \`0\` if equal) | \`strcmp("A", "B") < 0\` |

## Example: String Operations
\`\`\`c
#include <stdio.h>
#include <string.h>

int main(void) {
    char greeting[50] = "Hello";
    char name[] = "KaizenQ Developer";

    // 1. Length
    printf("Length of name: %zu\\n", strlen(name));

    // 2. Concatenation
    strcat(greeting, ", ");
    strcat(greeting, name);
    printf("Joined: %s\\n", greeting);

    // 3. Comparison
    if (strcmp("Apple", "Banana") < 0) {
        printf("'Apple' comes before 'Banana' alphabetically.\\n");
    }

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Length of name: 17
Joined: Hello, KaizenQ Developer
'Apple' comes before 'Banana' alphabetically.
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> Never use \`==\` to compare C strings (e.g. \`if (str1 == str2)\`)! In C, \`==\` compares the pointer memory addresses of the arrays, not their character contents. Always use \`strcmp(str1, str2) == 0\`.`,codeExamples:[{id:`code-m6-2`,title:`Palindrome String Checker`,language:`c`,code:`#include <stdio.h>
#include <string.h>
#include <stdbool.h>

int main(void) {
    char word[] = "radar";
    int len = strlen(word);
    bool isPal = true;
    for(int i = 0; i < len / 2; i++) {
        if(word[i] != word[len - 1 - i]) {
            isPal = false;
            break;
        }
    }
    printf("%s is %s\\n", word, isPal ? "a PALINDROME" : "NOT a palindrome");
    return 0;
}`,explanation:`Two-pointer bidirectional check to verify palindrome strings.`}],keyPoints:[`All C strings must terminate with the null character \\0.`,`strcmp() returns 0 when two strings are identical.`,`Use fgets() instead of gets() to prevent buffer overflow vulnerabilities.`],practiceQuestions:[{id:`pq-m6-2`,question:`What is the return value of strcmp("Code", "Code") in C?`,answer:`0`,explanation:`strcmp returns 0 when both strings contain identical characters up to the null terminator.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m6-2`,title:`C String Library Reference`,url:`https://en.cppreference.com/w/c/string/byte`,description:`Full documentation on string.h library functions.`}]}]}]}],n=[{id:`c-mod-7`,title:`Module 7: Pointers & Direct Memory Access`,description:`Master pointer variables, address-of (&), dereference (*), pointer arithmetic, passing pointers to functions (call by reference), and double pointers.`,duration:`4.5 Hours`,topics:[{id:`c-topic-7-1-basics`,title:`Topic 1: Pointer Fundamentals & Dereferencing`,description:`Understand memory addresses, hex formatting (%p), pointer types, and value modification via dereferencing.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-7-1-what-is-pointer`,title:`Unit 1: What is a Pointer & Address Operators`,description:`Master memory addressing, pointer declaration syntax, address-of operator (&), and dereference operator (*).`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Understand that every variable lives at a specific byte address in RAM.`,`Use the address-of operator (&) to retrieve memory locations.`,`Use the dereference operator (*) to read and modify values through pointers.`],readingContent:`# Pointers in C

## Overview
A **Pointer** is a special variable whose value is the **memory address** of another variable. Pointers are the defining superpower of the C language.

## Learning Objectives
- Declare pointer variables (\`int *ptr\`).
- Extract addresses with \`&\` and inspect them with \`%p\`.
- Read and write memory values using the dereference operator \`*\`.

## Memory Visualization
\`\`\`text
Variable Name:   num                 ptr
Variable Value:  42     <--------   0x7ffeefbff568 (Address of num)
Memory Address:  0x7ffeefbff568     0x7ffeefbff560
\`\`\`

## Example
\`\`\`c
#include <stdio.h>

int main(void) {
    int score = 95;
    
    // 1. Declare pointer and assign memory address of score
    int *ptr = &score;

    printf("Value of score:          %d\\n", score);
    printf("Memory address of score: %p\\n", (void*)&score);
    printf("Value stored in ptr:     %p\\n", (void*)ptr);
    printf("Dereferenced (*ptr):     %d\\n", *ptr);

    // 2. Modify value of score THROUGH the pointer
    *ptr = 100;
    printf("\\nAfter *ptr = 100;\\n");
    printf("New value of score:      %d\\n", score);

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Value of score:          95
Memory address of score: 0x7ffeefbff568
Value stored in ptr:     0x7ffeefbff568
Dereferenced (*ptr):     95

After *ptr = 100;
New value of score:      100
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> Never dereference an **uninitialized pointer** (e.g. \`int *p; *p = 10;\`)! This writes to a random location in RAM, causing instant crash or silent data corruption. Always initialize pointers to \`NULL\` or a valid address.`,codeExamples:[{id:`code-m7-1`,title:`Simulating Pass-by-Reference with Pointers`,language:`c`,code:`#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 10, y = 20;
    printf("Before swap: x=%d, y=%d\\n", x, y);
    swap(&x, &y);
    printf("After swap:  x=%d, y=%d\\n", x, y);
    return 0;
}`,explanation:`Demonstrates swapping two variables in caller scope by passing memory pointers.`}],keyPoints:[`Pointers store memory addresses of other variables.`,`& extracts the address of a variable; * dereferences the address.`,`Passing pointers allows functions to directly mutate variables in caller scope.`],practiceQuestions:[{id:`pq-m7-1`,question:`If int x = 50; int *p = &x; what does *p evaluate to?`,answer:`50`,explanation:`Dereferencing pointer *p reads the value stored at the address pointed to by p, which is the value of x (50).`,difficulty:`Easy`}],resourceLinks:[{id:`res-m7-1`,title:`C Pointers Reference`,url:`https://en.cppreference.com/w/c/language/pointer`,description:`Official ISO C specification on pointer semantics and type alignments.`}]}]},{id:`c-topic-7-2-arithmetic-double`,title:`Topic 2: Pointer Arithmetic & Double Pointers`,description:`Understand pointer scaling by data type size, pointer-array duality, and pointer-to-pointer (int **ptr).`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-7-2-pointer-arithmetic`,title:`Unit 2: Pointer Arithmetic & Arrays`,description:`Learn how ptr + 1 increments by sizeof(type) bytes and how array names decay into pointers.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Understand pointer arithmetic scaling.`,`Traverse arrays using pointers instead of integer indices.`,`Understand double pointers (int **).`],readingContent:`# Pointer Arithmetic & Arrays

## Overview
When you add an integer $k$ to a pointer (\`ptr + k\`), C advances the pointer by $k \\times \\text{sizeof}(*\\text{ptr})$ bytes in memory.

## Pointer-Array Duality
In C, the name of an array acts as a constant pointer to its first element:
\`\`\`c
arr[i]  ==  *(arr + i)
\`\`\`

## Example
\`\`\`c
#include <stdio.h>

int main(void) {
    int numbers[] = {10, 20, 30, 40, 50};
    int *ptr = numbers; // Points to numbers[0]

    printf("Traversing array with pointer arithmetic:\\n");
    for (int i = 0; i < 5; i++) {
        printf("*(ptr + %d) = %d at address %p\\n", i, *(ptr + i), (void*)(ptr + i));
    }

    // Double Pointer Example
    int val = 500;
    int *p1 = &val;
    int **p2 = &p1; // Pointer to pointer

    printf("\\nDouble pointer value (**p2): %d\\n", **p2);

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Traversing array with pointer arithmetic:
*(ptr + 0) = 10 at address 0x7ffeefbff560
*(ptr + 1) = 20 at address 0x7ffeefbff564
*(ptr + 2) = 30 at address 0x7ffeefbff568
*(ptr + 3) = 40 at address 0x7ffeefbff56c
*(ptr + 4) = 50 at address 0x7ffeefbff570

Double pointer value (**p2): 500
\`\`\`

## Common Mistakes & Pro Tips
> [!NOTE]
> Notice in the output above that each address advances by **4 bytes** because \`sizeof(int) == 4\`. C handles byte scaling automatically!`,codeExamples:[{id:`code-m7-2`,title:`String Length Calculation using Pointers`,language:`c`,code:`#include <stdio.h>

size_t custom_strlen(const char *str) {
    const char *p = str;
    while (*p != '\\0') {
        p++;
    }
    return (size_t)(p - str); // Pointer subtraction yields element count
}

int main(void) {
    printf("Length: %zu\\n", custom_strlen("KaizenQ"));
    return 0;
}`,explanation:`Calculates string length via pointer arithmetic without integer counters.`}],keyPoints:[`Pointer addition advances by sizeof(type) bytes per increment.`,`arr[i] is syntactic sugar for *(arr + i).`,`Subtracting two pointers of the same type yields the number of elements between them.`],practiceQuestions:[{id:`pq-m7-2`,question:`If int *p points to address 2000, and sizeof(int) is 4 bytes, what address does p + 3 point to?`,answer:`2012`,explanation:`Address = 2000 + (3 * 4) = 2012.`,difficulty:`Medium`}],resourceLinks:[{id:`res-m7-2`,title:`Pointer Arithmetic Standards`,url:`https://en.wikipedia.org/wiki/Pointer_(computer_programming)#C_and_C++`,description:`Detailed analysis of pointer semantics and memory alignments.`}]}]}]},{id:`c-mod-8`,title:`Module 8: Structures, Unions & Typedef`,description:`Learn user-defined composite data types: struct, memory padding, arrow operator (->), array of structures, unions, and typedef aliases.`,duration:`3.5 Hours`,topics:[{id:`c-topic-8-1-structures`,title:`Topic 1: Structures & typedef`,description:`Understand grouping heterogeneous data fields, dot (.) vs arrow (->) operators, and typedef syntax.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-8-1-struct-basics`,title:`Unit 1: Struct Declarations & Memory Access`,description:`Master struct definitions, dot operator, pointer arrow operator (->), and typedef aliases.`,duration:`25 mins`,type:`Reading`,learningObjectives:[`Define custom composite records using struct.`,`Access members using dot (.) for values and arrow (->) for pointers.`,`Use typedef to create clean type aliases.`],readingContent:`# Structures in C

## Overview
A **Structure** is a user-defined composite data type that allows you to group variables of **different data types** under a single logical unit.

## Learning Objectives
- Declare and initialize structures.
- Use \`typedef\` for cleaner syntax.
- Access members using \`.\` (direct) and \`->\` (pointer).

## Example: Student Record
\`\`\`c
#include <stdio.h>
#include <string.h>

// Define struct with typedef alias
typedef struct {
    int id;
    char name[50];
    double gpa;
} Student;

// Function taking struct pointer (efficient pass-by-reference)
void printStudent(const Student *s) {
    // Arrow operator (->) dereferences pointer and accesses member
    printf("ID: %d | Name: %-15s | GPA: %.2f\\n", s->id, s->name, s->gpa);
}

int main(void) {
    Student s1 = {101, "Alice Chen", 3.92};
    Student s2;
    
    s2.id = 102;
    strcpy(s2.name, "Bob Smith");
    s2.gpa = 3.65;

    printStudent(&s1);
    printStudent(&s2);

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
ID: 101 | Name: Alice Chen      | GPA: 3.92
ID: 102 | Name: Bob Smith       | GPA: 3.65
\`\`\`

## Common Mistakes & Pro Tips
> [!TIP]
> Always pass large structures to functions by **pointer** (\`const Student *s\`) rather than by value (\`Student s\`). Passing by value creates a full memory copy of the entire structure on the stack frame.`,codeExamples:[{id:`code-m8-1`,title:`Array of Structures Example`,language:`c`,code:`#include <stdio.h>

typedef struct { char title[30]; double price; } Book;

int main(void) {
    Book catalog[2] = {
        {"The C Programming Language", 45.00},
        {"Clean Code", 38.50}
    };
    for(int i = 0; i < 2; i++) {
        printf("%s costs $%.2f\\n", catalog[i].title, catalog[i].price);
    }
    return 0;
}`,explanation:`Demonstrates managing collections of composite records.`}],keyPoints:[`struct groups heterogeneous data items into a single composite record.`,`Use dot (.) when accessing direct struct instances; use arrow (->) for struct pointers.`,`typedef simplifies type declarations by eliminating the need to write "struct" repeatedly.`],practiceQuestions:[{id:`pq-m8-1`,question:`What is the difference between ptr->field and (*ptr).field in C?`,answer:`They are completely identical in functionality; ptr->field is cleaner syntactic sugar for (*ptr).field.`,explanation:`The arrow operator dereferences the pointer and accesses the member in one step.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m8-1`,title:`C Structure Types`,url:`https://en.cppreference.com/w/c/language/struct`,description:`Complete ISO C specification on structs, memory layout, and padding.`}]}]},{id:`c-topic-8-2-unions`,title:`Topic 2: Unions & Shared Memory`,description:`Understand unions, overlapping memory layouts, and tag-based union variants.`,estimatedDuration:`45 mins`,learningUnits:[{id:`c-unit-8-2-union-basics`,title:`Unit 2: Unions vs Structures`,description:`Learn how unions share the same memory location across all members to conserve RAM in embedded systems.`,duration:`20 mins`,type:`Reading`,learningObjectives:[`Understand that a union allocates only enough memory for its largest member.`,`Know when to use unions for hardware registers and variant types.`],readingContent:`# Unions in C

## Overview
A **Union** is similar to a structure, but all of its members share the **same memory location**. The size of a union is equal to the size of its largest member.

## Struct vs Union Memory Comparison
- **struct**: Size is the **sum** of all members (+ padding).
- **union**: Size is the size of the **largest** member.

## Example
\`\`\`c
#include <stdio.h>

union Data {
    int i;
    float f;
    char str[20];
};

int main(void) {
    union Data data;

    printf("Memory size of union Data: %zu bytes\\n", sizeof(data));

    data.i = 10;
    printf("data.i: %d\\n", data.i);

    data.f = 220.5f; // Overwrites the memory occupied by data.i
    printf("data.f: %.2f\\n", data.f);
    printf("data.i is now corrupted: %d\\n", data.i);

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Memory size of union Data: 20 bytes
data.i: 10
data.f: 220.50
data.i is now corrupted: 1130135552
\`\`\`

## Common Mistakes & Pro Tips
> [!WARNING]
> Only one union member can hold a valid value at any given time. Accessing a different member reads the binary bit interpretation of the last written value.`,codeExamples:[{id:`code-m8-2`,title:`IP Address Representation with Union`,language:`c`,code:`#include <stdio.h>
#include <stdint.h>

union IPAddress {
    uint32_t address32;
    uint8_t bytes[4];
};

int main(void) {
    union IPAddress ip;
    ip.bytes[0] = 192;
    ip.bytes[1] = 168;
    ip.bytes[2] = 1;
    ip.bytes[3] = 100;
    printf("IP: %u.%u.%u.%u (Raw 32-bit: 0x%X)\\n", ip.bytes[0], ip.bytes[1], ip.bytes[2], ip.bytes[3], ip.address32);
    return 0;
}`,explanation:`Shows byte-level union overlay for networking IP addresses.`}],keyPoints:[`Unions store all members at the exact same base memory address.`,`Size of a union is equal to its largest member.`,`Ideal for memory-constrained embedded systems and network protocol packet headers.`],practiceQuestions:[{id:`pq-m8-2`,question:`If a union contains a char (1 byte), an int (4 bytes), and a double (8 bytes), what is sizeof(union)?`,answer:`8 bytes`,explanation:`A union allocates memory only for its largest member, which is the double (8 bytes).`,difficulty:`Easy`}],resourceLinks:[{id:`res-m8-2`,title:`C Union Specification`,url:`https://en.cppreference.com/w/c/language/union`,description:`Official ISO C standard documentation on union types and member overlapping.`}]}]}]},{id:`c-mod-9`,title:`Module 9: Dynamic Memory Allocation`,description:`Master heap memory allocation with malloc(), calloc(), realloc(), free(), preventing memory leaks and avoiding dangling pointers.`,duration:`4 Hours`,topics:[{id:`c-topic-9-1-heap-allocation`,title:`Topic 1: Stack vs Heap & Memory Allocators`,description:`Understand memory segments, malloc, calloc, realloc, free, and checking NULL allocations.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-9-1-malloc-calloc-free`,title:`Unit 1: malloc, calloc, realloc & free in Depth`,description:`Master allocating heap memory dynamically at runtime, resizing arrays, and safe deallocation.`,duration:`30 mins`,type:`Reading`,learningObjectives:[`Compare Stack vs Heap memory segments.`,`Allocate memory using malloc() and calloc().`,`Resize dynamically with realloc().`,`Free allocated memory to prevent leaks.`],readingContent:`# Dynamic Memory Allocation in C

## Overview
Static variables and stack variables have fixed sizes determined at compile-time. **Dynamic Memory Allocation** allows programs to request exact amounts of memory from the **Heap** at runtime.

## Learning Objectives
- Use \`malloc(size)\` for uninitialized byte allocation.
- Use \`calloc(n, size)\` for zero-initialized allocation.
- Use \`realloc(ptr, new_size)\` to expand or shrink buffers.
- Use \`free(ptr)\` to release memory back to the OS.

## Function Comparison Table
| Function | Initialization | Parameters |
| :--- | :--- | :--- |
| \`malloc(bytes)\` | Contains garbage data | Total byte count |
| \`calloc(n, size)\` | Initialized to all zeros | Element count + element size |
| \`realloc(ptr, bytes)\` | Preserves existing data | Existing pointer + new byte count |
| \`free(ptr)\` | Releases heap block | Pointer to allocated block |

## Example: Dynamic Array Allocation
\`\`\`c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;

    // 1. Allocate heap array of n integers
    int *arr = (int*)malloc(n * sizeof(int));
    
    // Always verify allocation succeeded!
    if (arr == NULL) {
        fprintf(stderr, "Memory allocation failed!\\n");
        return 1;
    }

    // 2. Populate data
    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
    }

    // 3. Expand array to 8 integers with realloc
    int new_n = 8;
    int *temp = (int*)realloc(arr, new_n * sizeof(int));
    if (temp == NULL) {
        free(arr);
        fprintf(stderr, "Reallocation failed!\\n");
        return 1;
    }
    arr = temp;
    arr[5] = 60; arr[6] = 70; arr[7] = 80;

    printf("Dynamic Heap Array: ");
    for (int i = 0; i < new_n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");

    // 4. Clean up memory
    free(arr);
    arr = NULL; // Prevent dangling pointer

    return 0;
}
\`\`\`

## Expected Output
\`\`\`text
Dynamic Heap Array: 10 20 30 40 50 60 70 80 
\`\`\`

## Common Mistakes & Pro Tips
> [!CAUTION]
> 1. **Memory Leak**: Allocating heap memory and losing the pointer without calling \`free()\` causes memory to remain occupied until process exit.
> 2. **Dangling Pointer**: Continuing to use a pointer after \`free(p)\`. Always set \`p = NULL;\` immediately after freeing!`,codeExamples:[{id:`code-m9-1`,title:`Safe Memory Allocation Wrapper`,language:`c`,code:`#include <stdio.h>
#include <stdlib.h>

void* safe_malloc(size_t bytes) {
    void *p = malloc(bytes);
    if (!p) {
        fprintf(stderr, "FATAL: Out of memory\\n");
        exit(EXIT_FAILURE);
    }
    return p;
}

int main(void) {
    double *prices = safe_malloc(10 * sizeof(double));
    prices[0] = 99.95;
    printf("First price: $%.2f\\n", prices[0]);
    free(prices);
    return 0;
}`,explanation:`Defines an infallible memory allocator pattern for robust system tools.`}],keyPoints:[`Heap memory persists until explicitly freed with free().`,`Always check if malloc/calloc returned NULL before dereferencing.`,`Set freed pointers to NULL to prevent use-after-free bugs.`],practiceQuestions:[{id:`pq-m9-1`,question:`What is the primary difference between malloc() and calloc()?`,answer:`malloc() allocates raw uninitialized memory containing garbage data, while calloc() initializes all allocated bytes to zero.`,explanation:`calloc takes two arguments (count and size) and clears all allocated memory to 0.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m9-1`,title:`C Dynamic Memory Management`,url:`https://en.cppreference.com/w/c/memory`,description:`Official ISO C reference for stdlib memory allocation functions.`}]}]}]}],r=[{id:`c-mod-10`,title:`Module 10: File Handling & Stream I/O`,description:`Master persistent file operations: FILE streams, fopen, fclose, text modes ("r", "w", "a"), binary modes ("rb", "wb"), fprintf, fscanf, fgets, and fseek.`,duration:`4 Hours`,topics:[{id:`c-topic-10-1-file-basics`,title:`Topic 1: File Streams & Text File Operations`,description:`Understand file pointers, access modes, error handling, formatted text reading and writing.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-10-1-file-streams`,title:`Unit 1: File Operations with fopen, fprintf & fgets`,description:`Master opening file streams, writing structured records, appending data, and closing streams cleanly.`,duration:`30 mins`,type:`Reading`,learningObjectives:[`Understand the FILE structure pointer.`,`Open files in "w" (write), "r" (read), and "a" (append) modes.`,`Read lines safely with fgets() and write with fprintf().`,`Always close files with fclose() to flush write buffers.`],readingContent:`# File Handling in C

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
> Forgetting to call \`fclose(fp)\` can result in data loss because the operating system buffers written bytes in RAM before flushing them to physical disk sectors!`,codeExamples:[{id:`code-m10-1`,title:`File Append Example`,language:`c`,code:`#include <stdio.h>

int main(void) {
    FILE *fp = fopen("log.txt", "a");
    if (fp) {
        fprintf(fp, "[INFO] System initialized successfully.\\n");
        fclose(fp);
    }
    return 0;
}`,explanation:`Demonstrates appending log messages to a persistent file.`}],keyPoints:[`fopen() returns NULL if a file cannot be opened or does not exist in read mode.`,`Mode "w" truncates/overwrites existing files; mode "a" appends to the end.`,`fclose() flushes internal write buffers and releases OS file descriptors.`],practiceQuestions:[{id:`pq-m10-1`,question:`What happens if you open a non-existent file in "r" (read) mode?`,answer:`fopen() fails and returns NULL.`,explanation:`Read mode requires the file to exist already on disk; it does not automatically create new files.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m10-1`,title:`C File I/O Reference`,url:`https://en.cppreference.com/w/c/io`,description:`Official standard library file stream input and output functions.`}]}]}]},{id:`c-mod-11`,title:`Module 11: Preprocessor & Advanced C`,description:`Learn preprocessor directives (#include, #define, #ifdef), macro functions, header guards, storage classes (static, extern), and command-line arguments (argc, argv).`,duration:`3.5 Hours`,topics:[{id:`c-topic-11-1-preprocessor`,title:`Topic 1: Preprocessor, Macros & Storage Classes`,description:`Understand macro text substitution, conditional compilation, header guards, static vs extern, and CLI arguments.`,estimatedDuration:`60 mins`,learningUnits:[{id:`c-unit-11-1-macros-and-cli`,title:`Unit 1: Macros, Header Guards & Command Line Arguments`,description:`Master parameter macros, conditional compilation guards, storage class specifiers, and int main(int argc, char *argv[]).`,duration:`30 mins`,type:`Reading`,learningObjectives:[`Write parameterized macros and avoid precedence traps.`,`Use #ifndef / #define header include guards.`,`Process command-line arguments with argc and argv.`],readingContent:`# Preprocessor & Advanced C

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
> Without parentheses in \`#define SQUARE(x) x * x\`, calling \`SQUARE(5 + 1)\` expands to \`5 + 1 * 5 + 1\` = \`11\` instead of \`36\`! Always wrap macro parameters in parentheses.`,codeExamples:[{id:`code-m11-1`,title:`Standard Header Include Guard Pattern`,language:`c`,code:`// my_header.h
#ifndef MY_HEADER_H
#define MY_HEADER_H

void compute(int x);

#endif // MY_HEADER_H`,explanation:`Prevents multiple inclusion compilation errors across header hierarchies.`}],keyPoints:[`#define performs textual substitution before compilation.`,`Include guards prevent duplicate header definitions.`,`argc is argument count; argv is an array of null-terminated string pointers.`],practiceQuestions:[{id:`pq-m11-1`,question:`What is argv[0] in a standard C command-line program?`,answer:`A string containing the path or name of the executing program binary itself.`,explanation:`By standard convention, the zeroth argument passed to main() is the executable invocation string.`,difficulty:`Easy`}],resourceLinks:[{id:`res-m11-1`,title:`GNU C Preprocessor Manual`,url:`https://gcc.gnu.org/onlinedocs/cpp/`,description:`Official manual on macro expansion, token pasting, and directives.`}]}]}]},{id:`c-mod-12`,title:`Module 12: Data Structures with C`,description:`Implement fundamental computer science data structures in pure C: Singly Linked Lists, Stacks (LIFO), Queues (FIFO), Linear Search, Binary Search, Bubble Sort, and Insertion Sort.`,duration:`4.5 Hours`,topics:[{id:`c-topic-12-1-linear-ds`,title:`Topic 1: Linked Lists, Stacks & Queues`,description:`Understand dynamic node pointers, linked list traversal/insertion, stack push/pop, and queue enqueue/dequeue.`,estimatedDuration:`75 mins`,learningUnits:[{id:`c-unit-12-1-linked-lists-stacks`,title:`Unit 1: Singly Linked Lists & Stacks in C`,description:`Implement self-referential struct nodes, dynamic node allocation with malloc, list traversal, and LIFO Stack buffers.`,duration:`35 mins`,type:`Reading`,learningObjectives:[`Construct self-referential struct Node types.`,`Insert and delete nodes in a singly linked list.`,`Implement a LIFO Stack using pure C pointer links.`],readingContent:`# Singly Linked Lists in C

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
> When freeing a linked list, never call \`free(curr)\` before updating \`curr = curr->next\`. Once freed, accessing \`curr->next\` is an illegal memory read!`,codeExamples:[{id:`code-m12-1`,title:`Binary Search Algorithm Implementation`,language:`c`,code:`#include <stdio.h>

int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // Not found
}

int main(void) {
    int sorted[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int idx = binarySearch(sorted, 10, 23);
    printf("Target 23 found at index: %d\\n", idx);
    return 0;
}`,explanation:`O(log n) binary search on sorted array.`}],keyPoints:[`Linked list nodes connect dynamically via heap pointers.`,`Inserting at head is O(1) time complexity.`,`Binary search provides logarithmic O(log n) lookup on sorted arrays.`],practiceQuestions:[{id:`pq-m12-1`,question:`What is the time complexity of searching an element in an unsorted linked list vs a sorted array with binary search?`,answer:`Linked List search is O(n) linear time; Binary search on a sorted array is O(log n) logarithmic time.`,explanation:`Linked lists lack random access, requiring sequential traversal.`,difficulty:`Medium`}],resourceLinks:[{id:`res-m12-1`,title:`Data Structures Reference (NIST)`,url:`https://en.wikipedia.org/wiki/Linked_list`,description:`Detailed analysis of pointer-based linked data structures.`}]}]}]},{id:`c-mod-13`,title:`Module 13: Practical Projects & Capstone`,description:`Build complete, production-grade real-world C projects from scratch: Command-Line Calculator, Student Grade Evaluator, Number Guessing Game, Banking Account System, Contact Directory, Student Record System, and File-Based Notes App.`,duration:`6 Hours`,topics:[{id:`c-topic-13-1-capstone-projects`,title:`Topic 1: Real-World C Capstone Applications`,description:`Complete hands-on projects with problem statements, requirements, architecture, and full working code.`,estimatedDuration:`120 mins`,learningUnits:[{id:`c-unit-13-1-calculator`,title:`Project 1: Command-Line Scientific Calculator`,description:`Build a menu-driven arithmetic and power calculation engine with input validation and loop control.`,duration:`30 mins`,type:`Reading`,learningObjectives:[`Implement modular functions for arithmetic operations.`,`Handle divide-by-zero validation.`,`Create an interactive CLI loop.`],readingContent:`# Project 1: Command-Line Scientific Calculator

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
\`\`\``,codeExamples:[{id:`code-proj-1`,title:`Calculator Program`,language:`c`,code:`// Compile with math library:
// gcc -Wall calculator.c -o calculator -lm`,explanation:`Build instruction noting the -lm flag required for pow().`}],keyPoints:[`Menu loops using while(1) create interactive CLI utilities.`,`Always validate denominator values before division.`,`Link math library with -lm when using math.h functions.`],practiceQuestions:[{id:`pq-proj-1`,question:`Why is the -lm flag required when compiling C programs that use math.h functions like pow() on GCC?`,answer:`Because libm (standard math runtime library) is not linked by default and must be explicitly specified to the linker.`,explanation:`-l flag instructs the linker to include libm.so / libm.a.`,difficulty:`Easy`}],resourceLinks:[{id:`res-proj-1`,title:`C Math Library Reference`,url:`https://en.cppreference.com/w/c/numeric/math`,description:`Documentation on math.h functions and precision limits.`}]},{id:`c-unit-13-2-student-records`,title:`Project 2: Student Record & File Management System`,description:`Build a full CRUD student record database using structs, dynamic arrays, and persistent file saving.`,duration:`35 mins`,type:`Reading`,learningObjectives:[`Design a persistent struct-based database.`,`Implement Add, Display, Search, and Save to disk operations.`,`Manage data persistence using text files.`],readingContent:`# Project 2: Student Record & File Management System

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
\`\`\``,codeExamples:[{id:`code-proj-2`,title:`Student Record Management System`,language:`c`,code:`// Build with gcc:
gcc -Wall student_system.c -o student_system`,explanation:`Compilation and execution instructions for the Student Database project.`}],keyPoints:[`Combines structs, arrays, loops, I/O formatting, and persistent disk files.`,`fscanf formatting with %49[^,] safely reads comma-separated text values.`,`Data persists across program restarts.`],practiceQuestions:[{id:`pq-proj-2`,question:`What is the purpose of s.name[strcspn(s.name, "\\n")] = 0; after calling fgets()?`,answer:`It removes the trailing newline character (\\n) that fgets() captures when the user presses Enter, replacing it with a null terminator (\\0).`,explanation:`strcspn finds the index of the newline character so it can be cleanly stripped.`,difficulty:`Medium`}],resourceLinks:[{id:`res-proj-2`,title:`C Structured File Storage Patterns`,url:`https://en.wikipedia.org/wiki/Comma-separated_values`,description:`Best practices for serialization and parsing structured CSV data in C.`}]}]}]}],i=(e,t,n,r,i,a)=>({id:e,title:t,description:n,duration:r,type:i,readingContent:a,practiceLabChallenge:void 0,resources:[{id:`res-${e}-pdf-notes`,name:`C Programming Complete Notes.pdf`,description:`The authoritative C language course textbook reference PDF.`,category:`PDF`,fileSize:`2.6 MB`,downloadPermission:!0,url:`/c-programming-complete-notes.pdf`}]}),a={1:`
### Module 1: Introduction to C Programming

#### 1.1 Learning Objectives
After completing this module, you will be able to:
- Understand what C programming is.
- Learn the history and importance of C.
- Understand the features of C.
- Identify applications of C.
- Understand the basic structure of a C program.
- Understand how a C program is compiled and executed.
- Write and execute your first C program.
- Understand tokens and comments.
- Use basic C programming terminology.
#### 1.2 What is C?


C is a general-purpose, procedural programming language developed for system
programming and application development. C provides low-level memory access while also supporting structured programming concepts. It is known for being:
- Fast
- Efficient
- Portable
- Structured
- Flexible
- Close to hardware
C is also considered a foundational programming language because many modern
languages and systems are influenced by its design.
#### 1.3 History of C
C was developed by Dennis Ritchie at Bell Labs in the early 1970s.
It evolved from earlier programming languages such as: \`\`\`text
┌─────────────┐
│    BCPL     │
└─────────────┘
       │
       ▼
┌─────────────┐
│      B      │
└─────────────┘
       │
       ▼
┌─────────────┐
│      C      │
└─────────────┘
\`\`\` C became especially important because it was used extensively in the development of the UNIX operating system .
#### 1.4 Why Learn C?
Learning C provides a strong understanding of fundamental programming concepts.
It helps you understand:
- Variables
- Data types
- Memory


- Pointers
- Functions
- Arrays
- Structures
- Algorithms
- Operating-system concepts
C is particularly valuable for understanding how programs interact with computer
memory and hardware .
#### 1.5 Features of C
- **1. Procedural**: C follows a procedural programming approach where programs are organized into functions and sequences of operations.
- **2. Fast**: C programs can execute efficiently because C provides relatively low-level control over system resources.
- **3. Portable**: C programs can generally be compiled for different platforms with appropriate modifications and compiler support.
- **4. Structured**: Programs can be divided into smaller functions and logical blocks.
- **5. Low-Level Access**: C provides features such as pointers that allow programmers to work directly with memory addresses.
- **6. Extensible**: Program functionality can be extended through functions, libraries, and reusable modules.
#### 1.6 Applications of C


C is used in many areas of computing:
- **Operating Systems**: Parts of operating systems and system software are commonly implemented in C.
- **Embedded Systems**: C is widely used in:
  - Microcontrollers
  - Automotive systems
  - IoT devices
  - Industrial controllers
- **Compilers**: C has been used to implement many compilers and language tools.
- **Networking**: C is used in network software and performance-sensitive applications.
- **Database Systems**: C is used in the implementation of several database systems and database components.
- **Game Development**: C and C-based technologies are used in performance-critical game and graphics systems.
#### 1.7 C Program Development Process
A C program normally goes through several stages: \`\`\`text
┌─────────────────┐
│   Source Code   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Preprocessing  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Compilation   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Assembly     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     Linking     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Executable File │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Execution    │
└─────────────────┘
\`\`\` Let's understand each stage. Step 1: Source Code The programmer writes C code in a source file. Example:
\`\`\`c
#include <stdio.h>


int main() {
    printf("Hello World");
    return 0;
}
\`\`\`
The file is usually saved with: program.c Step 2: Preprocessing The preprocessor handles directives such as:
\`\`\`c
#include <stdio.h>
\`\`\`
It processes preprocessor instructions before compilation. Step 3: Compilation The compiler translates C source code into lower-level code and checks the program for errors. Step 4: Assembly The resulting lower-level representation is converted into machine-oriented instructions.


Step 5: Linking The linker combines the required object code and libraries to create the final executable. Step 6: Execution The operating system loads the executable, and the processor executes the program.
#### 1.8 C Program Execution Flowchart

![C Compilation Process](/assets/images/c_compilation_process.png)


\`\`\`text
┌─────────────────┐
│      START      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Write C Program │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Save as .c    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Preprocessing  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Compilation   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Assembly     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     Linking     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Executable File │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Execution    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│       END       │
└─────────────────┘
\`\`\`
Easy Understanding Think of it like this: You write → C processes → compiler translates → linker creates executable → computer runs it.


#### 1.9 Your First C Program
Let's write the traditional first C program.
\`\`\`c
#include <stdio.h>


int main() {
    printf("Hello, World!");
    return 0;
}
\`\`\`

**Output:**

Hello, World!
#### 1.10 Understanding the Program
Let's break it down.
\`\`\`c
#include <stdio.h>
#include <stdio.h>
\`\`\`
This includes the Standard Input/Output library header. It provides declarations for functions such as:
printf() scanf()
\`\`\`c
int main() 
int main()
\`\`\`
main() is the function where program execution begins in a hosted C program.
int indicates that the function returns an integer value.
Opening Brace { Marks the beginning of the function body.


\`\`\`c
printf() printf("Hello, World!");
\`\`\`
Displays text on the standard output.
return 0; return 0;
Returns the value 0 from main, conventionally indicating successful termination.
Closing Brace } Marks the end of the function body.
#### 1.11 Basic Structure of a C Program
A typical C program can contain: \`\`\`text
┌───────────────────────────┐
│ Documentation / Comments  │
└───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│  Preprocessor Directives  │
└───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│    Global Declarations    │
└───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│      main() Function      │
└───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│    Local Declarations     │
└───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│        Statements         │
└───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│  User-Defined Functions   │
└───────────────────────────┘
\`\`\` Example:
\`\`\`c
#include <stdio.h>

int add(int a, int b);
\`\`\`


\`\`\`c
int main() {
    int result;
    result = add(10, 20);
    printf("%d", result);
    return 0;
}
int add(int a, int b) {
    return a + b;
}
\`\`\`
#### 1.12 C Statements
A statement is an instruction that performs an operation. Example:
\`\`\`c
printf("Hello");
\`\`\`
Another example: x = 10; Most C statements end with a semicolon: ; Example:
int x = 10;
#### 1.13 Semicolon in C
The semicolon marks the end of many C statements. 

**Example:**
\`\`\`c
int age = 20;
printf("%d", age);
\`\`\`

**Incorrect:**
\`\`\`c
int age = 20
\`\`\`

**Correct:**
\`\`\`c
int age = 20;
\`\`\`

#### 1.14 Comments in C
Comments are ignored by the compiler and are used to explain code. Comments improve code readability and maintainability.

**Single-Line Comment:**
\`\`\`c
// This is a comment
\`\`\`
**Example:**
\`\`\`c
// Print the student's age
printf("%d", age);
\`\`\`

**Multi-Line Comment:**
\`\`\`c
/* This is a 
   multi-line comment */
\`\`\`

#### 1.15 C Tokens
A token is the smallest meaningful element recognized by the C compiler. 

Major categories include:
- **Keywords**: Reserved words (e.g., \`int\`, \`return\`)
- **Identifiers**: User-defined names (e.g., \`age\`, \`main\`)
- **Constants**: Fixed values (e.g., \`10\`, \`3.14\`)
- **String Literals**: Sequences of characters (e.g., \`"Hello"\`)
- **Operators**: Symbols for operations (e.g., \`+\`, \`-\`)
- **Punctuators**: Syntactic elements (e.g., \`;\`, \`,\`)

> [!NOTE]
> We will study each category in detail in later modules.

#### 1.16 Keywords
Keywords are reserved words that have predefined meanings in C.

**Examples:**
\`\`\`c
int char float if else for while return struct void
\`\`\`

You cannot normally use a keyword as an identifier. 
**Incorrect:**
\`\`\`c
int return;
\`\`\`

#### 1.17 Identifiers
Identifiers are names given to programming elements such as:
- Variables
- Functions
- Arrays
- Structures

**Example:**
\`\`\`c
int age;
\`\`\`
Here:
- \`int\` → keyword
- \`age\` → identifier


int → keyword age → identifier
**Identifier Rules**: An identifier:
- Can contain letters.
- Can contain digits.
- Can contain underscore \`_\`.
- Cannot start with a digit.
- Cannot be a keyword.
- Is case-sensitive.
Valid: age student_name marks1 _total Invalid: 1student student-name float
#### 1.18 Case Sensitivity
C is case-sensitive . These are different identifiers: \`age\`, \`Age\`, \`AGE\` Similarly:
printf()
is different from: Printf()

**Valid:** \`age\`, \`student_name\`, \`marks1\`, \`_total\`
**Invalid:** \`1student\`, \`student-name\`, \`float\`

#### 1.18 Case Sensitivity
C is case-sensitive. These are different identifiers:
\`age\`, \`Age\`, \`AGE\`

Similarly:
\`printf()\` is different from \`Printf()\`

#### 1.19 Standard Input and Output
C provides standard functions for input and output.
- **Output:** \`printf()\`
- **Input:** \`scanf()\`

**Example:**
\`\`\`c
#include <stdio.h>


int main() {
    int age;
    scanf("%d", &age);
    printf("Age = %d", age);
    return 0;
}
\`\`\`
We will study scanf() and format specifiers in detail in a later module.
#### 1.20 Basic C Program Flowchart
Consider:
\`\`\`c
#include <stdio.h>


int main() {
    printf("Welcome to C Programming");
    return 0;
}
\`\`\`
Flowchart:
\`\`\`text
┌─────────┐
│  START  │
└────┬────┘
     │
     ▼
┌───────────────────┐
│  Execute main()   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   Print Welcome   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│     return 0      │
└────────┬──────────┘
         │
         ▼
┌─────────┐
│   END   │
└─────────┘
\`\`\`
Flow Explanation
1. Program starts.
2. Execution enters main().
3. printf() displays the message.
4. return 0 terminates main.
5. Program ends.
#### 1.21 C Program Example
Program: Add Two Numbers
\`\`\`c
#include <stdio.h>
int main() {
    int a = 10;
    int b = 20;
    int sum;
    sum = a + b;
    printf("Sum = %d", sum);
    return 0;
}
\`\`\`

Output:
\`\`\`text
Sum = 30
\`\`\`

Output: Sum = 30 Flowchart \`\`\`text
┌─────────────┐
│    START    │
└─────────────┘
       │
       ▼
┌─────────────┐
│ Read a = 10 │
└─────────────┘
       │
       ▼
┌─────────────┐
│ Read b = 20 │
└─────────────┘
       │
       ▼
┌─────────────┐
│ sum = a + b │
└─────────────┘
       │
       ▼
┌─────────────┐
│  Print sum  │
└─────────────┘
       │
       ▼
┌─────────────┐
│     END     │
└─────────────┘
\`\`\`
#### 1.22 C Compilation Flow
For a source file named: program.c The conceptual process is: \`\`\`text
┌───────────────┐
│   program.c   │
└───────────────┘
        │
        ▼
┌───────────────┐
│ Preprocessor  │
└───────────────┘
        │
        ▼
┌───────────────┐
│   Compiler    │
└───────────────┘
        │
        ▼
┌───────────────┐
│   Assembler   │
└───────────────┘
        │
        ▼
┌───────────────┐
│  Object File  │
└───────────────┘
        │
        ▼
┌───────────────┐
│    Linker     │
└───────────────┘
        │
        ▼
┌───────────────┐
│  Executable   │
└───────────────┘
\`\`\` The exact intermediate files and implementation details can vary by compiler and platform.
#### 1.23 Advantages of C


- High performance.
- Efficient memory usage.
- Portable.
- Structured programming.
- Large ecosystem of libraries and tools.
- Suitable for system-level programming.
- Provides direct memory manipulation through pointers.
#### 1.24 Limitations of C
- Manual memory management.
- No built-in object-oriented programming model.
- No automatic bounds checking for arrays.
- Pointer-related errors can be difficult to debug.
- Requires careful memory and resource management.
#### 1.25 C vs Other Languages
Feature C Python Java Type System Static Dynamic Static Execution Compiled Typically interpreted/bytecode-based Compiled to bytecode Memory Control High Mostly automatic Mostly automatic Pointers Yes No traditional pointer syntax No explicit pointer arithmetic Performance High Generally lower High OOP Not built-in Supported Core paradigm
#### 1.26 Common Beginner Errors
Error 1: Missing Semicolon


\`\`\`c
printf("Hello")
\`\`\`
Correct:
\`\`\`c
printf("Hello");
\`\`\`
Error 2: Incorrect main main()
For modern standard C, prefer:
\`\`\`c
int main(void)
\`\`\`
or:
\`\`\`c
int main()
\`\`\`
Error 3: Incorrect Header #include stdio.h
Correct:
\`\`\`c
#include <stdio.h>
\`\`\`
Error 4: Incorrect Function Name Printf("Hello");
Correct:
\`\`\`c
printf("Hello");
\`\`\`
C is case-sensitive.
#### 1.27 Best Practices
- Use meaningful names.
int studentAge;
instead of:
int x;


when the meaning is specifically a student's age.
- Use indentation.
\`\`\`c
int main() {
    printf("Hello");
    return 0;
}
\`\`\`
- Add comments where they improve understanding.
- Keep functions focused on clear responsibilities.
- Compile frequently while developing.
#### 1.28 Interview Questions
- **Q1. Who developed C?**
  **Answer**: C was developed by Dennis Ritchie at Bell Labs in the early 1970s.
- **Q2. Why is C called a middle-level language?**
  **Answer**: C combines high-level programming constructs with low-level capabilities such as direct memory manipulation, so it is often described as a middle-level language.
- **Q3. What is the purpose of main()?**
  **Answer**: main() is the entry point for execution in a hosted C program.
- **Q4. What is stdio.h?**
  **Answer**: stdio.h is a standard C header that declares functions and types used for standard input and output, including
- **Q5. Why is C case-sensitive?**
  **Answer**: C treats uppercase and lowercase letters as different characters, so identifiers such as \`age\`, \`Age\`, and \`AGE\` are distinct.
- **Q6. What is a compiler?**
  **Answer**: A compiler translates source code written in a programming language into a lower-level representation that can ultimately be executed by a computer.

#### 1.29 Practical Lab
- **Task 1**: Write a C program to print: \`Hello, C Programming!\`
- **Task 2**: Write a program to print your:
  - Name
  - College
  - Branch
- **Task 3**: Write a program to add two numbers.
- **Task 4**: Write a program to calculate the area of a rectangle.
- **Task 5**: Draw the flowchart for a program that calculates the sum of two numbers.
`,2:`
### Module 2: Variables, Constants & Data Types

#### 2.1 Learning Objectives
After completing this module, you will be able to:
- Understand variables and constants.
- Learn C's fundamental data types.
- Understand declaration and initialization.
- Understand memory representation at a basic level.
- Learn format specifiers.
- Understand type conversion and casting.
- Identify signed and unsigned integer types.
- Write programs using different data types.

#### 2.2 What is a Variable?
A variable is a named storage location used to hold a value that can change during program execution.

Example: \`int age = 20;\`

Here:
- \`int\` → Data type
- \`age\` → Variable name
- \`20\` → Initial value

Conceptually:
\`\`\`text
  Variable
     │
     ▼
 ┌─────────┐
 │   20    │  <-- age
 └─────────┘
\`\`\`
If later we write: \`age = 21;\` the stored value changes.


#### 2.3 Why Do We Need Variables?
Variables allow programs to store and manipulate information.
For example:
int marks = 85;
The program can later calculate: marks + 5 Variables are commonly used to store:
- Age
- Marks
- Salary
- Temperature
- Counters
- Calculated results
- User input
#### 2.4 Variable Declaration
Declaration tells the compiler the variable's type and name .
Syntax data_type variable_name; Example:
int age; float salary; char grade;
#### 2.5 Variable Initialization
Initialization means assigning an initial value when declaring a variable.
int age = 20; float percentage = 85.5; char grade = 'A';


Conceptually: Declaration
   ↓
Initialization
   ↓
Variable Ready
#### 2.6 Declaration vs Initialization
Declaration Initialization Specifies type and name Assigns initial value
int age; int age = 20;
Does not necessarily assign a useful initial value Gives an initial value Example:
int age; // Declaration age = 20; // Assignment
versus:
int age = 20; // Declaration + initialization
#### 2.7 Rules for Naming Variables
Variable names must follow C's identifier rules. Valid int age; int student_age; int marks1; int _count; Invalid int 1age; int student-age; int student age; int float;


Important Rules
- Cannot start with a digit.
- Can contain letters, digits, and _.
- Cannot contain spaces.
- Cannot be a keyword.
- C is case-sensitive.
#### 2.8 Data Types
A data type specifies what kind of value a variable can represent and helps determine how the value is stored and interpreted. C provides several fundamental types. 

\`\`\`text
                      DATA TYPES HIERARCHY
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
   INTEGER               FLOATING-POINT            CHARACTER 
 (Whole numbers)       (Decimal numbers)         (Text & symbols)
       │                       │                       │
       ▼                       ▼                       ▼
 ┌───────────┐           ┌───────────┐           ┌───────────┐
 │   int     │           │   float   │           │   char    │
 │  short    │           │  double   │           └───────────┘
 │  long     │           └───────────┘
 └───────────┘
\`\`\`

Common fundamental types include:
- char
- int
- float
- double
- void

C also provides derived and user-defined types, which we will study later.

#### 2.9 Integer Data Type
\`int\` is used to represent integer values.

Example:
\`\`\`c
int age = 20;
int marks = 95; 
int count = 100;
\`\`\`
Integer values do not contain a fractional part. (e.g., \`10\`, \`25\`, \`-50\`, \`0\`)

#### 2.10 Character Data Type
\`char\` is used to store a character.

Example:
\`\`\`c
char grade = 'A';
\`\`\`
Character constants use single quotes. 

Correct:
\`\`\`c
char grade = 'A';
\`\`\`

Incorrect:
\`\`\`c
char grade = "A";
\`\`\`
\`"A"\` is a string literal, not a character constant.

#### 2.11 Floating-Point Data Types
Floating-point types represent numbers that can contain a fractional part.

- \`float\`: \`float temperature = 36.5f;\`
- \`double\`: \`double salary = 45678.75;\`

\`double\` generally provides greater precision than \`float\`.

#### 2.12 void
\`void\` represents the absence of a value or type. It is commonly used with functions. 

Example: 
\`\`\`c
void display() { 
    printf("Hello"); 
} 
\`\`\`
Here, \`void\` indicates that the function does not return a value.
#### 2.13 Fundamental Data Types
Data Type Typical Purpose Example
char Character data 'A'
int Integer values 100
float Single-precision floating point 10.5f
double Double-precision floating point 10.5
void No value/type void display() Note: The exact size and range of C types are implementation-dependent. Use sizeof and standard limits when you need exact information for a particular environment.
#### 2.14 sizeof Operator
The sizeof operator determines the size, in bytes, of a type or object.


Example:
\`\`\`c
#include <stdio.h>


int main() {
    printf("%zu
", sizeof(int));
    printf("%zu
", sizeof(float));
    printf("%zu
", sizeof(double));
    printf("%zu
", sizeof(char));
    return 0;
}
\`\`\`
The exact values depend on the compiler and platform.
#### 2.15 Signed and Unsigned Types
Integer types can have signed or unsigned forms. Signed Can represent negative and non-negative values. signed int temperature = -10; Unsigned Represents only non-negative values. unsigned int count = 100; Example: signed int
   ↓
negative ← 0 → positive unsigned int
   ↓
0 → positive
#### 2.16 Short and Long Integer Types


C provides integer type modifiers such as: short int long int long long int Examples: short int a; long int b; long long int c; Their exact ranges depend on the implementation.
#### 2.17 Constants
A constant is a value that does not change during program execution.
Examples: 10 25.5 'A' "Hello"
#### 2.18 Integer Constants
Examples: 10 100 -25 0 Example:
int age = 20;
Here 20 is an integer constant.


#### 2.19 Floating-Point Constants
Examples:
#### 10.5 3.14 -25.75
Example:
float pi = 3.14f;
#### 2.20 Character Constants
Character constants are enclosed in single quotes. 'A' 'B' '7' '#' Example:
char symbol = '#';
#### 2.21 String Literals
A string literal is a sequence of characters enclosed in double quotes.
"Hello" "Welcome to C" "Prasanna" Example:
printf("Welcome to C");
Strings are stored as arrays of characters and are covered in detail in the Strings module .
#### 2.22 Using const


The const qualifier can be used when an object should not be modified through that
identifier after initialization. Example: const int MAX = 100; Attempting to modify it: MAX = 200; is not allowed. Example #include <stdio.h> int main() { const float PI = 3.14159f; printf("%f", PI); return 0; }
#### 2.23 Variable Declaration Flowchart
\`\`\`text
                  ┌────────────────────┐
                  │       START        │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Choose Data Type  │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Choose Variable   │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Declare Variable  │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ Initialize Value?  │
                  └──────┬──────────┬──┘
                         │          │
                     YES │          │ NO
                         ▼          ▼
             ┌───────────────┐      │
             │Assign Initial │      │
             │     Value     │      │
             └───────┬───────┘      │
                     │              │
                     └──────┬───────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │   Variable Ready   │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │      Continue      │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │        END         │
                  └────────────────────┘
\`\`\`


#### 2.24 Memory Concept

![C Variables & Memory](/assets/images/c_variables_memory.png)


When a variable is created, the implementation allocates storage for its object.

For example:
\`\`\`c
int age = 20;
\`\`\`

Conceptually: 
\`\`\`text
 ┌────────────────────────────────────────────────────────┐
 │                   MAIN MEMORY (RAM)                    │
 ├────────────────────────────────────────────────────────┤
 │                                                        │
 │     Variable Name: age                                 │
 │     Memory Address: 0x7ffee9b                          │
 │                                                        │
 │     ┌────────────────────────────────────────────┐     │
 │     │                  20                        │     │
 │     └────────────────────────────────────────────┘     │
 │     (Stored in binary format: 00000000 00010100)       │
 │                                                        │
 └────────────────────────────────────────────────────────┘
\`\`\`
The exact memory representation depends on the type and implementation. Later, pointers will allow us to examine addresses and manipulate objects more directly.

#### 2.25 Format Specifiers
Format specifiers tell formatted I/O functions how to interpret or display values.

Common examples: 

| Data Type | Format Specifier | Description | Example Input/Output |
|-----------|------------------|-------------|----------------------|
| \`int\` | \`%d\` or \`%i\` | Signed Decimal Integer | \`25\`, \`-10\` |
| \`unsigned int\` | \`%u\` | Unsigned Decimal Integer | \`25\`, \`100\` |
| \`float\` | \`%f\` | Floating-point Number | \`3.14159\` |
| \`double\` | \`%lf\` | Double precision floating-point | \`3.14159265\` |
| \`char\` | \`%c\` | Single Character | \`'A'\`, \`'z'\` |
| \`char[]\` (String) | \`%s\` | String of Characters | \`"Hello World"\` |
| \`void *\` (Pointer)| \`%p\` | Memory Address (Hexadecimal) | \`0x7ffee9b\` |

Example:


\`\`\`c
#include <stdio.h>


int main() {
    int age = 20;
    float percentage = 85.5f;
    char grade = 'A';
    printf("Age = %d
", age);
    printf("Percentage = %f
", percentage);
    printf("Grade = %c
", grade);
    return 0;
}
\`\`\`
#### 2.26 scanf() and Format Specifiers
scanf() is commonly used to read formatted input. Example:
int age; scanf("%d", &age);
For a floating-point variable:
float marks; scanf("%f", &marks);
For a character:
char grade; scanf(" %c", &grade);
For double:
double salary; scanf("%lf", &salary);
The & operator supplies the address of the object to scanf() for these ordinary scalar
inputs.


#### 2.27 Type Conversion
Type conversion occurs when a value is converted from one data type to another.

There are two major forms:
\`\`\`text
      Type Conversion
             │
       ┌─────┴─────┐
       ▼           ▼
   Implicit     Explicit
\`\`\`

#### 2.28 Implicit Type Conversion
The compiler performs the conversion automatically according to C's conversion rules.

Example:
\`\`\`c
int a = 10; 
double b; 
b = a;
\`\`\`
The integer value is converted to double. 

Conceptually:
\`\`\`text
   int
    │
    ▼
  double
\`\`\`

#### 2.29 Explicit Type Conversion
The programmer explicitly requests a conversion using a cast.

Syntax: \`(type) expression\`

Example:
\`\`\`c
int a = 10; 
int b = 3; 
float result = (float)a / b;
\`\`\`

**Output:**

#### 3.333333
Without the cast:
\`\`\`c
float result = a / b;
\`\`\`
the division is performed as integer division before the result is converted to \`float\`.

#### 2.30 Type Casting Flowchart

\`\`\`text
         START
           │
           ▼
      Input Value
           │
           ▼
  Check Required Type
           │
           ▼
  Conversion Needed?
        ↙     ↘
      YES       NO
      │         │
      ▼         ▼
   Perform    Continue
  Conversion    │
      │         │
      └────┬────┘
           ▼
       Use Result
           │
           ▼
          END
\`\`\`
#### 2.31 Example: Student Marks
\`\`\`c
#include <stdio.h>


int main() {
    int marks = 450;
    int subjects = 5;
\`\`\`


float average = (float)marks / subjects; printf("Average = %.2f", average); return 0; }
Output: Average = 90.00
\`\`\`text
Flowchart START
   ↓
marks = 450
   ↓
subjects = 5
   ↓
average = marks / subjects
   ↓
Print Average
   ↓
END
\`\`\`
#### 2.32 Multiple Variable Declaration
You can declare multiple variables of the same type in one declaration.
int a, b, c;
You can also initialize them:
int a = 10, b = 20, c = 30;
However, separate declarations may sometimes improve readability.
#### 2.33 Variable Scope Preview
The scope of a variable determines where it can be accessed. For example:


\`\`\`c
int main() {
    int age = 20;
    printf("%d", age);
    return 0;
}
\`\`\`
Here, age is a local variable whose scope is limited to the block in which it is declared.
Scope and storage duration will be studied in greater detail later.
#### 2.34 Common Errors
- **Error 1**: Using an Undeclared Variable
Incorrect: age = 20; Correct:
int age; age = 20;
- **Error 2**: Assigning a Character Incorrectly
Incorrect:
char grade = "A";
Correct:
char grade = 'A';
- **Error 3**: Confusing %d and %f
For an int:
int age = 20; printf("%d", age);


For a float:
float marks = 85.5f; printf("%f", marks);
- **Error 4**: Unexpected Integer Division int a = 5; int b = 2; float result = a / b;
The result is 2.0, not 2.5, because a / b is evaluated as integer division.
Use:
float result = (float)a / b;
#### 2.35 Best Practices
- Choose meaningful variable names.
int studentAge;
- Initialize variables when appropriate.
int count = 0;
- Use const for values that should not be modified.
const int MAX_STUDENTS = 100;
- Use the correct format specifier.
- Avoid unnecessary type conversions.
- Use parentheses when they make conversions or expressions clearer.
#### 2.36 Practical Programs
Program 1: Store and Display Student Information #include <stdio.h>


\`\`\`c
int main() {
    int age = 20;
    float percentage = 85.5f;
    char grade = 'A';
    printf("Age: %d
", age);
    printf("Percentage: %.2f
", percentage);
    printf("Grade: %c
", grade);
    return 0;
}
\`\`\`
Program 2: Calculate Area #include <stdio.h> int main() { float length = 10.5f; float width = 5.0f; float area = length * width; printf("Area = %.2f", area); return 0; }
#### 2.37 Interview Questions
- **Q1. What is a variable?**
  **Answer**: A variable is a named object used to store a value that can change during program
execution.
- **Q2. What is a constant?**
  **Answer**: A constant is a value that does not change as part of the program's intended computation.
- **Q3. What is the difference between float and double?**
  **Answer**: Both represent floating-point values, but double generally provides greater precision than float.
- **Q4. What is type casting?**
  **Answer**: Type casting is an explicit conversion of an expression to a specified type using the cast
syntax. Example: (float)a
- **Q5. What is sizeof?**
  **Answer**: sizeof is an operator that determines the size in bytes of a type or object.
- **Q6. What is the difference between char and a string?**
  **Answer**: char represents a single character, while a string is a sequence of characters stored in a
character array and terminated by a null character.#### 2.38 Practical Lab
- **Task 1**: Create variables to store:
- Student name
- Age
- Percentage
- Grade
Display all values.
- **Task 2**: Write a program to calculate the area of a circle.
- **Task 3**: Write a program to convert Celsius to Fahrenheit.
- **Task 4**: Write a program demonstrating integer-to-floating-point conversion.
- **Task 5**: Use \`sizeof\` to display the sizes of several fundamental types on your compiler.
- **Task 6**: Create a \`const\` variable for the maximum number of students and attempt to modify it. Observe the compiler diagnostic.
`,3:`
### Module 3: Operators & Expressions

#### 3.1 Learning Objectives
After completing this module, you will be able to:
- Understand operators and operands.
- Use arithmetic operators.
- Understand relational and equality operators.
- Use logical operators.
- Understand assignment operators.
- Use increment and decrement operators.
- Understand bitwise operators.
- Learn conditional and sizeof operators.
- Understand operator precedence and associativity.
- Evaluate C expressions correctly.
- Apply operators in practical programs.
#### 3.2 What is an Operator?
An operator is a symbol that tells the compiler to perform an operation on one or more
operands. Example:
int sum = a + b;
Here: + → Operator a → Operand


b → Operand So: Operand + Operand
   ↓
Result
#### 3.3 What is an Operand?
An operand is a value or expression on which an operator acts.
Example: a + b
- a → Operand
- + → Operator
- b → Operand
Another example: x * 10
- x → Operand
- * → Operator
- 10 → Operand
#### 3.4 Types of Operators in C

![C Operators](/assets/images/c_operators.png)


C provides several categories of operators: C OPERATORS │ ┌─────────────────┼──────────────────┐
   ↓
Arithmetic Relational Logical │ │ │ ├── + ├── < ├── && ├── - ├── > ├── || ├── * ├── <= └── ! ├── / ├── >=


└── % ├── == └── != ┌─────────────────┼──────────────────┐
   ↓
Assignment Increment/Decrement Bitwise │ │ │ ├── = ├── ++ ├── & ├── += └── -- ├── | ├── -= ├── ^ ├── *= ├── ~ ├── /= ├── << └── %= └── >> Other Operators │ ├── sizeof ├── conditional ?: └── comma ,
#### 3.5 Arithmetic Operators
Arithmetic operators perform mathematical calculations. Operator Meaning + Addition
- Subtraction
* Multiplication / Division % Remainder Addition int result = 10 + 20; Result: 30


Subtraction int result = 20 - 10; Result: 10 Multiplication int result = 10 * 5; Result: 50 Division int result = 20 / 5; Result: 4 Remember: when both operands are integers, / performs integer division.
int result = 5 / 2;
Result: 2 Modulus % The modulus operator gives the remainder.
int result = 10 % 3;
Result: 1 Example 10 ÷ 3 Quotient = 3


Remainder = 1
#### 3.6 Arithmetic Expression Flowchart
Example: result = a + b; Flowchart: \`\`\`text
┌─────────────────┐
│      START      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Read A and B   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ result = A + B  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Display Result  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│       END       │
└─────────────────┘
\`\`\`
#### 3.7 Relational Operators
Relational operators compare two values. Operator Meaning < Less than > Greater than <= Less than or equal >= Greater than or equal == Equal to != Not equal to The result of a comparison is an int value: 0 for false and 1 for true .


Example int a = 10; int b = 20; printf("%d", a < b); Output: 1 Because 10 < 20 is true. Example printf("%d", a > b); Output: 0 Because 10 > 20 is false.
#### 3.8 Important: = vs ==
This is one of the most common beginner mistakes. Assignment a = 10; Means: Store 10 in a. Equality Comparison a == 10 Means: Check whether a is equal to
10. Remember: = → Assignment


== → Equality comparison
#### 3.9 Relational Decision Flowchart
\`\`\`text
                  ┌────────────────────┐
                  │       START        │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │    Read A and B    │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │      A > B ?       │
                  └──────┬──────────┬──┘
                         │          │
                     YES │          │ NO
                         ▼          ▼
             ┌───────────────┐  ┌───────────────────────┐
             │  Print A is   │  │ Print B is Greater or │
             │    Greater    │  │         Equal         │
             └───────┬───────┘  └──────────┬────────────┘
                     │                     │
                     └──────────┬──────────┘
                                │
                                ▼
                  ┌────────────────────┐
                  │        END         │
                  └────────────────────┘
\`\`\`
#### 3.10 Logical Operators
Logical operators combine or modify conditions. Operator Name && Logical AND \` ! Logical NOT In C, logical operators produce 0 or 1.
#### 3.11 Logical AND &&
The result is true only when both operands are nonzero . A B A && B


False False False False True False True False False True True True Example:
int age = 20; int marks = 80; printf("%d", age >= 18 && marks >= 40);

**Output:**

1 Both conditions are true.
#### 3.12 Logical OR ||
The result is true if at least one operand is nonzero . A B A || B False False False False True True True False True True True True Example:
int age = 16;


printf("%d", age < 18 || age > 60);

**Output:**

1
#### 3.13 Logical NOT !
! reverses the logical value.
int x = 0; printf("%d", !x);

**Output:**

1 Because zero is false. Example:
int x = 10; printf("%d", !x);

**Output:**

0 Because a nonzero value is true.
#### 3.14 Logical Operator Flowchart
START
   ↓
Read Age & Marks
   ↓
Age >= 18 AND Marks >= 40? ↙ ↘ YES NO
   ↓
Eligible Not Eligible ↘ ↙


↓ END
#### 3.15 Assignment Operators
Assignment operators assign values to variables. Basic Assignment x = 10; Compound Assignment Operators Operator Example Equivalent = x = 5 Assign += x += 5 x = x + 5
-= x -= 5 x = x - 5
*= x *= 5 x = x * 5 /= x /= 5 x = x / 5 %= x %= 5 x = x % 5 Example int x = 10; x += 5; Now: x = 15


#### 3.16 Increment Operator ++
The increment operator increases a value by
1. x++; Equivalent to: x = x + 1; Example:
int x = 5; x++; printf("%d", x);

**Output:**

6
#### 3.17 Decrement Operator --
The decrement operator decreases a value by
1. x--; Equivalent to: x = x - 1; Example:
int x = 5; x--; printf("%d", x);

**Output:**

4


#### 3.18 Prefix vs Postfix
This is an important interview concept. Prefix Increment ++x; The increment occurs before the value is used in the surrounding expression. Example:
int x = 5; int y = ++x;
Result: x = 6 y = 6 Postfix Increment x++; The old value is used for the surrounding expression, then x is incremented. Example:
int x = 5; int y = x++;
Result: x = 6 y = 5
#### 3.19 Prefix vs Postfix Flowchart
x = 5
   ↓
┌─────┴─────┐
   ↓
++x x++
   ↓
Increment Use old value


first first
   ↓
New value Increment
   ↓
Use value New x
#### 3.20 Bitwise Operators
Bitwise operators work on the individual bits of integer operands.
Operator Meaning & Bitwise AND \` \` ^ Bitwise XOR ~ Bitwise NOT << Left Shift >> Right Shift
#### 3.21 Bitwise AND &
Example: 5 = 0101 3 = 0011 Perform AND: 0101 0011 ---- 0001 Result: 1


#### 3.22 Bitwise OR |
5 = 0101 3 = 0011 0101 0011 ---- 0111 Result: 7
#### 3.23 Bitwise XOR ^
XOR produces 1 when the corresponding bits are different. 5 = 0101 3 = 0011 0101 0011 ---- 0110 Result: 6
#### 3.24 Bitwise NOT ~
The ~ operator flips every bit of its operand. For signed integers, the resulting value depends on the integer representation used by the implementation; modern systems commonly use two's-complement representation. Example:
int x = 5; int result = ~x;


Do not memorize a universal decimal result without considering the type and
implementation.
#### 3.25 Left Shift <<
Left shift moves bits to the left. Example: 5 = 0101 5 << 1 Conceptually: 0101
   ↓
1010 For suitable nonnegative values, shifting left by one position corresponds to multiplying by 2, provided the result remains representable.
#### 3.26 Right Shift >>
Right shift moves bits to the right. Example: 8 = 1000 8 >> 1 Conceptually: 1000
   ↓
0100 For nonnegative values, this corresponds to integer division by 2 for each shift, with truncation.


For negative signed values, right-shift behavior is implementation-defined, so avoid
oversimplified assumptions.
#### 3.27 Bitwise Example
\`\`\`c
#include <stdio.h>


int main() {
    int a = 5;
    int b = 3;
    printf("AND = %d
", a & b);
    printf("OR = %d
", a | b);
    printf("XOR = %d
", a ^ b);
    return 0;
}
\`\`\`

**Output:**

AND = 1 OR = 7 XOR = 6
#### 3.28 Conditional Operator ?:
The conditional operator is the only ternary operator in standard C.
Syntax condition ? expression1 : expression2; Example:
int age = 20; const char *result = (age >= 18) ? "Eligible" : "Not Eligible";
If the condition is true: Eligible


Otherwise: Not Eligible
#### 3.29 Conditional Operator Flowchart
\`\`\`text
                  ┌────────────────────┐
                  │       START        │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Check Condition   │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Condition True?   │
                  └──────┬──────────┬──┘
                         │          │
                     YES │          │ NO
                         ▼          ▼
             ┌───────────────┐  ┌───────────────┐
             │ Expression 1  │  │ Expression 2  │
             └───────┬───────┘  └───────┬───────┘
                     │                     │
                     └──────────┬──────────┘
                                │
                                ▼
                  ┌────────────────────┐
                  │       Result       │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │        END         │
                  └────────────────────┘
\`\`\`
#### 3.30 sizeof Operator
sizeof determines the size in bytes of a type or object. Example:
\`\`\`c
#include <stdio.h>


int main() {
    int x;
    printf("%zu", sizeof(x));
    return 0;
}
\`\`\`
The exact size depends on the implementation. You can also use: sizeof(int)


sizeof(float) sizeof(double)
#### 3.31 Comma Operator
The comma operator evaluates its left operand and then its right operand; the result of the
overall expression is the value of the right operand. Example:
int x; x = (10, 20);
After execution: x = 20 Parentheses are important here because commas can also act as separators in declarations and function arguments.
#### 3.32 Operator Precedence
When an expression contains multiple operators, C uses precedence to determine which
operations bind more strongly. Example:
int result = 10 + 5 * 2;
Multiplication has higher precedence than addition. Therefore: 5 * 2 = 10 10 + 10 = 20 Result: 20


#### 3.33 Using Parentheses
Parentheses can make the intended order explicit.
int result = (10 + 5) * 2;
Now: 10 + 5 = 15 15 * 2 = 30 Result: 30 Best Practice When an expression could be confusing, use parentheses rather than relying on memory alone.
#### 3.34 Operator Precedence — Simplified
View From relatively high to lower precedence: Postfix
   ↓
Unary
   ↓
Multiplicative
   ↓
Additive
   ↓
Relational
   ↓
Equality
   ↓
Logical AND
   ↓
Logical OR
   ↓
Conditional


↓ Assignment This is a simplified learning view; the full C precedence table contains additional operators and details.
#### 3.35 Associativity
When operators have the same precedence, associativity determines the grouping
direction. For example, multiplication is left-associative: 20 / 5 * 2 is grouped as: (20 / 5) * 2 Result: 8 Assignment operators are right-associative: a = b = 10; is grouped as: a = (b = 10);
#### 3.36 Expression Evaluation Flowchart
START
   ↓
Read Expression
   ↓
Apply Precedence
   ↓
Apply Associativity
   ↓
Evaluate Operators
   ↓
Get Result


↓ END
#### 3.37 Example: Arithmetic Expression
int result = 10 + 20 * 3;
Step 1: 20 * 3 = 60 Step 2: 10 + 60 = 70 Final result: 70
#### 3.38 Example: Parentheses
int result = (10 + 20) * 3;
Step 1: 10 + 20 = 30 Step 2: 30 * 3 = 90 Final result: 90
#### 3.39 Short-Circuit Evaluation
Logical operators && and || use short-circuit evaluation. AND If the left operand of && evaluates to false, the right operand is not evaluated.


if (x != 0 && y / x > 2) { ... } If x != 0 is false, the division is not evaluated. OR If the left operand of || evaluates to true, the right operand is not evaluated. if (x == 0 || y / x > 2) { ... } This can be useful for writing safe conditional expressions.
#### 3.40 Practical Program: Even or Odd
\`\`\`c
#include <stdio.h>


int main() {
    int number;
    printf("Enter a number: ");
    scanf("%d", &number);
    if (number % 2 == 0) {
        printf("Even");
    }
    else {
        printf("Odd");
    }
    return 0;
}
\`\`\`
\`\`\`text
Flowchart START ↓


Read Number
   ↓
Number % 2 == 0? ↙ ↘ YES NO
   ↓
Print Even Print Odd ↘ ↙
   ↓
END
\`\`\`
#### 3.41 Practical Program: Largest of Two
Numbers
\`\`\`c
#include <stdio.h>


int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    if (a > b) {
        printf("%d is larger", a);
    }
    else if (b > a) {
        printf("%d is larger", b);
    }
    else {
        printf("Both are equal");
    }
    return 0;
}
\`\`\`
#### 3.42 Common Mistakes


Mistake 1: Using = instead of ==
Incorrect: if (age = 18) Correct: if (age == 18)
Mistake 2: Unexpected Integer Division int x = 5; int y = 2; float result = x / y;
Result:
#### 2.0
Use:
float result = (float)x / y;
to obtain:
#### 2.5
Mistake 3: Confusing & and && & → Bitwise AND && → Logical AND
Mistake 4: Confusing | and || | → Bitwise OR || → Logical OR
#### 3.43 Best Practices
- Use parentheses when expressions are complex.
- Don't rely on confusing operator combinations.


- Understand the difference between assignment and comparison.
- Use logical operators carefully.
- Be careful with signed bitwise operations.
- Avoid unnecessarily complicated expressions.
#### 3.44 Interview Questions
- **Q1. What is an operator?**
  **Answer**: An operator is a symbol that instructs the compiler to perform an operation on one or more
operands.
- **Q2. What is the difference between = and ==?**
  **Answer**: = performs assignment, while == tests equality.
- **Q3. What is the modulus operator?**
  **Answer**: % produces the remainder of integer division.
- **Q4. What is the difference between ++x and x++?**
  **Answer**: ++x increments before the value is used in the surrounding expression; x++ uses the old
value first and then increments.
- **Q5. What is operator precedence?**
  **Answer**: Operator precedence determines which operators bind more strongly when an expression
contains multiple operators.
- **Q6. What is short-circuit evaluation?**
  **Answer**: It is the behavior where && or || may skip evaluating the right operand when the result is
already determined by the left operand.
- **Q7. What are bitwise operators?**
  **Answer**: Bitwise operators manipulate the individual bits of integer operands.#### 3.45 Practical Lab
- **Task 1**: Write a program to perform addition, subtraction, multiplication, division, and modulus.
- **Task 2**: Write a program to check whether a number is positive, negative, or zero.
- **Task 3**: Write a program to find the largest of three numbers.
- **Task 4**: Write a program to check whether a student is eligible based on age and marks using &&.
- **Task 5**: Write a program demonstrating prefix and postfix increment.
- **Task 6**: Write a program demonstrating &, |, and ^.
- **Task 7**: Write a program using the conditional operator to find the larger of two numbers.
#### 3.46 Module Summary
In this module, you learned:
- Operators
- Operands
- Arithmetic operators
- Relational operators
- Equality operators
- Logical operators
- Assignment operators
- Increment and decrement
- Prefix and postfix


- Bitwise operators
- Conditional operator
- sizeof
- Comma operator
- Operator precedence
- Associativity
- Short-circuit evaluation
- Expressions
- Practical programs
- Common mistakes
- Best practices
- Interview questions
📌 Professional Diagrams for Your PDF Diagram 1 — Operator Classification OPERATORS │ ┌─────────────┼─────────────┐
   ↓
Arithmetic Relational Logical │ │ │
   ↓
+ - * < > == && || ! / % != <= >= Diagram 2 — Expression Evaluation Expression
   ↓
Check Parentheses
   ↓
Apply Precedence
   ↓
Apply Associativity
   ↓
Result

\`\`\`text
Diagram 3 — Decision Using Operators:
START -> Read Input -> Evaluate Condition -> Action A / Action B -> END
\`\`\`
`,4:`
### Module 4: Input, Output & Decision-Making Statements

#### 4.1 Learning Objectives
After completing this module, you will be able to:
- Understand standard input and output.
- Use printf() effectively.
- Use scanf() to accept user input.
- Understand format specifiers.
- Understand conditional statements.
- Use if, if-else, and else-if.
- Implement nested conditions.
- Understand switch.
- Use break and default.
- Build decision-making flowcharts.
- Solve practical problems using conditions.
#### 4.2 Introduction
A typical program follows this basic pattern: Input → Processing → Output But many real-world programs need to make decisions . For example:
- If marks are above 40 → Pass.
- If age is 18 or above → Eligible.
- If password is correct → Login successful.
- If balance is sufficient → Allow withdrawal.
C provides decision-making statements to implement such logic.
#### 4.3 Standard Input and Output
C provides standard I/O facilities through:
\`\`\`c
#include <stdio.h>
\`\`\`
Two commonly used functions are:
printf() → Output scanf() → Input
Basic flow: START


Get Input
   ↓
Process Data
   ↓
Display Output
   ↓
END
#### 4.4 printf()
printf() is used to write formatted output to the standard output stream.
Syntax printf("format string", arguments); Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    printf("Hello World");
    return 0;
}
\`\`\`

**Output:**

Hello World
#### 4.5 Printing Variables
\`\`\`c
#include <stdio.h>


int main(void) {
    int age = 20;
    printf("Age = %d", age);
    return 0;
}
\`\`\`



**Output:**

Age = 20 Here: %d → placeholder for int age → value supplied to printf()
#### 4.6 Common printf() Format
Specifiers Data Type Common Specifier
int %d
unsigned int %u
float %f
double %f
char %c
String %s Pointer address %p Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int age = 21;
    float percentage = 85.5f;
    char grade = 'A';
    printf("Age: %d
", age);
    printf("Percentage: %.2f
", percentage);
    printf("Grade: %c
", grade);
\`\`\`


return 0; }

**Output:**

Age: 21 Percentage: 85.50 Grade: A
#### 4.7 Escape Sequences
Escape sequences represent special characters in string literals.
Escape Sequence Meaning 
 New line 	 Horizontal tab \\ Backslash " Double quote ' Single quote \0 Null character Example printf("Hello
World"); Output: Hello World Tab printf("Name	Age"); Output: Name Age


#### 4.8 scanf()
scanf() reads formatted input from the standard input stream.
Syntax scanf("format", &variable); Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int age;
    printf("Enter your age: ");
    scanf("%d", &age);
    printf("Your age is %d", age);
    return 0;
}
\`\`\`
If the user enters: 20 Output: Your age is 20
#### 4.9 Why Do We Use & with scanf()?
For ordinary scalar variables, scanf() needs the address where it should store the input.
Example:
int age; scanf("%d", &age);
Here: age → value &age → address of age


Conceptually: Memory ┌─────────────┐ age │ 20 │ └─────────────┘ ↑ &age Pointers and addresses will be studied in detail later.
#### 4.10 Reading Different Data Types
Integer int age; scanf("%d", &age); Float float marks; scanf("%f", &marks); Double double salary; scanf("%lf", &salary); Character char grade; scanf(" %c", &grade); The space before %c helps skip leading whitespace such as a leftover newline.
#### 4.11 Reading Multiple Values
You can read multiple values in one scanf() call.


int a, b; scanf("%d %d", &a, &b);
Input: 10 20 Now: a = 10 b = 20 Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    printf("Sum = %d", a + b);
    return 0;
}
\`\`\`
#### 4.12 Input → Processing → Output
Consider:
int a, b, sum; scanf("%d %d", &a, &b); sum = a + b; printf("%d", sum);
\`\`\`text
Flowchart: ┌─────────┐ │ START │ └────┬────┘ ↓


┌──────────────┐ │ Read A and B │ └──────┬───────┘
   ↓
┌──────────────┐ │ Sum = A + B │ └──────┬───────┘
   ↓
┌──────────────┐ │ Print Result │ └──────┬───────┘
   ↓
┌─────────┐ │ END │ └─────────┘
\`\`\`
#### 4.13 Decision-Making Statements
Decision-making allows a program to choose between different paths.
Condition
   ↓
┌─────┴─────┐
   ↓
TRUE FALSE
   ↓
Action A Action B
Main decision statements in C include:
- if
- if-else
- else-if ladder
- Nested if
- switch
#### 4.14 if Statement
The if statement executes a block when a condition is true. Syntax


if (condition) { statements; } Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int age = 20;
    if (age >= 18) {
        printf("Eligible");
    }
    return 0;
}
\`\`\`

**Output:**

Eligible
#### 4.15 if Flowchart

![C Decision Making](/assets/images/c_decision_making.png)


\`\`\`text
                  ┌────────────────────┐
                  │       START        │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │      Read Age      │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │    Age >= 18?      │
                  └──────┬──────────┬──┘
                         │          │
                     YES │          │ NO
                         ▼          │
             ┌───────────────┐      │
             │Print Eligible │      │
             └───────┬───────┘      │
                     │              │
                     └──────┬───────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │        END         │
                  └────────────────────┘
\`\`\`
If the condition is false, the if body is skipped.


#### 4.16 if-else
if-else provides two alternative paths. Syntax if (condition) { statements; } else { statements; } Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int number;
    printf("Enter a number: ");
    scanf("%d", &number);
    if (number % 2 == 0) {
        printf("Even");
    }
    else {
        printf("Odd");
    }
    return 0;
}
\`\`\`
#### 4.17 if-else Flowchart
START
   ↓
Read Number
   ↓
Number % 2 == 0?


↙ ↘ YES NO
   ↓
Print "Even" Print "Odd" ↘ ↙
   ↓
END
#### 4.18 else-if Ladder
An else-if ladder is useful when there are multiple mutually exclusive conditions.
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int marks;
    printf("Enter marks: ");
    scanf("%d", &marks);
    if (marks >= 90) {
        printf("Grade A");
    }
    else if (marks >= 75) {
        printf("Grade B");
    }
    else if (marks >= 60) {
        printf("Grade C");
    }
    else if (marks >= 40) {
        printf("Grade D");
    }
    else {
        printf("Fail");
    }
    return 0;
\`\`\`


}
#### 4.19 Else-If Flowchart
\`\`\`text
                  ┌────────────────────┐
                  │       START        │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │     Read Marks     │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │    Marks >= 90?    ├──YES──► [ Grade A ]
                  └─────────┬──────────┘
                            │ NO
                            ▼
                  ┌────────────────────┐
                  │    Marks >= 75?    ├──YES──► [ Grade B ]
                  └─────────┬──────────┘
                            │ NO
                            ▼
                  ┌────────────────────┐
                  │    Marks >= 60?    ├──YES──► [ Grade C ]
                  └─────────┬──────────┘
                            │ NO
                            ▼
                  ┌────────────────────┐
                  │    Marks >= 40?    ├──YES──► [ Grade D ]
                  └─────────┬──────────┘
                            │ NO
                            ▼
                       [  Fail  ]
\`\`\`
#### 4.20 Nested if
An if statement inside another if statement is called a nested if.
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int age;
    int has_id;
    printf("Enter age: ");
    scanf("%d", &age);
    printf("Do you have an ID? (1 = Yes, 0 = No): ");
\`\`\`


scanf("%d", &has_id); if (age >= 18) { if (has_id) { printf("Entry allowed"); } else { printf("ID required"); } } else { printf("Entry not allowed"); } return 0; }
#### 4.21 Nested if Flowchart
\`\`\`text
                  ┌────────────────────┐
                  │       START        │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │      Read Age      │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │    Age >= 18?      │
                  └──────┬──────────┬──┘
                         │          │
                      NO │          │ YES
                         ▼          ▼
             ┌───────────────┐  ┌───────────────┐
             │ Entry Denied  │  │    Has ID?    │
             └───────┬───────┘  └──────┬────┬───┘
                     │                 │    │
                     │             YES │    │ NO
                     │                 ▼    ▼
                     │  ┌───────────────┐  ┌───────────────┐
                     │  │ Entry Allowed │  │  ID Required  │
                     │  └───────┬───────┘  └───────┬───────┘
                     │          │                  │
                     └──────────┼─────────┬────────┘
                                          │
                                          ▼
                                ┌────────────────────┐
                                │        END         │
                                └────────────────────┘
\`\`\`
#### 4.22 switch Statement


switch is useful when one expression needs to be compared against several constant case
values. Syntax switch (expression) { case constant1: statements; break; case constant2: statements; break; default: statements; }
#### 4.23 Example of switch
\`\`\`c
#include <stdio.h>


int main(void) {
    int choice;
    printf("Enter choice (1-3): ");
    scanf("%d", &choice);
    switch (choice) {
        case 1: printf("Add");
        break;
        case 2: printf("Update");
        break;
        case 3: printf("Delete");
        break;
        default: printf("Invalid choice");
\`\`\`


} return 0; }
#### 4.24 Understanding break
break terminates the nearest enclosing switch or loop. In a switch, it prevents execution from continuing into the next case. Example: case 1: printf("One"); break; Without break, execution can continue into the following case statements. This behavior is called fall-through .
#### 4.25 switch Flowchart
\`\`\`text
                  ┌────────────────────┐
                  │       START        │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │    Read Choice     │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │      Evaluate      │
                  └─────────┬──────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
     [ Case 1 ]         [ Case 2 ]         [ Case 3 ]
         │                  │                  │
         ▼                  ▼                  ▼
     ┌───────┐          ┌───────┐          ┌───────┐
     │  Add  │          │Update │          │Delete │
     └───┬───┘          └───┬───┘          └───┬───┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │     Otherwise      │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │   Invalid Choice   │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │        END         │
                  └────────────────────┘
\`\`\`


#### 4.26 if-else vs switch
Feature if-else switch Range conditions Excellent Not directly Multiple constant choices Possible Excellent Complex logical conditions Yes No Readability for menus Moderate Often better Relational expressions Yes No break required No Usually used to prevent fall-through Example: Use if if (marks >= 40) Use switch switch (choice) { case 1: ... }
#### 4.27 Nested switch
C also permits a switch inside another control statement, including another switch.
Example: switch (department) { case 1: switch (year) { case 1: printf("First Year"); break; } break;


} Use nested structures carefully because excessive nesting can reduce readability.
#### 4.28 Decision-Making Example: Positive,
Negative, or Zero
\`\`\`c
#include <stdio.h>


int main(void) {
    int number;
    printf("Enter number: ");
    scanf("%d", &number);
    if (number > 0) {
        printf("Positive");
    }
    else if (number < 0) {
        printf("Negative");
    }
    else {
        printf("Zero");
    }
    return 0;
}
\`\`\`
\`\`\`text
Flowchart START
   ↓
Read Number
   ↓
Number > 0? ↙ ↘ YES NO
   ↓
Print Positive Number < 0? ↙ ↘


YES NO
   ↓
Print Negative Print Zero ↘ ↙
   ↓
END
\`\`\`
#### 4.29 Real-World Example: Login System
Consider a simple conceptual login system. START
   ↓
Enter Username
   ↓
Enter Password
   ↓
Credentials Correct? ↙ ↘ YES NO
   ↓
Login Successful Login Failed
   ↓
END END C implementation:
\`\`\`c
#include <stdio.h>
#include <string.h>


int main(void) {
    char username[20];
    char password[20];
    printf("Username: ");
    scanf("%19s", username);
    printf("Password: ");
    scanf("%19s", password);
    if (strcmp(username, "admin") == 0 && strcmp(password, "1234") == 0) {
        printf("Login successful");
    }
\`\`\`


else { printf("Invalid credentials"); } return 0; } Note: This is only a learning example. Real authentication systems should never store passwords in plain text.
#### 4.30 switch Example: Simple Calculator
\`\`\`c
#include <stdio.h>


int main(void) {
    char operator;
    double a, b;
    printf("Enter expression (e.g. 10 + 5): ");
    scanf("%lf %c %lf", &a, &operator, &b);
    switch (operator) {
        case '+': printf("Result = %.2f", a + b);
        break;
        case '-': printf("Result = %.2f", a - b);
        break;
        case '*': printf("Result = %.2f", a * b);
        break;
        case '/': if (b != 0) printf("Result = %.2f", a / b);
        else printf("Division by zero is not allowed");
        break;
\`\`\`


default: printf("Invalid operator"); } return 0; }
#### 4.31 Flowchart: Calculator
\`\`\`text
                  ┌──────────────────────┐
                  │        START         │
                  └──────────┬───────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │ Read A, B, Operator  │
                  └──────────┬───────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │   Select Operator    │
                  └──────────┬───────────┘
                            │
         ┌──────────┬───────┴──┬──────────┬──────────┐
         ▼          ▼          ▼          ▼          ▼
       [ + ]      [ - ]      [ * ]      [ / ]     [Other]
         │          │          │          │          │
         ▼          ▼          ▼          ▼          ▼
     ┌───────┐  ┌────────┐ ┌────────┐ ┌───────┐  ┌───────┐
     │  Add  │  │Subtract│ │Multiply│ │Divide │  │Invalid│
     └───┬───┘  └───┬────┘ └───┬────┘ └───┬───┘  └───┬───┘
         │          │          │          │          │
         │          │          │          ▼          │
         │          │          │       [B == 0?]     │
         │          │          │       ↙      ↘      │
         │          │          │     YES       NO    │
         │          │          │      ▼        ▼     │
         │          │          │    Error    Result  │
         │          │          │      │        │     │
         └──────────┼──────────┼──────┴────────┼─────┘
                               │
                               ▼
                        ┌───────────────┐
                        │      END      │
                        └───────────────┘
\`\`\`
#### 4.32 Common Mistakes
Mistake 1: Using = instead of ==
Incorrect: if (age = 18) Correct: if (age == 18)
Mistake 2: Forgetting break
`,5:`


case 1: printf("One"); case 2: printf("Two"); This may cause fall-through. Better: case 1: printf("One"); break;
Mistake 3: Missing Braces
For clarity, use braces: if (condition) { statement; }
Mistake 4: Incorrect scanf()
Incorrect:
int age; scanf("%d", age);
Correct: scanf("%d", &age);
### Module 5: Loops & Iteration
#### 5.1 Learning Objectives
After completing this module, you will be able to:
- Understand the concept of iteration.
- Understand for, while, and do-while loops.
- Compare different types of loops.


- Use nested loops.
- Use break and continue.
- Understand infinite loops.
- Create loop-based flowcharts.
- Solve counting, summation, factorial, and pattern problems.
- Apply loops to real-world programming problems.
#### 5.2 What is a Loop?
A loop repeatedly executes a block of statements while a specified condition remains true or
until a termination condition is reached. Instead of writing:
printf("1"); printf("2"); printf("3"); printf("4"); printf("5");
we can use a loop: for (int i = 1; i <= 5; i++) { printf("%d
", i); } Output: 1 2 3 4 5
#### 5.3 Why Do We Need Loops?
Loops are useful when the same operation must be performed repeatedly.
Examples:
- Printing numbers.
- Reading multiple values.


- Calculating totals.
- Processing arrays.
- Searching data.
- Repeating menu operations.
- Generating patterns.
- Performing calculations until a condition is satisfied.
#### 5.4 Types of Loops in C
C provides three primary loop statements: LOOPS │ ┌────────┼────────┐
   ↓
for while do-while for Best when the number of iterations is known or naturally controlled by initialization, condition, and update. while Best when repetition depends primarily on a condition and the number of iterations may not be known beforehand. do-while Useful when the body must execute at least once before the condition is tested.
#### 5.5 for Loop
Syntax for (initialization; condition; update) { statements; }


Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    for (int i = 1;
    i <= 5;
    i++) {
        printf("%d
", i);
    }
    return 0;
}
\`\`\`

**Output:**

1 2 3 4 5
#### 5.6 Understanding the for Loop
Consider: for (int i = 1; i <= 5; i++) It has three parts: initialization ; condition ; update Initialization int i = 1 Executed once before the loop begins. Condition i <= 5 Checked before each iteration. Update i++


Executed after each iteration of the loop body.
#### 5.7 for Loop Flowchart

![C Loops Flowcharts](/assets/images/c_loops.png)


START
   ↓
Initialization
   ↓
Condition? ↙ ↘ YES NO
   ↓
Execute Body END
   ↓
Update │ └──────────────→ Condition
Easy Flow Initialize
   ↓
Check
   ↓
Execute
   ↓
Update
   ↓
Check Again
#### 5.8 Program: Print 1 to 10
\`\`\`c
#include <stdio.h>


int main(void) {
    for (int i = 1;
    i <= 10;
    i++) {
        printf("%d ", i);
    }
    return 0;
}
\`\`\`



**Output:**

1 2 3 4 5 6 7 8 9 10
#### 5.9 Program: Print Even Numbers
\`\`\`c
#include <stdio.h>


int main(void) {
    for (int i = 2;
    i <= 20;
    i += 2) {
        printf("%d ", i);
    }
    return 0;
}
\`\`\`

**Output:**

2 4 6 8 10 12 14 16 18 20
#### 5.10 while Loop
The while loop checks its condition before executing the body.
Syntax while (condition) { statements; } Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int i = 1;
    while (i <= 5) {
\`\`\`


printf("%d
", i); i++; } return 0; }

**Output:**

1 2 3 4 5
#### 5.11 while Loop Flowchart
START
   ↓
Initialization
   ↓
Condition? ↙ ↘ YES NO
   ↓
Execute Body END
   ↓
Update │ └──────────→ Condition
The important point is that the condition is checked before the body executes.
#### 5.12 while vs for
Both can implement many of the same algorithms. for for (int i = 1; i <= 5; i++) { printf("%d ", i);


} while int i = 1; while (i <= 5) { printf("%d ", i); i++; } The choice is usually based on readability and the nature of the loop.
#### 5.13 do-while Loop
A do-while loop executes its body before checking the condition.
Syntax do { statements; } while (condition); Notice the semicolon after the while condition. Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int i = 1;
    do {
        printf("%d
", i);
        i++;
    }
    while (i <= 5);
    return 0;
}
\`\`\`



**Output:**

1 2 3 4 5
#### 5.14 do-while Flowchart
START
   ↓
Execute Body
   ↓
Update
   ↓
Condition? ↙ ↘ YES NO │
   ↓
└──────→ Execute Body
   ↓
END
A clearer representation is: START
   ↓
Execute Body
   ↓
Condition? ↙ ↘ YES NO │
   ↓
└────→ Body END The key concept: The body executes at least once.


#### 5.15 Difference Between while and do-while
Consider:
int x = 10;
while { printf("Hello"); } Output: Nothing Because the condition is false initially. do-while do { printf("Hello"); } while (x < 5); Output: Hello Because the body executes before the condition is tested.
#### 5.16 Loop Comparison
Feature for while do-while Condition checked Before body Before body After body Guaranteed first execution No No Yes


Common use Count-controlled loops Condition-controlled loops At-least-once operations Initialization syntax Inside loop header Usually before loop Usually before loop
#### 5.17 Nested Loops
A loop inside another loop is called a nested loop . Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    for (int i = 1;
    i <= 3;
    i++) {
        for (int j = 1;
        j <= 3;
        j++) {
            printf("%d %d
", i, j);
        }
    }
    return 0;
}
\`\`\`

**Output:**

1 1 1 2 1 3 2 1 2 2 2 3 3 1 3 2 3 3
#### 5.18 Nested Loop Concept
Suppose: Outer loop → 3 iterations


Inner loop → 3 iterations The inner loop executes completely for each outer-loop iteration. Therefore: 3 × 3 = 9 inner-loop executions.
#### 5.19 Nested Loop Flowchart
START
   ↓
Outer Initialize
   ↓
Outer Condition
   ↓
YES
   ↓
Inner Initialize
   ↓
Inner Condition ↙ ↘ YES NO
   ↓
Inner Body Outer Update
   ↓
│ Inner Update │ │ │ └──→ Inner │ Condition │
   ↓
Outer Condition
#### 5.20 Pattern Printing
Nested loops are commonly used for pattern printing. Example: * **


*** **** ***** Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    for (int i = 1;
    i <= 5;
    i++) {
        for (int j = 1;
        j <= i;
        j++) {
            printf("*");
        }
        printf("
");
    }
    return 0;
}
\`\`\`
#### 5.21 Pattern Flow
Row 1 → * Row 2 → ** Row 3 → *** Row 4 → **** Row 5 → *****
\`\`\`text
Flowchart: START
   ↓
Row = 1
   ↓
Row <= 5? ↙ ↘ YES NO
   ↓
Column = 1 END
   ↓
Column <= Row? ↙ ↘ YES NO


Print * New Line
   ↓
Column++ Row++ │ │ └──→ Column │ Condition │ └──→ Row Condition
\`\`\`
#### 5.22 break Statement
break immediately terminates the nearest enclosing loop or switch .
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    for (int i = 1;
    i <= 10;
    i++) {
        if (i == 5) {
            break;
        }
        printf("%d ", i);
    }
    return 0;
}
\`\`\`

**Output:**

1 2 3 4 When i becomes 5, the loop terminates.
#### 5.23 break Flowchart
Loop ↓


Condition
   ↓
Special case? ↙ ↘ YES NO
   ↓
break Continue body
   ↓
END Next iteration
#### 5.24 continue Statement
continue skips the remaining statements in the current iteration and proceeds to the next
iteration of the nearest enclosing loop. Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    for (int i = 1;
    i <= 5;
    i++) {
        if (i == 3) {
            continue;
        }
        printf("%d ", i);
    }
    return 0;
}
\`\`\`

**Output:**

1 2 4 5 When i == 3, printing is skipped for that iteration.
#### 5.25 break vs continue


break continue Terminates the nearest loop Skips current iteration Control moves outside the loop Control moves toward the next iteration Stops further iterations Loop continues Remember: break → Exit loop continue → Skip iteration
#### 5.26 Infinite Loop
An infinite loop continues indefinitely because its termination condition never becomes false
or there is no termination path. Example: while (1) { printf("Running...
"); } Another example: for (;;) { printf("Running...
"); } Infinite loops can be intentional in systems such as servers or embedded programs, but accidental infinite loops are usually bugs.
#### 5.27 How to Avoid Accidental Infinite
Loops Always ensure that the loop has a valid termination path. Example:


int i = 1; while (i <= 5) { printf("%d ", i); i++; }
If you forget: i++; then i may remain 1 forever.
#### 5.28 Sum of First N Numbers
Problem: Calculate the sum of numbers from 1 to N. Example: N = 5 Calculation: 1 + 2 + 3 + 4 + 5 = 15 Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int n;
    int sum = 0;
    printf("Enter N: ");
    scanf("%d", &n);
    for (int i = 1;
    i <= n;
    i++) {
        sum += i;
    }
    printf("Sum = %d", sum);
\`\`\`


return 0; }
#### 5.29 Sum Flowchart
START
   ↓
Read N
   ↓
sum = 0 i = 1
   ↓
i <= N? ↙ ↘ YES NO
   ↓
sum = sum + i Print Sum
   ↓
i = i + 1 END │ └────→ Condition
#### 5.30 Factorial Using a Loop
Factorial of n is: n! = n × (n-1) × ... × 1 Example: 5! = 5 × 4 × 3 × 2 × 1 = 120 Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int n;
    unsigned long long factorial = 1;
    printf("Enter a non-negative integer: ");
\`\`\`


scanf("%d", &n); if (n < 0) { printf("Factorial is not defined for negative integers."); return 0; } for (int i = 1; i <= n; i++) { factorial *= (unsigned long long)i; } printf("Factorial = %llu", factorial); return 0; }
#### 5.31 Factorial Flowchart
START
   ↓
Read N
   ↓
N < 0? ↙ ↘ YES NO
   ↓
Print Error fact = 1
   ↓
END i = 1
   ↓
i <= N? ↙ ↘ YES NO
   ↓
fact = fact × i Print Fact
   ↓
i = i + 1 END │ └──→ Condition
#### 5.32 Reverse a Number


Example: Input: 1234 Output: 4321 Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int number;
    int reverse = 0;
    printf("Enter a number: ");
    scanf("%d", &number);
    while (number != 0) {
        int digit = number % 10;
        reverse = reverse * 10 + digit;
        number /= 10;
    }
    printf("Reverse = %d", reverse);
    return 0;
}
\`\`\`
#### 5.33 Reverse Number Flowchart
START
   ↓
Read Number
   ↓
reverse = 0
   ↓
Number != 0? ↙ ↘ YES NO
   ↓
digit = number % 10 Print Reverse
   ↓
reverse = reverse*10 + digit
   ↓
number = number / 10


│ └────→ Condition
#### 5.34 Count Digits
Example: Input: 12345 Output: 5 Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int number;
    int count = 0;
    printf("Enter a number: ");
    scanf("%d", &number);
    if (number == 0) {
        count = 1;
    }
    else {
        if (number < 0) {
            number = -number;
        }
        while (number != 0) {
            number /= 10;
            count++;
        }
    }
    printf("Number of digits = %d", count);
    return 0;
}
\`\`\`


#### 5.35 Multiplication Table
Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int n;
    printf("Enter a number: ");
    scanf("%d", &n);
    for (int i = 1;
    i <= 10;
    i++) {
        printf("%d × %d = %d
", n, i, n * i);
    }
    return 0;
}
\`\`\`
Example output for 5: 5 × 1 = 5 5 × 2 = 10 5 × 3 = 15 ... 5 × 10 = 50
#### 5.36 Loop Control Flow
The general loop process is: Initialize
   ↓
Check Condition
   ↓
┌──┴──┐
   ↓
True False
   ↓
Body END
   ↓
Update


Condition This basic concept is essential for understanding almost every loop-based program.
#### 5.37 Common Mistakes
Mistake 1: Forgetting the Update
Incorrect:
int i = 1; while (i <= 5) { printf("%d", i); }
This creates an infinite loop because i never changes. Correct:
int i = 1; while (i <= 5) { printf("%d", i); i++; }
Mistake 2: Wrong Condition for (int i = 1; i >= 5; i++)
The condition is false immediately. Correct for 1 through 5: for (int i = 1; i <= 5; i++)
Mistake 3: Extra Semicolon
Avoid accidentally writing:


for (int i = 0; i < 5; i++); { printf("%d", i); } That semicolon terminates the loop body.
Mistake 4: Confusing break and continue
break → Exit loop continue → Skip current iteration
#### 5.38 Best Practices
- Keep loop conditions simple.
- Make sure loop variables progress toward termination.
- Use for when initialization, condition, and update naturally belong together.
- Use while when repetition is primarily condition-driven.
- Use do-while when at least one execution is required.
- Avoid unnecessarily deep nested loops.
- Use meaningful variable names.
#### 5.39 Interview Questions
- **Q1. What is a loop?**
  **Answer**: A loop repeatedly executes a block of statements according to a controlling condition.
- **Q2. What are the three loops in C?**
  **Answer**: - for
- while
- do-while
- **Q3. Which loop executes at least once?**
  **Answer**: do-while.
- **Q4. What is the difference between while and do-while?**
  **Answer**: while checks the condition before executing the body, while do-while executes the body
first and checks the condition afterward.
- **Q5. What is a nested loop?**
  **Answer**: A loop inside another loop is called a nested loop.
- **Q6. What does break do?**
  **Answer**: It terminates the nearest enclosing loop or switch.
- **Q7. What does continue do?**
  **Answer**: It skips the remaining statements in the current iteration and proceeds toward the next
iteration of the nearest enclosing loop.
- **Q8. What is an infinite loop?**
  **Answer**: An infinite loop is a loop that does not reach its termination condition or has no termination
path.#### 5.40 Practical Lab
- **Task 1**: Print numbers from 1 to 100.
- **Task 2**: Print all even numbers from 1 to 100.
- **Task 3**: Print all odd numbers from 1 to 100.
Task 4


Calculate the sum of numbers from 1 to N.
- **Task 5**: Calculate the factorial of a number.
- **Task 6**: Print the multiplication table of a number.
- **Task 7**: Reverse a number.
- **Task 8**: Count the digits of a number.
- **Task 9**: Check whether a number is a palindrome.
- **Task 10**: Print this pattern: * ** *** **** *****
- **Task 11**: Print: 1 12 123 1234 12345
- **Task 12**: Create a menu-driven program using a do-while loop and switch.
Diagram 1 — for Loop


Initialize
   ↓
Condition? ↙ ↘ YES NO
   ↓
Body END
   ↓
Update │ └────→ Condition
Diagram 2 — while Loop Initialize
   ↓
Condition? ↙ ↘ YES NO
   ↓
Body END
   ↓
Update │ └────→ Condition
Diagram 3 — do-while Loop START
   ↓
Body
   ↓
Condition? ↙ ↘ YES NO │
   ↓
└──→ Body END
Diagram 4 — break vs continue Loop
   ↓
Condition
   ↓
Special situation? ↙ ↘ break continue
   ↓
Exit Loop Next Iteration
`,6:`


Diagram 5 — Nested Loop Outer Loop
   ↓
┌─────────────┐ │ Inner Loop │ │ │ │ Repeat │ └─────────────┘
   ↓
Outer Update
   ↓
Outer Condition
### Module 6: Functions
Functions are one of the most important concepts in C because they help us divide a large
program into small, reusable, and manageable blocks .
#### 6.1 Learning Objectives
After completing this module, you will be able to:
- Understand what a function is.
- Understand why functions are required.
- Learn function declaration, definition, and calling.
- Understand parameters and arguments.
- Understand return values.
- Differentiate library and user-defined functions.
- Understand functions with and without parameters.
- Understand functions with and without return values.
- Learn call by value.
- Understand recursion.
- Understand local and global scope basics.
- Design programs using modular functions.
#### 6.2 What is a Function?
A function is a named block of C code designed to perform a specific task.


Instead of writing an entire program inside main(), we can divide it into smaller functions.
Example:
int add(int a, int b) { return a + b; }
Here, add() performs one specific task: Adding two numbers.
#### 6.3 Why Do We Need Functions?
Imagine a program containing 1,000 lines of code. Without functions: main() │ ├── 100 lines ├── 200 lines ├── 300 lines ├── 400 lines └── ... This becomes difficult to understand and maintain. With functions: main() │ ├── login() ├── calculate() ├── display() └── logout() This makes the program:
- Easier to understand.
- Easier to test.
- Easier to debug.
- Easier to maintain.
- More reusable.


#### 6.4 Function Architecture
A typical function-based program looks like: PROGRAM │ ┌───────────┼───────────┐
   ↓
\`\`\`text
┌──────────────────────────────────────────────┐
│                  MAIN PROGRAM                │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Function 1  │ │ Function 2  │ │ Function 3  │
├─────────────┤ ├─────────────┤ ├─────────────┤
│   Task 1    │ │   Task 2    │ │   Task 3    │
└─────────────┘ └─────────────┘ └─────────────┘
\`\`\`
#### 6.5 Function Components
A function generally involves:
1. Declaration / Prototype
2. Definition
3. Function Call
Example:
\`\`\`c
#include <stdio.h>

int add(int, int);
// Declaration 
int main(void) {
    int result;
    result = add(10, 20);
    // Function Call printf("%d", result);
    return 0;
}
int add(int a, int b) // Definition {
    return a + b;
}
\`\`\`


#### 6.6 Function Declaration
A function declaration, commonly called a prototype , tells the compiler about a function
before it is used. Syntax:
return_type function_name(parameter_types);
Example:
int add(int, int);
This tells the compiler:
- Function name → add
- Return type → int
- Two parameters → both int
You can also name the parameters:
int add(int a, int b);
#### 6.7 Function Definition
The function definition contains the actual implementation. Example:
int add(int a, int b) { return a + b; }
Structure: Return Type
   ↓
Function Name
   ↓
Parameters
   ↓
Function Body


#### 6.8 Function Call
A function is executed when it is called. Example:
int result = add(10, 20);
Here: add(10, 20) is the function call. Execution flow: main()
   ↓
add()
   ↓
return result
   ↓
main()
#### 6.9 Function Execution Flowchart

![C Functions Architecture](/assets/images/c_functions.png)


\`\`\`text
┌───────────────────┐
│       START       │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│  Execute main()   │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│   Call Function   │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│ Function Executes │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│   Return Result   │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│  Continue main()  │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│        END        │
└───────────────────┘
\`\`\`
#### 6.10 Example: Simple Function
\`\`\`c
#include <stdio.h>
\`\`\`


void greet(void) { printf("Welcome to C Programming!"); } int main(void) { greet(); return 0; }

**Output:**

Welcome to C Programming!
#### 6.11 Function With No Parameters and
No Return Value Example:
\`\`\`c
#include <stdio.h>

void display(void) {
    printf("Hello");
}

int main(void) {
    display();
    return 0;
}
\`\`\`
Here: Parameter → None Return Value → None
#### 6.12 Function With Parameters


A function can receive values from the caller. Example:
\`\`\`c
#include <stdio.h>

void displayNumber(int n) {
    printf("Number = %d", n);
}

int main(void) {
    displayNumber(25);
    return 0;
}
\`\`\`
Here: 25 → Argument n → Parameter
#### 6.13 Parameter vs Argument
This is an important interview concept. Parameter A variable specified in the function definition. void display(int n) n is a parameter. Argument The actual value passed during the function call. display(25); 25 is an argument. Remember: Parameter → Function receives Argument → Function call provides


#### 6.14 Function With Return Value
A function can calculate something and return the result. Example:
\`\`\`c
#include <stdio.h>

int square(int n) {
    return n * n;
}

int main(void) {
    int result;
    result = square(5);
    printf("Square = %d", result);
    return 0;
}
\`\`\`

**Output:**

Square = 25
#### 6.15 Function Return Flowchart
START
   ↓
Call square()
   ↓
Receive n = 5
   ↓
Calculate n × n
   ↓
Return 25
   ↓
Store in result
   ↓
Display result


↓ END
#### 6.16 Four Basic Function Categories
Functions can be classified based on parameters and return values.
FUNCTIONS │ ┌───────────────┼────────────────┐
   ↓
No Parameters Parameters Return Value │ │ │ └───────────────┼────────────────┘
   ↓
Four Common Forms
Type 1 No parameters + No return value void display(void); Type 2 Parameters + No return value void display(int n); Type 3 No parameters + Return value
int getNumber(void);
Type 4 Parameters + Return value
int add(int a, int b);
#### 6.17 Function Category Table


Type Parameters Return Value Example 1 No No void display(void) 2 Yes No void display(int n) 3 No Yes int getNumber(void) 4 Yes Yes int add(int a, int b) The fourth form is especially common because it allows a function to receive input and produce a result.
#### 6.18 Library Functions
C provides many functions through its standard library. Examples:
printf() scanf() strlen() strcmp() malloc() free()
They are provided through appropriate header files. Example:
\`\`\`c
#include <stdio.h>
\`\`\`
for standard I/O functions. And:
\`\`\`c
#include <string.h>
\`\`\`
for string functions such as strlen() and strcmp().


#### 6.19 User-Defined Functions
Functions created by the programmer are called user-defined functions .
Example:
int multiply(int a, int b) { return a * b; }
This function is created by the programmer to perform multiplication.
#### 6.20 Library vs User-Defined Functions
Library Function User-Defined Function Provided by libraries Created by programmer Examples: printf(), strlen() Examples: add(), calculate() Declared through headers Programmer provides declaration/definition Reusable standard functionality Application-specific functionality
#### 6.21 Function Prototype
A prototype is useful when the function definition appears after main().
Example:
\`\`\`c
#include <stdio.h>

int multiply(int, int);

int main(void) {
    printf("%d", multiply(5, 4));
    return 0;
\`\`\`


} int multiply(int a, int b) { return a * b; } Without a suitable declaration visible before the call, modern C compilation should not rely on an implicit function declaration.
#### 6.22 Function Scope and Local Variables
A variable declared inside a function or block normally has block scope .
Example: void test(void) { int x = 10; printf("%d", x); } x is accessible within its scope. It cannot be directly accessed from another function.
#### 6.23 Global Variables
A variable declared outside all functions has file scope . Example:
\`\`\`c
#include <stdio.h>

int count = 10;
void display(void) {
    printf("%d", count);
}
\`\`\`


\`\`\`c
int main(void) {
    display();
    return 0;
}
\`\`\`
Here count has file scope and can be accessed by functions in the same source file
according to its linkage and declarations. Best Practice Use global variables carefully. Excessive global state can make programs harder to understand, test, and maintain.
#### 6.24 Local vs Global Variables
Local Global Declared inside a block/function Declared outside functions Limited scope File scope Usually easier to reason about Can create shared state Preferred for most temporary data Use when genuinely appropriate
#### 6.25 Call by Value
C uses pass-by-value semantics. When an argument is passed to a function, the function receives its own parameter initialized from that value. Example:
\`\`\`c
#include <stdio.h>

void change(int x) {
    x = 100;
}
\`\`\`


\`\`\`c
int main(void) {
    int a = 10;
    change(a);
    printf("%d", a);
    return 0;
}
\`\`\`
Output: 10 Why? main() a = 10
   ↓
change(a)
   ↓
x gets a copy of 10
   ↓
x = 100
   ↓
a remains 10
#### 6.26 Call by Value Flowchart
\`\`\`text
┌─────────────────┐
│     main()      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     a = 10      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ call change(a)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ x receives copy │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     x = 100     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     return      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  a is still 10  │
└─────────────────┘
\`\`\`


#### 6.27 Modifying Caller Data Using
Pointers Although C is pass-by-value, you can pass a pointer value to a function so the function can modify the object pointed to. Example:
\`\`\`c
#include <stdio.h>

void change(int *x) {
    *x = 100;
}

int main(void) {
    int a = 10;
    change(&a);
    printf("%d", a);
    return 0;
}
\`\`\`

**Output:**

100 Here: &a → address of a x → receives that address *x → accesses a Pointers will be studied in depth in the Pointers module .
#### 6.28 Recursion
Recursion occurs when a function calls itself. Example:


void display(int n) { if (n > 0) { printf("%d ", n); display(n - 1); } }
Call: display(5); Output: 5 4 3 2 1
#### 6.29 Components of Recursion
Every recursive solution should have:
1. Base Case
Stops recursion. if (n == 0)
2. Recursive Case
Calls the function again with a smaller or otherwise progressing problem.
display(n - 1); Without an appropriate base case or progress toward it, recursion can continue indefinitely and eventually exhaust the call stack.
#### 6.30 Recursion Flowchart
START
   ↓
Call function
   ↓
Base condition?


↙ ↘ YES NO
   ↓
Return Perform task
   ↓
Recursive Call
   ↓
Base Condition
#### 6.31 Recursive Factorial
Mathematically: n! = n × (n-1)! with: 0! = 1 C program:
\`\`\`c
#include <stdio.h>

unsigned long long factorial(unsigned int n) {
    if (n == 0) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main(void) {
    printf("%llu", factorial(5));
    return 0;
}
\`\`\`

**Output:**

120


#### 6.32 Recursive Factorial Flowchart
factorial(n)
   ↓
n == 0? ↙ ↘ YES NO
   ↓
return 1 n × factorial(n-1)
   ↓
Repeat
   ↓
n == 0
#### 6.33 Recursion vs Iteration
Recursion Iteration Function calls itself Loop repeats statements Uses call stack Uses loop control Can be elegant for recursive structures Often more memory-efficient Must have a valid base case Must have a termination condition Can cause stack overflow if too deep Usually avoids recursive call-stack growth Neither is universally better; choose based on the problem and clarity.
#### 6.34 Function Return Statement
The return statement exits the current function. Example:
int add(int a, int b) { return a + b; }


Once return executes:
- The function terminates.
- A value is returned if the function's return type requires one.
For a void function: void display(void) { printf("Hello"); return; } The return; statement can be used to exit without a value.
#### 6.35 Multiple Return Paths
A function can have multiple return statements. Example:
int absolute(int n) { if (n < 0) { return -n; } return n; }
The function returns through whichever path is reached.
#### 6.36 Practical Program: Maximum of Two
Numbers
\`\`\`c
#include <stdio.h>

int maximum(int a, int b) {
    if (a > b)
\`\`\`


{ return a; } return b; } int main(void) { int result = maximum(25, 40); printf("Maximum = %d", result); return 0; }
Output: Maximum = 40
\`\`\`text
Flowchart START
   ↓
Call maximum(a,b)
   ↓
a > b? ↙ ↘ YES NO
   ↓
Return a Return b ↘ ↙ Result
   ↓
END
\`\`\`
#### 6.37 Practical Program: Check Even
Number
\`\`\`c
#include <stdio.h>

int isEven(int n) {
    return n % 2 == 0;
}
\`\`\`


\`\`\`c
int main(void) {
    int number;
    printf("Enter number: ");
    scanf("%d", &number);
    if (isEven(number)) {
        printf("Even");
    }
    else {
        printf("Odd");
    }
    return 0;
}
\`\`\`
This demonstrates how functions can encapsulate reusable logic.
#### 6.38 Function-Based Program
Architecture Instead of putting everything in main():
\`\`\`c
int main(void) {
    // 200 lines of code
}
\`\`\`
we can design: main() │ ┌──────────┼───────────┐
   ↓
getInput() calculate() display() │ │ │
   ↓
Input Process Output This is called modular programming .


#### 6.39 Benefits of Modular Programming
Reusability A function can be called multiple times. Maintainability Changes can be made in one place. Testing Individual functions can be tested independently. Readability The overall program becomes easier to understand. Debugging Errors can be isolated more easily.
#### 6.40 Common Mistakes
Mistake 1: Calling a function before providing a declaration
Make sure an appropriate prototype is visible before the call.
int add(int, int);
Mistake 2: Wrong Return Type
Incorrect:
int getName(void) { printf("Hello"); }


A non-void function should return an appropriate value along every reachable path where
required.
Mistake 3: Forgetting Arguments
If the function requires parameters:
int add(int a, int b)
call it with suitable arguments: add(10, 20);
Mistake 4: Infinite Recursion
Incorrect: void test(void) { test(); } There is no base case or terminating condition.
#### 6.41 Best Practices
- Give functions meaningful names.
calculateAverage() is clearer than: fun1()
- Keep each function focused on one responsibility.
- Use parameters instead of unnecessary global variables.
- Keep functions reasonably small and readable.
- Use prototypes where appropriate.
- Prefer clear return values.


- Document non-obvious behavior.
#### 6.42 Interview Questions
- **Q1. What is a function?**
  **Answer**: A function is a named block of code designed to perform a specific task.
- **Q2. What are the three important parts of a user-defined function?**
  **Answer**: Commonly:
- Function declaration/prototype
- Function definition
- Function call
- **Q3. What is a function prototype?**
  **Answer**: A function prototype declares a function's name, return type, and parameter types before the
function is used.
- **Q4. What is the difference between a parameter and an argument?**
  **Answer**: A parameter appears in the function definition; an argument is the actual value supplied
during the function call.
- **Q5. Does C support call by reference?**
  **Answer**: C itself uses pass-by-value. Reference-like modification of caller objects can be achieved by
passing pointers.
- **Q6. What is recursion?**
  **Answer**: Recursion is a technique where a function calls itself to solve a problem through smaller
subproblems.
- **Q7. What is the difference between local and global variables?**
  **Answer**: Local variables have limited block scope, while variables declared outside functions can
have file scope and potentially be accessible across multiple functions in that source file.
- **Q8. Why are functions important?**
  **Answer**: They improve modularity, readability, reuse, testing, debugging, and maintainability.#### 6.43 Practical Lab
- **Task 1**: Create a function to add two numbers.
- **Task 2**: Create a function to calculate the square of a number.
- **Task 3**: Create a function to find the maximum of three numbers.
- **Task 4**: Create a function to check whether a number is even or odd.
- **Task 5**: Create a function to calculate factorial using iteration.
- **Task 6**: Create a recursive function to calculate factorial.
- **Task 7**: Create a function to check whether a number is prime.
- **Task 8**: Create a function to reverse a number.
- **Task 9**: Create separate functions for: Input Processing Output and build a small calculator.


- **Task 10**: Create a menu-driven program using functions and switch. Diagram 1 — Function Execution MAIN PROGRAM
   ↓
Function Call
   ↓
Function Executes
   ↓
Return Result
   ↓
Continue Main Diagram 2 — Function Components FUNCTION │ ┌─────────┼─────────┐
   ↓
Declaration Definition Call │ │ │ Prototype Body Execute Diagram 3 — Parameter & Argument Function Definition
   ↓
add(int a, int b) ↑ ↑ Parameters Function Call
   ↓
add(10, 20) ↑ ↑ Arguments Diagram 4 — Recursion Function(n)
   ↓
Base Case? ↙ ↘ YES NO
   ↓
Return Function(n-1)
`,7:`


Repeat Diagram 5 — Modular Programming MAIN │ ┌─────────┼─────────┐
   ↓
Input() Process() Output() │ │ │
   ↓
Data Result Display 🎯 Module 6 Key Takeaway Remember the complete function flow: Declaration
   ↓
Definition
   ↓
Function Call
   ↓
Parameters Receive Values
   ↓
Function Executes
   ↓
Return Value
   ↓
Caller Continues
### Module 7: Arrays
Arrays are one of the most important topics in C. They introduce you to contiguous
memory, indexing, traversal, searching, sorting, and multidimensional data .
#### 7.1 Learning Objectives
After completing this module, you will be able to:
- Understand arrays and their characteristics.
- Declare and initialize arrays.
- Access elements using indexes.


- Traverse arrays using loops.
- Understand array memory layout.
- Work with one-dimensional arrays.
- Work with two-dimensional arrays.
- Pass arrays to functions.
- Search elements.
- Find minimum and maximum values.
- Calculate sum and average.
- Sort arrays.
- Understand multidimensional arrays.
- Solve array-based programming problems.
#### 7.2 What is an Array?
An array is a collection of elements of the same type stored in contiguous memory
locations. Example:
int marks[5];
This creates an array capable of storing five int elements. Conceptually: marks │ ▼ ┌────┬────┬────┬────┬────┐ │ 85 │ 72 │ 91 │ 66 │ 80 │ └────┴────┴────┴────┴────┘ 0 1 2 3 4 The numbers below the elements are indexes .
#### 7.3 Why Do We Need Arrays?
Suppose you want to store marks of 100 students. Without an array:
int mark1;


int mark2; int mark3; ... int mark100;
This is difficult to manage. With an array:
int marks[100];
Now all 100 values can be accessed using one variable name and an index.
marks[0] marks[1] marks[2] ... marks[99]
#### 7.4 Important Characteristics of Arrays
An array generally has these characteristics: Same Data Type int numbers[5]; All elements are int. Fixed Size For an ordinary array declaration, its number of elements is determined when the array is created. Contiguous Storage Array elements occupy consecutive memory locations. Zero-Based Indexing The first element is at index 0.
#### 7.5 Array Declaration


Syntax data_type array_name[size]; Example:
int marks[5];
Other examples:
float prices[10]; char letters[26]; double values[20];
#### 7.6 Array Indexing
Consider:
int numbers[5];
The valid indexes are: 0 1 2 3 4 Not: 1 2 3 4 5 Conceptually: Index: 0 1 2 3 4
   ↓
Array: [10] [20] [30] [40] [50] Access: numbers[0] numbers[1] numbers[4]


#### 7.7 Accessing Array Elements
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int numbers[5] = {
        10, 20, 30, 40, 50
    }
    ;
    printf("%d
", numbers[0]);
    printf("%d
", numbers[2]);
    printf("%d
", numbers[4]);
    return 0;
}
\`\`\`

**Output:**

10 30 50
#### 7.8 Array Initialization
You can initialize an array during declaration.
int numbers[5] = {10, 20, 30, 40, 50};
The values are assigned according to index: numbers[0] = 10 numbers[1] = 20 numbers[2] = 30 numbers[3] = 40 numbers[4] = 50
#### 7.9 Partial Initialization
You can provide fewer initializers than the array size.
int numbers[5] = {10, 20};


The remaining elements are initialized to zero. Conceptually: Index: 0 1 2 3 4 Value: 10 20 0 0 0
#### 7.10 Size Inference
When an initializer is present, the array size can sometimes be omitted.
int numbers[] = {10, 20, 30, 40};
The compiler determines the number of elements from the initializer.
Conceptually: Size = 4
#### 7.11 Modifying Array Elements
Array elements can be changed individually.
int numbers[3] = {10, 20, 30}; numbers[1] = 100;
Now: 10 100 30
#### 7.12 Array Memory Representation

![C Arrays Layout](/assets/images/c_arrays.png)


Suppose:
int a[4] = {10, 20, 30, 40};
Conceptually: Contiguous Memory ┌─────────┬─────────┬─────────┬─────────┐


│ 10 │ 20 │ 30 │ 40 │ └─────────┴─────────┴─────────┴─────────┘ ↑ ↑ ↑ ↑ a[0] a[1] a[2] a[3]
The actual byte addresses depend on the implementation and runtime environment.
#### 7.13 Why Array Index Starts at 0
For an array:
int a[5];
the first element is: a[0] and the last is: a[4] The number of elements is 5, but the highest valid index is
4. Formula: Last valid index = size - 1
#### 7.14 Array Traversal
Traversal means visiting each array element. Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int numbers[5] = {
        10, 20, 30, 40, 50
    }
    ;
    for (int i = 0;
    i < 5;
    i++) {
        printf("%d ", numbers[i]);
    }
\`\`\`


return 0; }

**Output:**

10 20 30 40 50
#### 7.15 Array Traversal Flowchart
START
   ↓
Initialize i = 0
   ↓
i < size? ↙ ↘ YES NO
   ↓
Access array[i] END
   ↓
Process
   ↓
i++ │ └────→ Condition
#### 7.16 Reading Array Elements from User
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int numbers[5];
    printf("Enter 5 numbers:
");
    for (int i = 0;
    i < 5;
    i++) {
        scanf("%d", &numbers[i]);
    }
    printf("Elements:
");
\`\`\`


for (int i = 0; i < 5; i++) { printf("%d ", numbers[i]); } return 0; }
#### 7.17 Array Input Flowchart
START
   ↓
i = 0
   ↓
i < 5? ↙ ↘ YES NO
   ↓
Read a[i] Display Array
   ↓
i++ END │ └──→ Condition
#### 7.18 Finding Sum of Array Elements
Example: 10 + 20 + 30 + 40 + 50 = 150 Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int numbers[5] = {
        10, 20, 30, 40, 50
    }
    ;
    int sum = 0;
    for (int i = 0;
    i < 5;
    i++) {
        sum += numbers[i];
\`\`\`


} printf("Sum = %d", sum); return 0; } Output: Sum = 150
#### 7.19 Sum Flowchart
START
   ↓
sum = 0, i = 0
   ↓
i < 5? ↙ ↘ YES NO
   ↓
sum += a[i] Print Sum
   ↓
i++ END │ └──→ Condition
#### 7.20 Average of Array Elements
Formula: Average = Sum / Number of Elements Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int marks[5] = {
        80, 90, 75, 85, 70
    }
    ;
    int sum = 0;
    for (int i = 0;
    i < 5;
    i++) {
\`\`\`


sum += marks[i]; } double average = (double)sum / 5; printf("Average = %.2f", average); return 0; }

**Output:**

Average = 80.00
#### 7.21 Finding Maximum Element
Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int numbers[5] = {
        25, 10, 75, 40, 60
    }
    ;
    int max = numbers[0];
    for (int i = 1;
    i < 5;
    i++) {
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }
    printf("Maximum = %d", max);
    return 0;
}
\`\`\`

**Output:**

Maximum = 75
#### 7.22 Maximum Element Flowchart


START
   ↓
max = array[0]
   ↓
i = 1
   ↓
i < size? ↙ ↘ YES NO
   ↓
array[i] > max? Print max ↙ ↘
   ↓
YES NO END
   ↓
│ max=array[i] │ └────┬────┘
   ↓
i++ │ └──→ Condition
#### 7.23 Finding Minimum Element
Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    int numbers[5] = {
        25, 10, 75, 40, 60
    }
    ;
    int min = numbers[0];
    for (int i = 1;
    i < 5;
    i++) {
        if (numbers[i] < min) {
            min = numbers[i];
        }
    }
    printf("Minimum = %d", min);
    return 0;
}
\`\`\`



**Output:**

Minimum = 10
#### 7.24 Linear Search
Linear search checks elements one by one until the target is found or the array ends.
Example: Array: 10 20 30 40 50 Target: 30 Search: 10 → No 20 → No 30 → Found
#### 7.25 Linear Search Program
\`\`\`c
#include <stdio.h>


int main(void) {
    int numbers[5] = {
        10, 20, 30, 40, 50
    }
    ;
    int target;
    int found = 0;
    printf("Enter target: ");
    scanf("%d", &target);
    for (int i = 0;
    i < 5;
    i++) {
        if (numbers[i] == target) {
            printf("Found at index %d", i);
            found = 1;
            break;
        }
    }
    if (!found) {
\`\`\`


printf("Not found"); } return 0; }
#### 7.26 Linear Search Flowchart
START
   ↓
Read Target
   ↓
i = 0
   ↓
i < size? ↙ ↘ YES NO
   ↓
a[i] == target? Not Found ↙ ↘
   ↓
YES NO END
   ↓
Found i++
   ↓
│ END └──→ Condition
#### 7.27 Two-Dimensional Arrays
A two-dimensional array is commonly used to represent a table or matrix.
Example:
int matrix[2][3];
This represents: 2 rows × 3 columns Conceptually: Column 0 1 2 ┌───┬───┬───┐ Row 0│10 │20 │30 │


├───┼───┼───┤ Row 1│40 │50 │60 │ └───┴───┴───┘
#### 7.28 2D Array Declaration
Syntax data_type array_name[rows][columns]; Example:
int matrix[3][3];
This creates: 3 rows × 3 columns = 9 elements
#### 7.29 2D Array Initialization
int matrix[2][3] = { {10, 20, 30}, {40, 50, 60} };
Conceptually: 10 20 30 40 50 60
#### 7.30 Accessing 2D Array Elements
Syntax: matrix[row][column] Example: matrix[0][0]
returns:


10 And: matrix[1][2]
returns:
60
#### 7.31 Traversing a 2D Array
Two loops are normally required.
\`\`\`c
#include <stdio.h>


int main(void) {
    int matrix[2][3] = { {
            10, 20, 30
        }
        , {
            40, 50, 60
        }
    }
    ;
    for (int i = 0;
    i < 2;
    i++) {
        for (int j = 0;
        j < 3;
        j++) {
            printf("%d ", matrix[i][j]);
        }
        printf("
");
    }
    return 0;
}
\`\`\`

**Output:**

10 20 30 40 50 60
#### 7.32 2D Array Traversal Flowchart


START
   ↓
Row = 0
   ↓
Row < Rows? ↙ ↘ YES NO
   ↓
Col = 0 END
   ↓
Col < Cols? ↙ ↘ YES NO
   ↓
Access a[row][col]
   ↓
Process
   ↓
Col++ │ └──→ Column Condition
   ↓
Row++ │ └──→ Row Condition
#### 7.33 Matrix Addition
Two matrices of the same dimensions can be added element by element.
For example: A = B = 1 2 5 6 3 4 7 8 Then: A + B = 6 8 10 12


#### 7.34 Matrix Addition Program
\`\`\`c
#include <stdio.h>


int main(void) {
    int a[2][2] = { {
            1, 2
        }
        , {
            3, 4
        }
    }
    ;
    int b[2][2] = { {
            5, 6
        }
        , {
            7, 8
        }
    }
    ;
    int sum[2][2];
    for (int i = 0;
    i < 2;
    i++) {
        for (int j = 0;
        j < 2;
        j++) {
            sum[i][j] = a[i][j] + b[i][j];
        }
    }
    for (int i = 0;
    i < 2;
    i++) {
        for (int j = 0;
        j < 2;
        j++) {
            printf("%d ", sum[i][j]);
        }
        printf("
");
    }
    return 0;
}
\`\`\`
#### 7.35 Passing an Array to a Function
Arrays can be passed to functions.


Example:
\`\`\`c
#include <stdio.h>

void display(int a[], int size) {
    for (int i = 0;
    i < size;
    i++) {
        printf("%d ", a[i]);
    }
}

int main(void) {
    int numbers[] = {
        10, 20, 30, 40
    }
    ;
    display(numbers, 4);
    return 0;
}
\`\`\`
Important: Array → Function
   ↓
Pointer to its first element is passed The function also needs the number of elements separately in the usual 1D-array interface.
#### 7.36 Array and Function Flow
\`\`\`text
┌─────────────────────────────────────────────┐
│                   main()                    │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                Create Array                 │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Call display(array)             │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│ Function receives pointer to first element  │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│               Traverse Array                │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                   Return                    │
└─────────────────────────────────────────────┘
\`\`\`


#### 7.37 Important: Array Size and Function
Parameters Consider: void display(int a[]) Inside the function, a is adjusted to a pointer parameter. Therefore: sizeof(a) inside that function does not give the size of the original array. Pass the size explicitly: void display(int a[], int size) Then: for (int i = 0; i < size; i++)
#### 7.38 Sorting an Array
Sorting means arranging elements in a particular order. Ascending 10 20 30 40 50 Descending 50 40 30 20 10
#### 7.39 Bubble Sort
Bubble sort repeatedly compares adjacent elements and swaps them when they are in the
wrong order. Example: 5 3 4 1


First pass: 5 3 → swap 3 5 4 1 5 4 → swap 3 4 5 1 5 1 → swap 3 4 1 5 After more passes: 1 3 4 5
#### 7.40 Bubble Sort Program
\`\`\`c
#include <stdio.h>


int main(void) {
    int a[] = {
        5, 3, 4, 1
    }
    ;
    int n = sizeof(a) / sizeof(a[0]);
    for (int i = 0;
    i < n - 1;
    i++) {
        int swapped = 0;
        for (int j = 0;
        j < n - 1 - i;
        j++) {
            if (a[j] > a[j + 1]) {
                int temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
                swapped = 1;
            }
        }
        if (!swapped) {
            break;
        }
    }
\`\`\`


for (int i = 0; i < n; i++) { printf("%d ", a[i]); } return 0; }

**Output:**

1 3 4 5
#### 7.41 Bubble Sort Flowchart
START
   ↓
Outer Loop
   ↓
Inner Loop
   ↓
Compare a[j], a[j+1]
   ↓
a[j] > a[j+1]? ↙ ↘ YES NO
   ↓
Swap Continue
   ↓
│ └──────┬──────┘
   ↓
Next j
   ↓
Next Pass
   ↓
END
#### 7.42 Array of Characters
An array of char can store a sequence of characters. Example:
char name[] = "Prasanna";


Conceptually: P r a s a n n a \0 The '\0' character marks the end of a C string. Strings will be studied in much greater detail in the Strings module .
#### 7.43 Common Array Errors
Error 1: Out-of-Bounds Access
If:
int a[5];
valid indexes are: 0 to 4 This is invalid: a[5] Accessing outside the array's bounds results in undefined behavior .
Error 2: Incorrect Loop Condition
Incorrect: for (int i = 0; i <= 5; i++) for an array of 5 elements. Correct: for (int i = 0; i < 5; i++)
Error 3: Forgetting & During Input
Correct:


scanf("%d", &a[i]);
Error 4: Incorrect Size Calculation
For an array in the same scope where it is actually an array object:
int a[] = {10, 20, 30}; int n = sizeof(a) / sizeof(a[0]);
This gives the number of elements. But this technique does not work after the array has decayed to a pointer parameter inside a function.
#### 7.44 Array Complexity Preview
Traversal For n elements: Time Complexity: O(n) Linear Search Worst case: O(n) Bubble Sort Basic bubble sort: O(n²) The optimized version above can terminate early when the array is already sorted, although its worst-case complexity remains O(n²).
#### 7.45 Best Practices


- Always stay within valid array bounds.
- Use meaningful names.
int studentMarks[50];
is better than:
int x[50];
when the purpose is student marks.
- Pass the array size explicitly to functions.
- Prefer sizeof(array) / sizeof(array[0]) when determining the element count
of an actual array object in the same scope.
- Use nested loops carefully with 2D arrays.
#### 7.46 Interview Questions
- **Q1. What is an array?**
  **Answer**: An array is a collection of elements of the same type stored in contiguous memory.
- **Q2. What is the first index of an array?**
  **Answer**: The first index is 0.
- **Q3. What is the last valid index of an array of size n?**
  **Answer**: n - 1
- **Q4. What happens when you access an array outside its bounds?**
  **Answer**: The behavior is undefined.
- **Q5. What is array traversal?**
  **Answer**: Visiting or processing array elements, usually one by one.
- **Q6. What is a two-dimensional array?**
  **Answer**: It is an array whose elements are themselves arranged in multiple dimensions, commonly
represented as rows and columns.
- **Q7. How is an array passed to a function?**
  **Answer**: For a normal 1D array parameter, the array argument is converted to a pointer to its first
element.
- **Q8. Why is the array size usually passed separately to a function?**
  **Answer**: Because the function parameter does not retain the original array object's element count.
- **Q9. What is linear search?**
  **Answer**: A search technique that examines elements sequentially until the target is found or the array
is exhausted.
- **Q10. What is bubble sort?**
  **Answer**: A comparison-based sorting algorithm that repeatedly compares adjacent elements and
swaps them when necessary.#### 7.47 Practical Lab
- **Task 1**: Read N numbers into an array and display them.
- **Task 2**: Find the sum and average of array elements.
- **Task 3**: Find the maximum and minimum elements.
- **Task 4**: Count even and odd elements.
- **Task 5**: Search for an element using linear search.
- **Task 6**: Reverse an array.


Example: Input: 1 2 3 4 5 Output: 5 4 3 2 1
- **Task 7**: Sort an array in ascending order.
- **Task 8**: Sort an array in descending order.
- **Task 9**: Remove duplicate values from an array.
- **Task 10**: Perform matrix addition.
- **Task 11**: Find the transpose of a matrix.
- **Task 12**: Perform matrix multiplication.
- **Task 13**: Find the sum of each row and each column. Diagram 1 — Array Traversal START
   ↓
Initialize i
   ↓
i < size? ↙ ↘ YES NO
   ↓
Access a[i] END


Process
   ↓
i++ │ └────→ Condition Diagram 2 — Linear Search START
   ↓
Read Target
   ↓
i = 0
   ↓
i < size? ↙ ↘ YES NO
   ↓
a[i] == target? Not Found ↙ ↘ YES NO
   ↓
Found i++
   ↓
│ END └──→ Condition Diagram 3 — Find Maximum START
   ↓
max = a[0]
   ↓
i = 1
   ↓
i < size? ↙ ↘ YES NO
   ↓
a[i] > max? Print max ↙ ↘
   ↓
YES NO END
   ↓
│ max = a[i] │ └────┬────┘
   ↓
i++ │


└──→ Condition Diagram 4 — 2D Array Traversal START
   ↓
Row = 0
   ↓
Row < Rows? ↙ ↘ YES NO
   ↓
Col = 0 END
   ↓
Col < Columns? ↙ ↘ YES NO
   ↓
Access a[row][col]
   ↓
Col++ Row++ │ │ └──→ Column └──→ Row Condition Condition Diagram 5 — Array Processing ARRAY
   ↓
Read Elements
   ↓
Traverse
   ↓
┌─────┼─────┐
   ↓
Sum Search Sort
   ↓
Result Result Result └─────┼─────┘
   ↓
Output 🎯 Module 7 Key Takeaway Remember these fundamentals:
`,8:`


Array Declaration
   ↓
int a[5]; Indexing
   ↓
a[0] → First element a[4] → Last element Traversal
   ↓
for (i = 0; i < size; i++) Searching
   ↓
Compare each element Sorting
   ↓
Compare + Rearrange
### Module 8: Strings in C
#### 8.1 What is a String?
A string in C is a sequence of characters stored in a character array and terminated by the
null character '\0'. Example:
char name[] = "Prasanna";
Memory concept: P r a s a n n a \0
#### 8.2 Character vs String char ch = 'A'; // Character char name[] = "A"; // String
Remember: 'A' → Character "A" → String


- Character → single quotes ' '
- String → double quotes " "
#### 8.3 Declaring a String char name[20];
This creates a character array capable of storing a string including its terminating '\0',
provided sufficient space is available. Another way:
char name[] = "Prasanna";
The compiler determines the required array size from the initializer.
#### 8.4 Null Character '\0'
The null character marks the end of a C string . H e l l o \0 Its value is zero. It is different from: '0' because: '\0' → null character '0' → character zero
#### 8.5 Reading a String
For a single word:
char name[20]; scanf("%19s", name);


Notice that we normally do not use & here because the array expression supplies a pointer
to its first element. For strings containing spaces, use fgets():
char name[50]; fgets(name, sizeof name, stdin);
fgets() is generally safer than the obsolete gets() function.
#### 8.6 Displaying a String
Use %s:
printf("%s", name);
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    char name[] = "Prasanna";
    printf("Name: %s", name);
    return 0;
}
\`\`\`

**Output:**

Name: Prasanna
#### 8.7 String Length — strlen()
strlen() returns the number of characters in a string excluding '\0'.
Header:
\`\`\`c
#include <string.h>
\`\`\`
Example:


char name[] = "Hello"; printf("%zu", strlen(name));

**Output:**

5
#### 8.8 String Copy — strcpy()
strcpy() copies a string into another character array.
char source[] = "Hello"; char destination[20]; strcpy(destination, source);
Now: destination = "Hello" Include:
\`\`\`c
#include <string.h>
\`\`\`
⚠ The destination must have enough space for the copied string and its terminating '\0'.
#### 8.9 String Concatenation — strcat()
strcat() appends one string to another.
char first[30] = "Hello "; char second[] = "World"; strcat(first, second);
Result: Hello World The destination array must have enough capacity for the combined result.


#### 8.10 String Comparison — strcmp()
strcmp() compares two strings lexicographically. strcmp(str1, str2) Possible results: 0 → Strings are equal < 0 → str1 comes before str2 > 0 → str1 comes after str2 Example: if (strcmp("apple", "apple") == 0) { printf("Equal"); } Output: Equal ⚠ Do not compare C strings using: str1 == str2 That compares pointer values, not string contents.
#### 8.11 Important String Functions
Function Purpose strlen() Find string length strcpy() Copy string strcat() Concatenate strings strcmp() Compare strings


Header:
\`\`\`c
#include <string.h>
\`\`\`
#### 8.12 String Traversal
You can process a string character by character.
\`\`\`c
#include <stdio.h>


int main(void) {
    char name[] = "Hello";
    for (int i = 0;
    name[i] != '\0';
    i++) {
        printf("%c
", name[i]);
    }
    return 0;
}
\`\`\`
Flow: Start
   ↓
Read character
   ↓
Is character '\0'? ↙ ↘ NO YES
   ↓
Process END
   ↓
Next character
#### 8.13 Reverse a String
A string can be reversed by processing characters from the end toward the beginning.
Example: Input → HELLO Output → OLLEH


One approach:
\`\`\`c
#include <stdio.h>
#include <string.h>


int main(void) {
    char str[] = "HELLO";
    for (int i = (int)strlen(str) - 1;
    i >= 0;
    i--) {
        putchar(str[i]);
    }
    return 0;
}
\`\`\`
#### 8.14 Count Vowels
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    char str[] = "education";
    int count = 0;
    for (int i = 0;
    str[i] != '\0';
    i++) {
        if (str[i] == 'a' || str[i] == 'e' || str[i] == 'i' || str[i] == 'o' || str[i] == 'u') {
            count++;
        }
    }
    printf("Vowels = %d", count);
    return 0;
}
\`\`\`


#### 8.15 String Flowchart
START
   ↓
Read String
   ↓
i = 0
   ↓
str[i] != '\0'? ↙ ↘ YES NO
   ↓
Process Character END
   ↓
i++ │ └────→ Condition
#### 8.16 Common Mistakes
Mistake 1: Forgetting Space for '\0' char name[5] = "Hello";
This is invalid because "Hello" requires 6 characters of storage including '\0'.
Correct:
char name[6] = "Hello";
or simply:
char name[] = "Hello";
Mistake 2: Using == for String Contents
Incorrect: if (name1 == name2) Correct: if (strcmp(name1, name2) == 0)


Mistake 3: Using gets()
Do not use: gets(name); gets() was removed from the C standard because it cannot safely limit input length. Use: fgets(name, sizeof name, stdin);
#### 8.17 String Memory Concept

![C Strings Null-Terminated](/assets/images/c_strings.png)


For:
char word[] = "CAT";
conceptually: Index 0 1 2 3
   ↓
┌────┬────┬────┬────┐ │ C │ A │ T │\0 │ └────┴────┴────┴────┘ Therefore: strlen(word) = 3 but the array requires 4 characters of storage .
#### 8.18 Interview Questions
- **Q1. What is a string in C?**
  **Answer**: A character sequence terminated by '\0'.
- **Q2. Which header contains common string functions?**
  **Answer**: #include <string.h>
- **Q3. What does strlen() return?**
  **Answer**: The number of characters before the terminating null character.
- **Q4. Why is '\0' important?**
  **Answer**: It marks the end of a C string.
- **Q5. Can we compare strings using ==?**
  **Answer**: No. Use strcmp() to compare their contents.
- **Q6. Which function is preferred for reading a line safely?**
  **Answer**: fgets().#### 8.19 Practical Lab
1. Find the length of a string.
2. Copy one string into another.
3. Concatenate two strings.
4. Compare two strings.
5. Reverse a string.
6. Count vowels and consonants.
7. Count spaces and words.
8. Check whether a string is a palindrome.
9. Convert lowercase characters to uppercase.
10. Find the frequency of a particular character.
🎯 Module 8 Quick Revision
String
   ↓
Character Array
   ↓
Ends with '\0'
   ↓
Common Functions ├── strlen() → Length ├── strcpy() → Copy ├── strcat() → Join └── strcmp() → Compare
`,9:`


- Remember 'A' → Character "A" → String '\0' → String terminator strlen() → Length strcpy() → Copy strcat() → Concatenate strcmp() → Compare fgets() → Read a line safely
This is the brief version of Module 8 , suitable for quick revision and keeping the notes
compact.
### Module 9: Pointers in C
Pointers are one of the most important and powerful concepts in C . They connect directly
with memory, arrays, strings, functions, dynamic memory allocation, and data
structures.
#### 9.1 Learning Objectives
After this module, you will understand:
- What a pointer is.
- Memory addresses.
- Address-of operator &.
- Dereference operator *.
- Pointer declaration and initialization.
- Pointer arithmetic.
- Relationship between arrays and pointers.
- Pointers and functions.
- Pointers to pointers.
- NULL pointers.
- Common pointer errors.
#### 9.2 What is a Pointer?
A pointer is a variable that stores the address of another object .


Example:
int x = 10; int *p = &x;
Conceptually: x ┌─────────┐ │ 10 │ └─────────┘ ↑ │ address │ p ┌─────────┐ │ &x │ └─────────┘ Here: x → stores 10 &x → address of x p → stores address of x *p → value stored at that address
#### 9.3 Address-of Operator &
The & operator obtains the address of an object.
int x = 25; printf("%p", (void *)&x);
The exact address is implementation-dependent.
#### 9.4 Dereference Operator *
The * operator can be used to access the object pointed to by a pointer.
int x = 25; int *p = &x;


printf("%d", *p);

**Output:**

25 So: &p → address of p's target *p → value of p's target More precisely: p → address stored in pointer *p → object reached through that address
#### 9.5 Pointer Declaration
Syntax data_type *pointer_name; Examples:
int *p; float *f; char *c; double *d;
The pointed-to type matters because it determines how dereferencing and pointer arithmetic
are interpreted.
#### 9.6 Pointer Initialization
Always initialize a pointer before dereferencing it.
int x = 100; int *p = &x;
Now:
printf("%d", *p);
prints:


100
#### 9.7 Pointer Flow

![C Pointers Memory](/assets/images/c_pointers.png)


\`\`\`text
Variable x:
┌───────────┐
│    100    │  ◄──┐
└───────────┘     │
  Address: &x     │ (Dereferenced by *p)
                  │
Pointer variable p:│
┌───────────┐     │
│    &x     │ ────┘
└───────────┘
\`\`\`
#### 9.8 Changing a Value Through a Pointer
\`\`\`c
#include <stdio.h>


int main(void) {
    int x = 10;
    int *p = &x;
    *p = 50;
    printf("%d", x);
    return 0;
}
\`\`\`

**Output:**

50 Why?


p → address of x *p → x itself Therefore: *p = 50; changes x.
#### 9.9 Pointer and scanf()
Pointers explain why we normally use & with scanf() for ordinary scalar variables.
int age; scanf("%d", &age);
Conceptually: User Input
   ↓
scanf()
   ↓
&age
   ↓
Address of age
   ↓
Store input in age
#### 9.10 Pointer Data Types
A pointer has a type.
int *p; char *c; float *f; double *d;
The pointer's type tells the compiler what kind of object it points to.
For example:
int x = 10;


int *p = &x;
p points to an int.
#### 9.11 Pointer Size
The size of a pointer is determined by the implementation and address model.
For example, on many modern 64-bit systems, object pointers are commonly 8 bytes, but
you should not assume this universally . Check with:
printf("%zu", sizeof(p));
The size of the pointer is not necessarily the size of the object it points to.
#### 9.12 NULL Pointer
A null pointer does not point to a valid object. Example:
int *p = NULL;
Use:
\`\`\`c
#include <stddef.h>
\`\`\`
or another standard header that defines NULL. Before dereferencing: if (p != NULL) { printf("%d", *p); } Important Never do: *p


when p is NULL. That would result in undefined behavior.
#### 9.13 Pointer vs Normal Variable
Normal Variable Pointer Stores a value Stores an address x p x = 10 p = &x x gives value *p accesses pointed-to value &x gives address p contains an address
#### 9.14 Pointer Arithmetic
Pointers can participate in arithmetic operations under specific rules.
Suppose:
int a[] = {10, 20, 30, 40}; int *p = a;
Then: p points to a[0]. If: p++; then it points to a[1]. Conceptually: p ↓


10 20 30 40 ↑ p++ Pointer arithmetic is scaled according to the size of the pointed-to type.
#### 9.15 Pointer Increment
int a[] = {10, 20, 30}; int *p = a; printf("%d
", *p); p++; printf("%d
", *p);

**Output:**

10 20
#### 9.16 Pointer Decrement
p--; moves the pointer to the previous element when that operation is valid within the same array object. Example: 10 20 30 ↑ p p-- ↑ p


#### 9.17 Pointer Addition
p + 2 means the pointer is advanced by two elements of its pointed-to type. For:
int a[5]; int *p = a;
then: p → a[0] p + 1 → a[1] p + 2 → a[2]
#### 9.18 Pointer and Arrays
One of the most important relationships in C: For most expressions, an array name is converted to a pointer to its first element. Example:
int a[5] = {10, 20, 30, 40, 50};
Then: a in an expression behaves like: &a[0] So: a[0] is equivalent to: *(a + 0) and: a[2] is equivalent to:


*(a + 2)
#### 9.19 Array and Pointer Relationship
Array: ┌────┬────┬────┬────┬────┐ │ 10 │ 20 │ 30 │ 40 │ 50 │ └────┴────┴────┴────┴────┘ ↑ │ a
Conceptually: a → first element a + 1 → second element a + 2 → third element
#### 9.20 Traversing an Array Using a Pointer
\`\`\`c
#include <stdio.h>


int main(void) {
    int a[] = {
        10, 20, 30, 40, 50
    }
    ;
    int n = sizeof(a) / sizeof(a[0]);
    for (int *p = a;
    p < a + n;
    p++) {
        printf("%d ", *p);
    }
    return 0;
}
\`\`\`

**Output:**

10 20 30 40 50
#### 9.21 Pointer and Function


Pointers allow a function to modify an object belonging to its caller.
Example:
\`\`\`c
#include <stdio.h>

void update(int *p) {
    *p = 100;
}

int main(void) {
    int x = 10;
    update(&x);
    printf("%d", x);
    return 0;
}
\`\`\`
Output: 100 Flow: main()
   ↓
x = 10
   ↓
update(&x)
   ↓
p receives address of x
   ↓
*p = 100
   ↓
x becomes 100
#### 9.22 Swapping Two Numbers Using
Pointers This is a very important interview program.


\`\`\`c
#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 10;
    int y = 20;
    swap(&x, &y);
    printf("x = %d
", x);
    printf("y = %d
", y);
    return 0;
}
\`\`\`

**Output:**

x = 20 y = 10
#### 9.23 Swap Flowchart
START
   ↓
x = 10 y = 20
   ↓
Call swap(&x,&y)
   ↓
temp = *a
   ↓
*a = *b
   ↓
*b = temp
   ↓
Return
   ↓
Display x,y


END
#### 9.24 Pointer to Pointer
A pointer can itself have an address, so we can have a pointer to a pointer .
Example:
int x = 10; int *p = &x; int **q = &p;
Conceptually: x = 10 ↑ p = &x ↑ q = &p Therefore: x → 10 *p → 10 **q → 10
#### 9.25 Example of Pointer to Pointer
\`\`\`c
#include <stdio.h>


int main(void) {
    int x = 10;
    int *p = &x;
    int **q = &p;
    printf("%d
", x);
    printf("%d
", *p);
    printf("%d
", **q);
    return 0;
}
\`\`\`

**Output:**



10 10 10
#### 9.26 Pointer to Pointer Diagram
q
   ↓
┌───────┐ │ &p │ └───┬───┘
   ↓
┌───────┐ │ &x │ └───┬───┘
   ↓
┌───────┐ │ 10 │ └───────┘ x
#### 9.27 const and Pointers
Pointers can be combined with const in different ways. Pointer to constant data const int *p; You cannot modify the pointed-to integer through p. Constant pointer int *const p = &x; The pointer itself cannot be changed to point somewhere else after initialization. Constant pointer to constant data const int *const p = &x; Neither the pointer nor the pointed-to value can be modified through p. This distinction is important in professional C programming.


#### 9.28 Dangling Pointer
A dangling pointer is a pointer that refers to an object whose lifetime has ended.
Example:
int *p; { int x = 10; p = &x; } /* x's lifetime has ended here */
Now p is dangling. Dereferencing it is undefined behavior.
#### 9.29 Wild Pointer
A pointer that has not been initialized can contain an indeterminate value.
Example:
int *p;
Do not do:
printf("%d", *p);
Initialize it:
int *p = NULL;
until you have a valid target.
#### 9.30 Common Pointer Errors


Error 1: Dereferencing NULL int *p = NULL; printf("%d", *p);
❌ Undefined behavior.
Error 2: Uninitialized Pointer int *p; *p = 10;
❌ Invalid because p does not point to a valid object.
Error 3: Wrong Pointer Type
Avoid incompatible pointer conversions unless you understand the required representation
and alignment rules.
Error 4: Returning Address of a Local Variable
Incorrect:
int *getValue(void) { int x = 10; return &x; }
x ceases to exist when the function returns, so the returned pointer becomes invalid.
#### 9.31 Pointer and sizeof
Consider:
int x; int *p = &x;
Then:


sizeof(x) gives the size of the int. Whereas: sizeof(p) gives the size of the pointer. They are different concepts.
#### 9.32 Why Pointers Are Important
Pointers are fundamental to:
- Arrays
- Strings
- Functions
- Dynamic memory
- Structures
- Linked lists
- Trees
- Graphs
- Operating systems
- Embedded systems
- Low-level programming
Understanding pointers is therefore essential for becoming strong in C.
#### 9.33 Interview Questions
- **Q1. What is a pointer?**
  **Answer**: A pointer is an object that stores the address of another object.
- **Q2. What does & do?**
  **Answer**: It obtains the address of an object.
- **Q3. What does * do with a pointer?**
  **Answer**: It dereferences the pointer to access the pointed-to object.
- **Q4. What is a NULL pointer?**
  **Answer**: A null pointer is a pointer value that is guaranteed not to point to any object or function.
- **Q5. What is pointer arithmetic?**
  **Answer**: Operations such as incrementing or decrementing a pointer to move between elements of an
array object.
- **Q6. What is a dangling pointer?**
  **Answer**: A pointer that refers to an object whose lifetime has ended.
- **Q7. What is a pointer to pointer?**
  **Answer**: A pointer that stores the address of another pointer.
int **p;
- **Q8. Why are pointers used in functions?**
  **Answer**: They allow functions to access or modify caller-owned objects and support many data
structures
and dynamic-memory techniques.#### 9.34 Practical Lab
1. Print the address of a variable.
2. Access a variable through a pointer.
3. Modify a variable using a pointer.
4. Swap two numbers using pointers.
5. Find the largest of two numbers using pointers.
6. Traverse an array using a pointer.
7. Calculate the sum of an array using pointers.
8. Demonstrate pointer-to-pointer.
9. Create a function that modifies multiple variables using pointers.
10. Experiment with const pointers.
#### 9.35 Quick Revision
`,10:`


Variable
   ↓
Stores Value Pointer
   ↓
Stores Address &x
   ↓
Address of x *p
   ↓
Value of object pointed to by p
Array Connection a[i] = *(a + i) Function Connection main()
   ↓
function(&x)
   ↓
pointer receives address
   ↓
*p modifies x Pointer Safety Initialize
   ↓
Validate
   ↓
Dereference
### Module 10: Structures, Unions &
Enumerations This module introduces user-defined data types in C. These are essential for representing real-world entities such as students, employees, products, bank accounts, and records .


#### 10.1 Learning Objectives
After this module, you will understand:
● Structures ● Structure declaration and initialization ● Accessing structure members ● Array of structures ● Nested structures ● Structures with functions ● Pointers to structures ●
   ↓
operator ● Unions ● Difference between structures and unions ● Enumerations (enum) ● typedef ● Practical applications
#### 10.2 Why Do We Need Structures?
Suppose you want to store information about a student: Name Roll Number Marks Grade These values have different data types:
char name[30]; int roll; float marks; char grade;
Managing them as separate variables becomes inconvenient. A structure allows us to group related data: Student ├── name ├── roll ├── marks └── grade


#### 10.3 What is a Structure?
A structure is a user-defined data type that groups related variables, potentially of different
data types, under one name. Example:
struct Student { char name[30]; int roll; float marks; };
Here: Student ├── name → char array ├── roll → int └── marks → float
#### 10.4 Structure Syntax
General syntax:
struct StructureName { data_type member1; data_type member2; data_type member3; };
Example:
struct Employee { int id; char name[50]; double salary; };
#### 10.5 Creating Structure Variables


After defining a structure:
struct Student { char name[30]; int roll; float marks; };
Create a variable:
struct Student s1;
Now s1 contains: s1 ├── name ├── roll └── marks
#### 10.6 Accessing Structure Members
The dot operator . is used to access members of a structure variable.
Example: s1.roll = 101; s1.marks = 85.5f; For character arrays, you generally initialize/copy the string rather than assign a string literal directly after declaration. Example: strcpy(s1.name, "Prasanna");
#### 10.7 Complete Structure Example
\`\`\`c
#include <stdio.h>
#include <string.h>

struct Student {
    char name[30];
\`\`\`


int roll; float marks; }; int main(void) { struct Student s1; strcpy(s1.name, "Prasanna"); s1.roll = 101; s1.marks = 88.5f; printf("Name: %s
", s1.name); printf("Roll: %d
", s1.roll); printf("Marks: %.2f
", s1.marks); return 0; }

**Output:**

Name: Prasanna Roll: 101 Marks: 88.50
#### 10.8 Structure Initialization
A structure can be initialized when it is declared.
struct Student s1 = { "Prasanna", 101, 88.5f };
The values correspond to the members in declaration order.
#### 10.9 Designated Initializers
A more explicit method is:
struct Student s1 =


{ .name = "Prasanna", .roll = 101, .marks = 88.5f }; This improves readability and reduces dependence on member order.
#### 10.10 Structure Flowchart

![C Structures and Unions](/assets/images/c_structures.png)


START
   ↓
Create Student
   ↓
Read Student Details
   ↓
┌────────┼────────┐
   ↓
Name Roll Marks │ │ │ └────────┼────────┘
   ↓
Display Details
   ↓
END
#### 10.11 Array of Structures
You can create an array of structure variables. Example:
struct Student students[3];
Conceptually: students │ ├── students[0] ├── students[1] └── students[2] Each element contains all structure members.


#### 10.12 Example: Array of Students
\`\`\`c
#include <stdio.h>

struct Student {
    int roll;
    float marks;
}
;

int main(void) {
    struct Student students[3] = { {
            101, 85.5f
        }
        , {
            102, 91.0f
        }
        , {
            103, 78.5f
        }
    }
    ;
    for (int i = 0;
    i < 3;
    i++) {
        printf("Roll: %d, Marks: %.2f
", students[i].roll, students[i].marks);
    }
    return 0;
}
\`\`\`
#### 10.13 Nested Structures
A structure can contain another structure as a member. Example:
struct Date { int day; int month; int year; };


struct Student { char name[30]; int roll; struct Date dob; };
Access: student.dob.day student.dob.month student.dob.year Conceptually: Student ├── name ├── roll └── dob ├── day ├── month └── year
#### 10.14 Structure and Functions
Structures can be passed to functions. Example:
\`\`\`c
#include <stdio.h>

struct Student {
    int roll;
    float marks;
}
;
void display(struct Student s) {
    printf("Roll = %d
", s.roll);
    printf("Marks = %.2f
", s.marks);
}

int main(void) {
    struct Student s = {
        101, 90.5f
    }
    ;
\`\`\`


display(s); return 0; } Here, the structure is passed by value , so the function receives a copy.
#### 10.15 Pointer to Structure
You can create a pointer to a structure.
struct Student s = {101, 90.5f}; struct Student *p = &s;
Now: p → address of s
#### 10.16 Accessing Structure Through
Pointer You can use: (*p).roll But C provides a more convenient operator: p
   ↓
roll These are equivalent: (*p).roll p
   ↓
roll
#### 10.17 -> Operator Example
\`\`\`c
#include <stdio.h>
\`\`\`


struct Student { int roll; float marks; }; int main(void) { struct Student s = {101, 92.5f}; struct Student *p = &s; printf("Roll = %d
", p
   ↓
roll); printf("Marks = %.2f
", p
   ↓
marks); return 0; }
#### 10.18 Structure vs Pointer to Structure
Structure Variable Structure Pointer s.roll p
   ↓
roll Stores structure object Stores address of structure Uses . Uses
   ↓
Remember: Structure object → . Structure pointer →
#### 10.19 Structure Memory and Padding
Structure members are stored in memory in declaration order, but the compiler may insert
padding bytes between or after members to satisfy alignment requirements. Example:
struct Example { char c;


int x; };
The structure's size may be larger than: sizeof(char) + sizeof(int) because of padding. Check the actual size with: sizeof(struct Example) This is important when working with:
- Memory optimization
- Binary files
- Network protocols
- Embedded systems
#### 10.20 What is a Union?
A union is a user-defined type whose members share the same memory location.
Example:
union Data { int i; float f; char c; };
Unlike a structure, all members occupy overlapping storage.
#### 10.21 Union Example
\`\`\`c
#include <stdio.h>

union Data {
    int i;
    float f;
\`\`\`


char c; }; int main(void) { union Data data; data.i = 10; printf("%d
", data.i); data.f = 20.5f; printf("%.2f
", data.f); return 0; }
When data.f is assigned, the previously stored data.i value should not be treated as still
representing the active value.
#### 10.22 Structure vs Union
This is a very important interview question. Structure Union Members have separate storage Members share storage Multiple members can hold values simultaneously Typically one member's stored representation is used at a time Size is influenced by all members plus padding Size is at least enough for its largest member, subject to alignment Uses more memory Can save memory . accesses members . accesses members Example:
struct A { int x; float y;


}; Both x and y have separate storage. But:
union A { int x; float y; };
x and y overlap.
#### 10.23 When to Use a Union
Unions are useful when an object needs to represent one of several possible
representations and sharing storage is desirable. Examples include:
- Memory-constrained systems
- Embedded programming
- Tagged/variant-style data representations
- Low-level data interpretation
Often, a separate field called a tag/discriminator is used to record which union member is
currently meaningful.
#### 10.24 What is an Enumeration?
An enum defines a type consisting of named integer constants.
Example:
enum Day { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY


}; By default: MONDAY → 0 TUESDAY → 1 WEDNESDAY → 2 THURSDAY → 3 FRIDAY → 4
#### 10.25 Using enum
\`\`\`c
#include <stdio.h>

enum Status {
    OFF, ON
}
;

int main(void) {
    enum Status device = ON;
    printf("%d", device);
    return 0;
}
\`\`\`

**Output:**

1
#### 10.26 Custom Enum Values
You can assign specific integer values.
enum Status { ERROR = -1, SUCCESS = 0, PENDING = 1 };


Now: ERROR → -1 SUCCESS → 0 PENDING → 1 If later enumerators have no explicit value, numbering continues from the previous value.
#### 10.27 Why Use enum?
Instead of:
int status = 1;
you can write:
enum Status status = SUCCESS;
This improves readability and communicates intent.
#### 10.28 typedef
typedef creates an alias for an existing type.
Example:
typedef unsigned int uint;
Now: uint age; is equivalent in type to: unsigned int age;
#### 10.29 typedef with Structures
Without typedef:


struct Student s1;
With typedef:
typedef struct { int roll; float marks; } Student;
Now: Student s1; This is very common in C codebases.
#### 10.30 typedef with Named Structures
You can also write:
typedef struct Student { int roll; float marks; } Student;
Then: Student s1; The structure still has the tag struct Student, while Student is an alias created by typedef.
#### 10.31 Practical Example: Employee
Record
\`\`\`c
#include <stdio.h>

typedef struct {
    int id;
\`\`\`


char name[30]; float salary; } Employee; int main(void) { Employee e = {101, "Rahul", 45000.0f}; printf("ID: %d
", e.id); printf("Name: %s
", e.name); printf("Salary: %.2f
", e.salary); return 0; }
#### 10.32 Real-World Data Model
Consider an employee: Employee │ ├── ID ├── Name ├── Salary └── Department In C:
struct Employee { int id; char name[50]; float salary; char department[30]; };
This is much more organized than maintaining unrelated variables.
#### 10.33 Structure Flowchart
START
   ↓
Create Structure


Initialize Members
   ↓
┌───────┼───────┐
   ↓
ID Name Salary │ │ │ └───────┼───────┘
   ↓
Process Record
   ↓
Display Record
   ↓
END
#### 10.34 Structure vs Array
Array Structure Same data type Different data types allowed Indexed using [] Members accessed using . or
   ↓
Good for collections of similar values Good for records/entities Example: marks Example: student record Example:
int marks[5];
vs.
struct Student { int roll; char name[30]; float marks; };
#### 10.35 Common Mistakes


Mistake 1: Forgetting struct
If no typedef alias exists:
struct Student s;
is correct. Just: Student s; is only valid if Student has been defined as an alias, for example using typedef.
Mistake 2: Using . with a Structure Pointer
Incorrect: p.roll If p is a pointer: p
   ↓
roll is correct.
Mistake 3: Confusing Structure and Union
Remember: Structure → Separate member storage Union → Shared member storage
Mistake 4: Assuming Union Members Hold Independent Values
A union's members overlap in storage, so assigning one member can change the stored
representation seen through another member.
#### 10.36 Interview Questions


- **Q1. What is a structure?**
  **Answer**: A structure is a user-defined type that groups related members, potentially of different data
types.
- **Q2. What is a union?**
  **Answer**: A union is a user-defined type whose members share the same storage.
- **Q3. What is the difference between structure and union?**
  **Answer**: Structures allocate separate storage for members, while union members overlap in the same
storage.
- **Q4. What is**
  **Answer**: ↓
?
It accesses a structure or union member through a pointer. p
   ↓
member
- **Q5. What is typedef?**
  **Answer**: It creates an alias for an existing type.
- **Q6. What is enum?**
  **Answer**: It defines a type containing named integer constants.
- **Q7. Can structures contain other structures?**
  **Answer**: Yes. This is called a nested structure.
- **Q8. Can structures be passed to functions?**
  **Answer**: Yes.
- **Q9. Can a structure contain an array?**
  **Answer**: Yes. Example:
struct Student { char name[50]; };
- **Q10. Why are structures important?**
  **Answer**: They allow programs to model complex real-world entities as organized records.#### 10.37 Practical Lab
- **Task 1**: Create a Student structure with: Name Roll Number Marks
- **Task 2**: Create an Employee structure with: ID Name Salary
- **Task 3**: Create an array of 5 students and display their details.
- **Task 4**: Find the student with the highest marks.
- **Task 5**: Create a nested structure containing student and date-of-birth information.
- **Task 6**: Create a structure pointer and access members using
   ↓
.
- **Task 7**: Create a union containing:
int float char
and observe shared storage.


- **Task 8**: Create an enum for: MONDAY TUESDAY ... SUNDAY
- **Task 9**: Use typedef to create a convenient name for a structure.
#### 10.38 Quick Revision
STRUCTURE
   ↓
Groups different data types
   ↓
Separate storage
   ↓
Access → . UNION
   ↓
Groups different possible representations
   ↓
Shared storage
   ↓
Access → . STRUCTURE POINTER
   ↓
Stores address of structure
   ↓
Access →
   ↓
ENUM
   ↓
Named integer constants TYPEDEF
   ↓
Creates a type alias
🎯 Module 10 Key Takeaway
`,11:`


Remember these five concepts:
struct → Group related data union → Share storage among members enum → Named integer constants typedef → Type alias
   ↓
→ Access member through structure pointer
### Module 11: Dynamic Memory Allocation
Dynamic memory allocation is an advanced and very important C concept. It allows
programs to request memory at runtime instead of deciding the required memory size completely at compile time.
#### 11.1 Learning Objectives
After this module, you will understand:
- Static vs dynamic memory.
- Stack and heap basics.
- malloc()
- calloc()
- realloc()
- free()
- Dynamic arrays.
- Dynamic memory with pointers.
- Memory leaks.
- Dangling pointers.
- NULL checks.
- Safe memory-management practices.
#### 11.2 Why Dynamic Memory?
Consider:
int marks[100];
This reserves space for 100 integers. But what if the user wants to enter only 10?


Or 1,000? A dynamically allocated array can request memory based on the runtime requirement. User enters N
   ↓
Allocate memory for N elements
   ↓
Use memory
   ↓
Release memory
#### 11.3 Static vs Dynamic Memory
Fixed-size array int numbers[100]; Size is determined as part of the array object's creation. Dynamic memory int *numbers; numbers = malloc(n * sizeof *numbers); Memory is requested at runtime.
#### 11.4 Stack and Heap
At a high level, program memory can involve different storage regions.
For this module, focus on:
Program Memory │ ┌─────────┴─────────┐
   ↓
Stack Heap │ │ Local/automatic Dynamic allocation objects via malloc/calloc
Stack


Typically used for automatic storage such as local variables.
Heap Used for dynamically allocated storage. Exact memory organization depends on the implementation, operating system, compiler, and runtime environment.
#### 11.5 Dynamic Memory Functions
The main functions are provided by:
\`\`\`c
#include <stdlib.h>

Function Purpose
\`\`\`
malloc() Allocate uninitialized storage calloc() Allocate zero-initialized storage realloc() Resize an existing allocation free() Release allocated storage
#### 11.6 malloc()
malloc() allocates a specified number of bytes. Syntax ptr = malloc(number_of_bytes); Example:
int *p = malloc(5 * sizeof *p);
This requests enough storage for 5 int objects.


#### 11.7 Important Property of malloc()
Memory returned by malloc() is uninitialized . Example:
int *p = malloc(5 * sizeof *p);
Do not assume: p[0] = 0 p[1] = 0 ... The contents are indeterminate until you initialize them.
#### 11.8 malloc() Example
\`\`\`c
#include <stdio.h>
#include <stdlib.h>


int main(void) {
    int *p = malloc(5 * sizeof *p);
    if (p == NULL) {
        printf("Memory allocation failed");
        return 1;
    }
    for (int i = 0;
    i < 5;
    i++) {
        p[i] = (i + 1) * 10;
    }
    for (int i = 0;
    i < 5;
    i++) {
        printf("%d ", p[i]);
    }
    free(p);
    return 0;
\`\`\`


} Output: 10 20 30 40 50
#### 11.9 malloc() Flowchart
START
   ↓
Determine Size
   ↓
Request Memory
   ↓
Allocation NULL? ↙ ↘ YES NO
   ↓
Handle Failure Initialize
   ↓
END Use Memory
   ↓
free()
   ↓
END
#### 11.10 calloc()
calloc() allocates memory for multiple elements and initializes all allocated bytes to zero.
Syntax ptr = calloc(number_of_elements, size_of_each_element);
Example:
int *p = calloc(5, sizeof *p);
This allocates space for five integers. For ordinary integer/character objects, this results in their bytes being zeroed; do not generalize this into a guarantee that every possible C type has a semantic "zero value" represented by all-bits-zero.


#### 11.11 malloc() vs calloc()
malloc() calloc() Takes one size argument Takes number of elements + element size Memory is uninitialized Allocated bytes are initialized to zero malloc(n * size) calloc(n, size) Example: malloc(5 * sizeof *p); vs. calloc(5, sizeof *p);
#### 11.12 calloc() Example
\`\`\`c
#include <stdio.h>
#include <stdlib.h>


int main(void) {
    int *p = calloc(5, sizeof *p);
    if (p == NULL) {
        printf("Allocation failed");
        return 1;
    }
    for (int i = 0;
    i < 5;
    i++) {
        printf("%d ", p[i]);
    }
    free(p);
    return 0;
\`\`\`


} Typical output: 0 0 0 0 0
#### 11.13 realloc()
realloc() changes the size of a previously allocated memory block.
Syntax ptr = realloc(ptr, new_size); However, directly assigning the result can lose the original pointer if allocation fails. Safer pattern:
int *temp = realloc(p, new_size); if (temp != NULL) { p = temp; }
#### 11.14 Why realloc() Is Useful
Suppose: Initial requirement = 5 integers Later: New requirement = 10 integers Instead of allocating another block and manually copying everything, realloc() can resize the existing allocation when possible. Conceptually: Initial: ┌────┬────┬────┬────┬────┐ │ 10 │ 20 │ 30 │ 40 │ 50 │ └────┴────┴────┴────┴────┘


↓ realloc() Expanded: ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐ │ 10 │ 20 │ 30 │ 40 │ 50 │ │ │ │ │ │ └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
The block may move to a different address.
#### 11.15 realloc() Example
\`\`\`c
#include <stdio.h>
#include <stdlib.h>


int main(void) {
    int *p = malloc(3 * sizeof *p);
    if (p == NULL) {
        return 1;
    }
    p[0] = 10;
    p[1] = 20;
    p[2] = 30;
    int *temp = realloc(p, 5 * sizeof *p);
    if (temp == NULL) {
        free(p);
        return 1;
    }
    p = temp;
    p[3] = 40;
    p[4] = 50;
    for (int i = 0;
    i < 5;
    i++) {
        printf("%d ", p[i]);
\`\`\`


} free(p); return 0; } Output: 10 20 30 40 50
#### 11.16 Important realloc() Behavior
When realloc() succeeds:
- Existing contents are preserved up to the smaller of old and new sizes.
- The block may move.
- The old pointer value should no longer be used to access the allocation after a
successful move. When it fails: realloc(p, new_size)
returns NULL, and the original allocation pointed to by p remains valid.
That's why this pattern is important:
int *temp = realloc(p, new_size); if (temp != NULL) { p = temp; }
#### 11.17 free()
free() releases memory obtained from dynamic allocation functions.
free(p); After freeing:


p still contains an address value, but it must not be dereferenced as if it still pointed to a valid allocation. A common defensive practice is: free(p); p = NULL;
#### 11.18 Complete Memory Lifecycle

![C Dynamic Memory Allocation](/assets/images/c_dynamic_memory.png)


Professional memory-management flow: Determine Size
   ↓
Allocate
   ↓
Check Result
   ↓
Initialize
   ↓
Use
   ↓
Resize if needed
   ↓
free()
   ↓
Set pointer NULL
#### 11.19 Dynamic Array
A dynamic array can be implemented using a pointer to allocated storage.
Example:
\`\`\`c
#include <stdio.h>
#include <stdlib.h>


int main(void) {
    int n;
    printf("Enter number of elements: ");
\`\`\`


scanf("%d", &n); int *a = malloc((size_t)n * sizeof *a); if (a == NULL && n > 0) { printf("Allocation failed"); return 1; } for (int i = 0; i < n; i++) { scanf("%d", &a[i]); } for (int i = 0; i < n; i++) { printf("%d ", a[i]); } free(a); return 0; }
#### 11.20 Dynamic Array Flowchart
START
   ↓
Read N
   ↓
Allocate N elements
   ↓
Allocation OK? ↙ ↘ NO YES
   ↓
Error Read Elements
   ↓
END Process Array
   ↓
Display
   ↓
free()


END
#### 11.21 Memory Leak
A memory leak occurs when dynamically allocated memory is no longer reachable by the
program and has not been released. Example:
int *p = malloc(100 * sizeof *p); p = NULL;
The allocated block has become unreachable without free(). Correct:
int *p = malloc(100 * sizeof *p); free(p); p = NULL;
#### 11.22 Dangling Pointer
A dangling pointer refers to memory whose lifetime has ended.
Example:
int *p = malloc(sizeof *p); free(p); /* p is now dangling */
Avoid:
printf("%d", *p);
after free(p). Better: free(p); p = NULL;


#### 11.23 Double Free
A double free happens when the same allocated block is released more than once.
Dangerous: free(p); free(p); After: free(p); use: p = NULL; Then: free(p); is safe because free(NULL) has no effect.
#### 11.24 Use-After-Free
This occurs when a program accesses dynamically allocated memory after it has been
released. Example:
int *p = malloc(sizeof *p); *p = 100; free(p); printf("%d", *p); // Wrong
This produces undefined behavior .


#### 11.25 Allocation Failure
Memory allocation can fail. Always check:
int *p = malloc(n * sizeof *p); if (p == NULL) { printf("Allocation failed"); return 1; }
Never assume that allocation always succeeds.
#### 11.26 malloc() vs calloc() vs realloc() vs free()
Function Purpose malloc() Allocate memory calloc() Allocate and zero-initialize bytes realloc() Resize an existing allocation free() Release allocation Easy memory trick: malloc → Allocate calloc → Allocate + Clear realloc → Resize free → Release
#### 11.27 Dynamic Memory and Pointers


Dynamic memory is accessed through pointers. Pointer
   ↓
┌───────────────┐ │ Heap Memory │ │ │ │ 10 20 30 40 │ └───────────────┘ Example:
int *p = malloc(4 * sizeof *p);
Here: p → points to dynamically allocated storage
#### 11.28 Dynamic Memory for Structures
You can dynamically allocate a structure.
#include <stdio.h> #include <stdlib.h> struct Student { int roll; float marks; }; int main(void) { struct Student *s = malloc(sizeof *s); if (s == NULL) { return 1; } s
   ↓
roll = 101; s
   ↓
marks = 88.5f; printf("%d %.2f", s
   ↓
roll, s
   ↓
marks); free(s);


return 0; }
Notice: s
   ↓
roll because s is a pointer to a structure.
#### 11.29 Dynamic Array of Structures
Example:
struct Student *students = malloc(n * sizeof *students);
Then: students[0].roll students[1].roll students[2].roll can be used to access individual elements.
#### 11.30 sizeof with Dynamic Memory
Suppose:
int *p = malloc(10 * sizeof *p);
Do not expect: sizeof(p) to tell you that 10 integers were allocated. sizeof(p) gives the size of the pointer itself . The allocation size must be tracked separately. Example:


size_t n = 10; int *p = malloc(n * sizeof *p); Here n records the number of elements.
#### 11.31 Best Practice: sizeof *pointer
Instead of:
int *p = malloc(n * sizeof(int));
you can write:
int *p = malloc(n * sizeof *p);
This is often preferred because it automatically follows the pointer's declared type.
For example:
struct Student *s = malloc(n * sizeof *s);
#### 11.32 Common Mistakes
Mistake 1: Forgetting free() int *p = malloc(100 * sizeof *p); /* use p */ return 0;
Better: free(p);
Mistake 2: Dereferencing NULL int *p = malloc(100 * sizeof *p); if (p == NULL)


{ /* handle failure */ } Always check before use.
Mistake 3: Using Memory After free() free(p); *p = 10; // Wrong
Mistake 4: Losing the Original Pointer with realloc()
Avoid: p = realloc(p, new_size); when you need to preserve p if resizing fails. Prefer:
int *temp = realloc(p, new_size); if (temp != NULL) { p = temp; }
#### 11.33 Memory Management Flowchart
START
   ↓
Calculate Required Size
   ↓
Allocate Memory
   ↓
Allocation Successful? ↙ ↘ NO YES
   ↓
Handle Failure Initialize
   ↓
END Use


Resize? ↙ ↘ YES NO
   ↓
realloc() Continue
   ↓
│ └────┬─────┘
   ↓
free()
   ↓
END
#### 11.34 Interview Questions
- **Q1. What is dynamic memory allocation?**
  **Answer**: It is the process of obtaining and releasing memory at runtime.
- **Q2. Which header provides dynamic memory functions?**
  **Answer**: #include <stdlib.h>
- **Q3. What is malloc()?**
  **Answer**: It allocates a specified number of bytes without initializing their contents.
- **Q4. What is calloc()?**
  **Answer**: It allocates storage for multiple elements and initializes all allocated bytes to zero.
- **Q5. What is realloc()?**
  **Answer**: It changes the size of an existing dynamically allocated block.
- **Q6. What is free()?**
  **Answer**: It releases dynamically allocated storage.
- **Q7. What is a memory leak?**
  **Answer**: Allocated memory that becomes unreachable without being released.
- **Q8. What is a dangling pointer?**
  **Answer**: A pointer that refers to an object whose lifetime has ended or to storage that has been
released.
- **Q9. Why should we check malloc() for NULL?**
  **Answer**: Because allocation can fail.
- **Q10. Why is sizeof *p useful?**
  **Answer**: It derives the allocation element size from the pointer's pointed-to type and reduces type
duplication.#### 11.35 Practical Lab
- **Task 1**: Dynamically allocate memory for N integers.
- **Task 2**: Read and display dynamically allocated elements.
- **Task 3**: Find the sum and average of a dynamic array.
- **Task 4**: Find the maximum and minimum.
- **Task 5**: Resize an array using realloc().
- **Task 6**: Create a dynamically allocated array of structures.
- **Task 7**: Allocate memory using calloc() and observe the initial values.
Task 8


Write a program that properly allocates, uses, and releases memory.
#### 11.36 Quick Revision
malloc()
   ↓
Allocate memory
   ↓
Check NULL
   ↓
Use memory
   ↓
free() calloc()
   ↓
Allocate + zero-initialize bytes realloc()
   ↓
Resize allocation
   ↓
Check returned pointer free()
   ↓
Release allocation
Memory Safety Allocate
   ↓
Initialize
   ↓
Use
   ↓
Release Avoid: Memory Leak Dangling Pointer Use-After-Free Double Free 🎯 Module 11 Key Takeaway
`,12:`


The four functions you must remember are: malloc() → Allocate calloc() → Allocate + zero-initialize bytes realloc() → Resize free() → Release
### Module 12: File Handling in C
File handling allows a C program to store data permanently in files instead of losing it when
the program terminates.
#### 12.1 Learning Objectives
You will learn:
- What file handling is.
- FILE and file pointers.
- Opening and closing files.
- File modes.
- Reading from files.
- Writing to files.
- Appending data.
- Character-based file operations.
- String-based file operations.
- Formatted file operations.
- Binary files.
- Error handling.
- File positioning functions.
#### 12.2 What is File Handling?
Normally, data stored in variables exists only while the program is running.
Program starts
   ↓
Data stored in memory
   ↓
Program terminates
   ↓
Data is lost


A file allows persistent storage: Program
   ↓
File
   ↓
Data remains after program terminates Examples: students.txt employees.txt marks.dat database.dat
#### 12.3 Why File Handling?
File handling is useful for:
- Storing student records.
- Saving application data.
- Reading configuration files.
- Generating reports.
- Maintaining logs.
- Storing large amounts of data.
- Sharing data between program executions.
#### 12.4 FILE Pointer
C provides the FILE type for working with files. Example: FILE *fp; Here: fp → file stream The actual file is managed through the C standard I/O library. Include:


\`\`\`c
#include <stdio.h>
\`\`\`
#### 12.5 Basic File Handling Flow

![C File Handling Streams](/assets/images/c_file_handling.png)


START
   ↓
Declare FILE*
   ↓
fopen()
   ↓
Open successful? ↙ ↘ NO YES
   ↓
Error Read/Write
   ↓
END fclose()
   ↓
END
#### 12.6 Opening a File — fopen()
Syntax: FILE *fp = fopen("filename", "mode"); Example: FILE *fp = fopen("data.txt", "r"); Here: data.txt → File name r → Opening mode fp → File pointer
#### 12.7 Always Check fopen()
A file may fail to open. Professional pattern:


FILE *fp = fopen("data.txt", "r"); if (fp == NULL) { printf("Unable to open file
"); return 1; }
Possible reasons include:
- File does not exist.
- Permission problems.
- Invalid path.
- Resource limitations.
#### 12.8 Closing a File
Use: fclose(fp); Example: FILE *fp = fopen("data.txt", "r"); if (fp != NULL) { fclose(fp); } Closing a file releases associated resources and completes pending output operations.
#### 12.9 File Opening Modes
Important modes: Mode Purpose "r" Read existing file "w" Write; creates/truncates file


"a" Append; creates if needed "r+" Read and write existing file "w+" Read and write; creates/truncates "a+" Read and append; creates if needed
#### 12.10 Read Mode — "r"
FILE *fp = fopen("data.txt", "r"); The file must already exist. If it doesn't exist: fopen() → NULL
#### 12.11 Write Mode — "w"
FILE *fp = fopen("data.txt", "w"); If the file doesn't exist: Create file If it already exists: Existing contents are discarded ⚠ Therefore, don't use "w" when you want to preserve existing contents.
#### 12.12 Append Mode — "a"
FILE *fp = fopen("data.txt", "a"); If the file doesn't exist, it is created. If it exists:


New data → End of file Existing content is preserved.
#### 12.13 Writing to a File — fprintf()
fprintf() works like printf(), but writes formatted output to a specified stream.
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    FILE *fp = fopen("student.txt", "w");
    if (fp == NULL) {
        return 1;
    }
    fprintf(fp, "Name: Prasanna
");
    fprintf(fp, "Marks: %d
", 90);
    fclose(fp);
    return 0;
}
\`\`\`
File content: Name: Prasanna Marks: 90
#### 12.14 fputc()
fputc() writes one character to a file stream. Example: FILE *fp = fopen("data.txt", "w");


if (fp == NULL) { return 1; } fputc('A', fp); fclose(fp); File contains: A
#### 12.15 fputs()
fputs() writes a string to a file stream. Example: FILE *fp = fopen("data.txt", "w"); if (fp == NULL) { return 1; } fputs("Hello World
", fp); fclose(fp); File: Hello World
#### 12.16 Writing Methods
File Writing │ ┌───────────┼───────────┐
   ↓
fputc() fputs() fprintf() Character String Formatted


#### 12.17 Reading from a File — fgetc()
fgetc() reads one character from a file stream. Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    FILE *fp = fopen("data.txt", "r");
    if (fp == NULL) {
        return 1;
    }
    int ch;
    while ((ch = fgetc(fp)) != EOF) {
        putchar(ch);
    }
    fclose(fp);
    return 0;
}
\`\`\`
Important Use an int for the result of fgetc() so it can represent every possible unsigned character value as well as EOF.
#### 12.18 EOF
EOF means End Of File . It is a special negative integer constant returned by input functions such as fgetc() when no more characters are available. Typical pattern:


int ch; while ((ch = fgetc(fp)) != EOF) { ... }
#### 12.19 Reading a String — fgets()
fgets() can read a line from a file.
char line[100]; if (fgets(line, sizeof line, fp) != NULL) { printf("%s", line); }
It reads at most: sizeof(line) - 1 characters and adds '\0' if successful.
#### 12.20 Reading Methods
File Reading │ ┌───────────┼───────────┐
   ↓
fgetc() fgets() fscanf() Character String Formatted
#### 12.21 fscanf()
fscanf() reads formatted input from a file stream. Example file:


101 95 Program:
\`\`\`c
#include <stdio.h>


int main(void) {
    FILE *fp = fopen("marks.txt", "r");
    if (fp == NULL) {
        return 1;
    }
    int roll;
    int marks;
    if (fscanf(fp, "%d %d", &roll, &marks) == 2) {
        printf("Roll = %d
", roll);
        printf("Marks = %d
", marks);
    }
    fclose(fp);
    return 0;
}
\`\`\`
#### 12.22 File Writing Flowchart
START
   ↓
Open File "w"
   ↓
File opened? ↙ ↘ NO YES
   ↓
Error Write Data
   ↓
END Close File
   ↓
END


#### 12.23 File Reading Flowchart
START
   ↓
Open File "r"
   ↓
File opened? ↙ ↘ NO YES
   ↓
Error Read Data
   ↓
END EOF reached? ↙ ↘ NO YES
   ↓
Continue Close
   ↓
END
#### 12.24 Append Data to a File
\`\`\`c
#include <stdio.h>


int main(void) {
    FILE *fp = fopen("data.txt", "a");
    if (fp == NULL) {
        return 1;
    }
    fprintf(fp, "New record
");
    fclose(fp);
    return 0;
}
\`\`\`
Existing content remains, and the new output is appended.


#### 12.25 Text Files vs Binary Files
Text File Stores data in a human-readable representation. Example: 101 Prasanna 90 Common extension: .txt Binary File Stores data as binary bytes according to the representation written by the program. Common extension: .dat Binary files are not necessarily human-readable.
#### 12.26 Binary File Functions
Two important functions: fread() fwrite() Example: fwrite(&value, sizeof value, 1, fp); Reading: fread(&value, sizeof value, 1, fp);
#### 12.27 fwrite() Example
\`\`\`c
#include <stdio.h>
\`\`\`


\`\`\`c
int main(void) {
    FILE *fp = fopen("data.dat", "wb");
    if (fp == NULL) {
        return 1;
    }
    int value = 100;
    fwrite(&value, sizeof value, 1, fp);
    fclose(fp);
    return 0;
}
\`\`\`
#### 12.28 fread() Example
\`\`\`c
#include <stdio.h>


int main(void) {
    FILE *fp = fopen("data.dat", "rb");
    if (fp == NULL) {
        return 1;
    }
    int value;
    if (fread(&value, sizeof value, 1, fp) == 1) {
        printf("Value = %d
", value);
    }
    fclose(fp);
    return 0;
}
\`\`\`


#### 12.29 File Position
C maintains a current position in a file stream. Important functions: fseek() ftell() rewind()
#### 12.30 ftell()
ftell() reports the current file position for a stream. Example: long position = ftell(fp); Always check for errors where appropriate.
#### 12.31 fseek()
fseek() changes the file position. Syntax: fseek(fp, offset, origin); Common origins: SEEK_SET → Beginning SEEK_CUR → Current position SEEK_END → End Example: fseek(fp, 0, SEEK_END); This moves to the end of the stream for streams where that operation is meaningful.


#### 12.32 rewind()
rewind() moves the file position back to the beginning. rewind(fp); It also clears the stream's error and EOF indicators.
#### 12.33 File Position Flow
Beginning
   ↓
Read
   ↓
Position moves forward
   ↓
fseek()
   ↓
New Position
   ↓
Read/Write
#### 12.34 Error Handling
Always verify file operations. Example: FILE *fp = fopen("data.txt", "r"); if (fp == NULL) { perror("data.txt"); return 1; } perror() prints a message describing the last library/system error associated with errno.


#### 12.35 feof()
feof() checks whether the EOF indicator is set for a stream. However, don't use: while (!feof(fp)) as the primary pattern for reading characters. Instead, use the return value of the actual input operation:
int ch; while ((ch = fgetc(fp)) != EOF) { ... }
This is an important interview point.
#### 12.36 Practical Program: Copy One File
to Another
\`\`\`c
#include <stdio.h>


int main(void) {
    FILE *source = fopen("source.txt", "r");
    FILE *destination = fopen("destination.txt", "w");
    if (source == NULL || destination == NULL) {
        if (source != NULL) fclose(source);
        if (destination != NULL) fclose(destination);
        return 1;
    }
    int ch;
\`\`\`


while ((ch = fgetc(source)) != EOF) { fputc(ch, destination); } fclose(source); fclose(destination); return 0; }
Flow: Source File
   ↓
Read Character
   ↓
Write Character
   ↓
Destination File
#### 12.37 Practical Program: Count
Characters
\`\`\`c
#include <stdio.h>


int main(void) {
    FILE *fp = fopen("data.txt", "r");
    if (fp == NULL) {
        return 1;
    }
    long count = 0;
    int ch;
    while ((ch = fgetc(fp)) != EOF) {
        count++;
    }
    printf("Characters = %ld
", count);
\`\`\`


fclose(fp); return 0; }
#### 12.38 File Handling Best Practices
- Always check whether fopen() succeeded.
- Close files after use.
- Use the correct mode.
- Don't use "w" if you need to preserve existing contents.
- Use fgets() for bounded line input.
- Check return values from file operations.
- Use int for fgetc() results.
- Handle errors properly.
#### 12.39 Common Mistakes
Mistake 1 FILE *fp = fopen("data.txt", "r"); fprintf(fp, "Hello");
❌ Wrong because "r" is a read mode. Use: FILE *fp = fopen("data.txt", "w"); or another appropriate writing mode.
Mistake 2


Forgetting: fclose(fp); This can cause resource leaks and may prevent buffered output from being properly finalized.
Mistake 3
Using "w" accidentally: fopen("data.txt", "w"); This truncates an existing file.
Mistake 4
Using: while (!feof(fp)) as the main reading condition. Prefer checking the actual input operation.
#### 12.40 Important Functions
Function Purpose fopen() Open file fclose() Close file fgetc() Read character fputc() Write character fgets() Read string/line fputs() Write string


fscanf() Read formatted data fprintf() Write formatted data fread() Read binary data fwrite() Write binary data fseek() Change file position ftell() Get file position rewind() Move to beginning perror() Display error description
#### 12.41 Interview Questions
- **Q1. What is file handling?**
  **Answer**: It is the process of reading, writing, and managing persistent data stored in files.
- **Q2. What is FILE *?**
  **Answer**: It is a pointer to a FILE object representing a C stream.
- **Q3. Difference between "r" and "w"?**
  **Answer**: "r" opens an existing file for reading; "w" opens for writing and truncates an existing file.
- **Q4. Difference between "w" and "a"?**
  **Answer**: "w" overwrites/truncates existing content; "a" preserves existing content and writes at the
end.
- **Q5. What does fclose() do?**
  **Answer**: It closes the stream and releases associated resources.
- **Q6. What is EOF?**
  **Answer**: It is a special value used by input functions to indicate that no more input is available.
- **Q7. What is the difference between fgetc() and fgets()?**
  **Answer**: fgetc() reads one character; fgets() reads a line/string into a character array with a
specified limit.
- **Q8. What are fread() and fwrite()?**
  **Answer**: They perform binary-oriented block input and output.
- **Q9. What is fseek()?**
  **Answer**: It changes the current position in a file stream.
- **Q10. Why shouldn't we use while (!feof(fp)) for reading?**
  **Answer**: Because EOF is only set after an input operation attempts to read past the available data.
The input function's
return
value should control the loop.#### 12.42 Practical Lab
1. Create and write a text file.
2. Read and display a file.
3. Append data to a file.
4. Count characters in a file.
5. Count lines in a file.
6. Count words in a file.
7. Copy one file into another.
8. Search for a word in a file.
9. Store student records in a file.
10. Read student records from a file.
11. Write and read binary data using fwrite() and fread().
12. Experiment with fseek() and ftell().
🎯 Module 12 Quick Revision
FILE HANDLING
`,13:`


fopen()
   ↓
Check for NULL
   ↓
┌───────────┼───────────┐
   ↓
Read Write Append
   ↓
fgetc() fputc() fputs() fgets() fputs() fprintf() fscanf() fprintf() └───────────┼───────────┘
   ↓
fclose()
- Must Remember fopen() → Open fclose() → Close fgetc() → Read character fputc() → Write character fgets() → Read line fputs() → Write string fscanf() → Read formatted data fprintf()→ Write formatted data fread() → Read binary block fwrite() → Write binary block fseek() → Change position ftell() → Get position rewind() → Go to beginning
### Module 13: Preprocessor, Header Files &
Macros The C preprocessor works before the actual compilation of C source code. It handles directives such as
\`\`\`c
#include, #define, and conditional-compilation directives.
\`\`\`


#### 13.1 Learning Objectives
You will learn:
- What the C preprocessor is.
- Preprocessor directives.
- #include
- #define
- Object-like and function-like macros.
- Macro pitfalls.
- Header files.
- Conditional compilation.
- #if, #ifdef, #ifndef, #else, #elif, #endif.
- Include guards.
- #undef.
- Compilation stages.
- Difference between macros and functions.
#### 13.2 What is the C Preprocessor?
The preprocessor processes source code before the compiler translates it into
machine-oriented code. Basic conceptual flow: C Source Code
   ↓
Preprocessor
   ↓
Expanded Source
   ↓
Compiler
   ↓
Object Code
   ↓
Linker
   ↓
Executable
#### 13.3 What is a Preprocessor Directive?


Preprocessor directives begin with #. Examples:
\`\`\`c
#include <stdio.h>
#define PI 3

.14159 #ifdef DEBUG #endif
\`\`\`
They are instructions to the preprocessor rather than ordinary C statements.
#### 13.4 #include
\`\`\`c
#include tells the preprocessor to include the contents of another file.
\`\`\`
Example:
\`\`\`c
#include <stdio.h>
\`\`\`
This makes declarations from the standard I/O header available to your source file.
#### 13.5 Two Common Forms of #include
1. System-style header #include <stdio.h>
Typically searches implementation-defined system include locations.
2. User/project header #include "student.h"
Typically searches the source/project include locations first, followed by
implementation-defined include paths. Exact search behavior is compiler-dependent.
#### 13.6 Why Header Files?


Header files commonly contain:
- Function declarations.
- Type definitions.
- Structure declarations.
- Macro definitions.
- Constants.
- Declarations required by multiple source files.
Example: project/ │ ├── main.c ├── student.c └── student.h Conceptually: student.h
   ↓
Declarations student.c
   ↓
Definitions main.c
   ↓
Uses them
#### 13.7 Creating Your Own Header
math_utils.h #ifndef MATH_UTILS_H #define MATH_UTILS_H int add(int a, int b); int square(int n); #endif
math_utils.c #include "math_utils.h"


int add(int a, int b) { return a + b; } int square(int n) { return n * n; }
main.c #include <stdio.h> #include "math_utils.h" int main(void) { printf("%d
", add(10, 20)); printf("%d
", square(5)); return 0; }
This demonstrates basic modular program organization.
#### 13.8 #define
#define creates a macro. Example: #define PI 3.14159 Then:
double area = PI * r * r;
The preprocessor substitutes the macro according to its rules before compilation.
#### 13.9 Object-Like Macro
A macro without parameters:


#define MAX_SIZE 100 Example:
int values[MAX_SIZE];
Other examples: #define BUFFER_SIZE 1024 #define COMPANY_NAME "ABC" #define DEBUG 1
#### 13.10 Function-Like Macro
A macro can accept arguments. #define SQUARE(x) ((x) * (x)) Usage:
int result = SQUARE(5);
Conceptually expands to:
int result = ((5) * (5));
#### 13.11 Why Parentheses Matter in Macros
Bad: #define SQUARE(x) x * x Then: SQUARE(2 + 3) can expand to: 2 + 3 * 2 + 3 which does not mean: (2 + 3) * (2 + 3) Better:


#define SQUARE(x) ((x) * (x))
#### 13.12 Macro Side Effects
Even a carefully parenthesized macro can evaluate its argument more than once.
For example: #define SQUARE(x) ((x) * (x)) Then: SQUARE(i++) may evaluate i++ twice. This is dangerous and can produce unintended behavior. For general computation, a function is often safer:
int square(int x) { return x * x; }
#### 13.13 Macro vs Function
Macro Function Preprocessor substitution Compiler-level function No function-call semantics Has normal function-call semantics Type checking is different Parameters have declared types Can have multiple evaluation issues Arguments are evaluated once per parameter occurrence in the call Useful for conditional compilation/constants Preferred for ordinary reusable computation Modern C programming generally favors functions when a macro is not specifically needed.


#### 13.14 #undef
#undef removes a macro definition. Example: #define SIZE 100 #undef SIZE After #undef, the macro SIZE is no longer defined.
#### 13.15 Conditional Compilation
Conditional compilation allows selected parts of source code to be included or excluded
before compilation. Important directives: #if #ifdef #ifndef #elif #else #endif
#### 13.16 #ifdef
#ifdef checks whether a macro is defined. Example: #define DEBUG #ifdef DEBUG printf("Debug mode
"); #endif Because DEBUG is defined, the code inside is included.


#### 13.17 #ifndef
#ifndef means: If this macro is not defined . Example: #ifndef VERSION #define VERSION 1 #endif This is also commonly used in header guards.
#### 13.18 #if
#if evaluates a preprocessor constant expression. Example: #define VERSION 2 #if VERSION == 2 printf("Version 2
"); #endif
#### 13.19 #else and #elif
Example: #if VERSION == 1 printf("Version 1"); #elif VERSION == 2 printf("Version 2"); #else printf("Unknown Version"); #endif Flow: #if


Condition? ↙ ↘ TRUE FALSE
   ↓
Block #elif/#else
   ↓
Block
#### 13.20 Include Guards
When a header is included multiple times, duplicate declarations can cause problems.
An include guard prevents the contents from being processed more than once per
translation unit. Example: #ifndef STUDENT_H #define STUDENT_H struct Student { int roll; float marks; }; #endif Flow: Header included
   ↓
STUDENT_H defined? ↙ ↘ YES NO
   ↓
Skip Define contents STUDENT_H
   ↓
Include contents


#### 13.21 #pragma once
Many compilers support: #pragma once as an alternative way to prevent repeated inclusion of a header. However, #pragma once is not part of the ISO C standard itself, while traditional include guards are standard preprocessor techniques. For portable C, include guards are a dependable choice.
#### 13.22 Predefined Macros
C implementations provide predefined macros. Common examples include: __FILE__ __LINE__ __DATE__ __TIME__ Example:
printf("File: %s
", __FILE__); printf("Line: %d
", __LINE__);
These can be useful for diagnostics.
#### 13.23 __FILE__ and __LINE__
Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    printf("File: %s
", __FILE__);
    printf("Line: %d
", __LINE__);
\`\`\`


return 0; }
Conceptually: __FILE__ → source-file name __LINE__ → current source line number
#### 13.24 Debugging with Conditional
Compilation You can create a debug macro: #define DEBUG Then: #ifdef DEBUG printf("Debug: value = %d
", value); #endif When DEBUG is not defined, the debugging code is excluded during preprocessing.
#### 13.25 Header File Organization
Professional projects commonly separate interfaces from implementations.
Project │ ├── main.c │ ├── calculator.c │ └── calculator.h calculator.h #ifndef CALCULATOR_H #define CALCULATOR_H int add(int a, int b);


int subtract(int a, int b); #endif
calculator.c #include "calculator.h" int add(int a, int b) { return a + b; } int subtract(int a, int b) { return a - b; }
main.c #include <stdio.h> #include "calculator.h" int main(void) { printf("%d
", add(20, 10)); printf("%d
", subtract(20, 10)); return 0; }
This is the foundation of multi-file C programming .
#### 13.26 Compilation Stages
A simplified C build process: source.c
   ↓
PREPROCESSING
   ↓
Expanded source code
   ↓
COMPILATION


Object file
   ↓
LINKING
   ↓
Executable Preprocessing Handles:
\`\`\`c
#include #define #ifdef #ifndef #if
\`\`\`
Compilation Translates C source into an object representation. Linking Combines object files and required libraries into an executable.
#### 13.27 Compilation Flowchart

![C Preprocessor Directives](/assets/images/c_preprocessor.png)


C Source Code
   ↓
Preprocessor
   ↓
Expanded Code
   ↓
Compiler
   ↓
Object File
   ↓
Linker
   ↓
Executable
   ↓
Program


#### 13.28 Common Mistakes
Mistake 1: Missing Header
Using declarations without including the appropriate header can lead to compilation
problems or incorrect assumptions.
Mistake 2: Bad Macro
Avoid: #define SQUARE(x) x*x Prefer: #define SQUARE(x) ((x) * (x)) But remember that even the improved macro can evaluate x more than once.
Mistake 3: Forgetting Include Guards
A reusable project header should generally protect itself against repeated inclusion.
Mistake 4: Using Macros for Everything
Not every constant or computation needs a macro. For typed constants and calculations, other C mechanisms may be clearer.
#### 13.29 Important Preprocessor Directives
Directive Purpose
\`\`\`c
#include
\`\`\`
Include header/source content #define Define macro


#undef Remove macro definition #ifdef Test whether macro is defined #ifndef Test whether macro is not defined #if Conditional compilation #elif Additional condition #else Alternative branch #endif End conditional section
#### 13.30 Interview Questions
- **Q1. What is a preprocessor?**
  **Answer**: A tool that processes C source code before compilation.
- **Q2. What is #include?**
  **Answer**: A preprocessing directive used to include another file's contents.
- **Q3. What is #define?**
  **Answer**: It defines a macro.
- **Q4. What is an include guard?**
  **Answer**: A preprocessor technique that prevents a header's contents from being processed multiple
times in one translation unit.
- **Q5. What is the difference between #ifdef and #ifndef?**
  **Answer**: #ifdef → macro IS defined #ifndef → macro IS NOT defined
- **Q6. What is conditional compilation?**
  **Answer**: Selecting source sections for compilation based on preprocessor conditions.
- **Q7. Why are parentheses important in macros?**
  **Answer**: They help prevent operator-precedence problems during textual substitution.
- **Q8. What is a major danger of function-like macros?**
  **Answer**: Arguments can be evaluated multiple times.
- **Q9. What is the difference between a macro and a function?**
  **Answer**: A macro is processed by the preprocessor, while a function is handled by the compiler as a
normal callable function.
- **Q10. What happens after preprocessing?**
  **Answer**: Conceptually, the compiler processes the resulting translation unit, followed by
assembly/object generation and linking.#### 13.31 Practical Lab
- **Task 1**: Create a macro: #define PI 3.14159 and calculate the area of a circle.
- **Task 2**: Create a function-like macro for finding the maximum of two values.
- **Task 3**: Create a header file containing arithmetic function declarations.
- **Task 4**: Create .c and .h files for a calculator.
- **Task 5**: Use #ifdef DEBUG to create debug output.
Task 6
`,14:`


Create an include guard for your own header.
Task 7
Experiment with __FILE__ and __LINE__.
Task 8
Compile a multi-file C program and understand the preprocessing, compilation, and linking
stages. 🎯 Module 13 Quick Revision PREPROCESSOR
   ↓
┌───────────┼───────────┐
   ↓
#include #define Conditional Compilation
   ↓
Headers Macros #if/#ifdef Must Remember #include → Include header #define → Define macro #undef → Remove macro #ifdef → If defined #ifndef → If not defined #if → Conditional compilation #else → Alternative #elif → Another condition #endif → End condition
### Module 14: Storage Classes, Scope,
Lifetime & Linkage This module explains where variables can be accessed, how long they exist, and how they are connected across functions and source files .


#### 14.1 Learning Objectives
You will learn:
- Scope
- Lifetime / storage duration
- Linkage
- auto
- static
- extern
- register
- Local and global variables
- Static local variables
- Static global variables
- External variables
- Multi-file programs
- Common interview questions
#### 14.2 What is a Storage Class?
A storage-class specifier helps describe properties of an identifier such as its storage
duration, scope, and linkage . Common storage-class specifiers include: auto static extern register In modern C, the exact meaning depends on where the specifier is used. Don't think of these merely as "where the variable is stored."
#### 14.3 Three Important Concepts
Before learning storage classes, understand these three terms.
1. Scope
Where can I access this name?


2. Storage Duration
How long does the object exist?
3. Linkage
Can the same identifier refer to the same entity across different scopes or source
files? Remember: Scope → Where? Duration → How long? Linkage → Connected to what?
#### 14.4 Scope
Scope determines the region of source code where an identifier can be referred to.
Common scopes include: Block scope Function scope Function prototype scope File scope
#### 14.5 Block Scope
A variable declared inside a block has block scope. Example:
\`\`\`c
#include <stdio.h>


int main(void) {
    int x = 10; {
        int y = 20;
        printf("%d %d
", x, y);
    }
\`\`\`


printf("%d
", x); return 0; }
y cannot be referred to outside its block. Conceptually: main() │ ├── x │ └── inner block └── y
#### 14.6 File Scope
An identifier declared outside all functions generally has file scope.
Example:
int count = 10; void display(void) { printf("%d", count); } int main(void) { display(); }
count has file scope.
#### 14.7 Function Scope
Function scope applies specifically to labels used with goto.
Example: void test(void)


{ goto end; end: printf("Done"); } The label end has function scope. This is a more advanced distinction but is useful for understanding C terminology.
#### 14.8 Function Prototype Scope
Parameter names appearing only in a function prototype have prototype scope.
Example:
int add(int a, int b);
The names a and b are meaningful only within that prototype. You can also write:
int add(int, int);
#### 14.9 Storage Duration
Storage duration describes how long an object exists. The important categories are: Automatic Static Allocated Automatic Usually local variables whose lifetime begins when execution enters their block and ends when the block is left. Static Objects with static storage duration exist for the entire execution of the program.


Allocated Objects created dynamically using functions such as malloc() exist until explicitly released with free().
#### 14.10 auto
auto specifies automatic storage duration for a block-scope variable.
Example: void test(void) { auto int x = 10; printf("%d", x); } In ordinary C programming, auto is rarely written explicitly because block-scope variables are automatic by default unless another storage-class rule applies. So:
int x = 10;
inside a function is normally sufficient.
#### 14.11 static Local Variable
A local variable declared static has:
- Block scope
- Static storage duration
- Its value persists between function calls
Example:
\`\`\`c
#include <stdio.h>

void counter(void) {
\`\`\`


static int count = 0; count++; printf("%d
", count); } int main(void) { counter(); counter(); counter(); return 0; }

**Output:**

1 2 3
#### 14.12 Normal Local vs Static Local
Normal local: void test(void) { int x = 0; x++; printf("%d
", x); } Calling repeatedly: 1 1 1 Static local: void test(void) { static int x = 0; x++; printf("%d
", x);


} Calling repeatedly: 1 2 3
#### 14.13 Static Local Flowchart

![C Data Structures](/assets/images/c_data_structures.png)


Function Call
   ↓
Static variable already initialized? ↙ ↘ YES NO
   ↓
Keep old value Initialize └──────┬────────┘
   ↓
Update
   ↓
Return
   ↓
Value is preserved
#### 14.14 Why Use Static Local Variables?
They are useful when a function needs to remember state between calls without exposing
that variable to other functions. Examples:
- Counters
- Caching state
- Function-call tracking
- Persistent internal state
#### 14.15 Static at File Scope


static at file scope gives an identifier internal linkage . Example: static int count = 10; This identifier can be referred to within that source file, but it is not available for external linkage from another translation unit. This is useful for hiding implementation details.
#### 14.16 Example: File-Private Function
static void helper(void) { printf("Internal helper"); } The function has internal linkage. Another source file cannot use that function through external linkage.
#### 14.17 Internal Linkage
Think of: static at file scope
   ↓
Internal linkage
   ↓
Accessible within that translation unit This is an important concept in professional multi-file C programming.
#### 14.18 extern
extern declares an identifier whose definition is provided elsewhere.
Example:


main.c #include <stdio.h> extern int count; int main(void) { printf("%d", count); return 0; }
data.c int count = 100; The declaration in main.c refers to the definition in another translation unit.
#### 14.19 extern Flow
data.c │ └── int count = 100; │
   ↓
Linker connects ↑ │ main.c │ └── extern int count;
#### 14.20 Definition vs Declaration
This is an important concept. Definition Creates an object or function.
int count = 100;


Declaration Tells the compiler about an existing entity. extern int count; For functions:
int add(int, int);
is a declaration/prototype, while the function body is the definition.
#### 14.21 register
register requests that an object be stored in a processor register if possible.
Example: register int i; However, the compiler is free to ignore the request. Modern optimizing compilers generally make their own register-allocation decisions. So register is rarely useful in modern C.
#### 14.22 Important Restriction with register
Historically, the language places restrictions around taking the address of an object declared
with register. For example: register int x = 10; You should not write: &x because the language does not permit taking the address of a register object.


#### 14.23 Storage Class Comparison
Specifier Typical Context Key Idea auto Block scope Automatic storage duration static Block/file scope Persistent lifetime or internal linkage extern File/block declarations Refers to entity defined elsewhere register Block/function parameters Request register storage; usually ignored
#### 14.24 Storage Duration Comparison
STORAGE DURATION │ ┌────────────┼────────────┐
   ↓
Automatic Static Allocated │ │ │ Block lifetime Program malloc/calloc lifetime
   ↓
free()
#### 14.25 Scope vs Lifetime
These are not the same thing . Consider: void counter(void) { static int count = 0; count++; } count has:


Scope: Block scope Lifetime: Entire program execution So even though you can only name it inside counter(), the object itself persists between calls.
#### 14.26 Scope vs Linkage
Consider: static int value; At file scope: Scope → File scope Linkage → Internal linkage Duration → Static These describe different properties.
#### 14.27 Global Variable
A variable defined outside functions has file scope. Example:
int total = 0; void add(void) { total++; }
Such an object has static storage duration. If defined without static, it normally has external linkage unless another rule applies.


#### 14.28 Static Global Variable
static int total = 0; This has: File scope Static storage duration Internal linkage It can be used by functions in that translation unit, but not referenced from another translation unit through external linkage.
#### 14.29 Initialization of Static Variables
Objects with static storage duration are initialized before program startup.
If you do not provide an initializer, they are initialized appropriately to zero/null values.
Example: static int count; is initialized to: 0 Similarly: static char text[10]; has all elements initialized to zero.
#### 14.30 Automatic Variable Initialization
Automatic variables are not automatically initialized to zero .
Example: void test(void) { int x;


printf("%d", x); }
Using x before assigning it a valid value is erroneous because its value is indeterminate.
Correct:
int x = 0;
#### 14.31 Important Comparison
Automatic variable
   ↓
No automatic zero initialization
   ↓
Initialize before reading Static-storage object
   ↓
Initialized before program execution
   ↓
No explicit initializer → zero/null initialization
#### 14.32 Multi-File C Program
Professional C applications are usually divided into multiple files.
Example: project/ │ ├── main.c ├── calculator.c └── calculator.h calculator.h #ifndef CALCULATOR_H #define CALCULATOR_H int add(int a, int b); #endif calculator.c


\`\`\`c
#include "calculator.h" int add(int a, int b) {
    return a + b;
}
\`\`\`
main.c #include <stdio.h> #include "calculator.h" int main(void) { printf("%d", add(10, 20)); return 0; }
#### 14.33 Why static Matters in Multi-File
Programs Suppose: static void helper(void) { ... } in calculator.c. That helper is intended to be private to that translation unit. This provides encapsulation at the source-file level . Conceptually: calculator.c │ ├── public_function() │ └── static helper()
   ↓
private implementation


#### 14.34 extern vs static
Very important: extern
   ↓
External linkage / refer to externally defined entity while: static at file scope
   ↓
Internal linkage So: extern → Can refer across translation units static → Restricted to current translation unit
#### 14.35 Example
data.c int public_value = 100; static int private_value = 200;
main.c extern int public_value; public_value can be referred to from main.c. But: extern int private_value; cannot successfully refer to the file-scope static object from another translation unit because private_value has internal linkage.
#### 14.36 Common Mistakes


Mistake 1: Thinking static always means "global"
Wrong. static can be used at block scope as well: void test(void) { static int count; } Here it is a local name with persistent storage duration.
Mistake 2: Thinking extern creates the variable
Usually: extern int count; is a declaration, not a definition. The actual definition might be:
int count = 100;
in another source file.
Mistake 3: Reading an Uninitialized Automatic Variable int x; printf("%d", x);
Don't do this. Initialize it:
int x = 0;
Mistake 4: Assuming register Guarantees a CPU Register
It doesn't. The compiler decides how to allocate storage.


#### 14.37 Interview Questions
- **Q1. What is a storage class?**
  **Answer**: A storage-class specifier helps specify properties such as storage duration, scope, and
linkage.
- **Q2. What does static mean for a local variable?**
  **Answer**: It gives the object static storage duration while retaining block scope.
- **Q3. What does static mean at file scope?**
  **Answer**: It gives the identifier internal linkage.
- **Q4. What is extern?**
  **Answer**: It declares an identifier that can refer to a definition with external linkage, often in another
source file.
- **Q5. What is register?**
  **Answer**: It is a storage-class specifier that requests register storage, but the compiler may ignore the
request.
- **Q6. What is scope?**
  **Answer**: The region of source code where an identifier can be referred to.
- **Q7. What is storage duration?**
  **Answer**: The period during program execution for which an object exists.
- **Q8. What is linkage?**
  **Answer**: It determines whether declarations of the same identifier can refer to the same entity across
scopes or translation units.
- **Q9. Difference between local and static local variables?**
  **Answer**: A normal local automatic variable gets a new lifetime on each block entry, while a static local
object persists for the entire program execution.
- **Q10. Why is static useful in multi-file programs?**
  **Answer**: It allows implementation details to remain private to a translation unit.#### 14.38 Practical Lab
- **Task 1**: Write a program demonstrating a normal local variable.
- **Task 2**: Create a static local counter.
- **Task 3**: Create a global variable and access it from multiple functions.
- **Task 4**: Create a static file-scope variable.
- **Task 5**: Create two .c files and use extern to share a variable.
- **Task 6**: Create a private static helper function in one source file.
- **Task 7**: Experiment with automatic and static initialization.
#### 14.39 Quick Revision
SCOPE
   ↓
Where can I use the name? STORAGE DURATION


How long does the object exist? LINKAGE
   ↓
Can declarations refer to the same entity?
Storage Classes auto
   ↓
Automatic storage duration static
   ↓
Persistent lifetime OR Internal linkage at file scope extern
   ↓
Refers to externally defined entity register
   ↓
Request register storage
🎯 Module 14 Key Takeaway
Remember this table: Concept Remember auto Automatic storage duration Local static Block scope + program lifetime File-scope static Internal linkage extern Declaration referring to external entity register Register-storage request Scope Where name is visible
`,15:`


Duration How long object exists Linkage Whether declarations can refer to same entity
### Module 15: Advanced C Concepts &
Final Revision
#### 15.1 Learning Objectives
By the end of this module, you will understand:
- Command-line arguments
- Function pointers
- void * pointers
- Bitwise operators
- const
- volatile
- assert()
- sizeof
- typedef
- Common undefined-behavior cases
- C programming best practices
- Final interview revision
#### 15.2 Command-Line Arguments
Command-line arguments allow values to be passed to a program when it starts.
The standard form of main() is:
\`\`\`c
int main(int argc, char *argv[])
\`\`\`
argc argc means argument count . argv


argv means argument vector . It is an array of pointers to strings containing the arguments.
#### 15.3 Command-Line Example #include <stdio.h> int main(int argc, char *argv[]) { printf("Argument count = %d
", argc); for (int i = 0; i < argc; i++) { printf("Argument %d: %s
", i, argv[i]); } return 0; }
If executed conceptually as: program.exe Hello 123 You might see: Argument count = 3 Argument 0: program.exe Argument 1: Hello Argument 2: 123
#### 15.4 Command-Line Flowchart

![C Advanced Concepts](/assets/images/c_advanced_concepts.png)


\`\`\`text
┌───────────────────┐
│       START       │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│  Program starts   │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│ Receive argc/argv │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│ Process arguments │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│  Execute program  │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│        END        │
└───────────────────┘
\`\`\`


#### 15.5 Function Pointers
A function pointer is a pointer that stores the address of a function.
Example:
int add(int a, int b) { return a + b; }
Function pointer:
int (*operation)(int, int);
Assign: operation = add; Call:
printf("%d", operation(10, 20));

**Output:**

30
#### 15.6 Function Pointer Structure
Function
   ↓
Address of Function
   ↓
Function Pointer
   ↓
Call Function
Example:
int (*operation)(int, int);
Breakdown:
int → return type


(*operation) → pointer name (int,int) → parameter types
#### 15.7 Function Pointer Example
\`\`\`c
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main(void) {
    int (*fp)(int, int) = add;
    printf("%d", fp(10, 20));
    return 0;
}
\`\`\`

**Output:**

30
#### 15.8 Why Function Pointers Are
Important They are used for:
- Callbacks
- Sorting functions
- Event handlers
- Menu systems
- State machines
- Generic algorithms
- Function dispatch tables
A famous example is the standard library's qsort() function, which accepts a comparison
function.


#### 15.9 void * Pointer
A void * is a pointer to an object type without a specific pointed-to type.
Example:
int x = 10; void *p = &x;
To access the integer through p, convert it to an appropriate pointer type:
printf("%d", *(int *)p);
#### 15.10 Why void * Is Useful
void * is useful when writing generic code. For example: void *data; can point to objects of different types. The programmer must know the actual object type before dereferencing it.
#### 15.11 Important Restriction
You cannot directly dereference a void * in standard C. Incorrect: *p when p has type void *. Instead: *(int *)p if p actually points to an int.


#### 15.12 Bitwise Operators
Bitwise operators work on individual bits of integer types. Important operators: & AND | OR ^ XOR ~ NOT << Left shift >> Right shift
#### 15.13 Bitwise AND &
Example: 5 = 0101 3 = 0011 ------------ & = 0001 Therefore: 5 & 3 = 1
#### 15.14 Bitwise OR |
5 = 0101 3 = 0011 ----------- | = 0111 Therefore: 5 | 3 = 7


#### 15.15 Bitwise XOR ^
XOR gives 1 when the corresponding bits are different. 5 = 0101 3 = 0011 ----------- ^ = 0110 Therefore: 5 ^ 3 = 6
#### 15.16 Bitwise NOT ~
~ flips each bit of its operand. Example: unsigned int x = 5; unsigned int result = ~x; The exact decimal result depends on the width of unsigned int.
#### 15.17 Left Shift <<
Example: unsigned int x = 5; x << 1 Conceptually: 0101 → 1010 For unsigned values, left shifting by a valid amount corresponds to multiplication by a power of two when the result remains representable.


#### 15.18 Right Shift >>
Example: unsigned int x = 8; x >> 1 Conceptually: 1000 → 0100 Result: 4 For signed negative values, right-shift behavior is implementation-defined, so use unsigned integers when you need predictable bit-level behavior.
#### 15.19 Bitwise Operator Table
Operator Operation & AND | OR ^ XOR ~ NOT << Left shift >> Right shift
#### 15.20 Bit Masking
Bitwise operations are often used to test or modify individual bits.
Example: unsigned int flags = 5;


Binary: 0101 To test the lowest bit: if (flags & 1) { printf("Bit is set"); } This technique is common in:
- Embedded systems
- Operating systems
- Device drivers
- Permissions/flags
- Networking
#### 15.21 Setting a Bit
Suppose: unsigned int flags = 0; To set bit 2: flags |= (1u << 2); Conceptually: 0000
   ↓
0100
#### 15.22 Clearing a Bit
To clear bit 2: flags &= ~(1u << 2);


#### 15.23 Toggling a Bit
To toggle bit 2: flags ^= (1u << 2);
#### 15.24 Checking a Bit
if (flags & (1u << 2)) { printf("Set"); } This is an important practical bit-manipulation technique.
#### 15.25 const
const means that an object should not be modified through a particular
identifier/expression. Example: const int x = 10; You should not do: x = 20;
#### 15.26 Pointer and const
Pointer to constant data const int *p; You cannot modify the pointed-to int through p. Constant pointer int *const p = &x;


The pointer itself cannot be changed after initialization. Both constant const int *const p = &x; Neither the pointer nor the pointed-to object can be modified through p.
#### 15.27 const Example
int x = 10; const int *p = &x; /* *p = 20; */ // Not allowed through p x = 20; // x itself is not const
This distinction is important.
#### 15.28 volatile
volatile tells the compiler that the value of an object may change for reasons outside the
normal flow of the program. Example: volatile int flag; It is relevant in areas such as:
- Hardware registers
- Embedded systems
- Memory-mapped I/O
- Certain signal-handling scenarios
volatile does not make operations atomic or provide thread synchronization.
#### 15.29 Example of volatile


Conceptually: volatile int status; A compiler should not assume that status remains unchanged between accesses merely because the current thread's code did not modify it.
#### 15.30 assert()
The assert() macro is used to check assumptions during development.
Include:
\`\`\`c
#include <assert.h>
\`\`\`
Example:
int age = 20; assert(age >= 0);
If the condition is false, the assertion typically reports diagnostic information and terminates
the program.
#### 15.31 Example
\`\`\`c
#include <stdio.h>
#include <assert.h>

int divide(int a, int b) {
    assert(b != 0);
    return a / b;
}

int main(void) {
    printf("%d", divide(10, 2));
    return 0;
}
\`\`\`



**Output:**

5 Assertions are primarily for detecting programming errors and violated assumptions during development, not for normal user-input validation.
#### 15.32 NDEBUG
Assertions can be disabled by defining NDEBUG before including <assert.h>.
Example: #define NDEBUG #include <assert.h> Then: assert(condition); is disabled.
#### 15.33 sizeof
sizeof determines the size in bytes of a type or object. Example:
int x; printf("%zu", sizeof(x));
The result is implementation-dependent.
#### 15.34 sizeof with Arrays
For an actual array object:


int a[] = {10, 20, 30, 40};
you can calculate the number of elements: size_t n = sizeof(a) / sizeof(a[0]); Result: 4 But this does not work after the array has decayed to a pointer parameter.
#### 15.35 sizeof with Pointers
int *p;
Then: sizeof(p) gives the size of the pointer, not the size of the memory block it points to. This is a common interview question.
#### 15.36 Undefined Behavior
Undefined behavior (UB) means the C standard imposes no requirements on what
happens. Examples include: Out-of-bounds access int a[5]; a[5] = 10; Use-after-free free(p); *p = 10; Dereferencing a null pointer


int *p = NULL; *p = 10;
Signed integer overflow int x = INT_MAX; x++; assuming the operation actually overflows the signed int. Undefined behavior must be taken seriously in professional C programming.
#### 15.37 Undefined Behavior Flow
Incorrect Operation
   ↓
Undefined Behavior
   ↓
No guaranteed result
   ↓
Could crash Could appear to work Could corrupt data Could behave differently after optimization
#### 15.38 Common C Programming Best
Practices
1. Initialize variables int count = 0;
2. Check pointers if (p != NULL)
3. Check allocation results if (p == NULL)
4. Free dynamic memory free(p);


5. Close files fclose(fp);
6. Avoid buffer overflows
Use bounded input functions such as: fgets()
7. Keep functions focused
One function should ideally have one clear responsibility.
#### 15.39 C Programming Architecture
A professional C project can look like: Project │ ├── include/ │ └── calculator.h │ ├── src/ │ ├── calculator.c │ └── main.c │ └── tests/ └── test_calculator.c Conceptually: \`\`\`text
┌───────────────┐
│    Header     │
└───────────────┘
        │
        ▼
┌───────────────┐
│ Declarations  │
└───────────────┘
        │
        ▼
┌───────────────┐
│ Source files  │
└───────────────┘
        │
        ▼
┌───────────────┐
│  Definitions  │
└───────────────┘
        │
        ▼
┌───────────────┐
│   Compiler    │
└───────────────┘
        │
        ▼
┌───────────────┐
│    Linker     │
└───────────────┘
        │
        ▼
┌───────────────┐
│  Executable   │
└───────────────┘
\`\`\`


#### 15.40 Complete C Learning Roadmap
You have now covered:
Module 1 → C Fundamentals Module 2 → Variables & Data Types Module 3 → Operators Module 4 → Input & Output Module 5 → Control Statements Module 6 → Functions Module 7 → Arrays Module 8 → Strings Module 9 → Pointers Module 10 → Structures, Unions & Enums Module 11 → Dynamic Memory Module 12 → File Handling Module 13 → Preprocessor & Macros Module 14 → Storage Classes Module 15 → Advanced C
#### 15.41 Most Important C Topics
For interviews and technical rounds, prioritize:
- Pointers
- Arrays
- Strings
- Functions
- Structures
- Dynamic Memory
- ☆ File Handling
- ☆ Bitwise Operations
- ☆ Preprocessor
- ☆ Storage Classes
#### 15.42 Most Important Relationships
Array + Pointer a[i]
   ↓
*(a + i)


Pointer + Function function(&x)
   ↓
pointer receives address
   ↓
*p modifies x
Structure + Pointer p
   ↓
member Dynamic Memory + Pointer malloc()
   ↓
pointer
   ↓
heap allocation
   ↓
free() File Handling fopen()
   ↓
Read/Write
   ↓
fclose()
#### 15.43 Top Interview Questions
- **Q1. Difference between array and pointer?**
  **Answer**: An array is an object containing elements, while a pointer is an object that stores an
address. An array expression often converts to a pointer to its first element, but an array and pointer are not the same type.
- **Q2. Why does scanf() use &?**
  **Answer**: For ordinary scalar variables, scanf() needs an address where it can store the input.
scanf("%d", &x);
- **Q3. What is a dangling pointer?**
  **Answer**: A pointer that refers to an object or allocated storage whose lifetime has ended.
- **Q4. What is a memory leak?**
  **Answer**: Allocated memory that is no longer reachable and therefore cannot be released normally.
- **Q5. Difference between malloc() and calloc()?**
  **Answer**: malloc() allocates uninitialized storage, while calloc() allocates storage for multiple
elements and initializes the allocated bytes to zero.
- **Q6. What is realloc()?**
  **Answer**: It attempts to resize an existing dynamically allocated memory block.
- **Q7. What is a segmentation fault?**
  **Answer**: It is a common manifestation of an invalid memory access, but the exact behavior depends
on the operating system and implementation. It is not itself the C language definition of the underlying error.
- **Q8. What is a structure?**
  **Answer**: A user-defined type that groups related members, potentially of different types.
- **Q9. What is a union?**
  **Answer**: A user-defined type whose members share storage.
- **Q10. What is recursion?**
  **Answer**: A technique in which a function calls itself, normally with a base case that terminates the
recursion.
- **Q11. What is a function pointer?**
  **Answer**: A pointer that stores the address of a function and can be used to call that function.
- **Q12. What is static?**
  **Answer**: Its meaning depends on context. At block scope, it gives static storage duration; at file
scope, it gives internal linkage.
- **Q13. What is extern?**
  **Answer**: A declaration that can refer to an entity with external linkage defined elsewhere.
- **Q14. What is volatile?**
  **Answer**: It tells the compiler that an object's value may change for reasons not captured by ordinary
program flow.
- **Q15. What is const?**
  **Answer**: It restricts modification of an object through a particular identifier/expression.#### 15.44 Final C Cheat Sheet
VARIABLE
   ↓
Stores Data ARRAY
   ↓
Collection of Same-Type Elements STRING
   ↓
Character Array + '\0'


POINTER
   ↓
Stores Address FUNCTION
   ↓
Reusable Block of Code STRUCTURE
   ↓
Groups Different Data Types UNION
   ↓
Shares Storage ENUM
   ↓
Named Integer Constants MALLOC
   ↓
Dynamic Allocation CALLOC
   ↓
Dynamic Allocation + Zeroed Bytes REALLOC
   ↓
Resize Allocation FREE
   ↓
Release Allocation FILE
   ↓
Persistent Data MACRO
   ↓
Preprocessor Substitution STATIC
   ↓
Persistent Storage / Internal Linkage


EXTERN
   ↓
External Linkage Declaration FUNCTION POINTER
   ↓
Stores Function Address
#### 15.45 Final C Programming Flow
\`\`\`text
                  ┌────────────────────────┐
                  │       C PROGRAM        │
                  └───────────┬────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     Variables            Functions           Data Types
          │                   │                   │
          ▼                   ▼                   ▼
       Arrays             Pointers           Structures
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   Memory Management    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │     File Handling      │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │  Modular Programming   │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │     Final Program      │
                  └───────────┬────────────┘
\`\`\`
🎯 Module 15 Final Takeaway
If you want to become strong in C for technical interviews , don't just memorize syntax.
Understand this chain: \`\`\`text
┌─────────────┐
│  C Syntax   │
└─────────────┘
       │
       ▼
┌─────────────┐
│    Logic    │
└─────────────┘
       │
       ▼
┌─────────────┐
│   Memory    │
└─────────────┘
       │
       ▼
┌─────────────┐
│  Pointers   │
└─────────────┘
\`\`\`


\`\`\`text
┌─────────────────┐
│ Data Structures │
─────────────────┘
         │
         ▼
┌─────────────────┐
│    Functions    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Dynamic Memory  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  File Handling  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Problem Solving │
└─────────────────┘
\`\`\`
`},o=[...e,...t,...n,...r];export{o as cCourseModules,a as cSyllabusNotes,i as createLesson};