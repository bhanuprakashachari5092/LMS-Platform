import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  RotateCcw,
  Copy,
  Check,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Terminal,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Sparkles,
  BookOpen,
  ChevronRight,
  ListFilter,
  History,
  Lightbulb,
  CheckCheck,
  FileCode,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  practiceApiClient,
  type LanguageConfig,
  type PracticeProblemSummary,
  type PracticeProblemDetail,
  type RunCodeResponse,
  type SubmissionResponse,
} from '../../services/practice/practiceApiClient';

interface ProfessionalIDEProps {
  initialProblemId?: string;
  onBack?: () => void;
}

export const ProfessionalIDE: React.FC<ProfessionalIDEProps> = ({ initialProblemId, onBack }) => {
  // Problems and Language state
  const [problems, setProblems] = useState<PracticeProblemSummary[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(initialProblemId || 'two-sum');
  const [problemDetail, setProblemDetail] = useState<PracticeProblemDetail | null>(null);
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');

  // Editor state
  const [code, setCode] = useState<string>('');
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [draftStatus, setDraftStatus] = useState<string>('All changes saved');

  // Execution & Output state
  const [customStdin, setCustomStdin] = useState<string>('');
  const [activeBottomTab, setActiveBottomTab] = useState<'results' | 'stdin' | 'terminal' | 'history'>('results');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [mySubmissions, setMySubmissions] = useState<SubmissionResponse[]>([]);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);

  // UI Panels state
  const [showProblemDrawer, setShowProblemDrawer] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [bottomHeight, setBottomHeight] = useState<number>(300);

  const editorRef = useRef<any>(null);
  const draftDebounceTimer = useRef<any>(null);

  // 1. Load supported languages and problem catalog
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [langs, probs] = await Promise.all([
          practiceApiClient.getLanguages(),
          practiceApiClient.getProblems(),
        ]);
        if (!mounted) return;
        setLanguages(langs);
        setProblems(probs.content);
        if (probs.content.length > 0 && !initialProblemId) {
          setSelectedProblemId(probs.content[0].slug || probs.content[0].id);
        }
      } catch (err) {
        console.error('Failed to initialize IDE catalog:', err);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [initialProblemId]);

  // 2. Load problem detail, starter template or saved draft
  useEffect(() => {
    let mounted = true;
    async function loadProblem() {
      if (!selectedProblemId) return;
      try {
        const detail = await practiceApiClient.getProblemDetail(selectedProblemId);
        if (!mounted) return;
        setProblemDetail(detail);

        // Pre-fill custom stdin with first sample test case
        if (detail.sampleTestCases && detail.sampleTestCases.length > 0) {
          setCustomStdin(detail.sampleTestCases[0].inputData || '');
        }

        // Check for saved draft first
        const draft = await practiceApiClient.getDraft(selectedProblemId, selectedLanguage);
        if (!mounted) return;
        if (draft && draft.code) {
          setCode(draft.code);
          setDraftStatus(`Draft restored (${new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
        } else if (detail.templates && detail.templates[selectedLanguage]) {
          setCode(detail.templates[selectedLanguage]);
          setDraftStatus('Starter template loaded');
        } else {
          const matchedLang = languages.find((l) => l.id === selectedLanguage);
          setCode(matchedLang?.starterCode || '');
          setDraftStatus('Default template loaded');
        }

        // Reset previous run results
        setRunResult(null);
        setSubmissionResult(null);
        setSelectedTestCaseIndex(0);

        // Fetch submissions history for this problem
        loadSubmissions(detail.id);
      } catch (err) {
        console.error('Failed to load problem details:', err);
      }
    }
    loadProblem();
    return () => {
      mounted = false;
    };
  }, [selectedProblemId, selectedLanguage]);

  // 3. Load submission history
  const loadSubmissions = async (probId: string) => {
    try {
      const res = await practiceApiClient.getMySubmissions(probId);
      setMySubmissions(res.content || []);
    } catch (err) {
      console.warn('Could not load submission history:', err);
    }
  };

  // 4. Autosave draft handler with debounce
  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || '';
    setCode(val);
    setDraftStatus('Unsaved changes...');

    if (draftDebounceTimer.current) {
      clearTimeout(draftDebounceTimer.current);
    }

    draftDebounceTimer.current = setTimeout(async () => {
      if (!selectedProblemId || !selectedLanguage) return;
      try {
        await practiceApiClient.saveDraft(selectedProblemId, selectedLanguage, val);
        setDraftStatus(`Autosaved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } catch {
        setDraftStatus('Saved locally');
      }
    }, 1500);
  };

  // 5. Reset code to initial starter template
  const handleResetStarter = () => {
    if (!problemDetail) return;
    const starter =
      problemDetail.templates?.[selectedLanguage] ||
      languages.find((l) => l.id === selectedLanguage)?.starterCode ||
      '';
    setCode(starter);
    toast.info('Editor reset to starter template');
  };

  // 6. Copy code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  // 7. Run Code action (Ctrl+Enter)
  const handleRunCode = useCallback(async () => {
    if (isRunning || isSubmitting || !selectedProblemId) return;
    setIsRunning(true);
    setActiveBottomTab('results');
    toast.loading('Compiling and executing code in sandbox...', { id: 'run-toast' });

    try {
      const result = await practiceApiClient.runCode({
        problemId: selectedProblemId,
        language: selectedLanguage,
        code,
        customInput: customStdin,
      });

      setRunResult(result);
      toast.dismiss('run-toast');

      if (result.status === 'ACCEPTED') {
        toast.success(`Run Completed (${result.executionTimeMs}ms)`);
      } else if (result.status === 'COMPILATION_ERROR') {
        toast.error('Compilation Error');
      } else if (result.status === 'RUNTIME_ERROR') {
        toast.error('Runtime Error');
      } else if (result.status === 'TIME_LIMIT_EXCEEDED') {
        toast.error('Time Limit Exceeded');
      } else {
        toast.error(`Verdict: ${result.status}`);
      }
    } catch (err: any) {
      toast.dismiss('run-toast');
      toast.error(err.message || 'Execution error');
      setRunResult({
        stdout: '',
        stderr: err.message || 'Execution failed',
        status: 'INTERNAL_JUDGE_ERROR',
        executionTimeMs: 0,
        memoryUsedKb: 0,
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, isSubmitting, selectedProblemId, selectedLanguage, code, customStdin]);

  // 8. Submit Code action (Ctrl+Shift+Enter)
  const handleSubmitCode = useCallback(async () => {
    if (isRunning || isSubmitting || !selectedProblemId) return;
    setIsSubmitting(true);
    setActiveBottomTab('results');
    toast.loading('Evaluating solution against full test suite...', { id: 'sub-toast' });

    try {
      const result = await practiceApiClient.submitCode({
        problemId: selectedProblemId,
        language: selectedLanguage,
        code,
      });

      setSubmissionResult(result);
      toast.dismiss('sub-toast');

      if (result.verdict === 'ACCEPTED') {
        toast.success('🎉 Solution Accepted! All test cases passed!', { duration: 4000 });
      } else if (result.verdict === 'WRONG_ANSWER') {
        toast.error(`Wrong Answer (${result.passedCount}/${result.totalCount} passed)`);
      } else if (result.verdict === 'COMPILATION_ERROR') {
        toast.error('Compilation Error');
      } else if (result.verdict === 'TIME_LIMIT_EXCEEDED') {
        toast.error('Time Limit Exceeded');
      } else {
        toast.error(`Verdict: ${result.verdict}`);
      }

      // Refresh submissions
      if (problemDetail?.id) {
        loadSubmissions(problemDetail.id);
      }
    } catch (err: any) {
      toast.dismiss('sub-toast');
      toast.error(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  }, [isRunning, isSubmitting, selectedProblemId, selectedLanguage, code, problemDetail]);

  // Keyboard shortcut listener for Run & Submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitCode();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode, handleSubmitCode]);

  // Difficulty badge styling
  const getDifficultyBadge = (diff: string | undefined) => {
    const d = (diff || 'EASY').toUpperCase();
    if (d === 'EASY') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (d === 'MEDIUM') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  };

  const getVerdictBadge = (verdict: string) => {
    if (verdict === 'ACCEPTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Accepted</span>
        </span>
      );
    }
    if (verdict === 'WRONG_ANSWER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5" />
          <span>Wrong Answer</span>
        </span>
      );
    }
    if (verdict === 'TIME_LIMIT_EXCEEDED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Time Limit Exceeded</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>{verdict.replace(/_/g, ' ')}</span>
      </span>
    );
  };

  const currentMonacoLang = languages.find((l) => l.id === selectedLanguage)?.monacoLanguage || selectedLanguage;

  return (
    <div
      className={`flex flex-col bg-slate-950 text-slate-100 font-sans transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 p-3' : 'w-full h-[calc(100vh-80px)] min-h-[750px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl'
      }`}
    >
      {/* Top Navbar / IDE Control Strip */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Problem info & switcher */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowProblemDrawer(!showProblemDrawer)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer group"
          >
            <ListFilter className="w-4 h-4 text-blue-400 group-hover:rotate-180 transition-transform duration-300" />
            <span className="truncate max-w-[180px] sm:max-w-xs">{problemDetail?.title || 'Loading problem...'}</span>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getDifficultyBadge(problemDetail?.difficulty)}`}>
              {problemDetail?.difficulty || 'EASY'}
            </span>
          </button>

          <span className="text-[11px] text-slate-400 hidden md:inline truncate">{draftStatus}</span>
        </div>

        {/* Right: Language, Theme, Reset, Run, Submit */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            title="Toggle Editor Theme"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {theme === 'vs-dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Reset Code */}
          <button
            type="button"
            onClick={handleResetStarter}
            title="Reset to starter template"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Fullscreen Mode"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Run Code Button (Ctrl+Enter) */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            title="Run Code against custom input (Ctrl+Enter)"
          >
            <Play className={`w-3.5 h-3.5 text-emerald-400 fill-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
            <span className="hidden lg:inline text-[10px] text-slate-400 font-mono">^↵</span>
          </button>

          {/* Submit Code Button (Ctrl+Shift+Enter) */}
          <button
            type="button"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="h-9 px-5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            title="Submit solution for formal grading (Ctrl+Shift+Enter)"
          >
            <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
            <span>{isSubmitting ? 'Judging...' : 'Submit'}</span>
            <span className="hidden lg:inline text-[10px] text-blue-200 font-mono">⇧^↵</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Problem Statement & Sample Cases */}
        <div className="w-full md:w-[420px] lg:w-[480px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Problem Header */}
          <div className="p-5 border-b border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>{problemDetail?.category || 'Algorithm'}</span>
              </span>
              <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(problemDetail?.difficulty)}`}>
                {problemDetail?.difficulty || 'EASY'}
              </span>
            </div>
            <h1 className="text-xl font-heading font-black text-white">{problemDetail?.title}</h1>
            {problemDetail?.topicTags && (
              <div className="flex flex-wrap gap-1.5">
                {problemDetail.topicTags.split(',').map((tag) => (
                  <span
                    key={tag.trim()}
                    className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Problem Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problem Statement</h2>
              <div className="whitespace-pre-line text-slate-200">{problemDetail?.description}</div>
            </div>

            {/* Constraints */}
            {problemDetail?.constraints && (
              <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Constraints</span>
                </h3>
                <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">{problemDetail.constraints}</pre>
              </div>
            )}

            {/* Sample Test Cases */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sample Test Cases</h2>
                {problemDetail?.hiddenTestCaseCount ? (
                  <span className="text-[10px] text-slate-500 font-medium">
                    +{problemDetail.hiddenTestCaseCount} hidden test cases
                  </span>
                ) : null}
              </div>

              {problemDetail?.sampleTestCases?.map((tc, idx) => (
                <div key={tc.id || idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Example {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStdin(tc.inputData);
                        toast.info(`Loaded Example ${idx + 1} into Custom Stdin`);
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      Use as Input
                    </button>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Input:</div>
                    <pre className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800/60 text-xs font-mono text-emerald-400">
                      {tc.inputData}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Expected Output:</div>
                    <pre className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800/60 text-xs font-mono text-blue-400">
                      {tc.expectedOutput}
                    </pre>
                  </div>
                  {tc.explanation && (
                    <div className="text-xs text-slate-400 italic">
                      <span className="font-semibold text-slate-300">Explanation: </span>
                      {tc.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Hints Accordion */}
            {problemDetail?.hints && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-indigo-400 hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Hints & Approach</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showHints ? 'rotate-90' : ''}`} />
                </button>
                {showHints && (
                  <div className="p-4 pt-1 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                    {problemDetail.hints}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Workspace: Monaco Code Editor + Bottom Console */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* Center Monaco Editor */}
          <div className="flex-1 relative min-h-[300px]">
            <Editor
              height="100%"
              language={currentMonacoLang}
              theme={theme}
              value={code}
              onChange={handleCodeChange}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 14,
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontLigatures: true,
                padding: { top: 12, bottom: 12 },
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
              }}
            />
          </div>

          {/* Bottom Console / Terminal / Results Panel */}
          <div
            style={{ height: `${bottomHeight}px` }}
            className="border-t border-slate-800 bg-slate-900 flex flex-col shrink-0"
          >
            {/* Console Header Tabs */}
            <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('results')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeBottomTab === 'results'
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Test Results</span>
                  {(submissionResult || runResult) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab('stdin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeBottomTab === 'stdin'
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Custom Stdin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeBottomTab === 'terminal'
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal Output</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeBottomTab === 'history'
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Submissions ({mySubmissions.length})</span>
                </button>
              </div>

              {/* Panel Height Controls */}
              <div className="flex items-center gap-1 text-slate-500">
                <button
                  type="button"
                  onClick={() => setBottomHeight(bottomHeight === 180 ? 360 : 180)}
                  className="p-1 hover:text-slate-300 transition-colors text-xs font-mono"
                  title="Toggle console height"
                >
                  {bottomHeight === 180 ? '▲ Expand' : '▼ Compact'}
                </button>
              </div>
            </div>

            {/* Console Content Area */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-200">
              {/* TAB 1: Test Results */}
              {activeBottomTab === 'results' && (
                <div className="space-y-4">
                  {/* Submission Evaluation Result Banner */}
                  {submissionResult && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {getVerdictBadge(submissionResult.verdict)}
                          <span className="text-sm font-bold text-white">
                            {submissionResult.passedCount} / {submissionResult.totalCount} Test Cases Passed
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          {submissionResult.executionTimeMs != null && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{submissionResult.executionTimeMs} ms</span>
                            </span>
                          )}
                          {submissionResult.memoryUsedKb != null && (
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                              <span>{(submissionResult.memoryUsedKb / 1024).toFixed(1)} MB</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Case Chips */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {submissionResult.results?.map((res, i) => (
                          <span
                            key={i}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                              res.status === 'PASSED'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                                : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                            }`}
                          >
                            {res.status === 'PASSED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-400" />
                            )}
                            <span>
                              Case {i + 1} {res.hidden ? '(Hidden)' : ''}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Run Code Result */}
                  {runResult && !submissionResult && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {runResult.samplePassed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sample Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Verdict: {runResult.status}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{runResult.executionTimeMs} ms</span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">Stdout:</div>
                        <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                          {runResult.stdout || '(Empty output)'}
                        </pre>
                      </div>

                      {runResult.expectedOutput && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-slate-500 uppercase">Expected Output:</div>
                          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400">
                            {runResult.expectedOutput}
                          </pre>
                        </div>
                      )}

                      {runResult.compileOutput && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-rose-400 uppercase">Compile Error:</div>
                          <pre className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 text-rose-300">
                            {runResult.compileOutput}
                          </pre>
                        </div>
                      )}

                      {runResult.stderr && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-rose-400 uppercase">Stderr:</div>
                          <pre className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 text-rose-300">
                            {runResult.stderr}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {!runResult && !submissionResult && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10 space-y-2">
                      <Terminal className="w-8 h-8 text-slate-600" />
                      <p className="text-xs">Run or Submit your code to see automated execution outputs and test validation.</p>
                      <p className="text-[11px] text-slate-600">Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Ctrl+Enter</kbd> to Run, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Ctrl+Shift+Enter</kbd> to Submit</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Custom Stdin */}
              {activeBottomTab === 'stdin' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Enter custom standard input (stdin) for testing your solution:</div>
                  <textarea
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    rows={6}
                    placeholder="Enter input parameters..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRunCode}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Run with this Stdin</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Terminal Output */}
              {activeBottomTab === 'terminal' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">Execution console stream:</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 min-h-[140px]">
                    {runResult?.compileOutput || runResult?.stderr || runResult?.stdout || 'No active terminal output.'}
                  </pre>
                </div>
              )}

              {/* TAB 4: Submissions History */}
              {activeBottomTab === 'history' && (
                <div className="space-y-3">
                  {mySubmissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">No prior submissions for this problem yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {mySubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {getVerdictBadge(sub.verdict)}
                            <span className="font-bold text-white uppercase">{sub.language}</span>
                            <span className="text-slate-400">
                              {sub.passedCount} / {sub.totalCount} passed
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                            {sub.executionTimeMs != null && <span>{sub.executionTimeMs} ms</span>}
                            <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Problem Selector Drawer */}
      {showProblemDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setShowProblemDrawer(false)}
          />
          <div className="relative w-full max-w-md bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Practice Problem Catalog</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowProblemDrawer(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {problems.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProblemId(p.slug || p.id);
                    setShowProblemDrawer(false);
                  }}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                    p.id === selectedProblemId || p.slug === selectedProblemId
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">{p.title}</div>
                    <div className="text-[11px] text-slate-400">{p.category}</div>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getDifficultyBadge(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
