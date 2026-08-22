import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useDeveloperGate } from '@/contexts/DeveloperGateContext';
import { BrandLogo } from '@/components/common/BrandLogo';

export const DeveloperAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyPasscode, isDeveloper } = useDeveloperGate();

  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already authenticated as developer, offer direct jump to dashboard
  if (isDeveloper && !isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-heading font-black text-white">Developer Session Active</h2>
            <p className="text-xs text-slate-400">
              You already have an authorized developer session active in this browser.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-heading font-black text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Proceed to LMS Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passcode.trim()) {
      setErrorMessage('Please enter the developer access passcode.');
      return;
    }

    setIsLoading(true);
    const result = await verifyPasscode(passcode);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 750);
    } else {
      if (result.rateLimited) {
        setIsRateLimited(true);
        setErrorMessage('Too many failed attempts. Temporary 15-minute rate limit active.');
      } else {
        setErrorMessage('Invalid developer access credentials. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <BrandLogo />
        <button
          onClick={() => navigate('/')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Launch Page</span>
        </button>
      </header>

      {/* Main Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl"
        >
          {/* Card Header Icon & Titles */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase mb-2">
                <Lock className="w-3 h-3" />
                <span>Authorized Developers Only</span>
              </div>
              <h1 className="text-2xl font-heading font-black text-white tracking-tight">
                Developer Access
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your secure system passcode to access the live development LMS.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                isRateLimited
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
              }`}
            >
              {isRateLimited ? (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Passcode verified! Loading development environment...</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-slate-300">
                Developer Passcode:
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isLoading || isSuccess}
                  placeholder="Enter system passcode..."
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess || !passcode.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-heading font-black text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:scale-101 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorized</span>
                </>
              ) : (
                <>
                  <span>Enter Development Environment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Protected by server-side cryptographic verification & rate-limiting.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 py-6 text-center text-xs text-slate-600 font-mono">
        KaizenQ Pre-Launch Gate • Session TTL: 8 Hours
      </footer>
    </div>
  );
};

export default DeveloperAccessPage;
