import { Theme } from '@/types/theme';

// Lighthouse Theme (Banjo-Kazooie)
// Banjo blue + Kazooie red with the logo's gold outline.
// Warm, playful, collectathon energy.
export const lighthouseTheme: Theme = {
  id: 'lighthouse',
  name: 'Lighthouse',
  description: 'Banjo blue and Kazooie red tied together with a gold outline',

  colors: {
    primary: 'oklch(0.62 0.16 250)',         // Banjo blue
    secondary: 'oklch(0.58 0.20 25)',        // Kazooie red
    accent: 'oklch(0.80 0.14 85)',           // Logo gold outline
    background: 'oklch(0.14 0.02 60)',       // Warm-neutral dark
    surface: 'oklch(0.23 0.04 250)',         // Blue-tinted surface
    surfaceHover: 'oklch(0.30 0.05 250)',    // Lighter blue surface
    text: 'oklch(0.97 0.01 85)',             // Warm white
    textMuted: 'oklch(0.66 0.05 80)',        // Muted gold
    border: 'oklch(0.42 0.09 80)',           // Gold-tinted border
    success: 'oklch(0.70 0.15 145)',         // Spiral Mountain green
    warning: 'oklch(0.80 0.14 85)',          // Honey/coin gold
    error: 'oklch(0.58 0.20 25)'             // Kazooie red
  },

  fonts: {
    display: "'Baloo 2', 'Fredoka', sans-serif",
    body: "'Nunito', system-ui, sans-serif"
  },

  pattern: {
    type: 'circles',
    colors: [
      'oklch(from var(--color-accent) l c h / 0.2)',    // Gold notes
      'oklch(from var(--color-primary) l c h / 0.15)'   // Blue notes
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.14 0.02 60) 0%, oklch(0.23 0.04 250) 35%, oklch(0.30 0.05 250) 65%, oklch(0.26 0.08 25) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.62 0.16 250), oklch(0.80 0.14 85))',
    text: 'linear-gradient(135deg, oklch(0.80 0.14 85), oklch(0.58 0.20 25))'
  },

  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    full: '9999px'
  },

  animations: {
    pulse: 'jiggy-float 2.5s ease-in-out infinite',
    glow: 'gold-outline 2s ease-in-out infinite'
  },

  customCSS: `
    /* Jiggy float */
    @keyframes jiggy-float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(3deg); }
    }

    /* Gold outline glow */
    @keyframes gold-outline {
      0%, 100% { filter: drop-shadow(0 0 6px oklch(from var(--color-accent) l c h / 0.6)); }
      50% { filter: drop-shadow(0 0 14px oklch(from var(--color-accent) l c h / 0.9)); }
    }

    .jiggy-bounce {
      animation: jiggy-float 2.5s ease-in-out infinite;
    }
  `
};
