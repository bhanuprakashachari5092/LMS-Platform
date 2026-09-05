import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  Save,
  CheckCircle2,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { instructorService, type InstructorUser } from '@/services/instructorService';
import { liveClassService, type LiveClass } from '@/services/liveClassService';
import { extractYouTubeVideoId, YouTubePlayer } from '@/components/liveClass/YouTubePlayer';
import { toast } from 'sonner';

interface CourseOption {
  id: string;
  title: string;
}

interface InstructorOption {
  id: string;
  name: string;
  email?: string;
  specialization?: string;
}

export const AdminCreateLiveClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const { courses: lmsCourses } = useCourses();
  const isEditing = Boolean(id);

  // Form State
  const [courseId, setCourseId] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [moduleId, setModuleId] = useState<string>('');
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [topicId, setTopicId] = useState<string>('');
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [instructorName, setInstructorName] = useState<string>('');

  // Mode Selection: Interactive Classroom (default) vs YouTube Live (optional fallback)
  const [mode, setMode] = useState<'interactive' | 'youtube'>('interactive');
  const [youtubeInput, setYoutubeInput] = useState<string>('');

  // Schedule
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>('10:00');
  const [duration, setDuration] = useState<number>(90);
  const [status, setStatus] = useState<string>('SCHEDULED');

  // Metadata
  const [tags, setTags] = useState<string>('React, Live Classroom, Interactive');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [loading, setLoading] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [instructorsList, setInstructorsList] = useState<InstructorUser[]>([]);

  // Subscribe to dynamic instructors
  useEffect(() => {
    const unsub = instructorService.subscribeToInstructors((insts) => {
      setInstructorsList(insts);
    });
    return () => unsub();
  }, []);

  // Compute dynamic, deduplicated course options from LMS catalog
  const courseOptions: CourseOption[] = useMemo(() => {
    if (lmsCourses && lmsCourses.length > 0) {
      return lmsCourses.map((c) => ({
        id: String(c.id),
        title: c.title,
      }));
    }
    return [];
  }, [lmsCourses]);

  // Compute module options for the selected course
  const moduleOptions = useMemo(() => {
    if (!courseId || !lmsCourses) return [];
    const selected = lmsCourses.find((c) => String(c.id) === courseId);
    if (!selected || !selected.modules) return [];
    return selected.modules.map((m: any) => ({
      id: String(m.id || m.moduleId || ''),
      title: m.title || m.moduleTitle || '',
    }));
  }, [courseId, lmsCourses]);

  // Compute topic options for the selected module
  const topicOptions = useMemo(() => {
    if (!courseId || !moduleId || !lmsCourses) return [];
    const selected = lmsCourses.find((c) => String(c.id) === courseId);
    if (!selected || !selected.modules) return [];
    const mod = selected.modules.find((m: any) => String(m.id || m.moduleId || '') === moduleId);
    if (!mod || !mod.topics) return [];
    return mod.topics.map((t: any) => ({
      id: String(t.id || t.topicId || ''),
      title: t.title || t.topicTitle || '',
    }));
  }, [courseId, moduleId, lmsCourses]);

  // Compute dynamic, deduplicated instructors
  const instructorOptions: InstructorOption[] = useMemo(() => {
    const map = new Map<string, InstructorOption>();
    const seenEmails = new Set<string>();
    const seenNames = new Set<string>();

    instructorsList.forEach((inst) => {
      if (!inst) return;
      const email = (inst.email || '').toLowerCase().trim();
      const name = (inst.name || '').trim();
      const normalizedName = name.toLowerCase();

      const idVal = String(inst.id || email || name);
      if (!map.has(idVal)) {
        if (email) seenEmails.add(email);
        if (normalizedName) seenNames.add(normalizedName);
        map.set(idVal, {
          id: idVal,
          name: name || 'Faculty Instructor',
          email: inst.email,
          specialization: inst.specialty || 'Instructor',
        });
      }
    });

    // If current logged-in user is an instructor or admin, make sure they are available in the list
    if (userProfile && (userProfile.role === 'instructor' || userProfile.role === 'admin')) {
      const myEmail = (userProfile.email || user?.email || '').toLowerCase().trim();
      const myName = (userProfile.name || user?.displayName || '').trim();
      const myId = String(userProfile.uid || user?.uid || 'current_user');
      const normalizedMyName = myName.toLowerCase();

      if (!seenEmails.has(myEmail) && !seenNames.has(normalizedMyName) && myName) {
        map.set(myId, {
          id: myId,
          name: myName,
          email: myEmail,
          specialization: userProfile.role === 'instructor' ? 'Assigned Instructor' : 'Administrator / Lead',
        });
      }
    }

    return Array.from(map.values());
  }, [instructorsList, userProfile, user]);

  // Set default course when course options load
  useEffect(() => {
    if (!courseId && courseOptions.length > 0) {
      setCourseId(courseOptions[0].id);
      setCourseName(courseOptions[0].title);
    }
  }, [courseOptions, courseId]);

  // Initialize instructor default dynamically
  useEffect(() => {
    if (userProfile?.role === 'instructor') {
      const myId = String(userProfile?.uid || user?.uid || 'inst_kaizen');
      const myName = userProfile?.name || user?.displayName || 'Faculty Instructor';
      setInstructorId(myId);
      setInstructorName(myName);
    } else if (!instructorId && instructorOptions.length > 0) {
      setInstructorId(instructorOptions[0].id);
      setInstructorName(instructorOptions[0].name);
    }
  }, [userProfile, user, instructorOptions, instructorId]);

  // Load existing class if editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      const existing = liveClassService.getLiveClassesSync().find((c) => c.id === id || c.classId === id);
      if (existing) {
        setCourseId(existing.courseId || '');
        setCourseName(existing.courseName || '');
        setModuleId(existing.moduleId || '');
        setModuleTitle(existing.moduleTitle || '');
        setTopicId(existing.topicId || existing.lessonId || '');
        setTopicTitle(existing.lessonTitle || '');
        setTitle(existing.title || '');
        setDescription(existing.description || '');
        setInstructorId(existing.instructorId || '');
        setInstructorName(existing.instructorName || '');

        const isYt = (existing as any).mode === 'youtube' || existing.meetingProvider === 'youtube' || Boolean(existing.youtubeVideoId);
        setMode(isYt ? 'youtube' : 'interactive');
        setYoutubeInput(existing.youtubeVideoId || '');

        setDuration(existing.duration || 90);
        setStatus((existing.status || 'SCHEDULED').toUpperCase());
        setDifficulty((existing.difficulty as any) || 'Intermediate');
        if (existing.tags && Array.isArray(existing.tags)) {
          setTags(existing.tags.join(', '));
        }

        const rawDate = existing.scheduledAt || existing.startTime;
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            setScheduledDate(d.toISOString().split('T')[0]);
            setScheduledTime(
              `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
            );
          } catch (e) {}
        }
      } else {
        toast.error('Live class not found.');
        navigate('/admin/live-classes');
      }
      setLoading(false);
    }
  }, [isEditing, id, navigate]);

  // Auto-parse YouTube Video ID when mode is YouTube
  useEffect(() => {
    if (mode === 'youtube' && youtubeInput.trim()) {
      const extracted = extractYouTubeVideoId(youtubeInput);
      setPreviewVideoId(extracted);
    } else {
      setPreviewVideoId(null);
    }
  }, [mode, youtubeInput]);

  const handleCourseChange = (selectedCourseId: string) => {
    setCourseId(selectedCourseId);
    const found = courseOptions.find((c) => c.id === selectedCourseId);
    if (found) setCourseName(found.title);
    setModuleId('');
    setModuleTitle('');
    setTopicId('');
    setTopicTitle('');
  };

  const handleModuleChange = (selectedModuleId: string) => {
    setModuleId(selectedModuleId);
    const found = moduleOptions.find((m) => m.id === selectedModuleId);
    if (found) setModuleTitle(found.title);
    setTopicId('');
    setTopicTitle('');
  };

  const handleTopicChange = (selectedTopicId: string) => {
    setTopicId(selectedTopicId);
    const found = topicOptions.find((t) => t.id === selectedTopicId);
    if (found) setTopicTitle(found.title);
  };

  const handleInstructorChange = (selectedInstId: string) => {
    setInstructorId(selectedInstId);
    const found = instructorOptions.find((i) => i.id === selectedInstId);
    if (found) setInstructorName(found.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length < 3) {
      toast.error('Please enter a meaningful Live Class Title (min 3 characters).');
      return;
    }
    if (!courseId) {
      toast.error('Please select a Course Program.');
      return;
    }
    if (!instructorId) {
      toast.error('Please assign an Instructor.');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please set scheduled date and start time.');
      return;
    }
    if (duration <= 0) {
      toast.error('Estimated Duration must be greater than 0 minutes.');
      return;
    }
    if (mode === 'youtube' && !previewVideoId && !youtubeInput.trim()) {
      toast.error('Please provide a valid YouTube Live Video ID or URL for YouTube Live mode.');
      return;
    }

    const videoId = mode === 'youtube' ? (previewVideoId || youtubeInput.trim()) : '';
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    // Normalize tags
    const normalizedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .filter((val, idx, arr) => arr.indexOf(val) === idx);

    const classIdToUse = id || `class_live_${Date.now()}`;
    const payload: Partial<LiveClass> & { mode: 'interactive' | 'youtube' } = {
      id: classIdToUse,
      classId: classIdToUse,
      courseId,
      courseName,
      moduleId: moduleId || undefined,
      moduleTitle: moduleTitle || undefined,
      topicId: topicId || undefined,
      lessonId: topicId || undefined,
      lessonTitle: topicTitle || undefined,
      title: cleanTitle,
      description: description.trim(),
      instructorId,
      instructorName,
      mode,
      meetingProvider: mode === 'youtube' ? 'youtube' : 'kaizenq',
      meetingRoomId: `live-class:${classIdToUse}`,
      meetingUrl: mode === 'youtube' && videoId ? `https://youtube.com/watch?v=${videoId}` : `/student/live-class/${classIdToUse}`,
      youtubeVideoId: videoId || undefined,
      scheduledAt: scheduledDateTime,
      startTime: scheduledDateTime,
      duration: Number(duration),
      status: isEditing ? (status as any) : 'SCHEDULED',
      difficulty,
      tags: normalizedTags,
      isChatEnabled: true,
      isPollEnabled: true,
      isQuizEnabled: true,
      isRecordingEnabled: false,
      isAttendanceEnabled: true,
      maxParticipants: 100,
      updatedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      if (isEditing && id) {
        await liveClassService.updateLiveClass(id, payload);
        toast.success('Live class updated successfully!');
      } else {
        await liveClassService.createLiveClass({
          ...payload,
          createdAt: new Date().toISOString(),
          createdBy: userProfile?.uid || user?.uid || 'admin',
        } as any);
        toast.success('Live class scheduled successfully!');
      }
      navigate('/admin/live-classes');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to create live class. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm font-['Sora']">Loading session details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-['Sora'] animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/live-classes')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:white text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Classes</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{mode === 'interactive' ? 'Interactive Classroom' : 'YouTube Live Mode'}</span>
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              {isEditing ? 'Edit Live Class' : 'Create New Live Class'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Create and schedule an interactive live classroom session for your students.
            </p>
          </div>

          {/* SECTION 1 — CLASS DETAILS */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black">1</span>
                Class Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Course Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Course Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {courseOptions.length === 0 ? (
                    <option value="">No courses available</option>
                  ) : (
                    courseOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Instructor Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Assigned Instructor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={instructorId}
                  onChange={(e) => handleInstructorChange(e.target.value)}
                  disabled={userProfile?.role === 'instructor'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  {instructorOptions.length === 0 ? (
                    <option value="">No registered instructors available</option>
                  ) : (
                    instructorOptions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} {inst.specialization ? `(${inst.specialization})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Module Selection (Optional if course has modules) */}
              {moduleOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                    Module <span className="text-slate-400 font-medium normal-case">(optional)</span>
                  </label>
                  <select
                    value={moduleId}
                    onChange={(e) => handleModuleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— All Modules —</option>
                    {moduleOptions.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Topic Selection (Optional if module has topics) */}
              {topicOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                    Topic <span className="text-slate-400 font-medium normal-case">(optional)</span>
                  </label>
                  <select
                    value={topicId}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— All Topics —</option>
                    {topicOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Class Title */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Live Class Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Masterclass: Scalable Real-Time System Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Session Description & Agenda
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Session overview, prerequisites, interactive code examples and discussion points..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 — LIVE CLASS MODE */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black">2</span>
                Live Class Mode <span className="text-rose-500">*</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('interactive')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  mode === 'interactive'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 block">Interactive Classroom</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Primary System</span>
                    </div>
                  </div>
                  {mode === 'interactive' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2.5 leading-relaxed">
                  Real-time video/audio, interactive whiteboard, live chat, Q&A, polls, quizzes, hand-raising, and automated attendance.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('youtube')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  mode === 'youtube'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 block">YouTube Live</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Optional Stream</span>
                    </div>
                  </div>
                  {mode === 'youtube' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2.5 leading-relaxed">
                  Broadcast via OBS Studio / external encoder to YouTube Unlisted Live while using Kaizen Q for real-time classroom tools.
                </p>
              </button>
            </div>

            {/* Interactive Classroom Information Card */}
            {mode === 'interactive' && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-blue-950 dark:text-blue-200">Interactive Classroom</h4>
                  <p className="text-xs text-blue-800/90 dark:text-blue-300/90 mt-0.5 leading-relaxed">
                    Instructor and students will join the Kaizen Q real-time classroom hosted through the platform's realtime infrastructure.
                  </p>
                </div>
              </div>
            )}

            {/* YouTube Live Configuration (Only shown when YouTube Live selected) */}
            {mode === 'youtube' && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                      YouTube Live Video ID or URL <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      OBS Studio stream key is kept private; only enter the YouTube Live Video ID here.
                    </span>
                  </div>
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="e.g. bMknfKXIFA8 or https://www.youtube.com/watch?v=bMknfKXIFA8 or https://youtube.com/live/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {previewVideoId ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Detected YouTube Video ID: <code className="font-mono">{previewVideoId}</code></span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      You can paste the YouTube Video ID once the broadcast is scheduled in YouTube Studio.
                    </p>
                  )}
                </div>

                {previewVideoId && (
                  <div className="max-w-md pt-2">
                    <YouTubePlayer youtubeVideoId={previewVideoId} title={title || 'Class Preview'} isLive={status === 'LIVE'} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3 — SCHEDULE SECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black">3</span>
                Schedule & Status
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Schedule Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Scheduled Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Start Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estimated Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Duration (Minutes) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={15}
                  max={300}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class Status (controlled server-side state) */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Class Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-80"
                >
                  <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                  {isEditing && (
                    <>
                      <option value="LIVE">LIVE (In Progress)</option>
                      <option value="ENDED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4 — ADDITIONAL METADATA */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black">4</span>
                Additional Metadata
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Difficulty Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Topic Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Topic Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="React, Architecture, Realtime"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => navigate('/admin/live-classes')}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Live Class'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateLiveClass;
