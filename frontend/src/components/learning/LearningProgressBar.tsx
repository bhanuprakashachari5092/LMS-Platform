import React from 'react';

interface LearningProgressBarProps {
  completedCount: number;
  totalCount: number;
  isNightMode?: boolean;
}

/**
 * LearningProgressBar — clean progress row.
 * "X% complete" + thin animated bar + "N of M lessons completed"
 */
export const LearningProgressBar: React.FC<LearningProgressBarProps> = ({
  completedCount,
  totalCount,
  isNightMode = false,
}) => {
  const percent = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  return (
    <div
      className={`w-full px-4 sm:px-6 py-2.5 flex items-center gap-4 border-b transition-colors shrink-0
        ${isNightMode
          ? 'bg-slate-950 border-slate-800/60'
          : 'bg-white border-slate-100'
        }`}
    >
      {/* Percentage label */}
      <span className={`text-xs font-semibold tabular-nums shrink-0 min-w-[4.5rem]
        ${isNightMode ? 'text-slate-300' : 'text-slate-600'}`}>
        {percent}% complete
      </span>

      {/* Progress bar */}
      <div className={`flex-1 h-1.5 rounded-full overflow-hidden
        ${isNightMode ? 'bg-slate-800' : 'bg-slate-200/80'}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out
            ${isNightMode
              ? 'bg-gradient-to-r from-sky-500 to-blue-500'
              : 'bg-gradient-to-r from-sky-500 to-blue-600'
            }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Completed count */}
      <span className={`text-xs tabular-nums shrink-0 hidden sm:inline
        ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
        {completedCount} of {totalCount} lessons completed
      </span>
    </div>
  );
};
