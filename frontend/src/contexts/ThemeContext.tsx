import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type KqThemeMode = 'coding' | 'field-guide';
export type KqAppearance = 'day' | 'night';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  kqTheme: KqThemeMode;
  setKqTheme: (theme: KqThemeMode) => void;
  kqAppearance: KqAppearance;
  setKqAppearance: (appearance: KqAppearance) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const KQ_APPEARANCE_KEY = 'kq_appearance';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kqAppearance, setKqAppearanceState] = useState<KqAppearance>(() => {
    const saved = localStorage.getItem(KQ_APPEARANCE_KEY);
    if (saved === 'day' || saved === 'night') {
      return saved as KqAppearance;
    }
    return 'night'; // Default to clean dark mode
  });

  const [kqTheme, setKqThemeState] = useState<KqThemeMode>('field-guide');

  const theme: ThemeMode = kqAppearance === 'night' ? 'dark' : 'light';
  const resolvedTheme: 'light' | 'dark' = kqAppearance === 'night' ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;

    if (kqAppearance === 'night') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    root.removeAttribute('data-kq-theme');
  }, [kqAppearance]);

  const setKqTheme = (newTheme: KqThemeMode) => {
    setKqThemeState(newTheme);
  };

  const setKqAppearance = (newAppearance: KqAppearance) => {
    setKqAppearanceState(newAppearance);
    localStorage.setItem(KQ_APPEARANCE_KEY, newAppearance);
  };

  const setTheme = (newTheme: ThemeMode) => {
    if (newTheme === 'dark') {
      setKqAppearance('night');
    } else if (newTheme === 'light') {
      setKqAppearance('day');
    }
  };

  const toggleTheme = () => {
    setKqAppearance(kqAppearance === 'night' ? 'day' : 'night');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        kqTheme,
        setKqTheme,
        kqAppearance,
        setKqAppearance,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
