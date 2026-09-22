import { Theme } from '@/types/theme';

// Starship Theme (Star Fox 64)
// Deep Lylat space seen through the Arwing's cockpit: a drifting starfield,
// Corneria's glow on the horizon, the chrome wordmark with the emblem's fire
// behind it, lock-on brackets around the game icon, a segmented shield gauge
// for the hero's floor, and HUD panels with scanlines and corner ticks.

export const starshipTheme: Theme = {
  id: 'starship',
  name: 'Starship',
  description: 'Lylat space, Arwing chrome and the cockpit HUD',

  colors: {
    primary: 'oklch(0.66 0.15 250)',        // Arwing blue
    secondary: 'oklch(0.42 0.13 258)',      // Deep Lylat
    accent: 'oklch(0.72 0.18 48)',          // Emblem fire orange
    background: 'oklch(0.12 0.035 262)',    // Space
    surface: 'oklch(0.19 0.05 258)',        // Cockpit panel
    surfaceHover: 'oklch(0.25 0.06 255)',   // Lit panel
    text: 'oklch(0.96 0.01 240)',           // Cool white
    textMuted: 'oklch(0.72 0.05 245)',      // Readout grey-blue
    border: 'oklch(0.36 0.09 250)',         // Panel seam
    success: 'oklch(0.78 0.15 165)',        // Shield green
    warning: 'oklch(0.80 0.15 85)',         // Gold ring
    error: 'oklch(0.62 0.21 25)'            // Damage red
  },

  fonts: {
    display: "'Orbitron', 'Arial Black', sans-serif",
    body: "'Exo 2', system-ui, sans-serif"
  },

  pattern: {
    type: 'stars',
    colors: [
      'oklch(0.98 0 0)',
      'oklch(0.82 0.13 195)',
      'oklch(from var(--color-accent) l c h / 0.8)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.12 0.035 262) 0%, oklch(0.19 0.05 258) 45%, oklch(0.32 0.11 250) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.66 0.15 250), oklch(0.72 0.18 48))',
    text: 'linear-gradient(180deg, oklch(1 0 0), oklch(0.72 0.05 245))'
  },

  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    full: '9999px'
  },

  animations: {
    pulse: 'ss-lock 2.4s ease-in-out infinite',
    glow: 'ss-drift 90s linear infinite'
  },

  customCSS: `
    body[data-theme="starship"] {
      --ss-cyan: oklch(0.82 0.13 195);
      --ss-orange: oklch(0.72 0.18 48);
      --ss-ink: oklch(0.10 0.03 262);
      --ss-stars: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cg fill='%23fff'%3E%3Ccircle cx='24' cy='40' r='1.2' opacity='.7'/%3E%3Ccircle cx='140' cy='18' r='.8' opacity='.5'/%3E%3Ccircle cx='210' cy='70' r='1.5' opacity='.8'/%3E%3Ccircle cx='300' cy='36' r='.9' opacity='.5'/%3E%3Ccircle cx='80' cy='120' r='1' opacity='.6'/%3E%3Ccircle cx='250' cy='150' r='.7' opacity='.45'/%3E%3Ccircle cx='170' cy='190' r='1.3' opacity='.7'/%3E%3Ccircle cx='40' cy='230' r='.8' opacity='.5'/%3E%3Ccircle cx='300' cy='250' r='1.1' opacity='.6'/%3E%3Ccircle cx='120' cy='290' r='.9' opacity='.55'/%3E%3Ccircle cx='230' cy='300' r='1.4' opacity='.75'/%3E%3C/g%3E%3Cg fill='%23a6e7f5'%3E%3Ccircle cx='190' cy='110' r='1' opacity='.7'/%3E%3Ccircle cx='60' cy='300' r='1.2' opacity='.6'/%3E%3C/g%3E%3Ccircle cx='280' cy='200' r='1.1' fill='%23ffb27a' opacity='.7'/%3E%3C/svg%3E");
      /* HUD corner ticks, reused by every panel */
      --ss-ticks:
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) left top / 14px 2px no-repeat,
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) left top / 2px 14px no-repeat,
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) right top / 14px 2px no-repeat,
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) right top / 2px 14px no-repeat,
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) left bottom / 14px 2px no-repeat,
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) left bottom / 2px 14px no-repeat,
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) right bottom / 14px 2px no-repeat,
        linear-gradient(var(--ss-tick, var(--ss-cyan)), var(--ss-tick, var(--ss-cyan))) right bottom / 2px 14px no-repeat;

      background-image: var(--ss-stars);
      background-size: 320px 320px;
    }

    /* The global ::selection text is near-white, unreadable on orange */
    body[data-theme="starship"] ::selection {
      color: var(--ss-ink);
    }

    /* ---- Hero: a drifting starfield, Corneria's glow, the shield gauge below ---- */
    body[data-theme="starship"] main section:has(+ #downloads) {
      padding-bottom: 3.25rem;
    }

    body[data-theme="starship"] main section:has(+ #downloads)::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: calc(100% + 320px);
      pointer-events: none;
      background-image: var(--ss-stars);
      background-size: 320px 320px;
      background-position: 160px 80px;
      animation: ss-drift 90s linear infinite;
    }

    @keyframes ss-drift {
      from { transform: translateY(0); }
      to { transform: translateY(-320px); }
    }

    body[data-theme="starship"] main section:has(+ #downloads)::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='16' viewBox='0 0 26 16'%3E%3Crect x='0' y='4' width='18' height='8' rx='2' fill='%2367d6e8'/%3E%3Cpath d='M0 15.5h26' stroke='%2367d6e8' stroke-opacity='.45'/%3E%3C/svg%3E"),
        radial-gradient(ellipse 130% 60% at 50% 122%, oklch(0.55 0.15 250 / 0.5), transparent 60%);
      background-repeat: repeat-x, no-repeat;
      background-position: left bottom, center;
      background-size: 26px 16px, 100% 100%;
    }

    /* ---- Title: chrome wordmark with the emblem's fire behind it ---- */
    body[data-theme="starship"] main section:has(+ #downloads) h1 {
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: linear-gradient(180deg, #ffffff 0%, #dfe9f8 42%, #8ea3c7 50%, #eef3ff 58%, #aebfe0 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter:
        drop-shadow(0 2px 0 oklch(0.16 0.05 262))
        drop-shadow(0 0 22px oklch(0.72 0.18 48 / 0.55));
    }

    body[data-theme="starship"] main section:has(+ #downloads) h1 + p {
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.25em;
      font-size: 0.95rem;
      color: var(--ss-cyan);
      text-shadow: 0 0 12px oklch(0.82 0.13 195 / 0.5);
    }

    body[data-theme="starship"] main section:has(+ #downloads) h1 + p::before { content: '[ '; }
    body[data-theme="starship"] main section:has(+ #downloads) h1 + p::after { content: ' ]'; }

    /* Game icon: the targeting reticle locks on */
    body[data-theme="starship"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl {
      border-radius: 8px;
      border: 1px solid oklch(0.82 0.13 195 / 0.55);
      box-shadow:
        0 0 0 1px var(--ss-ink),
        0 0 28px oklch(0.66 0.15 250 / 0.35),
        inset 0 0 20px oklch(0 0 0 / 0.35);
    }

    body[data-theme="starship"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl::before {
      content: '';
      position: absolute;
      inset: -16px;
      pointer-events: none;
      --ss-tick: var(--ss-cyan);
      background: var(--ss-ticks);
      filter: drop-shadow(0 0 4px oklch(0.82 0.13 195 / 0.6));
      animation: ss-lock 2.4s ease-in-out infinite;
    }

    @keyframes ss-lock {
      0%, 100% { transform: scale(1); opacity: 0.85; }
      50% { transform: scale(0.94); opacity: 1; }
    }

    /* ---- Section titles: HUD readouts ---- */
    body[data-theme="starship"] main section > .container > h2 {
      display: flex;
      align-items: center;
      gap: 0.6em;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 1.3rem;
    }

    body[data-theme="starship"] main section > .container > h2::before {
      content: '';
      flex: none;
      width: 0.55em;
      height: 0.9em;
      background: var(--ss-cyan);
      clip-path: polygon(0 0, 100% 50%, 0 100%);
      filter: drop-shadow(0 0 5px oklch(0.82 0.13 195 / 0.7));
    }

    body[data-theme="starship"] main section > .container > h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, oklch(0.82 0.13 195 / 0.6), transparent);
    }

    /* ---- Panels: HUD frames with scanlines ---- */
    body[data-theme="starship"] #downloads .container > .rounded-xl,
    body[data-theme="starship"] #older-versions .rounded-xl.border,
    body[data-theme="starship"] #other-games a.rounded-lg {
      position: relative;
      border-radius: 6px;
      border: 1px solid oklch(0.50 0.10 250 / 0.6);
      background:
        repeating-linear-gradient(0deg, transparent 0 2px, oklch(1 0 0 / 0.03) 2px 3px),
        linear-gradient(180deg, oklch(0.20 0.05 258 / 0.95), oklch(0.15 0.045 260 / 0.95));
      box-shadow:
        inset 0 0 0 1px oklch(0.82 0.13 195 / 0.08),
        0 12px 30px oklch(0 0 0 / 0.45);
    }

    body[data-theme="starship"] #downloads .container > .rounded-xl::before,
    body[data-theme="starship"] #other-games a.rounded-lg::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      --ss-tick: oklch(0.82 0.13 195 / 0.85);
      background: var(--ss-ticks);
    }

    body[data-theme="starship"] #downloads .container > .rounded-xl .rounded-xl.border {
      border-radius: 4px;
      background: oklch(0.10 0.03 262 / 0.55);
      border-color: oklch(0.82 0.13 195 / 0.25);
    }

    /* ---- Download buttons ---- */
    body[data-theme="starship"] #downloads a.rounded-lg.border,
    body[data-theme="starship"] #older-versions a.rounded-lg.border {
      border-radius: 4px;
      background: oklch(0.10 0.03 262 / 0.6);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }

    body[data-theme="starship"] #downloads a.rounded-lg.border:hover,
    body[data-theme="starship"] #older-versions a.rounded-lg.border:hover {
      border-color: var(--ss-cyan);
      box-shadow:
        inset 0 0 18px oklch(0.82 0.13 195 / 0.12),
        0 0 12px oklch(0.82 0.13 195 / 0.25);
      transform: translateY(-1px);
    }

    body[data-theme="starship"] #downloads a.rounded-lg.border:hover svg,
    body[data-theme="starship"] #older-versions a.rounded-lg.border:hover svg {
      color: var(--ss-cyan);
    }

    /* ---- Older versions: the mission log ---- */
    body[data-theme="starship"] #older-versions {
      background: oklch(0.09 0.03 262 / 0.45);
      border-top: 1px solid oklch(0.82 0.13 195 / 0.25);
      border-bottom: 1px solid oklch(0.82 0.13 195 / 0.25);
    }

    body[data-theme="starship"] #older-versions .rounded-xl.border {
      border-left: 3px solid oklch(0.82 0.13 195 / 0.6);
    }

    /* ---- Other ports: lock on when hovered ---- */
    body[data-theme="starship"] #other-games a.rounded-lg {
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    body[data-theme="starship"] #other-games a.rounded-lg::before {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    body[data-theme="starship"] #other-games a.rounded-lg:hover {
      transform: translateY(-3px);
      border-color: oklch(0.82 0.13 195 / 0.7);
      box-shadow:
        0 16px 30px oklch(0 0 0 / 0.5),
        0 0 18px oklch(0.82 0.13 195 / 0.2);
    }

    body[data-theme="starship"] #other-games a.rounded-lg:hover::before {
      opacity: 1;
    }
  `
};
