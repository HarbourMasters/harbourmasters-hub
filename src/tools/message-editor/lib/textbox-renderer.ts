import type { ResourceResolver } from './resource-resolver';
import { CTRL } from './control-codes';

export const N64_WIDTH = 320;
export const N64_HEIGHT = 240;
export const TEXTBOX_WIDTH = 256;
export const TEXTBOX_HEIGHT = 64;
export const R_TEXTBOX_X = 34;

// Language-dependent text constants from z_message_PAL.c:2750-2762
export const R_TEXT_CHAR_SCALE_NES = 75;
export const R_TEXT_CHAR_SCALE_JP = 88;
export const R_TEXT_LINE_SPACING_NES = 12;
export const R_TEXT_LINE_SPACING_JP = 18;
export const R_TEXT_INIT_XPOS_NES = 65;
export const R_TEXT_INIT_XPOS_JP = 50;

// Legacy aliases (will be removed once all consumers use the new names)
export const TEXT_INIT_X = R_TEXT_INIT_XPOS_NES;
export const TEXT_INIT_Y = 8;
export const TEXT_LINE_SPACING = R_TEXT_LINE_SPACING_NES;
export const CHAR_SCALE = R_TEXT_CHAR_SCALE_NES / 100;

// Drop shadow offset (pixels, before scaling)
export const R_TEXT_DROP_SHADOW_OFFSET = 1;

const TEXTBOX_Y_TOP = 38;
const TEXTBOX_Y_MID = 90;
const TEXTBOX_Y_BOTTOM = 142;

// Y offset within textbox based on number of NEWLINE-terminated text lines
// From z_message_PAL.c:2339-2348
export function getTextInitY(lineCount: number, textboxType: number): number {
  if (textboxType === 4) return 8; // NONE_BOTTOM always uses Y+8
  if (lineCount <= 0) return 26;
  if (lineCount === 1) return 20;
  if (lineCount === 2) return 16;
  return 8;
}

// End icon Y offsets from z_message_PAL.c:4408-4410
export const TEXTBOX_END_ICON_Y_OFFSETS = [59, 59, 59, 59, 34, 59];

// Correct texture mapping from z_message_PAL.c messageStaticIndices = { 0, 1, 3, 2 }
export const BG_TEXTURE_PATHS: Record<number, string | null> = {
  0: 'textures/message_static/gDefaultMessageBackgroundTex',   // BLACK → msgStaticTbl[0]
  1: 'textures/message_static/gSignMessageBackgroundTex',      // WOODEN → msgStaticTbl[1]
  2: 'textures/message_static/gFadingMessageBackgroundTex',    // BLUE → msgStaticTbl[3]
  3: 'textures/message_static/gNoteStaffMessageBackgroundTex', // OCARINA → msgStaticTbl[2]
  4: null,  // NONE_BOTTOM — no background drawn
  5: 'textures/message_static/gFadingMessageBackgroundTex',    // NONE_NO_SHADOW
  11: 'textures/message_static/gNoteStaffMessageBackgroundTex', // CREDITS
};

export const INDICATOR_PATHS = {
  triangle: 'textures/message_static/gMessageContinueTriangleTex',
  square: 'textures/message_static/gMessageEndSquareTex',
  arrow: 'textures/message_static/gMessageArrowTex',
};

// Tint colors from z_message_PAL.c:2856-2881
export const TEXTBOX_TINTS: Record<number, [number, number, number, number]> = {
  0: [0, 0, 0, 170],
  1: [70, 50, 30, 230],
  2: [0, 10, 50, 170],
  3: [255, 0, 0, 180],
  4: [0, 0, 0, 0],
  5: [0, 0, 0, 170],
  11: [0, 10, 50, 170],
};

