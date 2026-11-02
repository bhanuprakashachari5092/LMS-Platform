import React, { useEffect, useState } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home, BookOpen, Copy, Check } from 'lucide-react';

interface RouteErrorBoundaryProps {
  onReset?: () => void;
  title?: string;
  subtitle?: string;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({
  onReset,
  title,
  subtitle,
}) => {
  const error = useRouteError() as any;
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  let errorMessage = 'An unexpected issue occurred while rendering this page.';
  let errorStatus = 500;
  let errorStack: string | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Automatic recovery for stale dynamic import chunk caching after Vite production updates
  useEffect(() => {
    const isChunkFailure =
      errorMessage.includes('dynamically imported module') ||
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Importing a module script failed');

    if (isChunkFailure) {
      const storageKey = `kaizenq_chunk_reload_${location.pathname}`;
      const lastAttempt = sessionStorage.getItem(storageKey);
      if (!lastAttempt) {
        sessionStorage.setItem(storageKey, 'true');
        console.warn('[RouteErrorBoundary] Detected stale dynamic chunk cache, refreshing page...');
        window.location.reload();
      }
    }
  }, [errorMessage, location.pathname]);

  // Technical debug log
  console.error('[KaizenQ RouteErrorBoundary Caught Error]:', {
    path: location.pathname,
    status: errorStatus,
    message: errorMessage,
    stack: errorStack,
    raw: error,
  });

  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleReturnToCourses = () => {
    navigate('/courses');
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  const handleCopyDetails = () => {
    const details = `Path: ${location.pathname}\nStatus: ${errorStatus}\nMessage: ${errorMessage}\n\nStack:\n${errorStack || 'N/A'}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-900 text-slate-100 font-['Sora']">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-xl text-center space-y-6">
        
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#38BDF8] shadow-lg shadow-sky-500/10">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title || 'Learning Experience Notice'}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {subtitle || "We encountered a temporary hiccup loading this section. Your progress and curriculum are safe."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-500/25 transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Lesson</span>
          </button>

          <button
            onClick={handleReturnToCourses}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs tracking-wide transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Browse Courses</span>
          </button>

          <button
            onClick={handleReturnToDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs tracking-wide transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Technical details toggle for developers & debugging */}
        {errorMessage && (
          <details className="mt-4 text-left p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-400">
            <summary className="cursor-pointer font-mono font-medium text-sky-400 hover:text-sky-300 flex items-center justify-between">
              <span>Technical details</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyDetails();
                }}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-sky-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </summary>
            <pre className="mt-2.5 p-3 rounded-lg bg-black/50 overflow-x-auto text-[11px] font-mono text-rose-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
              {errorMessage}
              {errorStack && `\n\n${errorStack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};
