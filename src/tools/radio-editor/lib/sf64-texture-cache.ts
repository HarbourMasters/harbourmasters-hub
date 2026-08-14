import type JSZip from 'jszip';
import { SF64FontRenderer, RADIO_BOX_BG_PATH, RADIO_BOX_BG_TLUT_PATH, decodeTextboxBg, RADIO_BOX_COLORS, isRedBoxCharacter, SF64_CHAR_HEIGHT, SF64_CHAR_ADVANCE } from './sf64-font-renderer';

// C-button glyphs (CLEFT 0x10, CUP 0x11, CRIGHT 0x12, CDOWN 0x13) render in yellow per fox_message.c
function glyphColor(code: number): string {
  return (code >= 0x10 && code <= 0x13) ? 'rgb(255,255,0)' : 'rgb(255,255,255)';
}

// RCID -> portrait texture O2R path mapping (extracted from fox_radio.c)
// Even RCID = closed mouth, RCID+1 = open mouth
const PORTRAIT_PATHS: Record<number, string> = {
  // Fox (RCID 0)
  0: 'ast_common/aFoxPortraitTex',
  1: 'ast_common/D_1006000',
  5: 'ast_common/aFoxPortraitTex',   // Fox Red (same texture, different box color)
  6: 'ast_common/D_1006000',
  400: 'ast_common/D_1006F20',       // Fox Expert
  401: 'ast_common/D_1007E40',
  // Falco (RCID 10)
  10: 'ast_common/aFalcoPortraitTex',
  11: 'ast_common/D_10041C0',
  15: 'ast_common/aFalcoPortraitTex',
  16: 'ast_common/D_10041C0',
  // Slippy (RCID 20)
  20: 'ast_common/aSlippyPortraitTex',
  21: 'ast_common/D_100E820',
  25: 'ast_common/aSlippyPortraitTex',
  26: 'ast_common/D_100E820',
  // Peppy (RCID 30)
  30: 'ast_common/aPeppyPortraitTex',
  31: 'ast_common/D_100C9E0',
  35: 'ast_common/aPeppyPortraitTex',
  36: 'ast_common/D_100C9E0',
  // Katt (RCID 40)
  40: 'ast_allies/D_D003DF0',
  41: 'ast_allies/D_D004D10',
  // Andross (RCID 50)
  50: 'ast_allies/D_D000170',
  51: 'ast_allies/D_D001090',
  55: 'ast_allies/D_D000170',         // Andross Red
  56: 'ast_allies/D_D001090',
  // James (RCID 60)
  60: 'ast_allies/D_D005C30',
  61: 'ast_allies/D_D006B50',
  // Gen Pepper (RCID 70)
  70: 'ast_allies/D_D007A70',
  71: 'ast_allies/D_D008990',
  // Boss Corneria (RCID 80)
  80: 'ast_corneria/D_CO_6026420',
  81: 'ast_corneria/D_CO_6027340',
  // ROB64 (RCID 90)
  90: 'ast_common/D_1009C80',
  91: 'ast_common/D_100ABA0',
  95: 'ast_common/D_1009C80',         // ROB64 Red
  96: 'ast_common/D_100ABA0',
  // Boss Meteo (RCID 100)
  100: 'ast_meteo/D_ME_601C8E0',
  101: 'ast_meteo/D_ME_601D800',
  // Boss Corneria 2 (RCID 110)
  110: 'ast_corneria/D_CO_60245E0',
  111: 'ast_corneria/D_CO_6025500',
  // Boss Area 6 (RCID 120)
  120: 'ast_area_6/D_A6_60047E0',
  121: 'ast_area_6/D_A6_6005700',
  // Boss Zoness (RCID 130)
  130: 'ast_zoness/D_ZO_6014510',
  131: 'ast_zoness/D_ZO_6015430',
  // ROB64 2 (RCID 140)
  140: 'ast_common/D_1009C80',
  141: 'ast_common/D_100ABA0',
  // Boss Sector X (RCID 150)
  150: 'ast_sector_x/D_SX_6020FB0',
  151: 'ast_sector_x/D_SX_6021ED0',
  // Boss Sector Y (RCID 160)
  160: 'ast_sector_y/D_SY_6018F30',
  161: 'ast_sector_y/D_SY_6019E50',
  // Bill (RCID 170)
  170: 'ast_allies/D_D001FB0',
  171: 'ast_allies/D_D002ED0',
  // Caiman Area 6 (RCID 180)
  180: 'ast_area_6/D_A6_60029A0',
  181: 'ast_area_6/D_A6_60038C0',
  // Boss Macbeth (RCID 190)
  190: 'ast_macbeth/D_MA_6010C20',
  191: 'ast_macbeth/D_MA_6011B40',
  // Wolf (RCID 200)
  200: 'ast_star_wolf/D_STAR_WOLF_F00B580',
  201: 'ast_star_wolf/D_STAR_WOLF_F00C4A0',
  // Pigma (RCID 210)
  210: 'ast_star_wolf/D_STAR_WOLF_F003C80',
  211: 'ast_star_wolf/D_STAR_WOLF_F004BA0',
  // Leon (RCID 220)
  220: 'ast_star_wolf/D_STAR_WOLF_F007900',
  221: 'ast_star_wolf/D_STAR_WOLF_F008820',
  // Andrew (RCID 230)
  230: 'ast_star_wolf/D_STAR_WOLF_F000000',
  231: 'ast_star_wolf/D_STAR_WOLF_F000F20',
  // Wolf 2 (RCID 240)
  240: 'ast_star_wolf/D_STAR_WOLF_F00D3C0',
  241: 'ast_star_wolf/D_STAR_WOLF_F00E2E0',
  // Pigma 2 (RCID 250)
  250: 'ast_star_wolf/D_STAR_WOLF_F005AC0',
  251: 'ast_star_wolf/D_STAR_WOLF_F0069E0',
  // Leon 2 (RCID 260)
  260: 'ast_star_wolf/D_STAR_WOLF_F009740',
  261: 'ast_star_wolf/D_STAR_WOLF_F00A660',
  // Andrew 2 (RCID 270)
  270: 'ast_star_wolf/D_STAR_WOLF_F001E40',
  271: 'ast_star_wolf/D_STAR_WOLF_F002D60',
  // ROB64 Title (RCID 300)
  300: 'ast_great_fox/D_GREAT_FOX_E00E100',
  301: 'ast_great_fox/D_GREAT_FOX_E00F020',
  // Gen Pepper Title (RCID 310)
  310: 'ast_great_fox/D_GREAT_FOX_E00FF40',
  311: 'ast_great_fox/D_GREAT_FOX_E010E60',
  // Training (RCID 350)
  350: 'ast_training/D_TR_6000900',
  351: 'ast_training/D_TR_6001820',
};

