import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeId } from '@/types/theme';
import { getTheme, getGameTheme } from '@/themes';

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  setGameTheme: (gameId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeId;
}

export function ThemeProvider({ children, defaultTheme = 'common' }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [theme, setThemeState] = useState<Theme>(getTheme(defaultTheme));

  useEffect(() => {
    // Apply theme CSS variables
    const root = document.documentElement;

    // Colors
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-surface-hover', theme.colors.surfaceHover);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-border', theme.colors.border);

    if (theme.colors.success) {
      root.style.setProperty('--color-success', theme.colors.success);
    }
    if (theme.colors.warning) {
      root.style.setProperty('--color-warning', theme.colors.warning);
    }
    if (theme.colors.error) {
      root.style.setProperty('--color-error', theme.colors.error);
    }

    // Fonts
    root.style.setProperty('--font-display', theme.fonts.display);
    root.style.setProperty('--font-body', theme.fonts.body);

    // Border radius
    if (theme.borderRadius) {
      root.style.setProperty('--border-radius-sm', theme.borderRadius.sm);
      root.style.setProperty('--border-radius-md', theme.borderRadius.md);
      root.style.setProperty('--border-radius-lg', theme.borderRadius.lg);
      root.style.setProperty('--border-radius-full', theme.borderRadius.full);
    }

    // Add custom CSS
    if (theme.customCSS) {
      let styleEl = document.getElementById('theme-custom-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'theme-custom-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = theme.customCSS;
    }

    // Apply theme-specific class
    document.body.dataset.theme = theme.id;

  }, [theme]);

  const updateTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    setThemeState(getTheme(newThemeId));
  };

  const setGameTheme = (gameId: string) => {
    const newThemeId = getGameTheme(gameId);
    updateTheme(newThemeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme: updateTheme, setGameTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
