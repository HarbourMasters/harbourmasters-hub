// VADPCM encoder — ported from SoH-AudioTool vendor/vadpcm codec
// Sources: autocorr.c, predictor.c, predictor.h, encode.c, random.h
//
// Ports the full encoding pipeline:
//   autocorrelation → predictor assignment (K-means) → codebook generation → frame encoding

import type { VadpcmCodebook } from './vadpcm-decoder';

// Constants from vadpcm.h
const FRAME_SAMPLE_COUNT = 16;
const FRAME_BYTE_SIZE = 9;
const VECTOR_SIZE = 8;
const MAX_PREDICTOR_COUNT = 16;
const ENCODE_ORDER = 2;
const PREDICTOR_ITERATIONS = 20;

// --- PRNG (random.h) ---

function vadpcmRng(state: number): number {
  return (Math.imul(state, 0xd9f5) + 0x6487ed51) >>> 0;
}

// --- Autocorrelation (autocorr.c) ---
// Computes a 3x3 symmetric autocorrelation matrix (stored as 6 floats) per frame.
// Matrix layout: m[0]=x0*x0, m[1]=x1*x0, m[2]=x1*x1, m[3]=x2*x0, m[4]=x2*x1, m[5]=x2*x2

function vadpcmAutocorr(
  frameCount: number,
  src: Int16Array,
): Float32Array[] {
  // Each frame gets 6 floats
  const corr: Float32Array[] = new Array(frameCount);
  const m = new Float32Array(6);

  for (let frame = 0; frame < frameCount; frame++) {
    m.fill(0);
    let x0 = 0, x1 = 0, x2 = 0;
    for (let i = 0; i < FRAME_SAMPLE_COUNT; i++) {
      x2 = x1;
      x1 = x0;
      x0 = src[frame * FRAME_SAMPLE_COUNT + i] * (1 / 32768);
      m[0] += x0 * x0;
      m[1] += x1 * x0;
      m[2] += x1 * x1;
      m[3] += x2 * x0;
      m[4] += x2 * x1;
      m[5] += x2 * x2;
    }
    corr[frame] = new Float32Array(m);
  }
  return corr;
}

// --- Predictor helpers (predictor.h, predictor.c) ---

function vadpcmEval(corr: Float32Array, coeff: Float32Array | number[]): number {
  return corr[0] +
    corr[2] * coeff[0] * coeff[0] +
    corr[5] * coeff[1] * coeff[1] +
    2 * (corr[4] * coeff[0] * coeff[1] -
      corr[1] * coeff[0] -
      corr[3] * coeff[1]);
}

function vadpcmEvalSolved(corr: number[], coeff: number[]): number {
  return corr[0] - corr[1] * coeff[0] - corr[3] * coeff[1];
}

function vadpcmBestError(
  frameCount: number,
  corr: Float32Array[],
): Float32Array {
  const bestError = new Float32Array(frameCount);
  for (let frame = 0; frame < frameCount; frame++) {
    const fcorr: number[] = Array.from(corr[frame]);
    const coeff = [0, 0] as number[];
    vadpcmSolve(fcorr, coeff);
    bestError[frame] = vadpcmEvalSolved(fcorr, coeff);
  }
  return bestError;
}

function vadpcmMeancorrs(
  frameCount: number,
  predictorCount: number,
  corr: Float32Array[],
  predictors: Uint8Array,
): { pcorr: number[][]; count: number[] } {
  const pcorr: number[][] = [];
  const count: number[] = [];
  for (let i = 0; i < predictorCount; i++) {
    count[i] = 0;
    pcorr[i] = [0, 0, 0, 0, 0, 0];
  }
  for (let frame = 0; frame < frameCount; frame++) {
    const predictor = predictors[frame];
    if (predictor < predictorCount) {
      count[predictor]++;
      for (let j = 0; j < 6; j++) {
        pcorr[predictor][j] += corr[frame][j];
      }
    }
  }
  for (let i = 0; i < predictorCount; i++) {
    if (count[i] > 0) {
      const a = 1 / count[i];
      for (let j = 0; j < 6; j++) {
        pcorr[i][j] *= a;
      }
    }
  }
  return { pcorr, count };
}

