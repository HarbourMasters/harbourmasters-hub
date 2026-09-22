import { Theme } from '@/types/theme';

// SpaghettiKart Theme (Mario Kart 64)
// Rainbow Road at night: a starry sky with the road sweeping behind the hero
// and its rainbow surface as the hero's floor, chequered finish lines framing
// the older versions, a race-result position on every release, an item box
// on the release card, and the game icon riding inside a shimmering item box.

export const spaghettiTheme: Theme = {
  id: 'spaghetti',
  name: 'SpaghettiKart',
  description: 'Rainbow Road, chequered finish lines and item-box shimmer',

  colors: {
    primary: 'oklch(0.62 0.21 28)',         // Mario red
    secondary: 'oklch(0.55 0.16 260)',      // Kart blue
    accent: 'oklch(0.87 0.17 95)',          // Star yellow
    background: 'oklch(0.15 0.05 285)',     // Rainbow Road space
    surface: 'oklch(0.22 0.06 282)',        // Pit lane
    surfaceHover: 'oklch(0.28 0.07 280)',   // Lit pit lane
    text: 'oklch(0.97 0.01 90)',            // White
    textMuted: 'oklch(0.76 0.04 280)',      // Grandstand grey
    border: 'oklch(0.40 0.09 280)',         // Guard rail
    success: 'oklch(0.72 0.18 145)',        // Green shell
    warning: 'oklch(0.87 0.17 95)',         // Star
    error: 'oklch(0.62 0.21 28)'            // Red shell
  },

  fonts: {
    display: "'Russo One', 'Arial Black', sans-serif",
    body: "'Titillium Web', system-ui, sans-serif"
  },

  pattern: {
    type: 'checkerboard',
    colors: [
      'oklch(0.14 0.03 280)',
      'oklch(0.96 0.01 90)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.15 0.05 285) 0%, oklch(0.22 0.06 282) 50%, oklch(0.30 0.10 300) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.62 0.21 28), oklch(0.87 0.17 95))',
    text: 'linear-gradient(90deg, oklch(0.62 0.21 28), oklch(0.72 0.18 55), oklch(0.87 0.17 95), oklch(0.72 0.18 145), oklch(0.62 0.16 255), oklch(0.58 0.20 305))'
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.9rem',
    full: '9999px'
  },

  animations: {
    pulse: 'sk-itembox 3s ease-in-out infinite',
    glow: 'sk-shimmer 4s linear infinite'
  },

  customCSS: `
    body[data-theme="spaghetti"] {
      --sk-red: oklch(0.62 0.21 28);
      --sk-orange: oklch(0.72 0.18 55);
      --sk-yellow: oklch(0.87 0.17 95);
      --sk-green: oklch(0.72 0.18 145);
      --sk-blue: oklch(0.62 0.16 255);
      --sk-violet: oklch(0.58 0.20 305);
      --sk-ink: oklch(0.13 0.05 285);
      --sk-rainbow: linear-gradient(90deg, var(--sk-red), var(--sk-orange), var(--sk-yellow), var(--sk-green), var(--sk-blue), var(--sk-violet));
      --sk-checker: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23141a2e'/%3E%3Crect width='8' height='8' fill='%23f4f1ea'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23f4f1ea'/%3E%3C/svg%3E");
      --sk-flag: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 20'%3E%3Cpath d='M3 1v18' stroke='%23f4f1ea' stroke-width='2' stroke-linecap='round'/%3E%3Crect x='5.0' y='2' width='4.5' height='4' fill='%23f4f1ea'/%3E%3Crect x='9.5' y='2' width='4.5' height='4' fill='%23141a2e'/%3E%3Crect x='14.0' y='2' width='4.5' height='4' fill='%23f4f1ea'/%3E%3Crect x='18.5' y='2' width='4.5' height='4' fill='%23141a2e'/%3E%3Crect x='5.0' y='6' width='4.5' height='4' fill='%23141a2e'/%3E%3Crect x='9.5' y='6' width='4.5' height='4' fill='%23f4f1ea'/%3E%3Crect x='14.0' y='6' width='4.5' height='4' fill='%23141a2e'/%3E%3Crect x='18.5' y='6' width='4.5' height='4' fill='%23f4f1ea'/%3E%3Crect x='5.0' y='10' width='4.5' height='4' fill='%23f4f1ea'/%3E%3Crect x='9.5' y='10' width='4.5' height='4' fill='%23141a2e'/%3E%3Crect x='14.0' y='10' width='4.5' height='4' fill='%23f4f1ea'/%3E%3Crect x='18.5' y='10' width='4.5' height='4' fill='%23141a2e'/%3E%3Crect x='5' y='2' width='18' height='12' fill='none' stroke='%23141a2e' stroke-width='1.2'/%3E%3C/svg%3E");
      font-synthesis-weight: none;

      /* The night sky above Rainbow Road */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ccircle cx='124' cy='38' r='0.9' fill='%23c8e6ff' opacity='0.58'/%3E%3Ccircle cx='172' cy='229' r='1.2' fill='%23fff' opacity='0.43'/%3E%3Ccircle cx='211' cy='150' r='0.8' fill='%23c8e6ff' opacity='0.36'/%3E%3Ccircle cx='56' cy='123' r='1.3' fill='%23fff' opacity='0.47'/%3E%3Ccircle cx='27' cy='103' r='1.3' fill='%23fff' opacity='0.5'/%3E%3Ccircle cx='118' cy='61' r='1.1' fill='%23c8e6ff' opacity='0.46'/%3E%3Ccircle cx='126' cy='23' r='0.9' fill='%23fff' opacity='0.63'/%3E%3Ccircle cx='219' cy='31' r='0.9' fill='%23ffe9a3' opacity='0.35'/%3E%3Ccircle cx='134' cy='293' r='1.0' fill='%23c8e6ff' opacity='0.36'/%3E%3Ccircle cx='104' cy='94' r='0.9' fill='%23ffe9a3' opacity='0.47'/%3E%3Ccircle cx='13' cy='61' r='1.1' fill='%23fff' opacity='0.69'/%3E%3Ccircle cx='261' cy='191' r='1.3' fill='%23c8e6ff' opacity='0.61'/%3E%3Ccircle cx='184' cy='168' r='1.3' fill='%23fff' opacity='0.44'/%3E%3Ccircle cx='82' cy='193' r='0.9' fill='%23fff' opacity='0.53'/%3E%3Ccircle cx='154' cy='279' r='1.3' fill='%23fff' opacity='0.41'/%3E%3C/svg%3E");
      background-size: 300px 300px;
    }

    /* The global ::selection text is near-white, unreadable on star yellow */
    body[data-theme="spaghetti"] ::selection {
      color: var(--sk-ink);
    }

    /* ---- Hero: Rainbow Road sweeping behind the title, its surface as the floor ---- */
    body[data-theme="spaghetti"] main section:has(+ #downloads) {
      padding-bottom: 3.25rem;
    }

    body[data-theme="spaghetti"] main section:has(+ #downloads)::before {
      content: '';
      position: absolute;
      left: -10%;
      right: -10%;
      top: 56%;
      height: 120px;
      pointer-events: none;
      transform: rotate(-6deg);
      background: var(--sk-rainbow);
      background-size: 200% 100%;
      opacity: 0.22;
      filter: blur(1px);
      -webkit-mask-image: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent);
      mask-image: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent);
      animation: sk-shimmer 12s linear infinite;
    }

    @keyframes sk-shimmer {
      from { background-position: 0 0; }
      to { background-position: 200% 0; }
    }

    body[data-theme="spaghetti"] main section:has(+ #downloads)::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 18px;
      pointer-events: none;
      border-top: 2px solid var(--sk-ink);
      background: linear-gradient(180deg,
        var(--sk-red) 0 16.6%, var(--sk-orange) 16.6% 33.3%, var(--sk-yellow) 33.3% 50%,
        var(--sk-green) 50% 66.6%, var(--sk-blue) 66.6% 83.3%, var(--sk-violet) 83.3% 100%);
    }

    /* ---- Title: rainbow lettering leaning into the corner ---- */
    body[data-theme="spaghetti"] main section:has(+ #downloads) h1 {
      display: inline-block;
      transform: skewX(-8deg);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      background: var(--sk-rainbow);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      -webkit-text-stroke: 2px var(--sk-ink);
      paint-order: stroke fill;
      filter:
        drop-shadow(4px 4px 0 var(--sk-ink))
        drop-shadow(0 8px 16px oklch(0 0 0 / 0.45));
    }

    body[data-theme="spaghetti"] main section:has(+ #downloads) h1 + p {
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 1rem;
      color: var(--sk-yellow);
      text-shadow: 0 2px 0 var(--sk-ink);
    }

    body[data-theme="spaghetti"] main section:has(+ #downloads) h1 + p::before {
      content: '';
      width: 1.3em;
      height: 1.1em;
      background: var(--sk-flag) center / contain no-repeat;
    }

    /* Game icon: the kart sits inside an item box, its rainbow shimmer cycling */
    body[data-theme="spaghetti"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl {
      border: 3px solid var(--sk-ink);
      box-shadow:
        0 0 0 2px oklch(1 0 0 / 0.35),
        0 12px 30px oklch(0 0 0 / 0.5),
        0 0 36px oklch(0.87 0.17 95 / 0.25);
      animation: sk-itembox 3s ease-in-out infinite;
    }

    /* The box's transform makes it a stacking context, so this fills it just under the icon */
    body[data-theme="spaghetti"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background:
        linear-gradient(135deg, oklch(1 0 0 / 0.35), transparent 45%, oklch(0 0 0 / 0.25)),
        conic-gradient(from 0deg, var(--sk-red), var(--sk-orange), var(--sk-yellow), var(--sk-green), var(--sk-blue), var(--sk-violet), var(--sk-red));
      animation: sk-hue 4s linear infinite;
    }

    @keyframes sk-hue {
      from { filter: hue-rotate(0deg); }
      to { filter: hue-rotate(360deg); }
    }

    @keyframes sk-itembox {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-6px) rotate(2deg); }
    }

    /* ---- Section titles: chequered flag, leaning, with speed lines trailing ---- */
    body[data-theme="spaghetti"] main section > .container > h2 {
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      transform: skewX(-8deg);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      text-shadow: 3px 3px 0 var(--sk-ink);
    }

    body[data-theme="spaghetti"] main section > .container > h2::before {
      content: '';
      width: 1.2em;
      height: 1em;
      background: var(--sk-flag) center / contain no-repeat;
      filter: drop-shadow(2px 2px 0 var(--sk-ink));
    }

    body[data-theme="spaghetti"] main section > .container > h2::after {
      content: '';
      width: 2.6em;
      height: 14px;
      background: repeating-linear-gradient(180deg, var(--sk-yellow) 0 2px, transparent 2px 6px);
      -webkit-mask-image: linear-gradient(90deg, #000, transparent);
      mask-image: linear-gradient(90deg, #000, transparent);
      opacity: 0.8;
    }

    /* ---- Panels: pit-lane cards with a rainbow trim ---- */
    body[data-theme="spaghetti"] #downloads .container > .rounded-xl,
    body[data-theme="spaghetti"] #older-versions .rounded-xl.border,
    body[data-theme="spaghetti"] #other-games a.rounded-lg {
      position: relative;
      background: linear-gradient(180deg, oklch(0.23 0.06 282), oklch(0.17 0.055 284));
      border: 2px solid var(--sk-ink);
      border-radius: 0.9rem;
      box-shadow:
        inset 0 0 0 1px oklch(0.40 0.09 280 / 0.5),
        0 12px 28px oklch(0 0 0 / 0.45);
    }

    body[data-theme="spaghetti"] #downloads .container > .rounded-xl::after,
    body[data-theme="spaghetti"] #other-games a.rounded-lg::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 4px;
      border-radius: 0.9rem 0.9rem 0 0;
      background: var(--sk-rainbow);
      pointer-events: none;
    }

    body[data-theme="spaghetti"] #downloads .container > .rounded-xl .rounded-xl.border {
      background: oklch(0.11 0.05 285 / 0.6);
      border: 2px solid var(--sk-ink);
    }

    /* The item box sitting on the top edge of the release card, in front of the rainbow trim */
    body[data-theme="spaghetti"] #downloads .container > .rounded-xl::before {
      content: '';
      position: absolute;
      z-index: 1;
      top: -24px;
      left: 28px;
      width: 44px;
      height: 44px;
      pointer-events: none;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23ff5d4d'/%3E%3Cstop offset='.25' stop-color='%23ffd75e'/%3E%3Cstop offset='.5' stop-color='%2379e07c'/%3E%3Cstop offset='.75' stop-color='%235aa9ff'/%3E%3Cstop offset='1' stop-color='%23c46bff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='4' y='4' width='40' height='40' rx='9' fill='url(%23g)' fill-opacity='.9' stroke='%23141a2e' stroke-width='3'/%3E%3Crect x='9' y='9' width='30' height='30' rx='6' fill='none' stroke='%23fff' stroke-opacity='.45' stroke-width='2'/%3E%3Ctext x='24' y='35' font-family='Arial Black, Arial, sans-serif' font-size='28' font-weight='900' text-anchor='middle' fill='%23fff' stroke='%23141a2e' stroke-width='2' paint-order='stroke'%3E%3F%3C/text%3E%3C/svg%3E") center / contain no-repeat;
      filter: drop-shadow(0 4px 6px oklch(0 0 0 / 0.5));
      animation: sk-itembox 3s ease-in-out infinite;
    }

    /* ---- Download buttons: boost off the line on hover ---- */
    body[data-theme="spaghetti"] #downloads a.rounded-lg.border,
    body[data-theme="spaghetti"] #older-versions a.rounded-lg.border {
      background: oklch(0.12 0.05 285 / 0.7);
      border: 2px solid var(--sk-ink);
      border-radius: 0.75rem;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }

    body[data-theme="spaghetti"] #downloads a.rounded-lg.border:hover,
    body[data-theme="spaghetti"] #older-versions a.rounded-lg.border:hover {
      transform: translateX(4px);
      border-color: var(--sk-yellow);
      box-shadow:
        -7px 0 0 -2px oklch(0.87 0.17 95 / 0.4),
        -14px 0 0 -4px oklch(0.87 0.17 95 / 0.2);
    }

    body[data-theme="spaghetti"] #downloads a.rounded-lg.border:hover svg,
    body[data-theme="spaghetti"] #older-versions a.rounded-lg.border:hover svg {
      color: var(--sk-yellow);
    }

    /* ---- Older versions: chequered finish lines, race positions on every release ---- */
    body[data-theme="spaghetti"] #older-versions {
      position: relative;
      background: oklch(0.11 0.05 285 / 0.5);
    }

    body[data-theme="spaghetti"] #older-versions::before,
    body[data-theme="spaghetti"] #older-versions::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 16px;
      pointer-events: none;
      background: var(--sk-checker) repeat-x;
      opacity: 0.85;
    }

    body[data-theme="spaghetti"] #older-versions::before { top: 0; }
    body[data-theme="spaghetti"] #older-versions::after { bottom: 0; }

    body[data-theme="spaghetti"] #older-versions .space-y-4 {
      counter-reset: rank;
    }

    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border {
      counter-increment: rank;
    }

    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border::before {
      content: counter(rank) 'th';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 0.95rem;
      color: oklch(0.76 0.04 280);
      background: oklch(0.11 0.05 285 / 0.55);
      border-right: 2px solid var(--sk-ink);
      pointer-events: none;
    }

    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border:nth-child(10n+1):not(:nth-child(11))::before { content: counter(rank) 'st'; }
    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border:nth-child(10n+2):not(:nth-child(12))::before { content: counter(rank) 'nd'; }
    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border:nth-child(10n+3):not(:nth-child(13))::before { content: counter(rank) 'rd'; }

    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border:nth-child(1)::before {
      color: oklch(0.87 0.17 95);
      text-shadow: 0 0 10px oklch(0.87 0.17 95 / 0.6);
    }
    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border:nth-child(2)::before { color: oklch(0.86 0.01 260); }
    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border:nth-child(3)::before { color: oklch(0.70 0.12 60); }

    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border > button,
    body[data-theme="spaghetti"] #older-versions .space-y-4 > .rounded-xl.border > .border-t {
      padding-left: 4.2rem;
    }

    /* ---- Other ports: pull ahead on hover ---- */
    body[data-theme="spaghetti"] #other-games a.rounded-lg {
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    body[data-theme="spaghetti"] #other-games a.rounded-lg::after {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    body[data-theme="spaghetti"] #other-games a.rounded-lg:hover {
      transform: translateX(5px);
      border-color: var(--sk-yellow);
      box-shadow:
        -8px 0 0 -3px oklch(0.87 0.17 95 / 0.4),
        0 14px 28px oklch(0 0 0 / 0.5);
    }

    body[data-theme="spaghetti"] #other-games a.rounded-lg:hover::after {
      opacity: 1;
    }
  `
};
