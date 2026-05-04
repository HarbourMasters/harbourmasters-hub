export const enum TextureType {
  RGBA32bpp = 1,
  RGBA16bpp = 2,
  CI4bpp = 3,
  CI8bpp = 4,
  I4bpp = 5,
  I8bpp = 6,
  IA4bpp = 7,
  IA8bpp = 8,
  IA16bpp = 9,
  IA1bpp = 10,
  TLUT = 11,
}

export interface OTEXHeader {
  textureType: TextureType;
  width: number;
  height: number;
  dataSize: number;
}

const TEX_HEADER_OFFSET = 0x40;

export function parseOTEXHeader(data: ArrayBuffer | Uint8Array): OTEXHeader {
  const view = data instanceof Uint8Array
    ? new DataView(data.buffer, data.byteOffset, data.byteLength)
    : new DataView(data);

  const textureType = view.getUint32(TEX_HEADER_OFFSET, true) as TextureType;
  const width = view.getUint32(TEX_HEADER_OFFSET + 4, true);
  const height = view.getUint32(TEX_HEADER_OFFSET + 8, true);
  const dataSize = view.getUint32(TEX_HEADER_OFFSET + 12, true);

  return { textureType, width, height, dataSize };
}

export function decodeOTEX(
  data: Uint8Array,
  palette?: Uint8Array,
  paletteType?: TextureType,
): { header: OTEXHeader; pixels: Uint8ClampedArray } {
  const header = parseOTEXHeader(data);
  const pixelDataOffset = 0x50;

  if (header.textureType === TextureType.IA1bpp) {
    // Return a placeholder for unsupported types
    const pixels = new Uint8ClampedArray(header.width * header.height * 4);
    return { header, pixels };
  }

  const rawPixels = data.slice(pixelDataOffset);
  const paletteData = palette ? decodePalette(palette, paletteType ?? TextureType.RGBA16bpp) : undefined;

  const pixels = decodeTexture(rawPixels, header.textureType, header.width, header.height, paletteData);

  return { header, pixels };
}

function decodePalette(data: Uint8Array, type: TextureType): [number, number, number, number][] {
  if (type === TextureType.RGBA16bpp) {
    const colors: [number, number, number, number][] = [];
    for (let i = 0; i < data.length - 1; i += 2) {
      const word = (data[i] << 8) | data[i + 1];
      const r = ((word >> 11) & 0x1F) * 8;
      const g = ((word >> 6) & 0x1F) * 8;
      const b = ((word >> 1) & 0x1F) * 8;
      const a = (word & 1) ? 255 : 0;
      colors.push([r, g, b, a]);
    }
    return colors;
  }

  // RGBA32bpp palette
  const colors: [number, number, number, number][] = [];
  for (let i = 0; i < data.length - 3; i += 4) {
    colors.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
  }
  return colors;
}

function decodeTexture(
  data: Uint8Array,
  type: TextureType,
  width: number,
  height: number,
  palette?: [number, number, number, number][],
): Uint8ClampedArray {
  const pixelCount = width * height;
  const rgba = new Uint8ClampedArray(pixelCount * 4);

  switch (type) {
    case TextureType.RGBA32bpp:
      return decodeRGBA32(data, rgba, pixelCount);

    case TextureType.RGBA16bpp:
      return decodeRGBA16(data, rgba, pixelCount);

    case TextureType.CI4bpp:
      return decodeCI4(data, rgba, width, height, palette);

    case TextureType.CI8bpp:
      return decodeCI8(data, rgba, pixelCount, palette);

    case TextureType.I4bpp:
      return decodeI4(data, rgba, width, height);

    case TextureType.I8bpp:
      return decodeI8(data, rgba, pixelCount);

    case TextureType.IA4bpp:
      return decodeIA4(data, rgba, width, height);

    case TextureType.IA8bpp:
      return decodeIA8(data, rgba, pixelCount);

    case TextureType.IA16bpp:
      return decodeIA16(data, rgba, pixelCount);

    default:
      return rgba;
  }
}

function decodeRGBA32(data: Uint8Array, rgba: Uint8ClampedArray, pixelCount: number): Uint8ClampedArray {
  const len = Math.min(data.length, pixelCount * 4);
  rgba.set(data.subarray(0, len));
  return rgba;
}

