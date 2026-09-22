import { Theme } from '@/types/theme';

// Shipwright Theme (The Legend of Zelda: Ocarina of Time)
// Kokiri Forest at dusk: deep forest greens under Hyrulean gold heraldry.
// A Triforce tessellation carved into the background, fairy motes drifting
// through the hero, and panels shaped like the game's dark text boxes,
// complete with the blinking "continue" triangle.

export const shipwrightTheme: Theme = {
  id: 'shipwright',
  name: 'Shipwright',
  description: 'Kokiri Forest greens with Hyrulean gold and Triforce heraldry',

  colors: {
    primary: 'oklch(0.60 0.15 150)',        // Kokiri tunic green
    secondary: 'oklch(0.44 0.12 152)',      // Deep Lost Woods
    accent: 'oklch(0.80 0.15 88)',          // Triforce gold
    background: 'oklch(0.14 0.025 155)',    // Forest floor at dusk
    surface: 'oklch(0.20 0.035 152)',       // Mossy stone
    surfaceHover: 'oklch(0.26 0.045 150)',  // Lighter moss
    text: 'oklch(0.96 0.015 90)',           // Parchment white
    textMuted: 'oklch(0.74 0.04 140)',      // Sage
    border: 'oklch(0.36 0.06 140)',         // Vine green
    success: 'oklch(0.70 0.16 150)',        // Kokiri emerald
    warning: 'oklch(0.80 0.15 88)',         // Gold rupee
    error: 'oklch(0.60 0.20 25)'            // Heart container red
  },

  fonts: {
    display: "'Cinzel', 'Times New Roman', serif",
    body: "'Lora', Georgia, serif"
  },

  pattern: {
    type: 'triangles',
    colors: [
      'oklch(from var(--color-accent) l c h / 0.06)',
      'oklch(from var(--color-primary) l c h / 0.08)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.14 0.025 155) 0%, oklch(0.20 0.035 152) 55%, oklch(0.24 0.05 120) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.60 0.15 150), oklch(0.80 0.15 88))',
    text: 'linear-gradient(135deg, oklch(0.80 0.15 88), oklch(0.68 0.13 80))'
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px'
  },

  animations: {
    glow: 'soh-glint 4s ease-in-out infinite',
    pulse: 'soh-cursor 1.2s ease-in-out infinite'
  },

  customCSS: `
    body[data-theme="shipwright"] {
      --soh-gold: oklch(0.80 0.15 88);
      --soh-gold-deep: oklch(0.68 0.13 80);
      --soh-ink: oklch(0.11 0.02 155);
      --soh-panel: linear-gradient(180deg, oklch(0.18 0.03 152), oklch(0.135 0.025 152));
      /* Gold-and-diamond rule, like the frames of the pause menu subscreens */
      --soh-rule: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='18' viewBox='0 0 80 18'%3E%3Cpath d='M0 4.5h80M0 13.5h80' stroke='%23d4b04a' stroke-opacity='.7' stroke-width='1.2'/%3E%3Cpath d='M40 4.5 44.5 9 40 13.5 35.5 9z' fill='%23e8c65b'/%3E%3C/svg%3E");

      /* Triforce tessellation, faint as a crest carved into Temple of Time stone */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='140' viewBox='0 0 160 140'%3E%3Cg fill='%23e0b84f' fill-opacity='.05'%3E%3Cpath d='M80 18 50 70h60z'/%3E%3Cpath d='M50 70 20 122h60z'/%3E%3Cpath d='M110 70 80 122h60z'/%3E%3C/g%3E%3C/svg%3E");
      background-size: 160px 140px;
    }

    /* The global ::selection text is near-white, unreadable on gold */
    body[data-theme="shipwright"] ::selection {
      color: var(--soh-ink);
    }

    /* ---- Hero: fairy motes drifting up, a Triforce watermark, a gold rule below ---- */
    body[data-theme="shipwright"] main section:has(+ #downloads) {
      padding-bottom: 3.25rem;
    }

    body[data-theme="shipwright"] main section:has(+ #downloads)::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: calc(100% + 420px);
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='420'%3E%3Cdefs%3E%3CradialGradient id='n'%3E%3Cstop offset='0' stop-color='%23e4f3ff'/%3E%3Cstop offset='.3' stop-color='%23bfe3ff' stop-opacity='.7'/%3E%3Cstop offset='1' stop-color='%23bfe3ff' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='g'%3E%3Cstop offset='0' stop-color='%23fff3bf'/%3E%3Cstop offset='.3' stop-color='%23ffd76a' stop-opacity='.7'/%3E%3Cstop offset='1' stop-color='%23ffd76a' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='60' cy='40' r='12' fill='url(%23n)'/%3E%3Ccircle cx='330' cy='90' r='9' fill='url(%23g)'/%3E%3Ccircle cx='200' cy='170' r='7' fill='url(%23n)'/%3E%3Ccircle cx='390' cy='250' r='11' fill='url(%23g)'/%3E%3Ccircle cx='110' cy='300' r='8' fill='url(%23g)'/%3E%3Ccircle cx='260' cy='370' r='12' fill='url(%23n)'/%3E%3Ccircle cx='30' cy='400' r='6' fill='url(%23g)'/%3E%3C/svg%3E");
      background-size: 420px 420px;
      animation: soh-motes 48s linear infinite;
    }

    @keyframes soh-motes {
      from { transform: translateY(0); }
      to { transform: translateY(-420px); }
    }

    body[data-theme="shipwright"] main section:has(+ #downloads)::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        var(--soh-rule),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'%3E%3Cg fill='%23e8c65b' fill-opacity='.05' stroke='%23e8c65b' stroke-opacity='.14' stroke-width='.6'%3E%3Cpath d='M50 1 25.5 44h49z'/%3E%3Cpath d='M25.5 44 1 87h49z'/%3E%3Cpath d='M74.5 44 50 87h49z'/%3E%3C/g%3E%3C/svg%3E");
      background-repeat: repeat-x, no-repeat;
      background-position: left bottom, center 8%;
      background-size: 80px 18px, 560px auto;
    }

    /* ---- Title: the gold Hylian wordmark ---- */
    body[data-theme="shipwright"] main section:has(+ #downloads) h1 {
      color: var(--soh-gold);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-shadow:
        0 2px 0 var(--soh-ink),
        0 0 26px oklch(0.80 0.15 88 / 0.35);
    }

    body[data-theme="shipwright"] main section:has(+ #downloads) h1 + p {
      font-family: var(--font-display);
      letter-spacing: 0.12em;
      color: var(--soh-gold-deep);
    }

    /* Game icon: a gold-framed item slot with the title-screen glint */
    body[data-theme="shipwright"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl {
      border-radius: 1rem;
      border: 3px solid var(--soh-gold);
      outline: 1px solid oklch(0.80 0.15 88 / 0.45);
      outline-offset: 5px;
      animation: soh-glint 4s ease-in-out infinite;
    }

    @keyframes soh-glint {
      0%, 100% {
        box-shadow:
          0 0 0 1px var(--soh-ink),
          inset 0 0 24px oklch(0 0 0 / 0.35),
          0 0 30px oklch(0.80 0.15 88 / 0.25);
      }
      50% {
        box-shadow:
          0 0 0 1px var(--soh-ink),
          inset 0 0 24px oklch(0 0 0 / 0.35),
          0 0 54px oklch(0.80 0.15 88 / 0.55);
      }
    }

    /* ---- Section titles: Triforce marker and a fading gold rule ---- */
    body[data-theme="shipwright"] main section > .container > h2 {
      display: flex;
      align-items: center;
      gap: 0.6em;
      color: var(--soh-gold);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 1.35rem;
    }

    body[data-theme="shipwright"] main section > .container > h2::before {
      content: '';
      flex: none;
      width: 1em;
      height: 0.9em;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88'%3E%3Cpath fill='%23e8c65b' d='M50 0 25 44h50zM25 44 0 88h50zM75 44 50 88h50z'/%3E%3C/svg%3E") center / contain no-repeat;
      filter: drop-shadow(0 0 4px oklch(0.80 0.15 88 / 0.6));
    }

    body[data-theme="shipwright"] main section > .container > h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, oklch(0.80 0.15 88 / 0.55), transparent);
    }

    /* ---- Panels: the dark in-game text box ---- */
    body[data-theme="shipwright"] #downloads .container > .rounded-xl,
    body[data-theme="shipwright"] #older-versions .rounded-xl.border,
    body[data-theme="shipwright"] #other-games a.rounded-lg {
      background: var(--soh-panel);
      border: 1px solid oklch(0.80 0.15 88 / 0.32);
      border-radius: 0.75rem;
      box-shadow:
        inset 0 0 0 1px oklch(0.30 0.05 150 / 0.55),
        0 14px 32px oklch(0 0 0 / 0.4);
    }

    /* Download stats strip inside the release card */
    body[data-theme="shipwright"] #downloads .container > .rounded-xl .rounded-xl.border {
      background: oklch(0.10 0.02 155 / 0.6);
      border-color: oklch(0.80 0.15 88 / 0.22);
    }

    /* The blinking "press A to continue" triangle at the foot of the release card */
    body[data-theme="shipwright"] #downloads .container > .rounded-xl {
      position: relative;
    }

    body[data-theme="shipwright"] #downloads .container > .rounded-xl::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 7px;
      margin-left: -7px;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 9px solid var(--soh-gold);
      filter: drop-shadow(0 0 4px oklch(0.80 0.15 88 / 0.6));
      animation: soh-cursor 1.2s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes soh-cursor {
      0%, 100% { transform: translateY(0); opacity: 0.85; }
      50% { transform: translateY(3px); opacity: 1; }
    }

    /* ---- Download buttons: item slots that light up gold when selected ---- */
    body[data-theme="shipwright"] #downloads a.rounded-lg.border,
    body[data-theme="shipwright"] #older-versions a.rounded-lg.border {
      background: oklch(0.10 0.02 155 / 0.75);
      border: 1px solid oklch(0.36 0.06 140 / 0.9);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }

    body[data-theme="shipwright"] #downloads a.rounded-lg.border:hover,
    body[data-theme="shipwright"] #older-versions a.rounded-lg.border:hover {
      border-color: var(--soh-gold);
      box-shadow:
        inset 0 0 16px oklch(0.80 0.15 88 / 0.12),
        0 0 14px oklch(0.80 0.15 88 / 0.22);
      transform: translateY(-1px);
    }

    body[data-theme="shipwright"] #downloads a.rounded-lg.border:hover svg,
    body[data-theme="shipwright"] #older-versions a.rounded-lg.border:hover svg {
      color: var(--soh-gold);
    }

    /* ---- Older versions: a darker band framed by gold rules ---- */
    body[data-theme="shipwright"] #older-versions {
      position: relative;
      background: oklch(0.11 0.02 155 / 0.55);
    }

    body[data-theme="shipwright"] #older-versions::before,
    body[data-theme="shipwright"] #older-versions::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 18px;
      pointer-events: none;
      background: var(--soh-rule) repeat-x;
    }

    body[data-theme="shipwright"] #older-versions::before { top: 0; }
    body[data-theme="shipwright"] #older-versions::after { bottom: 0; }

    /* ---- Other ports ---- */
    body[data-theme="shipwright"] #other-games a.rounded-lg {
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    body[data-theme="shipwright"] #other-games a.rounded-lg:hover {
      transform: translateY(-3px);
      border-color: var(--soh-gold);
      box-shadow:
        inset 0 0 0 1px oklch(0.80 0.15 88 / 0.3),
        0 16px 30px oklch(0 0 0 / 0.45),
        0 0 18px oklch(0.80 0.15 88 / 0.18);
    }
  `
};
