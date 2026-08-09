'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentColor, SidebarStyle, ThemeContextType, ThemeMode } from '@/lib/types';
import { ACCENT_COLORS } from '@/lib/themeConfig';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(ACCENT_COLORS[0]);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [sidebarStyle, setSidebarStyleState] = useState<SidebarStyle>('standard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme settings from localStorage on mount (Default strictly to white/light)
  useEffect(() => {
    setMounted(true);
    const savedColorId = localStorage.getItem('app_accent_color');
    if (savedColorId) {
      const color = ACCENT_COLORS.find((c) => c.id === savedColorId);
      if (color) setAccentColorState(color);
    }

    // Force default white theme
    const savedMode = localStorage.getItem('app_theme_mode') as ThemeMode;
    if (savedMode && savedMode === 'light') {
      setThemeModeState('light');
    } else {
      setThemeModeState('light');
      localStorage.setItem('app_theme_mode', 'light');
    }

    const savedSidebar = localStorage.getItem('app_sidebar_style') as SidebarStyle;
    if (savedSidebar) {
      setSidebarStyleState(savedSidebar);
    }
  }, []);

  // Apply CSS Custom Variables when accentColor or themeMode changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply primary variables
    root.style.setProperty('--primary', accentColor.primary);
    root.style.setProperty('--primary-hover', accentColor.hover);
    root.style.setProperty('--primary-light', accentColor.light);
    root.style.setProperty('--primary-dark', accentColor.dark);
    root.style.setProperty('--primary-border', accentColor.border);
    root.style.setProperty('--primary-ring', accentColor.ring);

    // Dark mode toggle class (Enforce light mode unless explicitly changed)
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save settings
    localStorage.setItem('app_accent_color', accentColor.id);
    localStorage.setItem('app_theme_mode', themeMode);
    localStorage.setItem('app_sidebar_style', sidebarStyle);
  }, [accentColor, themeMode, sidebarStyle, mounted]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setSidebarStyle = (style: SidebarStyle) => {
    setSidebarStyleState(style);
  };

  return (
    <ThemeContext.Provider
      value={{
        accentColor,
        setAccentColor,
        themeMode,
        setThemeMode,
        sidebarStyle,
        setSidebarStyle,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileOpen,
        setIsMobileOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
