import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, BookOpen, Briefcase, LayoutDashboard } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl shadow-indigo-950/40">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/50">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest block">
            HTTP 404 — PAGE NOT FOUND
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Lost in Cyberspace?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The page you are looking for doesn't exist or may have moved. Explore one of our quick learning destinations below:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1 text-left">
          <Link
            to="/careers"
            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all group flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Careers</span>
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-300">Internship Openings</span>
          </Link>

          <Link
            to="/courses"
            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all group flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Courses</span>
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-300">Catalog & Roadmaps</span>
          </Link>

          <Link
            to="/dashboard"
            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all group flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-300">Student Workspace</span>
          </Link>

          <Link
            to="/"
            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all group flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-300">KaizenQ Portal</span>
          </Link>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back to Previous Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
