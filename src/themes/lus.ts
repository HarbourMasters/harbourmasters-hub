import { Theme } from '@/types/theme';

// LibUltraShip Theme
// Technical gray/blue, circuit patterns, dev-tool aesthetic
export const lusTheme: Theme = {
  id: 'lus',
  name: 'LibUltraShip',
  description: 'Technical development aesthetic with circuit patterns',

  colors: {
    primary: 'oklch(0.55 0.08 250)',        //Technical blue
    secondary: 'oklch(0.45 0.06 250)',      // Darker tech blue
    accent: 'oklch(0.70 0.12 170)',         // Code green (success terminal)
    background: 'oklch(0.14 0.01 250)',     // IDE dark
    surface: 'oklch(0.20 0.02 250)',        //Panel surface
    surfaceHover: 'oklch(0.26 0.03 250)',   // Surface hover
    text: 'oklch(0.94 0.005 250)',          // Editor text
    textMuted: 'oklch(0.55 0.03 250)',      // Comment color
    border: 'oklch(0.30 0.04 250)',         // Panel border
    success: 'oklch(0.70 0.12 170)',        //Terminal green
    warning: 'oklch(0.75 0.12 85)',         // Warning yellow
    error: 'oklch(0.55 0.18 25)'            // Error red
  },

  fonts: {
    display: "'JetBrains Mono', 'Fira Code', monospace",
    body: "'IBM Plex Sans', system-ui, sans-serif"
  },

  pattern: {
    type: 'circuit',
    colors: [
      'oklch(from var(--color-primary) l c h / 0.3)',
      'oklch(from var(--color-accent) l c h / 0.2)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.14 0.01 250) 0%, oklch(0.20 0.02 250) 50%, oklch(0.26 0.03 245) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.55 0.08 250), oklch(0.70 0.12 170))',
    text: 'linear-gradient(135deg, oklch(0.70 0.12 170), oklch(0.60 0.10 250))'
  },

  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    full: '0.25rem'
  },

  customCSS: `
    /* Circuit board pattern */
    .circuit-pattern {
      background-image:
        linear-gradient(oklch(from var(--color-primary) l c h / 0.1) 1px, transparent 1px),
        linear-gradient(90deg, oklch(from var(--color-primary) l c h / 0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    /* Terminal-style code blocks */
    .terminal-block {
      background: oklch(0.12 0.01 250);
      border: 1px solid oklch(0.30 0.04 250);
      border-radius: 0.25rem;
      font-family: 'JetBrains Mono', monospace;
      box-shadow:
        inset 0 1px 0 oklch(from var(--color-text) l c h / 0.05),
        0 4px 12px oklch(0 0 0 / 0.3);
    }

    .terminal-block::before {
      content: '● ● ●';
      display: block;
      padding: 0.5rem 1rem;
      color: oklch(0.5 0.08 25);
      font-size: 0.75rem;
      letter-spacing: 0.25rem;
    }

    /* Glowing syntax highlights */
    .syntax-keyword { color: oklch(0.65 0.18 300); }
    .syntax-string { color: oklch(0.70 0.12 170); }
    .syntax-function { color: oklch(0.65 0.14 45); }
    .syntax-comment { color: oklch(0.45 0.04 250); font-style: italic; }

    /* Dev-tool status indicators */
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .status-dot.online { background: oklch(0.70 0.12 170); }
    .status-dot.offline { background: oklch(0.45 0.06 250); }
    .status-dot.error { background: oklch(0.55 0.18 25); }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.9); }
    }

    /* Technical diagram lines */
    .tech-lines::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, transparent 49%, oklch(from var(--color-primary) l c h / 0.2) 49%, oklch(from var(--color-primary) l c h / 0.2) 51%, transparent 51%),
        linear-gradient(0deg, transparent 49%, oklch(from var(--color-primary) l c h / 0.2) 49%, oklch(from var(--color-primary) l c h / 0.2) 51%, transparent 51%);
      background-size: 40px 40px;
      pointer-events: none;
    }
  `
};
