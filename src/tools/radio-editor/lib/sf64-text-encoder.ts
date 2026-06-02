// SF64 DCT-based text blob encoder
// Reverses the decode process from sf64-text-decoder.ts
// Encodes 16-bit PCM at 22050Hz mono into the game's custom DCT codec (type 2)

const FRAME_SIZE = 256;

/**
 * Forward DCT (DCT-II) via the Hartley transform.
 * This is the inverse of `inverseDCT` in the decoder.
 */
function forwardDCT(samples: Float32Array, work: Float32Array): void {
  const size = FRAME_SIZE;
  const half = size >> 1;

  // Re-interleave: pack even samples into first half, odd into second half
  for (let i = 0; i < half; i++) {
    work[i] = samples[i * 2];
    work[half + i] = samples[i * 2 + 1];
  }

  // Apply Hartley transform (self-inverse up to normalization)
  hartleyTransform(work, 8);

  // Apply inverse of the decoder's cosine twiddle factors to get DCT coefficients
  samples[0] = work[0];
  samples[half] = work[half];

  for (let i = 1; i < half; i++) {
    const angle = Math.PI * i / (2 * size);
    const cosA = Math.cos(angle) * Math.SQRT1_2;
    const sinA = Math.sin(angle) * Math.SQRT1_2;

    const c1 = cosA - sinA;
    const c2 = cosA + sinA;

    // Inverse of: work[i] = c1*coeffs[i] + c2*coeffs[size-i]
    //             work[size-i] = c2*coeffs[i] - c1*coeffs[size-i]
    // Solve for coeffs[i] and coeffs[size-i]:
    // coeffs[i] = (c2*work[i] + c1*work[size-i]) / (2*c1*c2 + 1 - c1^2 - c2^2)
    // But simpler: det = c1*c2 - (-c2)*(-c1) = ... actually:
    // From the two equations:
    //   work[i] = c1*a + c2*b      where a=coeffs[i], b=coeffs[size-i]
    //   work[size-i] = c2*a - c1*b
    // Solving:
    //   a = (c2*work[i] + c1*work[size-i]) / (c1*c2 + c2*c1)
    //     = (c2*work[i] + c1*work[size-i]) / (2*c1*c2)
    //   b = (c1*work[i] - c2*work[size-i]) / (c1*c2 + c2*c1)  ... wait

    // Actually, matrix form:
    //   [work[i]    ]   [c1  c2] [a]
    //   [work[s-i]  ] = [c2 -c1] [b]
    // det = -c1^2 - c2^2
    // a = (-c1*work[i] - c2*work[s-i]) / det
    // b = (-c2*work[i] + c1*work[s-i]) / det

    const wi = work[i];
    const wsi = work[size - i];
    const det = -(c1 * c1 + c2 * c2);

    samples[i] = (-c1 * wi - c2 * wsi) / det;
    samples[size - i] = (-c2 * wi + c1 * wsi) / det;
  }
}

/**
 * Hartley transform — MUST be identical to the decoder's implementation.
 * DHT̃(x) = DHT(x)/sqrt(n) is self-inverse: DHT̃(DHT̃(x)) = x.
 */
function hartleyTransform(data: Float32Array, bits: number): void {
  const n = 1 << bits;
  const half = n >> 1;

  // Stage 1: butterfly
  for (let i = 0; i < half; i++) {
    const a = data[i];
    const b = data[i + half];
    data[i] = a + b;
    data[i + half] = a - b;
  }

  // Stage 2+: cascaded butterflies
  let stride = half >> 1;
  while (stride >= 1) {
    const doubleStride = stride << 1;
    for (let block = 0; block < n; block += doubleStride) {
      for (let i = 0; i < stride; i++) {
        const idx = block + i;
        const jdx = idx + stride;
        const a = data[idx];
        const b = data[jdx];
        data[idx] = a + b;
        data[jdx] = a - b;
      }
    }
    stride >>= 1;
  }

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = half;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
    if (i < j) {
      const tmp = data[i];
      data[i] = data[j];
      data[j] = tmp;
    }
  }

  // Normalize
  const scale = 1 / Math.sqrt(n);
  for (let i = 0; i < n; i++) {
    data[i] *= scale;
  }
}

/**
 * Choose the best scale factor for a block of 64 DCT coefficients.
 * Mode 2 uses 4-bit nibbles with range [-8, +7], so scale = ceil(log2(maxAbs/7)).
 */
function chooseScale(coeffs: Float32Array, offset: number): number {
  let maxAbs = 0;
  for (let i = 0; i < 64; i++) {
    maxAbs = Math.max(maxAbs, Math.abs(coeffs[offset + i]));
  }
  if (maxAbs < 1) return 0;
  return Math.max(0, Math.ceil(Math.log2(maxAbs / 7)));
}

/**
 * Encode a block of 64 coefficients using mode 2 (fixed 16-word block).
 * Each coefficient becomes a 4-bit nibble: quantized = round(coeff >> scale) + 8.
 */
