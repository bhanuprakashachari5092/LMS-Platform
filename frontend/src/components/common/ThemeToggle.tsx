import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  responsive?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { kqAppearance, setKqAppearance } = useTheme();
  const isNight = kqAppearance === 'night';

  const toggleTheme = () => {
    setKqAppearance(isNight ? 'day' : 'night');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-cyan-400 transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs ${className}`}
    >
      {isNight ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
    </button>
  );
};
