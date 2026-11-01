var e={python:{key:`python`,name:`Python`,aliases:[`py`,`python3`],judge0Id:71,file:`main.py`,badgeColor:`sky`,version:`3.10`,starterCode:`# Python 3 Algorithm & Problem Solving
def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to Shaivika LMS Compiler."

def fibonacci(n: int) -> list:
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

if __name__ == '__main__':
    print(greet("Developer"))
    print("Fibonacci Sequence:", fibonacci(8))
`},c:{key:`c`,name:`C`,aliases:[`gcc`],judge0Id:50,wandboxCompiler:`gcc-head`,file:`main.c`,badgeColor:`blue`,version:`GCC 9.2`,starterCode:`#include <stdio.h>

int main() {
    printf("🚀 C Program Executing on Shaivika LMS!\\n");
    for (int i = 1; i <= 5; i++) {
        printf("Step %d: Processing memory chunk at index %d\\n", i, i * 16);
    }
    return 0;
}
`},cpp:{key:`cpp`,name:`C++`,aliases:[`c++`,`g++`],judge0Id:54,wandboxCompiler:`gcc-head`,file:`main.cpp`,badgeColor:`indigo`,version:`G++ 9.2`,starterCode:`#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "⚡ C++ STL Container Engine\\n";
    std::vector<int> nums = {64, 34, 25, 12, 22, 11, 90};
    
    std::sort(nums.begin(), nums.end());
    
    std::cout << "Sorted Numbers: ";
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\\n";
    return 0;
}
`},java:{key:`java`,name:`Java`,aliases:[`openjdk`],judge0Id:62,file:`Main.java`,badgeColor:`amber`,version:`OpenJDK 15`,starterCode:`public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Java OOPs Execution Engine");
        String[] tracks = {"React Full-Stack", "Python AI", "DevOps & Cloud", "Data Structures"};
        for (int i = 0; i < tracks.length; i++) {
            System.out.printf("Track %d: %s%n", i + 1, tracks[i]);
        }
    }
}
`},javascript:{key:`javascript`,name:`JavaScript`,aliases:[`js`,`node`],judge0Id:63,file:`index.js`,badgeColor:`yellow`,version:`Node.js 18`,starterCode:`// JavaScript Live Runner
function calculateMetrics(data) {
  const sum = data.reduce((acc, val) => acc + val, 0);
  const avg = sum / data.length;
  return { sum, avg: avg.toFixed(2), count: data.length };
}

const metrics = calculateMetrics([85, 92, 78, 96, 88]);
console.log("Computation Results:", metrics);
`},typescript:{key:`typescript`,name:`TypeScript`,aliases:[`ts`],judge0Id:74,file:`index.ts`,badgeColor:`blue`,version:`TS 5.0`,starterCode:`// TypeScript Static Typing
interface StudentRecord {
  id: string;
  name: string;
  score: number;
}

const student: StudentRecord = {
  id: 'STU-1042',
  name: 'Bhanu Prakash',
  score: 98
};

console.log(\`Student: \${student.name} | Score: \${student.score}%\`);
`},go:{key:`go`,name:`Go`,aliases:[`golang`],judge0Id:60,file:`main.go`,badgeColor:`cyan`,version:`Go 1.20`,starterCode:`package main

import "fmt"

func main() {
    fmt.Println("🔷 Go High-Performance Microservices Engine")
    message := "Concurrency with Go Routines"
    fmt.Printf("Status: %s\\n", message)
}
`},rust:{key:`rust`,name:`Rust`,aliases:[`rs`],judge0Id:73,file:`main.rs`,badgeColor:`orange`,version:`Rust 1.70`,starterCode:`fn main() {
    println!("🦀 Rust Safe Memory Systems Engine");
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum of numbers: {}", sum);
}
`},csharp:{key:`csharp`,name:`C#`,aliases:[`cs`,`dotnet`],judge0Id:51,file:`Program.cs`,badgeColor:`purple`,version:`.NET 6 / Mono`,starterCode:`using System;

public class Program {
    public static void Main(string[] args) {
        Console.WriteLine("💜 C# / .NET Enterprise Sandbox");
        Console.WriteLine($"Current UTC Time: {DateTime.UtcNow}");
    }
}
`},php:{key:`php`,name:`PHP`,aliases:[],judge0Id:68,file:`index.php`,badgeColor:`violet`,version:`PHP 8.2`,starterCode:`<?php
echo "🐘 PHP Backend Script\\n";
$user = ["name" => "Student", "role" => "Software Engineer"];
echo "Welcome, " . $user["name"] . "!\\n";
?>
`},ruby:{key:`ruby`,name:`Ruby`,aliases:[`rb`],judge0Id:72,file:`main.rb`,badgeColor:`rose`,version:`Ruby 3.0`,starterCode:`# Ruby Script
puts "💎 Ruby Dynamic Programming"
fruits = ["Apple", "Mango", "Blueberry"]
fruits.each_with_index do |fruit, idx|
  puts "#{idx + 1}. #{fruit}"
end
`},bash:{key:`bash`,name:`Bash`,aliases:[`sh`,`shell`],judge0Id:46,file:`script.sh`,badgeColor:`emerald`,version:`Bash 5.0`,starterCode:`#!/bin/bash
echo "🐧 Linux Bash Automation Script"
echo "Active Shell: $SHELL"
for i in {1..4}; do
    echo "Running step $i..."
done
echo "Completed successfully!"
`},kotlin:{key:`kotlin`,name:`Kotlin`,aliases:[`kt`],judge0Id:78,file:`Main.kt`,badgeColor:`pink`,version:`Kotlin 1.8`,starterCode:`fun main() {
    println("🎯 Kotlin Modern Android & Backend")
    val items = listOf("Compose", "Coroutines", "Flow")
    for (item in items) {
        println("- $item")
    }
}
`},swift:{key:`swift`,name:`Swift`,aliases:[],judge0Id:83,file:`main.swift`,badgeColor:`orange`,version:`Swift 5.3`,starterCode:`import Foundation

print("🍎 Swift Apple Platforms & Server")
let greeting = "Hello from Swift on Shaivika LMS!"
print(greeting)
`},dart:{key:`dart`,name:`Dart`,aliases:[],judge0Id:90,file:`main.dart`,badgeColor:`teal`,version:`Dart 2.19`,starterCode:`void main() {
  print("🎯 Dart & Flutter Engine");
  final list = [10, 20, 30, 40];
  print("Items count: \${list.length}");
}
`},sql:{key:`sql`,name:`SQL (SQLite)`,aliases:[`sqlite`,`sqlite3`],judge0Id:82,file:`query.sql`,badgeColor:`emerald`,version:`SQLite 3.36`,starterCode:`CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, course TEXT);
INSERT INTO students (name, course) VALUES ('Bhanu Prakash', 'Full Stack AI'), ('Pooja', 'Cloud DevOps');
SELECT * FROM students;
`}};function t(t){let n=t.trim();if(!n)return{languageKey:`python`,name:`Python`,badgeColor:`sky`,file:`main.py`,confidence:0};let r={c:0,cpp:0,java:0,python:0,javascript:0,typescript:0,go:0,rust:0,csharp:0,php:0,ruby:0,bash:0,kotlin:0,swift:0,dart:0,sql:0};(n.startsWith(`#!/bin/bash`)||n.startsWith(`#!/bin/sh`))&&(r.bash+=100),n.startsWith(`<?php`)&&(r.php+=100),/#include\s*<iostream>/i.test(t)&&(r.cpp+=60),/#include\s*<vector>/i.test(t)&&(r.cpp+=50),/#include\s*<algorithm>/i.test(t)&&(r.cpp+=50),/#include\s*<string>/i.test(t)&&(r.cpp+=30),/std::cout|std::cin|std::endl|cout\s*<<|cin\s*>>/i.test(t)&&(r.cpp+=60),/using\s+namespace\s+std\s*;/i.test(t)&&(r.cpp+=60),/template\s*<\s*(typename|class)/i.test(t)&&(r.cpp+=45),/\bnullptr\b/.test(t)&&(r.cpp+=25),/#include\s*<stdio\.h>/i.test(t)&&(r.c+=50),/#include\s*<stdlib\.h>/i.test(t)&&(r.c+=30),/#include\s*<string\.h>/i.test(t)&&(r.c+=30),/printf\s*\(|scanf\s*\(/i.test(t)&&(r.c+=40),/malloc\s*\(|free\s*\(|calloc\s*\(/i.test(t)&&(r.c+=35),/int\s+main\s*\(\s*(void)?\s*\)/i.test(t)&&!/#include\s*<iostream>/.test(t)&&(r.c+=25),/public\s+class\s+\w+/i.test(t)&&(r.java+=60),/public\s+static\s+void\s+main\s*\(\s*String/i.test(t)&&(r.java+=80),/System\.(out|err)\.print/i.test(t)&&(r.java+=70),/import\s+java\./i.test(t)&&(r.java+=60),/new\s+Scanner\s*\(\s*System\.in\s*\)/i.test(t)&&(r.java+=50),/ArrayList\s*<|HashMap\s*</i.test(t)&&(r.java+=25),/^\s*def\s+\w+\s*\(.*?\)\s*:/m.test(t)&&(r.python+=50),/if\s+__name__\s*==\s*['"]__main__['"]\s*:/i.test(t)&&(r.python+=80),/print\s*\(.*?\)/m.test(t)&&!/[;{}]/.test(t)&&(r.python+=35),/from\s+\w+\s+import\s+/m.test(t)&&(r.python+=45),/import\s+(sys|os|math|numpy|pandas|random|time)\b/i.test(t)&&(r.python+=40),/elif\s+.*?:/m.test(t)&&(r.python+=45),/\b(None|True|False)\b/.test(t)&&!/[;]/.test(t)&&(r.python+=20),/package\s+main\b/i.test(t)&&(r.go+=80),/func\s+main\s*\(\s*\)/i.test(t)&&(r.go+=70),/fmt\.(Println|Printf|Print)/i.test(t)&&(r.go+=70),(/import\s*\(\s*"fmt"/i.test(t)||/import\s+"fmt"/i.test(t))&&(r.go+=60),/:=/m.test(t)&&(r.go+=30),/fn\s+main\s*\(\s*\)/i.test(t)&&(r.rust+=70),/println!\s*\(|print!\s*\(|eprintln!\s*\(/i.test(t)&&(r.rust+=70),/let\s+mut\s+\w+/i.test(t)&&(r.rust+=50),/use\s+std::/i.test(t)&&(r.rust+=45),/using\s+System\s*;/i.test(t)&&(r.csharp+=70),/Console\.(WriteLine|Write|ReadLine)/i.test(t)&&(r.csharp+=70),/namespace\s+[\w.]+/i.test(t)&&(r.csharp+=30),/interface\s+\w+\s*\{/i.test(t)&&(r.typescript+=60),/type\s+\w+\s*=\s*/i.test(t)&&(r.typescript+=50),/:\s*(string|number|boolean|any|void|unknown|never)\b/i.test(t)&&(r.typescript+=45),/as\s+const\b/i.test(t)&&(r.typescript+=35),/console\.(log|warn|error|info)\s*\(/i.test(t)&&(r.javascript+=30,r.typescript+=20),/\b(const|let|var)\s+\w+\s*=/i.test(t)&&(r.javascript+=25,r.typescript+=20),/function\s+\w+\s*\(.*?\)\s*\{/i.test(t)&&(r.javascript+=25,r.typescript+=20),(/=>\s*\{/i.test(t)||/export\s+default/i.test(t))&&(r.javascript+=20,r.typescript+=20),/\$\w+\s*=/m.test(t)&&!/\$\(/.test(t)&&(r.php+=35),/echo\s+["'].*?["'];/i.test(t)&&(r.php+=35),/puts\s+["'].*?["']/i.test(t)&&!/;/m.test(t)&&(r.ruby+=35),/def\s+\w+.*?end\b/s.test(t)&&!/:\s*$/m.test(t)&&(r.ruby+=40),/echo\s+["'].*?["']/i.test(t)&&/\b(fi|done|esac)\b/m.test(t)&&(r.bash+=50),/fun\s+main\s*\(.*?\)/i.test(t)&&(r.kotlin+=60),/val\s+\w+\s*[:=]/i.test(t)&&(r.kotlin+=25),(/import\s+Foundation\b/i.test(t)||/import\s+UIKit\b/i.test(t))&&(r.swift+=70),/guard\s+let\s+/i.test(t)&&(r.swift+=40),/void\s+main\s*\(\s*\)\s*\{/i.test(t)&&!r.c&&!r.cpp&&!r.java&&(r.dart+=45),/Widget\s+build\s*\(/i.test(t)&&(r.dart+=60),(/SELECT\s+.*?\s+FROM\s+/i.test(t)||/CREATE\s+TABLE\s+/i.test(t)||/INSERT\s+INTO\s+/i.test(t))&&(r.sql+=75);let i=`python`,a=0;for(let[e,t]of Object.entries(r))t>a&&(a=t,i=e);i===`c`&&r.cpp>0&&r.cpp>=r.c-10&&(i=`cpp`),i===`javascript`&&r.typescript>r.javascript&&(i=`typescript`);let o=e[i]||e.python;return{languageKey:o.key,name:o.name,badgeColor:o.badgeColor,file:o.file,confidence:Math.min(100,Math.max(10,a))}}function n(e,t){let n=performance.now(),r=[],i=[],a=console.log,o=console.error,s=console.warn,c=console.info;try{console.log=(...e)=>{r.push(e.map(e=>typeof e==`object`?JSON.stringify(e,null,2):String(e)).join(` `))},console.error=(...e)=>{i.push(e.map(e=>typeof e==`object`?JSON.stringify(e,null,2):String(e)).join(` `))},console.warn=(...e)=>{r.push(`[WARN] `+e.map(e=>typeof e==`object`?JSON.stringify(e,null,2):String(e)).join(` `))},console.info=(...e)=>{r.push(`[INFO] `+e.map(e=>typeof e==`object`?JSON.stringify(e,null,2):String(e)).join(` `))};let a=e.replace(/:\s*(string|number|boolean|any|void|unknown|never|object|Array<[^>]+>|string\[\]|number\[\])/g,``).replace(/interface\s+\w+\s*\{[\s\S]*?\}/g,``).replace(/type\s+\w+\s*=[\s\S]*?;/g,``);Function(`input`,`
      'use strict';
      try {
        ${a}
      } catch(err) {
        console.error(err.message || String(err));
      }
    `)(t);let o=Math.round(performance.now()-n),s=r.join(`
`);return!s&&i.length===0&&(s=`Program executed successfully with zero stdout output.`),{success:i.length===0,stdout:s,stderr:i.length>0?i.join(`
`):null,compileOutput:null,executionTimeMs:Math.max(1,o),engine:`local`}}catch(e){return{success:!1,stdout:r.join(`
`),stderr:`Runtime Exception: ${e.message||String(e)}`,compileOutput:null,executionTimeMs:Math.round(performance.now()-n),engine:`local`}}finally{console.log=a,console.error=o,console.warn=s,console.info=c}}async function r(t,r,i){let a=performance.now();if(!t.trim())return{success:!1,stdout:``,stderr:`Compilation Error: Source code cannot be empty.`,compileOutput:null,executionTimeMs:0,engine:`local`};let o=e[r]||e.python;try{let e=await fetch(`https://ce.judge0.com/submissions?base64_encoded=false&wait=true`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({source_code:t,language_id:o.judge0Id,stdin:i||void 0})});if(e.ok){let t=await e.json(),n=performance.now(),r=Math.round(n-a),i=t.stdout||``,o=t.stderr||null,s=t.compile_output||null,c=t.status?.id,l=t.status?.description,u=o;return s&&!u?u=s:c&&c>3&&!u&&(u=`${l||`Execution terminated`}${t.message?`: `+t.message:``}`),{success:!u&&c===3,stdout:i||(u?``:`Program executed successfully with no output.`),stderr:u,compileOutput:s,executionTimeMs:t.time?Math.round(parseFloat(t.time)*1e3):r,memoryKb:t.memory,exitCode:t.exit_code,engine:`judge0`}}}catch(e){console.warn(`[CompilerService] Judge0 CE attempt failed, trying fallback...`,e)}if(o.wandboxCompiler)try{let e=await fetch(`https://wandbox.org/api/compile.json`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({compiler:o.wandboxCompiler,code:t,stdin:i||void 0})});if(e.ok){let t=await e.json(),n=Math.round(performance.now()-a);return{success:t.status===`0`||t.status===0,stdout:t.program_output||t.program_message||``,stderr:t.compiler_error||null,compileOutput:t.compiler_message||null,executionTimeMs:n,engine:`wandbox`}}}catch(e){console.warn(`[CompilerService] Wandbox attempt failed...`,e)}if(r===`javascript`||r===`typescript`)return n(t,i);let s=Math.round(performance.now()-a);return{success:!1,stdout:``,stderr:`Network Error: Could not connect to remote compilation cluster for ${o.name}. Check your internet connection.`,compileOutput:null,executionTimeMs:s,engine:`local`}}export{r as n,t as r,e as t};