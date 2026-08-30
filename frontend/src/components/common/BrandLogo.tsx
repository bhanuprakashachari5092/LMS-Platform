import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical' | 'icon';
  theme?: 'light' | 'dark' | 'glass';
  showSubtitle?: boolean;
  className?: string;
  responsive?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showSubtitle = true,
  className = '',
  responsive = false,
}) => {
  // Size mapping for symbol container and text font sizes
  const symbolSizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const titleSizeMap = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const taglineSizeMap = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9.5px] sm:text-[11px] tracking-[0.24em]',
    lg: 'text-[11px] sm:text-[13px] tracking-[0.28em]',
    xl: 'text-[13px] sm:text-[15px] tracking-[0.3em]',
  };

  const symbolClass = responsive
    ? 'w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-11 xl:h-11'
    : (symbolSizeMap[size] || 'w-9 h-9 sm:w-10 sm:h-10');
  const titleClass = responsive
    ? 'text-lg sm:text-xl lg:text-lg xl:text-2xl'
    : (titleSizeMap[size] || 'text-lg sm:text-xl');
  const taglineClass = responsive
    ? 'text-[8px] sm:text-[9.5px] lg:text-[8px] xl:text-[11px] tracking-[0.2em] sm:tracking-[0.24em]'
    : (taglineSizeMap[size] || 'text-[8.5px] sm:text-[9.5px] tracking-[0.22em]');

  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${responsive ? 'lg:gap-1.5 xl:gap-3' : ''} group select-none ${className}`}>
      {/* 1. OFFICIAL TECH EMBLEM SYMBOL (LEFT) */}
      <div className={`relative flex items-center justify-center shrink-0 ${symbolClass}`}>
        {/* Emblem */}
        <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-1 flex items-center justify-center overflow-hidden shadow-2xs">
          <img
            src="/brand/kaizenq-logo.webp"
            alt="KaizenQ Logo"
            width="44"
            height="44"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 2. TEXT-BASED WORDMARK & TAGLINE */}
      {layout !== 'icon' && (
        <div className="flex flex-col justify-center">
          {/* Main Title: Kaizen Q */}
          <div className={`font-black ${titleClass} tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1`}>
            <span>Kaizen</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-400">
              Q
            </span>
          </div>

          {/* Tagline: LEARN • BUILD • EVOLVE */}
          {showSubtitle && (
            <div className={`flex items-center gap-1.5 ${responsive ? 'lg:gap-1 xl:gap-1.5' : ''} ${taglineClass} font-extrabold uppercase mt-1 text-slate-700 dark:text-zinc-200`}>
              <span className={`h-[2px] w-3 ${responsive ? 'lg:w-2 xl:w-4' : 'sm:w-4'} bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shrink-0`} />
              <span>LEARN</span>
              <span className="text-cyan-500 font-black">•</span>
              <span>BUILD</span>
              <span className="text-blue-500 font-black">•</span>
              <span>EVOLVE</span>
              <span className={`h-[2px] w-3 ${responsive ? 'lg:w-2 xl:w-4' : 'sm:w-4'} bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shrink-0`} />
            </div>
          )}
        </div>
      )}
    </Link>
  );
};
