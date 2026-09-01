import React, { useState, useRef } from 'react';
import { PracticeChrome } from './PracticeChrome';
import { Play, AlertCircle, Clock } from 'lucide-react';

interface CodeEditorRunnerProps {
  title?: string;
  description?: string;
  language?: 'c' | 'python' | 'java' | 'cpp' | 'javascript';
  initialCode?: string;
}

const DEFAULT_STARTER: { [key: string]: string } = {
  c: `#include <stdio.h>

int main() {
    printf("Hello from C on KaizenQ!\\n");
    for (int i = 1; i <= 5; i++) {
        printf("Step %d: Processing element %d\\n", i, i * 10);
    }
    return 0;
}`,
  python: `# Python Object-Oriented Algorithm Example
class AlgorithmTester:
    def __init__(self, name):
        self.name = name
    
    def binary_search(self, arr, target):
        left, right = 0, len(arr) - 1
        while left <= right:
            mid = (left + right) // 2
            if arr[mid] == target:
                return mid
            elif arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1

tester = AlgorithmTester("BinarySearch")
data = [10, 20, 30, 40, 50, 60, 70, 80, 90]
target = 60
result = tester.binary_search(data, target)
print(f"Algorithm: {tester.name}")
print(f"Array: {data}")
print(f"Target {target} found at index: {result}")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 KaizenQ Java OOPs Execution Engine");
        
        String[] tracks = {"React Full-Stack", "Python AI", "DevOps & Cloud"};
        for (int i = 0; i < tracks.length; i++) {
            System.out.println("Track " + (i + 1) + ": " + tracks[i]);
        }
    }
}`,
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 6, 8};
    std::sort(nums.begin(), nums.end());
    
    std::cout << "Sorted Array: ";
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\\n";
    return 0;
}`,
  javascript: `// JavaScript In-Browser Runner
function calculateFibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

console.log("Fibonacci Sequence (10 terms):", calculateFibonacci(10));`,
};

const PISTON_LANGUAGE_MAP: { [key: string]: { language: string; version: string; file: string } } = {
  c: { language: 'c', version: '10.2.0', file: 'main.c' },
  python: { language: 'python', version: '3.10.0', file: 'main.py' },
  java: { language: 'java', version: '15.0.2', file: 'Main.java' },
  cpp: { language: 'c++', version: '10.2.0', file: 'main.cpp' },
  javascript: { language: 'javascript', version: '18.15.0', file: 'index.js' },
};

export const CodeEditorRunner: React.FC<CodeEditorRunnerProps> = ({
  title,
  description,
  language = 'python',
  initialCode,
}) => {
  const resolvedStarter = initialCode || DEFAULT_STARTER[language] || DEFAULT_STARTER.python;
  const [code, setCode] = useState<string>(resolvedStarter.trim());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stdout, setStdout] = useState<string | null>(null);
  const [stderr, setStderr] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>(language);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const config = PISTON_LANGUAGE_MAP[selectedLang] || PISTON_LANGUAGE_MAP.python;
  const displayTitle = title || `${config.language.toUpperCase()} Code Studio`;

  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setStdout(null);
    setStderr(null);

    const startTime = performance.now();

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ name: config.file, content: code }],
        }),
      });

      const data = await response.json();
      const endTime = performance.now();
      setExecTime(Math.round(endTime - startTime));

      if (data.run) {
        if (data.run.stdout) setStdout(data.run.stdout);
        if (data.run.stderr) setStderr(data.run.stderr);
        if (!data.run.stdout && !data.run.stderr) {
          setStdout('Program executed successfully with no output.');
        }
      } else if (data.message) {
        setStderr(data.message);
      }
    } catch (err: any) {
      setStderr(`Execution service error: ${err.message || 'Failed to reach code execution server'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = code.substring(0, start) + '    ' + code.substring(end);
      setCode(next);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleReset = () => {
    setCode(resolvedStarter.trim());
    setStdout(null);
    setStderr(null);
    setExecTime(null);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 6) }, (_, i) => i + 1);

  return (
    <PracticeChrome
      title={displayTitle}
      tabLabel={config.file}
      badgeText={config.language.toUpperCase()}
      badgeColor={selectedLang === 'python' ? 'sky' : selectedLang === 'c' ? 'blue' : selectedLang === 'java' ? 'rose' : 'emerald'}
      description={description || 'Write, compile, and execute code with real compiler stdout/stderr output.'}
      onReset={handleReset}
      isMaximized={isMaximized}
      onToggleMaximize={() => setIsMaximized(!isMaximized)}
      rightActions={
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
          {['c', 'python', 'java', 'cpp', 'javascript'].map((l) => (
            <button
              key={l}
              onClick={() => {
                setSelectedLang(l);
                setCode(DEFAULT_STARTER[l] || '');
              }}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer uppercase ${
                selectedLang === l ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      }
    >
      {/* ── Editor Workspace with Line Numbers ──────────────────────────────── */}
      <div className="relative flex bg-slate-950 min-h-[220px]">
        {/* Line Numbers */}
        <div className="w-10 py-4 select-none font-mono text-xs text-slate-600 text-right pr-3 bg-slate-950/80 border-r border-slate-800/80 shrink-0">
          {lineNumbers.map((n) => (
            <div key={n} className="leading-relaxed">{n}</div>
          ))}
        </div>

        {/* Textarea Editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-sky-200 focus:outline-none resize-none min-h-[200px]"
          placeholder="Write your code here..."
        />
      </div>

      {/* ── Action Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border-t border-slate-800">
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          Press <strong>Ctrl + Enter</strong> to compile & run
        </span>

        <button
          onClick={handleRun}
          disabled={isRunning || !code.trim()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Compiling & Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>

      {/* ── Terminal Output / Console ────────────────────────────────────────── */}
      {(stdout !== null || stderr !== null) && (
        <div className="border-t border-slate-800 bg-slate-950 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300">Program Output (stdout / stderr)</span>
            {execTime !== null && (
              <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                <Clock className="w-3 h-3" /> {execTime}ms
              </span>
            )}
          </div>

          <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
            {stdout && (
              <pre className="text-slate-200 whitespace-pre-wrap">{stdout}</pre>
            )}
            {stderr && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Compiler / Runtime Error:
                </div>
                <pre className="whitespace-pre-wrap">{stderr}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </PracticeChrome>
  );
};

export default CodeEditorRunner;
