import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/axios';
import { toast } from 'sonner';

interface DeveloperGateContextType {
  isPrelaunchMode: boolean;
  isDeveloper: boolean;
  isLoading: boolean;
  verifyPasscode: (passcode: string) => Promise<{ success: boolean; message?: string; rateLimited?: boolean }>;
  logoutDeveloper: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const DeveloperGateContext = createContext<DeveloperGateContextType | undefined>(undefined);

export const DeveloperGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrelaunchMode, setIsPrelaunchMode] = useState<boolean>(true);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkStatus = useCallback(async () => {
    try {
      const res = await apiClient.get('/developer-access/status');
      if (res.data && res.data.success) {
        setIsPrelaunchMode(Boolean(res.data.prelaunchMode));
        setIsDeveloper(Boolean(res.data.isDeveloper));
      }
    } catch {
      // Fallback: If backend is down or offline, default to safe prelaunch protection
      setIsPrelaunchMode(true);
      setIsDeveloper(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const verifyPasscode = async (
    passcode: string
  ): Promise<{ success: boolean; message?: string; rateLimited?: boolean }> => {
    try {
      const res = await apiClient.post('/developer-access/verify', { passcode });
      if (res.data && res.data.success) {
        setIsDeveloper(true);
        toast.success('Developer access authorized!');
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Invalid developer credentials.' };
    } catch (err: any) {
      const responseData = err?.response?.data || {};
      const message = responseData.message || err.message || 'Passcode verification failed.';
      const isRateLimited = responseData.rateLimited || err?.response?.status === 429;

      if (isRateLimited) {
        toast.error('Too many attempts. Rate limit active.');
      } else {
        toast.error(message);
      }

      return {
        success: false,
        message,
        rateLimited: isRateLimited,
      };
    }
  };

  const logoutDeveloper = async () => {
    try {
      await apiClient.post('/developer-access/logout');
    } catch {
      // Ignore network error on logout
    } finally {
      setIsDeveloper(false);
      toast.info('Developer session ended.');
      window.location.href = '/';
    }
  };

  return (
    <DeveloperGateContext.Provider
      value={{
        isPrelaunchMode,
        isDeveloper,
        isLoading,
        verifyPasscode,
        logoutDeveloper,
        refreshStatus: checkStatus,
      }}
    >
      {children}
      {/* Floating Developer Preview HUD */}
      {isPrelaunchMode && isDeveloper && (
        <div className="fixed bottom-4 right-4 z-9999 flex items-center gap-3 bg-slate-900/95 text-white px-3.5 py-2 rounded-2xl border border-cyan-500/40 shadow-2xl backdrop-blur-md text-xs font-mono select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-bold text-cyan-400">DEV MODE ACTIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <button
            onClick={logoutDeveloper}
            className="text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Lock Out
          </button>
        </div>
      )}
    </DeveloperGateContext.Provider>
  );
};

export const useDeveloperGate = () => {
  const context = useContext(DeveloperGateContext);
  if (!context) {
    throw new Error('useDeveloperGate must be used within a DeveloperGateProvider');
  }
  return context;
};
