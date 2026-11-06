import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';
import { internshipService, type Internship } from '@/services/internshipService';
import { DEFAULT_CAREER_OPENINGS } from '@/services/careersService';
import { InternshipCard } from '@/components/careers/InternshipCard';
import { SEOHead } from '@/components/seo/SEOHead';

const DOMAIN_OPTIONS = [
  'Artificial Intelligence',
  'Full Stack Web Development',
  'Cloud Computing & DevOps',
  'Data Science & Analytics',
  'Cyber Security & Ethical Hacking',
  'Mobile App Development',
  'UI/UX & Product Design',
  'Blockchain & Web3',
];

const DEPARTMENT_OPTIONS = [
  'AI Research & Engineering',
  'Software Engineering',
  'Cloud & Infrastructure',
  'Data Science & Analytics',
  'Security & Compliance',
  'Product Design & Experience',
  'Product & Growth',
];

export const AdminInternshipStudio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id && id !== 'new');

  // Form State
  const [formData, setFormData] = useState<Partial<Internship>>({
    title: '',
    slug: '',
    domain: 'Artificial Intelligence',
    department: 'AI Research & Engineering',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '12 Weeks',
    location: 'Remote, India',
    openings: 5,
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Pre-final and final year engineering/computer science scholars, or candidates with demonstrable software projects.',
    requiredSkills: 'Python, Git, Problem Solving',
    preferredSkills: 'Docker, Cloud Fundamentals',
    description: '',
    curriculum: 'Week 1-2: Architecture, Development Environment & Standards\nWeek 3-4: Core Feature Engineering & API Integrations\nWeek 5-8: Capstone Prototype Construction & Optimization\nWeek 9-12: Testing, Peer Code Review & Deployment Delivery',
    responsibilities: '• Design and develop robust technical components.\n• Collaborate with engineering mentors during code reviews.\n• Document implementation steps and maintain Git hygiene.',
    learningOutcomes: 'Practical industrial software engineering practices, cloud deployment experience, and peer code review proficiency.',
    status: 'PUBLISHED',
    isFeatured: false,
    deadline: '',
  });

  // UI States
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [activeCurriculumTab, setActiveCurriculumTab] = useState<'syllabus' | 'responsibilities' | 'outcomes'>('syllabus');

  // Interactive Tag Inputs
  const [reqSkillInput, setReqSkillInput] = useState<string>('');
  const [prefSkillInput, setPrefSkillInput] = useState<string>('');

  // Collapsible Section Accordions
  const [sectionsOpen, setSectionsOpen] = useState({
    basic: true,
    compensation: true,
    skills: true,
    curriculum: true,
  });

  const toggleSection = (key: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-generate slug from title if user hasn't explicitly set one
  const handleTitleChange = (val: string) => {
    setIsDirty(true);
    setFormData((prev) => {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return {
        ...prev,
        title: val,
        slug: prev.slug && !prev.slug.startsWith(prev.title?.toLowerCase() || '') ? prev.slug : generatedSlug,
      };
    });
  };

  // Load existing opportunity for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      internshipService
        .adminGetInternshipById(id)
        .then((data) => {
          if (data) {
            setFormData({
              ...data,
              openings: data.openings || 1,
              stipendAmount: data.stipendAmount || 'Performance Stipend + Certificate',
              duration: data.duration || '12 Weeks',
              location: data.location || 'Remote, India',
              eligibility: data.eligibility || '',
              requiredSkills: data.requiredSkills || '',
              preferredSkills: data.preferredSkills || '',
              description: data.description || '',
              curriculum: data.curriculum || (data as any).learningOutcomes || '',
              responsibilities: (data as any).responsibilities || '',
              learningOutcomes: (data as any).learningOutcomes || '',
              status: data.status || 'PUBLISHED',
              isFeatured: Boolean(data.isFeatured),
              deadline: data.deadline ? data.deadline.substring(0, 10) : '',
            });
          }
        })
        .catch((err) => {
          const fallback = DEFAULT_CAREER_OPENINGS.find((o) => o.id === id || o.slug === id);
          if (fallback) {
            setFormData({
              ...fallback,
              openings: fallback.openings || 1,
              stipendAmount: fallback.stipendAmount || 'Performance Stipend + Certificate',
              duration: fallback.duration || '12 Weeks',
              location: fallback.location || 'Remote, India',
              status: fallback.status || 'PUBLISHED',
              isFeatured: Boolean(fallback.isFeatured),
            });
          } else {
            toast.error('Failed to load opportunity details');
            console.error(err);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  // Warn on browser unload if form is dirty
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

  // Skill Tags Helper
  const requiredSkillsList = useMemo(() => {
    return (formData.requiredSkills || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [formData.requiredSkills]);

  const preferredSkillsList = useMemo(() => {
    return (formData.preferredSkills || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [formData.preferredSkills]);

  const addRequiredSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (!requiredSkillsList.includes(clean)) {
      const updated = [...requiredSkillsList, clean].join(', ');
      setFormData((prev) => ({ ...prev, requiredSkills: updated }));
      setIsDirty(true);
    }
    setReqSkillInput('');
  };

  const removeRequiredSkill = (skillToRemove: string) => {
    const updated = requiredSkillsList.filter((s) => s !== skillToRemove).join(', ');
    setFormData((prev) => ({ ...prev, requiredSkills: updated }));
    setIsDirty(true);
  };

  const addPreferredSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (!preferredSkillsList.includes(clean)) {
      const updated = [...preferredSkillsList, clean].join(', ');
      setFormData((prev) => ({ ...prev, preferredSkills: updated }));
      setIsDirty(true);
    }
    setPrefSkillInput('');
  };

  const removePreferredSkill = (skillToRemove: string) => {
    const updated = preferredSkillsList.filter((s) => s !== skillToRemove).join(', ');
    setFormData((prev) => ({ ...prev, preferredSkills: updated }));
    setIsDirty(true);
  };

  // Save / Publish
  const handleSave = async (overrideStatus?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (!formData.title?.trim()) {
      toast.error('Please enter an opportunity title.');
      return;
    }
    if (!formData.domain?.trim()) {
      toast.error('Please select a domain.');
      return;
    }
    if (!formData.duration?.trim()) {
      toast.error('Please specify the duration.');
      return;
    }

    const payload: Partial<Internship> = {
      ...formData,
      status: overrideStatus || formData.status || 'PUBLISHED',
      openings: Number(formData.openings) || 1,
      isFeatured: Boolean(formData.isFeatured),
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      if (isEditMode && id) {
        await internshipService.adminUpdateInternship(id, payload);
        toast.success(
          overrideStatus === 'DRAFT'
            ? 'Opportunity saved as Draft.'
            : overrideStatus === 'PUBLISHED'
            ? 'Opportunity published live to public Careers page!'
            : 'Opportunity updated successfully.'
        );
      } else {
        const created = await internshipService.adminCreateInternship(payload);
        toast.success('Opportunity created and published successfully!');
        if (created?.id) {
          navigate(`/admin/internships/edit/${created.id}`, { replace: true });
        }
      }
      setIsDirty(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  // Duplicate as Template
  const handleDuplicate = () => {
    const duplicateData: Partial<Internship> = {
      ...formData,
      id: undefined,
      title: `${formData.title || 'Opportunity'} (Copy)`,
      slug: `${formData.slug || 'opportunity'}-copy`,
      status: 'DRAFT',
      isFeatured: false,
    };
    setFormData(duplicateData);
    setIsDirty(true);
    navigate('/admin/internships/new', { replace: true });
    toast.success('Duplicated as new Draft. Edit and save whenever ready.');
  };

  // Delete
  const handleDelete = async () => {
    if (!id || !isEditMode) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${formData.title}"?`)) return;

    setSaving(true);
    try {
      await internshipService.adminDeleteInternship(id);
      toast.success('Opportunity deleted successfully.');
      navigate('/admin/careers');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete opportunity');
    } finally {
      setSaving(false);
    }
  };

  // Mock object for live preview
  const previewInternship: Internship = useMemo(() => {
    return {
      id: formData.id || 'preview-id',
      title: formData.title || 'Opportunity Title Preview',
      slug: formData.slug || 'preview-slug',
      domain: formData.domain || 'Engineering',
      department: formData.department || 'Engineering',
      employmentType: formData.employmentType || 'INTERNSHIP',
      internshipType: (formData.internshipType as any) || 'REMOTE',
      duration: formData.duration || '12 Weeks',
      location: formData.location || 'Remote, India',
      openings: Number(formData.openings) || 1,
      stipendType: (formData.stipendType as any) || 'PERFORMANCE_BASED',
      stipendAmount: formData.stipendAmount || 'Performance Stipend + Certificate',
      eligibility: formData.eligibility || 'Open to qualified candidates',
      requiredSkills: formData.requiredSkills || 'Problem Solving, Teamwork',
      preferredSkills: formData.preferredSkills || '',
      description: formData.description || 'Comprehensive training curriculum and industrial development tasks.',
      curriculum: formData.curriculum || '',
      learningOutcomes: formData.learningOutcomes || '',
      status: (formData.status as any) || 'PUBLISHED',
      isFeatured: Boolean(formData.isFeatured),
      deadline: formData.deadline || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [formData]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading opportunity details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      <SEOHead
        title={isEditMode ? `Edit ${formData.title || 'Opportunity'} | Admin Studio` : 'Create Opportunity | Admin Studio'}
        description="KaizenQ Career and Internship Studio"
        noindex={true}
      />

      {/* ─── STUDIO TOP BAR ─── */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes. Discard and go back?')) return;
              navigate('/admin/careers');
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Return to Careers Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {isEditMode ? 'Opportunity Studio (Edit)' : 'Opportunity Studio (Create)'}
              </span>
              {isDirty && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Unsaved Changes
                </span>
              )}
            </div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-md sm:max-w-lg">
              {formData.title || 'Untitled Opportunity'}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          {/* Status Badge Selector */}
          <select
            value={formData.status || 'PUBLISHED'}
            onChange={(e) => {
              setFormData((p) => ({ ...p, status: e.target.value as any }));
              setIsDirty(true);
            }}
            aria-label="Publication Status"
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="DRAFT">Draft (Hidden)</option>
            <option value="PUBLISHED">Published (Live)</option>
            <option value="ARCHIVED">Archived (Closed)</option>
          </select>

          {/* Toggle Live Preview */}
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
              showPreview
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>

          {/* Duplicate Button (in Edit mode) */}
          {isEditMode && (
            <button
              type="button"
              onClick={handleDuplicate}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              title="Duplicate as new draft"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>
          )}

          {/* Delete Button (in Edit mode) */}
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="p-2 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete opportunity permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Primary Save Button */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEditMode ? 'Save Changes' : 'Publish Opportunity'}</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN TWO-COLUMN STUDIO LAYOUT ─── */}
      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* ─── LEFT COLUMN: STUDIO FORM ─── */}
        <div className={`space-y-6 ${showPreview ? 'lg:col-span-7' : 'max-w-4xl mx-auto w-full'}`}>
          {/* SECTION A: BASIC INFORMATION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <span>Section A: Basic Information & Role Positioning</span>
              </div>
              {sectionsOpen.basic ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {sectionsOpen.basic && (
              <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opportunity Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. AI & Machine Learning Engineering Virtual Internship"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Slug Identifier */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Public URL Slug Identifier
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                      kaizenq.in/careers/
                    </span>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }));
                        setIsDirty(true);
                      }}
                      placeholder="ai-ml-internship"
                      className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Domain & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Domain <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.domain || ''}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, domain: e.target.value }));
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {DOMAIN_OPTIONS.map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department Track
                    </label>
                    <select
                      value={formData.department || ''}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, department: e.target.value }));
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {DEPARTMENT_OPTIONS.map((dep) => (
                        <option key={dep} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Employment Type & Work Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType || 'INTERNSHIP'}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, employmentType: e.target.value as any }));
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INTERNSHIP">Virtual / Guided Internship</option>
                      <option value="FULL_TIME">Full-Time Career</option>
                      <option value="PART_TIME">Part-Time Opportunity</option>
                      <option value="CONTRACT">Project Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Work Mode
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      {(['REMOTE', 'HYBRID', 'ON_SITE'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, internshipType: mode }));
                            setIsDirty(true);
                          }}
                          className={`py-1.5 rounded-lg transition-all text-center ${
                            (formData.internshipType?.toUpperCase() === mode) ||
                            (mode === 'ON_SITE' && formData.internshipType?.toUpperCase() === 'ONSITE')
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {mode === 'ON_SITE' ? 'On-site' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location & Eligibility Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, location: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="e.g. Remote, India or Bengaluru, Karnataka"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: DURATION, OPENINGS & STIPEND */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('compensation')}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span>Section B: Duration, Openings & Compensation</span>
              </div>
              {sectionsOpen.compensation ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {sectionsOpen.compensation && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Duration <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, duration: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="e.g. 8 Weeks, 12 Weeks, 6 Months"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Openings */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Available Openings <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.openings || 1}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, openings: parseInt(e.target.value) || 1 }));
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stipend Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Stipend Type
                    </label>
                    <select
                      value={formData.stipendType || 'PERFORMANCE_BASED'}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, stipendType: e.target.value as any }));
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PERFORMANCE_BASED">Performance Based Stipend</option>
                      <option value="FIXED">Fixed Monthly Stipend</option>
                      <option value="UNPAID">Academic / Unpaid Experience</option>
                      <option value="CERTIFICATE_ONLY">Verified Credential Only</option>
                    </select>
                  </div>

                  {/* Stipend Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Stipend / Compensation Text
                    </label>
                    <input
                      type="text"
                      value={formData.stipendAmount || ''}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, stipendAmount: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="e.g. ₹10,000 - ₹15,000 / month + Certificate"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Deadline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline || ''}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, deadline: e.target.value }));
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.isFeatured)}
                        onChange={(e) => {
                          setFormData((p) => ({ ...p, isFeatured: e.target.checked }));
                          setIsDirty(true);
                        }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Featured Listing Badge</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Highlights opening at the top of Careers page</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION C: REQUIREMENTS & QUALIFICATIONS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('skills')}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-500" />
                <span>Section C: Requirements & Qualifications</span>
              </div>
              {sectionsOpen.skills ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {sectionsOpen.skills && (
              <div className="p-5 space-y-4">
                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Summary & Objective
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, description: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="Provide a concise 2-3 sentence summary of what the scholar will achieve..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Eligibility Criteria */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Eligibility Criteria
                  </label>
                  <textarea
                    rows={2}
                    value={formData.eligibility || ''}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, eligibility: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Open to B.Tech / BCA / MCA candidates or self-taught builders with demonstrable Git repositories."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Interactive Required Skills Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Required Skills & Technologies (Press Enter to add chip) <span className="text-rose-500">*</span>
                  </label>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {requiredSkillsList.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeRequiredSkill(skill)}
                            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={reqSkillInput}
                        onChange={(e) => setReqSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addRequiredSkill(reqSkillInput);
                          }
                        }}
                        placeholder="Add required skill (e.g. React, Docker, Python)..."
                        className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addRequiredSkill(reqSkillInput)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 text-white shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Preferred Skills Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred / Bonus Skills (Optional)
                  </label>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {preferredSkillsList.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removePreferredSkill(skill)}
                            className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={prefSkillInput}
                        onChange={(e) => setPrefSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPreferredSkill(prefSkillInput);
                          }
                        }}
                        placeholder="Add bonus skill (e.g. AWS, GraphQL)..."
                        className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addPreferredSkill(prefSkillInput)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-600 text-white shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION D: CURRICULUM & LEARNING MILESTONES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('curriculum')}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Section D: Curriculum, Responsibilities & Outcomes</span>
              </div>
              {sectionsOpen.curriculum ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {sectionsOpen.curriculum && (
              <div className="p-5 space-y-4">
                {/* Weekly Syllabus */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Weekly Curriculum / Syllabus Milestones
                    </label>
                    <span className="text-[10px] text-slate-400">Shown when candidate clicks "View Curriculum"</span>
                  </div>
                  <textarea
                    rows={5}
                    value={formData.curriculum || ''}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, curriculum: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="Week 1-2: Foundations and Architecture Setup&#10;Week 3-4: Feature Development&#10;Week 5-6: System Testing & CI/CD&#10;Week 7-8: Capstone Delivery"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Core Responsibilities */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Core Scholar Responsibilities
                  </label>
                  <textarea
                    rows={3}
                    value={formData.responsibilities || ''}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, responsibilities: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="• Implement high-quality software features...&#10;• Participate in weekly team standups...&#10;• Author comprehensive project documentation..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Learning Outcomes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Learning Outcomes & Industrial Capabilities
                  </label>
                  <textarea
                    rows={2}
                    value={formData.learningOutcomes || ''}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, learningOutcomes: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="Industrial code quality standards, automated testing pipelines, and real-world system architecture."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: LIVE PREVIEW SPLIT SCREEN ─── */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-40 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Live Careers Page Preview
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Updates live as you type</span>
              </div>

              {/* Render Public Card Preview */}
              <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                <InternshipCard
                  internship={previewInternship}
                  onApply={() => toast.info('Preview mode: Clicking Apply opens application modal.')}
                  onViewDetails={() => toast.info('Preview mode: Displays curriculum detail modal.')}
                />
              </div>

              {/* Curriculum Peek Tab */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Curriculum Modal Preview</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveCurriculumTab('syllabus')}
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        activeCurriculumTab === 'syllabus' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Syllabus
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCurriculumTab('responsibilities')}
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        activeCurriculumTab === 'responsibilities' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Duties
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                  {activeCurriculumTab === 'syllabus'
                    ? formData.curriculum || 'No curriculum written yet.'
                    : formData.responsibilities || 'No responsibilities written yet.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInternshipStudio;
