import type { ModuleItem } from '../../contexts/CourseContext';

export const modules4to6: ModuleItem[] = [
  // ── MODULE 4: CONTROL FLOW ────────────────────────────────────────────────
  {
    id: 'c-mod-4',
    title: 'Module 4: Control Flow Structures',
    description: 'Master conditional branching (if, if-else, switch), iterative loops (for, while, do-while), jump statements (break, continue), and nested pattern algorithms.',
    duration: '4 Hours',
    topics: [
      {
        id: 'c-topic-4-1-conditionals',
        title: 'Topic 1: Conditional Statements',
        description: 'Understand if, if-else, else-if ladder, nested conditionals, and switch-case control.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-4-1-if-else-switch',
            title: 'Unit 1: Conditionals & Switch Statements',
            description: 'Master branching control structures, boolean truth evaluation, and multi-way switch-case constructs.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Write clean if, else-if, and else statements.',
              'Use switch-case with break and default clauses.',
              'Understand fall-through behavior in switch statements.'
            ],
            readingContent: `# Decision-Making in C

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
> Forgetting the \`break;\` statement at the end of a \`case\` block causes execution to "fall through" into the next case regardless of whether its condition matches. Always include \`break;\` unless intentional fall-through is required.`,
            codeExamples: [
              {
                id: 'code-m4-1',
                title: 'Menu-Driven CLI Switch Example',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    int choice = 2;\n    switch(choice) {\n        case 1: printf("Balance Inquiry\\n"); break;\n        case 2: printf("Withdraw Funds\\n"); break;\n        case 3: printf("Deposit Funds\\n"); break;\n        default: printf("Exit\\n"); break;\n    }\n    return 0;\n}`,
                explanation: 'Standard menu selector using switch-case in C.'
              }
            ],
            keyPoints: [
              'if-else evaluates boolean truth (non-zero is true, 0 is false).',
              'switch expression must evaluate to integer or char constant.',
              'break prevents fall-through to subsequent case blocks.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m4-1',
                question: 'Can you use a float or double variable in a switch statement condition in C?',
                answer: 'No, switch statements in C strictly require integral types (int, char, enum).',
                explanation: 'Floating-point numbers cannot be exactly matched against discrete case constants due to precision representation.',
                difficulty: 'Medium'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m4-1',
                title: 'C Statements & Branching Reference',
                url: 'https://en.cppreference.com/w/c/language/if',
                description: 'ISO C reference on if, else, and switch branching mechanics.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-4-2-loops-patterns',
        title: 'Topic 2: Loops, Jump Statements & Patterns',
        description: 'Master for, while, do-while loops, break, continue, and nested pattern printing algorithms.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-4-2-loops-and-patterns',
            title: 'Unit 2: Loops & Pattern Generation',
            description: 'Master for, while, do-while iteration, loop control keywords, and 2D nested loop patterns.',
            duration: '30 mins',
            type: 'Reading',
            learningObjectives: [
              'Compare for, while, and do-while loops.',
              'Use break to terminate loops and continue to skip iterations.',
              'Construct nested loops for number triangles and pyramids.'
            ],
            readingContent: `# Loops & Iteration in C

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
> Forgetting to update loop control variables (e.g. \`i++\` or \`count--\`) creates an **infinite loop**, freezing program execution and consuming 100% CPU core capacity.`,
            codeExamples: [
              {
                id: 'code-m4-2',
                title: 'Prime Number Checker Algorithm',
                language: 'c',
                code: `#include <stdio.h>\n#include <stdbool.h>\n\nint main(void) {\n    int num = 29;\n    bool isPrime = true;\n    if (num <= 1) isPrime = false;\n    for (int i = 2; i * i <= num; i++) {\n        if (num % i == 0) {\n            isPrime = false;\n            break;\n        }\n    }\n    printf("%d is %s\\n", num, isPrime ? "PRIME" : "NOT PRIME");\n    return 0;\n}`,
                explanation: 'Efficient O(sqrt(n)) prime number test using loop break optimization.'
              }
            ],
            keyPoints: [
              'for loops package initialization, condition, and increment into one line.',
              'break immediately exits the enclosing loop; continue skips to next iteration.',
              'Nested loops are essential for multi-dimensional coordinate grids and matrices.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m4-2',
                question: 'What is the fundamental difference between a while loop and a do-while loop?',
                answer: 'A while loop tests the condition before executing the loop body (entry-controlled), while a do-while loop executes the body first and tests the condition at the end (exit-controlled), guaranteeing at least one execution.',
                explanation: 'do-while is ideal for input menus where you must prompt the user at least once.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m4-2',
                title: 'C Iteration Statements',
                url: 'https://en.cppreference.com/w/c/language/for',
                description: 'Complete specification on for, while, and do-while loops in C.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 5: FUNCTIONS ───────────────────────────────────────────────────
  {
    id: 'c-mod-5',
    title: 'Module 5: Functions & Modular Programming',
    description: 'Learn function prototypes, definitions, parameters, return values, call-by-value mechanics, variable scope (local vs global vs static), and recursion.',
    duration: '3.5 Hours',
    topics: [
      {
        id: 'c-topic-5-1-basics',
        title: 'Topic 1: Function Basics & Scope',
        description: 'Understand modular design, prototypes, return types, call-by-value, and memory stack frames.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-5-1-function-anatomy',
            title: 'Unit 1: Function Declarations, Definitions & Calls',
            description: 'Master modular code decomposition, parameters, return values, and call-by-value mechanics.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Deconstruct the 3 parts of functions: Declaration, Definition, and Invocation.',
              'Understand return types and void functions.',
              'Understand why C is strictly Call by Value by default.'
            ],
            readingContent: `# Functions in C

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
> To modify the original variable from inside a function, you must pass its **memory pointer** (covered in Module 7).`,
            codeExamples: [
              {
                id: 'code-m5-1',
                title: 'Power Function Implementation',
                language: 'c',
                code: `#include <stdio.h>\n\nlong long power(int base, int exp) {\n    long long result = 1;\n    for(int i = 0; i < exp; i++) {\n        result *= base;\n    }\n    return result;\n}\n\nint main(void) {\n    printf("2^10 = %lld\\n", power(2, 10));\n    return 0;\n}`,
                explanation: 'Calculates exponentiation using modular function abstraction.'
              }
            ],
            keyPoints: [
              'Function prototypes tell the compiler parameter types and return type before main().',
              'C passes arguments by value (copies values to the function stack frame).',
              'void return type signifies a function that returns no value.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m5-1',
                question: 'Why are function prototypes recommended at the top of C source files?',
                answer: 'Prototypes allow the compiler to perform strict type-checking on function calls before it has seen the actual function definition body.',
                explanation: 'Without a prototype, calling a function defined below main() produces compiler warnings or compilation errors.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m5-1',
                title: 'C Functions Specification',
                url: 'https://en.cppreference.com/w/c/language/functions',
                description: 'Official ISO C reference on function declarations and definitions.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-5-2-recursion',
        title: 'Topic 2: Recursion & Scope Rules',
        description: 'Understand recursive algorithms, base cases, call stacks, and static vs local variables.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-5-2-recursion-mechanics',
            title: 'Unit 2: Recursive Functions & Call Stacks',
            description: 'Master recursion base conditions, call stack memory unwinding, and classic recursive problems.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand the recursive mechanism (function calling itself).',
              'Identify mandatory base conditions to prevent stack overflow.',
              'Implement Factorial and Fibonacci recursively.'
            ],
            readingContent: `# Recursion in C

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
> Omitting a base case causes infinite recursion, leading to a **Stack Overflow** crash when CPU stack memory is exhausted.`,
            codeExamples: [
              {
                id: 'code-m5-2',
                title: 'Recursive Fibonacci Sequence',
                language: 'c',
                code: `#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 0) return 0;\n    if (n == 1) return 1;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main(void) {\n    for (int i = 0; i < 8; i++) {\n        printf("%d ", fibonacci(i));\n    }\n    printf("\\n");\n    return 0;\n}`,
                explanation: 'Prints first 8 Fibonacci terms using recursive tree evaluation.'
              }
            ],
            keyPoints: [
              'Every recursive function requires a base case to terminate execution.',
              'Stack frames store local state for each active recursive call.',
              'Excessive recursive depth without tail call optimization causes stack overflow.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m5-2',
                question: 'What happens if a recursive function does not define a valid base case?',
                answer: 'It calls itself infinitely until system stack memory is exhausted, triggering a Segmentation Fault (Stack Overflow).',
                explanation: 'Each call allocates a new stack frame; without termination, stack limits are quickly breached.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m5-2',
                title: 'Recursion in Computer Science',
                url: 'https://en.wikipedia.org/wiki/Recursion_(computer_science)',
                description: 'Deep dive into call stack frames, induction, and recurrence relations.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 6: ARRAYS AND STRINGS ──────────────────────────────────────────
  {
    id: 'c-mod-6',
    title: 'Module 6: Arrays & String Processing',
    description: 'Master 1D arrays, 2D matrices, linear/bubble search algorithms, C-style null-terminated strings, and string.h library functions.',
    duration: '4 Hours',
    topics: [
      {
        id: 'c-topic-6-1-arrays',
        title: 'Topic 1: One-Dimensional & Two-Dimensional Arrays',
        description: 'Understand contiguous memory layout, indexing, bounds, and matrix mathematics.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-6-1-1d-2d-arrays',
            title: 'Unit 1: Array Fundamentals & Matrices',
            description: 'Learn array indexing, contiguous memory layout, matrix arithmetic, and boundary safety.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Declare, initialize, and traverse 1D arrays.',
              'Understand row-major memory order in 2D arrays.',
              'Perform matrix addition and transformations.'
            ],
            readingContent: `# Arrays in C

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
> C does **NOT** perform array bounds checking! Accessing \`arr[10]\` in an array of size 5 reads garbage memory or causes memory corruption. Always keep loop counters within \`0 <= i < size\`.`,
            codeExamples: [
              {
                id: 'code-m6-1',
                title: 'Finding Maximum and Minimum in Array',
                language: 'c',
                code: `#include <stdio.h>\n\nint main(void) {\n    int arr[] = {14, 52, 9, 87, 43, 65};\n    int n = sizeof(arr)/sizeof(arr[0]);\n    int max = arr[0], min = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > max) max = arr[i];\n        if (arr[i] < min) min = arr[i];\n    }\n    printf("Max: %d, Min: %d\\n", max, min);\n    return 0;\n}`,
                explanation: 'Scans array elements sequentially in O(n) time to find extremes.'
              }
            ],
            keyPoints: [
              'Array elements are stored contiguously in physical memory.',
              'Array indexing starts at 0 and ends at size - 1.',
              'sizeof(arr) / sizeof(arr[0]) calculates the element count of stack-allocated arrays.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m6-1',
                question: 'If int arr[5] is declared at memory address 1000, and sizeof(int) is 4 bytes, what is the address of arr[3]?',
                answer: '1012',
                explanation: 'Address = Base + (Index * sizeof(type)) = 1000 + (3 * 4) = 1012.',
                difficulty: 'Medium'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m6-1',
                title: 'C Array Documentation',
                url: 'https://en.cppreference.com/w/c/language/array',
                description: 'ISO C technical reference on multi-dimensional array memory layouts.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-6-2-strings',
        title: 'Topic 2: C Strings & String.h Functions',
        description: 'Understand null-terminated character arrays, strlen, strcpy, strcat, strcmp, and safe buffer handling.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-6-2-c-strings',
            title: 'Unit 2: String Manipulation & Library Utilities',
            description: 'Master null terminator (\0), safe string input with fgets, and core string.h library functions.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand how C represents strings using null-terminated char arrays (\\0).',
              'Use fgets() for safe multi-word string input.',
              'Apply strlen(), strcpy(), strcat(), and strcmp() from <string.h>.'
            ],
            readingContent: `# Strings in C

## Overview
In C, a **String** is simply an array of characters terminated by a special null character (**\`\\0\`**, ASCII value 0).

## Learning Objectives
- Understand the role of the null terminator \`\\0\`.
- Use \`<string.h>\` functions safely.
- Compare strings using \`strcmp()\`.

## 1. Core <string.h> Functions
| Function | Description | Example |
| :--- | :--- | :--- |
| \`strlen(s)\` | Returns number of characters (excluding \`\\0\`) | \`strlen("Kaizen")\` $\to$ \`6\` |
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
> Never use \`==\` to compare C strings (e.g. \`if (str1 == str2)\`)! In C, \`==\` compares the pointer memory addresses of the arrays, not their character contents. Always use \`strcmp(str1, str2) == 0\`.`,
            codeExamples: [
              {
                id: 'code-m6-2',
                title: 'Palindrome String Checker',
                language: 'c',
                code: `#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nint main(void) {\n    char word[] = "radar";\n    int len = strlen(word);\n    bool isPal = true;\n    for(int i = 0; i < len / 2; i++) {\n        if(word[i] != word[len - 1 - i]) {\n            isPal = false;\n            break;\n        }\n    }\n    printf("%s is %s\\n", word, isPal ? "a PALINDROME" : "NOT a palindrome");\n    return 0;\n}`,
                explanation: 'Two-pointer bidirectional check to verify palindrome strings.'
              }
            ],
            keyPoints: [
              'All C strings must terminate with the null character \\0.',
              'strcmp() returns 0 when two strings are identical.',
              'Use fgets() instead of gets() to prevent buffer overflow vulnerabilities.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m6-2',
                question: 'What is the return value of strcmp("Code", "Code") in C?',
                answer: '0',
                explanation: 'strcmp returns 0 when both strings contain identical characters up to the null terminator.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m6-2',
                title: 'C String Library Reference',
                url: 'https://en.cppreference.com/w/c/string/byte',
                description: 'Full documentation on string.h library functions.'
              }
            ]
          }
        ]
      }
    ]
  }
];
