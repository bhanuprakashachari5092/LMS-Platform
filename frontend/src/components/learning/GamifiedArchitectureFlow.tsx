import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Zap,
  CheckCircle2,
  Terminal,
  Database,
  Cpu,
  Server,
  Layers,
  ArrowDown,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { soundService } from '@/services/soundService';

interface NodeData {
  id: string;
  index: number;
  label: string;
  subtext?: string;
  type: 'start' | 'process' | 'decision' | 'database' | 'output' | 'terminal';
}

interface GamifiedArchitectureFlowProps {
  rawContent: string;
  isNightMode?: boolean;
  title?: string;
}

/**
 * Parses raw text, arrows (↓, ->), and ASCII flowcharts into structured interactive nodes.
 */
function parseArchitectureFlow(raw: string): NodeData[] {
  if (!raw || !raw.trim()) return [];

  // Remove markdown codeblock markers if present
  const clean = raw.replace(/^```[a-z]*\n?/gim, '').replace(/```$/gim, '').trim();

  // Strategy 1: Check for arrow separators on single/multi-line (↓ or -> or ➔)
  if (clean.includes('↓') || clean.includes('➔') || clean.includes('-->') || clean.includes('──>')) {
    const rawSteps = clean
      .split(/[↓➔]|-->|──>/g)
      .map((s) => s.trim())
      .filter((s) => s && !s.match(/^[|─┌┐└┘├┤┬┴┼═║╠╣╦╩╬▲▼◄►]+$/));

    if (rawSteps.length > 1) {
      return rawSteps.map((step, idx) => {
        const cleanLabel = step.replace(/^[0-9]+[\.\)]\s*/, '').replace(/^[•\-\*]\s*/, '').trim();
        let type: NodeData['type'] = 'process';

        const lower = cleanLabel.toLowerCase();
        if (idx === 0 || lower.includes('start') || lower.includes('input') || lower.includes('client')) {
          type = 'start';
        } else if (idx === rawSteps.length - 1 || lower.includes('end') || lower.includes('output') || lower.includes('return') || lower.includes('response')) {
          type = 'output';
        } else if (lower.includes('if') || lower.includes('check') || lower.includes('valid') || lower.includes('condition') || lower.includes('?')) {
          type = 'decision';
        } else if (lower.includes('db') || lower.includes('database') || lower.includes('sql') || lower.includes('store') || lower.includes('cache')) {
          type = 'database';
        } else if (lower.includes('cli') || lower.includes('terminal') || lower.includes('command') || lower.includes('run')) {
          type = 'terminal';
        }

        return {
          id: `node-${idx}`,
          index: idx,
          label: cleanLabel,
          type,
        };
      });
    }
  }

  // Strategy 2: Line-by-line parsing (ignoring pure ASCII border lines)
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const validNodes: NodeData[] = [];

  lines.forEach((line) => {
    // Strip box characters
    const stripped = line.replace(/[│┌└─↓├┤┬┴┼┐┘╔╗╚╝═║╠╣╦╩╬▲▼◄►\[\]\(\)\{\}]/g, ' ').trim();
    if (stripped.length >= 2 && !stripped.match(/^[0-9\s]+$/)) {
      const idx = validNodes.length;
      let type: NodeData['type'] = 'process';
      const lower = stripped.toLowerCase();

      if (idx === 0 || lower.includes('start') || lower.includes('input') || lower.includes('client')) {
        type = 'start';
      } else if (lower.includes('db') || lower.includes('database') || lower.includes('sql') || lower.includes('data')) {
        type = 'database';
      } else if (lower.includes('if ') || lower.includes('check') || lower.includes('condition') || lower.includes('?')) {
        type = 'decision';
      } else if (lower.includes('output') || lower.includes('print') || lower.includes('return') || lower.includes('end')) {
        type = 'output';
      } else if (lower.includes('cli') || lower.includes('command') || lower.includes('shell')) {
        type = 'terminal';
      }

      validNodes.push({
        id: `node-${idx}`,
        index: idx,
        label: stripped,
        type,
      });
    }
  });

  // If too few nodes were parsed, return a fallback 3-stage representation
  if (validNodes.length < 2) {
    return [
      { id: 'node-0', index: 0, label: clean.slice(0, 40) || 'Execution Start', type: 'start' },
      { id: 'node-1', index: 1, label: 'Data Processing & Logic State', type: 'process' },
      { id: 'node-2', index: 2, label: 'Output / Verified Return', type: 'output' },
    ];
  }

  return validNodes;
}

