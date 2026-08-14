import { Theme } from '@/types/theme';

// Maritime Base Theme
// Clean, contemporary with subtle nautical elements
// Deep navy, ocean teal, clean whites, wave patterns
export const commonTheme: Theme = {
  id: 'common',
  name: 'Maritime',
  description: 'Clean maritime aesthetic with ocean-inspired colors',

  colors: {
    // Teal-focused maritime theme
    primary: 'oklch(0.50 0.14 195)',        // Deep teal
    secondary: 'oklch(0.55 0.12 185)',      // Sea teal
    accent: 'oklch(0.70 0.14 175)',         // Bright cyan-teal
    background: 'oklch(0.14 0.02 200)',     // Dark teal-tinted navy
    surface: 'oklch(0.20 0.03 195)',        // Lighter teal
    surfaceHover: 'oklch(0.25 0.04 190)',   // Surface hover
    text: 'oklch(0.97 0.005 200)',          // White text
    textMuted: 'oklch(0.72 0.02 195)',      // Muted text (bumped for AA on small captions)
    border: 'oklch(0.32 0.05 195)',         // Border color
    success: 'oklch(0.65 0.15 150)',        // Green
    warning: 'oklch(0.70 0.15 80)',         // Orange
    error: 'oklch(0.60 0.18 25)'            // Red
  },

  fonts: {
    display: "'Outfit', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif"
  },

  pattern: {
    type: 'wave',
    colors: [
      'oklch(from var(--color-primary) l c h / 0.1)',
      'oklch(from var(--color-secondary) l c h / 0.08)',
      'oklch(from var(--color-accent) l c h / 0.05)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.14 0.02 245) 0%, oklch(0.18 0.04 230) 50%, oklch(0.22 0.05 210) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.45 0.12 240), oklch(0.65 0.16 195))',
    text: 'linear-gradient(135deg, oklch(0.65 0.14 195), oklch(0.70 0.12 210))'
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  }
};
