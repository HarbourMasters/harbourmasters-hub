// SF64 DCT-based text message blob decoder
// Faithful port of Torch/src/factories/sf64/audio/AudioDecompressor.cpp
// Which itself is a decompilation of the game's audio synthesis engine.

const FRAME_SIZE = 256;
const FRAME_SIZE_HALF = FRAME_SIZE >> 1;
const FRAME_BITS = 8;

// Per-decoder state (replaces static globals in the C version)
interface DecoderState {
  coeffs: Float32Array;   // DFT coefficients (256)
  work: Float32Array;     // IDCT work buffer (256)
  temp: Float32Array;     // Hartley trig cache (515)
  unk18: number;          // DMA residual
  carryover: Int16Array;  // Samples carried between frames
  carryCount: number;     // How many carryover samples
}

function makeDecoderState(): DecoderState {
  return {
    coeffs: new Float32Array(FRAME_SIZE),
    work: new Float32Array(FRAME_SIZE),
    temp: new Float32Array(515),
    unk18: 0,
    carryover: new Int16Array(FRAME_SIZE),
    carryCount: 0,
  };
}

// ---- DFT frame decoder (func_80009124) ----
// Reads variable-length coded DCT coefficients from compressed data.
// Input data is already byte-swapped to native endian.

function decodeDFTFrame(data: Int16Array, pos: { idx: number }, coeffs: Float32Array): void {
  coeffs.fill(0);

  // Read 32-bit header as 2 x int16 (native endian after BSWAP)
  const hi = data[pos.idx++]!;
  const lo = data[pos.idx++]!;
  // Header is treated as unsigned 32-bit: (hi << 16) | lo
  let header = ((hi << 16) | (lo & 0xFFFF)) >>> 0;

  for (let block = 0; block < 4; block++) {
    const blockIdx = block * 64;
    const modeByte = (header >>> 24) & 0xFF;
    const scale = modeByte & 0x0F;
    const modeType = (modeByte >>> 4) & 0x0F;
    header = (header << 8) >>> 0;

    if (modeType === 0) continue;

    switch (modeType) {
      case 1: {
        // Variable-length nibble encoding
        let p = blockIdx;
        done1: while (true) {
          const word = data[pos.idx++]!;
          for (let j = 0; j < 4; j++) {
            const nibble = (word >>> (12 - j * 4)) & 0x0F;
            coeffs[p++] = ((nibble & 7) - 4) << scale;
            if (nibble >= 8) break done1;
          }
        }
        break;
      }
      case 2: {
        // Fixed 16-word block (4 nibbles each = 64 values)
        for (let j = 0; j < 16; j++) {
          const word = data[pos.idx++]!;
          for (let k = 0; k < 4; k++) {
            coeffs[blockIdx + j * 4 + k] = ((word >>> (12 - k * 4)) & 0x0F) - 8 << scale;
          }
        }
        break;
      }
      case 3: {
        // Variable-length byte encoding
        let p = blockIdx;
        done3: while (true) {
          const word = data[pos.idx++]!;
          const b1 = (word >>> 8) & 0xFF;
          coeffs[p++] = ((b1 & 0x7F) - 0x40) << scale;
          if (b1 >= 0x80) break done3;
          const b2 = word & 0xFF;
          coeffs[p++] = ((b2 & 0x7F) - 0x40) << scale;
          if (b2 >= 0x80) break done3;
        }
        break;
      }
      case 4: {
        // 12-bit value + 4-bit skip
        let p = blockIdx;
        done4: while (true) {
          const word = data[pos.idx++]!;
          const skip = word >>> 12;
          coeffs[p] = ((word & 0xFFF) - 0x800) << scale;
          if (skip === 0) break done4;
          p += skip;
        }
        break;
      }
      case 5: {
        // 15-bit value + 1-bit flag
        let p = blockIdx;
        done5: while (true) {
          const word = data[pos.idx++]!;
          coeffs[p] = ((word & 0x7FFF) - 0x4000) << scale;
          if (word >>> 15) break done5;
          p++;
        }
        break;
      }
      case 6: {
        // 6-bit value + 2-bit skip, two per word
        let p = blockIdx;
        done6: while (true) {
          const word = data[pos.idx++]!;
          const b1 = (word >>> 8) & 0xFF;
          const skip1 = b1 >>> 6;
          coeffs[p] = ((b1 & 0x3F) - 0x20) << scale;
          if (skip1 === 0) break done6;
          p += skip1;
          const b2 = word & 0xFF;
          const skip2 = b2 >>> 6;
          coeffs[p] = ((b2 & 0x3F) - 0x20) << scale;
          if (skip2 === 0) break done6;
          p += skip2;
        }
        break;
      }
    }
  }
}

