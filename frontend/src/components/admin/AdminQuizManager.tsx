import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Loader2,
  BarChart3,
  X,
  FileQuestion,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { quizService } from '@/services/quizService';
import type { Quiz, QuizQuestion, QuizAnalytics } from '@/services/quizService';

interface AdminQuizManagerProps {
  courseId: string;
  courseTitle?: string;
  lessonId?: string;
  unitTitle?: string;
  onSaved?: (quiz: Quiz) => void;
}

export const AdminQuizManager: React.FC<AdminQuizManagerProps> = ({
  courseId,
  courseTitle,
  lessonId,
  unitTitle,
  onSaved,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Quiz Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeLimit, setTimeLimit] = useState<number>(15);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [maxAttempts, setMaxAttempts] = useState<number>(3);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Question Editor Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'mcq' | 'ms' | 'tf' | 'short'>('mcq');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectAnswer, setQCorrectAnswer] = useState<string | string[]>('');
  const [qExplanation, setQExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [qPoints, setQPoints] = useState<number>(1);

  // Analytics Modal
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Load Existing Quiz
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      try {
        let existing: Quiz | null = null;
        if (lessonId) {
          existing = await quizService.getQuizByLesson(lessonId);
        }
        if (!existing && courseId) {
          const list = await quizService.getQuizzesByCourse(courseId);
          existing = list.find((q) => q.lessonId === lessonId) || list[0] || null;
        }

        if (existing) {
          setQuiz(existing);
          setTitle(existing.title || '');
          setDescription(existing.description || '');
          setInstructions(existing.instructions || '');
          setTimeLimit(existing.timeLimit || 15);
          setPassingScore(existing.passingScore || 70);
          setMaxAttempts(existing.maxAttempts || 3);
          setIsPublished(existing.isPublished !== undefined ? existing.isPublished : true);
          setQuestions(existing.questions || []);
        } else {
          setTitle(unitTitle ? `${unitTitle} — Assessment` : 'Module Assessment');
          setDescription('Test your understanding of the key concepts covered in this module.');
          setInstructions('Answer all questions. You must meet or exceed the passing score to receive full credit.');
          setQuestions([
            {
              id: `q_${Date.now()}_1`,
              type: 'mcq',
              question: 'Which of the following is a primary characteristic of this topic?',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A',
              explanation: 'Option A directly reflects the core architectural principle.',
              difficulty: 'Easy',
              points: 1,
              order: 1,
            },
          ]);
        }
      } catch (err: any) {
        toast.error('Failed to load quiz data.');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [courseId, lessonId, unitTitle]);

  // Open Question Editor Modal
  const handleOpenQuestionModal = (idx: number | null) => {
    if (idx !== null && questions[idx]) {
      const q = questions[idx];
      setEditingQuestionIndex(idx);
      setQText(q.question);
      setQType(q.type);
      setQOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '', '', '']);
      setQCorrectAnswer(q.correctAnswer || '');
      setQExplanation(q.explanation || '');
      setQDifficulty(q.difficulty || 'Medium');
      setQPoints(q.points || 1);
    } else {
      setEditingQuestionIndex(null);
      setQText('');
      setQType('mcq');
      setQOptions(['', '', '', '']);
      setQCorrectAnswer('');
      setQExplanation('');
      setQDifficulty('Medium');
      setQPoints(1);
    }
    setShowQuestionModal(true);
  };

  // Save Single Question
  const handleSaveQuestion = () => {
    if (!qText.trim()) {
      toast.error('Question text cannot be empty.');
      return;
    }

    if (qType === 'mcq' || qType === 'ms') {
      const validOptions = qOptions.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        toast.error('Multiple Choice / Multiple Select questions must have at least 2 valid options.');
        return;
      }
      if (!qCorrectAnswer || (Array.isArray(qCorrectAnswer) && qCorrectAnswer.length === 0)) {
        toast.error('Please select at least one correct answer from the options.');
        return;
      }
    } else if (qType === 'tf') {
      if (!qCorrectAnswer) {
        toast.error('Please select whether True or False is the correct answer.');
        return;
      }
    } else if (qType === 'short') {
      if (!qCorrectAnswer || String(qCorrectAnswer).trim() === '') {
        toast.error('Please provide the expected correct short answer.');
        return;
      }
    }

    const newQuestion: QuizQuestion = {
      id: editingQuestionIndex !== null ? questions[editingQuestionIndex]?.id || `q_${Date.now()}` : `q_${Date.now()}`,
      type: qType,
      question: qText.trim(),
      options: (qType === 'mcq' || qType === 'ms') ? qOptions.map((o) => o.trim()).filter(Boolean) : undefined,
      correctAnswer: qCorrectAnswer,
      explanation: qExplanation.trim(),
      difficulty: qDifficulty,
      points: Number(qPoints) > 0 ? Number(qPoints) : 1,
      order: editingQuestionIndex !== null ? editingQuestionIndex + 1 : questions.length + 1,
    };

    let updatedQuestions: QuizQuestion[];
    if (editingQuestionIndex !== null) {
      updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
    } else {
      updatedQuestions = [...questions, newQuestion];
    }

    setQuestions(updatedQuestions);
    setShowQuestionModal(false);
    toast.success('Question added to quiz.');
  };

  // Delete Question
  const handleDeleteQuestion = (idx: number) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    toast.success('Question deleted.');
  };

  // Reorder Questions
  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === questions.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((q, i) => {
      q.order = i + 1;
    });
    setQuestions(updated);
  };

  // Save Full Quiz (Backend API)
  const handleSaveFullQuiz = async () => {
    if (!title.trim()) {
      toast.error('Quiz title is required.');
      return;
    }
    if (questions.length === 0) {
      toast.error('Quiz must contain at least 1 question.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        id: quiz?.id || `quiz_${courseId}_${lessonId || 'general'}`,
        courseId,
        courseTitle,
        lessonId: lessonId || undefined,
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        timeLimit: Number(timeLimit) >= 0 ? Number(timeLimit) : 15,
        passingScore: Number(passingScore) > 0 ? Number(passingScore) : 70,
        maxAttempts: Number(maxAttempts) >= 0 ? Number(maxAttempts) : 3,
        isPublished,
        questions,
      };

      const saved = await quizService.saveQuiz(payload);
      setQuiz(saved);
      toast.success('🎉 Quiz configuration & questions saved successfully!');
      if (onSaved) onSaved(saved);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  // Fetch Analytics
  const handleViewAnalytics = async () => {
    if (!quiz?.id) return;
    setLoadingAnalytics(true);
    setShowAnalyticsModal(true);
    try {
      const res = await quizService.getQuizAnalytics(quiz.id);
      setAnalytics(res);
    } catch (err: any) {
      toast.error(err.message || 'No analytics data yet.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading quiz editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Sora']">
      
      {/* Top Header & Save Button */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">
              Assessment Management
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {title || 'Quiz Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {quiz?.id && (
              <button
                type="button"
                onClick={handleViewAnalytics}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-sky-500" />
                <span>Analytics</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveFullQuiz}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
            </button>
          </div>
        </div>

        {/* Basic Configuration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quiz Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Limit (Minutes)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              placeholder="0 for unlimited"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Passing Score (%)</label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Maximum Attempts</label>
            <input
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              placeholder="0 for unlimited"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student Instructions</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Published & Active (Students can take this quiz)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Question List & Manager ───────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Questions ({questions.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handleOpenQuestionModal(null)}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No questions created yet. Click <strong>Add Question</strong> to build your assessment.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-500">
                        {q.points || 1} Pt{(q.points || 1) !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {q.difficulty || 'Medium'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {q.question}
                    </p>
                    <p className="text-[11px] text-emerald-500 font-medium">
                      Correct Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveQuestion(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(idx, 'down')}
                    disabled={idx === questions.length - 1}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionModal(idx)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Question Editor Modal ─────────────────────────────────────────── */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {editingQuestionIndex !== null ? `Edit Question #${editingQuestionIndex + 1}` : 'New Question'}
              </h3>
              <button type="button" onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'mcq', label: 'Multiple Choice' },
                    { id: 'ms', label: 'Multiple Select' },
                    { id: 'tf', label: 'True / False' },
                    { id: 'short', label: 'Short Answer' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setQType(t.id as any);
                        if (t.id === 'tf') {
                          setQCorrectAnswer('True');
                        } else if (t.id === 'ms') {
                          setQCorrectAnswer([]);
                        } else {
                          setQCorrectAnswer('');
                        }
                      }}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        qType === t.id
                          ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Prompt *</label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the question text..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>

              {/* Options for MCQ / MS */}
              {(qType === 'mcq' || qType === 'ms') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Options & Correct Answer Selection
                    </label>
                    <button
                      type="button"
                      onClick={() => setQOptions((prev) => [...prev, ''])}
                      className="text-[11px] font-bold text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {qOptions.map((opt, oIdx) => {
                      const isCorrect = qType === 'ms'
                        ? Array.isArray(qCorrectAnswer) && qCorrectAnswer.includes(opt)
                        : qCorrectAnswer === opt;
                      return (
                        <div key={oIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (qType === 'ms') {
                                const current = Array.isArray(qCorrectAnswer) ? [...qCorrectAnswer] : [];
                                if (current.includes(opt)) {
                                  setQCorrectAnswer(current.filter((c) => c !== opt));
                                } else {
                                  setQCorrectAnswer([...current, opt]);
                                }
                              } else {
                                setQCorrectAnswer(opt);
                              }
                            }}
                            className={`p-2 rounded-xl border text-xs font-bold cursor-pointer shrink-0 ${
                              isCorrect && opt
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                            title="Click to set as correct answer"
                          >
                            {isCorrect && opt ? <Check className="w-3.5 h-3.5" /> : `${String.fromCharCode(65 + oIdx)}`}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...qOptions];
                              const oldVal = updated[oIdx];
                              updated[oIdx] = e.target.value;
                              setQOptions(updated);
                              if (qType === 'mcq' && qCorrectAnswer === oldVal) {
                                setQCorrectAnswer(e.target.value);
                              }
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                          />
                          {qOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = qOptions.filter((_, i) => i !== oIdx);
                                setQOptions(updated);
                              }}
                              className="text-rose-500 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* True/False Selection */}
              {qType === 'tf' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Correct Answer</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setQCorrectAnswer(val)}
                        className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
                          qCorrectAnswer === val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Answer */}
              {qType === 'short' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Expected Answer *</label>
                  <input
                    type="text"
                    value={typeof qCorrectAnswer === 'string' ? qCorrectAnswer : ''}
                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                    placeholder="e.g. malloc or def"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Points</label>
                  <input
                    type="number"
                    value={qPoints}
                    onChange={(e) => setQPoints(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain why the answer is correct for the student review..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Analytics Modal ───────────────────────────────────────────────── */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-500" /> Quiz Performance Analytics
              </h3>
              <button type="button" onClick={() => setShowAnalyticsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingAnalytics ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
              </div>
            ) : analytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Attempts</p>
                    <p className="text-lg font-extrabold">{analytics.totalAttempts}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                    <p className="text-[10px] text-emerald-500 uppercase font-bold">Pass Rate</p>
                    <p className="text-lg font-extrabold text-emerald-500">{analytics.passRate}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                    <p className="text-[10px] text-indigo-500 uppercase font-bold">Avg Score</p>
                    <p className="text-lg font-extrabold text-indigo-500">{analytics.averageScore}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold">Per-Question Accuracy</h4>
                  {analytics.questionPerformance.map((qp, i) => (
                    <div key={qp.questionId || i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-medium truncate max-w-sm">{qp.question}</span>
                        <span className="font-bold text-indigo-500">{qp.correctPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${qp.correctPercentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminQuizManager;