export const GamifiedArchitectureFlow: React.FC<GamifiedArchitectureFlowProps> = ({
  rawContent,
  isNightMode = true,
  title = 'Interactive Architecture & Data Flow',
}) => {
  const nodes = useMemo(() => parseArchitectureFlow(rawContent), [rawContent]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play simulation interval
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= nodes.length - 1) {
            setIsPlaying(false);
            soundService.play('success');
            return prev;
          }
          soundService.play('select');
          return prev + 1;
        });
      }, 1600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, nodes.length]);

  const handleNext = () => {
    if (activeStep < nodes.length - 1) {
      setActiveStep((prev) => prev + 1);
      soundService.play('select');
      if (activeStep + 1 === nodes.length - 1) {
        soundService.play('success');
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      soundService.play('select');
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
    soundService.play('select');
  };

  const handleTogglePlay = () => {
    if (activeStep >= nodes.length - 1) {
      setActiveStep(0);
    }
    setIsPlaying(!isPlaying);
    soundService.play('select');
  };

  const getNodeIcon = (type: NodeData['type']) => {
    switch (type) {
      case 'start':
        return <Server className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'decision':
        return <Cpu className="w-4 h-4" />;
      case 'terminal':
        return <Terminal className="w-4 h-4" />;
      case 'output':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getNodeRoleDescription = (node: NodeData): string => {
    switch (node.type) {
      case 'start':
        return 'Initial request handler / entry point initializing the execution pipeline.';
      case 'database':
        return 'Persistence layer performing read/write queries and state caching.';
      case 'decision':
        return 'Conditional logic gate evaluating branching criteria and validation checks.';
      case 'terminal':
        return 'Execution console running system commands and environment operations.';
      case 'output':
        return 'Final response transformation delivering verified output and exit code.';
      default:
        return 'Core computation step processing algorithmic logic and transformations.';
    }
  };

  const progressPercent = Math.round(((activeStep + 1) / Math.max(nodes.length, 1)) * 100);

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden relative select-none ${
        isFullscreen ? 'fixed inset-4 z-50 p-6 shadow-2xl flex flex-col justify-between' : 'my-6 p-5 sm:p-6 shadow-lg'
      } ${
        isNightMode
          ? 'bg-gradient-to-b from-[#0B0F1F] via-[#0E1428] to-[#0A0D1B] border-cyan-500/30 text-slate-100 shadow-cyan-950/30'
          : 'bg-gradient-to-b from-sky-50/60 via-white to-slate-50 border-sky-200 text-slate-900 shadow-sky-100/60'
      }`}
    >
      {/* Background Animated Particle Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${isNightMode ? '#38bdf8' : '#0284c7'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Gamified HUD Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-5 border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/80 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-heading font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                3D LIVE SIMULATION
              </span>
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              <span>PROGRESS: {progressPercent}%</span>
              <span>•</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                NODE {activeStep + 1} OF {nodes.length}
              </span>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Flow'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-slate-600 dark:text-slate-300 text-xs transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isPlaying
                ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-300 hover:scale-102'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>SIMULATE FLOW</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Laser Energy Bar */}
      <div className="relative z-10 w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_8px_#38bdf8]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Interactive 3D Nodes Pipeline Canvas */}
      <div className="relative z-10 py-2 overflow-x-auto no-scrollbar">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 min-w-max mx-auto py-3">
          {nodes.map((node, idx) => {
            const isCurrent = idx === activeStep;
            const isPassed = idx < activeStep;

            let cardTheme = '';
            if (isCurrent) {
              cardTheme = isNightMode
                ? 'bg-gradient-to-br from-cyan-950/90 to-indigo-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/50 scale-105'
                : 'bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-500 shadow-[0_0_16px_rgba(2,132,199,0.25)] ring-2 ring-sky-500/40 scale-105';
            } else if (isPassed) {
              cardTheme = isNightMode
                ? 'bg-slate-900/80 border-emerald-500/60 text-slate-200 shadow-sm'
                : 'bg-emerald-50/70 border-emerald-400/80 text-emerald-950 shadow-xs';
            } else {
              cardTheme = isNightMode
                ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 opacity-60 hover:opacity-90'
                : 'bg-white/80 border-slate-200 text-slate-600 opacity-70 hover:opacity-100';
            }

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveStep(idx);
                    soundService.play('select');
                  }}
                  className={`w-48 sm:w-56 p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[110px] ${cardTheme}`}
                >
                  {/* Top Badge & Node Number */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {getNodeIcon(node.type)}
                      <span>STEP 0{idx + 1}</span>
                    </span>

                    {isCurrent ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    ) : isPassed ? (
                      <span className="text-[10px] text-emerald-500 font-bold">✓</span>
                    ) : null}
                  </div>

                  {/* Node Label */}
                  <h5 className="text-xs sm:text-sm font-heading font-extrabold leading-snug line-clamp-2">
                    {node.label}
                  </h5>

                  {/* Active Indicator Bar */}
                  {isCurrent && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_#38bdf8]"
                    />
                  )}
                </motion.div>

                {/* Laser Connector Arrow */}
                {idx < nodes.length - 1 && (
                  <div className="flex items-center justify-center shrink-0 my-1 md:my-0">
                    <div className="hidden md:flex items-center gap-1">
                      <div
                        className={`w-6 h-0.5 transition-all duration-300 ${
                          idx < activeStep
                            ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                            : idx === activeStep
                            ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]'
                            : 'bg-slate-300 dark:bg-slate-800'
                        }`}
                      />
                      <ChevronRight
                        className={`w-4 h-4 -ml-2 transition-all ${
                          idx < activeStep
                            ? 'text-emerald-400'
                            : idx === activeStep
                            ? 'text-cyan-400 animate-pulse'
                            : 'text-slate-400 dark:text-slate-700'
                        }`}
                      />
                    </div>

                    <div className="flex md:hidden flex-col items-center">
                      <ArrowDown
                        className={`w-4 h-4 ${
                          idx < activeStep
                            ? 'text-emerald-400'
                            : idx === activeStep
                            ? 'text-cyan-400 animate-bounce'
                            : 'text-slate-400 dark:text-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Layer Insight Deep-Dive Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 mt-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                ACTIVE STEP INSIGHT: {nodes[activeStep]?.label}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {getNodeRoleDescription(nodes[activeStep])}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <button
              onClick={handlePrev}
              disabled={activeStep === 0}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyan-500 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeStep === nodes.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyan-500 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset Flow"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GamifiedArchitectureFlow;
