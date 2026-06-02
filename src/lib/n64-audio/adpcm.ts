// N64 VADPCM (4:1 ADPCM) decoder
// Universal across both SF64 and OOT — same codec, same frame format.
// Ported from sample_editor.py's vadpcm_to_pcm / _decode_frame / _build_coef_table
// Which itself is ported from tools/aifc_decode.c

import type { ParsedBook } from './types';
import { ADPCM_FRAME_BYTES, ADPCM_FRAME_SAMPLES } from './constants';

type CoefTable = number[][][]; // [pred][k][j]

function buildCoefTable(order: number, numPredictors: number, flatBook: number[]): CoefTable {
  const table: CoefTable = [];
  for (let pred = 0; pred < numPredictors; pred++) {
    const entry: number[][] = [];
    for (let k = 0; k < 8; k++) {
      entry[k] = new Array(order + 8).fill(0);
    }

    const base = pred * order * 8;
    for (let j = 0; j < order; j++) {
      for (let k = 0; k < 8; k++) {
        entry[k][j] = flatBook[base + j * 8 + k];
      }
    }

    for (let k = 1; k < 8; k++) {
      entry[k][order] = entry[k - 1][order - 1];
    }
    entry[0][order] = 1 << 11; // 2048

    for (let k = 1; k < 8; k++) {
      for (let j = 0; j < 8; j++) {
        if (j < k) {
          entry[j][k + order] = 0;
        } else {
          entry[j][k + order] = entry[j - k][order];
        }
      }
    }

    table.push(entry);
  }
  return table;
}

function decodeFrame(frame: Uint8Array, frameOffset: number, state: Int32Array, order: number, coefTable: CoefTable): void {
  const header = frame[frameOffset]!;
  const scale = 1 << (header >> 4);
  const optimalp = header & 0xF;

  const ix = new Int32Array(16);
  for (let i = 0; i < 16; i += 2) {
    const c = frame[frameOffset + 1 + i / 2]!;
    ix[i] = c >> 4;
    ix[i + 1] = c & 0xF;
  }
  for (let i = 0; i < 16; i++) {
    if (ix[i] >= 8) ix[i] -= 16;
    ix[i] *= scale;
  }

  const entry = coefTable[optimalp];
  const inVec = new Int32Array(order + 8);

  for (let half = 0; half < 2; half++) {
    if (half === 0) {
      for (let i = 0; i < order; i++) {
        inVec[i] = state[16 - order + i];
      }
    } else {
      for (let i = 0; i < order; i++) {
        inVec[i] = state[8 - order + i];
      }
    }

    for (let i = 0; i < 8; i++) {
      const ind = half * 8 + i;
      inVec[order + i] = ix[ind];
      let dp = 0;
      for (let x = 0; x < order + i; x++) {
        dp += entry[i][x] * inVec[x];
      }
      state[ind] = (dp >> 11) + ix[ind];
    }
  }
}

/** Decode N64 VADPCM bytes to signed 16-bit PCM. */
export function vadpcmToPcm(raw: Uint8Array, book: ParsedBook): Int16Array {
  const order = book.order;
  const numPredictors = book.numPredictors;
  const coefTable = buildCoefTable(order, numPredictors, book.book);

  const state = new Int32Array(16);
  const nFrames = Math.floor(raw.length / ADPCM_FRAME_BYTES);
  const output = new Int16Array(nFrames * ADPCM_FRAME_SAMPLES);

  for (let f = 0; f < nFrames; f++) {
    decodeFrame(raw, f * ADPCM_FRAME_BYTES, state, order, coefTable);
    const base = f * ADPCM_FRAME_SAMPLES;
    for (let v = 0; v < 16; v++) {
      output[base + v] = Math.max(-32768, Math.min(32767, state[v]));
    }
  }

  return output;
}

/** Convert Int16 PCM to Float32 for WebAudio. */
export function pcmToFloat32(samples: Int16Array): Float32Array {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = samples[i]! / 32768;
  }
  return out;
}

/** Create a WebAudio buffer from PCM samples. */
export function createAudioBuffer(
  ctx: AudioContext,
  samples: Int16Array,
  sampleRate = 32000,
): AudioBuffer {
  const float32 = pcmToFloat32(samples);
  const buffer = ctx.createBuffer(1, float32.length, sampleRate);
  buffer.getChannelData(0).set(float32);
  return buffer;
}
