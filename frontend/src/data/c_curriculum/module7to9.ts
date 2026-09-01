import type { ModuleItem } from '../../contexts/CourseContext';

export const modules7to9: ModuleItem[] = [
  // ── MODULE 7: POINTERS ────────────────────────────────────────────────────
  {
    id: 'c-mod-7',
    title: 'Module 7: Pointers & Direct Memory Access',
    description: 'Master pointer variables, address-of (&), dereference (*), pointer arithmetic, passing pointers to functions (call by reference), and double pointers.',
    duration: '4.5 Hours',
    topics: [
      {
        id: 'c-topic-7-1-basics',
        title: 'Topic 1: Pointer Fundamentals & Dereferencing',
        description: 'Understand memory addresses, hex formatting (%p), pointer types, and value modification via dereferencing.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-7-1-what-is-pointer',
            title: 'Unit 1: What is a Pointer & Address Operators',
            description: 'Master memory addressing, pointer declaration syntax, address-of operator (&), and dereference operator (*).',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand that every variable lives at a specific byte address in RAM.',
              'Use the address-of operator (&) to retrieve memory locations.',
              'Use the dereference operator (*) to read and modify values through pointers.'
            ],
            readingContent: `# Pointers in C

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
> Never dereference an **uninitialized pointer** (e.g. \`int *p; *p = 10;\`)! This writes to a random location in RAM, causing instant crash or silent data corruption. Always initialize pointers to \`NULL\` or a valid address.`,
            codeExamples: [
              {
                id: 'code-m7-1',
                title: 'Simulating Pass-by-Reference with Pointers',
                language: 'c',
                code: `#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main(void) {\n    int x = 10, y = 20;\n    printf("Before swap: x=%d, y=%d\\n", x, y);\n    swap(&x, &y);\n    printf("After swap:  x=%d, y=%d\\n", x, y);\n    return 0;\n}`,
                explanation: 'Demonstrates swapping two variables in caller scope by passing memory pointers.'
              }
            ],
            keyPoints: [
              'Pointers store memory addresses of other variables.',
              '& extracts the address of a variable; * dereferences the address.',
              'Passing pointers allows functions to directly mutate variables in caller scope.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m7-1',
                question: 'If int x = 50; int *p = &x; what does *p evaluate to?',
                answer: '50',
                explanation: 'Dereferencing pointer *p reads the value stored at the address pointed to by p, which is the value of x (50).',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m7-1',
                title: 'C Pointers Reference',
                url: 'https://en.cppreference.com/w/c/language/pointer',
                description: 'Official ISO C specification on pointer semantics and type alignments.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-7-2-arithmetic-double',
        title: 'Topic 2: Pointer Arithmetic & Double Pointers',
        description: 'Understand pointer scaling by data type size, pointer-array duality, and pointer-to-pointer (int **ptr).',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-7-2-pointer-arithmetic',
            title: 'Unit 2: Pointer Arithmetic & Arrays',
            description: 'Learn how ptr + 1 increments by sizeof(type) bytes and how array names decay into pointers.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand pointer arithmetic scaling.',
              'Traverse arrays using pointers instead of integer indices.',
              'Understand double pointers (int **).'
            ],
            readingContent: `# Pointer Arithmetic & Arrays

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
> Notice in the output above that each address advances by **4 bytes** because \`sizeof(int) == 4\`. C handles byte scaling automatically!`,
            codeExamples: [
              {
                id: 'code-m7-2',
                title: 'String Length Calculation using Pointers',
                language: 'c',
                code: `#include <stdio.h>\n\nsize_t custom_strlen(const char *str) {\n    const char *p = str;\n    while (*p != '\\0') {\n        p++;\n    }\n    return (size_t)(p - str); // Pointer subtraction yields element count\n}\n\nint main(void) {\n    printf("Length: %zu\\n", custom_strlen("KaizenQ"));\n    return 0;\n}`,
                explanation: 'Calculates string length via pointer arithmetic without integer counters.'
              }
            ],
            keyPoints: [
              'Pointer addition advances by sizeof(type) bytes per increment.',
              'arr[i] is syntactic sugar for *(arr + i).',
              'Subtracting two pointers of the same type yields the number of elements between them.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m7-2',
                question: 'If int *p points to address 2000, and sizeof(int) is 4 bytes, what address does p + 3 point to?',
                answer: '2012',
                explanation: 'Address = 2000 + (3 * 4) = 2012.',
                difficulty: 'Medium'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m7-2',
                title: 'Pointer Arithmetic Standards',
                url: 'https://en.wikipedia.org/wiki/Pointer_(computer_programming)#C_and_C++',
                description: 'Detailed analysis of pointer semantics and memory alignments.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 8: STRUCTURES AND UNIONS ───────────────────────────────────────
  {
    id: 'c-mod-8',
    title: 'Module 8: Structures, Unions & Typedef',
    description: 'Learn user-defined composite data types: struct, memory padding, arrow operator (->), array of structures, unions, and typedef aliases.',
    duration: '3.5 Hours',
    topics: [
      {
        id: 'c-topic-8-1-structures',
        title: 'Topic 1: Structures & typedef',
        description: 'Understand grouping heterogeneous data fields, dot (.) vs arrow (->) operators, and typedef syntax.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-8-1-struct-basics',
            title: 'Unit 1: Struct Declarations & Memory Access',
            description: 'Master struct definitions, dot operator, pointer arrow operator (->), and typedef aliases.',
            duration: '25 mins',
            type: 'Reading',
            learningObjectives: [
              'Define custom composite records using struct.',
              'Access members using dot (.) for values and arrow (->) for pointers.',
              'Use typedef to create clean type aliases.'
            ],
            readingContent: `# Structures in C

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
> Always pass large structures to functions by **pointer** (\`const Student *s\`) rather than by value (\`Student s\`). Passing by value creates a full memory copy of the entire structure on the stack frame.`,
            codeExamples: [
              {
                id: 'code-m8-1',
                title: 'Array of Structures Example',
                language: 'c',
                code: `#include <stdio.h>\n\ntypedef struct { char title[30]; double price; } Book;\n\nint main(void) {\n    Book catalog[2] = {\n        {"The C Programming Language", 45.00},\n        {"Clean Code", 38.50}\n    };\n    for(int i = 0; i < 2; i++) {\n        printf("%s costs $%.2f\\n", catalog[i].title, catalog[i].price);\n    }\n    return 0;\n}`,
                explanation: 'Demonstrates managing collections of composite records.'
              }
            ],
            keyPoints: [
              'struct groups heterogeneous data items into a single composite record.',
              'Use dot (.) when accessing direct struct instances; use arrow (->) for struct pointers.',
              'typedef simplifies type declarations by eliminating the need to write "struct" repeatedly.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m8-1',
                question: 'What is the difference between ptr->field and (*ptr).field in C?',
                answer: 'They are completely identical in functionality; ptr->field is cleaner syntactic sugar for (*ptr).field.',
                explanation: 'The arrow operator dereferences the pointer and accesses the member in one step.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m8-1',
                title: 'C Structure Types',
                url: 'https://en.cppreference.com/w/c/language/struct',
                description: 'Complete ISO C specification on structs, memory layout, and padding.'
              }
            ]
          }
        ]
      },
      {
        id: 'c-topic-8-2-unions',
        title: 'Topic 2: Unions & Shared Memory',
        description: 'Understand unions, overlapping memory layouts, and tag-based union variants.',
        estimatedDuration: '45 mins',
        learningUnits: [
          {
            id: 'c-unit-8-2-union-basics',
            title: 'Unit 2: Unions vs Structures',
            description: 'Learn how unions share the same memory location across all members to conserve RAM in embedded systems.',
            duration: '20 mins',
            type: 'Reading',
            learningObjectives: [
              'Understand that a union allocates only enough memory for its largest member.',
              'Know when to use unions for hardware registers and variant types.'
            ],
            readingContent: `# Unions in C

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
> Only one union member can hold a valid value at any given time. Accessing a different member reads the binary bit interpretation of the last written value.`,
            codeExamples: [
              {
                id: 'code-m8-2',
                title: 'IP Address Representation with Union',
                language: 'c',
                code: `#include <stdio.h>\n#include <stdint.h>\n\nunion IPAddress {\n    uint32_t address32;\n    uint8_t bytes[4];\n};\n\nint main(void) {\n    union IPAddress ip;\n    ip.bytes[0] = 192;\n    ip.bytes[1] = 168;\n    ip.bytes[2] = 1;\n    ip.bytes[3] = 100;\n    printf("IP: %u.%u.%u.%u (Raw 32-bit: 0x%X)\\n", ip.bytes[0], ip.bytes[1], ip.bytes[2], ip.bytes[3], ip.address32);\n    return 0;\n}`,
                explanation: 'Shows byte-level union overlay for networking IP addresses.'
              }
            ],
            keyPoints: [
              'Unions store all members at the exact same base memory address.',
              'Size of a union is equal to its largest member.',
              'Ideal for memory-constrained embedded systems and network protocol packet headers.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m8-2',
                question: 'If a union contains a char (1 byte), an int (4 bytes), and a double (8 bytes), what is sizeof(union)?',
                answer: '8 bytes',
                explanation: 'A union allocates memory only for its largest member, which is the double (8 bytes).',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m8-2',
                title: 'C Union Specification',
                url: 'https://en.cppreference.com/w/c/language/union',
                description: 'Official ISO C standard documentation on union types and member overlapping.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ── MODULE 9: DYNAMIC MEMORY ──────────────────────────────────────────────
  {
    id: 'c-mod-9',
    title: 'Module 9: Dynamic Memory Allocation',
    description: 'Master heap memory allocation with malloc(), calloc(), realloc(), free(), preventing memory leaks and avoiding dangling pointers.',
    duration: '4 Hours',
    topics: [
      {
        id: 'c-topic-9-1-heap-allocation',
        title: 'Topic 1: Stack vs Heap & Memory Allocators',
        description: 'Understand memory segments, malloc, calloc, realloc, free, and checking NULL allocations.',
        estimatedDuration: '60 mins',
        learningUnits: [
          {
            id: 'c-unit-9-1-malloc-calloc-free',
            title: 'Unit 1: malloc, calloc, realloc & free in Depth',
            description: 'Master allocating heap memory dynamically at runtime, resizing arrays, and safe deallocation.',
            duration: '30 mins',
            type: 'Reading',
            learningObjectives: [
              'Compare Stack vs Heap memory segments.',
              'Allocate memory using malloc() and calloc().',
              'Resize dynamically with realloc().',
              'Free allocated memory to prevent leaks.'
            ],
            readingContent: `# Dynamic Memory Allocation in C

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
> 2. **Dangling Pointer**: Continuing to use a pointer after \`free(p)\`. Always set \`p = NULL;\` immediately after freeing!`,
            codeExamples: [
              {
                id: 'code-m9-1',
                title: 'Safe Memory Allocation Wrapper',
                language: 'c',
                code: `#include <stdio.h>\n#include <stdlib.h>\n\nvoid* safe_malloc(size_t bytes) {\n    void *p = malloc(bytes);\n    if (!p) {\n        fprintf(stderr, "FATAL: Out of memory\\n");\n        exit(EXIT_FAILURE);\n    }\n    return p;\n}\n\nint main(void) {\n    double *prices = safe_malloc(10 * sizeof(double));\n    prices[0] = 99.95;\n    printf("First price: $%.2f\\n", prices[0]);\n    free(prices);\n    return 0;\n}`,
                explanation: 'Defines an infallible memory allocator pattern for robust system tools.'
              }
            ],
            keyPoints: [
              'Heap memory persists until explicitly freed with free().',
              'Always check if malloc/calloc returned NULL before dereferencing.',
              'Set freed pointers to NULL to prevent use-after-free bugs.'
            ],
            practiceQuestions: [
              {
                id: 'pq-m9-1',
                question: 'What is the primary difference between malloc() and calloc()?',
                answer: 'malloc() allocates raw uninitialized memory containing garbage data, while calloc() initializes all allocated bytes to zero.',
                explanation: 'calloc takes two arguments (count and size) and clears all allocated memory to 0.',
                difficulty: 'Easy'
              }
            ],
            resourceLinks: [
              {
                id: 'res-m9-1',
                title: 'C Dynamic Memory Management',
                url: 'https://en.cppreference.com/w/c/memory',
                description: 'Official ISO C reference for stdlib memory allocation functions.'
              }
            ]
          }
        ]
      }
    ]
  }
];