function decodeRGBA16(data: Uint8Array, rgba: Uint8ClampedArray, pixelCount: number): Uint8ClampedArray {
  for (let i = 0; i < pixelCount && i * 2 + 1 < data.length; i++) {
    const word = (data[i * 2] << 8) | data[i * 2 + 1];
    const r = ((word >> 11) & 0x1F) * 8;
    const g = ((word >> 6) & 0x1F) * 8;
    const b = ((word >> 1) & 0x1F) * 8;
    const a = (word & 1) ? 255 : 0;

    const off = i * 4;
    rgba[off] = r;
    rgba[off + 1] = g;
    rgba[off + 2] = b;
    rgba[off + 3] = a;
  }
  return rgba;
}

function decodeCI4(
  data: Uint8Array,
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  palette?: [number, number, number, number][],
): Uint8ClampedArray {
  if (!palette) return rgba;
  const w = width;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < w; x++) {
      const pos = (y * w + x) >> 1;
      const byte = data[pos];
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

function decodeCI8(
  data: Uint8Array,
  rgba: Uint8ClampedArray,
  pixelCount: number,
  palette?: [number, number, number, number][],
): Uint8ClampedArray {
  if (!palette) return rgba;
  for (let i = 0; i < pixelCount && i < data.length; i++) {
    const color = palette[data[i]] ?? [0, 0, 0, 0];
    const off = i * 4;
    rgba[off] = color[0];
    rgba[off + 1] = color[1];
    rgba[off + 2] = color[2];
    rgba[off + 3] = color[3];
  }
  return rgba;
}

function decodeI4(data: Uint8Array, rgba: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const w = width;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < w; x++) {
      const pos = (y * w + x) >> 1;
      const byte = data[pos];
      const intensity = x % 2 === 0 ? (byte >> 4) & 0x0F : byte & 0x0F;
      const scaled = intensity * 17; // 0-15 → 0-255
      const off = (y * w + x) * 4;
      rgba[off] = scaled;
      rgba[off + 1] = scaled;
      rgba[off + 2] = scaled;
      rgba[off + 3] = intensity === 0 ? 0 : scaled;
    }
  }
  return rgba;
}

function decodeI8(data: Uint8Array, rgba: Uint8ClampedArray, pixelCount: number): Uint8ClampedArray {
  for (let i = 0; i < pixelCount && i < data.length; i++) {
    const off = i * 4;
    rgba[off] = data[i];
    rgba[off + 1] = data[i];
    rgba[off + 2] = data[i];
    rgba[off + 3] = data[i]; // I format: intensity = alpha (0 = transparent)
  }
  return rgba;
}

function decodeIA4(data: Uint8Array, rgba: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const w = width;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < w; x++) {
      const pos = (y * w + x) >> 1;
      const byte = data[pos];
      const ia = x % 2 === 0 ? (byte >> 4) & 0x0F : byte & 0x0F;
      const intensity = ((ia & 0x0E) >> 1);
      const scaled = ((intensity * 255) / 7) | 0;
      const alpha = (ia & 0x01) ? 255 : 0;
      const off = (y * w + x) * 4;
      rgba[off] = scaled;
      rgba[off + 1] = scaled;
      rgba[off + 2] = scaled;
      rgba[off + 3] = intensity === 0 && alpha === 0 ? 0 : alpha;
    }
  }
  return rgba;
}

function decodeIA8(data: Uint8Array, rgba: Uint8ClampedArray, pixelCount: number): Uint8ClampedArray {
  for (let i = 0; i < pixelCount && i < data.length; i++) {
    const intensity = data[i] & 0xF0;
    const alpha = ((data[i] & 0x0F) * 255 / 15) | 0;
    const off = i * 4;
    rgba[off] = intensity;
    rgba[off + 1] = intensity;
    rgba[off + 2] = intensity;
    rgba[off + 3] = alpha;
  }
  return rgba;
}

function decodeIA16(data: Uint8Array, rgba: Uint8ClampedArray, pixelCount: number): Uint8ClampedArray {
  for (let i = 0; i < pixelCount && i * 2 + 1 < data.length; i++) {
    const off = i * 4;
    rgba[off] = data[i * 2];
    rgba[off + 1] = data[i * 2];
    rgba[off + 2] = data[i * 2];
    rgba[off + 3] = data[i * 2 + 1];
  }
  return rgba;
}

export function otexToImageData(header: OTEXHeader, pixels: Uint8ClampedArray): ImageData {
  return new ImageData(pixels, header.width, header.height);
}