// Per-type text colors from z_message_PAL.c:492-575 Message_SetTextColor
export function getColorCSS(colorId: number, textboxType: number): string {
  const isWooden = textboxType === 1;
  const isNoneNoShadow = textboxType === 5;
  switch (colorId) {
    case 0x40: // DEFAULT
      if (isNoneNoShadow) return 'rgb(0,0,0)';
      return 'rgb(255,255,255)';
    case 0x41: // RED
      if (isWooden) return 'rgb(255,120,0)';
      return 'rgb(255,60,60)';
    case 0x42: // ADJUSTABLE
      return 'rgb(0,255,0)'; // simplified — game uses dynamic R_TEXT_ADJUST_COLOR values
    case 0x43: // BLUE
      if (isWooden) return 'rgb(80,110,255)';
      return 'rgb(80,90,255)';
    case 0x44: // LIGHTBLUE
      if (isWooden) return 'rgb(90,180,255)';
      if (isNoneNoShadow) return 'rgb(80,150,180)';
      return 'rgb(100,180,255)';
    case 0x45: // PURPLE
      if (isWooden) return 'rgb(210,100,255)';
      return 'rgb(255,150,180)';
    case 0x46: // YELLOW
      if (isWooden) return 'rgb(255,255,30)';
      return 'rgb(225,255,50)';
    case 0x47: // BLACK
      return 'rgb(0,0,0)';
    default:
      return 'rgb(255,255,255)';
  }
}

// Indicator icon blue tint from z_message_PAL.c:579-604
const INDICATOR_COLOR_A = 'rgb(0,80,200)';
const INDICATOR_COLOR_B = 'rgb(50,130,255)';

export type BoxEndType = 'triangle' | 'arrow' | 'square' | 'none';

export interface BoxInfo {
  data: Uint8Array;
  isLast: boolean;
  endType: BoxEndType;
}

export class TextboxRenderer {
  private bgCache = new Map<string, HTMLCanvasElement>();
  private indicatorCache = new Map<string, HTMLCanvasElement>();
  private resolver: ResourceResolver;

  constructor(resolver: ResourceResolver) {
    this.resolver = resolver;
  }

  private async getBackgroundCanvas(type: number): Promise<HTMLCanvasElement | null> {
    const path = BG_TEXTURE_PATHS[type];
    if (!path) return null;

    const cached = this.bgCache.get(path);
    if (cached) return cached;

    const tex = await this.resolver.getTexture(path);
    const canvas = document.createElement('canvas');
    canvas.width = tex.header.width;
    canvas.height = tex.header.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(tex.imageData, 0, 0);

    this.bgCache.set(path, canvas);
    return canvas;
  }

  private async getIndicatorCanvas(name: 'triangle' | 'square' | 'arrow'): Promise<HTMLCanvasElement> {
    const path = INDICATOR_PATHS[name];
    const cached = this.indicatorCache.get(path);
    if (cached) return cached;

    const tex = await this.resolver.getTexture(path);
    const canvas = document.createElement('canvas');
    canvas.width = tex.header.width;
    canvas.height = tex.header.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(tex.imageData, 0, 0);

    this.indicatorCache.set(path, canvas);
    return canvas;
  }

