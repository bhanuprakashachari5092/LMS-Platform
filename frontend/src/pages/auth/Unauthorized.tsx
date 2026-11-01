import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Briefcase, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const Unauthorized: React.FC = () => {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [switched, setSwitched] = useState(false);

  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      import.meta.env.DEV);

  const handleReturnDashboard = () => {
    if (userProfile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard?tab=internships');
    }
  };

  const handleDevSwitchToAdmin = () => {
    try {
      localStorage.setItem('dev_role', 'admin');
      setSwitched(true);
      toast.success('Developer Mode: Switched to Admin role!');
      setTimeout(() => {
        window.location.href = '/admin/internships';
      }, 350);
    } catch {
      window.location.href = '/admin/internships';
    }
  };

  const activeEmail = user?.email || userProfile?.email || 'learner@kaizenq.com';
  const activeRole = userProfile?.role || 'student';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl shadow-rose-950/40">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
          <ShieldAlert className="w-10 h-10 text-rose-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold font-mono text-rose-400 uppercase tracking-widest block">
            HTTP 403 — ACCESS DENIED
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Administrative Access Only
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You are logged in as <span className="font-mono text-cyan-300">{activeEmail}</span> with role (<span className="font-mono text-emerald-400 font-semibold">{activeRole}</span>). This page is restricted to administrators and recruiters.
          </p>
        </div>

        <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-left space-y-1.5 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Where should you go?</div>
          <div className="text-slate-300">
            • <strong className="text-white">Students / Applicants:</strong> View public openings at <Link to="/careers" className="text-emerald-400 underline underline-offset-2">/careers</Link> or track submitted applications at <Link to="/dashboard?tab=internships" className="text-emerald-400 underline underline-offset-2">Student Dashboard</Link>.
          </div>
          <div className="text-slate-300">
            • <strong className="text-white">Recruiters / Admins:</strong> Sign in with an admin email account (e.g., <code className="text-indigo-300 font-mono">admin@gmail.com</code>).
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={handleReturnDashboard}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Student Workspace (/dashboard)</span>
          </button>

          <Link
            to="/careers"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Browse Careers & Internship Portal (/careers)</span>
          </Link>

          {isLocalDev && (
            <button
              onClick={handleDevSwitchToAdmin}
              disabled={switched}
              className="w-full py-2.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {switched ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Switching to Admin...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span>Dev Mode: Preview Admin Internships Portal</span>
                </>
              )}
            </button>
          )}

          <Link
            to="/"
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
