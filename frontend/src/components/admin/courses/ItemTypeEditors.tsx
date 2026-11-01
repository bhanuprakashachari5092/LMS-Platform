import React, { useState } from 'react';
import {
  Video as VideoIcon,
  PlayCircle,
  HelpCircle,
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Clock,
  Award,
  FileText,
  AlertCircle,
  Code2,
  Link as LinkIcon,
  UploadCloud
} from 'lucide-react';
import type { LearningUnitItem, QuizQuestion } from '@/contexts/CourseContext';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. VIDEO EDITOR SECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface VideoEditorSectionProps {
  videoUrl: string;
  duration: string;
  notes?: string;
  onUpdateVideoUrl: (url: string) => void;
  onUpdateDuration: (duration: string) => void;
  onUpdateNotes: (notes: string) => void;
}

export function detectVideoProvider(url: string): { provider: string; embedUrl: string | null } {
  if (!url || typeof url !== 'string') return { provider: 'custom', embedUrl: null };
  const trimmed = url.trim();

  // YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      provider: 'YouTube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      provider: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Cloudinary / Firebase / Direct MP4
  if (trimmed.includes('cloudinary.com')) {
    return { provider: 'Cloudinary', embedUrl: trimmed };
  }
  if (trimmed.includes('firebasestorage.googleapis.com')) {
    return { provider: 'Firebase Storage', embedUrl: trimmed };
  }

  return { provider: 'Direct Stream', embedUrl: trimmed };
}

