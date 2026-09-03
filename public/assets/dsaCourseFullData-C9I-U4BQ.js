var e=(e,t,n,r,i,a,o,s,c,l)=>({id:e,title:t,description:n,duration:r,type:i,readingContent:a,practiceLabChallenge:void 0,codeExamples:o,keyPoints:s,practiceQuestions:c?.map((t,n)=>({id:`pq-${e}-${n}`,...t})),resourceLinks:l?.map((t,n)=>({id:`res-${e}-${n}`,...t})),resources:[{id:`res-${e}-pdf-notes`,name:`Data Structures & Algorithms Notes.pdf`,description:`Comprehensive DSA and algorithmic problem solving guide.`,category:`PDF`,fileSize:`5.2 MB`,downloadPermission:!0,url:`/dsa-complete-notes.pdf`}]}),t={1:`# Module 1: Algorithm Analysis & Big-O Notation

## Overview
Algorithm analysis is the study of how algorithm runtime and memory footprint scale as input size $N$ approaches infinity. Big-O notation ($O$) provides the mathematical standard for evaluating upper-bound worst-case performance.

## Learning Objectives
- Understand Time Complexity and Space Complexity metrics.
- Master Big-O ($O$), Big-Omega ($Omega$), and Big-Theta ($Theta$) asymptotic notations.
- Analyze linear loops, nested loops, logarithmic divisions, and recursive trees.

## Complexity Growth Orders
\`\`\`text
Fastest ──────────────────────────────────────────────────────────> Slowest
O(1)  <  O(log N)  <  O(N)  <  O(N log N)  <  O(N^2)  <  O(2^N)  <  O(N!)
Constant Logarithmic  Linear   Linearithmic  Quadratic  Exponential Factorial
\`\`\`

> 💡 **Tip:** Drop low-order terms and constant multipliers when calculating Big-O. For example, $f(N) = 3N^2 + 100N + 500 implies O(N^2)$.

> 📌 **Note:** Space complexity evaluates auxiliary memory allocated by variables, dynamic heap objects, and the recursive Call Stack.
`,2:`# Module 2: Arrays, Strings & Two-Pointer Techniques

## Overview
Arrays provide contiguous memory allocation with $O(1)$ random access by index. Two-pointer and sliding-window techniques enable reducing brute-force $O(N^2)$ search algorithms into optimal $O(N)$ linear scans.

## Learning Objectives
- Understand memory locality, array traversal, and dynamic resizing amortized analysis.
- Master Two-Pointer patterns (opposite ends, fast & slow pointers).
- Implement the Sliding Window technique for contiguous subsegment problems.

## Example: Two-Sum Sorted (Two-Pointer Technique)
\`\`\`javascript
function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;  // Need a larger value
    } else {
      right--; // Need a smaller value
    }
  }
  return []; // No pair found
}

console.log(twoSumSorted([2, 7, 11, 15], 9)); // [0, 1]
\`\`\`

> 💡 **Tip:** When solving string/array subsequence or sum challenges, check if sorting the array allows applying a two-pointer scan in $O(N)$ time.
`,3:`# Module 3: Singly & Doubly Linked Lists

## Overview
A Linked List is a linear data structure where elements (nodes) are non-contiguously stored in memory, linked via pointers. Unlike arrays, linked lists provide $O(1)$ insertions and deletions given a pointer to the target node.

## Learning Objectives
- Construct Singly Linked List and Doubly Linked List node structures.
- Implement node insertion, deletion, searching, and in-place reversal ($O(N)$ time, $O(1)$ space).
- Detect cycles in a linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare).

## Example: In-Place Singly Linked List Reversal
\`\`\`javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const nextTemp = curr.next; // Save next pointer
    curr.next = prev;           // Reverse link
    prev = curr;                // Advance prev
    curr = nextTemp;            // Advance curr
  }
  return prev; // New head of reversed list
}
\`\`\`
`,4:`# Module 4: Stacks, Queues & Deques

## Overview
Stacks enforce Last-In, First-Out (LIFO) semantics, while Queues enforce First-In, First-Out (FIFO) ordering. These abstract data types are fundamental to recursion, expression parsing, graph traversal, and task scheduling.

## Learning Objectives
- Implement Stacks using Arrays and Linked Lists ($O(1)$ push/pop).
- Implement Queues and Circular Queues ($O(1)$ enqueue/dequeue).
- Solve Monotonic Stack and Balanced Parentheses problems.

## Example: Valid Parentheses Check
\`\`\`javascript
function isValidParentheses(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}

console.log(isValidParentheses("{[()]}")); // true
console.log(isValidParentheses("{[(])}")); // false
\`\`\`
`,5:`# Module 5: Recursion & Backtracking Algorithms

## Overview
Recursion breaks down a problem into identical subproblems by having a function call itself with a base case to terminate execution. Backtracking extends recursion by systematically exploring all decision branches and abandoning invalid paths.

## Learning Objectives
- Identify base cases and recursive steps to prevent stack overflow.
- Trace recursive call stacks and draw recursion trees.
- Implement backtracking to solve Permutations, Combinations, Subsets, and N-Queens.

## Example: Generating Power Set (Subsets)
\`\`\`javascript
function subsets(nums) {
  const result = [];

  function backtrack(index, current) {
    result.push([...current]); // Add snapshot

    for (let i = index; i < nums.length; i++) {
      current.push(nums[i]);        // Choose
      backtrack(i + 1, current);   // Explore
      current.pop();                // Un-choose (Backtrack)
    }
  }

  backtrack(0, []);
  return result;
}

console.log(subsets([1, 2])); // [[], [1], [1, 2], [2]]
\`\`\`
`,6:`# Module 6: Searching & Sorting Algorithms

## Overview
Searching and sorting are foundational algorithmic primitives. We compare divide-and-conquer sorting algorithms ($O(N log N)$) against elementary quadratic sorts ($O(N^2)$).

## Learning Objectives
- Implement Binary Search on sorted sequences ($O(log N)$).
- Master Merge Sort (stable divide-and-conquer, $O(N log N)$).
- Master Quick Sort (partitioning in-place, average $O(N log N)$).

## Example: Binary Search Implementation
\`\`\`javascript
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    if (arr[mid] === target) {
      return mid; // Target index found
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1; // Not found
}
\`\`\`

> 💡 **Tip:** Always use \`low + Math.floor((high - low) / 2)\` to prevent integer overflow errors in languages like C, Java, and C++.
`,7:`# Module 7: Binary Trees & Binary Search Trees (BST)

## Overview
A Binary Tree is a hierarchical non-linear data structure where each node has at most two children (left and right). A Binary Search Tree (BST) maintains the sorted invariant: all left descendant keys < node key < all right descendant keys.

## Learning Objectives
- Perform tree traversals: Inorder (LNR), Preorder (NLR), Postorder (LRN), and Level-Order BFS.
- Insert, delete, and search nodes in a BST in $O(H)$ time where $H$ is tree height.
- Calculate Maximum Depth, Diameter, and Lowest Common Ancestor (LCA).

## Example: Inorder Traversal (Sorted Output for BST)
\`\`\`javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorderTraversal(root) {
  const result = [];
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    result.push(node.val);
    traverse(node.right);
  }
  traverse(root);
  return result;
}
\`\`\`
`,8:`# Module 8: Heaps & Priority Queues

## Overview
A Binary Heap is a complete binary tree satisfying the Heap Property (Min-Heap: parent $le$ children; Max-Heap: parent $ge$ children). Heaps enable finding minimum or maximum elements in $O(1)$ time and inserting/extracting in $O(log N)$ time.

## Learning Objectives
- Understand Array representation of binary heaps (\`left = 2i + 1\`, \`right = 2i + 2\`, \`parent = (i-1)/2\`).
- Implement Heapify, \`insert()\`, and \`extractMin()\` operations.
- Solve Top-K Frequent Elements and Median in a Data Stream.

> 💡 **Tip:** When finding the "Kth largest element", use a Min-Heap of size $K$. When finding the "Kth smallest element", use a Max-Heap of size $K$.
`,9:`# Module 9: Graphs & Graph Traversals

## Overview
Graphs model pairwise relationships between sets of vertices (nodes) and edges (connections). Graphs can be directed/undirected and weighted/unweighted.

## Learning Objectives
- Represent graphs using Adjacency Lists and Adjacency Matrices.
- Master Breadth-First Search (BFS) for shortest paths in unweighted graphs.
- Master Depth-First Search (DFS) for connectivity and cycle detection.
- Implement Dijkstra's Algorithm for shortest path in non-negative weighted graphs.

## Example: Breadth-First Search (BFS)
\`\`\`javascript
function bfs(graph, startNode) {
  const visited = new Set([startNode]);
  const queue = [startNode];
  const traversalOrder = [];

  while (queue.length > 0) {
    const current = queue.shift();
    traversalOrder.push(current);

    for (const neighbor of graph[current] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return traversalOrder;
}
\`\`\`
`,10:`# Module 10: Dynamic Programming & Greedy Algorithms

## Overview
Dynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems with optimal substructure, storing previously calculated results to avoid redundant work.

## Learning Objectives
- Understand Top-Down Memoization vs Bottom-Up Tabulation.
- Solve 0/1 Knapsack, Longest Common Subsequence (LCS), and Coin Change problems.
- Contrast Greedy choice property against Dynamic Programming decisions.

## Example: Coin Change Problem (Bottom-Up DP)
\`\`\`javascript
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // Base case: 0 coins needed for amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 2, 5], 11)); // 3 (5 + 5 + 1)
\`\`\`
`},n=[{id:`dsa-mod-1`,title:`Module 1: Algorithm Analysis & Big-O Notation`,description:`Time complexity, space complexity, asymptotic notation, and analysis.`,duration:`3 Hours`,topics:[{id:`dsa-top-1`,title:`Asymptotic Analysis & Big-O`,description:`Orders of growth, worst case, best case, and space analysis.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-1-notes`,`Module 1 - Complete Notes`,`Algorithm Complexity & Big-O Notation Mastery.`,`45 mins`,`Reading`,t[1])]}]},{id:`dsa-mod-2`,title:`Module 2: Arrays & Two-Pointer Techniques`,description:`Array manipulations, sliding window, prefix sums, and two pointers.`,duration:`4 Hours`,topics:[{id:`dsa-top-2`,title:`Arrays & Two-Pointer Algorithms`,description:`Memory layout, two-pointer scan, and sliding window optimization.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-2-notes`,`Module 2 - Complete Notes`,`Arrays, Two-Pointers & Sliding Window.`,`45 mins`,`Reading`,t[2])]}]},{id:`dsa-mod-3`,title:`Module 3: Linked Lists (Singly & Doubly)`,description:`Node structure, insertion, deletion, reversal, cycle detection, and merge.`,duration:`4 Hours`,topics:[{id:`dsa-top-3`,title:`Linked List Operations`,description:`Pointers, in-place reversal, Floyd cycle detection.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-3-notes`,`Module 3 - Complete Notes`,`Linked Lists, Reversal & Cycle Detection.`,`45 mins`,`Reading`,t[3])]}]},{id:`dsa-mod-4`,title:`Module 4: Stacks & Queues`,description:`LIFO/FIFO principles, balanced parentheses, monotonic stack, and circular queue.`,duration:`3 Hours`,topics:[{id:`dsa-top-4`,title:`Stack & Queue Applications`,description:`LIFO/FIFO evaluation, parenthesis parsing, and queues.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-4-notes`,`Module 4 - Complete Notes`,`Stacks, Queues & Monotonic Structures.`,`45 mins`,`Reading`,t[4])]}]},{id:`dsa-mod-5`,title:`Module 5: Recursion & Backtracking`,description:`Base cases, recursive trees, permutations, subsets, and N-Queens problem.`,duration:`4 Hours`,topics:[{id:`dsa-top-5`,title:`Recursive Search & Backtracking`,description:`Call stack tracing, power set, permutations, and backtracking.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-5-notes`,`Module 5 - Complete Notes`,`Recursion, Backtracking & Decision Trees.`,`45 mins`,`Reading`,t[5])]}]},{id:`dsa-mod-6`,title:`Module 6: Sorting & Searching Algorithms`,description:`Merge sort, quick sort, heap sort, linear search, and binary search.`,duration:`4 Hours`,topics:[{id:`dsa-top-6`,title:`Sorting & Binary Search`,description:`Divide-and-conquer, partition algorithms, and binary search.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-6-notes`,`Module 6 - Complete Notes`,`Sorting Algorithms & Binary Search Mastery.`,`45 mins`,`Reading`,t[6])]}]},{id:`dsa-mod-7`,title:`Module 7: Binary Trees & BST`,description:`Tree traversals (Inorder, Preorder, Postorder, Level order), BST ops, and LCA.`,duration:`5 Hours`,topics:[{id:`dsa-top-7`,title:`Hierarchical Tree Structures`,description:`Tree recursion, BST search/insert, and traversal algorithms.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-7-notes`,`Module 7 - Complete Notes`,`Binary Trees, BST & Tree Traversal.`,`45 mins`,`Reading`,t[7])]}]},{id:`dsa-mod-8`,title:`Module 8: Heaps & Priority Queues`,description:`Min-heap, max-heap, heapify algorithm, and Top-K elements problems.`,duration:`3 Hours`,topics:[{id:`dsa-top-8`,title:`Heap Operations & Priority Queues`,description:`Array representation, heapify up/down, and Top-K challenges.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-8-notes`,`Module 8 - Complete Notes`,`Binary Heaps & Priority Queue Optimization.`,`45 mins`,`Reading`,t[8])]}]},{id:`dsa-mod-9`,title:`Module 9: Graphs & Graph Traversals`,description:`Adjacency list/matrix, BFS, DFS, Dijkstra shortest path, and topological sort.`,duration:`5 Hours`,topics:[{id:`dsa-top-9`,title:`Graph Theory & Pathfinding`,description:`BFS, DFS, cycle detection, and Dijkstra algorithm.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-9-notes`,`Module 9 - Complete Notes`,`Graph Representations, BFS, DFS & Dijkstra.`,`45 mins`,`Reading`,t[9])]}]},{id:`dsa-mod-10`,title:`Module 10: Dynamic Programming & Greedy Algorithms`,description:`Memoization, tabulation, knapsack problem, LCS, and greedy optimization.`,duration:`5 Hours`,topics:[{id:`dsa-top-10`,title:`Dynamic Programming & Optimization`,description:`Overlapping subproblems, state transitions, and tabulation.`,estimatedDuration:`45 mins`,learningUnits:[e(`dsa-unit-10-notes`,`Module 10 - Complete Notes`,`Dynamic Programming, Memoization & Tabulation.`,`45 mins`,`Reading`,t[10])]}]}];export{n as dsaCourseModules};