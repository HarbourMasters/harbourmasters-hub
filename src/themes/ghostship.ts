import { Theme } from '@/types/theme';

// Ghostship Theme (Super Mario 64)
// Primary colors (red/blue), coin gold, star yellow, blocky UI
export const ghostshipTheme: Theme = {
  id: 'ghostship',
  name: 'Ghostship',
  description: 'Colorful and playful with Mario\'s iconic palette',

  colors: {
    primary: 'oklch(0.55 0.22 25)',         // Mario red
    secondary: 'oklch(0.55 0.18 250)',       //Luigi blue
    accent: 'oklch(0.78 0.14 85)',           // Coin gold
    background: 'oklch(0.15 0.03 30)',       //Dark warm background
    surface: 'oklch(0.25 0.06 25)',          // Red-tinted surface
    surfaceHover: 'oklch(0.32 0.08 25)',     // Lighter red surface
    text: 'oklch(0.97 0.01 85)',             // Warm white
    textMuted: 'oklch(0.65 0.06 85)',        //Muted gold
    border: 'oklch(0.40 0.12 25)',           // Red border
    success: 'oklch(0.70 0.14 85)',          // Star yellow
    warning: 'oklch(0.78 0.14 85)',          // Coin gold
    error: 'oklch(0.55 0.22 25)'             // Mario red
  },

  fonts: {
    display: "'Fredoka One', 'Comic Sans MS', cursive",
    body: "'Nunito', system-ui, sans-serif"
  },

  pattern: {
    type: 'circles',
    colors: [
      'oklch(from var(--color-accent) l c h / 0.2)',   // Coin gold circles
      'oklch(from var(--color-primary) l c h / 0.15)'   // Red circles
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.15 0.03 30) 0%, oklch(0.25 0.06 25) 30%, oklch(0.30 0.08 250) 70%, oklch(0.25 0.06 240) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.55 0.22 25), oklch(0.78 0.14 85))',
    text: 'linear-gradient(135deg, oklch(0.78 0.14 85), oklch(0.70 0.12 75))'
  },

  borderRadius: {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    full: '9999px'
  },

  animations: {
    pulse: 'coin-float 2s ease-in-out infinite',
    glow: 'star-glow 2s ease-in-out infinite'
  },

  customCSS: `
    /* Coin animation */
    @keyframes coin-float {
      0%, 100% { transform: translateY(0) rotateY(0deg); }
      50% { transform: translateY(-10px) rotateY(180deg); }
    }

    /* Star glow effect */
    @keyframes star-glow {
      0%, 100% { filter: drop-shadow(0 0 10px oklch(from var(--color-accent) l c h / 0.8)); }
      50% { filter: drop-shadow(0 0 20px oklch(from var(--color-accent) l c h / 1)); }
    }

    .coin-bounce {
      animation: coin-float 2s ease-in-out infinite;
    }

    /* Blocky N64-style buttons */
    .n64-button {
      border: none;
      box-shadow:
        inset -2px -4px 0 oklch(from var(--color-text) l c h / 0.2),
        inset 2px 2px 0 oklch(from var(--color-text) l c h / 0.2),
        4px 4px 0 oklch(from var(--color-primary) l c h / 0.3);
      border-radius: 0;
    }

    .n64-button:active {
      box-shadow:
        inset -1px -2px 0 oklch(from var(--color-text) l c h / 0.2),
        inset 1px 1px 0 oklch(from var(--color-text) l c h / 0.2),
        2px 2px 0 oklch(from var(--color-primary) l c h / 0.3);
      transform: translate(2px, 2px);
    }
  `
};