  private tintIndicator(indicator: HTMLCanvasElement, color: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = indicator.width;
    canvas.height = indicator.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(indicator, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  splitIntoBoxes(data: Uint8Array): BoxInfo[] {
    const rawBoxes: { data: Uint8Array; breakCode?: number }[] = [];
    let start = 0;
    let i = 0;

    while (i < data.length) {
      const byte = data[i];
      if (byte === CTRL.BOX_BREAK || byte === CTRL.BOX_BREAK_DELAYED) {
        rawBoxes.push({ data: data.slice(start, i), breakCode: byte });
        start = i + 1;
        i++;
      } else if (byte < 0x20) {
        i += 1 + this.getControlCodeArgCount(byte);
      } else {
        i++;
      }
    }

    if (start < data.length) {
      rawBoxes.push({ data: data.slice(start) });
    }

    if (rawBoxes.length === 0) {
      rawBoxes.push({ data: new Uint8Array(0) });
    }

    // Determine end type per box based on the control codes inside
    return rawBoxes.map((box, idx) => {
      const isLast = idx === rawBoxes.length - 1;
      const endType = this.determineEndType(box.data, isLast, box.breakCode);
      return { data: box.data, isLast, endType };
    });
  }

  private determineEndType(data: Uint8Array, isLast: boolean, breakCode?: number): BoxEndType {
    // If the box ended with BOX_BREAK, it's awaiting input
    if (breakCode === CTRL.BOX_BREAK || breakCode === CTRL.BOX_BREAK_DELAYED) {
      return 'triangle';
    }

    // Scan for choice/choice/other end-type control codes
    let i = 0;
    while (i < data.length) {
      const byte = data[i];
      if (byte < 0x20) {
        if (byte === CTRL.TWO_CHOICE || byte === CTRL.THREE_CHOICE) {
          return 'arrow';
        }
        if (byte === CTRL.AWAIT_BUTTON_PRESS) {
          return 'triangle';
        }
        if (byte === CTRL.FADE || byte === CTRL.FADE2) {
          return 'none'; // fades away
        }
        if (byte === CTRL.PERSISTENT) {
          return 'none'; // stays on screen
        }
        if (byte === CTRL.END) {
          return 'square';
        }
        i += 1 + this.getControlCodeArgCount(byte);
      } else {
        i++;
      }
    }

    // No explicit end-type control code found
    if (isLast) {
      return 'square'; // last box gets the end square
    }

    return 'triangle'; // default: awaiting input to continue
  }

  private getControlCodeArgCount(code: number): number {
    switch (code) {
      case CTRL.COLOR: return 1;
      case CTRL.SHIFT: return 1;
      case CTRL.SFX: return 2;
      case CTRL.ITEM_ICON: return 1;
      case CTRL.TEXT_SPEED: return 1;
      case CTRL.BACKGROUND: return 3;
      case CTRL.OCARINA: return 3;
      case CTRL.HIGHSCORE: return 1;
      case CTRL.TEXTID: return 2;
      case CTRL.FADE: return 1;
      case CTRL.FADE2: return 2;
      case CTRL.BOX_BREAK_DELAYED: return 1;
      default: return 0;
    }
  }

  getTextboxY(pos: number): number {
    switch (pos) {
      case 1: return TEXTBOX_Y_TOP;
      case 2: return TEXTBOX_Y_MID;
      case 3: return TEXTBOX_Y_BOTTOM;
      default: return TEXTBOX_Y_BOTTOM;
    }
  }

  async drawMessage(
    ctx: CanvasRenderingContext2D,
    textboxType: number,
    textboxYPos: number,
    data: Uint8Array,
    fontRenderer: { drawText: (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string) => number; drawChar: (ctx: CanvasRenderingContext2D, charCode: number, x: number, y: number, scale: number, color: string) => number },
    renderScale: number,
    revealChars?: number,
    blinkPhase?: number, // 0-1 for blinking indicator
  ): Promise<void> {
    const boxes = this.splitIntoBoxes(data);
    const yBase = this.getTextboxY(textboxYPos);
    const boxSpacing = 4;
    let totalChars = 0;

    for (let boxIdx = 0; boxIdx < boxes.length; boxIdx++) {
      const box = boxes[boxIdx];
      const boxY = yBase + boxIdx * (TEXTBOX_HEIGHT + boxSpacing);
      const bx = (N64_WIDTH - TEXTBOX_WIDTH) / 2;

      // Draw background (if applicable)
      const bgCanvas = await this.getBackgroundCanvas(textboxType);
      if (bgCanvas) {
        const tint = TEXTBOX_TINTS[textboxType] ?? [0, 0, 0, 170];
        ctx.save();
        ctx.drawImage(bgCanvas, bx * renderScale, boxY * renderScale, TEXTBOX_WIDTH * renderScale, TEXTBOX_HEIGHT * renderScale);
        if (tint[3] > 0) {
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${tint[3] / 255})`;
          ctx.fillRect(bx * renderScale, boxY * renderScale, TEXTBOX_WIDTH * renderScale, TEXTBOX_HEIGHT * renderScale);
        }
        ctx.restore();
      }

      // Draw text content
      let charX = TEXT_INIT_X;
      let charY = TEXT_INIT_Y;
      let currentColor = getColorCSS(0x40, textboxType);
      let di = 0;

      while (di < box.data.length) {
        if (revealChars !== undefined && totalChars >= revealChars) break;

        const byte = box.data[di];

        if (byte === CTRL.NEWLINE) {
          charY += TEXT_LINE_SPACING;
          charX = TEXT_INIT_X;
          di++;
        } else if (byte === CTRL.COLOR) {
          const colorId = box.data[di + 1];
          currentColor = getColorCSS(colorId, textboxType);
          di += 2;
        } else if (byte === CTRL.SHIFT) {
          charX += box.data[di + 1];
          di += 2;
        } else if (byte === CTRL.NAME) {
          fontRenderer.drawText(ctx, 'Link', charX * renderScale, (boxY + charY) * renderScale, CHAR_SCALE * renderScale, currentColor);
          charX += 28;
          di++;
          totalChars++;
        } else if (byte === CTRL.ITEM_ICON) {
          const iconId = box.data[di + 1];
          fontRenderer.drawText(ctx, `[${iconId}]`, charX * renderScale, (boxY + charY) * renderScale, CHAR_SCALE * renderScale, '#ffff00');
          charX += 24;
          di += 2;
        } else if (byte < 0x20) {
          di += 1 + this.getControlCodeArgCount(byte);
        } else {
          fontRenderer.drawChar(ctx, byte, charX * renderScale, (boxY + charY) * renderScale, CHAR_SCALE * renderScale, currentColor);
          charX += getCharAdvance(byte);
          di++;
          totalChars++;
        }
      }

      // Draw indicator icon based on end type
      const indX = (bx + TEXTBOX_WIDTH / 2 - 8) * renderScale;
      const indY = (boxY + TEXTBOX_HEIGHT - 18) * renderScale;

      if (box.endType === 'triangle' || box.endType === 'arrow' || box.endType === 'square') {
        const rawIcon = await this.getIndicatorCanvas(
          box.endType === 'arrow' ? 'arrow' : box.endType === 'triangle' ? 'triangle' : 'square'
        );
        // Blink between two blue colors
        const blinkAlpha = blinkPhase !== undefined ? 0.6 + 0.4 * Math.sin(blinkPhase * Math.PI * 2) : 1;
        const color = blinkPhase !== undefined
          ? (blinkPhase % 1 < 0.5 ? INDICATOR_COLOR_A : INDICATOR_COLOR_B)
          : INDICATOR_COLOR_B;
        const tinted = this.tintIndicator(rawIcon, color);
        ctx.save();
        ctx.globalAlpha = blinkAlpha;
        ctx.drawImage(tinted, indX, indY, 16 * renderScale, 16 * renderScale);
        ctx.restore();
      }
    }
  }

}

const CHAR_WIDTHS = [
  8, 8, 6, 9, 9, 14, 12, 3, 7, 7, 7, 9, 4, 6, 4, 9,
  10, 5, 9, 9, 10, 9, 9, 9, 9, 9, 6, 6, 9, 11, 9, 11,
  13, 12, 9, 11, 11, 8, 8, 12, 10, 4, 8, 10, 8, 13, 11, 13,
  9, 13, 10, 10, 9, 10, 11, 15, 11, 10, 10, 7, 10, 7, 10, 9,
  5, 8, 9, 8, 9, 9, 6, 9, 8, 4, 6, 8, 4, 12, 9, 9,
  9, 9, 7, 8, 7, 8, 9, 12, 8, 9, 8, 7, 5, 7, 10, 10,
  12, 6, 12, 12, 11, 8, 8, 8, 6, 6, 13, 13, 10, 10, 10, 9,
  8, 8, 8, 8, 8, 9, 9, 9, 9, 6, 9, 9, 9, 9, 9, 14,
  14, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 14, 14, 14,
];

export function getCharAdvance(charCode: number): number {
  if (charCode < 0x20 || charCode >= 0x20 + CHAR_WIDTHS.length) return 8 * CHAR_SCALE;
  return CHAR_WIDTHS[charCode - 0x20]! * CHAR_SCALE;
}
