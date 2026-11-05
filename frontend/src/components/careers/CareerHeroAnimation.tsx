import React, { Suspense, useState, useEffect } from 'react';
import { LottieLight } from 'lottie-react';
import { Sparkles, ShieldCheck, Terminal, Award, Briefcase, Zap } from 'lucide-react';
import careerHeroAnimation from '@/assets/animations/career-hero-animation.json';

interface CareerHeroAnimationProps {
  className?: string;
}

export const CareerHeroAnimation: React.FC<CareerHeroAnimationProps> = ({ className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Mark as loaded when component mounts
    setIsLoaded(true);
  }, []);

  return (
    <div className={`relative w-full max-w-[520px] mx-auto select-none ${className}`}>
      {/* Decorative ambient background glows */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 via-cyan-400/15 to-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-70 dark:opacity-50 pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Glassmorphic Showcase Card */}
      <div className="relative rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-blue-500/10 overflow-hidden p-4 sm:p-6">
        
        {/* Top-Right Floating Status Pill */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-850/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold tracking-tight text-slate-700 dark:text-slate-200 uppercase">
            2026 Cohort Open
          </span>
        </div>

        {/* Top-Left Tech Track Pill */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/80 border border-blue-200/70 dark:border-blue-800/70 text-blue-600 dark:text-blue-400 text-[11px] font-bold shadow-xs">
          <Zap className="w-3 h-3 text-blue-500" />
          <span>Real-World Sprints</span>
        </div>

        {/* Lottie Animation Display Container */}
        <div className="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center my-2">
          {careerHeroAnimation ? (
            <LottieLight
              animationData={careerHeroAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full object-contain filter drop-shadow-md"
              style={{ background: 'transparent' }}
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-slate-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Bottom Floating Info Badges */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Badge 1: Production Practice */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/90 dark:bg-slate-850/70 border border-slate-200/60 dark:border-slate-800/60 transition-transform hover:scale-[1.02]">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                Live Repositories
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
                Real code reviews
              </div>
            </div>
          </div>

          {/* Badge 2: Verified Credential */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/90 dark:bg-slate-850/70 border border-slate-200/60 dark:border-slate-800/60 transition-transform hover:scale-[1.02]">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                Verified Certificate
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
                SHA-256 verifiable
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Accent Sub-Badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-xl border border-slate-700/50 dark:border-slate-200/50 text-[11px] font-extrabold tracking-wide whitespace-nowrap">
        <Award className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
        <span>Shaivika Groups &bull; Industry Recognized</span>
      </div>
    </div>
  );
};
