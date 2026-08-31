import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateCourseSchema } from '../../../../shared/validators/course.validator';
import type { UpdateCourseInput } from '../../../../shared/validators/course.validator';
import { generateSlug } from '../../../../shared/types/firestoreCourse';
import { courseService } from '../../services/courseService';
import { courseStorageService } from '../../services/courseStorageService';
import { useCourses } from '@/contexts/CourseContext';
import { CourseHeader } from '../../components/courses/CourseHeader';
import { LoadingSkeleton } from '../../components/courses/LoadingSkeleton';
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminCourseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshCourses } = useCourses();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Original thumbnail URL to detect replacement and clean up
  const [originalThumbnail, setOriginalThumbnail] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [skillsInput, setSkillsInput] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [outcomesInput, setOutcomesInput] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateCourseInput>({
    resolver: zodResolver(UpdateCourseSchema) as any,
  });

  const watchThumbnail = watch('thumbnail');
  const watchTitle = watch('title');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const course = await courseService.getCourseBySlugOrId(id);
        if (course) {
          reset(course as any);
          setOriginalThumbnail(course.thumbnail || '');
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

  // Thumbnail File Upload & Replacement Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      setIsUploadingImage(true);
      setUploadProgress(0);

      const downloadUrl = await courseStorageService.uploadCourseThumbnail(
        id,
        file,
        (progress) => setUploadProgress(progress)
      );

      setValue('thumbnail', downloadUrl, { shouldValidate: true });
      toast.success('Course thumbnail uploaded successfully to Firebase Storage!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...skillsInput, newSkill.trim()];
    setSkillsInput(updated);
    setValue('skills', updated);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const updated = skillsInput.filter((_, i) => i !== index);
    setSkillsInput(updated);
    setValue('skills', updated);
  };

  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    const updated = [...outcomesInput, newOutcome.trim()];
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated);
    setNewOutcome('');
  };

  const removeOutcome = (index: number) => {
    const updated = outcomesInput.filter((_, i) => i !== index);
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated);
  };

  const onSubmit = async (data: FieldValues) => {
    if (!id) return;

    if (!data.description || String(data.description).trim().length < 10) {
      toast.error('Course description is required (at least 10 characters).');
      return;
    }

    const newThumbnail = data.thumbnail || originalThumbnail;
    if (!newThumbnail || String(newThumbnail).trim() === '') {
      toast.error('Course thumbnail / image is required. Please upload or specify a thumbnail.');
      return;
    }

    if (outcomesInput.length < 2) {
      toast.error('Please provide at least 2 learning outcomes.');
      return;
    }

    setIsSubmitting(true);
    try {
      // If thumbnail was replaced and previous was a Firebase Storage URL, clean up old file
      if (originalThumbnail && newThumbnail !== originalThumbnail) {
        await courseStorageService.deleteCourseThumbnail(originalThumbnail);
      }

      const generatedSlug = data.title ? generateSlug(data.title) : undefined;
      const updatePayload: any = {
        ...data,
        slug: generatedSlug,
        skills: skillsInput,
        learningOutcomes: outcomesInput,
        thumbnail: newThumbnail,
      };

      await courseService.updateCourse(id, updatePayload);

      await refreshCourses();

      toast.success('Course updated successfully in Firestore!');
      navigate('/admin/courses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="detail" />;
  }

  return (
    <div className="space-y-8 font-['Sora'] text-slate-100 max-w-5xl mx-auto pb-16">
      <CourseHeader
        title="Edit Course Track"
        description="Update curriculum content, pricing, skills, outcomes, and publishing parameters in Firestore."
        badgeText="Admin Editor"
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
            <ArrowLeft className="w-4 h-4" /> Cancel & Return
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Core Metadata Card */}
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6 text-slate-900 dark:text-slate-100 shadow-sm">
          <h2 className="font-heading font-extrabold text-lg flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 text-slate-900 dark:text-white">
            <BookOpen className="w-5 h-5 text-indigo-500" /> Course Core Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Title *</label>
              <input
                type="text"
                {...register('title')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
              {errors.title && <span className="text-rose-400 text-[11px]">{errors.title.message}</span>}
              {watchTitle && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Slug: <span className="text-indigo-400">{generateSlug(watchTitle)}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
              <select
                {...register('category')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="Linux & Systems">Linux & Systems</option>
                <option value="Development Tools">Development Tools</option>
                <option value="Database">Database</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Web Development">Web Development</option>
                <option value="Programming">Programming</option>
                <option value="AI & Data">AI & Data</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty Level *</label>
              <select
                {...register('level')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="all_levels">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price (₹ INR) *</label>
                <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 font-bold">Single Source of Truth</span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                {...register('price', { valueAsNumber: true })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Presets:</span>
                {[0, 199, 299, 399, 499].map((pVal) => (
                  <button
                    key={pVal}
                    type="button"
                    onClick={() => setValue('price', pVal, { shouldValidate: true })}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors"
                  >
                    {pVal === 0 ? 'Free' : `₹${pVal}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status *</label>
              <select
                {...register('status')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Short Description (Card Front) *</label>
              <textarea
                rows={2}
                {...register('shortDescription')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Description (Card Back / Detail View) *</label>
              <textarea
                rows={5}
                {...register('description')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail & Storage Image Management */}
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-5 text-slate-900 dark:text-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="font-heading font-extrabold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <ImageIcon className="w-5 h-5 text-indigo-500" /> Thumbnail & Media Asset
            </h2>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
              Firebase Storage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload New Thumbnail</label>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Choose File (JPG, PNG, WebP)</span>
                    </>
                  )}
                </button>
              </div>

              {isUploadingImage && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image URL (Direct Path)</label>
                <input
                  type="text"
                  {...register('thumbnail')}
                  placeholder="https://... or /assets/images/..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Live Thumbnail Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Live Preview</span>
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner">
                {watchThumbnail ? (
                  <img
                    src={watchThumbnail}
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
                    <span>No Image Set</span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                placeholder="Add skill (e.g. Linux CLI, Systemd)..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Learning Outcomes (Min. 2 bullet points) *</label>
              <span className="text-[10px] text-slate-400">{outcomesInput.length} defined</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="Add measurable outcome..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
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
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                  <span>{outcome}</span>
                  <button type="button" onClick={() => removeOutcome(idx)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/courses"
            className="py-3 px-5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="py-3 px-7 rounded-xl bg-linear-to-r from-[#2563eb] to-[#7c3aed] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseEdit;