// ---- Hartley transform (AudioSynth_HartleyTransform) ----
// Multi-radix DFT with cached trig tables. Ported from Torch/AudioDecompressor.cpp.

function hartleyTransform(data: Float32Array, bits: number, temp: Float32Array): void {
  const length = 1 << bits;
  const half = length >> 1;
  const quarterCount = (length / 8) - 1;

  switch (length) {
    case 1:
      return;
    case 2: {
      const a = data[0]!;
      const b = data[1]!;
      data[0] = (a + b) * 0.7071067811865476;  // 1/sqrt(2)
      data[1] = (a - b) * 0.7071067811865476;
      return;
    }
    case 4: {
      const t0 = data[0]!;
      data[0] = (data[2]! + t0) / 2;
      data[2] = (t0 - data[2]!) / 2;
      const t1 = data[1]!;
      data[1] = (data[3]! + t1) / 2;
      data[3] = (t1 - data[3]!) / 2;
      const d0 = data[0]!;
      const d1 = data[1]!;
      data[0] = d1 + d0;
      data[1] = data[3]! + data[2]!;
      data[3] = data[2]! - data[3]!;
      data[2] = d0 - d1;
      return;
    }
  }

  // Default case: length >= 8 (for voice, length = 256)
  // Initialize cached trig tables if size changed
  if (length !== temp[0]) {
    temp[0] = length;
    const s0 = half;          // cos(2pi) table start
    const s1 = s0 + quarterCount;  // sin(2pi) table start
    const s2 = s1 + quarterCount;  // cos(6pi) table start
    const s3 = s2 + quarterCount;  // sin(6pi) table start

    let angle = 0;
    const step = 6.283185307179586 / length;
    for (let i = 0; i < quarterCount; i++) {
      temp[s0 + i] = Math.cos(angle);
      temp[s1 + i] = Math.sin(angle);
      temp[s2 + i] = Math.cos(3.0 * angle);
      temp[s3 + i] = Math.sin(3.0 * angle);
      angle += step;
    }
  }

  // Multi-stage radix-4 butterflies
  let spBC = length * 2;
  let spC0 = 1;

  for (let stage = 0; stage < bits - 1; stage++) {
    let spA8 = spBC;
    spBC >>= 1;
    const spB4 = spBC >> 3;
    const sp50 = spBC >> 2;

    let var_a0 = 1;
    do {
      for (let spCC = var_a0 - 1; spCC < length; spCC += spA8) {
        const i0 = spCC;
        const i1 = i0 + sp50;
        const i2 = i1 + sp50;
        const i3 = i2 + sp50;

        const d0 = data[i0]!;
        data[i0] = data[i2]! + d0;
        const d1 = data[i1]!;
        data[i1] = d1 + data[i3]!;
        const d2 = data[i2]!;
        data[i2] = d0 - d2 + d1 - data[i3]!;
        data[i3] = d0 - d2 - d1 + data[i3]!;

        if (sp50 > 1) {
          const j0 = spCC + spB4;
          const j1 = j0 + sp50;
          const j2 = j1 + sp50;
          const j3 = j2 + sp50;

          const e0 = data[j0]!;
          data[j0] = data[j2]! + e0;
          const e1 = data[j1]!;
          data[j1] = data[j3]! + e1;
          data[j2] = (e0 - data[j2]!) * 1.4142135623730951;
          data[j3] = (e1 - data[j3]!) * 1.4142135623730951;

          let tIdx = spC0;
          for (let c8 = 1; c8 < spB4; c8++) {
            const a0 = spCC + c8;
            const a1 = a0 + sp50;
            const a2 = a1 + sp50;
            const a3 = a2 + sp50;

            const b0 = spCC + sp50 - c8;
            const b1 = b0 + sp50;
            const b2 = b1 + sp50;
            const b3 = b2 + sp50;

            const cosVal = temp[tIdx]!;
            const sinVal = temp[half + tIdx]!;
            const cos3Val = temp[half * 2 + tIdx]!;
            const sin3Val = temp[half * 3 + tIdx]!;

            const va0 = data[a0]!;
            const va1 = data[a1]!;
            const va2 = data[a2]!;
            const va3 = data[a3]!;

            const vb0 = data[b0]!;
            const vb1 = data[b1]!;
            const vb2 = data[b2]!;
            const vb3 = data[b3]!;

            const diff02 = va0 - va2;
            const diff13 = va1 - va3;
            const diffB02 = vb0 - vb2;
            const diffB13 = vb1 - vb3;
            const sum02 = diff02 + diffB02;
            const sum13 = diff13 + diffB13;
            const sub02 = diff02 - diffB02;
            const sub13 = diff13 - diffB13;

            data[a0] = va0 + va2;
            data[a1] = va1 + va3;
            data[a2] = sum02 * cosVal + sum13 * sinVal;
            data[a3] = sub02 * cos3Val - sub13 * sin3Val;
            data[b0] = vb0 + vb2;
            data[b1] = vb1 + vb3;
            data[b2] = sum02 * sinVal - sum13 * cosVal;
            data[b3] = sub02 * sin3Val + sub13 * cos3Val;

            tIdx += spC0;
          }
        }
      }
      var_a0 = (spA8 * 2) - spBC + 1;
      spA8 *= 4;
    } while (var_a0 < length);

    spC0 *= 2;

    // Normalize by 1/sqrt(2)
    for (let i = 0; i < length; i++) {
      data[i] /= 1.4142135623730951;
    }
  }

  // Final 2-point butterflies
  let var_a0 = 1;
  let spA8 = 4;
  do {
    for (let spCC = var_a0 - 1; spCC < length; spCC += spA8) {
      const v = data[spCC]!;
      data[spCC] = data[spCC + 1]! + v;
      data[spCC + 1] = v - data[spCC + 1]!;
    }
    var_a0 = (spA8 * 2) - 1;
    spA8 *= 4;
  } while (var_a0 < length);

  // Final normalization
  for (let i = 0; i < length; i++) {
    data[i] /= 1.4142135623730951;
  }

  // Bit-reversal permutation
  let rev = 1;
  for (let i = 1; i < length; i++) {
    if (i < rev) {
      const tmp = data[rev - 1]!;
      data[rev - 1] = data[i]!;
      data[i] = tmp;
    }
    let bit = length >> 1;
    while (rev & bit) {
      rev ^= bit;
      bit >>= 1;
    }
    rev ^= bit;
  }
}

