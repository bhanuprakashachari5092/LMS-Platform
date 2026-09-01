import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateCourseSchema } from '../../../../shared/validators/course.validator';
import type { UpdateCourseInput } from '../../../../shared/validators/course.validator';
import { courseService } from '../../services/courseService';
import { useCourses } from '@/contexts/CourseContext';
import type { ModuleItem, TopicItem, LearningUnitItem } from '@/contexts/CourseContext';
import { LoadingSkeleton } from '../../components/courses/LoadingSkeleton';
import { CloudinaryUploadZone } from '../../components/admin/CloudinaryUploadZone';
import { aiAutofillService } from '@/services/aiAutofillService';
import { MarkdownContent } from '@/components/learning/MarkdownContent';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Image as ImageIcon,
  Layers,
  FileText,
  Paperclip,
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  ExternalLink,
  Video,
  FileCode,
  GitFork,
  X,
  Bold,
  Italic,
  List,
  Code2,
  Quote,
  Table,
  Terminal,
  Database,
  GitBranch,
  Server,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';

export type CourseTab = 'details' | 'curriculum' | 'content' | 'resources' | 'settings';

export const AdminCourseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCourses } = useCourses();

  // Active Tab State
  const initialTab = (searchParams.get('tab') as CourseTab) || 'details';
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);

  // Sync tab with URL
  const handleTabChange = (tab: CourseTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);

  // Save State Tracking
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved');

  // Cloudinary Media States
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailPublicId, setThumbnailPublicId] = useState<string>('');

  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverPublicId, setCoverPublicId] = useState<string>('');

  // Course Basic Fields
  const [skillsInput, setSkillsInput] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [outcomesInput, setOutcomesInput] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Curriculum & Lesson Hierarchy State
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<LearningUnitItem | null>(null);
  const [selectedModId, setSelectedModId] = useState<string | null>(null);
  const [selectedTopId, setSelectedTopId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Curriculum Modals & Inline Edit State
  const [newModuleName, setNewModuleName] = useState('');
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [activeTopicParentModId, setActiveTopicParentModId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [activeUnitParentInfo, setActiveUnitParentInfo] = useState<{ modId: string; topId: string } | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  // Content Tab: Markdown Editor State
  const [lessonMarkdown, setLessonMarkdown] = useState<string>('');
  const [lessonDescription, setLessonDescription] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resources Tab: State
  const [unitResources, setUnitResources] = useState<any[]>([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resType, setResType] = useState<string>('pdf');
  const [resUrl, setResUrl] = useState('');
  const [resDownloadable, setResDownloadable] = useState(true);

  // Settings Tab: State
  const [courseStatus, setCourseStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [courseVisibility, setCourseVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateCourseInput>({
    resolver: zodResolver(UpdateCourseSchema) as any,
  });

  const watchTitle = watch('title');

  // Prevent accidental navigation when there are unsaved changes
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

  // Load Course Data from Service
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const course = await courseService.getCourseBySlugOrId(id);
        if (course) {
          setCourseData(course);
          reset(course as any);

          // Thumbnails & Cover
          const thumb = course.thumbnail || (course as any).thumbnailUrl || '';
          setThumbnailPreview(thumb);
          setThumbnailPublicId((course as any).thumbnailPublicId || '');

          const cov = (course as any).coverImage || (course as any).coverImageUrl || (course as any).banner || '';
          setCoverPreview(cov);
          setCoverPublicId((course as any).coverImagePublicId || '');

          // Skills & Outcomes
          setSkillsInput(course.skills || []);
          setOutcomesInput(course.learningOutcomes || []);

          // Settings
          setCourseStatus((course.status as any) || 'published');
          setCourseVisibility((course.visibility as any) || 'public');
          setIsFeatured(Boolean(course.featured));

          // Modules & Units
          const courseMods = (course.modules as ModuleItem[]) || [];
          setModules(courseMods);

          // Expand all modules by default
          const exp: Record<string, boolean> = {};
          courseMods.forEach((m) => {
            exp[m.id] = true;
          });
          setExpandedModules(exp);

          // Auto-select first lesson if exists
          if (courseMods.length > 0 && courseMods[0].topics && courseMods[0].topics[0]?.learningUnits?.[0]) {
            const firstMod = courseMods[0];
            const firstTop = firstMod.topics[0];
            const firstUnit = firstTop.learningUnits[0];
            setSelectedUnit(firstUnit);
            setSelectedModId(firstMod.id);
            setSelectedTopId(firstTop.id);
            setLessonMarkdown(firstUnit.readingContent || firstUnit.conceptTheory || '');
            setLessonDescription(firstUnit.description || '');
            setUnitResources(firstUnit.resources || []);
          }

          setIsDirty(false);
          setSaveStatus('saved');
        } else {
          toast.error('Course not found.');
          navigate('/admin/courses');
        }
      } catch (err) {
        toast.error('Error fetching course data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, reset, navigate]);

  // Mark dirty on any user change
  const markDirty = () => {
    setIsDirty(true);
    setSaveStatus('unsaved');
  };

  // AI Autofill Trigger
  const handleAiAutofill = async () => {
    const titleVal = getValues('title');
    if (!titleVal || titleVal.trim().length < 3) {
      toast.error('Please enter at least 3 characters in the Course Title first.');
      return;
    }

    setIsAutofilling(true);
    try {
      const result = await aiAutofillService.autofillCourse({
        title: titleVal.trim(),
        category: getValues('category'),
        level: getValues('level'),
      });

      if (result.shortDescription) setValue('shortDescription', result.shortDescription);
      if (result.fullDescription) setValue('description', result.fullDescription);
      if (result.category) setValue('category', result.category as any);
      if (result.level) setValue('level', result.level as any);
      if (result.durationHours) setValue('duration', `${result.durationHours} Hours`);
      if (result.learningOutcomes && result.learningOutcomes.length > 0) {
        setOutcomesInput(result.learningOutcomes);
        setValue('learningOutcomes', result.learningOutcomes as any);
      }
      if (result.tags && result.tags.length > 0) {
        setSkillsInput(result.tags);
        setValue('skills', result.tags as any);
      }

      markDirty();
      toast.success('✨ Course details autofilled! Review and save your changes.');
    } catch (err: any) {
      toast.error(err.message || 'Autofill failed — please try again.');
    } finally {
      setIsAutofilling(false);
    }
  };

  // Skill Helpers
  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...skillsInput, newSkill.trim()];
    setSkillsInput(updated);
    setValue('skills', updated as any);
    setNewSkill('');
    markDirty();
  };

  const removeSkill = (index: number) => {
    const updated = skillsInput.filter((_, i) => i !== index);
    setSkillsInput(updated);
    setValue('skills', updated as any);
    markDirty();
  };

  // Outcome Helpers
  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    const updated = [...outcomesInput, newOutcome.trim()];
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
    setNewOutcome('');
    markDirty();
  };

  const removeOutcome = (index: number) => {
    const updated = outcomesInput.filter((_, i) => i !== index);
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
    markDirty();
  };

  // ── Curriculum Tree Actions ────────────────────────────────────────────────
  const toggleModuleExpand = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleSelectUnit = (unit: LearningUnitItem, modId: string, topId: string) => {
    // If current unit has unsaved lesson changes, sync them to local module state
    if (selectedUnit && selectedModId && selectedTopId) {
      setModules((prevMods) =>
        prevMods.map((m) => {
          if (m.id !== selectedModId) return m;
          return {
            ...m,
            topics: (m.topics || []).map((t) => {
              if (t.id !== selectedTopId) return t;
              return {
                ...t,
                learningUnits: (t.learningUnits || []).map((u) => {
                  if (u.id !== selectedUnit.id) return u;
                  return {
                    ...u,
                    readingContent: lessonMarkdown,
                    description: lessonDescription,
                    resources: unitResources,
                  };
                }),
              };
            }),
          };
        })
      );
    }

    setSelectedUnit(unit);
    setSelectedModId(modId);
    setSelectedTopId(topId);
    setLessonMarkdown(unit.readingContent || unit.conceptTheory || '');
    setLessonDescription(unit.description || '');
    setUnitResources(unit.resources || []);
  };

  const handleAddModule = () => {
    if (!newModuleName.trim()) return;
    const newMod: ModuleItem = {
      id: `module-${Date.now()}`,
      title: newModuleName.trim(),
      description: 'Core concepts and architectural overview',
      duration: '4 Hours',
      topics: [
        {
          id: `topic-${Date.now()}-1`,
          title: 'Foundations & Core Concepts',
          description: 'Topic introduction and fundamental theory',
          estimatedDuration: '45 mins',
          learningUnits: [
            {
              id: `unit-${Date.now()}-1`,
              title: 'Introduction & Overview',
              description: 'Core introduction to this module concept.',
              type: 'Reading',
              duration: '15 mins',
              readingContent: '# Introduction\n\nWelcome to this lesson topic.',
              order: 1,
            },
          ],
        },
      ],
    };
    const updated = [...modules, newMod];
    setModules(updated);
    setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
    setNewModuleName('');
    setShowAddModuleModal(false);
    markDirty();
    toast.success(`Module "${newMod.title}" created.`);
  };

  const handleDeleteModule = (modId: string) => {
    const target = modules.find((m) => m.id === modId);
    if (!target) return;
    if (confirm(`Are you sure you want to delete module "${target.title}"?`)) {
      const updated = modules.filter((m) => m.id !== modId);
      setModules(updated);
      if (selectedModId === modId) {
        setSelectedUnit(null);
        setSelectedModId(null);
        setSelectedTopId(null);
      }
      markDirty();
      toast.success('Module removed.');
    }
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim() || !activeTopicParentModId) return;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== activeTopicParentModId) return m;
        const newTop: TopicItem = {
          id: `topic-${Date.now()}`,
          title: newTopicName.trim(),
          description: 'Topic overview and practice exercises',
          estimatedDuration: '45 mins',
          learningUnits: [
            {
              id: `unit-${Date.now()}-1`,
              title: 'Lesson 1',
              description: 'Topic introduction',
              type: 'Reading',
              duration: '15 mins',
              readingContent: '# Lesson Overview\n\nWrite lesson markdown here.',
              order: 1,
            },
          ],
        };
        return {
          ...m,
          topics: [...(m.topics || []), newTop],
        };
      })
    );
    setNewTopicName('');
    setShowAddTopicModal(false);
    setActiveTopicParentModId(null);
    markDirty();
    toast.success('Topic added.');
  };

  const handleAddUnit = () => {
    if (!newUnitName.trim() || !activeUnitParentInfo) return;
    const { modId, topId } = activeUnitParentInfo;
    const newUnit: LearningUnitItem = {
      id: `unit-${Date.now()}`,
      title: newUnitName.trim(),
      description: 'Lesson overview',
      type: 'Reading',
      duration: '15 mins',
      readingContent: `# ${newUnitName.trim()}\n\nAdd your lesson content here.`,
      order: 1,
    };

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          topics: (m.topics || []).map((t) => {
            if (t.id !== topId) return t;
            newUnit.order = (t.learningUnits || []).length + 1;
            return {
              ...t,
              learningUnits: [...(t.learningUnits || []), newUnit],
            };
          }),
        };
      })
    );

    setSelectedUnit(newUnit);
    setSelectedModId(modId);
    setSelectedTopId(topId);
    setLessonMarkdown(newUnit.readingContent || '');
    setLessonDescription(newUnit.description || '');
    setUnitResources([]);
    setNewUnitName('');
    setShowAddUnitModal(false);
    setActiveUnitParentInfo(null);
    markDirty();
    toast.success(`Unit "${newUnit.title}" added.`);
  };

  const handleDeleteUnit = (modId: string, topId: string, unitId: string) => {
    if (confirm('Are you sure you want to delete this learning unit?')) {
      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== modId) return m;
          return {
            ...m,
            topics: (m.topics || []).map((t) => {
              if (t.id !== topId) return t;
              return {
                ...t,
                learningUnits: (t.learningUnits || []).filter((u) => u.id !== unitId),
              };
            }),
          };
        })
      );
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
      }
      markDirty();
      toast.success('Learning unit removed.');
    }
  };

  // Reorder Modules Up/Down
  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === modules.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...modules];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setModules(updated);
    markDirty();
  };

  // Reorder Units Up/Down
  const moveUnit = (modId: string, topId: string, unitIdx: number, direction: 'up' | 'down') => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          topics: (m.topics || []).map((t) => {
            if (t.id !== topId) return t;
            const units = [...(t.learningUnits || [])];
            if (direction === 'up' && unitIdx === 0) return t;
            if (direction === 'down' && unitIdx === units.length - 1) return t;
            const targetIdx = direction === 'up' ? unitIdx - 1 : unitIdx + 1;
            const temp = units[unitIdx];
            units[unitIdx] = units[targetIdx];
            units[targetIdx] = temp;
            units.forEach((u, i) => {
              u.order = i + 1;
            });
            return { ...t, learningUnits: units };
          }),
        };
      })
    );
    markDirty();
  };

  // ── Markdown Toolbar Helpers ───────────────────────────────────────────────
  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = lessonMarkdown.substring(start, end);
    let prefix = '';
    let suffix = '';
    let placeholder = selected;

    switch (syntax) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        placeholder = selected || 'bold text';
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        placeholder = selected || 'italic text';
        break;
      case 'h1':
        prefix = '\n# ';
        placeholder = selected || 'Main Heading';
        break;
      case 'h2':
        prefix = '\n## ';
        placeholder = selected || 'Section Heading';
        break;
      case 'h3':
        prefix = '\n### ';
        placeholder = selected || 'Sub-section Heading';
        break;
      case 'list':
        prefix = '\n- ';
        placeholder = selected || 'List item';
        break;
      case 'code':
        prefix = '\n```typescript\n';
        suffix = '\n```\n';
        placeholder = selected || '// Code snippet here';
        break;
      case 'quote':
        prefix = '\n> ';
        placeholder = selected || 'Key takeaway or quote';
        break;
      case 'table':
        prefix = '\n| Concept | Description | Example |\n|---|---|---|\n| Item 1 | Core summary | `val_1` |\n| Item 2 | Next details | `val_2` |\n';
        break;
      case 'practice-sql':
        prefix = '\n```practice-sql\n-- @title: SQL Hands-on Lab\nCREATE TABLE learners (id INT, name TEXT);\nINSERT INTO learners VALUES (1, "Bhanu");\nSELECT * FROM learners;\n```\n';
        break;
      case 'practice-terminal':
        prefix = '\n```practice-terminal\n# @title: Linux Terminal Practice\n```\n';
        break;
      case 'practice-git':
        prefix = '\n```practice-git\n# @title: Interactive Git Sandbox\n```\n';
        break;
      case 'practice-code':
        prefix = '\n```practice-python\ndef solution():\n    print("Hello from KaizenQ!")\nsolution()\n```\n';
        break;
      case 'practice-web':
        prefix = '\n```practice-web\n<h1>Interactive Web Component</h1>\n```\n';
        break;
      case 'practice-k8s':
        prefix = '\n```practice-k8s\n# Interactive Kubernetes Simulator\n```\n';
        break;
      default:
        break;
    }

    const replacement = prefix + placeholder + suffix;
    const newContent = lessonMarkdown.substring(0, start) + replacement + lessonMarkdown.substring(end);
    setLessonMarkdown(newContent);
    markDirty();

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
    }, 50);
  };

  // ── Resource Manager Helpers ──────────────────────────────────────────────
  const handleSaveResource = () => {
    if (!resTitle.trim() || !resUrl.trim()) {
      toast.error('Please enter both Resource Title and URL.');
      return;
    }

    const newRes = {
      id: editingResourceIndex !== null ? unitResources[editingResourceIndex]?.id || `res-${Date.now()}` : `res-${Date.now()}`,
      title: resTitle.trim(),
      description: resDescription.trim(),
      type: resType,
      url: resUrl.trim(),
      downloadable: resDownloadable,
    };

    let updated: any[];
    if (editingResourceIndex !== null) {
      updated = [...unitResources];
      updated[editingResourceIndex] = newRes;
    } else {
      updated = [...unitResources, newRes];
    }

    setUnitResources(updated);
    setShowAddResourceModal(false);
    setEditingResourceIndex(null);
    setResTitle('');
    setResDescription('');
    setResUrl('');
    setResDownloadable(true);
    markDirty();
    toast.success('Resource saved for unit.');
  };

  const handleDeleteResource = (idx: number) => {
    const updated = unitResources.filter((_, i) => i !== idx);
    setUnitResources(updated);
    markDirty();
    toast.success('Resource removed.');
  };

  // ── Master Save Handler ───────────────────────────────────────────────────
  const handleSaveAll = async () => {
    if (!id) return;
    if (outcomesInput.length < 2) {
      toast.error('Please provide at least 2 learning outcomes in Details.');
      setActiveTab('details');
      return;
    }

    setSaveStatus('saving');

    // If a unit is currently active, ensure its in-editor content is baked into the modules array
    let currentModulesState = [...modules];
    if (selectedUnit && selectedModId && selectedTopId) {
      currentModulesState = currentModulesState.map((m) => {
        if (m.id !== selectedModId) return m;
        return {
          ...m,
          topics: (m.topics || []).map((t) => {
            if (t.id !== selectedTopId) return t;
            return {
              ...t,
              learningUnits: (t.learningUnits || []).map((u) => {
                if (u.id !== selectedUnit.id) return u;
                return {
                  ...u,
                  readingContent: lessonMarkdown,
                  description: lessonDescription,
                  resources: unitResources,
                };
              }),
            };
          }),
        };
      });
      setModules(currentModulesState);
    }

    try {
      const formValues = getValues();
      const payload: any = {
        ...courseData,
        ...formValues,
        thumbnail: thumbnailPreview || formValues.thumbnail || courseData.thumbnail,
        thumbnailUrl: thumbnailPreview || formValues.thumbnail || courseData.thumbnail,
        thumbnailPublicId: thumbnailPublicId || undefined,
        coverImage: coverPreview || undefined,
        coverImageUrl: coverPreview || undefined,
        coverImagePublicId: coverPublicId || undefined,
        skills: skillsInput,
        learningOutcomes: outcomesInput,
        modules: currentModulesState,
        status: courseStatus,
        visibility: courseVisibility,
        featured: isFeatured,
        updatedAt: new Date().toISOString(),
      };

      await courseService.updateCourse(id, payload);
      await refreshCourses();

      setIsDirty(false);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      toast.success('🎉 Course changes saved successfully!');
    } catch (err: any) {
      setSaveStatus('error');
      toast.error(err.message || 'Failed to save course changes.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Sora'] text-slate-100 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      
      {/* Top Header & Save Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Back to Courses"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                Course CMS Editor
              </span>
              {isDirty ? (
                <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unsaved changes
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {lastSavedTime === 'Saved' ? 'Saved' : `Saved at ${lastSavedTime}`}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-xl">
              {watchTitle || 'Edit Course'}
            </h1>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={`/dashboard/course/${id}`}
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-4 h-4 text-sky-500" />
            <span>Student View</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saveStatus === 'saving'}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Tabbed Navigation Bar ─────────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl px-2 py-1.5 shadow-xs">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
          {[
            { id: 'details', label: '1. Course Details', icon: BookOpen },
            { id: 'curriculum', label: `2. Curriculum (${modules.length} Modules)`, icon: Layers },
            { id: 'content', label: `3. Lesson Content (${selectedUnit?.title ? selectedUnit.title.substring(0, 18) + '...' : 'Select Unit'})`, icon: FileText },
            { id: 'resources', label: `4. Resources (${unitResources.length})`, icon: Paperclip },
            { id: 'settings', label: '5. Settings & Visibility', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as CourseTab)}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: COURSE DETAILS                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Basic Course Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update course headline, level, categorization, and pricing.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAiAutofill}
                disabled={isAutofilling || !watchTitle || watchTitle.trim().length < 3}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAutofilling ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
                <span>{isAutofilling ? 'Autofilling...' : '✨ Autofill with AI'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Title *</label>
                <input
                  type="text"
                  {...register('title', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
                {errors.title && <span className="text-rose-500 text-[11px]">{errors.title.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
                <select
                  {...register('category', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                >
                  <option value="Linux & Systems">Linux & Systems</option>
                  <option value="AI & Data">AI & Data</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Development Tools">Development Tools</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                  <option value="Database">Database</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty Level *</label>
                <select
                  {...register('level', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                >
                  <option value="all_levels">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimated Duration *</label>
                <input
                  type="text"
                  {...register('duration', { onChange: markDirty })}
                  placeholder="e.g. 40 Hours or 6 Weeks"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price (₹ INR)</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true, onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Short Summary *</label>
                <textarea
                  rows={2}
                  {...register('shortDescription', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Course Description *</label>
                <textarea
                  rows={4}
                  {...register('description', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* Cloudinary Media Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Course Thumbnail */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" /> Course Thumbnail
                </h3>
                <span className="text-[10px] font-mono text-slate-400">16:9 • 1280x720</span>
              </div>
              <CloudinaryUploadZone
                currentImageUrl={thumbnailPreview}
                currentPublicId={thumbnailPublicId}
                folder={`kaizenq/courses/${id || 'course'}/thumbnail`}
                onUploadSuccess={(res) => {
                  setThumbnailPreview(res.secureUrl);
                  setThumbnailPublicId(res.publicId);
                  setValue('thumbnail', res.secureUrl, { shouldValidate: true });
                  markDirty();
                }}
                onImageRemove={() => {
                  setThumbnailPreview('');
                  setThumbnailPublicId('');
                  setValue('thumbnail', '');
                  markDirty();
                }}
              />
            </div>

            {/* Course Cover / Banner */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-500" /> Cover / Banner Image
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Panoramic • 1920x600</span>
              </div>
              <CloudinaryUploadZone
                currentImageUrl={coverPreview}
                currentPublicId={coverPublicId}
                folder={`kaizenq/courses/${id || 'course'}/cover`}
                onUploadSuccess={(res) => {
                  setCoverPreview(res.secureUrl);
                  setCoverPublicId(res.publicId);
                  markDirty();
                }}
                onImageRemove={() => {
                  setCoverPreview('');
                  setCoverPublicId('');
                  markDirty();
                }}
              />
            </div>

          </div>

          {/* Skills & Learning Outcomes */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skills Taught</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Docker, TypeScript, Microservices..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsInput.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {s}
                    <button type="button" onClick={() => removeSkill(idx)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Learning Outcomes *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="e.g. Master state management and performance tuning in large applications"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={addOutcome}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 pt-1">
                {outcomesInput.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    <span className="text-slate-800 dark:text-slate-200">✓ {outcome}</span>
                    <button type="button" onClick={() => removeOutcome(idx)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: CURRICULUM TREE & DRAG/DROP REORDERING                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Curriculum Structure
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize Course Modules, Topics, and Learning Units with reordering tools.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModuleModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((mod, modIdx) => {
              const isExpanded = expandedModules[mod.id] ?? true;
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  {/* Module Header Bar */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleModuleExpand(mod.id)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold flex items-center justify-center">
                        {String(modIdx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveModule(modIdx, 'up')}
                        disabled={modIdx === 0}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Module Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveModule(modIdx, 'down')}
                        disabled={modIdx === modules.length - 1}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Module Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTopicParentModId(mod.id);
                          setShowAddTopicModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Topic
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500 transition-colors cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Topics and Units Container */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {(mod.topics || []).map((top) => (
                        <div
                          key={top.id}
                          className="pl-4 sm:pl-6 border-l-2 border-indigo-500/30 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              {top.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveUnitParentInfo({ modId: mod.id, topId: top.id });
                                setShowAddUnitModal(true);
                              }}
                              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Unit
                            </button>
                          </div>

                          {/* Unit Cards List */}
                          <div className="space-y-2">
                            {(top.learningUnits || []).map((unit, uIdx) => {
                              const isSelected = selectedUnit?.id === unit.id;
                              return (
                                <div
                                  key={unit.id}
                                  onClick={() => handleSelectUnit(unit, mod.id, top.id)}
                                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-white shadow-xs'
                                      : 'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate">{unit.title}</p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{unit.duration || '15 mins'} • {unit.type || 'Reading'}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveUnit(mod.id, top.id, uIdx, 'up');
                                      }}
                                      disabled={uIdx === 0}
                                      className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveUnit(mod.id, top.id, uIdx, 'down');
                                      }}
                                      disabled={uIdx === (top.learningUnits || []).length - 1}
                                      className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectUnit(unit, mod.id, top.id);
                                        handleTabChange('content');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold cursor-pointer"
                                    >
                                      Edit Content
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUnit(mod.id, top.id, unit.id);
                                      }}
                                      className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: LESSON MARKDOWN CONTENT                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {selectedUnit ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Editing Unit
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedUnit.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('editor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      previewMode === 'editor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('split')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      previewMode === 'split' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      previewMode === 'preview' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Markdown Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl overflow-x-auto text-xs font-mono">
                <button type="button" onClick={() => insertMarkdown('bold')} className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('italic')} className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('h1')} className="p-1.5 hover:bg-slate-800 rounded font-bold cursor-pointer" title="H1">H1</button>
                <button type="button" onClick={() => insertMarkdown('h2')} className="p-1.5 hover:bg-slate-800 rounded font-bold cursor-pointer" title="H2">H2</button>
                <button type="button" onClick={() => insertMarkdown('h3')} className="p-1.5 hover:bg-slate-800 rounded font-bold cursor-pointer" title="H3">H3</button>
                <button type="button" onClick={() => insertMarkdown('list')} className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="List"><List className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('code')} className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Code Block"><Code2 className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('quote')} className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Quote"><Quote className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('table')} className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Table"><Table className="w-3.5 h-3.5" /></button>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                {/* Practice Sandbox Templates */}
                <button type="button" onClick={() => insertMarkdown('practice-sql')} className="px-2 py-1 bg-sky-950 border border-sky-800 text-sky-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                  <Database className="w-3 h-3" /> SQL
                </button>
                <button type="button" onClick={() => insertMarkdown('practice-terminal')} className="px-2 py-1 bg-purple-950 border border-purple-800 text-purple-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                  <Terminal className="w-3 h-3" /> Terminal
                </button>
                <button type="button" onClick={() => insertMarkdown('practice-git')} className="px-2 py-1 bg-amber-950 border border-amber-800 text-amber-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                  <GitBranch className="w-3 h-3" /> Git
                </button>
                <button type="button" onClick={() => insertMarkdown('practice-code')} className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                  <Code2 className="w-3 h-3" /> Code
                </button>
                <button type="button" onClick={() => insertMarkdown('practice-web')} className="px-2 py-1 bg-blue-950 border border-blue-800 text-blue-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                  <Eye className="w-3 h-3" /> Web/React
                </button>
                <button type="button" onClick={() => insertMarkdown('practice-k8s')} className="px-2 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                  <Server className="w-3 h-3" /> K8s
                </button>
              </div>

              {/* Editor / Preview Split View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[500px]">
                {(previewMode === 'split' || previewMode === 'editor') && (
                  <div className={`${previewMode === 'editor' ? 'md:col-span-2' : ''} flex flex-col`}>
                    <textarea
                      ref={textareaRef}
                      value={lessonMarkdown}
                      onChange={(e) => {
                        setLessonMarkdown(e.target.value);
                        markDirty();
                      }}
                      className="w-full h-full min-h-[450px] p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-100 focus:outline-hidden leading-relaxed resize-y"
                      placeholder="Write rich Markdown notes here..."
                      spellCheck={false}
                    />
                  </div>
                )}

                {(previewMode === 'split' || previewMode === 'preview') && (
                  <div className={`${previewMode === 'preview' ? 'md:col-span-2' : ''} p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-y-auto max-h-[650px]`}>
                    <MarkdownContent content={lessonMarkdown} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Unit Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please select a learning unit from the Curriculum tab to edit its lesson notes and markdown content.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange('curriculum')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Go to Curriculum
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: UNIT RESOURCES                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Downloadable & External Resources
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attach PDFs, lab workbooks, GitHub repositories, and links to {selectedUnit?.title ? `"${selectedUnit.title}"` : 'the selected unit'}.
              </p>
            </div>

            {selectedUnit && (
              <button
                type="button"
                onClick={() => {
                  setEditingResourceIndex(null);
                  setResTitle('');
                  setResDescription('');
                  setResUrl('');
                  setResType('pdf');
                  setResDownloadable(true);
                  setShowAddResourceModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            )}
          </div>

          {selectedUnit ? (
            <div className="space-y-3">
              {unitResources.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                  No resources attached to this unit yet. Click <strong>Add Resource</strong> above to link documentation, PDFs, or GitHub repos.
                </div>
              ) : (
                unitResources.map((res, idx) => (
                  <div
                    key={res.id || idx}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {res.type === 'github' ? <GitFork className="w-4 h-4" /> : res.type === 'video' ? <Video className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{res.title}</p>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-500 hover:underline flex items-center gap-1 truncate"
                        >
                          <span>{res.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingResourceIndex(idx);
                          setResTitle(res.title || '');
                          setResDescription(res.description || '');
                          setResUrl(res.url || '');
                          setResType(res.type || 'pdf');
                          setResDownloadable(Boolean(res.downloadable));
                          setShowAddResourceModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(idx)}
                        className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <Paperclip className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Unit Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a learning unit to configure attachments, workbooks, and resource links.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: COURSE SETTINGS & VISIBILITY                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              Publication & Visibility
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Status</label>
                <select
                  value={courseStatus}
                  onChange={(e) => {
                    setCourseStatus(e.target.value as any);
                    markDirty();
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="published">🟢 Published (Live in catalog)</option>
                  <option value="draft">🟡 Draft (Hidden from students)</option>
                  <option value="archived">🔴 Archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Access Visibility</label>
                <select
                  value={courseVisibility}
                  onChange={(e) => {
                    setCourseVisibility(e.target.value as any);
                    markDirty();
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="public">Public (Visible to everyone)</option>
                  <option value="private">Private (Restricted access)</option>
                  <option value="unlisted">Unlisted (Direct link only)</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => {
                      setIsFeatured(e.target.checked);
                      markDirty();
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Feature this course on platform homepage banner
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Module Modal ──────────────────────────────────────────────── */}
      {showAddModuleModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Add New Module</h3>
            <input
              type="text"
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              placeholder="e.g. Module 01: Core Architecture"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddModule}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Topic Modal ───────────────────────────────────────────────── */}
      {showAddTopicModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Add Topic to Module</h3>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="e.g. Topic: Memory Allocation & Pointers"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddTopicModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Unit Modal ────────────────────────────────────────────────── */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Add Learning Unit</h3>
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="e.g. Pointer Arithmetic & Buffer Safety"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Add Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Resource Modal ─────────────────────────────────────── */}
      {showAddResourceModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
              {editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title *</label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Official Documentation PDF"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="github">GitHub Repository</option>
                  <option value="video">Video Recording</option>
                  <option value="article">Article / Documentation</option>
                  <option value="practice">Practice Lab</option>
                  <option value="download">Downloadable Archive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Resource URL *</label>
                <input
                  type="url"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resDownloadable}
                    onChange={(e) => setResDownloadable(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Downloadable asset</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddResourceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResource}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Resource
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCourseEdit;
