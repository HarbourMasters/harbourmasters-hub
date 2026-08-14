export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textMuted: string;
  border: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface ThemeFonts {
  display: string;
  body: string;
}

export interface ThemeAnimations {
  fadeIn?: string;
  slideUp?: string;
  pulse?: string;
  glow?: string;
  [key: string]: string | undefined;
}

export interface ThemePattern {
  type: 'wave' | 'stars' | 'grid' | 'circuit' | 'triangles' | 'checkerboard' | 'circles' | 'none';
  colors: string[];
}

export interface Theme {
  id: string;
  name: string;
  description: string;

  // Colors
  colors: ThemeColors;

  // Fonts
  fonts: ThemeFonts;

  // Custom animations
  animations?: ThemeAnimations;

  // Background pattern
  pattern?: ThemePattern;

  // Gradient definitions
  gradients?: {
    hero?: string;
    accent?: string;
    text?: string;
  };

  // Border radius
  borderRadius?: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };

  // Custom CSS for theme-specific overrides
  customCSS?: string;
}

export type ThemeId =
  | 'common'
  | 'shipwright'
  | '2ship'
  | 'ghostship'
  | 'spaghetti'
  | 'starship'
  | 'lighthouse'
  | 'lus';
