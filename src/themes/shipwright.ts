import { Theme } from '@/types/theme';

// Shipwright Theme (Ocarina of Time)
// Forest greens, gold accents, Triforce-inspired geometry
export const shipwrightTheme: Theme = {
  id: 'shipwright',
  name: 'Shipwright',
  description: 'Kokiri Forest greens with Hyrulean gold',

  colors: {
    primary: 'oklch(0.45 0.14 155)',        //Forest green
    secondary: 'oklch(0.35 0.12 145)',      // Deep forest
    accent: 'oklch(0.75 0.14 85)',          // Golden Triforce
    background: 'oklch(0.15 0.02 150)',     // Dark forest
    surface: 'oklch(0.22 0.04 155)',        //Kokiri tunic green
    surfaceHover: 'oklch(0.28 0.05 155)',   // Lighter green
    text: 'oklch(0.95 0.01 85)',            // Warm white
    textMuted: 'oklch(0.60 0.04 155)',      // Muted green
    border: 'oklch(0.35 0.08 155)',         // Green border
    success: 'oklch(0.65 0.14 155)',        //Light green
    warning: 'oklch(0.75 0.14 85)',         // Gold
    error: 'oklch(0.55 0.18 25)'            // Red (like hearts)
  },

  fonts: {
    display: "'Cinzel', 'Times New Roman', serif",
    body: "'Crimson Text', Georgia, serif"
  },

  pattern: {
    type: 'triangles',
    colors: [
      'oklch(from var(--color-primary) l c h / 0.15)',
      'oklch(from var(--color-accent) l c h / 0.08)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.15 0.02 150) 0%, oklch(0.22 0.04 155) 50%, oklch(0.28 0.05 145) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.45 0.14 155), oklch(0.75 0.14 85))',
    text: 'linear-gradient(135deg, oklch(0.75 0.14 85), oklch(0.65 0.12 145))'
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px'
  },

  customCSS: `
    /* Triforce-inspired decorative elements */
    .triforce-accent::before {
      content: '';
      background: linear-gradient(135deg, var(--color-accent) 25%, transparent 25%),
                  linear-gradient(225deg, var(--color-accent) 25%, transparent 25%),
                  linear-gradient(45deg, var(--color-accent) 25%, transparent 25%),
                  linear-gradient(315deg, var(--color-accent) 25%, transparent 25%);
      background-position: 0 0, 10px 0, 10px -10px, 0 10px;
      background-size: 20px 20px;
      background-repeat: repeat;
    }
  `
};
