import type { O2RReader } from './o2r-reader';
import { decodeOTEX, otexToImageData, type OTEXHeader } from './otex-decoder';

interface CachedTexture {
  imageData: ImageData;
  header: OTEXHeader;
}

export class ResourceResolver {
  private textureCache = new Map<string, CachedTexture>();
  private reader: O2RReader;

  constructor(reader: O2RReader) {
    this.reader = reader;
  }

  clearCache(): void {
    this.textureCache.clear();
  }

  async getTexture(path: string): Promise<{ imageData: ImageData; header: OTEXHeader }> {
    const cached = this.textureCache.get(path);
    if (cached) return cached;

    const data = await this.reader.readFile(path);
    const { header, pixels } = decodeOTEX(data);
    const imageData = otexToImageData(header, pixels);

    const result = { imageData, header };
    this.textureCache.set(path, result);
    return result;
  }

  async getTextureWithPalette(
    texturePath: string,
    palettePath: string,
  ): Promise<{ imageData: ImageData; header: OTEXHeader }> {
    const cacheKey = `${texturePath}::${palettePath}`;
    const cached = this.textureCache.get(cacheKey);
    if (cached) return cached;

    const [texData, palData] = await Promise.all([
      this.reader.readFile(texturePath),
      palettePath ? this.reader.readFile(palettePath) : Promise.resolve(undefined),
    ]);

    const { header, pixels } = decodeOTEX(texData, palData);
    const imageData = otexToImageData(header, pixels);

    const result = { imageData, header };
    this.textureCache.set(cacheKey, result);
    return result;
  }

  async getTextData(path: string): Promise<Uint8Array> {
    return this.reader.readFile(path);
  }

  hasFile(path: string): boolean {
    return this.reader.hasFile(path);
  }

  findFiles(prefix: string): string[] {
    return this.reader.findFiles(prefix);
  }

  async getFontFiles(): Promise<{ atlas?: Uint8Array; widths?: Uint8Array }> {
    const fontFiles = this.reader.findFiles('textures/nes_font_static/');

    let atlas: Uint8Array | undefined;
    let widths: Uint8Array | undefined;

    for (const path of fontFiles) {
      const data = await this.reader.readFile(path);
      if (path.includes('font')) {
        atlas = data;
      }
      if (path.includes('width')) {
        widths = data;
      }
    }

    return { atlas, widths };
  }

  /**
   * Find all kanji texture files in the O2R archive.
   * Returns paths matching textures/kanji/gMsgKanji*
   */
  getKanjiTexturePaths(): string[] {
    return this.reader.findFiles('textures/kanji/');
  }

  /**
   * Get a kanji texture path by Shift-JIS code.
   * Searches for gMsgKanji{XXXX} pattern where XXXX is the hex SJIS code.
   */
  getKanjiTexturePath(sjisCode: number): string | null {
    const hex = sjisCode.toString(16).toUpperCase().padStart(4, '0');
    const prefix = `gMsgKanji${hex}`;
    const paths = this.reader.findFiles('textures/kanji/');
    return paths.find(p => p.includes(prefix)) ?? null;
  }
}
