// SF64 font renderer using actual game character textures (CI4 16x13)
// Loads glyph textures from sf64.o2r ast_radio/text_char_* files
// Uses hardcoded palettes from fox_msg_palette.c

import { decodeOTEX } from '@/tools/message-editor/lib/otex-decoder';
import type { OTEXHeader } from '@/tools/message-editor/lib/otex-decoder';

export const SF64_CHAR_WIDTH = 16;
export const SF64_CHAR_DRAW_WIDTH = 13; // game draws 13px wide (not full 16px texture)
export const SF64_CHAR_HEIGHT = 13;
export const SF64_CHAR_ADVANCE = 7.6; // average advance based on measuring in-game text technically should be 7
export const SF64_ARROW_ADVANCE = 14;

// Hardcoded palettes from Starship src/engine/fox_msg_palette.c
// gTextCharPalettes[4][16] — each entry is RGBA16 (0x0000=transparent, 0xFFFF=white)
const PALETTES: [number, number, number, number][][] = [
  // Palette 0: even indices = transparent, odd = white
  Array.from({ length: 16 }, (_, i) => i % 2 === 0 ? [0, 0, 0, 0] : [255, 255, 255, 255]),
  // Palette 1: indices 0-3: [0,0,0,0], [0,0,0,0], [255,255,255,255], [255,255,255,255] pattern
  Array.from({ length: 16 }, (_, i) => (i % 4 < 2) ? [0, 0, 0, 0] : [255, 255, 255, 255]),
  // Palette 2: groups of 4 — even groups transparent, odd groups white (from fox_msg_palette.c)
  Array.from({ length: 16 }, (_, i) => (Math.floor(i / 4) % 2 === 0) ? [0, 0, 0, 0] : [255, 255, 255, 255]),
  // Palette 3: first 8 transparent, last 8 white
  Array.from({ length: 16 }, (_, i) => i < 8 ? [0, 0, 0, 0] : [255, 255, 255, 255]),
];

// Texture index -> O2R file path (from ast_radio YAML)
const TEXTURE_PATHS = [
  'ast_radio/text_char_special_0',   // 0: END, NWL, NP2, NP3
  'ast_radio/text_char_special_4',   // 1: NP4, NP5, NP6, NP7
  'ast_radio/text_char_special_8',   // 2: PRI0, PRI1, PRI2, PRI3
  'ast_radio/text_char_special_12',  // 3: SPC, HSP, QSP, NXT
  'ast_radio/text_char_cdir',        // 4: CLF, CUP, CRT, CDN
  'ast_radio/text_char_adir',        // 5: AUP, ALF, ADN, ART
  'ast_radio/text_char_abcd_upper',  // 6: A, B, C, D
  'ast_radio/text_char_efgh_upper',  // 7: E, F, G, H
  'ast_radio/text_char_ijkl_upper',  // 8: I, J, K, L
  'ast_radio/text_char_mnop_upper',  // 9: M, N, O, P
  'ast_radio/text_char_qrst_upper',  // 10: Q, R, S, T
  'ast_radio/text_char_uvwx_upper',  // 11: U, V, W, X
  'ast_radio/text_char_yzab_both',   // 12: Y, Z, a, b
  'ast_radio/text_char_cdef_lower',  // 13: c, d, e, f
  'ast_radio/text_char_ghij_lower',  // 14: g, h, i, j
  'ast_radio/text_char_klmn_lower',  // 15: k, l, m, n
  'ast_radio/text_char_opqr_lower',  // 16: o, p, q, r
  'ast_radio/text_char_stuv_lower',  // 17: s, t, u, v
  'ast_radio/text_char_wxyz_lower',  // 18: w, x, y, z
  'ast_radio/text_char_pidc',        // 19: !, ?, -, ,
  'ast_radio/text_char_p012',        // 20: ., 0, 1, 2
  'ast_radio/text_char_3456',        // 21: 3, 4, 5, 6
  'ast_radio/text_char_789a',        // 22: 7, 8, 9, '
  'ast_radio/text_char_ppdp',        // 23: (, ), :, |
];

// Textbox background texture path
export const RADIO_BOX_BG_PATH = 'ast_common/aMsgWindowBgTex';
export const RADIO_BOX_BG_TLUT_PATH = 'ast_common/aMsgWindowBgTLUT';

// Prim colors from fox_radio.c
export const RADIO_BOX_COLORS = {
  blue: [60, 60, 255, 170],   // default
  red: [255, 25, 25, 170],    // sRadioUseRedBox
} as const;

export class SF64FontRenderer {
  private charCanvases = new Map<number, HTMLCanvasElement>();
  private tintedCache = new Map<string, HTMLCanvasElement>(); // tinted canvases (sync draw)
  private loaded = false;
  private textureHeaders = new Map<number, OTEXHeader>();

  get isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Load a character texture from the O2R and decode all 4 sub-characters.
   * textureIndex maps to TEXTURE_PATHS.
   */
  loadCharTexture(textureIndex: number, rawData: Uint8Array): void {
    const { header } = decodeOTEX(rawData);
    this.textureHeaders.set(textureIndex, header);

    // For each of the 4 sub-characters (palette indices)
    for (let palIdx = 0; palIdx < 4; palIdx++) {
      const charCode = textureIndex * 4 + palIdx;
      const palette = PALETTES[palIdx];

      // Decode CI4 with this palette
      const decoded = this.decodeCI4WithPalette(rawData, header, palette);
      const canvas = document.createElement('canvas');
      canvas.width = header.width;
      canvas.height = header.height;
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.createImageData(header.width, header.height);
      imgData.data.set(decoded);
      ctx.putImageData(imgData, 0, 0);
      this.charCanvases.set(charCode, canvas);
    }
  }

