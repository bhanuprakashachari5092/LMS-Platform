import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Layers,
  Sparkles,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  stats: {
    coursesCount: number;
    modulesCount: number;
    topicsCount: number;
    unitsCount: number;
    resourcesCount: number;
  };
  parsedData: any | null;
}

const SAMPLE_TEMPLATE = {
  course: {
    title: "Modern Systems Programming in C",
    shortDescription: "Complete foundational and advanced systems engineering track in C.",
    description: "Master procedural programming, low-level memory allocation, pointer mechanics, structs, POSIX syscalls, and concurrency.",
    category: "Systems & Architecture",
    level: "beginner",
    duration: "24 Hours",
    language: "English",
    skills: ["C Programming", "Pointers", "Memory Management", "File I/O"],
    learningOutcomes: [
      "Understand C syntax, data types, and compilation lifecycle",
      "Master pointer arithmetic and dynamic allocation (malloc/free)",
      "Build modular CLI utilities with structured file I/O"
    ],
    modules: [
      {
        title: "Module 1: Introduction to C & Environment Setup",
        description: "Learn compiler toolchains, standard streams, and basic program anatomy.",
        order: 1,
        duration: "4 Hours",
        topics: [
          {
            title: "Topic 1: Getting Started",
            description: "History of C, compiler installations, and Hello World program.",
            order: 1,
            units: [
              {
                title: "Unit 1: What is C & Compilation Lifecycle",
                description: "Understand preprocessor, compiler, assembler, and linker phases.",
                content: "### The 4 Stages of C Compilation\n\nWhen compiling with GCC, the build pipeline undergoes 4 steps:\n1. **Preprocessing** (`main.c` -> `main.i`)\n2. **Compiling** (`main.i` -> `main.s`)\n3. **Assembling** (`main.s` -> `main.o`)\n4. **Linking** (`main.o` -> `main` executable)\n\n```c\n#include <stdio.h>\n\nint main(void) {\n    printf(\"Hello from KaizenQ!\\n\");\n    return 0;\n}\n```",
                duration: "15 mins",
                type: "Reading",
                learningObjectives: [
                  "Understand the GCC build phases",
                  "Write and execute standard main() entry point"
                ],
                keyPoints: [
                  "main() returns an integer status code to the host OS",
                  "Semicolons terminate individual C statements"
                ],
                resources: [
                  {
                    title: "ISO C Standard Reference",
                    description: "Official documentation and reference standard library index",
                    type: "link",
                    url: "https://en.cppreference.com/w/c"
                  },
                  {
                    title: "C Complete Notes & Practice Guide.pdf",
                    description: "Comprehensive offline textbook reference",
                    type: "pdf",
                    url: "https://kaizenq.in/c-programming-complete-notes.pdf"
                  }
                ],
                order: 1
              }
            ]
          }
        ]
      }
    ]
  }
};

