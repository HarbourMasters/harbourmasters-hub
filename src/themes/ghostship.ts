import { Theme } from '@/types/theme';

// Ghostship Theme (Super Mario 64)
// A night sky over Peach's Castle: Power Stars and coins twinkling around the
// hero, the castle's brickwork as the hero's floor, and the logo's red, blue,
// yellow and green letters. The game icon hangs like a painting you could jump
// into, and the chunky bordered panels echo the game's course-select cards.

export const ghostshipTheme: Theme = {
  id: 'ghostship',
  name: 'Ghostship',
  description: 'Power Stars over Peach\'s Castle with the logo\'s four-colour lettering',

  colors: {
    primary: 'oklch(0.60 0.21 27)',         // Mario red
    secondary: 'oklch(0.52 0.17 255)',      // Mario blue
    accent: 'oklch(0.86 0.17 95)',          // Power Star yellow
    background: 'oklch(0.17 0.05 262)',     // Night over the castle
    surface: 'oklch(0.24 0.06 260)',        // Deep sky
    surfaceHover: 'oklch(0.30 0.07 258)',   // Lighter sky
    text: 'oklch(0.97 0.01 90)',            // Cloud white
    textMuted: 'oklch(0.76 0.04 250)',      // Dusk blue
    border: 'oklch(0.40 0.08 258)',         // Sky border
    success: 'oklch(0.72 0.18 140)',        // Warp-pipe green
    warning: 'oklch(0.86 0.17 95)',         // Star yellow
    error: 'oklch(0.60 0.21 27)'            // Mario red
  },

  fonts: {
    display: "'Titan One', 'Arial Black', sans-serif",
    body: "'Nunito', system-ui, sans-serif"
  },

  pattern: {
    type: 'stars',
    colors: [
      'oklch(from var(--color-accent) l c h / 0.8)',
      'oklch(0.97 0.01 90 / 0.5)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.17 0.05 262) 0%, oklch(0.24 0.06 260) 50%, oklch(0.30 0.09 250) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.60 0.21 27), oklch(0.86 0.17 95))',
    text: 'linear-gradient(90deg, oklch(0.60 0.21 27), oklch(0.62 0.17 255), oklch(0.86 0.17 95), oklch(0.70 0.18 140))'
  },

  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1.1rem',
    full: '9999px'
  },

  animations: {
    pulse: 'gs-coin 2.6s ease-in-out infinite',
    glow: 'gs-twinkle 3s ease-in-out infinite'
  },

  customCSS: `
    body[data-theme="ghostship"] {
      --gs-red: oklch(0.60 0.21 27);
      --gs-blue: oklch(0.62 0.17 255);
      --gs-yellow: oklch(0.86 0.17 95);
      --gs-green: oklch(0.70 0.18 140);
      --gs-ink: oklch(0.13 0.05 265);
      --gs-star: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-16 -16 32 32'%3E%3Cpath d='M0-14 3.29-4.53 13.31-4.33 5.33 1.73 8.23 11.33 0 5.6-8.23 11.33-5.33 1.73-13.31-4.33-3.29-4.53z' fill='%23ffd23f' stroke='%23161d45' stroke-width='1.6' stroke-linejoin='round'/%3E%3Ccircle cx='-3' cy='-3.4' r='1.3' fill='%23161d45'/%3E%3Ccircle cx='3' cy='-3.4' r='1.3' fill='%23161d45'/%3E%3C/svg%3E");
      font-synthesis-weight: none;

      /* A starry sky, Bowser-in-the-Sky style */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='%23fff'%3E%3Ccircle cx='22' cy='28' r='1' opacity='.5'/%3E%3Ccircle cx='110' cy='14' r='.8' opacity='.4'/%3E%3Ccircle cx='170' cy='62' r='1.2' opacity='.55'/%3E%3Ccircle cx='224' cy='30' r='.8' opacity='.4'/%3E%3Ccircle cx='64' cy='96' r='.9' opacity='.45'/%3E%3Ccircle cx='200' cy='120' r='1' opacity='.5'/%3E%3Ccircle cx='128' cy='150' r='.7' opacity='.35'/%3E%3Ccircle cx='30' cy='186' r='1.1' opacity='.5'/%3E%3Ccircle cx='232' cy='190' r='.8' opacity='.4'/%3E%3Ccircle cx='160' cy='214' r='1' opacity='.5'/%3E%3Ccircle cx='90' cy='226' r='.8' opacity='.4'/%3E%3C/g%3E%3C/svg%3E");
      background-size: 240px 240px;
    }

    /* The global ::selection text is near-white, unreadable on star yellow */
    body[data-theme="ghostship"] ::selection {
      color: var(--gs-ink);
    }

    /* ---- Hero: Power Stars and coins twinkling, castle brickwork underfoot ---- */
    body[data-theme="ghostship"] main section:has(+ #downloads) {
      padding-bottom: 3.25rem;
    }

    body[data-theme="ghostship"] main section:has(+ #downloads)::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-size: 360px 360px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='360'%3E%3Cdefs%3E%3Cpath id='s' d='M0-14 3.29-4.53 13.31-4.33 5.33 1.73 8.23 11.33 0 5.6-8.23 11.33-5.33 1.73-13.31-4.33-3.29-4.53z'/%3E%3C/defs%3E%3Cg fill='%23ffd23f' stroke='%23161d45' stroke-width='1.6' stroke-linejoin='round'%3E%3Cuse href='%23s' transform='translate(40 48) rotate(-12)'/%3E%3Cuse href='%23s' transform='translate(300 70) rotate(18) scale(.8)'/%3E%3Cuse href='%23s' transform='translate(180 300) rotate(8) scale(1.1)'/%3E%3Cuse href='%23s' transform='translate(70 250) rotate(-20) scale(.7)'/%3E%3Cuse href='%23s' transform='translate(330 210) rotate(25) scale(.9)'/%3E%3C/g%3E%3Cg fill='%23161d45'%3E%3Ccircle cx='37' cy='45' r='1.3'/%3E%3Ccircle cx='43' cy='45' r='1.3'/%3E%3Ccircle cx='177' cy='296' r='1.4'/%3E%3Ccircle cx='183.5' cy='296' r='1.4'/%3E%3C/g%3E%3Cg fill='%23f7c231' stroke='%23a56a00' stroke-width='1.5'%3E%3Cellipse cx='120' cy='130' rx='5' ry='7'/%3E%3Cellipse cx='260' cy='160' rx='4' ry='7'/%3E%3Cellipse cx='140' cy='30' rx='5' ry='7'/%3E%3Cellipse cx='230' cy='330' rx='3' ry='7'/%3E%3C/g%3E%3C/svg%3E");
      /* Keep the sky clear behind the title */
      -webkit-mask-image: radial-gradient(ellipse 56% 70% at 50% 46%, transparent 0 58%, #000 100%);
      mask-image: radial-gradient(ellipse 56% 70% at 50% 46%, transparent 0 58%, #000 100%);
      animation: gs-twinkle 3s ease-in-out infinite;
    }

    @keyframes gs-twinkle {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    /* On phones the description spans the full width, so clear a wider lane */
    @media (max-width: 640px) {
      body[data-theme="ghostship"] main section:has(+ #downloads)::before {
        -webkit-mask-image: radial-gradient(ellipse 80% 62% at 50% 52%, transparent 0 62%, #000 100%);
        mask-image: radial-gradient(ellipse 80% 62% at 50% 52%, transparent 0 62%, #000 100%);
      }
    }

    body[data-theme="ghostship"] main section:has(+ #downloads)::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 18px;
      pointer-events: none;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='18' viewBox='0 0 64 18'%3E%3Crect width='64' height='18' fill='%23463d2e'/%3E%3Crect x='1' y='1' width='30' height='7' fill='%23b8ab8f'/%3E%3Crect x='33' y='1' width='30' height='7' fill='%23b8ab8f'/%3E%3Crect x='-15' y='10' width='30' height='7' fill='%23a99c81'/%3E%3Crect x='17' y='10' width='30' height='7' fill='%23a99c81'/%3E%3Crect x='49' y='10' width='30' height='7' fill='%23a99c81'/%3E%3C/svg%3E") repeat-x;
    }

    /* ---- Title: the logo's four colours with a dark 3D edge ---- */
    body[data-theme="ghostship"] main section:has(+ #downloads) h1 {
      display: inline-block;
      letter-spacing: 0.02em;
      background: linear-gradient(90deg, var(--gs-red) 0 25%, var(--gs-blue) 25% 50%, var(--gs-yellow) 50% 75%, var(--gs-green) 75% 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      -webkit-text-stroke: 2px var(--gs-ink);
      paint-order: stroke fill;
      filter:
        drop-shadow(3px 4px 0 var(--gs-ink))
        drop-shadow(0 6px 12px oklch(0 0 0 / 0.4));
    }

    body[data-theme="ghostship"] main section:has(+ #downloads) h1 + p {
      color: var(--gs-yellow);
      text-shadow: 0 2px 0 var(--gs-ink);
    }

    /* Game icon: a framed castle painting, rippling like it's ready to be jumped into */
    body[data-theme="ghostship"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl {
      border-radius: 10px;
      border: 5px solid oklch(0.78 0.12 80);
      outline: 2px solid oklch(0.52 0.10 70);
      box-shadow:
        0 8px 0 var(--gs-ink),
        0 14px 30px oklch(0 0 0 / 0.5),
        inset 0 0 26px oklch(0 0 0 / 0.35);
      animation: gs-ripple 5s ease-in-out infinite;
    }

    @keyframes gs-ripple {
      0%, 100% { transform: skewX(0deg) scale(1); }
      30% { transform: skewX(1.2deg) scale(1.012); }
      70% { transform: skewX(-1.2deg) scale(0.99); }
    }

    /* ---- Section titles: HUD lettering with a Power Star ---- */
    body[data-theme="ghostship"] main section > .container > h2 {
      display: inline-flex;
      align-items: center;
      gap: 0.45em;
      color: var(--gs-yellow);
      letter-spacing: 0.02em;
      -webkit-text-stroke: 1.2px var(--gs-ink);
      paint-order: stroke fill;
      text-shadow: 2px 3px 0 var(--gs-ink);
    }

    body[data-theme="ghostship"] main section > .container > h2::before {
      content: '';
      width: 1.15em;
      height: 1.15em;
      background: var(--gs-star) center / contain no-repeat;
      filter: drop-shadow(2px 2px 0 var(--gs-ink));
    }

    /* ---- Panels: chunky course-select cards ---- */
    body[data-theme="ghostship"] #downloads .container > .rounded-xl,
    body[data-theme="ghostship"] #older-versions .rounded-xl.border,
    body[data-theme="ghostship"] #other-games a.rounded-lg {
      background: oklch(0.24 0.06 260);
      border: 3px solid var(--gs-ink);
      border-radius: 1.1rem;
      box-shadow:
        inset 0 0 0 2px oklch(0.36 0.08 258),
        0 7px 0 var(--gs-ink),
        0 14px 26px oklch(0 0 0 / 0.35);
    }

    body[data-theme="ghostship"] #downloads .container > .rounded-xl .rounded-xl.border {
      background: oklch(0.15 0.05 262 / 0.6);
      border: 2px solid var(--gs-ink);
    }

    /* A coin spinning on the top edge of the release card */
    body[data-theme="ghostship"] #downloads .container > .rounded-xl {
      position: relative;
    }

    body[data-theme="ghostship"] #downloads .container > .rounded-xl::before {
      content: '';
      position: absolute;
      top: -16px;
      right: 30px;
      width: 26px;
      height: 32px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #fff0a8, #f2c230 55%, #c9950f);
      border: 3px solid var(--gs-ink);
      box-shadow: inset 0 0 0 2px #d9a516;
      animation: gs-coin 2.6s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes gs-coin {
      0%, 100% { transform: scaleX(1); }
      50% { transform: scaleX(0.15); }
    }

    /* ---- Download buttons: blocky, pop up on hover ---- */
    body[data-theme="ghostship"] #downloads a.rounded-lg.border,
    body[data-theme="ghostship"] #older-versions a.rounded-lg.border {
      background: oklch(0.20 0.055 262);
      border: 3px solid var(--gs-ink);
      border-radius: 0.9rem;
      box-shadow: 0 4px 0 var(--gs-ink);
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }

    body[data-theme="ghostship"] #downloads a.rounded-lg.border:hover,
    body[data-theme="ghostship"] #older-versions a.rounded-lg.border:hover {
      transform: translateY(-2px);
      border-color: var(--gs-yellow);
      box-shadow: 0 6px 0 var(--gs-ink);
    }

    body[data-theme="ghostship"] #downloads a.rounded-lg.border:hover svg,
    body[data-theme="ghostship"] #older-versions a.rounded-lg.border:hover svg {
      color: var(--gs-yellow);
    }

    /* ---- Older versions: every release earns a star ---- */
    body[data-theme="ghostship"] #older-versions {
      background: oklch(0.14 0.05 262 / 0.55);
      border-top: 3px solid var(--gs-ink);
      border-bottom: 3px solid var(--gs-ink);
    }

    body[data-theme="ghostship"] #older-versions .rounded-xl.border {
      position: relative;
    }

    body[data-theme="ghostship"] #older-versions .rounded-xl.border > button {
      padding-left: 3.2rem;
    }

    body[data-theme="ghostship"] #older-versions .rounded-xl.border::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 18px;
      width: 24px;
      height: 24px;
      background: var(--gs-star) center / contain no-repeat;
      filter: drop-shadow(1px 2px 0 var(--gs-ink));
      transition: transform 0.3s ease;
      pointer-events: none;
    }

    body[data-theme="ghostship"] #older-versions .rounded-xl.border:hover::before {
      transform: rotate(72deg) scale(1.15);
    }

    /* ---- Other ports: a coloured base each, in the logo's order ---- */
    body[data-theme="ghostship"] #other-games a.rounded-lg {
      border-bottom: 6px solid var(--gs-c, var(--gs-yellow));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    body[data-theme="ghostship"] #other-games a.rounded-lg:nth-child(4n+1) { --gs-c: var(--gs-red); }
    body[data-theme="ghostship"] #other-games a.rounded-lg:nth-child(4n+2) { --gs-c: var(--gs-blue); }
    body[data-theme="ghostship"] #other-games a.rounded-lg:nth-child(4n+3) { --gs-c: var(--gs-yellow); }
    body[data-theme="ghostship"] #other-games a.rounded-lg:nth-child(4n+4) { --gs-c: var(--gs-green); }

    body[data-theme="ghostship"] #other-games a.rounded-lg:hover {
      transform: translateY(-4px);
      box-shadow:
        inset 0 0 0 2px oklch(0.36 0.08 258),
        0 11px 0 var(--gs-ink),
        0 20px 30px oklch(0 0 0 / 0.4);
    }
  `
};
