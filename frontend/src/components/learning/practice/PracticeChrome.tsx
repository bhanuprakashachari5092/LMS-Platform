import React, { useState } from 'react';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface PracticeChromeProps {
  title: string;
  tabLabel?: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'sky' | 'purple' | 'amber' | 'blue' | 'rose';
  description?: string;
  onReset?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  children: React.ReactNode;
  rightActions?: React.ReactNode;
}

export const PracticeChrome: React.FC<PracticeChromeProps> = ({
  title,
  tabLabel,
  badgeText,
  badgeColor = 'sky',
  description,
  onReset,
  isMaximized = false,
  onToggleMaximize,
  children,
  rightActions,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'purple':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'blue':
      case 'sky':
      default:
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
  };

  const handleResetClick = () => {
    if (showResetConfirm) {
      onReset?.();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 4000);
    }
  };

  return (
    <div
      className={`my-8 rounded-2xl border border-slate-700/70 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden font-sans transition-all duration-200 ${
        isMaximized
          ? 'fixed inset-4 z-50 my-0 flex flex-col shadow-2xl backdrop-blur-2xl ring-1 ring-slate-700'
          : 'relative'
      }`}
    >
      {/* ── IDE / Terminal Top Window Chrome ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800 select-none">
        {/* Left: Window Dots & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" />
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {tabLabel && (
            <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 font-semibold flex items-center gap-1.5 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              {tabLabel}
            </div>
          )}

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              {title}
              {badgeText && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getBadgeClass()}`}
                >
                  {badgeText}
                </span>
              )}
            </h4>
            {description && <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{description}</p>}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {rightActions}

          {onReset && (
            <button
              onClick={handleResetClick}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showResetConfirm
                  ? 'bg-rose-600/90 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Reset Code & Output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{showResetConfirm ? 'Confirm Reset?' : 'Reset'}</span>
            </button>
          )}

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              title={isMaximized ? 'Restore View' : 'Maximize Workspace'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Inner Workspace ─────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-h-0 ${isMaximized ? 'overflow-auto' : ''}`}>{children}</div>
    </div>
  );
};