// ---- Inverse DCT (AudioSynth_InverseDiscreteCosineTransform) ----

function inverseDCT(coeffs: Float32Array, work: Float32Array, temp: Float32Array): void {
  const size = FRAME_SIZE;
  const half = FRAME_SIZE_HALF;

  // Initialize trig tables in temp if size changed
  if (size !== temp[0]) {
    const step = Math.PI / (2 * size);
    const t2 = half;
    const t3 = t2 + half;
    let a = 0.0;
    for (let i = 0; i < half; i++) {
      const cosV = Math.cos(a);
      const sinV = Math.sin(a);
      temp[t2 + i] = (cosV - sinV) * 0.7071067811865476;
      temp[t3 + i] = (cosV + sinV) * 0.7071067811865476;
      a += step;
    }
  }

  // Build combined signal for Hartley transform
  work[0] = coeffs[0];
  work[half] = coeffs[half];

  for (let i = 1; i < half; i++) {
    const c1 = temp[half + i]!;  // (cos - sin) * sqrt(2)/2
    const c2 = temp[half * 2 + i]!;  // (cos + sin) * sqrt(2)/2
    work[i] = c1 * coeffs[i]! + c2 * coeffs[size - i]!;
    work[size - i] = c2 * coeffs[i]! - c1 * coeffs[size - i]!;
  }

  hartleyTransform(work, FRAME_BITS, temp);

  // De-interleave: even entries from first half, odd entries from second half (reversed)
  for (let i = 0; i < half; i++) {
    coeffs[i * 2] = work[i]!;
    coeffs[(size - 1) - i * 2] = work[half + i]!;
  }
}

