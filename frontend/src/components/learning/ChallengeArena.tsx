import React, { useState, useEffect } from 'react';
import { Copy, ArrowLeft, Lightbulb, CheckCircle2, AlertCircle, Zap, Code2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { soundService } from '@/services/soundService';
import type { Challenge } from '@/services/challengeEngine';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useTheme } from '@/contexts/ThemeContext';

function parseContent(content: string) {
  if (!content) return { objectives: '', concept: '', flowchart: '' };

  const lines = content.split('\n');
  const objectivesLines: string[] = [];
  const flowchartLines: string[] = [];
  const conceptLines: string[] = [];

  let inObjectives = false;
  // A box drawing or arrow character or lines containing explicit "diagram" keyword
  const flowchartChars = /[│┌└─↓├┤┬┴┼┐┘╔╗╚╝═║╠╣╦╩╬▲▼◄►┌┐└┘├┤┬┴┼─]/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if it's a flowchart line first
    const hasFlowchartChar = flowchartChars.test(line);
    const isExplicitDiagram = trimmed.toLowerCase().startsWith('diagram');

    if (hasFlowchartChar || isExplicitDiagram) {
      flowchartLines.push(line);
      continue;
    }

    // Detect Objectives block start
    const isObjectivesStart = /learning\s+objective/i.test(trimmed);
    if (isObjectivesStart) {
      inObjectives = true;
      objectivesLines.push(line);
      continue;
    }

    if (inObjectives) {
      // Objectives end when we see a new section heading, e.g. "1.1 Introduction" or "#### 1.2"
      const isNewHeading = trimmed.startsWith('#') || /^\d+\.\d+\s+/.test(trimmed) || /^\d+\.\d+\s*:/.test(trimmed);
      if (isNewHeading) {
        inObjectives = false;
        conceptLines.push(line);
      } else {
        objectivesLines.push(line);
      }
    } else {
      conceptLines.push(line);
    }
  }

  const finalObjectives = objectivesLines.join('\n').trim();
  let finalConcept = conceptLines.join('\n').trim();
  const finalFlowchart = flowchartLines.join('\n').trim();

  if (!finalObjectives && !finalConcept && content.trim()) {
    finalConcept = content.trim();
  }

  return {
    objectives: finalObjectives,
    concept: finalConcept,
    flowchart: finalFlowchart
  };
}