// 2x2 Gaussian elimination with partial pivoting (predictor.c:81-161)
function vadpcmSolve(corr: number[], coeff: number[]): void {
  const relEpsilon = 1 / 4096;
  coeff[0] = 0;
  coeff[1] = 0;

  const max = Math.max(corr[0], corr[2], corr[5]);
  const epsilon = max * relEpsilon;

  let a = corr[2];
  let b = corr[4];
  let c = corr[5];
  let x = corr[1];
  let y = corr[3];

  // Partial pivoting
  let pivot = c > a ? 1 : 0;
  if (pivot) {
    let t: number;
    t = a; a = c; c = t;
    t = x; x = y; y = t;
  }

  if (a <= epsilon) {
    return;
  }

  const a1 = 1 / a;
  const b1 = b * a1;
  const x1 = x * a1;

  const c2 = c - b1 * b;
  const y2 = y - x1 * b;

  if (Math.abs(c2) <= epsilon) {
    coeff[pivot] = x1;
    return;
  }

  const y3 = y2 / c2;
  const x4 = x1 - y3 * b1;

  coeff[pivot] = x4;
  coeff[1 - pivot] = y3;
}

function vadpcmRefinePredictors(
  frameCount: number,
  predictorCount: number,
  corr: Float32Array[],
  predictors: Uint8Array,
): { error: Float32Array; unassigned: number } {
  const { pcorr, count } = vadpcmMeancorrs(frameCount, predictorCount, corr, predictors);

  const coeff: Float32Array[] = [];
  let activeCount = 0;
  for (let i = 0; i < predictorCount; i++) {
    if (count[i] > 0) {
      const dcoeff = [0, 0] as number[];
      vadpcmSolve(pcorr[i], dcoeff);
      coeff[activeCount] = new Float32Array(dcoeff);
      activeCount++;
    }
  }

  const count2: number[] = new Array(activeCount).fill(0);
  const error = new Float32Array(frameCount);

  for (let frame = 0; frame < frameCount; frame++) {
    let fPredictor = 0;
    let fError = 0;
    for (let i = 0; i < activeCount; i++) {
      const e = vadpcmEval(corr[frame], coeff[i]);
      if (i === 0 || e < fError) {
        fPredictor = i;
        fError = e;
      }
    }
    predictors[frame] = fPredictor;
    error[frame] = fError;
    count2[fPredictor]++;
  }

  for (let i = 0; i < activeCount; i++) {
    if (count2[i] === 0) {
      return { error, unassigned: i };
    }
  }
  return { error, unassigned: activeCount };
}

// 20-iteration K-means predictor assignment (predictor.c:234-266)
function vadpcmAssignPredictors(
  frameCount: number,
  predictorCount: number,
  corr: Float32Array[],
): Uint8Array {
  const predictors = new Uint8Array(frameCount);
  if (predictorCount <= 1) {
    return predictors;
  }

  const bestError = vadpcmBestError(frameCount, corr);
  let error = new Float32Array(frameCount);
  let unassigned = predictorCount;

  for (let iter = 0; iter < PREDICTOR_ITERATIONS; iter++) {
    if (unassigned < predictorCount) {
      // Find worst frame
      let bestImprovement = error[0] - bestError[0];
      let bestIndex = 0;
      for (let frame = 1; frame < frameCount; frame++) {
        const improvement = error[frame] - bestError[frame];
        if (improvement > bestImprovement) {
          bestImprovement = improvement;
          bestIndex = frame;
        }
      }
      predictors[bestIndex] = unassigned;
    }
    const result = vadpcmRefinePredictors(frameCount, predictorCount, corr, predictors);
    error = result.error as Float32Array<ArrayBuffer>;
    unassigned = result.unassigned;
  }

  return predictors;
}

// --- Codebook vector generation (encode.c:25-51) ---

interface VectorPair {
  v0: Int16Array; // 8 values
  v1: Int16Array; // 8 values
}

