import { Theme } from '@/types/theme';

// 2ship2Harkinian Theme (The Legend of Zelda: Majora's Mask)
// Termina on the final night: a purple sky of twinkling stars and shooting
// stars, Carnival of Time fireworks bursting in the mask's colours, Clock
// Tower brass, and the three-day clock.
// Section titles are underlined in the mask's colours, the release card wears
// the three-day clock, and the newest versions are stamped Day I, II and III.

export const twoShipTheme: Theme = {
  id: '2ship',
  name: '2ship2Harkinian',
  description: 'Termina\'s final night: Carnival of Time fireworks, Clock Tower brass and the mask\'s colours',

  colors: {
    primary: 'oklch(0.58 0.20 310)',        // Termina purple
    secondary: 'oklch(0.42 0.17 305)',      // Deep violet
    accent: 'oklch(0.84 0.13 92)',          // Moonlight / Clock Tower brass
    background: 'oklch(0.13 0.04 300)',     // Final-night sky
    surface: 'oklch(0.20 0.06 305)',        // Clock Town stone
    surfaceHover: 'oklch(0.26 0.07 305)',   // Lighter stone
    text: 'oklch(0.96 0.015 90)',           // Moonlit white
    textMuted: 'oklch(0.74 0.05 305)',      // Lavender
    border: 'oklch(0.38 0.09 305)',         // Purple border
    success: 'oklch(0.72 0.15 150)',        // Great Fairy green
    warning: 'oklch(0.84 0.13 92)',         // Brass
    error: 'oklch(0.62 0.21 20)'            // The mask's eyes
  },

  fonts: {
    display: "'MedievalSharp', Georgia, serif",
    body: "'Lora', Georgia, serif"
  },

  pattern: {
    type: 'stars',
    colors: [
      'oklch(0.96 0.015 90 / 0.5)',
      'oklch(from var(--color-accent) l c h / 0.4)'
    ]
  },

  gradients: {
    hero: 'linear-gradient(135deg, oklch(0.13 0.04 300) 0%, oklch(0.20 0.06 305) 50%, oklch(0.28 0.09 320) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.58 0.20 310), oklch(0.84 0.13 92))',
    text: 'linear-gradient(90deg, oklch(0.62 0.24 335), oklch(0.75 0.13 190), oklch(0.86 0.16 95), oklch(0.62 0.22 25))'
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },

  animations: {
    glow: 'twoship-tatl 3.2s ease-in-out infinite',
    pulse: 'twoship-tatl 3.2s ease-in-out infinite'
  },

  customCSS: `
    body[data-theme="2ship"] {
      --mm-brass: oklch(0.84 0.13 92);
      --mm-moon: oklch(0.94 0.06 92);
      --mm-ink: oklch(0.12 0.04 300);
      --mm-magenta: oklch(0.62 0.24 335);
      --mm-teal: oklch(0.75 0.13 190);
      --mm-yellow: oklch(0.86 0.16 95);
      --mm-red: oklch(0.62 0.22 25);
      --mm-green: oklch(0.72 0.17 145);
      --mm-blue: oklch(0.60 0.16 260);
      /* The three-day clock: ticks along a brass rail, a dot on every major hour */
      --mm-clock-rail: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='18' viewBox='0 0 48 18'%3E%3Cpath d='M0 14h48' stroke='%23c9a24a' stroke-width='1.5'/%3E%3Cpath d='M6 10v4M12 10v4M18 10v4M30 10v4M36 10v4M42 10v4' stroke='%23c9a24a' stroke-opacity='.7' stroke-width='1.2'/%3E%3Cpath d='M24 5v9' stroke='%23e8c65b' stroke-width='1.8'/%3E%3Ccircle cx='24' cy='4' r='2.2' fill='%23e8c65b'/%3E%3C/svg%3E");
      font-synthesis-weight: none;

      /* Stars over Termina Field */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cg fill='%23fff'%3E%3Ccircle cx='18' cy='30' r='1.1' opacity='.55'/%3E%3Ccircle cx='96' cy='12' r='.8' opacity='.4'/%3E%3Ccircle cx='150' cy='58' r='1.3' opacity='.6'/%3E%3Ccircle cx='230' cy='40' r='.9' opacity='.45'/%3E%3Ccircle cx='60' cy='104' r='.8' opacity='.4'/%3E%3Ccircle cx='198' cy='118' r='1.1' opacity='.5'/%3E%3Ccircle cx='120' cy='150' r='.7' opacity='.35'/%3E%3Ccircle cx='28' cy='190' r='1.2' opacity='.55'/%3E%3Ccircle cx='246' cy='176' r='.8' opacity='.4'/%3E%3Ccircle cx='168' cy='214' r='1' opacity='.5'/%3E%3Ccircle cx='84' cy='238' r='.9' opacity='.45'/%3E%3Ccircle cx='214' cy='250' r='1.3' opacity='.55'/%3E%3C/g%3E%3Ccircle cx='140' cy='96' r='1.6' fill='%23ffe9a3' opacity='.6'/%3E%3Ccircle cx='40' cy='140' r='1.4' fill='%23ffe9a3' opacity='.5'/%3E%3C/svg%3E");
      background-size: 260px 260px;
    }

    /* The global ::selection text is near-white, unreadable on brass */
    body[data-theme="2ship"] ::selection {
      color: var(--mm-ink);
    }

    /* ---- Hero: Carnival of Time fireworks over Termina, the three-day clock rail below ---- */
    body[data-theme="2ship"] main section:has(+ #downloads) {
      padding-bottom: 3.25rem;
    }

    body[data-theme="2ship"] main section:has(+ #downloads)::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      /* Twinkling and shooting stars with staggered firework bursts, animated inside the SVG itself */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Ccircle cx='493' cy='69' r='1.5' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.3%3B1%3B0.3' dur='4.2s' begin='-0.1s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='212' cy='363' r='1.7' fill='%23d9c8ff'%3E%3Canimate attributeName='opacity' values='0.36%3B1%3B0.36' dur='2.2s' begin='-3.4s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='209' cy='375' r='0.8' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.3%3B1%3B0.3' dur='4.2s' begin='-3.7s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='113' cy='306' r='0.9' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.35%3B1%3B0.35' dur='2.4s' begin='-0.8s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='475' cy='209' r='1.8' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.27%3B1%3B0.27' dur='2.2s' begin='-1.7s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='378' cy='358' r='1.3' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.24%3B1%3B0.24' dur='1.8s' begin='-1.9s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='230' cy='34' r='1.5' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.25%3B1%3B0.25' dur='2.4s' begin='-3.2s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='120' cy='86' r='1.1' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.36%3B1%3B0.36' dur='3.3s' begin='-0.9s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='158' cy='321' r='1.1' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.43%3B1%3B0.43' dur='2.6s' begin='-1.5s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='165' cy='97' r='1.1' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.23%3B1%3B0.23' dur='2.1s' begin='-3.7s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='179' cy='176' r='1.9' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.26%3B1%3B0.26' dur='2.9s' begin='-3.1s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='510' cy='168' r='1.6' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.38%3B1%3B0.38' dur='1.9s' begin='-2.8s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='151' cy='394' r='1.6' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.23%3B1%3B0.23' dur='2.7s' begin='-2.5s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='406' cy='204' r='1.2' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.28%3B1%3B0.28' dur='1.8s' begin='-0.0s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='634' cy='399' r='1.0' fill='%23d9c8ff'%3E%3Canimate attributeName='opacity' values='0.45%3B1%3B0.45' dur='3.8s' begin='-2.8s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='291' cy='294' r='1.3' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.28%3B1%3B0.28' dur='2.5s' begin='-1.7s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='113' cy='391' r='0.9' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.36%3B1%3B0.36' dur='2.7s' begin='-3.0s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='52' cy='278' r='1.7' fill='%23fff'%3E%3Canimate attributeName='opacity' values='0.33%3B1%3B0.33' dur='1.9s' begin='-2.9s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='423' cy='199' r='0.9' fill='%23ffe9a3'%3E%3Canimate attributeName='opacity' values='0.24%3B1%3B0.24' dur='3.7s' begin='-3.3s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='583' cy='68' r='1.0' fill='%23d9c8ff'%3E%3Canimate attributeName='opacity' values='0.2%3B1%3B0.2' dur='2.4s' begin='-0.6s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='93' cy='111' r='1.4' fill='%23d9c8ff'%3E%3Canimate attributeName='opacity' values='0.24%3B1%3B0.24' dur='1.8s' begin='-3.9s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='145' cy='247' r='0.8' fill='%23d9c8ff'%3E%3Canimate attributeName='opacity' values='0.28%3B1%3B0.28' dur='4.1s' begin='-1.7s' repeatCount='indefinite'/%3E%3C/circle%3E%3Cg transform='translate(40 30)'%3E%3Cline x1='0' y1='0' x2='-30' y2='-11' stroke='%23fff' stroke-width='1.4' stroke-linecap='round' opacity='0'%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0%3B240 90%3B240 90' keyTimes='0%3B0.1%3B1' dur='11s' begin='2s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0%3B1%3B0%3B0' keyTimes='0%3B0.02%3B0.1%3B1' dur='11s' begin='2s' repeatCount='indefinite'/%3E%3C/line%3E%3C/g%3E%3Cg transform='translate(380 210)'%3E%3Cline x1='0' y1='0' x2='-25' y2='-9' stroke='%23fff' stroke-width='1.4' stroke-linecap='round' opacity='0'%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0%3B200 70%3B200 70' keyTimes='0%3B0.1%3B1' dur='14s' begin='7s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0%3B1%3B0%3B0' keyTimes='0%3B0.02%3B0.1%3B1' dur='14s' begin='7s' repeatCount='indefinite'/%3E%3C/line%3E%3C/g%3E%3Cg transform='translate(100 96) scale(1.35)'%3E%3Ccircle r='3.5' fill='%23fff' opacity='0'%3E%3Canimate attributeName='opacity' values='0%3B1%3B0%3B0' keyTimes='0%3B0.02%3B0.08%3B1' dur='9s' begin='-0s' repeatCount='indefinite'/%3E%3C/circle%3E%3Cg opacity='0' stroke='%23f25cc1' fill='%23f25cc1' stroke-width='1.7' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='scale' values='0.06%3B1%3B1' keyTimes='0%3B0.16%3B1' calcMode='spline' keySplines='0.1 0.7 0.2 1%3B0 0 1 1' dur='9s' begin='-0s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0%3B0 7%3B0 7' keyTimes='0%3B0.2%3B1' additive='sum' dur='9s' begin='-0s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0%3B1%3B1%3B0%3B0' keyTimes='0%3B0.01%3B0.07%3B0.2%3B1' dur='9s' begin='-0s' repeatCount='indefinite'/%3E%3Cpath d='M0-13v-15' transform='rotate(0)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(0)'/%3E%3Cpath d='M0-13v-15' transform='rotate(30)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(30)'/%3E%3Cpath d='M0-13v-15' transform='rotate(60)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(60)'/%3E%3Cpath d='M0-13v-15' transform='rotate(90)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(90)'/%3E%3Cpath d='M0-13v-15' transform='rotate(120)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(120)'/%3E%3Cpath d='M0-13v-15' transform='rotate(150)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(150)'/%3E%3Cpath d='M0-13v-15' transform='rotate(180)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(180)'/%3E%3Cpath d='M0-13v-15' transform='rotate(210)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(210)'/%3E%3Cpath d='M0-13v-15' transform='rotate(240)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(240)'/%3E%3Cpath d='M0-13v-15' transform='rotate(270)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(270)'/%3E%3Cpath d='M0-13v-15' transform='rotate(300)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(300)'/%3E%3Cpath d='M0-13v-15' transform='rotate(330)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(330)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(22)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(67)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(112)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(157)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(202)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(247)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(292)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(337)'/%3E%3C/g%3E%3C/g%3E%3Cg transform='translate(470 60) scale(1.35)'%3E%3Ccircle r='3.5' fill='%23fff' opacity='0'%3E%3Canimate attributeName='opacity' values='0%3B1%3B0%3B0' keyTimes='0%3B0.02%3B0.08%3B1' dur='9s' begin='-1.9s' repeatCount='indefinite'/%3E%3C/circle%3E%3Cg opacity='0' stroke='%236fe0e8' fill='%236fe0e8' stroke-width='1.7' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='scale' values='0.06%3B1%3B1' keyTimes='0%3B0.16%3B1' calcMode='spline' keySplines='0.1 0.7 0.2 1%3B0 0 1 1' dur='9s' begin='-1.9s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0%3B0 7%3B0 7' keyTimes='0%3B0.2%3B1' additive='sum' dur='9s' begin='-1.9s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0%3B1%3B1%3B0%3B0' keyTimes='0%3B0.01%3B0.07%3B0.2%3B1' dur='9s' begin='-1.9s' repeatCount='indefinite'/%3E%3Cpath d='M0-13v-15' transform='rotate(0)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(0)'/%3E%3Cpath d='M0-13v-15' transform='rotate(30)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(30)'/%3E%3Cpath d='M0-13v-15' transform='rotate(60)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(60)'/%3E%3Cpath d='M0-13v-15' transform='rotate(90)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(90)'/%3E%3Cpath d='M0-13v-15' transform='rotate(120)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(120)'/%3E%3Cpath d='M0-13v-15' transform='rotate(150)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(150)'/%3E%3Cpath d='M0-13v-15' transform='rotate(180)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(180)'/%3E%3Cpath d='M0-13v-15' transform='rotate(210)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(210)'/%3E%3Cpath d='M0-13v-15' transform='rotate(240)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(240)'/%3E%3Cpath d='M0-13v-15' transform='rotate(270)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(270)'/%3E%3Cpath d='M0-13v-15' transform='rotate(300)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(300)'/%3E%3Cpath d='M0-13v-15' transform='rotate(330)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(330)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(22)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(67)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(112)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(157)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(202)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(247)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(292)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(337)'/%3E%3C/g%3E%3C/g%3E%3Cg transform='translate(300 250) scale(1.35)'%3E%3Ccircle r='3.5' fill='%23fff' opacity='0'%3E%3Canimate attributeName='opacity' values='0%3B1%3B0%3B0' keyTimes='0%3B0.02%3B0.08%3B1' dur='9s' begin='-3.7s' repeatCount='indefinite'/%3E%3C/circle%3E%3Cg opacity='0' stroke='%23ffd75e' fill='%23ffd75e' stroke-width='1.7' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='scale' values='0.06%3B1%3B1' keyTimes='0%3B0.16%3B1' calcMode='spline' keySplines='0.1 0.7 0.2 1%3B0 0 1 1' dur='9s' begin='-3.7s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0%3B0 7%3B0 7' keyTimes='0%3B0.2%3B1' additive='sum' dur='9s' begin='-3.7s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0%3B1%3B1%3B0%3B0' keyTimes='0%3B0.01%3B0.07%3B0.2%3B1' dur='9s' begin='-3.7s' repeatCount='indefinite'/%3E%3Cpath d='M0-13v-15' transform='rotate(0)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(0)'/%3E%3Cpath d='M0-13v-15' transform='rotate(30)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(30)'/%3E%3Cpath d='M0-13v-15' transform='rotate(60)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(60)'/%3E%3Cpath d='M0-13v-15' transform='rotate(90)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(90)'/%3E%3Cpath d='M0-13v-15' transform='rotate(120)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(120)'/%3E%3Cpath d='M0-13v-15' transform='rotate(150)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(150)'/%3E%3Cpath d='M0-13v-15' transform='rotate(180)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(180)'/%3E%3Cpath d='M0-13v-15' transform='rotate(210)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(210)'/%3E%3Cpath d='M0-13v-15' transform='rotate(240)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(240)'/%3E%3Cpath d='M0-13v-15' transform='rotate(270)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(270)'/%3E%3Cpath d='M0-13v-15' transform='rotate(300)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(300)'/%3E%3Cpath d='M0-13v-15' transform='rotate(330)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(330)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(22)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(67)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(112)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(157)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(202)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(247)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(292)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(337)'/%3E%3C/g%3E%3C/g%3E%3Cg transform='translate(580 330) scale(1.35)'%3E%3Ccircle r='3.5' fill='%23fff' opacity='0'%3E%3Canimate attributeName='opacity' values='0%3B1%3B0%3B0' keyTimes='0%3B0.02%3B0.08%3B1' dur='9s' begin='-5.4s' repeatCount='indefinite'/%3E%3C/circle%3E%3Cg opacity='0' stroke='%23ff6a5c' fill='%23ff6a5c' stroke-width='1.7' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='scale' values='0.06%3B1%3B1' keyTimes='0%3B0.16%3B1' calcMode='spline' keySplines='0.1 0.7 0.2 1%3B0 0 1 1' dur='9s' begin='-5.4s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0%3B0 7%3B0 7' keyTimes='0%3B0.2%3B1' additive='sum' dur='9s' begin='-5.4s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0%3B1%3B1%3B0%3B0' keyTimes='0%3B0.01%3B0.07%3B0.2%3B1' dur='9s' begin='-5.4s' repeatCount='indefinite'/%3E%3Cpath d='M0-13v-15' transform='rotate(0)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(0)'/%3E%3Cpath d='M0-13v-15' transform='rotate(30)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(30)'/%3E%3Cpath d='M0-13v-15' transform='rotate(60)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(60)'/%3E%3Cpath d='M0-13v-15' transform='rotate(90)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(90)'/%3E%3Cpath d='M0-13v-15' transform='rotate(120)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(120)'/%3E%3Cpath d='M0-13v-15' transform='rotate(150)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(150)'/%3E%3Cpath d='M0-13v-15' transform='rotate(180)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(180)'/%3E%3Cpath d='M0-13v-15' transform='rotate(210)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(210)'/%3E%3Cpath d='M0-13v-15' transform='rotate(240)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(240)'/%3E%3Cpath d='M0-13v-15' transform='rotate(270)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(270)'/%3E%3Cpath d='M0-13v-15' transform='rotate(300)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(300)'/%3E%3Cpath d='M0-13v-15' transform='rotate(330)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(330)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(22)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(67)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(112)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(157)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(202)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(247)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(292)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(337)'/%3E%3C/g%3E%3C/g%3E%3Cg transform='translate(60 340) scale(1.35)'%3E%3Ccircle r='3.5' fill='%23fff' opacity='0'%3E%3Canimate attributeName='opacity' values='0%3B1%3B0%3B0' keyTimes='0%3B0.02%3B0.08%3B1' dur='9s' begin='-7.1s' repeatCount='indefinite'/%3E%3C/circle%3E%3Cg opacity='0' stroke='%238ce58f' fill='%238ce58f' stroke-width='1.7' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='scale' values='0.06%3B1%3B1' keyTimes='0%3B0.16%3B1' calcMode='spline' keySplines='0.1 0.7 0.2 1%3B0 0 1 1' dur='9s' begin='-7.1s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0%3B0 7%3B0 7' keyTimes='0%3B0.2%3B1' additive='sum' dur='9s' begin='-7.1s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0%3B1%3B1%3B0%3B0' keyTimes='0%3B0.01%3B0.07%3B0.2%3B1' dur='9s' begin='-7.1s' repeatCount='indefinite'/%3E%3Cpath d='M0-13v-15' transform='rotate(0)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(0)'/%3E%3Cpath d='M0-13v-15' transform='rotate(30)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(30)'/%3E%3Cpath d='M0-13v-15' transform='rotate(60)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(60)'/%3E%3Cpath d='M0-13v-15' transform='rotate(90)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(90)'/%3E%3Cpath d='M0-13v-15' transform='rotate(120)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(120)'/%3E%3Cpath d='M0-13v-15' transform='rotate(150)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(150)'/%3E%3Cpath d='M0-13v-15' transform='rotate(180)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(180)'/%3E%3Cpath d='M0-13v-15' transform='rotate(210)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(210)'/%3E%3Cpath d='M0-13v-15' transform='rotate(240)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(240)'/%3E%3Cpath d='M0-13v-15' transform='rotate(270)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(270)'/%3E%3Cpath d='M0-13v-15' transform='rotate(300)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(300)'/%3E%3Cpath d='M0-13v-15' transform='rotate(330)'/%3E%3Ccircle cy='-30' r='2.1' transform='rotate(330)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(22)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(67)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(112)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(157)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(202)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(247)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(292)'/%3E%3Ccircle cy='-15' r='1.3' transform='rotate(337)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      background-size: 640px 420px;
      /* Calmer directly behind the title */
      -webkit-mask-image: radial-gradient(ellipse 42% 60% at 50% 44%, oklch(0 0 0 / 0.4) 0 45%, #000 100%);
      mask-image: radial-gradient(ellipse 42% 60% at 50% 44%, oklch(0 0 0 / 0.4) 0 45%, #000 100%);
    }

    /* SVG animations ignore the global reduced-motion rule, so fall back to the still sky */
    @media (prefers-reduced-motion: reduce) {
      body[data-theme="2ship"] main section:has(+ #downloads)::before {
        display: none;
      }
    }

    body[data-theme="2ship"] main section:has(+ #downloads)::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 18px;
      pointer-events: none;
      background: var(--mm-clock-rail) repeat-x;
    }

    /* ---- Title: "Dawn of the First Day" lettering, white with a dark edge ---- */
    body[data-theme="2ship"] main section:has(+ #downloads) h1 {
      color: var(--mm-moon);
      -webkit-text-stroke: 1px var(--mm-ink);
      paint-order: stroke fill;
      letter-spacing: 0.02em;
      text-shadow:
        0 3px 0 var(--mm-ink),
        0 0 30px oklch(0.62 0.24 335 / 0.5),
        0 0 60px oklch(0.58 0.20 310 / 0.35);
    }

    body[data-theme="2ship"] main section:has(+ #downloads) h1 + p {
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 1.05rem;
      color: oklch(0.90 0.06 92);
    }

    body[data-theme="2ship"] main section:has(+ #downloads) h1 + p::before { content: '\\2014  '; }
    body[data-theme="2ship"] main section:has(+ #downloads) h1 + p::after { content: '  \\2014'; }

    /* Game icon: brass frame, Tatl's glow breathing around it */
    body[data-theme="2ship"] main section:has(+ #downloads) .rounded-3xl.shadow-2xl {
      border: 3px solid var(--mm-brass);
      animation: twoship-tatl 3.2s ease-in-out infinite;
    }

    @keyframes twoship-tatl {
      0%, 100% {
        box-shadow:
          0 0 0 1px var(--mm-ink),
          0 0 30px oklch(0.84 0.13 92 / 0.3);
      }
      50% {
        box-shadow:
          0 0 0 1px var(--mm-ink),
          0 0 56px oklch(0.84 0.13 92 / 0.6),
          0 0 90px oklch(0.62 0.24 335 / 0.25);
      }
    }

    /* ---- Section titles: underlined in the mask's spike colours ---- */
    body[data-theme="2ship"] main section > .container > h2 {
      display: inline-block;
      position: relative;
      padding-bottom: 0.4em;
      letter-spacing: 0.03em;
      color: var(--mm-moon);
      text-shadow: 0 2px 0 var(--mm-ink);
    }

    body[data-theme="2ship"] main section > .container > h2::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--mm-magenta), var(--mm-teal), var(--mm-yellow), var(--mm-red), var(--mm-green), var(--mm-blue));
    }

    /* ---- Panels: Clock Town stone with brass trim ---- */
    body[data-theme="2ship"] #downloads .container > .rounded-xl,
    body[data-theme="2ship"] #older-versions .rounded-xl.border,
    body[data-theme="2ship"] #other-games a.rounded-lg {
      background: linear-gradient(180deg, oklch(0.21 0.06 305), oklch(0.155 0.05 300));
      border: 1px solid oklch(0.84 0.13 92 / 0.38);
      box-shadow:
        inset 0 1px 0 oklch(1 0 0 / 0.05),
        0 16px 34px oklch(0 0 0 / 0.45);
    }

    body[data-theme="2ship"] #downloads .container > .rounded-xl .rounded-xl.border {
      background: oklch(0.11 0.04 300 / 0.55);
      border-color: oklch(0.84 0.13 92 / 0.22);
    }

    /* The clock hanging from the top edge of the release card: the final hours */
    body[data-theme="2ship"] #downloads .container > .rounded-xl {
      position: relative;
    }

    body[data-theme="2ship"] #downloads .container > .rounded-xl::before {
      content: '';
      position: absolute;
      top: -22px;
      left: 28px;
      width: 40px;
      height: 40px;
      pointer-events: none;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='21' fill='%232a1a3d' stroke='%23d4ad4f' stroke-width='3'/%3E%3Cpath d='M24 6v4M42 24h-4M24 42v-4M6 24h4' stroke='%23d4ad4f' stroke-width='2' stroke-linecap='round'/%3E%3Cg stroke='%23d4ad4f' stroke-width='1.2' opacity='.7'%3E%3Cpath d='M24 6v3M42 24h-3M24 42v-3M6 24h3' transform='rotate(30 24 24)'/%3E%3Cpath d='M24 6v3M42 24h-3M24 42v-3M6 24h3' transform='rotate(60 24 24)'/%3E%3C/g%3E%3Cpath d='M24 24V11M24 24l-8-10' stroke='%23f4e7c3' stroke-width='2.5' stroke-linecap='round'/%3E%3Ccircle cx='24' cy='24' r='2.2' fill='%23e8492b'/%3E%3C/svg%3E") center / contain no-repeat;
      filter: drop-shadow(0 4px 6px oklch(0 0 0 / 0.5));
    }

    /* ---- Download buttons ---- */
    body[data-theme="2ship"] #downloads a.rounded-lg.border,
    body[data-theme="2ship"] #older-versions a.rounded-lg.border {
      background: oklch(0.11 0.04 300 / 0.7);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }

    body[data-theme="2ship"] #downloads a.rounded-lg.border:hover,
    body[data-theme="2ship"] #older-versions a.rounded-lg.border:hover {
      border-color: var(--mm-brass);
      box-shadow:
        inset 0 0 18px oklch(0.58 0.20 310 / 0.25),
        0 0 14px oklch(0.84 0.13 92 / 0.2);
      transform: translateY(-1px);
    }

    body[data-theme="2ship"] #downloads a.rounded-lg.border:hover svg,
    body[data-theme="2ship"] #older-versions a.rounded-lg.border:hover svg {
      color: var(--mm-brass);
    }

    /* ---- Older versions: the clock rail frames the band, newest three are Days I-III ---- */
    body[data-theme="2ship"] #older-versions {
      position: relative;
      background: oklch(0.10 0.04 300 / 0.5);
    }

    body[data-theme="2ship"] #older-versions::before,
    body[data-theme="2ship"] #older-versions::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 18px;
      pointer-events: none;
      background: var(--mm-clock-rail) repeat-x;
    }

    body[data-theme="2ship"] #older-versions::before { top: 0; transform: scaleY(-1); }
    body[data-theme="2ship"] #older-versions::after { bottom: 0; }

    body[data-theme="2ship"] #older-versions .space-y-4 {
      counter-reset: day;
    }

    body[data-theme="2ship"] #older-versions .space-y-4 > .rounded-xl.border {
      counter-increment: day;
      position: relative;
    }

    body[data-theme="2ship"] #older-versions .space-y-4 > .rounded-xl.border::before {
      content: counter(day);
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 1rem;
      color: oklch(0.84 0.13 92 / 0.65);
      background: oklch(0.11 0.04 300 / 0.55);
      border-right: 1px solid oklch(0.84 0.13 92 / 0.25);
      pointer-events: none;
    }

    body[data-theme="2ship"] #older-versions .space-y-4 > .rounded-xl.border:nth-child(-n+3)::before {
      content: counter(day, upper-roman);
      font-size: 1.2rem;
      color: var(--mm-brass);
      text-shadow: 0 0 10px oklch(0.84 0.13 92 / 0.5);
    }

    body[data-theme="2ship"] #older-versions .space-y-4 > .rounded-xl.border > button,
    body[data-theme="2ship"] #older-versions .space-y-4 > .rounded-xl.border > .border-t {
      padding-left: 3.75rem;
    }

    /* ---- Other ports: each card wears one of the mask's colours ---- */
    body[data-theme="2ship"] #other-games a.rounded-lg {
      border-top: 3px solid var(--mm-c, var(--mm-brass));
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    body[data-theme="2ship"] #other-games a.rounded-lg:nth-child(6n+1) { --mm-c: var(--mm-magenta); }
    body[data-theme="2ship"] #other-games a.rounded-lg:nth-child(6n+2) { --mm-c: var(--mm-teal); }
    body[data-theme="2ship"] #other-games a.rounded-lg:nth-child(6n+3) { --mm-c: var(--mm-yellow); }
    body[data-theme="2ship"] #other-games a.rounded-lg:nth-child(6n+4) { --mm-c: var(--mm-red); }
    body[data-theme="2ship"] #other-games a.rounded-lg:nth-child(6n+5) { --mm-c: var(--mm-green); }
    body[data-theme="2ship"] #other-games a.rounded-lg:nth-child(6n+6) { --mm-c: var(--mm-blue); }

    body[data-theme="2ship"] #other-games a.rounded-lg:hover {
      transform: translateY(-3px);
      border-color: var(--mm-brass);
      border-top-color: var(--mm-c, var(--mm-brass));
      box-shadow:
        0 16px 30px oklch(0 0 0 / 0.5),
        0 0 20px oklch(from var(--mm-c, var(--mm-brass)) l c h / 0.3);
    }
  `
};