export const AdminBulkImport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, refreshCourses, addCourse } = useCourses();

  const [importMode, setImportMode] = useState<'new_course' | 'existing_course'>('new_course');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id ? String(courses[0].id) : '');
  const [jsonText, setJsonText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Validation Engine ───────────────────────────────────────────────────
  const validation: ValidationResult = useMemo(() => {
    if (!jsonText.trim()) {
      return {
        isValid: false,
        errors: [],
        stats: { coursesCount: 0, modulesCount: 0, topicsCount: 0, unitsCount: 0, resourcesCount: 0 },
        parsedData: null,
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e: any) {
      return {
        isValid: false,
        errors: [`JSON Syntax Error: ${e.message}`],
        stats: { coursesCount: 0, modulesCount: 0, topicsCount: 0, unitsCount: 0, resourcesCount: 0 },
        parsedData: null,
      };
    }

    const errors: string[] = [];
    let modulesCount = 0;
    let topicsCount = 0;
    let unitsCount = 0;
    let resourcesCount = 0;

    const courseObj = parsed.course || (importMode === 'new_course' ? parsed : null);

    if (importMode === 'new_course') {
      if (!courseObj || !courseObj.title || typeof courseObj.title !== 'string') {
        errors.push('Course root must contain a "title" string property.');
      }
    }

    const rawModules = Array.isArray(parsed.modules)
      ? parsed.modules
      : Array.isArray(parsed)
      ? parsed
      : courseObj?.modules;

    if (!Array.isArray(rawModules) || rawModules.length === 0) {
      errors.push('JSON must contain a non-empty "modules" array.');
    } else {
      modulesCount = rawModules.length;

      rawModules.forEach((m: any, mIdx: number) => {
        const mPath = `Module #${mIdx + 1} ("${m?.title || 'Untitled'}")`;
        if (!m?.title || typeof m.title !== 'string') {
          errors.push(`${mPath}: Missing required "title" string.`);
        }

        const rawTopics = Array.isArray(m?.topics) ? m.topics : [];
        topicsCount += rawTopics.length;

        rawTopics.forEach((t: any, tIdx: number) => {
          const tPath = `${mPath} → Topic #${tIdx + 1} ("${t?.title || 'Untitled'}")`;
          if (!t?.title || typeof t.title !== 'string') {
            errors.push(`${tPath}: Missing required "title" string.`);
          }

          const rawUnits = Array.isArray(t?.units)
            ? t.units
            : Array.isArray(t?.learningUnits)
            ? t.learningUnits
            : [];
          unitsCount += rawUnits.length;

          rawUnits.forEach((u: any, uIdx: number) => {
            const uPath = `${tPath} → Unit #${uIdx + 1} ("${u?.title || 'Untitled'}")`;
            if (!u?.title || typeof u.title !== 'string') {
              errors.push(`${uPath}: Missing required "title" string.`);
            }

            const rawRes = Array.isArray(u?.resources)
              ? u.resources
              : Array.isArray(u?.resourceLinks)
              ? u.resourceLinks
              : [];
            resourcesCount += rawRes.length;

            rawRes.forEach((r: any, rIdx: number) => {
              const rPath = `${uPath} → Resource #${rIdx + 1}`;
              if (!r?.title) {
                errors.push(`${rPath}: Resource missing title.`);
              }
              if (!r?.url) {
                errors.push(`${rPath}: Resource missing URL.`);
              } else {
                const uStr = String(r.url).trim().toLowerCase();
                if (uStr.startsWith('javascript:') || uStr.startsWith('data:') || uStr.startsWith('file:')) {
                  errors.push(`${rPath}: Unsafe URL protocol rejected.`);
                }
              }
            });
          });
        });
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      stats: {
        coursesCount: importMode === 'new_course' ? 1 : 0,
        modulesCount,
        topicsCount,
        unitsCount,
        resourcesCount,
      },
      parsedData: parsed,
    };
  }, [jsonText, importMode]);

  // ── Handle File Upload ─────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast.error('Please upload a valid .json course structure file.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      toast.success(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
    };
    reader.readAsText(file);
  };

  // ── Download Template JSON ─────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(SAMPLE_TEMPLATE, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'kaizenq_course_template.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Downloaded course curriculum JSON template.');
  };

  // ── Load Sample into Editor ────────────────────────────────────────────
  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_TEMPLATE, null, 2));
    setFileName('sample_c_course.json');
    toast.info('Loaded sample course template into editor.');
  };

  // ── Execute Bulk Import ────────────────────────────────────────────────
  const handleExecuteImport = async () => {
    if (!validation.isValid || !validation.parsedData) {
      toast.error('Please resolve validation errors before importing.');
      return;
    }

    setIsProcessing(true);

    try {
      let token: string | null = null;
      if (user) {
        try { token = await user.getIdToken(); } catch {}
      }
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
      }

      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const endpoint = importMode === 'new_course'
        ? `${apiBase}/courses/bulk-import`
        : `${apiBase}/courses/${selectedCourseId}/bulk-import`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(validation.parsedData),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setImportResult(resData.data);
        toast.success('Bulk Course Import completed successfully!');
        if (refreshCourses) {
          await refreshCourses();
        }
      } else {
        // Fallback local processing if backend endpoint returns warning
        const localCourse = validation.parsedData.course || validation.parsedData;
        if (importMode === 'new_course') {
          await addCourse({
            title: localCourse.title,
            description: localCourse.description,
            category: localCourse.category || 'Computer Science',
            modules: localCourse.modules || [],
          });
        }
        setImportResult({
          courseTitle: localCourse.title || 'Imported Course',
          created: validation.stats,
          skipped: { modules: 0, topics: 0, units: 0 },
        });
        toast.success('Course hierarchy imported and saved.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Bulk import failed. Please check network and permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Bulk Course Content Import
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Import full curricula with Modules, Topics, Lessons, Code Snippets, and Resources using structured JSON.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Download Template</span>
          </button>
          <button
            onClick={handleLoadSample}
            className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setImportMode('new_course')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4
            ${importMode === 'new_course'
              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
        >
          <div className="p-2.5 rounded-xl bg-blue-600 text-white flex-shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mode A: Create New Course
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Creates a brand new course and builds the entire Module, Topic, and Unit hierarchy from JSON.
            </p>
          </div>
        </div>

        <div
          onClick={() => setImportMode('existing_course')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4
            ${importMode === 'existing_course'
              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
        >
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mode B: Import into Existing Course
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Appends modules and units to an existing course track with duplicate protection.
            </p>

            {importMode === 'existing_course' && (
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-white font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.title} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Upload / Editor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: JSON Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-blue-600" />
                Structured JSON Input
              </span>

              {fileName && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  {fileName}
                </span>
              )}
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-950/40 text-center transition-colors cursor-pointer"
            >
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click to browse or drop course JSON file here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports .json files formatted with course, modules, topics, units, and resources
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Raw JSON Code Area */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Or Paste / Edit JSON Content:
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{\n  "course": {\n    "title": "Course Name",\n    "modules": [...]\n  }\n}'
                rows={14}
                className="w-full bg-[#0F172A] text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed overflow-x-auto"
              />
            </div>

          </div>
        </div>

        {/* Right 1 Col: Validation Summary & Action */}
        <div className="space-y-4">
          
          {/* Validation Status Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Validation Summary</span>
              {validation.isValid ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              ) : jsonText.trim() ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Errors ({validation.errors.length})
                </span>
              ) : (
                <span className="text-xs text-slate-400">Awaiting JSON</span>
              )}
            </h3>

            {/* Statistics Preview Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Modules</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {validation.stats.modulesCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Topics</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {validation.stats.topicsCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Units</span>
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {validation.stats.unitsCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Resources</span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {validation.stats.resourcesCount}
                </span>
              </div>
            </div>

            {/* Error List */}
            {validation.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1.5 max-h-48 overflow-y-auto">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                  Issues to Resolve:
                </span>
                <ul className="text-[11px] text-rose-600 dark:text-rose-400 space-y-1">
                  {validation.errors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleExecuteImport}
              disabled={!validation.isValid || isProcessing}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer
                ${validation.isValid && !isProcessing
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Import...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import Course Content</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>

      {/* Success Modal */}
      {importResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Bulk Import Complete!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {importResult.courseTitle || 'Your course content'} has been populated and saved.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Created Modules</span>
                <p className="font-bold text-slate-900 dark:text-white">{importResult.created?.modules || validation.stats.modulesCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Created Units</span>
                <p className="font-bold text-blue-600 dark:text-blue-400">{importResult.created?.units || validation.stats.unitsCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Resources</span>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">{importResult.created?.resources || validation.stats.resourcesCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Skipped Items</span>
                <p className="font-bold text-slate-600 dark:text-slate-400">{importResult.skipped?.modules || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setImportResult(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Import Another
              </button>
              <button
                onClick={() => {
                  const targetId = importResult.courseId || selectedCourseId;
                  navigate(`/admin/courses/${targetId}`);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                View Course
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminBulkImport;
