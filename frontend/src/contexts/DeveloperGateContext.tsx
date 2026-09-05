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

// ── Persistence helpers (localStorage survives tab close + refresh; sessionStorage as backup) ──
const DEV_SESSION_KEY = 'kz_dev_session_active';
const DEV_TOKEN_KEY   = 'kz_dev_token';

const getStoredDevToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEV_TOKEN_KEY) || sessionStorage.getItem(DEV_TOKEN_KEY);
};

const getStoredDevSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(DEV_SESSION_KEY) === 'true' ||
    sessionStorage.getItem(DEV_SESSION_KEY) === 'true'
  );
};

const saveDevSession = (token?: string) => {
  localStorage.setItem(DEV_SESSION_KEY, 'true');
  sessionStorage.setItem(DEV_SESSION_KEY, 'true');
  if (token) {
    localStorage.setItem(DEV_TOKEN_KEY, token);
    sessionStorage.setItem(DEV_TOKEN_KEY, token);
  }
};

const clearDevSession = () => {
  localStorage.removeItem(DEV_SESSION_KEY);
  sessionStorage.removeItem(DEV_SESSION_KEY);
  localStorage.removeItem(DEV_TOKEN_KEY);
  sessionStorage.removeItem(DEV_TOKEN_KEY);
};

export const DeveloperGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrelaunchMode, setIsPrelaunchMode] = useState<boolean>(false);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(() => getStoredDevSession());
  // IMPORTANT: Start as NOT loading so authenticated students are never blocked
  // by a slow backend API call. The status check runs in the background and
  // only updates state if prelaunch mode is actually active.
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    try {
      const storedToken = getStoredDevToken();
      const res = await apiClient.get('/developer-access/status', {
        headers: storedToken ? { 'x-developer-token': storedToken } : {},
        // Short timeout so a cold-start backend never blocks the UI
        timeout: 5000,
      } as any);
      if (res.data && res.data.success) {
        setIsPrelaunchMode(Boolean(res.data.prelaunchMode));
        if (res.data.isDeveloper) {
          setIsDeveloper(true);
          saveDevSession();
        }
      }
    } catch {
      // If backend is waking up or offline, do not block students from the platform
      setIsPrelaunchMode(false);
      const localActive = getStoredDevSession();
      if (localActive) {
        setIsDeveloper(true);
      }
    }
    // isLoading stays false — we never block the UI for this background check
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const verifyPasscode = async (
    passcode: string
  ): Promise<{ success: boolean; message?: string; rateLimited?: boolean }> => {
    const cleanPasscode = (passcode || '').trim();

    // Instant local verification for standard developer passcode (googlemanoj)
    if (cleanPasscode === 'googlemanoj') {
      setIsDeveloper(true);
      saveDevSession();
      apiClient.post('/developer-access/verify', { passcode: cleanPasscode })
        .then((res) => {
          if (res?.data?.token) {
            saveDevSession(res.data.token);
          }
        })
        .catch(() => null);
      toast.success('Developer access authorized!');
      return { success: true, message: 'Developer environment authorized.' };
    }

    try {
      const res = await apiClient.post('/developer-access/verify', { passcode: cleanPasscode });
      if (res.data && res.data.success) {
        setIsDeveloper(true);
        saveDevSession(res.data.token);
        toast.success('Developer access authorized!');
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Invalid developer credentials.' };
    } catch (err: any) {
      console.warn('[DEVELOPER ACCESS] Network / API verification fallback:', err?.message || err);

      const responseData = err?.response?.data || {};
      const message = responseData.message || 'Invalid developer credentials. Please try again.';
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
      clearDevSession();
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
      {isDeveloper && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-slate-900/95 text-white px-3.5 py-2 rounded-2xl border border-cyan-500/40 shadow-2xl backdrop-blur-md text-xs font-mono select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
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



