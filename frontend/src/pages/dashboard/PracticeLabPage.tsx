import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Code2, ChevronRight, Cpu, Sparkles, Layers } from 'lucide-react';
import { ProfessionalIDE } from '../../components/practice/ProfessionalIDE';
import { PracticeLab } from '../../components/courses/PracticeLab';

export const PracticeLabPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get('problemId') || searchParams.get('challengeId') || undefined;
  const [mode, setMode] = useState<'ide' | 'classic'>('ide');

  return (
    <div className="space-y-6 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Header Banner & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <Link to="/dashboard" className="hover:text-blue-600 font-semibold transition-colors">
              Main Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/dashboard/practice-hub" className="hover:text-blue-600 font-semibold transition-colors">
              Practice Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize font-extrabold text-blue-600">Professional IDE</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
              <Code2 className="w-6 h-6" />
            </span>
            <span>KaizenQ PracticeHub Professional IDE</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium max-w-2xl">
            Browser-based coding workspace powered by Monaco Editor, multi-language Judge0 sandbox execution, automated test grading, and draft synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('ide')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'ide'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Professional IDE</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('classic')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'classic'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Classic Sandbox</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 hover:border-blue-300 font-bold text-xs shadow-3xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Professional IDE or Classic Sandbox */}
      {mode === 'ide' ? (
        <ProfessionalIDE initialProblemId={problemId} onBack={() => navigate('/dashboard')} />
      ) : (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-5 border border-slate-800 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h2 className="font-heading font-extrabold text-lg text-white">Classic Playground</h2>
              </div>
              <p className="text-xs text-slate-400">
                Lightweight interactive playground for quick scripts and course lesson exercises.
              </p>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl h-[calc(100vh-230px)] min-h-180 p-2">
            <PracticeLab standalone={true} courseId="1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeLabPage;