function vadpcmMakeVectors(coeff: number[]): VectorPair {
  const scale = 1 << 11;
  const vectors: VectorPair = {
    v0: new Int16Array(VECTOR_SIZE),
    v1: new Int16Array(VECTOR_SIZE),
  };

  for (let i = 0; i < 2; i++) {
    let x1 = 0, x2 = 0;
    if (i === 0) {
      x2 = scale;
    } else {
      x1 = scale;
    }
    const v = i === 0 ? vectors.v0 : vectors.v1;
    for (let j = 0; j < VECTOR_SIZE; j++) {
      const x = coeff[0] * x1 + coeff[1] * x2;
      let value: number;
      if (x > 0x7fff) {
        value = 0x7fff;
      } else if (x < -0x8000) {
        value = -0x8000;
      } else {
        value = Math.round(x);
      }
      v[j] = value;
      x2 = x1;
      x1 = x;
    }
  }

  return vectors;
}

// Build codebook from frame autocorrelations and predictor assignments (encode.c:55-72)
function vadpcmMakeCodebook(
  frameCount: number,
  predictorCount: number,
  corr: Float32Array[],
  predictors: Uint8Array,
): VadpcmCodebook {
  const vectors: Int16Array[] = [];

  const { pcorr, count } = vadpcmMeancorrs(frameCount, predictorCount, corr, predictors);

  for (let i = 0; i < predictorCount; i++) {
    if (count[i] > 0) {
      const coeff = [0, 0] as number[];
      vadpcmSolve(pcorr[i], coeff);
      const pair = vadpcmMakeVectors(coeff);
      vectors.push(pair.v0);
      vectors.push(pair.v1);
    } else {
      vectors.push(new Int16Array(VECTOR_SIZE));
      vectors.push(new Int16Array(VECTOR_SIZE));
    }
  }

  return { order: ENCODE_ORDER, predictorCount, vectors };
}

// --- Frame encoding (encode.c:85-199) ---

function vadpcmGetShift(min: number, max: number): number {
  let shift = 0;
  while (shift < 12 && (min < -8 || max > 7)) {
    min >>= 1;
    max >>= 1;
    shift++;
  }
  return shift;
}

// Properly tracks best shift for header byte
function vadpcmEncodeDataFinal(
  frameCount: number,
  src: Int16Array,
  predictors: Uint8Array,
  codebook: VadpcmCodebook,
): { encoded: Uint8Array; signalMeanSquare: number; errorMeanSquare: number } {
  const encoded = new Uint8Array(frameCount * FRAME_BYTE_SIZE);
  let rngState = 0;
  let signalMeanSquare = 0;
  let errorMeanSquare = 0;

  const state = [0, 0, 0, 0];
  const accumulator = new Int32Array(8);

  for (let frame = 0; frame < frameCount; frame++) {
    const predictor = predictors[frame];
    const pvec0 = codebook.vectors[predictor * 2];
    const pvec1 = codebook.vectors[predictor * 2 + 1];

    let sumSquare = 0;
    for (let i = 0; i < FRAME_SAMPLE_COUNT; i++) {
      const value = src[frame * FRAME_SAMPLE_COUNT + i];
      sumSquare += value * value;
    }
    signalMeanSquare += sumSquare;

    // Calculate residuals
    state[2] = src[frame * FRAME_SAMPLE_COUNT + 6];
    state[3] = src[frame * FRAME_SAMPLE_COUNT + 7];

    let min = 0, max = 0;
    for (let vector = 0; vector < 2; vector++) {
      const s0 = state[vector * 2];
      const s1 = state[vector * 2 + 1];
      for (let i = 0; i < 8; i++) {
        accumulator[i] = (src[frame * FRAME_SAMPLE_COUNT + vector * 8 + i] << 11) -
          s0 * pvec0[i] - s1 * pvec1[i];
      }
      for (let i = 0; i < 8; i++) {
        const s = accumulator[i] >> 11;
        if (s < min) min = s;
        if (s > max) max = s;
        for (let j = 0; j < 7 - i; j++) {
          accumulator[i + 1 + j] -= s * pvec1[j];
        }
      }
    }

    const baseShift = vadpcmGetShift(min, max);
    const minShift = baseShift > 0 ? baseShift - 1 : 0;
    const maxShift = baseShift < 12 ? baseShift + 1 : 12;
    const initRngState = rngState;

    let bestShift = minShift;
    let bestError = Infinity;
    let bestFout = new Uint8Array(8);
    let bestS0 = 0, bestS1 = 0;

    for (let shift = minShift; shift <= maxShift; shift++) {
      rngState = initRngState;
      const fout = new Uint8Array(8);
      let error = 0;
      let s0 = state[0], s1 = state[1];

      for (let vector = 0; vector < 2; vector++) {
        for (let i = 0; i < 8; i++) {
          accumulator[i] = s0 * pvec0[i] + s1 * pvec1[i];
        }
        for (let i = 0; i < 8; i++) {
          const s = src[frame * FRAME_SAMPLE_COUNT + vector * 8 + i];
          const a = accumulator[i] >> 11;
          const bias = (rngState >> 16) >> (16 - shift);
          rngState = vadpcmRng(rngState);
          let r = (s - a + bias) >> shift;
          if (r > 7) r = 7;
          else if (r < -8) r = -8;
          accumulator[i] = r;

          const sout = r << shift;
          for (let j = 0; j < 7 - i; j++) {
            accumulator[i + 1 + j] += sout * pvec1[j];
          }
          const soutFull = sout + a;
          s0 = s1;
          s1 = soutFull;

          const serror = s - soutFull;
          error += serror * serror;
        }
        for (let i = 0; i < 4; i++) {
          fout[vector * 4 + i] =
            ((accumulator[2 * i] & 15) << 4) |
            (accumulator[2 * i + 1] & 15);
        }
      }

      if (shift === minShift || error < bestError) {
        bestShift = shift;
        bestError = error;
        bestFout = fout;
        bestS0 = s0;
        bestS1 = s1;
      }
    }

    // Update state for next frame
    state[0] = state[2];
    state[1] = state[3];
    state[2] = bestS0;
    state[3] = bestS1;

    // Write frame: header byte + 8 data bytes
    encoded[frame * FRAME_BYTE_SIZE] = (bestShift << 4) | predictor;
    encoded.set(bestFout, frame * FRAME_BYTE_SIZE + 1);

    errorMeanSquare += bestError;
  }

  const factor = 1 / (frameCount * FRAME_SAMPLE_COUNT * 32768 * 32768);
  signalMeanSquare *= factor;
  errorMeanSquare *= factor;

  return { encoded, signalMeanSquare, errorMeanSquare };
}

