import React from 'react';
import { Menu, ArrowLeft, User } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface LearningTopBarProps {
  courseTitle: string;
  lessonTitle: string;
  onToggleSidebar: () => void;
  onBackToCourseDetails: () => void;
  userAvatar?: string;
  userName?: string;
  isNightMode?: boolean;
}

/**
 * LearningTopBar — clean, minimal top navigation bar.
 * Hamburger | ← Overview | Course Name + Lesson Title | Theme Toggle | Avatar
 */
export const LearningTopBar: React.FC<LearningTopBarProps> = ({
  courseTitle,
  lessonTitle,
  onToggleSidebar,
  onBackToCourseDetails,
  userAvatar,
  userName = 'Student',
  isNightMode = false,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 w-full h-14 px-3 sm:px-5 backdrop-blur-xl border-b
        flex items-center justify-between transition-colors duration-200 shrink-0
        ${isNightMode
          ? 'bg-slate-950/95 border-slate-800/80 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
    >
      {/* Left: Hamburger + Overview back link */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors cursor-pointer active:scale-95
            ${isNightMode
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onBackToCourseDetails}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
            transition-all cursor-pointer active:scale-95 shadow-xs border
            ${isNightMode
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-sky-400 hover:text-white'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 hover:text-sky-900'
            }`}
          title="Back to Course Overview"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="font-semibold">Back to Overview</span>
        </button>
      </div>

      {/* Center: Course name + lesson title */}
      <div className="hidden md:flex flex-col items-center justify-center min-w-0 flex-1 px-4">
        <span className={`text-[11px] font-medium truncate max-w-md
          ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {courseTitle}
        </span>
        <h1 className={`text-sm font-semibold truncate max-w-lg leading-tight
          ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
          {lessonTitle}
        </h1>
      </div>

      {/* Right: Theme toggle + avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <ThemeToggle />

        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className={`w-8 h-8 rounded-full border-2 object-cover
              ${isNightMode ? 'border-slate-700' : 'border-slate-200'}`}
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full border flex items-center justify-center
              ${isNightMode
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
          >
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </header>
  );
};