interface ChallengeArenaProps {
  challenge: Challenge;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNextLesson: () => void;
  hasNextLesson: boolean;
  onBackToMap: () => void;
  lessonContent: string;
  courseId: string;
}

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({
  challenge,
  isCompleted,
  onToggleComplete,
  onNextLesson,
  hasNextLesson,
  onBackToMap,
  lessonContent,
  courseId,
}) => {
  const { kqAppearance } = useTheme();
  const isNightMode = kqAppearance === 'night';

  const challengeStorageKey = React.useMemo(() => {
    const safeTitle = (challenge.title || '').replace(/[^a-zA-Z0-9]/g, '_');
    return `shaivika_ch_ans_${courseId}_${challenge.missionNum}_${challenge.challengeNum || safeTitle}`;
  }, [courseId, challenge.missionNum, challenge.challengeNum, challenge.title]);

  const [studentInput, setStudentInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [orderedSelection, setOrderedSelection] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showHint, setShowHint] = useState(false);

  const [showXPClaimedFeedback, setShowXPClaimedFeedback] = useState(false);
  const isInitialCompletedRef = React.useRef(isCompleted);

  // Gamified progression state
  const [revealedStageCount, setRevealedStageCount] = useState(1);
  const [showExampleExplanation, setShowExampleExplanation] = useState(false);

  // Parse lesson content
  const { objectives, concept, flowchart } = React.useMemo(() => parseContent(lessonContent), [lessonContent]);

  // Construct stages list dynamically
  const stages = React.useMemo(() => {
    return [
      ...(objectives ? [{ id: 'objectives', name: '🎯 LEARNING OBJECTIVES' }] : []),
      ...(concept ? [{ id: 'concept', name: '💡 CONCEPT / EXPLANATION' }] : []),
      ...(challenge.exampleCode ? [{ id: 'example', name: '💻 EXAMPLE / CODE' }] : []),
      ...(flowchart ? [{ id: 'flowchart', name: '🔀 FLOWCHART / DIAGRAM' }] : []),
      { id: 'practice', name: '🧪 PRACTICE' }
    ];
  }, [objectives, concept, challenge.exampleCode, flowchart]);

  const totalContentStages = stages.length;
  const isPracticeUnlocked = true;

  // Initialize and persist state when the challenge changes
  useEffect(() => {
    const savedAns = localStorage.getItem(challengeStorageKey);
    const isAlreadySolved = isCompleted || (savedAns !== null);

    if (isAlreadySolved) {
      setShowFeedback('correct');
      if (challenge.type === 'multiple-choice') {
        setSelectedOption(savedAns || String(challenge.correctAnswer));
      } else if (challenge.type === 'ordering') {
        try {
          setOrderedSelection(savedAns ? JSON.parse(savedAns) : (challenge.correctAnswer as string[]));
        } catch {
          setOrderedSelection(challenge.correctAnswer as string[]);
        }
      } else {
        setStudentInput(savedAns || String(challenge.correctAnswer));
      }
    } else {
      setStudentInput(challenge.placeholder || '');
      setSelectedOption('');
      setOrderedSelection([]);
      setShowFeedback('idle');
    }

    setShowHint(false);
    isInitialCompletedRef.current = isCompleted;
    setShowXPClaimedFeedback(false);

    // Reset progression states
    setShowExampleExplanation(false);
    setRevealedStageCount(totalContentStages);

    if (challenge.type === 'ordering' && challenge.options) {
      // Shuffle options for the ordering challenge
      setShuffledOptions([...challenge.options].sort(() => Math.random() - 0.5));
    }
  }, [challenge, totalContentStages, challengeStorageKey, isCompleted]);

  useEffect(() => {
    if (isCompleted && !isInitialCompletedRef.current) {
      setShowXPClaimedFeedback(true);
      const timer = setTimeout(() => {
        setShowXPClaimedFeedback(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    isInitialCompletedRef.current = isCompleted;
  }, [isCompleted]);

  const isLockedIn = isCompleted || showFeedback === 'correct';

  const handleOptionClick = (opt: string) => {
    if (isLockedIn) return;
    setSelectedOption(opt);
    soundService.play('select');
  };

  const handleOrderChipClick = (opt: string) => {
    if (isLockedIn) return;
    if (orderedSelection.includes(opt)) {
      setOrderedSelection(prev => prev.filter(x => x !== opt));
    } else {
      setOrderedSelection(prev => [...prev, opt]);
    }
    soundService.play('select');
  };

  const handleResetOrder = () => {
    if (isLockedIn) return;
    setOrderedSelection([]);
    soundService.play('select');
  };

  const handleCheckAnswer = () => {
    if (isLockedIn) return;
    let isCorrect = false;

    if (challenge.type === 'multiple-choice') {
      isCorrect = selectedOption.trim().toLowerCase() === String(challenge.correctAnswer).trim().toLowerCase();
    } else if (challenge.type === 'ordering') {
      const correctArr = challenge.correctAnswer as string[];
      isCorrect = 
        orderedSelection.length === correctArr.length &&
        orderedSelection.every((val, index) => val.toLowerCase() === correctArr[index].toLowerCase());
    } else {
      // code or command check: trim whitespace and compare case-insensitively
      const cleanInput = studentInput.trim().replace(/\s+/g, ' ').toLowerCase();
      const cleanAnswer = String(challenge.correctAnswer).trim().replace(/\s+/g, ' ').toLowerCase();
      isCorrect = cleanInput === cleanAnswer;
    }

    if (isCorrect) {
      setShowFeedback('correct');
      soundService.play('success');

      // Persist permanently in localStorage
      try {
        if (challenge.type === 'multiple-choice') {
          localStorage.setItem(challengeStorageKey, selectedOption);
        } else if (challenge.type === 'ordering') {
          localStorage.setItem(challengeStorageKey, JSON.stringify(orderedSelection));
        } else {
          localStorage.setItem(challengeStorageKey, studentInput);
        }
      } catch (err) {
        console.error('Failed to save challenge answer', err);
      }

      const diff = challenge.difficulty || 'Easy';
      const xp = diff.toLowerCase() === 'easy' ? 10 : diff.toLowerCase() === 'medium' ? 20 : 30;
      toast.success(`✓ Challenge complete! +${xp} XP awarded.`);
    } else {
      setShowFeedback('incorrect');
      soundService.play('error');
      toast.error('✕ Not yet correct. Try again!');
    }
  };

  const copyExampleCode = () => {
    navigator.clipboard.writeText(challenge.exampleCode);
    toast.success('Example code copied to clipboard');
    soundService.play('select');
  };

  return (
    <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 font-['Sora'] text-slate-850 dark:text-slate-200 transition-colors duration-300 animate-in fade-in">
      
      {/* Back to Mission Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>◀ MISSION MAP</span>
        </button>
        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-widest bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-900 font-mono">
          🎯 PRACTICE ACTIVE
        </span>
      </div>

      {/* Challenge Title HUD */}
      <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-md shadow-xs dark:shadow-md">
        <div className="absolute inset-0 bg-radial-gradient(circle at center right, rgba(249,115,22,0.06), transparent) pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-black uppercase text-primary tracking-widest font-mono bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md inline-block">
              🎯 MISSION {challenge.missionNum} • LEVEL {challenge.missionNum}
            </span>
            <h2 
              className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 font-heading tracking-tight"
            >
              {challenge.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10.5px]">
            <span className="px-3 py-1.5 font-black bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-600 dark:text-amber-400 shadow-2xs">
              ⚡ +50 XP
            </span>
            <span className="px-3 py-1.5 font-bold bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-600 dark:text-slate-400">
              ⏱ {(challenge as any).duration || '15 mins'}
            </span>
            <span className="px-3 py-1.5 font-bold bg-primary/15 border border-primary/30 rounded-xl text-primary uppercase tracking-wider">
              🏆 STEP {revealedStageCount} / {totalContentStages}
            </span>
          </div>
        </div>
      </div>

      {/* Arena Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[64%_minmax(0,1fr)] xl:grid-cols-[66%_minmax(0,1fr)] gap-8 items-start">
        
        {/* Left Column: Learn & See Example (Gamified Content Progression) */}
        <div className="space-y-6">
          {/* Mission Start Banner */}
          <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xs dark:shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-xl shrink-0">
                🎯
              </div>
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                  LESSON SEQUENCE
                </h4>
                <p className="text-xs sm:text-sm font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {challenge.title}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-full text-[9.5px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              ACTIVE NODE
            </span>
          </div>

          {/* Render content stages sequentially */}
          {stages.map((stage, idx) => {
            const isRevealed = true;
            if (!isRevealed) return null;

            const isNew = idx === revealedStageCount - 1;
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const animClass = isNew && !prefersReducedMotion
              ? 'animate-in fade-in slide-in-from-bottom-3.5 duration-500 shadow-sm border-l-4 border-l-primary'
              : 'border-l-4 border-l-slate-300 dark:border-l-slate-700';

            if (stage.id === 'objectives') {
              return (
                <div 
                  key="objectives" 
                  className={`bg-white/95 dark:bg-[#0E1325]/85 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-xs dark:shadow-md transition-all ${animClass}`}
                >
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-2.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                    <span>🎯 LEARNING OBJECTIVES</span>
                  </h3>
                  <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    <MarkdownRenderer
                      content={objectives}
                      isNightMode={isNightMode}
                      courseId={courseId}
                    />
                  </div>
                </div>
              );
            }

            if (stage.id === 'concept') {
              return (
                <div 
                  key="concept" 
                  className={`bg-white/95 dark:bg-[#0E1325]/85 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-xs dark:shadow-md transition-all ${animClass}`}
                >
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary border-b border-slate-200 dark:border-slate-800 pb-2.5 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>💡 CONCEPT & DEEP EXPLANATION</span>
                  </h3>
                  <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    <MarkdownRenderer
                      content={concept}
                      isNightMode={isNightMode}
                      courseId={courseId}
                    />
                  </div>
                </div>
              );
            }

            if (stage.id === 'example') {
              return (
                <div 
                  key="example" 
                  className={`bg-white/95 dark:bg-[#0E1325]/85 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-xs dark:shadow-md transition-all ${animClass}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span>💻 EXAMPLE & SYNTAX</span>
                    </h3>
                    <button
                      onClick={copyExampleCode}
                      className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer active:scale-95 transition-all font-mono hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
                      title="Copy code to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-emerald-400 dark:text-emerald-300 overflow-x-auto leading-relaxed shadow-inner font-mono">
                    <code>{challenge.exampleCode}</code>
                  </pre>

                  {/* Reveal Explanation Section */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    {!showExampleExplanation ? (
                      <button
                        onClick={() => {
                          setShowExampleExplanation(true);
                          soundService.play('success');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono text-[10px] font-bold rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>💡 REVEAL EXPLANATION</span>
                      </button>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed transition-all">
                        <span className="font-mono text-[10.5px] font-bold text-amber-600 dark:text-amber-400 block mb-1.5 uppercase tracking-wider">
                          EXPLANATION PROTOCOL:
                        </span>
                        {challenge.hint || "Review the syntax structure, functions, and key methods used in the code block example to understand how to apply it in the practice console."}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (stage.id === 'flowchart') {
              return (
                <div 
                  key="flowchart" 
                  className={`bg-white/95 dark:bg-[#0E1325]/85 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-xs dark:shadow-md transition-all ${animClass}`}
                >
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary border-b border-slate-200 dark:border-slate-800 pb-2.5 flex items-center gap-2">
                    <span>🔀 ARCHITECTURE & FLOWCHART</span>
                  </h3>
                  <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    <MarkdownRenderer
                      content={flowchart}
                      isNightMode={isNightMode}
                      courseId={courseId}
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Content Complete Milestone Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-5 flex items-center justify-between shadow-xs select-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                ✓
              </div>
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
                  READING GUIDE COMPLETE
                </h4>
                <p className="text-xs sm:text-sm font-heading font-extrabold text-slate-900 dark:text-slate-200">
                  Complete the 💻 TRY IT OUT challenge below to earn your XP!
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-[9.5px] font-mono font-black bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-900 rounded-full text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              READY
            </span>
          </div>
        </div>

        {/* Right Column: 💻 TRY IT OUT - Interactive Practice Challenge */}
        <div 
          className={`space-y-6 lg:sticky lg:top-24 transition-all duration-300 relative ${
            !isPracticeUnlocked 
              ? 'opacity-40 pointer-events-none filter blur-[1px] select-none' 
              : 'opacity-100 pointer-events-auto filter-none select-auto'
          }`}
        >
          {!isPracticeUnlocked && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/20 rounded-3xl p-4 text-center">
              <span className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs text-amber-500 font-mono font-bold uppercase tracking-widest rounded-xl shadow-lg animate-pulse">
                🔒 Complete Learn Path to Unlock Practice
              </span>
            </div>
          )}
          
          {/* Main TRY IT OUT Card */}
          <div className="bg-white/95 dark:bg-[#0E1325]/95 border-2 border-primary/40 dark:border-primary/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg shadow-primary/5 dark:shadow-primary/10 relative overflow-hidden">
            {/* Corner Badge */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
              <h3 className="text-xs sm:text-sm font-heading font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="p-1 rounded-lg bg-primary/15 text-primary">💻</span>
                <span>TRY IT OUT</span>
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                isLockedIn
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
              }`}>
                {isLockedIn ? '🔒 SUBMITTED' : `${challenge.difficulty || 'Easy'} Challenge`}
              </span>
            </div>

            {/* Task Prompt */}
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {challenge.challengeTask}
            </div>

            {/* Locked Feedback Banner if already answered */}
            {isLockedIn && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-sans font-medium select-none">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Response submitted and saved. Answer is locked.</span>
              </div>
            )}

            {/* Interaction Input Interface Area */}
            <div className="mt-4">
              
              {/* Case 1: Multiple Choice */}
              {challenge.type === 'multiple-choice' && challenge.options && (
                <div className="space-y-2.5 font-sans">
                  {challenge.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={isLockedIn}
                        className={`w-full p-3.5 sm:p-4 text-left rounded-2xl border text-xs sm:text-sm transition-all duration-150 flex items-center gap-3 ${
                          isLockedIn
                            ? isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs cursor-default'
                              : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-200 font-bold shadow-xs ring-2 ring-blue-500/20 active:scale-98 cursor-pointer'
                            : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-300 active:scale-98 cursor-pointer'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? isLockedIn
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-blue-500 bg-blue-500 text-white'
                            : 'border-slate-400 dark:border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Case 2: Code Challenge Editor */}
              {challenge.type === 'code' && (
                <div className="border border-slate-800 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner bg-slate-950">
                  <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 text-[10px] text-slate-400 flex justify-between select-none font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>practice_editor.py</span>
                    </span>
                    <span>{isLockedIn ? '🔒 READ ONLY' : 'Tab spacing: 4'}</span>
                  </div>
                  <textarea
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    disabled={isLockedIn}
                    readOnly={isLockedIn}
                    rows={4}
                    className={`w-full bg-transparent p-4 outline-hidden text-emerald-400 dark:text-emerald-300 text-xs sm:text-sm font-mono border-0 focus:ring-0 resize-none leading-relaxed placeholder:text-slate-700 ${
                      isLockedIn ? 'cursor-not-allowed opacity-90' : ''
                    }`}
                    placeholder={challenge.placeholder || "# Write your solution code here"}
                  />
                </div>
              )}

              {/* Case 3: Command Challenge Line */}
              {challenge.type === 'command' && (
                <div className="bg-[#0A0E1A] border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-inner">
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 text-[10px] text-slate-400 select-none font-mono flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-slate-400">{isLockedIn ? 'interactive_terminal.sh (locked)' : 'interactive_terminal.sh'}</span>
                  </div>
                  <div className="p-4 flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm shrink-0 select-none font-mono">
                      $
                    </span>
                    <input
                      type="text"
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      disabled={isLockedIn}
                      readOnly={isLockedIn}
                      placeholder="Type command here..."
                      className={`flex-1 bg-transparent border-0 outline-hidden focus:ring-0 text-emerald-400 dark:text-emerald-300 text-xs sm:text-sm font-mono placeholder:text-slate-600 p-0 ${
                        isLockedIn ? 'cursor-not-allowed opacity-90' : ''
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Case 4: Ordering Sequence Challenge */}
              {challenge.type === 'ordering' && challenge.options && (
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    {isLockedIn ? 'Submitted sequence:' : 'Click steps below to arrange in chronological sequence:'}
                  </div>

                  {/* Order Selector Chips List */}
                  {!isLockedIn && (
                    <div className="flex flex-wrap gap-2">
                      {shuffledOptions.map((opt, idx) => {
                        const isSelected = orderedSelection.includes(opt);
                        const displayNum = orderedSelection.indexOf(opt) + 1;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleOrderChipClick(opt)}
                            disabled={isLockedIn}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer select-none flex items-center gap-2 ${
                              isSelected
                                ? 'bg-primary/15 border-primary text-primary shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <span className="bg-primary text-slate-950 px-1.5 py-0.5 text-[9.5px] rounded-md font-black">
                                {displayNum}
                              </span>
                            )}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Ordered Output List View */}
                  <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 min-h-[52px] flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {orderedSelection.length > 0 ? (
                        orderedSelection.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-white">
                            {idx > 0 && <span className="text-slate-400">➔</span>}
                            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg font-bold text-primary shadow-2xs">
                              {val}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">
                          Click blocks above to construct path sequence...
                        </span>
                      )}
                    </div>

                    {orderedSelection.length > 0 && !isLockedIn && (
                      <button
                        onClick={handleResetOrder}
                        className="text-[10px] text-rose-600 dark:text-rose-400 hover:text-rose-700 border border-rose-200 dark:border-rose-900/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold bg-rose-50 dark:bg-rose-950/40"
                      >
                        RESET
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Check Challenge Submissions action */}
            {!(isCompleted || showFeedback === 'correct') && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCheckAnswer}
                  className="flex-1 py-3.5 bg-linear-to-r from-blue-600 via-indigo-600 to-primary hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-all duration-150 hover:scale-102 active:scale-95 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  <span>CHECK SOLUTION</span>
                </button>
                <button
                  onClick={() => {
                    setShowHint(true);
                    soundService.play('select');
                  }}
                  className="px-5 py-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl cursor-pointer hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Hint</span>
                </button>
              </div>
            )}

            {/* Hint Box panel */}
            {showHint && !(isCompleted || showFeedback === 'correct') && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-300 animate-in slide-in-from-top-2 duration-200 font-sans">
                <Lightbulb className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-[10.5px] font-bold uppercase tracking-widest font-mono text-amber-700 dark:text-amber-400">
                    💡 Hint Protocol:
                  </div>
                  <div className="text-xs font-medium leading-relaxed">
                    {challenge.hint}
                  </div>
                </div>
              </div>
            )}

            {/* Correct Feedback Screen */}
            {(isCompleted || showFeedback === 'correct') && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 dark:border-emerald-500/60 rounded-2xl p-5 text-center animate-in zoom-in-95 duration-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm uppercase tracking-widest">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>✓ CHALLENGE COMPLETE!</span>
                </div>
                
                <div className="py-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 font-mono tracking-wide">
                    +{challenge.difficulty?.toLowerCase() === 'easy' ? 10 : challenge.difficulty?.toLowerCase() === 'medium' ? 20 : challenge.difficulty?.toLowerCase() === 'hard' ? 30 : 10} XP
                  </span>
                </div>

                <div className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-sans font-medium">
                  Outstanding job! You've successfully passed this mission challenge.
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center relative">
                  <button
                    onClick={() => {
                      if (!isCompleted) {
                        onToggleComplete();
                        toast.success('🎉 +50 XP Claimed! Lesson marked as completed!');
                      }
                    }}
                    disabled={isCompleted}
                    className={`py-3 px-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer w-full sm:w-auto relative ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 cursor-default'
                        : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 hover:scale-103 active:scale-95'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>✓ XP Claimed (+50 XP)</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-slate-950 fill-current" />
                        <span>⚡ Claim +50 XP</span>
                      </>
                    )}
                  </button>

                  {showXPClaimedFeedback && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-amber-500 text-slate-950 text-[10.5px] font-black py-1 px-3 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider select-none pointer-events-none animate-xp-float z-50">
                      <Zap className="w-3 h-3 fill-slate-950" />
                      <span>⚡ +50 XP CLAIMED</span>
                    </div>
                  )}

                  {hasNextLesson && (
                    <button
                      onClick={onNextLesson}
                      className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Next Node ➔</span>
                    </button>
                  )}
                </div>

                {!hasNextLesson && (
                  <div className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono py-2">
                    🎉 CONGRATULATIONS! ALL SYLLABUS CHALLENGES SECURED!
                  </div>
                )}
              </div>
            )}

            {/* Incorrect Feedback Screen */}
            {showFeedback === 'incorrect' && !isCompleted && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-start gap-3 text-rose-800 dark:text-rose-300 animate-in slide-in-from-top-2 duration-200 font-sans">
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-[10.5px] font-bold uppercase tracking-widest font-mono text-rose-700 dark:text-rose-400">
                    ✕ NOT YET CORRECT
                  </div>
                  <div className="text-xs font-medium">
                    Parameters do not match target check specifications. Review hint and try again.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
