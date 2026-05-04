import { Theme } from '@/types/theme';

// Starship Theme (Star Fox 64)
// Space blues, Arwing red/orange, starfield backgrounds
export const starshipTheme: Theme = {
  id: 'starship',
  name: 'Starship',
  description: 'Deep space blues with Arwing accent colors',

  colors: {
    primary: 'oklch(0.60 0.14 250)',        //Star Fox blue
    secondary: 'oklch(0.35 0.10 260)',      // Deep space
    accent: 'oklch(0.65 0.18 35)',          // Arwing red/orange
    background: 'oklch(0.12 0.04 265)',     // Space dark
    surface: 'oklch(0.20 0.08 255)',        //Space surface
    surfaceHover: 'oklch(0.28 0.10 250)',   // Lighter space
    text: 'oklch(0.96 0.01 240)',           // Cool white
    textMuted: 'oklch(0.60 0.06 255)',      // Muted space blue
    border: 'oklch(0.32 0.10 255)',         // Space border
    success: 'oklch(0.70 0.14 150)',        //Team green (Slippy)
    warning: 'oklch(0.70 0.16 75)',         // Team gold (Fox)
    error: 'oklch(0.60 0.20 25)'            // Team red
  },

  fonts: {
    display: "'Orbitron', 'Arial Black', sans-serif",
    body: "'Exo 2', system-ui, sans-serif"
  },

  pattern: {
    type: 'stars',
    colors: [
      'oklch(0.98 0 0)',                    // White stars
      'oklch(0.90 0.02 240)',               // Blue stars
      'oklch(from var(--color-accent) l c h / 0.8)'  // Orange stars
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.12 0.04 265) 0%, oklch(0.20 0.08 260) 40%, oklch(0.35 0.10 250) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.60 0.14 250), oklch(0.65 0.18 35))',
    text: 'linear-gradient(135deg, oklch(0.70 0.16 75), oklch(0.65 0.18 35))'
  },

  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    full: '9999px'
  },

  animations: {
    pulse: 'engine-glow 2s ease-in-out infinite',
    glow: 'laser-charge 1.5s ease-in-out infinite'
  },

  customCSS: `
    /* Starfield background */
    .starfield {
      background-image:
        radial-gradient(1px 1px at 10% 10%, oklch(0.98 0 0) 50%, transparent 50%),
        radial-gradient(1px 1px at 20% 40%, oklch(0.90 0.02 240) 50%, transparent 50%),
        radial-gradient(1px 1px at 30% 70%, oklch(from var(--color-accent) l c h / 0.8) 50%, transparent 50%),
        radial-gradient(1px 1px at 40% 20%, oklch(0.98 0 0) 50%, transparent 50%),
        radial-gradient(1px 1px at 50% 50%, oklch(0.90 0.02 240) 50%, transparent 50%),
        radial-gradient(1px 1px at 60% 80%, oklch(from var(--color-accent) l c h / 0.8) 50%, transparent 50%),
        radial-gradient(1px 1px at 70% 30%, oklch(0.98 0 0) 50%, transparent 50%),
        radial-gradient(1px 1px at 80% 60%, oklch(0.90 0.02 240) 50%, transparent 50%),
        radial-gradient(1px 1px at 90% 10%, oklch(from var(--color-accent) l c h / 0.8) 50%, transparent 50%);
      background-size: 200% 200%;
      animation: star-drift 60s linear infinite;
    }

    @keyframes star-drift {
      0% { background-position: 0% 0%; }
      100% { background-position: 100% 100%; }
    }

    /* Engine glow */
    @keyframes engine-glow {
      0%, 100% { box-shadow: 0 0 10px oklch(from var(--color-accent) l c h / 0.8); }
      50% { box-shadow: 0 0 30px oklch(from var(--color-accent) l c h / 1), 0 0 60px oklch(from var(--color-accent) l c h / 0.5); }
    }

    /* Laser charge effect */
    @keyframes laser-charge {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .arwing-engine {
      animation: engine-glow 2s ease-in-out infinite;
    }

    /* HUD-style borders */
    .hud-border {
      border: 1px solid oklch(from var(--color-accent) l c h / 0.5);
      box-shadow:
        inset 0 0 20px oklch(from var(--color-accent) l c h / 0.1),
        0 0 10px oklch(from var(--color-accent) l c h / 0.2);
    }

    /* Diagonal speed lines */
    .speed-lines::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        oklch(from var(--color-text) l c h / 0.03) 10px,
        oklch(from var(--color-text) l c h / 0.03) 11px
      );
      pointer-events: none;
    }
  `
};