export const VideoEditorSection: React.FC<VideoEditorSectionProps> = ({
  videoUrl,
  duration,
  notes,
  onUpdateVideoUrl,
  onUpdateDuration,
  onUpdateNotes,
}) => {
  const { provider, embedUrl } = detectVideoProvider(videoUrl);

  return (
    <div className="space-y-6">
      {/* Video Source Configuration Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <VideoIcon className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Video Lecture Settings</h3>
              <p className="text-xs text-slate-400">Configure video URL, stream source, and duration.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800/80">
            {provider}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Video Stream URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => onUpdateVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or MP4 URL"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Duration (approx.)</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => onUpdateDuration(e.target.value)}
              placeholder="e.g. 15 mins"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Real-time Video Preview Player */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
          <span>Live Player Preview</span>
        </h4>

        {embedUrl ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-xl">
            {provider === 'YouTube' || provider === 'Vimeo' ? (
              <iframe
                src={embedUrl}
                title="Video Preview"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={embedUrl}
                controls
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video streaming.
              </video>
            )}
          </div>
        ) : (
          <div className="aspect-video w-full rounded-xl border border-dashed border-slate-800 bg-slate-950/60 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <PlayCircle className="w-10 h-10 text-slate-700" />
            <p className="text-xs font-semibold text-slate-400">No video URL entered yet</p>
            <p className="text-[11px] text-slate-600 max-w-sm">
              Enter a YouTube, Vimeo, Cloudinary, or direct video URL above to preview the player.
            </p>
          </div>
        )}
      </div>

      {/* Video Lecture Notes / Summary */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Video Lecture Notes & Takeaways</span>
        </label>
        <textarea
          value={notes || ''}
          onChange={(e) => onUpdateNotes(e.target.value)}
          rows={4}
          placeholder="Add summary bullet points, timestamps (e.g. 02:15 - Architecture), or prerequisite notes..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-purple-500 transition-colors"
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. QUIZ EDITOR SECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuizEditorSectionProps {
  questions: QuizQuestion[];
  onChangeQuestions: (questions: QuizQuestion[]) => void;
}

export const QuizEditorSection: React.FC<QuizEditorSectionProps> = ({
  questions,
  onChangeQuestions,
}) => {
  const [editingIdx, setEditingIdx] = useState<number | null>(0);

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      questionText: 'What is the correct concept or behavior?',
      options: [
        'Option A: First explanation',
        'Option B: Second explanation',
        'Option C: Third explanation',
        'Option D: Fourth explanation',
      ],
      correctAnswerIndex: 0,
      marks: 5,
      explanation: 'Explanation for the correct answer.',
    };
    const next = [...questions, newQ];
    onChangeQuestions(next);
    setEditingIdx(next.length - 1);
  };

  const removeQuestion = (idx: number) => {
    const next = questions.filter((_, i) => i !== idx);
    onChangeQuestions(next);
    if (editingIdx !== null && editingIdx >= next.length) {
      setEditingIdx(next.length - 1 >= 0 ? next.length - 1 : null);
    }
  };

  const updateQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
    const next = [...questions];
    next[idx] = { ...next[idx], ...updates };
    onChangeQuestions(next);
  };

  const updateOption = (qIdx: number, optIdx: number, val: string) => {
    const q = questions[qIdx];
    const opts = [...q.options];
    opts[optIdx] = val;
    updateQuestion(qIdx, { options: opts });
  };

  return (
    <div className="space-y-6">
      {/* Quiz Summary Header */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Quiz Question Builder</h3>
            <p className="text-xs text-slate-400">
              {questions.length} Question{questions.length !== 1 ? 's' : ''} •{' '}
              {questions.reduce((acc, q) => acc + (q.marks || 5), 0)} Total Points
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/60 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Question</span>
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
          <HelpCircle className="w-10 h-10 text-amber-500/40 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No Questions Added Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Add Question" above to create your first multiple-choice question for this quiz.
          </p>
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors cursor-pointer"
          >
            Create First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            const isEditing = editingIdx === qIdx;

            return (
              <div
                key={q.id || qIdx}
                className={`rounded-2xl border transition-all ${
                  isEditing
                    ? 'border-amber-500/80 bg-slate-900/90 shadow-lg'
                    : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                {/* Question Accordion Header */}
                <div
                  onClick={() => setEditingIdx(isEditing ? null : qIdx)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 truncate">
                      {q.questionText || `Question ${qIdx + 1}`}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                      {q.marks || 5} pts
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="p-1 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Details Editor */}
                {isEditing && (
                  <div className="p-4 pt-0 space-y-4 border-t border-slate-800/60">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Question Text</label>
                      <textarea
                        value={q.questionText}
                        onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 transition-colors"
                        placeholder="Enter the quiz question..."
                      />
                    </div>

                    {/* Multiple-Choice Options */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Answer Choices (Select radio button for Correct Answer)</span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          Correct: Option {String.fromCharCode(65 + (q.correctAnswerIndex ?? 0))}
                        </span>
                      </label>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctAnswerIndex === optIdx;

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                isCorrect
                                  ? 'border-emerald-500/80 bg-emerald-950/20'
                                  : 'border-slate-800 bg-slate-950'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={isCorrect}
                                onChange={() => updateQuestion(qIdx, { correctAnswerIndex: optIdx })}
                                className="accent-emerald-500 cursor-pointer"
                              />
                              <span className="font-mono font-bold text-xs text-slate-400 w-5">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                placeholder={`Choice ${String.fromCharCode(65 + optIdx)} text...`}
                                className="flex-1 bg-transparent text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden"
                              />
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation and Points */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-bold text-slate-300">Answer Explanation</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                          placeholder="Explanation shown to students after answer submission..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Points</label>
                        <input
                          type="number"
                          value={q.marks || 5}
                          onChange={(e) => updateQuestion(qIdx, { marks: Number(e.target.value) || 1 })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ASSIGNMENT EDITOR SECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface AssignmentEditorSectionProps {
  instructions: string;
  requirements?: string[];
  points?: number;
  deadline?: string;
  submissionType?: 'code' | 'file' | 'link' | 'text';
  onUpdateInstructions: (instructions: string) => void;
  onUpdateRequirements: (requirements: string[]) => void;
  onUpdatePoints: (points: number) => void;
  onUpdateDeadline: (deadline: string) => void;
  onUpdateSubmissionType: (type: 'code' | 'file' | 'link' | 'text') => void;
}

export const AssignmentEditorSection: React.FC<AssignmentEditorSectionProps> = ({
  instructions,
  requirements = [],
  points = 100,
  deadline = '',
  submissionType = 'code',
  onUpdateInstructions,
  onUpdateRequirements,
  onUpdatePoints,
  onUpdateDeadline,
  onUpdateSubmissionType,
}) => {
  const [newReq, setNewReq] = useState('');

  const addRequirement = () => {
    if (!newReq.trim()) return;
    onUpdateRequirements([...requirements, newReq.trim()]);
    setNewReq('');
  };

  const removeRequirement = (idx: number) => {
    onUpdateRequirements(requirements.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Assignment Header Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Assignment Specifications</h3>
              <p className="text-xs text-slate-400">Configure deliverables, requirements, and grading criteria.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            {points} Total Points
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Accepted Submission Format</label>
            <select
              value={submissionType}
              onChange={(e) => onUpdateSubmissionType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="code">Source Code Repository / Snippet</option>
              <option value="file">File Upload (PDF, ZIP, Image)</option>
              <option value="link">External URL / Live Deployment</option>
              <option value="text">Written Essay / Solution Text</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Total Marks / Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => onUpdatePoints(Number(e.target.value) || 50)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Suggested Duration / Deadline</label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => onUpdateDeadline(e.target.value)}
              placeholder="e.g. 3 days / due end of module"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Detailed Assignment Instructions (Markdown supported)</span>
        </label>
        <textarea
          value={instructions}
          onChange={(e) => onUpdateInstructions(e.target.value)}
          rows={6}
          placeholder="Describe the task, setup commands, expected outputs, and submission instructions..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 font-mono transition-colors"
        />
      </div>

      {/* Requirements Checklist */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Evaluation Requirements / Rubric Items ({requirements.length})</span>
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={newReq}
            onChange={(e) => setNewReq(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRequirement();
              }
            }}
            placeholder="e.g. Code passes all automated test cases with >= 80% coverage"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={addRequirement}
            className="px-3 py-2 text-xs font-bold text-emerald-300 bg-emerald-950 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-xl transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          {requirements.map((req, rIdx) => (
            <div
              key={rIdx}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {rIdx + 1}
                </span>
                <span className="truncate">{req}</span>
              </div>
              <button
                type="button"
                onClick={() => removeRequirement(rIdx)}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove requirement"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
