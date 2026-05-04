import type { ResourceResolver } from './resource-resolver';
import { FontRenderer, CHAR_SIZE } from './font-renderer';
import { IconParser } from './icon-parser';
import { BG_TEXTURE_PATHS, TEXTBOX_TINTS, INDICATOR_PATHS, CHAR_SCALE, getCharAdvance } from './textbox-renderer';
import { KANJI_POST_ADVANCE, KANJI_DEFAULT_ADVANCE } from './control-codes';

export type LineCharData =
  | { type: 'char'; charCode: number; color: string }
  | { type: 'icon'; itemId: number }
  | { type: 'kanji'; sjisCode: number; color: string };

const RENDER_SCALE = 2;

export class TextureCache {
  private resolver: ResourceResolver;
  private fontRenderer: FontRenderer;
  private iconParser: IconParser;

  private bgUrls = new Map<number, string>();
  private indicatorUrls = new Map<string, string>();
  private glyphUrls = new Map<string, string>();
  private itemIconUrls = new Map<number, string>();
  private kanjiGlyphUrls = new Map<string, string>();
  private lineUrls = new Map<string, { url: string; widthPx: number }>();

  private bgLoading = new Map<number, Promise<string | null>>();
  private indicatorLoading = new Map<string, Promise<string>>();
  private glyphLoading = new Map<string, Promise<string | null>>();
  private itemLoading = new Map<number, Promise<string | null>>();
  private kanjiGlyphLoading = new Map<string, Promise<string | null>>();
  private lineLoading = new Map<string, Promise<{ url: string; widthPx: number }>>();

  constructor(resolver: ResourceResolver, fontRenderer: FontRenderer) {
    this.resolver = resolver;
    this.fontRenderer = fontRenderer;
    this.iconParser = new IconParser(resolver);
  }

  async getBackgroundUrl(textboxType: number): Promise<string | null> {
    const cached = this.bgUrls.get(textboxType);
    if (cached !== undefined) return cached;

    const loading = this.bgLoading.get(textboxType);
    if (loading) return loading;

    const promise = this.loadBackground(textboxType);
    this.bgLoading.set(textboxType, promise);
    return promise;
  }