// ---- Frame decode (func_80009504) ----

function decodeFrame(
  data: Int16Array,
  pos: { idx: number },
  state: DecoderState,
): void {
  decodeDFTFrame(data, pos, state.coeffs);
  inverseDCT(state.coeffs, state.work, state.temp);

  for (let i = 0; i < FRAME_SIZE; i++) {
    let val = state.coeffs[i]!;
    if (val > 32767) val = 32767;
    if (val < -32767) val = -32767;
    state.coeffs[i] = val;
  }
}

// ---- DMA manager (func_8000967C) ----

function decodeFrames(
  data: Int16Array,
  totalLength: number,
  output: Int16Array,
  outOffset: number,
  state: DecoderState,
): number {
  // Copy carryover from previous call
  for (let i = 0; i < state.carryCount; i++) {
    output[outOffset + i] = state.carryover[i]!;
  }

  let writePos = state.carryCount;
  const remaining = totalLength - state.carryCount;
  const frameCount = Math.ceil(remaining / FRAME_SIZE);
  state.carryCount = (frameCount * FRAME_SIZE) + state.carryCount - totalLength;

  const pos = { idx: 0 };
  for (let i = 0; i < frameCount; i++) {
    decodeFrame(data, pos, state);
    for (let j = 0; j < FRAME_SIZE; j++) {
      output[outOffset + writePos + j] = state.coeffs[j]! | 0;
    }
    writePos += FRAME_SIZE;
  }

  // Save carryover for next call
  for (let i = 0; i < state.carryCount; i++) {
    state.carryover[i] = output[outOffset + totalLength + i]!;
  }

  return frameCount;
}

// ---- Public API ----

/**
 * Decode SF64 DCT-compressed audio to 16-bit PCM samples.
 * Ported from Torch's AudioDecompressor.cpp (DecompressAudio + func_8000967C).
 */
export function decompressSF64Audio(compressedData: Uint8Array): Int16Array {
  if (compressedData.length < 2) return new Int16Array(0);

  // Byte-swap from big-endian to little-endian (BSWAP16 loop)
  const swapped = new Uint8Array(compressedData.length);
  for (let i = 0; i < swapped.length - 1; i += 2) {
    swapped[i] = compressedData[i + 1]!;
    swapped[i + 1] = compressedData[i]!;
  }

  // View as int16 array (now in native byte order)
  const data = new Int16Array(swapped.buffer, swapped.byteOffset, Math.floor(swapped.length / 2));

  // Allocate output buffer — at most data.length / 2 samples per 2 bytes, but we output 256 per frame
  // Use a generous output buffer
  const maxFrames = Math.ceil(data.length / FRAME_SIZE) + 1;
  const output = new Int16Array(maxFrames * FRAME_SIZE);

  const state = makeDecoderState();
  const frameCount = decodeFrames(data, data.length, output, 0, state);

  const totalSamples = Math.min(frameCount * FRAME_SIZE, output.length);
  return output.slice(0, totalSamples);
}

/**
 * Convert Int16 PCM to Float32 for WebAudio.
 */
export function pcmToFloat32(samples: Int16Array): Float32Array {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = samples[i]! / 32768;
  }
  return out;
}

/**
 * Create a WebAudio buffer from PCM samples at the given sample rate.
 */
export function createAudioBuffer(
  ctx: AudioContext,
  samples: Int16Array,
  sampleRate = 22050,
): AudioBuffer {
  const float32 = pcmToFloat32(samples);
  const buffer = ctx.createBuffer(1, float32.length, sampleRate);
  buffer.getChannelData(0).set(float32);
  return buffer;
}
