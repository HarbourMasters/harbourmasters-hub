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

/**
 * Per-theme web fonts are lazy-loaded from Google Fonts only when a non-default
 * theme is activated, so the default (Maritime) route ships just the self-hosted
 * Outfit + Inter and never touches fonts.googleapis.com. The default theme's
 * font names are filtered out here so we don't double-fetch them.
 */
const SELF_HOSTED = new Set(['outfit', 'inter']);
const GENERIC = new Set([
  'system-ui', 'sans-serif', 'serif', 'monospace', 'cursive',
  'georgia', 'times new roman', 'arial black', 'comic sans ms',
]);
// Google renamed some families; normalize so the request resolves.
const FAMILY_ALIAS: Record<string, string> = { 'fredoka one': 'Fredoka' };

function googleFontFamilies(theme: Theme): string[] {
  const names = [theme.fonts.display, theme.fonts.body]
    .flatMap((s) => (s.match(/'([^']+)'/g) || []).map((m) => m.slice(1, -1)))
    .map((n) => FAMILY_ALIAS[n.toLowerCase()] ?? n);
  return [...new Set(names)].filter((n) => {
    const lower = n.toLowerCase();
    return !GENERIC.has(lower) && !SELF_HOSTED.has(lower);
  });
}

function ensureThemeFonts(theme: Theme) {
  const families = googleFontFamilies(theme);
  let link = document.getElementById('theme-fonts') as HTMLLinkElement | null;
  if (families.length === 0) {
    // Default theme — remove any theme-font link so we rely on self-hosted fonts only.
    if (link) link.remove();
    return;
  }
  const href =
    'https://fonts.googleapis.com/css2?' +
    families.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join('&') +
    '&display=swap';

  if (!link) {
    // Preconnect once, lazily, only when a themed font is actually needed.
    for (const origin of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
      if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
        const pc = document.createElement('link');
        pc.rel = 'preconnect';
        pc.href = origin;
        if (origin.includes('gstatic')) pc.crossOrigin = '';
        document.head.appendChild(pc);
      }
    }
    link = document.createElement('link');
    link.id = 'theme-fonts';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.dataset.href !== href) {
    link.dataset.href = href;
    link.href = href;
  }
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
    ensureThemeFonts(theme);

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