// Normalize RCID: strip _RED variant to base, since _RED just changes the box color
function normalizeRcid(rcid: number): number {
  if (rcid === 5 || rcid === 6) return rcid - 5;     // Fox Red → Fox
  if (rcid === 15 || rcid === 16) return rcid - 5;   // Falco Red → Falco
  if (rcid === 25 || rcid === 26) return rcid - 5;   // Slippy Red → Slippy
  if (rcid === 35 || rcid === 36) return rcid - 5;   // Peppy Red → Peppy
  if (rcid === 55 || rcid === 56) return rcid - 5;   // Andross Red → Andross
  if (rcid === 95 || rcid === 96) return rcid - 5;   // ROB64 Red → ROB64
  return rcid;
}

function decodeRGBA16ToCanvas(raw: Uint8Array, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  // RGBA16 N64 format: 16 bits per pixel
  // RRRRRGGGGGBBBBBA — 5 bits R, 5 bits G, 5 bits B, 1 bit alpha
  // Data is stored big-endian: [high_byte, low_byte] per pixel
  for (let i = 0; i < width * height; i++) {
    const hi = raw[i * 2]!;
    const lo = raw[i * 2 + 1]!;
    const pixel = (hi << 8) | lo;

    const r = ((pixel >> 11) & 0x1F) * 255 / 31;
    const g = ((pixel >> 6) & 0x1F) * 255 / 31;
    const b = ((pixel >> 1) & 0x1F) * 255 / 31;
    const a = (pixel & 1) ? 255 : 0;

    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
    pixels[i * 4 + 3] = a;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export class SF64TextureCache {
  fontRenderer: SF64FontRenderer;
  private zip: JSZip;
  private bgCanvas: HTMLCanvasElement | null = null;
  private bgTintedBlue: HTMLCanvasElement | null = null;
  private bgTintedRed: HTMLCanvasElement | null = null;
  private portraitCache = new Map<number, HTMLCanvasElement | null>();
  // Briefing-specific textures (from ast_map)
  private briefingBg: HTMLCanvasElement | null = null;
  private briefingMouthOverlay: HTMLCanvasElement | null = null;
  private briefingTeamFaces = new Map<string, HTMLCanvasElement>();
  // Pepper's communications face (assembled from 4 tiles, closed + open mouth)
  private briefingPepperFace: HTMLCanvasElement | null = null;
  private briefingPepperFaceOpen: HTMLCanvasElement | null = null;
  /** Incremented each time loadAll() completes — use as React dep to trigger re-renders */
  loadedVersion = 0;

  constructor(zip: JSZip) {
    this.zip = zip;
    this.fontRenderer = new SF64FontRenderer();
  }

  async loadAll(): Promise<void> {
    // Load all 24 character textures
    const paths = SF64FontRenderer.getTexturePaths();
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!path) continue;
      try {
        const data = await this.readFile(path);
        if (data) {
          this.fontRenderer.loadCharTexture(i, data);
        }
      } catch {
        // Skip missing textures
      }
    }
    this.fontRenderer.setLoaded();

    // Load textbox background
    try {
      const texData = await this.readFile(RADIO_BOX_BG_PATH);
      const tlutData = await this.readFile(RADIO_BOX_BG_TLUT_PATH);
      if (texData && tlutData) {
        this.bgCanvas = decodeTextboxBg(texData, tlutData);
        this.bgTintedBlue = this.createTintedBgCanvas(RADIO_BOX_COLORS.blue);
        this.bgTintedRed = this.createTintedBgCanvas(RADIO_BOX_COLORS.red);
      }
    } catch {
      // Background texture not available
    }

    // Pre-load all portrait textures
    await this.loadPortraits();

    // Load briefing-specific textures
    await this.loadBriefingTextures();

    this.loadedVersion++;
  }

  private async loadPortraits(): Promise<void> {
    const rcids = new Set<number>();
    for (const key of Object.keys(PORTRAIT_PATHS)) {
      rcids.add(parseInt(key));
    }

    for (const rcid of rcids) {
      const path = PORTRAIT_PATHS[rcid];
      if (!path) continue;
      try {
        const data = await this.readFile(path);
        if (data && data.length >= 0x40 + 16) {
          const raw = data.slice(0x40);
          // Header: fmt(4) + width(4) + height(4) + size(4)
          const w = (raw[4]! | (raw[5]! << 8) | (raw[6]! << 16) | (raw[7]! << 24)) >>> 0;
          const h = (raw[8]! | (raw[9]! << 8) | (raw[10]! << 16) | (raw[11]! << 24)) >>> 0;
          const pixelData = raw.slice(16);
          if (pixelData.length >= w * h * 2) {
            const canvas = decodeRGBA16ToCanvas(pixelData, w, h);
            this.portraitCache.set(rcid, canvas);
          }
        }
      } catch {
        this.portraitCache.set(rcid, null);
      }
    }
  }

  getPortrait(characterId: number, openMouth = false): HTMLCanvasElement | null {
    let rcid = normalizeRcid(characterId);
    if (openMouth && rcid < 1000) rcid = rcid + 1;
    return this.portraitCache.get(rcid) ?? null;
  }

  private async loadBriefingTextures(): Promise<void> {
    const BRIEFING_BG = 'ast_map/D_MAP_6044820';
    const BRIEFING_MOUTH = 'ast_map/D_MAP_6046CD0';
    const BRIEFING_FACES: [string, string][] = [
      ['falco', 'ast_map/aMapRadioCharFalcoTex'],
      ['slippy', 'ast_map/aMapRadioCharSlippyTex'],
      ['peppy', 'ast_map/aMapRadioCharPeppyTex'],
    ];

    this.briefingBg = await this.loadRGBA16Texture(BRIEFING_BG);
    this.briefingMouthOverlay = await this.loadRGBA16Texture(BRIEFING_MOUTH);

    for (const [name, path] of BRIEFING_FACES) {
      const canvas = await this.loadRGBA16Texture(path);
      if (canvas) this.briefingTeamFaces.set(name, canvas);
    }

    // Pepper's communications face (top: 4 tiles of 64x32 in 2x2 + bottom: 2 tiles of 64x32 = 128x96)
    // Bottom tiles 605A230+605B230 are common to both states
    // Closed mouth: upper 6054F20/6051F20, middle 6056120/6057120
    // Open mouth:   top 6058120/6059120, middle 6052F20/6053F20
    const pepperBottom = ['ast_map/D_MAP_605A230', 'ast_map/D_MAP_605B230'];
    this.briefingPepperFace = await this.assemblePepperFace(
      ['ast_map/D_MAP_6054F20', 'ast_map/D_MAP_6051F20',
       'ast_map/D_MAP_6056120', 'ast_map/D_MAP_6057120'],
      pepperBottom,
    );
    this.briefingPepperFaceOpen = await this.assemblePepperFace(
      ['ast_map/D_MAP_6058120', 'ast_map/D_MAP_6059120',
       'ast_map/D_MAP_6052F20', 'ast_map/D_MAP_6053F20'],
      pepperBottom,
    );
  }

  private async loadRGBA16Texture(path: string): Promise<HTMLCanvasElement | null> {
    try {
      const data = await this.readFile(path);
      if (!data || data.length < 0x40 + 16) return null;
      const raw = data.slice(0x40);
      const w = (raw[4]! | (raw[5]! << 8) | (raw[6]! << 16) | (raw[7]! << 24)) >>> 0;
      const h = (raw[8]! | (raw[9]! << 8) | (raw[10]! << 16) | (raw[11]! << 24)) >>> 0;
      const pixelData = raw.slice(16);
      if (pixelData.length >= w * h * 2) {
        return decodeRGBA16ToCanvas(pixelData, w, h);
      }
    } catch { /* skip missing */ }
    return null;
  }

  /**
   * Assemble Pepper's face from top (4 tiles of 64x32 in 2x2 grid) and bottom tiles.
   * Top: 128x64, bottom: 128x32, total: 128x96.
   */
  private async assemblePepperFace(
    topTilePaths: string[],
    bottomTilePaths: string[],
  ): Promise<HTMLCanvasElement | null> {
    const topTiles = await Promise.all(topTilePaths.map(p => this.loadRGBA16Texture(p)));
    const bottomTiles = await Promise.all(bottomTilePaths.map(p => this.loadRGBA16Texture(p)));
    if (topTiles.some(t => !t)) return null;

    const tw = topTiles[0]!.width;  // 64
    const th = topTiles[0]!.height; // 32
    const topW = tw * 2;
    const topH = th * 2;

    // Calculate bottom section height
    const bottomH = bottomTiles.length > 0 && bottomTiles[0]
      ? bottomTiles[0].height
      : 0;

    const canvas = document.createElement('canvas');
    canvas.width = topW;
    canvas.height = topH + bottomH;
    const ctx = canvas.getContext('2d')!;

    // Top: 2x2 grid of 64x32 tiles
    ctx.drawImage(topTiles[0]!, 0, 0);
    ctx.drawImage(topTiles[1]!, tw, 0);
    ctx.drawImage(topTiles[2]!, 0, th);
    ctx.drawImage(topTiles[3]!, tw, th);

    // Bottom: single 128x32 tile or two 64x32 tiles side by side
    if (bottomTiles.length === 1 && bottomTiles[0]) {
      ctx.drawImage(bottomTiles[0], 0, topH, topW, bottomH);
    } else {
      for (let i = 0; i < bottomTiles.length; i++) {
        if (bottomTiles[i]) {
          const bx = i * (bottomTiles[i]!.width === topW ? 0 : tw);
          ctx.drawImage(bottomTiles[i]!, bx, topH);
        }
      }
    }

    return canvas;
  }

  private async readFile(path: string): Promise<Uint8Array | null> {
    const file = this.zip.file(path);
    if (!file) return null;
    return file.async('uint8array');
  }

  private createTintedBgCanvas(color: readonly [number, number, number, number]): HTMLCanvasElement | null {
    if (!this.bgCanvas) return null;
    const canvas = document.createElement('canvas');
    canvas.width = this.bgCanvas.width;
    canvas.height = this.bgCanvas.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(this.bgCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  getBackgroundCanvas(useRed = false): HTMLCanvasElement | null {
    return useRed ? this.bgTintedRed : this.bgTintedBlue;
  }

  renderPreview(charCodes: Uint16Array, characterId = 0, openMouth = false, width = 300, height = 88): string | null {
    if (!this.fontRenderer.isLoaded) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const portraitW = 44;
    const portraitH = 44;
    const portraitX = 4;
    const portraitY = Math.floor((height - portraitH) / 2);
    const textX = portraitX + portraitW + 6;
    const textY = 6;
    const textAreaW = width - textX - 4;

    // Draw textbox background (tiled at native texture size like N64)
    const textAreaH = height - textY * 2;
    const useRed = isRedBoxCharacter(characterId);
    const bgTinted = useRed ? this.bgTintedRed : this.bgTintedBlue;
    if (bgTinted) {
      const pattern = ctx.createPattern(bgTinted, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(textX, textY, textAreaW, textAreaH);
      }
    } else {
      ctx.fillStyle = useRed ? 'rgba(255, 25, 25, 0.67)' : 'rgba(60, 60, 255, 0.67)';
      ctx.fillRect(textX, textY, textAreaW, textAreaH);
    }

    // Draw portrait
    const portrait = this.getPortrait(characterId, openMouth);
    if (portrait) {
      ctx.drawImage(portrait, portraitX, portraitY, portraitW, portraitH);
    } else {
      ctx.fillStyle = 'rgba(30, 30, 80, 0.8)';
      ctx.fillRect(portraitX, portraitY, portraitW, portraitH);
      ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
      ctx.strokeRect(portraitX, portraitY, portraitW, portraitH);
    }

    // Draw text characters
    const scale = 1.5;
    let x = textX + 6;
    let y = textY + 6;
    const maxX = textX + textAreaW - 6;

    for (let i = 0; i < charCodes.length; i++) {
      const code = charCodes[i]!;

      if (code === 0x00) break;
      if (code === 0x01) { // NWL
        x = textX + 6;
        y += SF64_CHAR_HEIGHT * scale + 2;
        continue;
      }
      if (code >= 0x02 && code <= 0x07) continue;
      if (code >= 0x08 && code <= 0x0B) continue;
      if (code === 0x0D) { x += 2; continue; }
      if (code === 0x0E) { x += 1; continue; }
      if (code === 0x0F) { // NXT
        x = textX + 6;
        y += SF64_CHAR_HEIGHT * scale + 2;
        continue;
      }

      if (x + SF64_CHAR_ADVANCE * scale > maxX) {
        x = textX + 6;
        y += SF64_CHAR_HEIGHT * scale + 2;
      }

      const advance = this.fontRenderer.drawChar(ctx, code, x, y, scale, glyphColor(code));
      x += advance;
    }

    return canvas.toDataURL('image/png');
  }

  renderBriefingPreview(charCodes: Uint16Array, characterId: number, openMouth = false, width = 400, height = 180): string | null {
    if (!this.fontRenderer.isLoaded) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Briefing is always a conversation between General Pepper and Fox.
    // Internally, Falco RCID (10/11) drives Pepper's mouth, Slippy RCID (20/21) drives Fox's panel.
    // - characterId === 10 → Pepper is speaking (Pepper's mouth animates)
    // - characterId === 20 → Fox is speaking (Fox's mouth overlay animates)
    //
    // In-game layout (fox_map.c):
    //   Left:  Pepper 3D face on TV screen (Map_GralPepperFace_Draw)
    //   Right: Fox status panel (92x51 bg) + mouth overlay (32x34 at +47px)
    //          + tiny team faces (28x28) below at y=131
    //   Center-bottom: text at (78, 166)

    const textScale = 1.3;
    const pepperIsSpeaking = characterId === 10;
    const foxIsSpeaking = characterId === 20;

    // ---- LEFT: General Pepper communications face ----
    // Assembled 128x96, scaled down to fit alongside text (like Fox's portrait at 44x44)
    const pepperDisplayW = 64;
    const pepperDisplayH = 48;
    const pepperX = 4;
    const pepperY = 4;
    const pepperCanvas = (pepperIsSpeaking && openMouth)
      ? (this.briefingPepperFaceOpen ?? this.briefingPepperFace)
      : this.briefingPepperFace;
    if (pepperCanvas) {
      ctx.drawImage(pepperCanvas, pepperX, pepperY, pepperDisplayW, pepperDisplayH);
    } else {
      // Fallback to standard Pepper portrait
      const fallback = this.getPortrait(70, pepperIsSpeaking && openMouth);
      if (fallback) {
        ctx.drawImage(fallback, pepperX, pepperY, 48, 48);
      } else {
        ctx.fillStyle = 'rgba(30, 30, 80, 0.8)';
        ctx.fillRect(pepperX, pepperY, 48, 48);
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
        ctx.strokeRect(pepperX, pepperY, 48, 48);
      }
    }

    // ---- RIGHT: Fox status panel (92x51 bg) + team faces ----
    const bgW = 92;
    const bgH = 51;
    const bgX = width - bgW - 6;
    const bgY = 4;
    const teamFaceSize = 28;
    const teamY = bgY + bgH + 4;

    // Fox's status background
    if (this.briefingBg) {
      ctx.drawImage(this.briefingBg, bgX, bgY, bgW, bgH);
    } else {
      const foxPortrait = this.getPortrait(0, foxIsSpeaking && openMouth);
      if (foxPortrait) {
        ctx.drawImage(foxPortrait, bgX, bgY, bgW, bgH);
      } else {
        ctx.fillStyle = 'rgba(30, 30, 80, 0.9)';
        ctx.fillRect(bgX, bgY, bgW, bgH);
      }
    }

    // Fox's mouth overlay — only when Fox is speaking
    if (foxIsSpeaking && openMouth && this.briefingMouthOverlay) {
      ctx.drawImage(this.briefingMouthOverlay, bgX + 47, bgY, 32, 34);
    }

    // Tiny team faces: Peppy, Slippy, Falco
    const teamOrder = ['peppy', 'slippy', 'falco'] as const;
    for (let t = 0; t < teamOrder.length; t++) {
      const face = this.briefingTeamFaces.get(teamOrder[t]);
      const tx = bgX + t * (teamFaceSize + 2);
      if (face) {
        ctx.drawImage(face, tx, teamY, teamFaceSize, teamFaceSize);
      } else {
        ctx.fillStyle = 'rgba(30, 30, 80, 0.6)';
        ctx.fillRect(tx, teamY, teamFaceSize, teamFaceSize);
      }
    }

    // ---- CENTER: text (no textbox — briefings render text directly on the map screen) ----
    const textX = pepperX + pepperDisplayW + 8;
    const textY = 4;
    const textAreaW = bgX - textX - 6;

    let x = textX + 5;
    let y = textY + 2;
    const maxX = textX + textAreaW - 5;

    for (let i = 0; i < charCodes.length; i++) {
      const code = charCodes[i]!;

      if (code === 0x00) break;
      if (code === 0x01) {
        x = textX + 5;
        y += SF64_CHAR_HEIGHT * textScale + 2;
        continue;
      }
      if (code >= 0x02 && code <= 0x07) continue;
      if (code >= 0x08 && code <= 0x0B) continue;
      if (code === 0x0D) { x += 2; continue; }
      if (code === 0x0E) { x += 1; continue; }
      if (code === 0x0F) {
        x = textX + 5;
        y += SF64_CHAR_HEIGHT * textScale + 2;
        continue;
      }

      if (x + SF64_CHAR_ADVANCE * textScale > maxX) {
        x = textX + 5;
        y += SF64_CHAR_HEIGHT * textScale + 2;
      }

      const advance = this.fontRenderer.drawChar(ctx, code, x, y, textScale, glyphColor(code));
      x += advance;
    }

    return canvas.toDataURL('image/png');
  }

  /** Prologue text (msgId 1): scrolling text, no box, no avatar. In-game at (30, 230) in a 218x70 window. */
  renderProloguePreview(charCodes: Uint16Array): string | null {
    if (!this.fontRenderer.isLoaded) return null;

    // Prologue uses Message_DisplayScrollingText — no auto line-wrap, only breaks on NWL.
    // Game advances x by 7 per char, no maxX check.
    const scale = 1.0;
    const lineHeight = 15; // game uses y += 15 on NWL
    const charAdvance = SF64_CHAR_ADVANCE * scale;

    // Measure dimensions: find max X and total Y
    let measureX = 4;
    let measureY = 4;
    let maxX = 4;
    for (let i = 0; i < charCodes.length; i++) {
      const code = charCodes[i]!;
      if (code === 0x00) break;
      if (code === 0x01 || code === 0x0F) { maxX = Math.max(maxX, measureX); measureX = 4; measureY += lineHeight; continue; }
      if (code >= 0x02 && code <= 0x07) continue;
      if (code >= 0x08 && code <= 0x0B) continue;
      if (code === 0x0D) { measureX += 3; continue; } // HSP = 3 in game
      if (code === 0x0E) { measureX += 2; continue; } // QSP = 2 in game
      if (code === 0x0C) { measureX += charAdvance; continue; } // SPC = 7
      measureX += charAdvance;
    }
    maxX = Math.max(maxX, measureX);
    const totalWidth = Math.ceil(maxX + 4);
    const totalHeight = Math.ceil(measureY + SF64_CHAR_HEIGHT * scale + 4);

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d')!;

    let x = 4;
    let y = 4;

    for (let i = 0; i < charCodes.length; i++) {
      const code = charCodes[i]!;
      if (code === 0x00) break;
      if (code === 0x01) { x = 4; y += lineHeight; continue; }
      if (code >= 0x02 && code <= 0x07) continue;
      if (code >= 0x08 && code <= 0x0B) continue;
      if (code === 0x0D) { x += 3; continue; }
      if (code === 0x0E) { x += 2; continue; }
      if (code === 0x0F) { x = 4; y += lineHeight; continue; }
      if (code === 0x0C) { x += charAdvance; continue; }

      const advance = this.fontRenderer.drawChar(ctx, code, x, y, scale, glyphColor(code));
      x += advance;
    }

    return canvas.toDataURL('image/png');
  }

  /** Credits/score text (21070-22020): plain text, no box, no avatar. */
  renderCreditsPreview(charCodes: Uint16Array, width = 200, height = 48): string | null {
    if (!this.fontRenderer.isLoaded) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const scale = 1.2;
    let x = 4;
    let y = 4;
    const maxX = width - 4;

    for (let i = 0; i < charCodes.length; i++) {
      const code = charCodes[i]!;
      if (code === 0x00) break;
      if (code === 0x01) { x = 4; y += SF64_CHAR_HEIGHT * scale + 2; continue; }
      if (code >= 0x02 && code <= 0x07) continue;
      if (code >= 0x08 && code <= 0x0B) continue;
      if (code === 0x0D) { x += 2; continue; }
      if (code === 0x0E) { x += 1; continue; }
      if (code === 0x0F) { x = 4; y += SF64_CHAR_HEIGHT * scale + 2; continue; }

      if (x + SF64_CHAR_ADVANCE * scale > maxX) {
        x = 4;
        y += SF64_CHAR_HEIGHT * scale + 2;
      }

      const advance = this.fontRenderer.drawChar(ctx, code, x, y, scale, glyphColor(code));
      x += advance;
    }

    return canvas.toDataURL('image/png');
  }
}