  private async loadBackground(textboxType: number): Promise<string | null> {
    const path = BG_TEXTURE_PATHS[textboxType];
    if (!path) {
      this.bgUrls.set(textboxType, '');
      return '';
    }

    try {
      const tex = await this.resolver.getTexture(path);

      // Source texture is 128x64. N64 uses G_TX_MIRROR to produce 256x64.
      // Type 0 (BLACK) & Type 2 (BLUE): mirror X only
      // Type 1 (WOODEN) & Type 3 (OCARINA): mirror X and Y
      const mirrorX = true;
      const mirrorY = textboxType === 1 || textboxType === 3;

      // Draw raw texture onto a temp canvas
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = tex.header.width;
      srcCanvas.height = tex.header.height;
      const srcCtx = srcCanvas.getContext('2d')!;
      srcCtx.putImageData(tex.imageData, 0, 0);

      // Create mirrored output canvas (256x64)
      const dstW = mirrorX ? tex.header.width * 2 : tex.header.width;
      const dstH = mirrorY ? tex.header.height * 2 : tex.header.height;
      const outCanvas = document.createElement('canvas');
      outCanvas.width = dstW;
      outCanvas.height = dstH;
      const ctx = outCanvas.getContext('2d')!;

      // Draw original (top-left)
      ctx.drawImage(srcCanvas, 0, 0);

      // Mirror X: draw flipped horizontally for right half
      if (mirrorX) {
        ctx.save();
        ctx.translate(dstW, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(srcCanvas, 0, 0);
        ctx.restore();
      }

      // Mirror Y: draw flipped vertically for bottom half
      if (mirrorY) {
        ctx.save();
        ctx.translate(0, dstH);
        ctx.scale(1, -1);
        // Draw the full X-mirrored row flipped vertically
        ctx.drawImage(outCanvas, 0, 0);
        ctx.restore();
      }

      // Apply tint using prim color (and env color for wooden/ocarina)
      const tint = TEXTBOX_TINTS[textboxType] ?? [0, 0, 0, 170];
      if (tint[3] > 0) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${tint[3] / 255})`;
        ctx.fillRect(0, 0, dstW, dstH);
      }

      // For WOODEN/OCARINA types, add env color as a subtle additive blend
      if (textboxType === 1) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(50, 20, 0, 0.15)';
        ctx.fillRect(0, 0, dstW, dstH);
      } else if (textboxType === 3) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, dstW, dstH);
      }

      const url = outCanvas.toDataURL('image/png');
      this.bgUrls.set(textboxType, url);
      return url;
    } catch {
      this.bgUrls.set(textboxType, '');
      return '';
    }
  }

  async getIndicatorUrl(name: 'triangle' | 'square' | 'arrow'): Promise<string> {
    const cached = this.indicatorUrls.get(name);
    if (cached) return cached;

    const loading = this.indicatorLoading.get(name);
    if (loading) return loading;

    const promise = this.loadIndicator(name);
    this.indicatorLoading.set(name, promise);
    return promise;
  }

  // Get both color variants for the pulsating animation
  async getIndicatorUrls(name: 'triangle' | 'square' | 'arrow'): Promise<{ dark: string; light: string }> {
    const darkKey = `${name}:dark`;
    const lightKey = `${name}:light`;
    const darkCached = this.indicatorUrls.get(darkKey);
    const lightCached = this.indicatorUrls.get(lightKey);
    if (darkCached && lightCached) return { dark: darkCached, light: lightCached };

    const path = INDICATOR_PATHS[name];
    try {
      const tex = await this.resolver.getTexture(path);
      const rawCanvas = document.createElement('canvas');
      rawCanvas.width = tex.header.width;
      rawCanvas.height = tex.header.height;
      const rawCtx = rawCanvas.getContext('2d')!;
      rawCtx.putImageData(tex.imageData, 0, 0);

      // Dark variant: rgb(0, 80, 200)
      const darkCanvas = document.createElement('canvas');
      darkCanvas.width = tex.header.width;
      darkCanvas.height = tex.header.height;
      const darkCtx = darkCanvas.getContext('2d')!;
      darkCtx.drawImage(rawCanvas, 0, 0);
      darkCtx.globalCompositeOperation = 'source-in';
      darkCtx.fillStyle = 'rgb(0,80,200)';
      darkCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);
      const darkUrl = darkCanvas.toDataURL('image/png');
      this.indicatorUrls.set(darkKey, darkUrl);

      // Light variant: rgb(50, 130, 255)
      const lightCanvas = document.createElement('canvas');
      lightCanvas.width = tex.header.width;
      lightCanvas.height = tex.header.height;
      const lightCtx = lightCanvas.getContext('2d')!;
      lightCtx.drawImage(rawCanvas, 0, 0);
      lightCtx.globalCompositeOperation = 'source-in';
      lightCtx.fillStyle = 'rgb(50,130,255)';
      lightCtx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);
      const lightUrl = lightCanvas.toDataURL('image/png');
      this.indicatorUrls.set(lightKey, lightUrl);

      return { dark: darkUrl, light: lightUrl };
    } catch {
      const fallback = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      return { dark: fallback, light: fallback };
    }
  }

  private async loadIndicator(name: 'triangle' | 'square' | 'arrow'): Promise<string> {
    const path = INDICATOR_PATHS[name];
    try {
      const tex = await this.resolver.getTexture(path);
      const canvas = document.createElement('canvas');
      canvas.width = tex.header.width;
      canvas.height = tex.header.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(tex.imageData, 0, 0);

      // Render as white silhouette preserving alpha — DOMPreview applies dynamic color
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const url = canvas.toDataURL('image/png');
      this.indicatorUrls.set(name, url);
      return url;
    } catch {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      this.indicatorUrls.set(name, url);
      return url;
    }
  }

  async getGlyphUrl(charCode: number, color: string): Promise<string | null> {
    if (!this.fontRenderer.isLoaded) return null;

    const key = `${charCode}:${color}`;
    const cached = this.glyphUrls.get(key);
    if (cached !== undefined) return cached;

    const loading = this.glyphLoading.get(key);
    if (loading) return loading;

    const promise = this.loadGlyph(charCode, color);
    this.glyphLoading.set(key, promise);
    return promise;
  }

  private async loadGlyph(charCode: number, color: string): Promise<string | null> {
    const key = `${charCode}:${color}`;

    if (!this.fontRenderer.isLoaded) {
      this.glyphUrls.set(key, '');
      return '';
    }

    const url = this.fontRenderer.getGlyphDataURL(charCode, color);
    if (url) {
      this.glyphUrls.set(key, url);
      return url;
    }

    this.glyphUrls.set(key, '');
    return '';
  }

  async getItemIconUrl(itemId: number): Promise<string | null> {
    const cached = this.itemIconUrls.get(itemId);
    if (cached !== undefined) return cached;

    const loading = this.itemLoading.get(itemId);
    if (loading) return loading;

    const promise = this.loadItemIcon(itemId);
    this.itemLoading.set(itemId, promise);
    return promise;
  }

  private async loadItemIcon(itemId: number): Promise<string | null> {
    try {
      const icon = await this.iconParser.getItemIcon(itemId);
      if (!icon) {
        this.itemIconUrls.set(itemId, '');
        return '';
      }
      const url = icon.canvas.toDataURL('image/png');
      this.itemIconUrls.set(itemId, url);
      return url;
    } catch {
      this.itemIconUrls.set(itemId, '');
      return '';
    }
  }

  async getKanjiGlyphUrl(sjisCode: number, color: string): Promise<string | null> {
    if (!this.fontRenderer.isKanjiLoaded) return null;

    const key = `${sjisCode}:${color}`;
    const cached = this.kanjiGlyphUrls.get(key);
    if (cached !== undefined) return cached;

    const loading = this.kanjiGlyphLoading.get(key);
    if (loading) return loading;

    const promise = this.loadKanjiGlyph(sjisCode, color);
    this.kanjiGlyphLoading.set(key, promise);
    return promise;
  }

  private async loadKanjiGlyph(sjisCode: number, color: string): Promise<string | null> {
    const key = `${sjisCode}:${color}`;

    if (!this.fontRenderer.isKanjiLoaded) {
      this.kanjiGlyphUrls.set(key, '');
      return '';
    }

    const url = this.fontRenderer.getKanjiGlyphDataURL(sjisCode, color);
    if (url) {
      this.kanjiGlyphUrls.set(key, url);
      return url;
    }

    this.kanjiGlyphUrls.set(key, '');
    return '';
  }

  getLineCharAdvances(chars: LineCharData[]): number[] {
    const advances: number[] = [];
    let cumulative = 0;
    for (const ch of chars) {
      if (ch.type === 'char') {
        cumulative += getCharAdvance(ch.charCode) * RENDER_SCALE;
      } else if (ch.type === 'kanji') {
        const postAdvance = KANJI_POST_ADVANCE[ch.sjisCode];
        const advance = postAdvance !== undefined ? postAdvance : KANJI_DEFAULT_ADVANCE;
        cumulative += advance * CHAR_SCALE * RENDER_SCALE;
      } else {
        cumulative += 24 * CHAR_SCALE * RENDER_SCALE;
      }
      advances.push(cumulative);
    }
    return advances;
  }

  async renderLineToUrl(chars: LineCharData[]): Promise<{ url: string; widthPx: number }> {
    if (chars.length === 0) {
      return { url: '', widthPx: 0 };
    }

    const cacheKey = JSON.stringify(chars);
    const cached = this.lineUrls.get(cacheKey);
    if (cached) return cached;

    const loading = this.lineLoading.get(cacheKey);
    if (loading) return loading;

    const promise = this.doRenderLine(chars, cacheKey);
    this.lineLoading.set(cacheKey, promise);
    return promise;
  }

  private async doRenderLine(chars: LineCharData[], cacheKey: string): Promise<{ url: string; widthPx: number }> {
    const glyphH = Math.ceil(CHAR_SIZE * CHAR_SCALE * RENDER_SCALE);

    // Calculate total width
    let totalWidth = 0;
    for (const ch of chars) {
      if (ch.type === 'char') {
        totalWidth += getCharAdvance(ch.charCode) * RENDER_SCALE;
      } else if (ch.type === 'kanji') {
        const postAdvance = KANJI_POST_ADVANCE[ch.sjisCode];
        const advance = postAdvance !== undefined ? postAdvance : KANJI_DEFAULT_ADVANCE;
        totalWidth += advance * CHAR_SCALE * RENDER_SCALE;
      } else {
        totalWidth += 24 * CHAR_SCALE * RENDER_SCALE;
      }
    }

    const canvasW = Math.max(1, Math.ceil(totalWidth));
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = glyphH;
    const ctx = canvas.getContext('2d')!;

    const scale = CHAR_SCALE * RENDER_SCALE;
    let curX = 0;

    for (const ch of chars) {
      if (ch.type === 'char') {
        const advance = this.fontRenderer.drawChar(ctx, ch.charCode, curX, 0, scale, ch.color);
        curX += advance;
      } else if (ch.type === 'kanji') {
        const advance = this.fontRenderer.drawKanjiChar(ctx, ch.sjisCode, curX, 0, scale, ch.color);
        curX += advance;
      } else {
        // Item icon
        const iconUrl = await this.getItemIconUrl(ch.itemId);
        const iconW = 24 * CHAR_SCALE * RENDER_SCALE;
        if (iconUrl) {
          const img = new Image();
          img.src = iconUrl;
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, curX, 0, iconW, glyphH);
          }
        }
        curX += iconW;
      }
    }

    const result = { url: canvas.toDataURL('image/png'), widthPx: canvasW };
    this.lineUrls.set(cacheKey, result);
    return result;
  }

  async preloadAllItemIcons(): Promise<Map<number, string>> {
    const result = new Map<number, string>();
    const ITEM_COUNT = 0x7A; // 0x00-0x79
    const promises: Promise<void>[] = [];
    for (let i = 0; i < ITEM_COUNT; i++) {
      promises.push((async () => {
        const url = await this.getItemIconUrl(i);
        if (url) result.set(i, url);
      })());
    }
    await Promise.all(promises);
    return result;
  }

  /**
   * Load all kanji textures from the O2R archive into the FontRenderer.
   * Scans textures/kanji/ for gMsgKanji* textures, parses the SJIS code
   * from the texture name, and loads each glyph.
   */
  async preloadKanjiGlyphs(): Promise<void> {
    if (this.fontRenderer.isKanjiLoaded) return;

    const paths = this.resolver.getKanjiTexturePaths();
    if (paths.length === 0) return;

    const promises: Promise<void>[] = [];
    // Batch load in chunks to avoid too many concurrent reads
    const BATCH_SIZE = 50;

    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
      const batch = paths.slice(i, i + BATCH_SIZE);
      promises.push((async () => {
        for (const path of batch) {
          try {
            // Extract SJIS code from texture name: gMsgKanji{XXXX}...
            const match = path.match(/gMsgKanji([0-9A-Fa-f]{4})/);
            if (!match) continue;

            const sjisCode = parseInt(match[1], 16);
            const texData = await this.resolver.getTextData(path);
            this.fontRenderer.loadKanjiGlyph(sjisCode, path, texData);
          } catch {
            // Skip failed textures
          }
        }
      })());
    }

    await Promise.all(promises);
    this.fontRenderer.setKanjiLoaded();
  }

  clear(): void {
    this.bgUrls.clear();
    this.indicatorUrls.clear();
    this.glyphUrls.clear();
    this.itemIconUrls.clear();
    this.kanjiGlyphUrls.clear();
    this.lineUrls.clear();
    this.bgLoading.clear();
    this.indicatorLoading.clear();
    this.glyphLoading.clear();
    this.itemLoading.clear();
    this.kanjiGlyphLoading.clear();
    this.lineLoading.clear();
  }
}
