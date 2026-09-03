import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Send,
  Terminal,
  Layers,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  Bell,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/common/BrandLogo';

export const LaunchingSoonPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast.success('Thank you! We will notify you the moment KaizenQ goes live.');
    }, 600);
  };

  const milestones = [
    { name: 'Core AI Curriculum & Learning Roadmaps', status: 'Ready', progress: 100, icon: Layers },
    { name: 'Interactive CLI & Code Sandbox Engine', status: 'Ready', progress: 100, icon: Terminal },
    { name: 'Multimodal AI Tutor & Real-time Live Labs', status: 'Final Polish', progress: 95, icon: Cpu },
    { name: 'Verifiable Blockchain Credentials System', status: 'Ready', progress: 100, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.85)_100%)]" />
        <div 
          className="absolute inset-0 opacity-[0.03] bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Top Navbar Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-slate-900/60 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <BrandLogo />
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            KAIZENQ PRE-LAUNCH
          </span>

          <button
            onClick={() => navigate('/auth/login')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>Sign In</span>
          </button>

          <button
            onClick={() => navigate('/developer-access')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 text-xs font-mono font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Developer Access</span>
          </button>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-10 my-auto">
        {/* Launching Soon Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-mono font-bold shadow-lg shadow-cyan-950/50"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>AI-Powered Learning Management System</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400">Launching Soon</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[1.1] text-white">
            Transforming How The World Masters{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              AI & Engineering.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-sans font-normal leading-relaxed">
            &ldquo;Something powerful is being built for the next generation of learners.&rdquo;
          </p>
        </motion.div>

        {/* Launch Readiness Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-heading font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Pre-Launch System Readiness</span>
              </h2>
              <p className="text-xs text-slate-400">Platform deployment and security audits in final validation.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-cyan-500/30">
              <span className="text-xs font-mono text-slate-400">Readiness:</span>
              <span className="text-sm font-mono font-black text-cyan-400">98.5%</span>
            </div>
          </div>

          {/* Milestone Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
            {milestones.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-cyan-950/50 text-cyan-400 border border-cyan-800/40 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-200 truncate">{m.name}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        {m.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-linear-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stay Tuned Notification Form */}
          <div className="pt-2 border-t border-slate-800/80">
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You are on the VIP priority early-access notification list!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full flex-1">
                  <Bell className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for launch day priority access..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-heading font-black text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Get Early Access</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 KaizenQ AI LMS. All rights reserved.</p>

        <div className="flex items-center gap-4 font-mono">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Sign In</span>
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => navigate('/developer-access')}
            className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Authorized Developer Portal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LaunchingSoonPage;
