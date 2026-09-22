import { Theme } from '@/types/theme';

// Lighthouse Theme (Banjo-Kazooie)
// Treasure Trove Cove at dusk: deep sea blues under a honeycomb sky, golden
// Jiggies and musical notes floating around the hero, a jigsaw-cut edge under
// it, the logo's yellow-to-orange lettering with its dark outline, Rare's
// chunky rounded panels, and a Jinjo colour on every older release.

export const lighthouseTheme: Theme = {
  id: 'lighthouse',
  name: 'Lighthouse',
  description: 'Treasure Trove Cove blues with Jiggy gold, honeycomb and Jinjo colours',

  colors: {
    primary: 'oklch(0.64 0.15 245)',        // Banjo's backpack blue
    secondary: 'oklch(0.60 0.20 28)',       // Kazooie red
    accent: 'oklch(0.84 0.16 90)',          // Jiggy gold
    background: 'oklch(0.16 0.035 225)',    // The cove at dusk
    surface: 'oklch(0.23 0.045 222)',       // Sea-worn stone
    surfaceHover: 'oklch(0.29 0.055 220)',  // Lighter stone
    text: 'oklch(0.97 0.012 90)',           // Sand white
    textMuted: 'oklch(0.76 0.045 210)',     // Sea mist
    border: 'oklch(0.40 0.08 215)',         // Tide line
    success: 'oklch(0.72 0.17 145)',        // Spiral Mountain green
    warning: 'oklch(0.78 0.15 70)',         // Honeycomb
    error: 'oklch(0.60 0.20 28)'            // Kazooie red
  },

  fonts: {
    display: "'Chewy', 'Comic Sans MS', cursive",
    body: "'Nunito', system-ui, sans-serif"
  },

  pattern: {
    type: 'circles',
    colors: [
      'oklch(from var(--color-accent) l c h / 0.12)',
      'oklch(from var(--color-primary) l c h / 0.1)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.16 0.035 225) 0%, oklch(0.23 0.045 222) 50%, oklch(0.30 0.08 240) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.64 0.15 245), oklch(0.84 0.16 90))',
    text: 'linear-gradient(180deg, oklch(0.92 0.16 95), oklch(0.72 0.17 55))'
  },

  borderRadius: {
    sm: '0.5rem',
    md: '0.9rem',
    lg: '1.25rem',
    full: '9999px'
  },

  animations: {
    pulse: 'lh-bob 2.6s ease-in-out infinite',
    glow: 'lh-float 6s ease-in-out infinite'
  },

  customCSS: `
    body[data-theme="lighthouse"] {
      --lh-gold: oklch(0.84 0.16 90);
      --lh-ink: oklch(0.22 0.08 265);
      --lh-jinjo-yellow: oklch(0.88 0.16 95);
      --lh-jinjo-orange: oklch(0.74 0.17 55);
      --lh-jinjo-blue: oklch(0.66 0.16 250);
      --lh-jinjo-green: oklch(0.72 0.18 145);
      --lh-jinjo-pink: oklch(0.72 0.19 350);
      --lh-jiggy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-2 -6 44 44'%3E%3Cpath d='M6 8h9a5 5 0 1 1 10 0h9v9a5 5 0 1 1 0 10v9h-9a5 5 0 1 1-10 0h-9v-9a5 5 0 1 1 0-10z' fill='%23f6c443' stroke='%23332a66' stroke-width='2.2' stroke-linejoin='round'/%3E%3Cpath d='M10 12h6M10 16h3' stroke='%23fff3b0' stroke-width='2' stroke-linecap='round' opacity='.8'/%3E%3C/svg%3E");
      /* A row of honeycomb cells */
      --lh-honeycomb: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='18' viewBox='0 0 24 18'%3E%3Cpath d='M12 1.5 21 6v6l-9 4.5L3 12V6z' fill='%23f2b33a' stroke='%23332a66' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E");
      font-synthesis-weight: none;

      /* Faint honeycomb across the whole cove */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='48.5' viewBox='0 0 28 48.5'%3E%3Cg fill='none' stroke='%23e8b64a' stroke-opacity='.11' stroke-width='1.2'%3E%3Cpath d='M14 0 28 8.08v16.17L14 32.33 0 24.25V8.08z'/%3E%3Cpath d='M0 24.25l14 8.08v16.17L0 56.58M28 24.25l-14 8.08'/%3E%3C/g%3E%3C/svg%3E");
      background-size: 28px 48.5px;
    }

    /* The global ::selection text is near-white, unreadable on gold */
    body[data-theme="lighthouse"] ::selection {
      color: var(--lh-ink);
    }

    /* ---- Hero: Jiggies and notes drifting, a jigsaw edge underneath ---- */
    body[data-theme="lighthouse"] main section:has(+ #downloads) {
      padding-bottom: 3.5rem;
    }

    body[data-theme="lighthouse"] main section:has(+ #downloads)::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-size: 400px 400px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cdefs%3E%3Cpath id='j' d='M6 8h9a5 5 0 1 1 10 0h9v9a5 5 0 1 1 0 10v9h-9a5 5 0 1 1-10 0h-9v-9a5 5 0 1 1 0-10z'/%3E%3Cg id='n'%3E%3Cpath d='M14 3v15' stroke='%23f6c443' stroke-width='2.6' stroke-linecap='round'/%3E%3Cpath d='M14 3c4 1.5 6 4 5.5 8' fill='none' stroke='%23f6c443' stroke-width='2.6' stroke-linecap='round'/%3E%3Cellipse cx='11' cy='18.5' rx='4.2' ry='3' fill='%23f6c443' transform='rotate(-20 11 18.5)'/%3E%3C/g%3E%3C/defs%3E%3Cg fill='%23f6c443' stroke='%23332a66' stroke-width='2.2' stroke-linejoin='round'%3E%3Cuse href='%23j' transform='translate(30 40) rotate(-14)'/%3E%3Cuse href='%23j' transform='translate(320 60) rotate(22) scale(.8)'/%3E%3Cuse href='%23j' transform='translate(200 320) rotate(-8) scale(.9)'/%3E%3Cuse href='%23j' transform='translate(40 280) rotate(30) scale(.7)'/%3E%3Cuse href='%23j' transform='translate(340 240) rotate(-25)'/%3E%3C/g%3E%3Cg%3E%3Cuse href='%23n' transform='translate(130 110) rotate(12)'/%3E%3Cuse href='%23n' transform='translate(260 170) rotate(-15) scale(.85)'/%3E%3Cuse href='%23n' transform='translate(120 350) rotate(8) scale(1.1)'/%3E%3Cuse href='%23n' transform='translate(370 350) rotate(-10) scale(.9)'/%3E%3C/g%3E%3C/svg%3E");
      /* Keep the collectibles to the edges, away from the title */
      -webkit-mask-image: radial-gradient(ellipse 56% 70% at 50% 46%, transparent 0 58%, #000 100%);
      mask-image: radial-gradient(ellipse 56% 70% at 50% 46%, transparent 0 58%, #000 100%);
      animation: lh-float 6s ease-in-out infinite;
    }

    @keyframes lh-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    /* On phones the description spans the full width, so clear a wider lane */
    @media (max-width: 640px) {
      body[data-theme="lighthouse"] main section:has(+ #downloads)::before {
        -webkit-mask-image: radial-gradient(ellipse 80% 62% at 50% 52%, transparent 0 62%, #000 100%);
        mask-image: radial-gradient(ellipse 80% 62% at 50% 52%, transparent 0 62%, #000 100%);
      }
    }

    body[data-theme="lighthouse"] main section:has(+ #downloads)::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 20px;
      pointer-events: none;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='20' viewBox='0 0 48 20'%3E%3Cpath d='M0 12h16a8 8 0 1 1 16 0h16v8H0z' fill='%23e3a92f'/%3E%3Cpath d='M0 12h16a8 8 0 1 1 16 0h16' fill='none' stroke='%23fff0b3' stroke-opacity='.55' stroke-width='1.2'/%3E%3C/svg%3E") repeat-x;
    }

    /* ---- Title: the logo's yellow-to-orange lettering with its dark outline ---- */
    body[data-theme="lighthouse"] main section:has(+ #downloads) h1 {
      display: inline-block;
      transform: rotate(-2deg);
      letter-spacing: 0.01em;
      background: linear-gradient(180deg, #ffe066 0%, #f7b733 55%, #e8892b 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      -webkit-text-stroke: 2px var(--lh-ink);
      paint-order: stroke fill;
      filter:
        drop-shadow(3px 3px 0 var(--lh-ink))
        drop-shadow(0 6px 14px oklch(0 0 0 / 0.4));
    }

    body[data-theme="lighthouse"] main section:has(+ #downloads) h1 + p {
      color: var(--lh-gold);
      text-shadow: 0 2px 0 var(--lh-ink);
    }

    /* Game icon: bobbing like the HUD collectibles */
    body[data-theme="lighthouse"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl {
      border-radius: 1.25rem;
      border: 4px solid var(--lh-gold);
      box-shadow:
        0 0 0 3px var(--lh-ink),
        0 10px 0 oklch(0.22 0.08 265 / 0.7),
        0 0 30px oklch(0.84 0.16 90 / 0.3);
      animation: lh-bob 2.6s ease-in-out infinite;
    }

    @keyframes lh-bob {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-7px) rotate(2deg); }
    }

    /* ---- Section titles: a Jiggy and the HUD's outlined lettering ---- */
    body[data-theme="lighthouse"] main section > .container > h2 {
      display: inline-flex;
      align-items: center;
      gap: 0.45em;
      transform: rotate(-1deg);
      color: oklch(0.88 0.16 92);
      -webkit-text-stroke: 1.2px var(--lh-ink);
      paint-order: stroke fill;
      text-shadow: 2px 3px 0 var(--lh-ink);
    }

    body[data-theme="lighthouse"] main section > .container > h2::before {
      content: '';
      width: 1.1em;
      height: 1.1em;
      background: var(--lh-jiggy) center / contain no-repeat;
      filter: drop-shadow(1px 2px 0 var(--lh-ink));
    }

    /* ---- Panels: Rare's chunky rounded cards ---- */
    body[data-theme="lighthouse"] #downloads .container > .rounded-xl,
    body[data-theme="lighthouse"] #older-versions .rounded-xl.border,
    body[data-theme="lighthouse"] #other-games a.rounded-lg {
      background: oklch(0.23 0.045 222);
      border: 3px solid var(--lh-ink);
      border-radius: 1.25rem;
      box-shadow:
        inset 0 0 0 2px oklch(0.34 0.06 222),
        0 6px 0 oklch(0.22 0.08 265 / 0.8),
        0 14px 26px oklch(0 0 0 / 0.35);
    }

    body[data-theme="lighthouse"] #downloads .container > .rounded-xl .rounded-xl.border {
      background: oklch(0.14 0.035 225 / 0.6);
      border: 2px solid var(--lh-ink);
      border-radius: 0.9rem;
    }

    /* Honeycomb health sitting on the top edge of the release card */
    body[data-theme="lighthouse"] #downloads .container > .rounded-xl {
      position: relative;
    }

    body[data-theme="lighthouse"] #downloads .container > .rounded-xl::before {
      content: '';
      position: absolute;
      top: -18px;
      left: 26px;
      width: 62px;
      height: 40px;
      pointer-events: none;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 62 40'%3E%3Cg fill='%23f2b33a' stroke='%23332a66' stroke-width='2' stroke-linejoin='round'%3E%3Cpath d='M16 3l10 5.5v11L16 25 6 19.5v-11z'/%3E%3Cpath d='M38 3l10 5.5v11L38 25l-10-5.5v-11z'/%3E%3Cpath d='M27 15l10 5.5v11L27 37l-10-5.5v-11z'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat;
      filter: drop-shadow(0 3px 4px oklch(0 0 0 / 0.45));
    }

    /* ---- Download buttons ---- */
    body[data-theme="lighthouse"] #downloads a.rounded-lg.border,
    body[data-theme="lighthouse"] #older-versions a.rounded-lg.border {
      background: oklch(0.18 0.04 225);
      border: 2px solid var(--lh-ink);
      border-radius: 0.9rem;
      box-shadow: 0 3px 0 var(--lh-ink);
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }

    body[data-theme="lighthouse"] #downloads a.rounded-lg.border:hover,
    body[data-theme="lighthouse"] #older-versions a.rounded-lg.border:hover {
      transform: translateY(-2px);
      border-color: var(--lh-gold);
      box-shadow: 0 5px 0 var(--lh-ink);
    }

    body[data-theme="lighthouse"] #downloads a.rounded-lg.border:hover svg,
    body[data-theme="lighthouse"] #older-versions a.rounded-lg.border:hover svg {
      color: var(--lh-gold);
    }

    /* ---- Older versions: honeycomb rows frame the band, a Jinjo colour per release ---- */
    body[data-theme="lighthouse"] #older-versions {
      position: relative;
      background: oklch(0.13 0.035 225 / 0.55);
    }

    body[data-theme="lighthouse"] #older-versions::before,
    body[data-theme="lighthouse"] #older-versions::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 18px;
      pointer-events: none;
      background: var(--lh-honeycomb) repeat-x;
    }

    body[data-theme="lighthouse"] #older-versions::before { top: 0; }
    body[data-theme="lighthouse"] #older-versions::after { bottom: 0; }

    body[data-theme="lighthouse"] #older-versions .rounded-xl.border {
      border-left: 8px solid var(--lh-jinjo, var(--lh-gold));
    }

    body[data-theme="lighthouse"] #older-versions .rounded-xl.border:nth-child(5n+1) { --lh-jinjo: var(--lh-jinjo-yellow); }
    body[data-theme="lighthouse"] #older-versions .rounded-xl.border:nth-child(5n+2) { --lh-jinjo: var(--lh-jinjo-orange); }
    body[data-theme="lighthouse"] #older-versions .rounded-xl.border:nth-child(5n+3) { --lh-jinjo: var(--lh-jinjo-blue); }
    body[data-theme="lighthouse"] #older-versions .rounded-xl.border:nth-child(5n+4) { --lh-jinjo: var(--lh-jinjo-green); }
    body[data-theme="lighthouse"] #older-versions .rounded-xl.border:nth-child(5n+5) { --lh-jinjo: var(--lh-jinjo-pink); }

    /* ---- Other ports: Jinjo-coloured tops, a wobble on hover ---- */
    body[data-theme="lighthouse"] #other-games a.rounded-lg {
      border-top: 5px solid var(--lh-jinjo, var(--lh-gold));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    body[data-theme="lighthouse"] #other-games a.rounded-lg:nth-child(5n+1) { --lh-jinjo: var(--lh-jinjo-yellow); }
    body[data-theme="lighthouse"] #other-games a.rounded-lg:nth-child(5n+2) { --lh-jinjo: var(--lh-jinjo-orange); }
    body[data-theme="lighthouse"] #other-games a.rounded-lg:nth-child(5n+3) { --lh-jinjo: var(--lh-jinjo-blue); }
    body[data-theme="lighthouse"] #other-games a.rounded-lg:nth-child(5n+4) { --lh-jinjo: var(--lh-jinjo-green); }
    body[data-theme="lighthouse"] #other-games a.rounded-lg:nth-child(5n+5) { --lh-jinjo: var(--lh-jinjo-pink); }

    body[data-theme="lighthouse"] #other-games a.rounded-lg:hover {
      transform: translate(-2px, -4px) rotate(-1deg);
      box-shadow:
        inset 0 0 0 2px oklch(0.34 0.06 222),
        0 10px 0 oklch(0.22 0.08 265 / 0.8),
        0 20px 30px oklch(0 0 0 / 0.4);
    }
  `
};
