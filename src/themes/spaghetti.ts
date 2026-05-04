import { Theme } from '@/types/theme';

// SpaghettiKart Theme (Mario Kart 64)
// Rainbow palette, checkered flags, speed lines
export const spaghettiTheme: Theme = {
  id: 'spaghetti',
  name: 'SpaghettiKart',
  description: 'Rainbow racing energy with checkered flag style',

  colors: {
    primary: 'oklch(0.65 0.20 350)',        //Racing red
    secondary: 'oklch(0.60 0.18 45)',       //Racing yellow
    accent: 'oklch(0.70 0.20 170)',         // Rainbow green
    background: 'oklch(0.12 0.03 280)',     // Dark asphalt
    surface: 'oklch(0.22 0.06 280)',        //Track surface
    surfaceHover: 'oklch(0.30 0.08 280)',   // Lighter track
    text: 'oklch(0.98 0.01 85)',            // White
    textMuted: 'oklch(0.65 0.06 85)',       //Muted
    border: 'oklch(0.35 0.10 280)',         // Border
    success: 'oklch(0.70 0.20 170)',        //Checkered flag green
    warning: 'oklch(0.75 0.18 45)',         // Yellow flag
    error: 'oklch(0.60 0.20 350)'           // Red flag
  },

  fonts: {
    display: "'Russo One', 'Arial Black', sans-serif",
    body: "'Roboto', system-ui, sans-serif"
  },

  pattern: {
    type: 'checkerboard',
    colors: [
      'oklch(from var(--color-surface) l c h)',
      'oklch(0.98 0 0)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.65 0.20 350) 0%, oklch(0.60 0.18 45) 25%, oklch(0.60 0.18 200) 50%, oklch(0.65 0.18 280) 75%, oklch(0.70 0.20 170) 100%)',
    accent: 'linear-gradient(90deg, oklch(0.65 0.20 350), oklch(0.60 0.18 45), oklch(0.60 0.18 200), oklch(0.65 0.18 280), oklch(0.70 0.20 170))',
    text: 'linear-gradient(90deg, oklch(0.65 0.20 350), oklch(0.60 0.18 45), oklch(0.70 0.20 170))'
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },

  animations: {
    pulse: 'speed-lines 0.5s linear infinite'
  },

  customCSS: `
    /* Checkered flag pattern */
    .checkered-flag {
      background-image:
        linear-gradient(45deg,
          var(--color-text) 25%,
          transparent 25%,
          transparent 75%,
          var(--color-text) 75%
        ),
        linear-gradient(45deg,
          var(--color-text) 25%,
          transparent 25%,
          transparent 75%,
          var(--color-text) 75%
        );
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }

    /* Speed lines animation */
    @keyframes speed-lines {
      0% { background-position: 0 0, 10px 10px; }
      100% { background-position: 20px 20px, 30px 30px; }
    }

    /* Racing stripe */
    .racing-stripe {
      background: repeating-linear-gradient(
        90deg,
        var(--color-primary) 0px,
        var(--color-primary) 20px,
        var(--color-text) 20px,
        var(--color-text) 40px
      );
    }

    /* Skewed speed effect */
    .speed-skew {
      transform: skewX(-10deg);
    }

    .speed-skew-reverse {
      transform: skewX(10deg);
    }
  `
};
