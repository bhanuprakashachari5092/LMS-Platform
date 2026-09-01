import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import type { ModuleItem, LearningUnitItem } from '@/contexts/CourseContext';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  Search,
  FileCode,
  Save,
  ChevronUp,
  BookOpen,
  AlertTriangle,
  GripVertical,
  Sparkles,
  ArrowLeft,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  List,
  Quote,
  Table,
  HelpCircle,
  Video,
  Paperclip,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import type { ResourceItem } from '@/services/contentManagementService';
import { sanitizeAdminInput, sanitizeMarkdownContent } from '@/utils/adminDataSanitizer';
import { MarkdownContent } from '@/components/learning/MarkdownContent';
import { aiAutofillService } from '@/services/aiAutofillService';

// Calculate estimated reading time (~200 words per minute)
function calculateEstimatedReadMinutes(text?: string): number {
  if (!text) return 3;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function countWords(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countLines(text?: string): number {
  if (!text) return 1;
  return text.split('\n').length;
}

function formatDate(dateVal?: string | number | Date): string {
  if (!dateVal) return 'Just now';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

export const AdminContentStudio: React.FC = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { courses, updateCourse } = useCourses();

  // Selected Course ID
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>(
    courseId || searchParams.get('courseId') || (courses[0]?.id ? String(courses[0].id) : '')
  );

  // Active state selections
  const [selectedLesson, setSelectedLesson] = useState<LearningUnitItem | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // Panel View States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isCourseDrawerOpen, setIsCourseDrawerOpen] = useState<boolean>(false);

  // Dirty state tracking for unsaved changes guard
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Drag and drop reordering state
  const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ lessonId: string; sourceModId: string; sourceTopId: string } | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);
  const [dragOverModId, setDragOverModId] = useState<string | null>(null);

  // AI Lesson Autofill State
  const [isAutofillingLesson, setIsAutofillingLesson] = useState(false);
  const [showAiOverwriteModal, setShowAiOverwriteModal] = useState(false);

  // Expanded syllabus nodes mapping
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Tree search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Tabs
  const [activeTab, setActiveTab] = useState<'reading' | 'overview' | 'video' | 'resources' | 'quiz' | 'assignment'>('reading');

  // Save Status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Resource helpers
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceCat, setNewResourceCat] = useState<'PDF' | 'DOCX' | 'ZIP' | 'Source Code' | 'External Link'>('PDF');

  // Textarea ref for markdown toolbar insertions & cursor
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Find active course record
  const activeCourse = useMemo(() => {
    return (
      courses.find(c => String(c.id) === String(selectedCourseId) || c.slug === selectedCourseId) ||
      courses[0]
    );
  }, [courses, selectedCourseId]);

  // Sync selected course from URL parameter changes
  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    } else if (courses[0]?.id && !selectedCourseId) {
      setSelectedCourseId(String(courses[0].id));
    }
  }, [courseId, courses, selectedCourseId]);

  // Expand all modules by default on load
  useEffect(() => {
    if (activeCourse?.modules) {
      const allExpanded: Record<string, boolean> = {};
      activeCourse.modules.forEach(m => {
        allExpanded[m.id] = true;
      });
      setExpandedModules(allExpanded);

      // Auto-select first lesson if none selected
      if (!selectedLesson) {
        const firstMod = activeCourse.modules[0];
        const firstTopic = firstMod?.topics?.[0];
        const firstUnit = firstTopic?.learningUnits?.[0];
        if (firstUnit && firstMod && firstTopic) {
          setSelectedLesson(firstUnit);
          setActiveModuleId(firstMod.id);
          setActiveTopicId(firstTopic.id);
        }
      }
    }
  }, [activeCourse]);

  // Global Keyboard Shortcuts (Ctrl+S / Cmd+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLesson, activeCourse, activeModuleId, activeTopicId, isDirty]);

  // Browser reload / navigation unsaved guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Save Lesson Handler
  const handleManualSave = async () => {
    if (!activeCourse || !selectedLesson || !activeModuleId || !activeTopicId) return;

    setSaveStatus('saving');
    try {
      const sanitizedLesson: LearningUnitItem = {
        ...selectedLesson,
        title: sanitizeAdminInput(selectedLesson.title),
        description: sanitizeAdminInput(selectedLesson.description),
        readingContent: sanitizeMarkdownContent(selectedLesson.readingContent || ''),
        lastSavedAt: new Date().toISOString(),
        order: selectedLesson.order || 1,
        orderIndex: selectedLesson.orderIndex || selectedLesson.order || 1,
      };

      const updatedModules = (activeCourse.modules || []).map(m => {
        if (m.id === activeModuleId) {
          const nextTopics = m.topics.map(t => {
            if (t.id === activeTopicId) {
              const nextUnits = t.learningUnits.map(u => (u.id === selectedLesson.id ? sanitizedLesson : u));
              return { ...t, learningUnits: nextUnits };
            }
            return t;
          });
          return { ...m, topics: nextTopics };
        }
        return m;
      });

      await updateCourse(activeCourse.id, { modules: updatedModules });
      setSelectedLesson(sanitizedLesson);
      setIsDirty(false);
      setSaveStatus('saved');
      toast.success(`Lesson "${sanitizedLesson.title}" saved successfully!`);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      setSaveStatus('idle');
      toast.error(err.message || 'Failed to save lesson.');
    }
  };

  // Safe Navigation Handler with Discard Modal
  const safeNavigate = (action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action);
      setShowDiscardModal(true);
    } else {
      action();
    }
  };

  // Select lesson node
  const handleSelectLesson = (unit: LearningUnitItem, mId: string, tId: string) => {
    if (selectedLesson?.id === unit.id) return;
    safeNavigate(() => {
      setSelectedLesson(unit);
      setActiveModuleId(mId);
      setActiveTopicId(tId);
      setIsDirty(false);
    });
  };

  // Input change handler
  const handleInputChange = (field: keyof LearningUnitItem, value: any) => {
    if (!selectedLesson) return;
    setSelectedLesson(prev => (prev ? { ...prev, [field]: value } : null));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  // Markdown Toolbar Inserts
  const insertMarkdown = (type: string) => {
    if (!textareaRef.current || !selectedLesson) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedLesson.readingContent || '';
    const selected = text.substring(start, end);

    let prefix = '';
    let suffix = '';
    let placeholder = '';

    switch (type) {
      case 'h2':
        prefix = '\n## ';
        placeholder = selected || 'Heading 2';
        break;
      case 'h3':
        prefix = '\n### ';
        placeholder = selected || 'Heading 3';
        break;
      case 'bold':
        prefix = '**';
        suffix = '**';
        placeholder = selected || 'bold text';
        break;
      case 'italic':
        prefix = '_';
        suffix = '_';
        placeholder = selected || 'italic text';
        break;
      case 'quote':
        prefix = '\n> ';
        placeholder = selected || 'Quote text';
        break;
      case 'list':
        prefix = '\n- ';
        placeholder = selected || 'List item';
        break;
      case 'code-inline':
        prefix = '`';
        suffix = '`';
        placeholder = selected || 'code';
        break;
      case 'code-js':
        prefix = '\n```javascript\n';
        suffix = '\n```\n';
        placeholder = selected || '// JavaScript code example\nconsole.log("Hello, World!");';
        break;
      case 'code-py':
        prefix = '\n```python\n';
        suffix = '\n```\n';
        placeholder = selected || '# Python code example\ndef execute():\n    print("Hello from Python")';
        break;
      case 'code-sql':
        prefix = '\n```sql\n';
        suffix = '\n```\n';
        placeholder = selected || 'SELECT * FROM users WHERE active = true;';
        break;
      case 'code-bash':
        prefix = '\n```bash\n';
        suffix = '\n```\n';
        placeholder = selected || '# Terminal Command\necho "Initializing setup..."';
        break;
      case 'tip':
        prefix = '\n> 💡 **Tip:** ';
        placeholder = selected || 'Always validate environment configuration before running migrations.';
        break;
      case 'note':
        prefix = '\n> 📌 **Note:** ';
        placeholder = selected || 'This feature is supported across modern LTS versions.';
        break;
      case 'warning':
        prefix = '\n> ⚠️ **Warning:** ';
        placeholder = selected || 'Do not execute hard reset in production branches.';
        break;
      case 'table':
        prefix = '\n| Concept | Description | Example |\n|---|---|---|\n| Item 1 | Core overview | `example_1` |\n| Item 2 | Advanced details | `example_2` |\n';
        break;
      case 'hr':
        prefix = '\n---\n';
        break;
      default:
        break;
    }

    const replacement = prefix + placeholder + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    handleInputChange('readingContent', newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
    }, 50);
  };

  // AI Autofill Trigger
  const handleAiAutofillLesson = async () => {
    if (!selectedLesson) return;
    if (!selectedLesson.title || selectedLesson.title.trim().length < 3) {
      toast.error('Please enter a lesson title with at least 3 characters first.');
      return;
    }

    // Check if existing content has more than 50 words and prompt confirmation
    const currentWordCount = countWords(selectedLesson.readingContent);
    if (currentWordCount > 50 && !showAiOverwriteModal) {
      setShowAiOverwriteModal(true);
      return;
    }

    setShowAiOverwriteModal(false);
    setIsAutofillingLesson(true);

    try {
      const result = await aiAutofillService.autofillLesson({
        lessonTitle: selectedLesson.title.trim(),
        courseTitle: activeCourse?.title,
        category: activeCourse?.category,
        level: activeCourse?.level
      });

      handleInputChange('readingContent', result.content);
      handleInputChange('estimatedReadMinutes' as any, result.estimatedReadMinutes);
      setActiveTab('reading');
      toast.success('✨ In-depth lesson draft generated! Review in the live preview.');
    } catch (err: any) {
      toast.error(err.message || 'Autofill failed — please try again or write manually.');
    } finally {
      setIsAutofillingLesson(false);
    }
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, lessonId: string, sourceModId: string, sourceTopId: string) => {
    e.dataTransfer.setData('text/plain', lessonId);
    setDraggedLessonInfo({ lessonId, sourceModId, sourceTopId });
  };

  const handleDropOnLesson = (e: React.DragEvent, targetLessonId: string, targetModId: string, targetTopId: string) => {
    e.preventDefault();
    setDragOverLessonId(null);
    if (!draggedLessonInfo || !activeCourse || !activeCourse.modules) return;
    if (draggedLessonInfo.lessonId === targetLessonId) return;

    const updated = [...activeCourse.modules];
    let movingUnit: LearningUnitItem | null = null;

    updated.forEach(m => {
      m.topics.forEach(t => {
        const uIdx = t.learningUnits.findIndex(u => u.id === draggedLessonInfo.lessonId);
        if (uIdx !== -1) {
          movingUnit = t.learningUnits[uIdx];
          t.learningUnits.splice(uIdx, 1);
        }
      });
    });

    if (!movingUnit) return;

    updated.forEach(m => {
      if (m.id === targetModId) {
        m.topics.forEach(t => {
          if (t.id === targetTopId) {
            const targetIdx = t.learningUnits.findIndex(u => u.id === targetLessonId);
            if (targetIdx !== -1) {
              t.learningUnits.splice(targetIdx, 0, movingUnit!);
            } else {
              t.learningUnits.push(movingUnit!);
            }
          }
        });
      }
    });

    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Reordered lesson position.');
    setDraggedLessonInfo(null);
  };

  // Move Lesson Up/Down
  const moveLesson = (mId: string, tId: string, uId: string, direction: 'up' | 'down') => {
    if (!activeCourse?.modules) return;
    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        const nextTopics = m.topics.map(t => {
          if (t.id === tId) {
            const idx = t.learningUnits.findIndex(u => u.id === uId);
            if (idx === -1) return t;
            if (direction === 'up' && idx === 0) return t;
            if (direction === 'down' && idx === t.learningUnits.length - 1) return t;
            const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
            const units = [...t.learningUnits];
            const [moved] = units.splice(idx, 1);
            units.splice(targetIdx, 0, moved);
            return { ...t, learningUnits: units.map((u, i) => ({ ...u, order: i + 1, orderIndex: i + 1 })) };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
  };

  // Add new lesson
  const addLessonNode = (mId: string, tId: string) => {
    if (!activeCourse?.modules) return;
    const targetModule = activeCourse.modules.find(m => m.id === mId);
    const existingCount = targetModule?.topics?.flatMap(t => t.learningUnits).length || 0;
    const newLessonId = `lesson_${Date.now()}`;
    const newLesson: LearningUnitItem = {
      id: newLessonId,
      title: `Lesson ${existingCount + 1}: New Educational Topic`,
      description: 'Comprehensive lesson notes and explanations.',
      duration: '15 mins',
      type: 'Reading',
      order: existingCount + 1,
      orderIndex: existingCount + 1,
      lastSavedAt: new Date().toISOString(),
      readingContent: `# New Educational Topic\n\n## 1. Overview\nProvide a clear overview of the lesson objectives here.\n\n## 2. Core Concepts\nExplain the foundational concepts in detail.\n\n\`\`\`javascript\n// Code example\nconsole.log("Welcome to KaizenQ!");\n\`\`\`\n\n> 💡 **Tip:** Add actionable advice for students.\n\n### Practice\n1. Write a test case.\n2. Run the validation pipeline.\n`
    };

    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        const nextTopics = m.topics.map(t => {
          if (t.id === tId) {
            const list = [...t.learningUnits, newLesson];
            return { ...t, learningUnits: list.map((u, idx) => ({ ...u, order: idx + 1, orderIndex: idx + 1 })) };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    setSelectedLesson(newLesson);
    setActiveModuleId(mId);
    setActiveTopicId(tId);
    setIsDirty(false);
    toast.success('Added new Lesson. Ready to edit!');
  };

  // Add new module
  const addModuleNode = () => {
    if (!activeCourse) return;
    const newModId = `mod_${Date.now()}`;
    const newTopicId = `top_${Date.now()}`;
    const newMod: ModuleItem = {
      id: newModId,
      title: `Module ${(activeCourse.modules?.length || 0) + 1}: New Curriculum Module`,
      description: 'Module overview and topics.',
      duration: '3 Hours',
      topics: [
        {
          id: newTopicId,
          title: 'Topic 1: Foundations',
          description: 'Topic introduction',
          estimatedDuration: '45 mins',
          learningUnits: [
            {
              id: `lesson_${Date.now()}`,
              title: 'Module Introduction & Notes',
              description: 'Introductory notes.',
              duration: '15 mins',
              type: 'Reading',
              order: 1,
              orderIndex: 1,
              lastSavedAt: new Date().toISOString(),
              readingContent: '# Module Introduction\n\nWelcome to this module!'
            }
          ]
        }
      ]
    };
    const updated = [...(activeCourse.modules || []), newMod];
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Added new Module.');
  };

  // Course Stats
  const courseStats = useMemo(() => {
    const totalModules = activeCourse?.modules?.length || 0;
    const allUnits = activeCourse?.modules?.flatMap(m => m.topics?.flatMap(t => t.learningUnits)) || [];
    const totalLessons = allUnits.length;
    const totalReadMinutes = allUnits.reduce((acc, u) => acc + calculateEstimatedReadMinutes(u.readingContent), 0);
    return { totalModules, totalLessons, totalReadMinutes };
  }, [activeCourse]);

  const currentWords = countWords(selectedLesson?.readingContent);
  const currentReadTime = calculateEstimatedReadMinutes(selectedLesson?.readingContent);
  const currentLines = countLines(selectedLesson?.readingContent);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* 1. TOP STUDIO NAVIGATION & TOOLBAR (Minimal, ~56px) */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0 backdrop-blur-md z-20">
        
        {/* Left: Back Link & Course Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => safeNavigate(() => navigate('/admin/courses'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            title="Return to Course Catalog table"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Course Selector Dropdown */}
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <select
              value={selectedCourseId}
              onChange={(e) => {
                const nextId = e.target.value;
                safeNavigate(() => {
                  setSelectedCourseId(nextId);
                  navigate(`/admin/course-content/${nextId}`);
                });
              }}
              className="bg-transparent text-white font-extrabold text-xs sm:text-sm border-none focus:outline-hidden cursor-pointer hover:text-indigo-400 transition-colors truncate max-w-[200px] sm:max-w-[320px]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.title} ({c.level || 'All Levels'})
                </option>
              ))}
            </select>

            {/* Quick Metadata Drawer Button */}
            <button
              type="button"
              onClick={() => setIsCourseDrawerOpen(true)}
              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="View & Edit Course Metadata"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions, Sync Badge, Preview & Save */}
        <div className="flex items-center gap-2.5 shrink-0 text-xs font-bold">
          
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className={isDirty ? 'text-amber-300' : 'text-emerald-300 font-medium'}>
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : isDirty ? 'Unsaved Changes' : 'Live Sync'}
            </span>
          </div>

          {/* AI Draft Button */}
          <button
            type="button"
            onClick={handleAiAutofillLesson}
            disabled={isAutofillingLesson || !selectedLesson?.title || selectedLesson.title.trim().length < 3}
            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            title="Auto-draft full markdown lesson content with AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAutofillingLesson ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAutofillingLesson ? 'Drafting...' : '✨ AI Draft'}</span>
          </button>

          {/* Preview Student View */}
          <Link
            to={`/course/${activeCourse?.slug || activeCourse?.id || ''}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
            title="Open Student-facing Course Player in new tab"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Preview</span>
          </Link>

          {/* Save Lesson Button */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
            title="Save Lesson (Ctrl+S / Cmd+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
            <span className="text-[10px] opacity-70 bg-indigo-700 px-1 py-0.5 rounded font-mono hidden lg:inline">⌘S</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN STUDIO WORKSPACE (3 Zones: Left Outline, Center Editor, Right Preview) */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* ZONE A: COLLAPSIBLE CURRICULUM OUTLINE PANEL (~300px) */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0 z-10 ${
            isSidebarOpen ? 'w-80' : 'w-0 border-r-0'
          } overflow-hidden`}
        >
          {/* Outline Panel Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Curriculum</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {courseStats.totalLessons} Lessons
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={addModuleNode}
                className="p-1 hover:bg-slate-800 text-indigo-400 rounded-lg cursor-pointer transition-colors"
                title="Add New Module"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                title="Collapse sidebar for full-width writing"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Filter */}
          <div className="p-3 border-b border-slate-800/80 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Scrollable Curriculum Tree with Drag & Drop */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {(!activeCourse?.modules || activeCourse.modules.length === 0) ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-xs text-slate-500">No modules in this course yet.</p>
                <button
                  type="button"
                  onClick={addModuleNode}
                  className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  + Create First Module
                </button>
              </div>
            ) : (
              activeCourse.modules.map((module) => {
                const isModExpanded = expandedModules[module.id] !== false;
                const allUnits = module.topics?.flatMap(t => t.learningUnits) || [];
                const firstTopic = module.topics?.[0];
                const isDragOverMod = dragOverModId === module.id;

                return (
                  <div
                    key={module.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverModId(module.id);
                    }}
                    onDragLeave={() => setDragOverModId(null)}
                    onDrop={(e) => firstTopic && handleDropOnLesson(e, firstTopic.learningUnits[0]?.id || '', module.id, firstTopic.id)}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isDragOverMod ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-800/80 bg-slate-950/40'
                    }`}
                  >
                    {/* Module Accordion Header */}
                    <div
                      onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !isModExpanded }))}
                      className="p-2.5 bg-slate-900/90 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-900 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isModExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        <span className="font-extrabold text-xs text-slate-200 truncate">
                          {module.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-950 rounded-md border border-slate-800">
                          {allUnits.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const firstTopicId = module.topics?.[0]?.id || `top_${Date.now()}`;
                            addLessonNode(module.id, firstTopicId);
                          }}
                          className="p-1 hover:bg-slate-800 text-indigo-400 rounded-md cursor-pointer"
                          title="Add Lesson"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    {isModExpanded && (
                      <div className="p-1.5 space-y-1">
                        {module.topics?.map(topic => (
                          <div key={topic.id} className="space-y-1">
                            {topic.learningUnits
                              .filter(u => !searchQuery || u.title.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map((unit, uIdx) => {
                                const isSelected = selectedLesson?.id === unit.id;
                                const readMins = calculateEstimatedReadMinutes(unit.readingContent);
                                const isDragOverThis = dragOverLessonId === unit.id;

                                return (
                                  <div
                                    key={unit.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, unit.id, module.id, topic.id)}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setDragOverLessonId(unit.id);
                                    }}
                                    onDragLeave={() => setDragOverLessonId(null)}
                                    onDrop={(e) => handleDropOnLesson(e, unit.id, module.id, topic.id)}
                                    onClick={() => handleSelectLesson(unit, module.id, topic.id)}
                                    className={`group flex items-center justify-between gap-2 p-2 rounded-xl cursor-pointer transition-all ${
                                      isDragOverThis
                                        ? 'border-2 border-indigo-500 bg-indigo-950'
                                        : isSelected
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <GripVertical className={`w-3.5 h-3.5 shrink-0 cursor-grab ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`} />
                                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                                        #{unit.order || uIdx + 1}
                                      </span>
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-xs truncate">{unit.title}</h5>
                                        <div className="flex items-center gap-1.5 text-[10px] opacity-75 mt-0.5">
                                          <span>📖 ~{readMins}m</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => moveLesson(module.id, topic.id, unit.id, 'up')}
                                        disabled={uIdx === 0}
                                        className={`p-1 rounded cursor-pointer ${isSelected ? 'hover:bg-indigo-700 text-indigo-100' : 'hover:bg-slate-800 text-slate-400'}`}
                                        title="Move Up"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveLesson(module.id, topic.id, unit.id, 'down')}
                                        disabled={uIdx === topic.learningUnits.length - 1}
                                        className={`p-1 rounded cursor-pointer ${isSelected ? 'hover:bg-indigo-700 text-indigo-100' : 'hover:bg-slate-800 text-slate-400'}`}
                                        title="Move Down"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Floating Sidebar Re-open Button (when collapsed) */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-3 top-3 z-30 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-400 rounded-xl shadow-lg cursor-pointer transition-all"
            title="Expand Curriculum Outline"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* ZONE B & C: PRIMARY EDITOR AND LIVE PREVIEW WORKSPACE */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          
          {!selectedLesson ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <FileCode className="w-12 h-12 text-slate-700 animate-pulse" />
              <div className="space-y-1 max-w-sm">
                <h4 className="font-extrabold text-sm text-slate-200">No Lesson Selected</h4>
                <p className="text-xs text-slate-500">
                  Select a lesson from the curriculum outline on the left or add a new lesson to start writing notes.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Top Studio Controls Bar */}
              <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
                
                {/* Lesson Title & Breadcrumb */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider font-mono">
                    Lesson #{selectedLesson.order || 1}:
                  </span>
                  <input
                    type="text"
                    value={selectedLesson.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-transparent text-white font-extrabold text-sm focus:outline-hidden focus:bg-slate-950/80 px-2 py-1 rounded-lg border border-transparent focus:border-slate-700 transition-colors max-w-sm sm:max-w-md truncate"
                    placeholder="Lesson Title..."
                  />
                </div>

                {/* View Mode & Secondary Tabs */}
                <div className="flex items-center gap-2">
                  
                  {/* Mode Switcher: Split vs Editor vs Preview */}
                  {activeTab === 'reading' && (
                    <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('split')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          previewMode === 'split' ? 'bg-indigo-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Side-by-Side Split View"
                      >
                        Split
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('editor')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          previewMode === 'editor' ? 'bg-indigo-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Full-Width Editor"
                      >
                        Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('preview')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          previewMode === 'preview' ? 'bg-indigo-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Full-Width Preview"
                      >
                        Preview
                      </button>
                    </div>
                  )}

                  {/* Secondary Tab Switchers */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl text-xs font-bold overflow-x-auto">
                    {[
                      { id: 'reading', label: '📖 Notes' },
                      { id: 'overview', label: '⚙️ Details' },
                      { id: 'video', label: '🎥 Video' },
                      { id: 'resources', label: '📎 Files' },
                      { id: 'quiz', label: '❓ Quiz' },
                      { id: 'assignment', label: '📝 Tasks' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === t.id ? 'bg-slate-800 text-indigo-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TAB 1: READING NOTES & MARKDOWN WORKSPACE */}
              {activeTab === 'reading' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  
                  {/* Grouped Markdown Toolbar with Dividers */}
                  {(previewMode === 'split' || previewMode === 'editor') && (
                    <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center gap-1.5 shrink-0 text-xs select-none">
                      
                      {/* Group 1: Typography & Text */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertMarkdown('h2')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
                          title="Heading 2 (##)"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('h3')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
                          title="Heading 3 (###)"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('bold')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
                          title="Bold (**text**)"
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('italic')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
                          title="Italic (_text_)"
                        >
                          Italic
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('list')}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
                          title="Bullet List (- item)"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('quote')}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
                          title="Blockquote (> quote)"
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="h-4 w-px bg-slate-700 mx-1" />

                      {/* Group 2: Code Blocks & Languages */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertMarkdown('code-inline')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-mono text-[11px] transition-colors cursor-pointer"
                          title="Inline Code (`code`)"
                        >
                          `code`
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('code-js')}
                          className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="JavaScript Code Block"
                        >
                          JS
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('code-py')}
                          className="px-2 py-1 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="Python Code Block"
                        >
                          Python
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('code-sql')}
                          className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="SQL Query Block"
                        >
                          SQL
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('code-bash')}
                          className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="Bash Terminal Block"
                        >
                          Bash
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="h-4 w-px bg-slate-700 mx-1" />

                      {/* Group 3: Callouts & Highlights */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertMarkdown('tip')}
                          className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="💡 Tip Callout Box"
                        >
                          💡 Tip
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('note')}
                          className="px-2 py-1 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="📌 Note Callout Box"
                        >
                          📌 Note
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('warning')}
                          className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="⚠️ Warning Callout Box"
                        >
                          ⚠️ Warning
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="h-4 w-px bg-slate-700 mx-1" />

                      {/* Group 4: Components */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertMarkdown('table')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          title="Insert Markdown Table"
                        >
                          <Table className="w-3.5 h-3.5" /> Table
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('hr')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                          title="Horizontal Divider"
                        >
                          Divider
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Editor & Preview Split Pane */}
                  <div className="flex-1 flex min-h-0 overflow-hidden">
                    
                    {/* Left: Raw Monospace Markdown Editor */}
                    {(previewMode === 'split' || previewMode === 'editor') && (
                      <div className={`${previewMode === 'split' ? 'w-1/2 border-r border-slate-800' : 'w-full'} flex flex-col min-h-0 bg-slate-950`}>
                        <textarea
                          ref={textareaRef}
                          value={selectedLesson.readingContent || ''}
                          onChange={(e) => handleInputChange('readingContent', e.target.value)}
                          placeholder="Type or paste markdown lesson content here..."
                          className="flex-1 p-5 bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed focus:outline-hidden resize-none overflow-y-auto selection:bg-indigo-600 selection:text-white"
                          spellCheck={false}
                        />
                      </div>
                    )}

                    {/* Right: Live Rendered Markdown Preview */}
                    {(previewMode === 'split' || previewMode === 'preview') && (
                      <div className={`${previewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col min-h-0 bg-slate-900/50 overflow-y-auto p-6 sm:p-8 select-text`}>
                        <div className="max-w-3xl mx-auto w-full">
                          <MarkdownContent content={selectedLesson.readingContent || '*No content written yet.*'} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM STATUS BAR (Word count, read time, line numbers) */}
                  <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0 select-none">
                    <div className="flex items-center gap-4">
                      <span><strong>{currentWords}</strong> words</span>
                      <span>•</span>
                      <span><strong>{currentLines}</strong> lines</span>
                      <span>•</span>
                      <span className="text-indigo-400"><strong>~{currentReadTime}</strong> min read</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>Saved: {formatDate(selectedLesson.lastSavedAt)}</span>
                      <span>•</span>
                      <span className="text-slate-500">Markdown Studio v2.0</span>
                    </div>
                  </footer>
                </div>
              )}

              {/* TAB 2: DETAILS & MODULE PLACEMENT */}
              {activeTab === 'overview' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <BookOpen className="w-4 h-4 text-indigo-400" /> Lesson Specifications
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Lesson Title</label>
                        <input
                          type="text"
                          value={selectedLesson.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Estimated Duration</label>
                        <input
                          type="text"
                          value={selectedLesson.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-indigo-500"
                          placeholder="e.g. 20 mins"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Delivery Type</label>
                        <select
                          value={selectedLesson.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden cursor-pointer"
                        >
                          <option value="Reading">Reading</option>
                          <option value="Video">Video</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Assignment">Assignment</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Summary / Learning Objective</label>
                        <textarea
                          rows={3}
                          value={selectedLesson.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VIDEO STREAM */}
              {activeTab === 'video' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Video className="w-4 h-4 text-sky-400" /> Video Stream URL
                    </h3>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Direct Video / Embed URL</label>
                      <input
                        type="text"
                        value={selectedLesson.videoUrl || ''}
                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or https://player.vimeo.com/..."
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-sky-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ATTACHED RESOURCES */}
              {activeTab === 'resources' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Paperclip className="w-4 h-4 text-emerald-400" /> Attached Lesson Resources
                    </h3>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Resource title (e.g. CheatSheet.pdf)..."
                        value={newResourceName}
                        onChange={(e) => setNewResourceName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden"
                      />
                      <select
                        value={newResourceCat}
                        onChange={(e) => setNewResourceCat(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="PDF">PDF</option>
                        <option value="DOCX">DOCX</option>
                        <option value="ZIP">ZIP</option>
                        <option value="Source Code">Source Code</option>
                        <option value="External Link">Link</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newResourceName.trim()) return;
                          const resList = (selectedLesson as any).resources || [];
                          const newRes: ResourceItem = {
                            id: `res_${Date.now()}`,
                            name: newResourceName.trim(),
                            description: `Attached to ${selectedLesson.title}`,
                            category: newResourceCat,
                            fileSize: '1.2 MB',
                            downloadPermission: true,
                            fileUrl: '#'
                          };
                          handleInputChange('resources' as any, [...resList, newRes]);
                          setNewResourceName('');
                          toast.success('Resource attached.');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Attach
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {((selectedLesson as any).resources || []).map((r: ResourceItem) => (
                        <div key={r.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                          <span className="text-slate-200">📎 {r.name} ({r.category})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const resList = (selectedLesson as any).resources || [];
                              handleInputChange('resources' as any, resList.filter((x: any) => x.id !== r.id));
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: QUIZ */}
              {activeTab === 'quiz' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <HelpCircle className="w-4 h-4 text-amber-400" /> Interactive Lesson Quiz
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure multiple-choice questions for knowledge check after completing reading notes.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 6: ASSIGNMENT */}
              {activeTab === 'assignment' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <CheckSquare className="w-4 h-4 text-purple-400" /> Hands-on Assignment Task
                    </h3>
                    <p className="text-xs text-slate-400">
                      Set instructions, deliverables, and sandbox requirements for practical student assessment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. INLINE COURSE METADATA SETTINGS DRAWER */}
      {isCourseDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm text-white">Course Metadata</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCourseDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400">Course Title</label>
                <input
                  type="text"
                  value={activeCourse?.title || ''}
                  onChange={(e) => updateCourse(activeCourse.id, { title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Category</label>
                <input
                  type="text"
                  value={activeCourse?.category || ''}
                  onChange={(e) => updateCourse(activeCourse.id, { category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Difficulty Level</label>
                <input
                  type="text"
                  value={activeCourse?.level || ''}
                  onChange={(e) => updateCourse(activeCourse.id, { level: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Short Description</label>
                <textarea
                  rows={3}
                  value={activeCourse?.shortDescription || ''}
                  onChange={(e) => updateCourse(activeCourse.id, { shortDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCourseDrawerOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. UNSAVED CHANGES DISCARD MODAL */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">Unsaved Changes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have unsaved edits in "{selectedLesson?.title}". If you leave or switch lessons without saving, your changes will be discarded.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  setIsDirty(false);
                  if (pendingAction) {
                    pendingAction();
                    setPendingAction(null);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Discard & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI OVERWRITE CONFIRMATION MODAL */}
      {showAiOverwriteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">Replace with AI Draft?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This lesson already contains {currentWords} words of notes. Generating an AI draft will replace the current text.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAiOverwriteModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiAutofillLesson}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Replace with AI Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentStudio;
