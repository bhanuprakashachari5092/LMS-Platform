import React from 'react';
import { useDeveloperGate } from '@/contexts/DeveloperGateContext';
import { LaunchingSoonPage } from '@/pages/prelaunch/LaunchingSoonPage';

interface DeveloperGateProps {
  children: React.ReactNode;
}

export const DeveloperGate: React.FC<DeveloperGateProps> = ({ children }) => {
  const { isPrelaunchMode, isDeveloper, isLoading } = useDeveloperGate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
          <span className="font-heading font-black text-sm">KQ</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Verifying security context...</span>
        </div>
      </div>
    );
  }

  // If prelaunch mode is enabled and user has not authenticated as developer, block LMS and show Launching Soon page
  if (isPrelaunchMode && !isDeveloper) {
    return <LaunchingSoonPage />;
  }

  // Otherwise, unlock the full LMS application
  return <>{children}</>;
};

export default DeveloperGate;