// --- Top-level encode function (encode.c:201-259) ---

export interface VadpcmEncodeResult {
  adpcmData: Uint8Array;
  codebook: VadpcmCodebook;
  signalMeanSquare: number;
  errorMeanSquare: number;
}

export function encodeVadpcm(
  samples: Int16Array,
  predictorCount = 4,
): VadpcmEncodeResult {
  if (predictorCount < 1 || predictorCount > MAX_PREDICTOR_COUNT) {
    throw new Error(`Predictor count must be between 1 and ${MAX_PREDICTOR_COUNT}.`);
  }

  const frameCount = Math.ceil(samples.length / FRAME_SAMPLE_COUNT);

  // Pad to frame boundary
  let input: Int16Array;
  if (samples.length % FRAME_SAMPLE_COUNT !== 0) {
    input = new Int16Array(frameCount * FRAME_SAMPLE_COUNT);
    input.set(samples);
  } else {
    input = samples;
  }

  if (frameCount === 0) {
    const vectors: Int16Array[] = [];
    for (let i = 0; i < predictorCount * ENCODE_ORDER; i++) {
      vectors.push(new Int16Array(VECTOR_SIZE));
    }
    return {
      adpcmData: new Uint8Array(0),
      codebook: { order: ENCODE_ORDER, predictorCount, vectors },
      signalMeanSquare: 0,
      errorMeanSquare: 0,
    };
  }

  // Autocorrelation
  const corr = vadpcmAutocorr(frameCount, input);

  // Assign predictors
  const framePredictors = vadpcmAssignPredictors(frameCount, predictorCount, corr);

  // Build codebook
  const codebook = vadpcmMakeCodebook(frameCount, predictorCount, corr, framePredictors);

  // Encode frames
  const { encoded, signalMeanSquare, errorMeanSquare } = vadpcmEncodeDataFinal(
    frameCount, input, framePredictors, codebook,
  );

  return { adpcmData: encoded, codebook, signalMeanSquare, errorMeanSquare };
}