function encodeBlockMode2(coeffs: Float32Array, offset: number, scale: number): Uint16Array {
  const words = new Uint16Array(16);
  for (let i = 0; i < 16; i++) {
    let word = 0;
    for (let j = 0; j < 4; j++) {
      const raw = coeffs[offset + i * 4 + j];
      const shifted = scale > 0 ? raw / (1 << scale) : raw;
      let nibble = Math.round(shifted) + 8;
      nibble = Math.max(0, Math.min(15, nibble));
      word |= nibble << (12 - j * 4);
    }
    words[i] = word;
  }
  return words;
}

/**
 * Encode a block of 64 coefficients using mode 1 (variable-length nibble).
 * Better for sparse blocks — terminates early with a high-bit nibble.
 */
function encodeBlockMode1(coeffs: Float32Array, offset: number, scale: number): Uint16Array {
  const words: number[] = [];
  let currentWord = 0;
  let nibblePos = 0;

  for (let i = 0; i < 64; i++) {
    const raw = coeffs[offset + i];
    const shifted = scale > 0 ? raw / (1 << scale) : raw;
    let nibble = Math.round(shifted) + 4;
    nibble = Math.max(0, Math.min(15, nibble));

    const isLast = i >= 63 || isTrailingZeros(coeffs, offset, i + 1);
    if (isLast) nibble = nibble | 0x08; // Set high bit to terminate

    currentWord |= nibble << (12 - nibblePos * 4);
    nibblePos++;

    if (nibblePos === 4 || isLast) {
      words.push(currentWord);
      currentWord = 0;
      nibblePos = 0;
      if (isLast) break;
    }
  }

  // Ensure at least one word
  if (words.length === 0) words.push(0x8000);

  return new Uint16Array(words);
}

function isTrailingZeros(coeffs: Float32Array, offset: number, from: number): boolean {
  for (let i = from; i < 64; i++) {
    if (Math.abs(coeffs[offset + i]) > 0.5) return false;
  }
  return true;
}

/**
 * Choose encoding mode for a block.
 * Mode 0: all near-zero (skip)
 * Mode 1: sparse (many trailing zeros)
 * Mode 2: dense (default)
 */
function chooseMode(coeffs: Float32Array, offset: number): { mode: number; scale: number } {
  let maxAbs = 0;
  let nonZero = 0;
  for (let i = 0; i < 64; i++) {
    const abs = Math.abs(coeffs[offset + i]);
    if (abs > 0.5) {
      nonZero++;
    }
    maxAbs = Math.max(maxAbs, abs);
  }

  if (maxAbs < 1) return { mode: 0, scale: 0 };

  // Mode 1 is better when sparse (< 40% non-zero)
  if (nonZero < 26) {
    const scale = chooseScale(coeffs, offset);
    return { mode: 1, scale };
  }

  const scale = chooseScale(coeffs, offset);
  return { mode: 2, scale };
}

/**
 * Encode a single DCT frame (256 samples) to compressed data.
 * Returns big-endian 16-bit words.
 */
function encodeFrame(samples: Int16Array, sampleOffset: number): Uint16Array {
  const floatSamples = new Float32Array(FRAME_SIZE);
  for (let i = 0; i < FRAME_SIZE; i++) {
    floatSamples[i] = samples[sampleOffset + i] ?? 0;
  }

  const work = new Float32Array(FRAME_SIZE);
  forwardDCT(floatSamples, work);

  // Build header and encoded blocks
  let header = 0;
  const blockData: Uint16Array[] = [];

  for (let block = 0; block < 4; block++) {
    const offset = block * 64;
    const { mode, scale } = chooseMode(floatSamples, offset);

    const modeByte = (mode << 4) | (scale & 0x0F);
    header = (header << 8) | modeByte;

    if (mode === 0) {
      blockData.push(new Uint16Array(0));
    } else if (mode === 1) {
      blockData.push(encodeBlockMode1(floatSamples, offset, scale));
    } else {
      blockData.push(encodeBlockMode2(floatSamples, offset, scale));
    }
  }

  // Calculate total size
  const totalWords = 2 + blockData.reduce((sum, d) => sum + d.length, 0);
  const result = new Uint16Array(totalWords);

  // Write header (big-endian, 2 words)
  result[0] = (header >>> 16) & 0xFFFF;
  result[1] = header & 0xFFFF;

  // Write block data
  let pos = 2;
  for (const bd of blockData) {
    result.set(bd, pos);
    pos += bd.length;
  }

  return result;
}

/**
 * Encode Int16 PCM samples to SF64 DCT-compressed format.
 * Output is big-endian 16-bit words (raw bytes for O2R storage).
 */
export function encodeSF64Audio(pcm: Int16Array): Uint8Array {
  // Pad to frame boundary
  const frameCount = Math.ceil(pcm.length / FRAME_SIZE);
  const padded = new Int16Array(frameCount * FRAME_SIZE);
  padded.set(pcm);

  const chunks: Uint8Array[] = [];

  for (let f = 0; f < frameCount; f++) {
    const words = encodeFrame(padded, f * FRAME_SIZE);

    // Convert Uint16Array (native endian) to big-endian bytes
    const bytes = new Uint8Array(words.length * 2);
    for (let i = 0; i < words.length; i++) {
      bytes[i * 2] = (words[i] >>> 8) & 0xFF;
      bytes[i * 2 + 1] = words[i] & 0xFF;
    }
    chunks.push(bytes);
  }

  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
