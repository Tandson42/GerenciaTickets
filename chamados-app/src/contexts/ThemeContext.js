import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { palettes, getStatusColors, getPrioridadeColors } from '../themes/colors';
import { getShadows } from '../themes/spacing';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light'); // 'light' | 'dark'

  const toggleTheme = useCallback(() => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => {
    const colors = palettes[mode];
    const statusColors = getStatusColors(colors);
    const prioridadeColors = getPrioridadeColors(colors);
    const shadows = getShadows(mode);
    const isDark = mode === 'dark';

    return {
      mode,
      isDark,
      colors,
      statusColors,
      prioridadeColors,
      shadows,
      toggleTheme,
    };
  }, [mode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
