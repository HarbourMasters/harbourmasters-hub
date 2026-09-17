import { Theme } from '@/types/theme';

// Paperboat Theme (Paper Mario 64)
// A papercraft diorama: corrugated cardboard base, kraft-paper cards,
// and construction-paper primaries (Mario red, boat blue, star yellow, leaf green).

export const paperboatTheme: Theme = {
  id: 'paperboat',
  name: 'Paperboat',
  description: 'Corrugated cardboard and kraft paper with colourful construction-paper cutouts',

  colors: {
    primary: 'oklch(0.70 0.10 68)',          // Kraft cardboard
    secondary: 'oklch(0.63 0.21 28)',        // Mario red
    accent: 'oklch(0.87 0.16 95)',           // Star yellow
    background: 'oklch(0.19 0.03 62)',       // Shadowed inside of the box
    surface: 'oklch(0.27 0.045 65)',         // Kraft paper card
    surfaceHover: 'oklch(0.33 0.055 65)',    // Lighter kraft
    text: 'oklch(0.96 0.02 85)',             // Paper white
    textMuted: 'oklch(0.76 0.05 75)',        // Faded kraft
    border: 'oklch(0.48 0.075 70)',          // Exposed cut edge
    success: 'oklch(0.74 0.17 140)',         // Leaf green
    warning: 'oklch(0.78 0.15 65)',          // Orange paper
    error: 'oklch(0.63 0.21 28)'             // Mario red
  },

  fonts: {
    display: "'Grandstander', 'Fredoka', sans-serif",
    body: "'Nunito', system-ui, sans-serif"
  },

  pattern: {
    type: 'triangles',
    colors: [
      'oklch(0.63 0.21 28 / 0.5)',    // Red offcuts
      'oklch(0.87 0.16 95 / 0.5)',    // Yellow offcuts
      'oklch(0.66 0.14 240 / 0.5)',   // Blue offcuts
      'oklch(0.74 0.17 140 / 0.5)'    // Green offcuts
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.19 0.03 62) 0%, oklch(0.27 0.045 65) 45%, oklch(0.33 0.055 65) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.70 0.10 68), oklch(0.87 0.16 95))',
    text: 'linear-gradient(90deg, oklch(0.63 0.21 28), oklch(0.87 0.16 95), oklch(0.74 0.17 140), oklch(0.66 0.14 240))'
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },

  animations: {
    pulse: 'paperboat-bob 4s ease-in-out infinite'
  },

  customCSS: `
    body[data-theme="paperboat"] {
      --pb-red: oklch(0.63 0.21 28);
      --pb-yellow: oklch(0.87 0.16 95);
      --pb-blue: oklch(0.66 0.14 240);
      --pb-green: oklch(0.74 0.17 140);
      --pb-ink: oklch(0.19 0.03 62);
      --pb-paper: oklch(0.96 0.02 85);
      --pb-cut-shadow: oklch(0.08 0.02 60 / 0.55);
      /* Mottled paper fibres, stretched slightly along the flutes */
      --pb-fibres: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='f' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.32 .11' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .9 0 0 0 0 .72 .36 0 0 0 -.13'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E");

      /* Corrugated sheet: fibres over embossed flute ribs (14px pitch) */
      background-image:
        var(--pb-fibres),
        repeating-linear-gradient(90deg,
          oklch(1 0 0 / 0.05) 0px,
          transparent 4px,
          oklch(0 0 0 / 0.2) 9px,
          transparent 13px,
          oklch(1 0 0 / 0.05) 14px);
    }

    /* The global ::selection text is near-white, unreadable on star yellow */
    body[data-theme="paperboat"] ::selection {
      color: var(--pb-ink);
    }

    /* ---- Hero: confetti behind, corrugated cut edge below ---- */
    /* index.css's unlayered .container padding zeroes the hero's pb-* utilities,
       so make room for the cut edge here. */
    body[data-theme="paperboat"] main section:first-of-type {
      padding-bottom: 3.5rem;
    }

    body[data-theme="paperboat"] main section:first-of-type::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-size: 330px 330px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'%3E%3Crect x='22' y='30' width='9' height='15' rx='1' fill='%23ed4138' transform='rotate(24 26 37)'/%3E%3Ccircle cx='88' cy='22' r='4.5' fill='%23f5d240'/%3E%3Cpath d='M150 40l12 4-9 9z' fill='%23259cde'/%3E%3Crect x='214' y='58' width='8' height='14' rx='1' fill='%236bc456' transform='rotate(-32 218 65)'/%3E%3Cpath d='M52 98l13-3-6 12z' fill='%23f8a13f'/%3E%3Crect x='118' y='104' width='15' height='6' rx='1' fill='%23f8f1e3' transform='rotate(-18 125 107)'/%3E%3Ccircle cx='190' cy='128' r='4' fill='%23ed4138'/%3E%3Crect x='18' y='160' width='8' height='14' rx='1' fill='%23259cde' transform='rotate(40 22 167)'/%3E%3Cpath d='M92 170l11 6-11 5z' fill='%236bc456'/%3E%3Crect x='150' y='188' width='9' height='15' rx='1' fill='%23f5d240' transform='rotate(-12 154 195)'/%3E%3Ccircle cx='232' cy='200' r='4.5' fill='%23f8a13f'/%3E%3Cpath d='M58 228l12 2-7 10z' fill='%23ed4138'/%3E%3Crect x='110' y='232' width='14' height='6' rx='1' fill='%23259cde' transform='rotate(15 117 235)'/%3E%3Ccircle cx='200' cy='246' r='3.5' fill='%23f8f1e3'/%3E%3C/svg%3E");
      /* Keep the scraps to the edges so they never sit under the title */
      -webkit-mask-image: radial-gradient(ellipse 58% 72% at 50% 46%, transparent 0 58%, #000 100%);
      mask-image: radial-gradient(ellipse 58% 72% at 50% 46%, transparent 0 58%, #000 100%);
    }

    body[data-theme="paperboat"] main section:first-of-type::after,
    body[data-theme="paperboat"] #older-versions::before,
    body[data-theme="paperboat"] #older-versions::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 16px;
      pointer-events: none;
      /* Cross-section of a corrugated sheet: two liners and the flute between */
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='16' viewBox='0 0 28 16'%3E%3Crect width='28' height='16' fill='%23120a04'/%3E%3Cpath d='M-14 8q7 10 14 0t14 0 14 0 14 0' fill='none' stroke='%23a97c46' stroke-width='2.4'/%3E%3Cpath d='M0 1.25h28M0 14.75h28' stroke='%23c89257' stroke-width='2.5'/%3E%3C/svg%3E") repeat-x;
    }

    body[data-theme="paperboat"] #older-versions {
      position: relative;
    }

    body[data-theme="paperboat"] #older-versions::before {
      top: 0;
      bottom: auto;
    }

    /* ---- Title: paper-white letters glued on a red backing sheet ---- */
    body[data-theme="paperboat"] main h1 {
      color: var(--pb-paper);
      text-shadow:
        0.045em 0.055em 0 var(--pb-red),
        0.09em 0.11em 0 var(--pb-cut-shadow);
    }

    /* Game icon: sticker outline, rocking like a boat on the water */
    body[data-theme="paperboat"] main section:first-of-type .rounded-3xl.shadow-2xl {
      border: 4px solid var(--pb-paper);
      box-shadow: 6px 8px 0 var(--pb-cut-shadow);
      animation: paperboat-bob 4s ease-in-out infinite;
    }

    @keyframes paperboat-bob {
      0%, 100% { transform: rotate(-3deg) translateY(0); }
      50% { transform: rotate(2deg) translateY(-6px); }
    }

    /* ---- Section titles: construction-paper labels, one colour each ---- */
    body[data-theme="paperboat"] main section > .container > h2 {
      display: inline-block;
      padding: 0.3em 0.85em 0.2em;
      border-radius: 3px;
      color: var(--pb-ink);
      background: var(--pb-fibres), var(--pb-label, var(--pb-yellow));
      box-shadow: 3px 4px 0 var(--pb-cut-shadow);
      transform: rotate(-1.2deg);
    }

    body[data-theme="paperboat"] #downloads { --pb-label: var(--pb-red); }
    body[data-theme="paperboat"] #older-versions { --pb-label: var(--pb-blue); }
    body[data-theme="paperboat"] #other-games { --pb-label: var(--pb-green); }

    body[data-theme="paperboat"] #older-versions > .container > h2 {
      transform: rotate(0.9deg);
    }

    /* ---- Panels: kraft cutouts layered on the sheet ---- */
    body[data-theme="paperboat"] #downloads .container > .rounded-xl,
    body[data-theme="paperboat"] #older-versions .rounded-xl.border,
    body[data-theme="paperboat"] #other-games a.rounded-lg {
      border-width: 2px;
      background-image: var(--pb-fibres);
      box-shadow: 5px 6px 0 var(--pb-cut-shadow);
    }

    /* Masking tape holding the release card down */
    body[data-theme="paperboat"] #downloads .container > .rounded-xl {
      position: relative;
    }

    body[data-theme="paperboat"] #downloads .container > .rounded-xl::before {
      content: '';
      position: absolute;
      top: -13px;
      left: 50%;
      width: 116px;
      height: 26px;
      transform: translateX(-50%) rotate(-2deg);
      background: oklch(0.90 0.07 95 / 0.62);
      clip-path: polygon(0 0, 3% 25%, 0 50%, 3% 75%, 0 100%, 100% 100%, 97% 75%, 100% 50%, 97% 25%, 100% 0);
      pointer-events: none;
    }

    /* Download buttons: cut along the dotted line */
    body[data-theme="paperboat"] #downloads a.rounded-lg.border,
    body[data-theme="paperboat"] #older-versions a.rounded-lg.border {
      border-width: 2px;
      border-style: dashed;
    }

    body[data-theme="paperboat"] #other-games a.rounded-lg {
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    body[data-theme="paperboat"] #other-games a.rounded-lg:hover {
      transform: translate(-2px, -3px) rotate(-0.8deg);
      box-shadow: 8px 10px 0 var(--pb-cut-shadow);
    }
  `
};
