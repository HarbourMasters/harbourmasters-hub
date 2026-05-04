import { decodeOTEX, otexToImageData } from './otex-decoder';
import { KANJI_PRE_ADJUST, KANJI_POST_ADVANCE, KANJI_DEFAULT_ADVANCE } from './control-codes';

// OoT font width table from z_message_PAL.c sFontWidths[144]
const FONT_WIDTHS: number[] = [
  // 0x20-0x2F: space, !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /
  8, 8, 6, 9, 9, 14, 12, 3, 7, 7, 7, 9, 4, 6, 4, 9,
  // 0x30-0x3F: 0-9, :, ;, <, =, >, ?
  10, 5, 9, 9, 10, 9, 9, 9, 9, 9, 6, 6, 9, 11, 9, 11,
  // 0x40-0x4F: @, A-O
  13, 12, 9, 11, 11, 8, 8, 12, 10, 4, 8, 10, 8, 13, 11, 13,
  // 0x50-0x5F: P-Z, [, \, ], ^, _, `
  9, 13, 10, 10, 9, 10, 11, 15, 11, 10, 10, 7, 10, 7, 10, 9,
  // 0x60-0x6F: `, a-o
  5, 8, 9, 8, 9, 9, 6, 9, 8, 4, 6, 8, 4, 12, 9, 9,
  // 0x70-0x7F: p-z, {, |, }, ~, blank
  9, 9, 7, 8, 7, 8, 9, 12, 8, 9, 8, 7, 5, 7, 10, 10,
  // 0x80-0x8F: accented capitals + sharp s
  12, 6, 12, 12, 11, 8, 8, 8, 6, 6, 13, 13, 10, 10, 10, 9,
  // 0x90-0x9F: accented lowercase + button icons
  8, 8, 8, 8, 8, 9, 9, 9, 9, 6, 9, 9, 9, 9, 9, 14,
  // 0xA0-0xA7: B, C, L, R, Z, C-Up, C-Down, C-Left
  14, 14, 14, 14, 14, 14, 14, 14,
  // 0xA8-0xAF: C-Right, triangle, control stick, ?, ?, ?, ?
  14, 14, 14, 14, 14, 14, 14, 14,
];

export const CHAR_SIZE = 16;

export function getCharWidth(charCode: number): number {
  if (charCode < 0x20 || charCode >= 0x20 + FONT_WIDTHS.length) return 0;
  return FONT_WIDTHS[charCode - 0x20];
}

export function measureText(text: string): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    width += getCharWidth(text.charCodeAt(i));
  }
  return width;
}

export class FontRenderer {
  private charCanvases = new Map<number, HTMLCanvasElement>();
  private tintCache = new Map<string, HTMLCanvasElement>();
  private dataUrlCache = new Map<string, string>();
  private loaded = false;

  get isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Load a single NES font glyph from its OTEX texture data.
   * Called once per character (0x20-0xAB).
   */
  loadGlyph(charCode: number, texData: Uint8Array): void {
    const { header, pixels } = decodeOTEX(texData);
    const imageData = otexToImageData(header, pixels);

    const canvas = document.createElement('canvas');
    canvas.width = header.width;
    canvas.height = header.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    this.charCanvases.set(charCode, canvas);
  }

  setLoaded(): void {
    this.loaded = true;
  }

  private getTintedChar(charCode: number, color: string): HTMLCanvasElement | null {
    const charCanvas = this.charCanvases.get(charCode);
    if (!charCanvas) return null;

    const key = `${charCode}:${color}`;
    const cached = this.tintCache.get(key);
    if (cached) return cached;

    // Tint on an offscreen canvas: draw glyph, then use source-in to replace
    // RGB while preserving the alpha mask from I4 transparency
    const tinted = document.createElement('canvas');
    tinted.width = CHAR_SIZE;
    tinted.height = CHAR_SIZE;
    const ctx = tinted.getContext('2d')!;
    ctx.drawImage(charCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, CHAR_SIZE, CHAR_SIZE);

    this.tintCache.set(key, tinted);
    return tinted;
  }

