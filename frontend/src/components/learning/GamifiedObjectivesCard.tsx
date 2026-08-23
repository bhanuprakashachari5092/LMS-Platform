import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle, Award } from 'lucide-react';
import { soundService } from '@/services/soundService';

interface GamifiedObjectivesCardProps {
  objectives: string;
  isNightMode?: boolean;
  title?: string;
}

interface ObjectiveItem {
  id: string;
  index: number;
  title: string;
  detail: string;
}

function parseObjectives(raw: string): ObjectiveItem[] {
  if (!raw || !raw.trim()) {
    return [
      {
        id: 'obj-0',
        index: 0,
        title: 'Core Conceptual Architecture',
        detail: 'Understand fundamental syntax execution, architectural patterns, and practical implementation standards.',
      },
    ];
  }

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: ObjectiveItem[] = [];

  lines.forEach((line) => {
    // Strip markdown formatting like - **Task 1**: or 1. or •
    const cleanLine = line.replace(/^[\*\-\•\d\.\)]+\s*/, '').trim();
    if (!cleanLine || cleanLine.startsWith('###') || cleanLine.toLowerCase().includes('learning objectives')) {
      return;
    }

    let title = '';
    let detail = '';

    if (cleanLine.includes(':')) {
      const parts = cleanLine.split(':');
      title = parts[0].replace(/\*\*/g, '').trim();
      detail = parts.slice(1).join(':').replace(/\*\*/g, '').trim();
    } else if (cleanLine.includes('—') || cleanLine.includes('-')) {
      const parts = cleanLine.split(/[—\-]/);
      title = parts[0].replace(/\*\*/g, '').trim();
      detail = parts.slice(1).join(' ').replace(/\*\*/g, '').trim();
    } else {
      title = `Objective Milestone 0${items.length + 1}`;
      detail = cleanLine.replace(/\*\*/g, '').trim();
    }

    if (title || detail) {
      items.push({
        id: `obj-${items.length}`,
        index: items.length,
        title: title || `Target Goal 0${items.length + 1}`,
        detail: detail || title,
      });
    }
  });

  if (items.length === 0) {
    return [
      {
        id: 'obj-0',
        index: 0,
        title: 'Fundamental Mastery',
        detail: raw.replace(/\*\*/g, '').slice(0, 150),
      },
    ];
  }

  return items;
}

export const GamifiedObjectivesCard: React.FC<GamifiedObjectivesCardProps> = ({
  objectives,
  isNightMode = true,
  title = 'Mission Learning Objectives',
}) => {
  const items = useMemo(() => parseObjectives(objectives), [objectives]);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const toggleObjective = (id: string) => {
    const isNowComplete = !completedIds[id];
    setCompletedIds((prev) => ({ ...prev, [id]: isNowComplete }));
    if (isNowComplete) {
      soundService.play('success');
    } else {
      soundService.play('select');
    }
  };

  const completedCount = Object.values(completedIds).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / Math.max(items.length, 1)) * 100);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden relative select-none p-5 sm:p-6 shadow-xl ${
        isNightMode
          ? 'bg-gradient-to-b from-[#0D1224] via-[#0E152B] to-[#0A0E1F] border-blue-500/30 text-slate-100 shadow-blue-950/40'
          : 'bg-gradient-to-b from-sky-50/70 via-white to-blue-50/40 border-sky-200 text-slate-900 shadow-sky-100/60'
      }`}
    >
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${isNightMode ? '#60a5fa' : '#2563eb'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-5 border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-blue-500/15 dark:bg-blue-950/80 border border-blue-500/30 text-blue-600 dark:text-blue-400">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-heading font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                3D MISSION BRIEFING
              </span>
            </h3>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              Click objectives to mark comprehension • Unlock 100% mission readiness
            </p>
          </div>
        </div>

        {/* Live Mastery Meter Pill */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-xs">
          <Award className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="text-[10px] font-mono">
            <span className="text-slate-500 dark:text-slate-400">MASTERY: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {completedCount} / {items.length} ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Laser Energy Bar */}
      <div className="relative z-10 w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 shadow-[0_0_8px_#60a5fa]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 3D Objective Target Tiles Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((item) => {
          const isDone = Boolean(completedIds[item.id]);

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleObjective(item.id)}
              className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isDone
                  ? isNightMode
                    ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40'
                  : isNightMode
                  ? 'bg-slate-900/80 border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-900 shadow-md'
                  : 'bg-white/90 border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-1.5 rounded-lg text-xs font-mono font-bold ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  </span>
                  <h4 className="text-xs sm:text-sm font-heading font-black text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h4>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? 'MASTERED ✓' : `TARGET 0${item.index + 1}`}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed mt-1">
                {item.detail}
              </p>

              {/* Active Bottom Glow Line */}
              {isDone && (
                <motion.div
                  layoutId="objectiveDoneGlow"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_8px_#34d399]"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GamifiedObjectivesCard;
