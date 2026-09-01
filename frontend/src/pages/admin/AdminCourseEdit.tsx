import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateCourseSchema } from '../../../../shared/validators/course.validator';
import type { UpdateCourseInput } from '../../../../shared/validators/course.validator';
import { courseService } from '../../services/courseService';
import { useCourses } from '@/contexts/CourseContext';
import { CourseHeader } from '../../components/courses/CourseHeader';
import { LoadingSkeleton } from '../../components/courses/LoadingSkeleton';
import { CloudinaryUploadZone } from '../../components/admin/CloudinaryUploadZone';
import { aiAutofillService } from '@/services/aiAutofillService';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminCourseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshCourses } = useCourses();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Cloudinary Thumbnail State
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailPublicId, setThumbnailPublicId] = useState<string>('');

  const [skillsInput, setSkillsInput] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [outcomesInput, setOutcomesInput] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateCourseInput>({
    resolver: zodResolver(UpdateCourseSchema) as any,
  });

  const watchTitle = watch('title');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const course = await courseService.getCourseBySlugOrId(id);
        if (course) {
          reset(course as any);
          setThumbnailPreview(course.thumbnail || (course as any).thumbnailUrl || '');
          setThumbnailPublicId((course as any).thumbnailPublicId || '');
          setSkillsInput(course.skills || []);
          setOutcomesInput(course.learningOutcomes || []);
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
        level: getValues('level')
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

      toast.success('✨ Course details autofilled! You can review and adjust any field before saving.');
    } catch (err: any) {
      toast.error(err.message || 'Autofill failed — please try again or write manually.');
    } finally {
      setIsAutofilling(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...skillsInput, newSkill.trim()];
    setSkillsInput(updated);
    setValue('skills', updated as any);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const updated = skillsInput.filter((_, i) => i !== index);
    setSkillsInput(updated);
    setValue('skills', updated as any);
  };

  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    const updated = [...outcomesInput, newOutcome.trim()];
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
    setNewOutcome('');
  };

  const removeOutcome = (index: number) => {
    const updated = outcomesInput.filter((_, i) => i !== index);
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
  };

  const onSubmit = async (data: FieldValues) => {
    if (!id) return;
    if (outcomesInput.length < 2) {
      toast.error('Please provide at least 2 learning outcomes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        ...data,
        thumbnail: thumbnailPreview || data.thumbnail,
        thumbnailUrl: thumbnailPreview || data.thumbnail,
        thumbnailPublicId: thumbnailPublicId || undefined,
        skills: skillsInput,
        learningOutcomes: outcomesInput,
      };

      await courseService.updateCourse(id, payload);
      await refreshCourses();
      toast.success('Course details updated successfully!');
      navigate('/admin/courses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Sora'] text-slate-100 max-w-5xl mx-auto pb-16">
      <CourseHeader
        title="Edit Course Configuration"
        description="Update course metadata, pricing, visual assets, skills, and syllabus learning outcomes."
        badgeText="Course Editor"
        breadcrumbs={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Courses', path: '/admin/courses' },
          { label: 'Edit Course' },
        ]}
        action={
          <Link
            to="/admin/courses"
            className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6 text-slate-900 dark:text-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="font-heading font-extrabold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <BookOpen className="w-5 h-5 text-indigo-500" /> Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Title *</label>
                <button
                  type="button"
                  onClick={handleAiAutofill}
                  disabled={isAutofilling || !watchTitle || watchTitle.trim().length < 3}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Generate description, outcomes, level, and tags with AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAutofilling ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
                  <span>{isAutofilling ? 'Autofilling...' : '✨ Autofill with AI'}</span>
                </button>
              </div>

              <input
                type="text"
                {...register('title')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
              {errors.title && <span className="text-rose-500 text-[11px]">{errors.title.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
              <select
                {...register('category')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium cursor-pointer"
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
                {...register('level')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="all_levels">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (Hours/Weeks) *</label>
              <input
                type="text"
                {...register('duration')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price (₹ INR)</label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Short Description *</label>
              <textarea
                rows={2}
                {...register('shortDescription')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Description *</label>
              <textarea
                rows={5}
                {...register('description')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail & Cloudinary Asset Management */}
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-5 text-slate-900 dark:text-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="font-heading font-extrabold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <ImageIcon className="w-5 h-5 text-indigo-500" /> Thumbnail & Visual Asset
            </h2>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" /> Cloudinary CDN
            </span>
          </div>

          <CloudinaryUploadZone
            currentImageUrl={thumbnailPreview}
            currentPublicId={thumbnailPublicId}
            onUploadSuccess={(res) => {
              setThumbnailPreview(res.secureUrl);
              setThumbnailPublicId(res.publicId);
              setValue('thumbnail', res.secureUrl, { shouldValidate: true });
            }}
            onImageRemove={() => {
              setThumbnailPreview('');
              setThumbnailPublicId('');
              setValue('thumbnail', '');
            }}
          />
        </div>

        {/* Skills & Learning Outcomes */}
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6 text-slate-900 dark:text-slate-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skills Taught</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Docker, Kubernetes, CI/CD)..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {skillsInput.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-2"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(idx)} className="cursor-pointer">
                    <Trash2 className="w-3 h-3 text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Learning Outcomes *</label>
              <span className="text-[10px] text-slate-400">{outcomesInput.length} defined</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="e.g. Deploy containerized applications with zero downtime"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
              <button
                type="button"
                onClick={addOutcome}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 pt-2">
              {outcomesInput.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                >
                  <span className="text-slate-800 dark:text-slate-200">✓ {outcome}</span>
                  <button type="button" onClick={() => removeOutcome(idx)} className="cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            to="/admin/courses"
            className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Course Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseEdit;