  getGlyphDataURL(charCode: number, color: string): string | null {
    if (!this.loaded) return null;

    const key = `${charCode}:${color}`;
    const cached = this.dataUrlCache.get(key);
    if (cached) return cached;

    const tinted = this.getTintedChar(charCode, color);
    if (!tinted) return null;

    const url = tinted.toDataURL('image/png');
    this.dataUrlCache.set(key, url);
    return url;
  }

  drawChar(
    ctx: CanvasRenderingContext2D,
    charCode: number,
    x: number,
    y: number,
    scale: number,
    color: string,
  ): number {
    const tinted = this.getTintedChar(charCode, color);
    if (!tinted) return 0;

    const w = CHAR_SIZE * scale;
    const h = CHAR_SIZE * scale;
    ctx.drawImage(tinted, x, y, w, h);

    return getCharWidth(charCode) * scale;
  }

  drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    scale: number,
    color: string,
  ): number {
    let curX = x;
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const advance = this.drawChar(ctx, charCode, curX, y, scale, color);
      curX += advance;
    }
    return curX - x;
  }

  // ─── Kanji glyph rendering ──────────────────────────────

  private kanjiCharCanvases = new Map<number, HTMLCanvasElement>();
  private kanjiTintCache = new Map<string, HTMLCanvasElement>();
  private kanjiDataUrlCache = new Map<string, string>();
  private kanjiLoaded = false;

  get isKanjiLoaded(): boolean {
    return this.kanjiLoaded;
  }

  /**
   * Load a kanji glyph texture from O2R and store it.
   * The texture name follows the pattern: gMsgKanji{XXXX}{Name}Tex
   * We look it up in the O2R archive at textures/kanji/
   */
  loadKanjiGlyph(sjisCode: number, _texturePath: string, texData: Uint8Array): void {
    const { header, pixels } = decodeOTEX(texData);
    const imageData = otexToImageData(header, pixels);

    const canvas = document.createElement('canvas');
    canvas.width = header.width;
    canvas.height = header.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    this.kanjiCharCanvases.set(sjisCode, canvas);
  }

  /**
   * Mark kanji loading as complete after all glyphs are loaded
   */
  setKanjiLoaded(): void {
    this.kanjiLoaded = true;
  }

  private getKanjiTinted(sjisCode: number, color: string): HTMLCanvasElement | null {
    const key = `${sjisCode}:${color}`;
    const cached = this.kanjiTintCache.get(key);
    if (cached) return cached;

    const src = this.kanjiCharCanvases.get(sjisCode);
    if (!src) return null;

    const tinted = document.createElement('canvas');
    tinted.width = src.width;
    tinted.height = src.height;
    const ctx = tinted.getContext('2d')!;
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, tinted.width, tinted.height);

    this.kanjiTintCache.set(key, tinted);
    return tinted;
  }

  getKanjiGlyphDataURL(sjisCode: number, color: string): string | null {
    const key = `${sjisCode}:${color}`;
    const cached = this.kanjiDataUrlCache.get(key);
    if (cached !== undefined) return cached;

    const tinted = this.getKanjiTinted(sjisCode, color);
    if (!tinted) {
      this.kanjiDataUrlCache.set(key, '');
      return '';
    }

    const url = tinted.toDataURL('image/png');
    this.kanjiDataUrlCache.set(key, url);
    return url;
  }

  /**
   * Draw a kanji character and return the advance width (in scaled pixels).
   * Uses custom advances for punctuation, default 16 * scale for everything else.
   */
  drawKanjiChar(
    ctx: CanvasRenderingContext2D,
    sjisCode: number,
    x: number,
    y: number,
    scale: number,
    color: string,
  ): number {
    const tinted = this.getKanjiTinted(sjisCode, color);
    if (!tinted) return KANJI_DEFAULT_ADVANCE * scale;

    // Pre-draw X adjustment
    const preAdj = KANJI_PRE_ADJUST[sjisCode] ?? 0;
    const drawX = x + preAdj * scale;

    const w = CHAR_SIZE * scale;
    const h = CHAR_SIZE * scale;
    ctx.drawImage(tinted, drawX, y, w, h);

    // Post-draw advance
    const postAdvance = KANJI_POST_ADVANCE[sjisCode];
    if (postAdvance !== undefined) {
      return postAdvance * scale;
    }
    return KANJI_DEFAULT_ADVANCE * scale;
  }
}