  private decodeCI4WithPalette(
    rawData: Uint8Array,
    header: OTEXHeader,
    palette: [number, number, number, number][],
  ): Uint8ClampedArray {
    const pixelDataOffset = 0x50;
    const rawPixels = rawData.slice(pixelDataOffset);
    const w = header.width;
    const h = header.height;
    const rgba = new Uint8ClampedArray(w * h * 4);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pos = (y * w + x) >> 1;
        if (pos >= rawPixels.length) continue;
        const byte = rawPixels[pos]!;
        const index = x % 2 === 0 ? (byte >> 4) & 0x0F : byte & 0x0F;
        const color = palette[index] ?? [0, 0, 0, 0];
        const off = (y * w + x) * 4;
        rgba[off] = color[0];
        rgba[off + 1] = color[1];
        rgba[off + 2] = color[2];
        rgba[off + 3] = color[3];
      }
    }

    return rgba;
  }

  setLoaded(): void {
    this.loaded = true;
  }

  private getTintedCanvas(charCode: number, color: string): HTMLCanvasElement | null {
    if (!this.loaded) return null;

    const key = `${charCode}:${color}`;
    const cached = this.tintedCache.get(key);
    if (cached) return cached;

    const srcCanvas = this.charCanvases.get(charCode);
    if (!srcCanvas) return null;

    // Tint: draw glyph, then source-in the desired color
    const tinted = document.createElement('canvas');
    tinted.width = SF64_CHAR_WIDTH;
    tinted.height = SF64_CHAR_HEIGHT;
    const tCtx = tinted.getContext('2d')!;
    tCtx.drawImage(srcCanvas, 0, 0);
    tCtx.globalCompositeOperation = 'source-in';
    tCtx.fillStyle = color;
    tCtx.fillRect(0, 0, SF64_CHAR_WIDTH, SF64_CHAR_HEIGHT);

    this.tintedCache.set(key, tinted);
    return tinted;
  }

  /**
   * Draw a character and return the advance width.
   * Draws canvas-to-canvas (synchronous, no Image loading).
   */
  drawChar(
    ctx: CanvasRenderingContext2D,
    charCode: number,
    x: number,
    y: number,
    scale: number,
    color: string,
  ): number {
    const glyph = this.getTintedCanvas(charCode, color);
    if (glyph) {
      ctx.drawImage(glyph, x, y, SF64_CHAR_WIDTH * scale, SF64_CHAR_HEIGHT * scale);
    }

    if (charCode >= 0x10 && charCode <= 0x17) return SF64_ARROW_ADVANCE * scale;
    return SF64_CHAR_ADVANCE * scale;
  }

  /**
   * Get all texture paths that need to be loaded.
   */
  static getTexturePaths(): string[] {
    return TEXTURE_PATHS;
  }
}

/**
 * Decode a CI8 textbox background texture with its TLUT palette.
 */
export function decodeTextboxBg(
  texData: Uint8Array,
  tlutData: Uint8Array,
): HTMLCanvasElement {
  // TLUT file has its own OTEX header (0x50 bytes) — strip it to get raw RGBA16 entries.
  // Passing the full TLUT file as palette would decode the header bytes as colors.
  const tlutRaw = tlutData.slice(0x50);

  // decodeOTEX defaults palette type to RGBA16bpp, which is correct for N64 TLUTs.
  const { header: texHeader, pixels: texPixels } = decodeOTEX(texData, tlutRaw);
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = texHeader.width;
  srcCanvas.height = texHeader.height;
  const srcCtx = srcCanvas.getContext('2d')!;
  const imgData = srcCtx.createImageData(texHeader.width, texHeader.height);
  imgData.data.set(texPixels);
  srcCtx.putImageData(imgData, 0, 0);

  // N64 uses G_TX_MIRROR to produce seamless tiling in both S and T axes.
  // Create a 2x2 mirrored canvas (original | h-flip / v-flip | hv-flip).
  const w = texHeader.width;
  const h = texHeader.height;
  const mirrored = document.createElement('canvas');
  mirrored.width = w * 2;
  mirrored.height = h * 2;
  const ctx = mirrored.getContext('2d')!;
  // Top-left: original
  ctx.drawImage(srcCanvas, 0, 0);
  // Top-right: horizontal flip
  ctx.save();
  ctx.translate(w * 2, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(srcCanvas, 0, 0);
  ctx.restore();
  // Bottom-left: vertical flip
  ctx.save();
  ctx.translate(0, h * 2);
  ctx.scale(1, -1);
  ctx.drawImage(srcCanvas, 0, 0);
  ctx.restore();
  // Bottom-right: both flips
  ctx.save();
  ctx.translate(w * 2, h * 2);
  ctx.scale(-1, -1);
  ctx.drawImage(srcCanvas, 0, 0);
  ctx.restore();

  return mirrored;
}

/** Whether a radio character ID should use a red textbox instead of blue. Matches fox_radio.c sRadioUseRedBox. */
export function isRedBoxCharacter(characterId: number): boolean {
  const id = characterId;
  return (
    // Red variants (damaged teammates): Fox(5,6), Falco(15,16), Slippy(25,26), Peppy(35,36)
    id === 5 || id === 6 ||
    id === 15 || id === 16 ||
    id === 25 || id === 26 ||
    id === 35 || id === 36 ||
    // ROB64 Red
    id === 95 || id === 96 ||
    // Andross / Andross Red
    id === 50 || id === 51 ||
    id === 55 || id === 56
  );
}
