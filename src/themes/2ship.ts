import { Theme } from '@/types/theme';

// 2ship2Harkinian Theme (Majora's Mask)
// Purple/magenta gradients, moon motifs, clockwork elements
export const twoShipTheme: Theme = {
  id: '2ship',
  name: '2ship2Harkinian',
  description: 'Termina\'s mysterious purple with clockwork gold',

  colors: {
    primary: 'oklch(0.50 0.18 310)',        //Majora purple
    secondary: 'oklch(0.40 0.16 300)',      // Deep purple
    accent: 'oklch(0.70 0.16 75)',          // Clockwork gold
    background: 'oklch(0.13 0.04 315)',     // Dark purple night
    surface: 'oklch(0.22 0.08 310)',        //Purple surface
    surfaceHover: 'oklch(0.28 0.10 310)',   // Lighter purple
    text: 'oklch(0.94 0.01 75)',            // Moonlit white
    textMuted: 'oklch(0.60 0.06 310)',      // Muted purple
    border: 'oklch(0.35 0.10 310)',         // Purple border
    success: 'oklch(0.65 0.12 155)',        //Fairy green
    warning: 'oklch(0.70 0.16 75)',         // Gold
    error: 'oklch(0.55 0.18 25)'            // Red (Majora's eyes)
  },

  fonts: {
    display: "'Cinzel Decorative', 'Cinzel', serif",
    body: "'Crimson Text', Georgia, serif"
  },

  pattern: {
    type: 'circles',
    colors: [
      'oklch(from var(--color-primary) l c h / 0.2)',
      'oklch(from var(--color-secondary) l c h / 0.15)',
      'oklch(from var(--color-accent) l c h / 0.1)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.13 0.04 315) 0%, oklch(0.22 0.08 310) 50%, oklch(0.30 0.10 300) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.50 0.18 310), oklch(0.70 0.16 75))',
    text: 'linear-gradient(135deg, oklch(0.70 0.16 75), oklch(0.65 0.14 75))'
  },

  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    full: '9999px'
  },

  animations: {
    glow: 'glow 3s ease-in-out infinite'
  },

  customCSS: `
    /* Clockwork/moon motif animations */
    @keyframes glow {
      0%, 100% { filter: brightness(1) drop-shadow(0 0 10px oklch(from var(--color-accent) l c h / 0.5)); }
      50% { filter: brightness(1.1) drop-shadow(0 0 20px oklch(from var(--color-accent) l c h / 0.8)); }
    }

    .moon-glow {
      animation: glow 3s ease-in-out infinite;
    }

    /* Clock-style decorative borders */
    .clock-border {
      border-image: repeating-conic-gradient(
        from 0deg,
        var(--color-accent) 0deg 30deg,
        transparent 30deg 60deg
      ) 1;
    }
  `
};
