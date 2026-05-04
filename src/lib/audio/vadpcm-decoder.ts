// N64 VADPCM decoder — ported from the reference C implementation
// (SoH-AudioTool vendor/vadpcm)
//
// VADPCM frames: 9 bytes → 16 samples (int16)
// Each frame has a header byte (predictor index + scale) and 8 bytes of nibbles.

const FRAME_SAMPLE_COUNT = 16;
const FRAME_BYTE_SIZE = 9;
const VECTOR_SIZE = 8;
const MAX_ORDER = 8;
const MAX_PREDICTOR_COUNT = 16;

export interface VadpcmCodebook {
  order: number;
  predictorCount: number;
  vectors: Int16Array[]; // predictorCount * order vectors, each of size VECTOR_SIZE
}

/** Decode a codebook from the VADPCMCODES APPL chunk data */
export function parseCodebook(data: Uint8Array): VadpcmCodebook | null {
  if (data.length < 6) return null;

  // VADPCMCODES format: version(2) + order(2) + predictorCount(2) + vectors
  const version = (data[0] << 8) | data[1];
  if (version !== 0) return null; // only version 0 is supported

  const order = (data[2] << 8) | data[3];
  const predictorCount = (data[4] << 8) | data[5];

  if (order < 1 || order > MAX_ORDER) return null;
  if (predictorCount < 1 || predictorCount > MAX_PREDICTOR_COUNT) return null;

  const numVectors = order * predictorCount;
  const expectedSize = 6 + numVectors * VECTOR_SIZE * 2;
  if (data.length < expectedSize) return null;

  const vectors: Int16Array[] = [];
  for (let i = 0; i < numVectors; i++) {
    const vec = new Int16Array(VECTOR_SIZE);
    for (let j = 0; j < VECTOR_SIZE; j++) {
      const offset = 6 + (i * VECTOR_SIZE + j) * 2;
      vec[j] = (data[offset] << 8) | data[offset + 1];
    }
    vectors.push(vec);
  }

  return { order, predictorCount, vectors };
}

/** Decode VADPCM-encoded audio to PCM samples */
export function decodeVadpcm(
  codebook: VadpcmCodebook,
  adpcmData: Uint8Array,
): Int16Array {
  const frameCount = Math.floor(adpcmData.length / FRAME_BYTE_SIZE);
  if (frameCount === 0) return new Int16Array(0);

  const output = new Int16Array(frameCount * FRAME_SAMPLE_COUNT);
  const state = new Int16Array(VECTOR_SIZE); // initially zero

  for (let f = 0; f < frameCount; f++) {
    const frameOffset = f * FRAME_BYTE_SIZE;
    const header = adpcmData[frameOffset]!;
    const predictorIndex = (header >> 4) & 0x0f;
    const scale = header & 0x0f;

    // Clamp predictor index
    const predIdx = Math.min(predictorIndex, codebook.predictorCount - 1);

    // Each predictor has `order` coefficient vectors
    const sampleOffset = f * FRAME_SAMPLE_COUNT;

    // Process 16 samples in two groups of 8
    for (let group = 0; group < 2; group++) {
      // Compute prediction from state using all order vectors
      const prediction = new Float64Array(VECTOR_SIZE);
      for (let o = 0; o < codebook.order; o++) {
        const vecIdx = predIdx * codebook.order + o;
        const vec = codebook.vectors[vecIdx];
        if (!vec) continue;
        for (let j = 0; j < VECTOR_SIZE; j++) {
          prediction[j] += state[j] * vec[o * VECTOR_SIZE + j]!;
        }
      }

      // Decode 8 samples from 4 bytes (8 nibbles)
      for (let i = 0; i < VECTOR_SIZE; i++) {
        const byteIdx = frameOffset + 1 + group * 4 + Math.floor(i / 2);
        const byte = adpcmData[byteIdx]!;
        const nibble = (i & 1) === 0
          ? ((byte >> 4) & 0x0f) - 8  // high nibble, sign extend
          : (byte & 0x0f) - 8;         // low nibble, sign extend

        let sample = (nibble << scale) + Math.round(prediction[i]!);
        // Clamp to int16
        if (sample > 32767) sample = 32767;
        else if (sample < -32768) sample = -32768;

        const outIdx = sampleOffset + group * VECTOR_SIZE + i;
        output[outIdx] = sample;

        // Update state: shift left, add new sample at end
        for (let j = 0; j < VECTOR_SIZE - 1; j++) {
          state[j] = state[j + 1]!;
        }
        state[VECTOR_SIZE - 1] = sample;
      }
    }
  }

  return output;
}

/** Decode a VADPCM AIFC file to PCM Float32Array for Web Audio API */
export function decodeAifcVadpcm(aifcData: Uint8Array): { samples: Float32Array; sampleRate: number } | null {
  if (aifcData.length < 12) return null;

  // Check AIFC signature
  const form = String.fromCharCode(...aifcData.slice(0, 4));
  const kind = String.fromCharCode(...aifcData.slice(8, 12));
  if (form !== 'FORM' || kind !== 'AIFC') return null;

  let sampleRate = 0;
  let soundData: Uint8Array | null = null;
  let codebookData: Uint8Array | null = null;

  let offset = 12;
  while (offset + 8 <= aifcData.length) {
    const chunkSize = readU32BE(aifcData, offset + 4);
    if (offset + 8 + chunkSize > aifcData.length) break;

    const chunkType = String.fromCharCode(...aifcData.slice(offset, offset + 4));
    const data = aifcData.slice(offset + 8, offset + 8 + chunkSize);

    if (chunkType === 'COMM' && data.length >= 18) {
      sampleRate = Math.round(readExtended80(data, 8));
    } else if (chunkType === 'SSND' && data.length >= 8) {
      const dataOffset = readU32BE(data, 0);
      soundData = data.slice(8 + dataOffset);
    } else if (chunkType === 'APPL' && data.length >= 5) {
      const nameLen = data[4]!;
      const name = String.fromCharCode(...data.slice(5, 5 + nameLen));
      const headerLen = (5 + nameLen + 1) & ~1;
      if (name === 'VADPCMCODES') {
        codebookData = data.slice(headerLen);
      }
    }

    offset += 8 + chunkSize + (chunkSize & 1);
  }

  if (!soundData || !codebookData || sampleRate === 0) return null;

  const codebook = parseCodebook(codebookData);
  if (!codebook) return null;

  const pcm = decodeVadpcm(codebook, soundData);

  // Convert int16 to float32 (-1.0 to 1.0)
  const samples = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    samples[i] = pcm[i]! / 32768;
  }

  return { samples, sampleRate };
}

function readU32BE(data: Uint8Array, offset: number): number {
  return (data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!;
}

function readExtended80(data: Uint8Array, offset: number): number {
  const exponent = ((data[offset]! & 0x7f) << 8) | data[offset + 1]!;
  let mantissa = 0;
  for (let i = 0; i < 8; i++) {
    mantissa = (mantissa * 256) + data[offset + 2 + i]!;
  }
  if (exponent === 0 && mantissa === 0) return 0;
  const frac = mantissa / Math.pow(2, 63);
  return frac * Math.pow(2, exponent - 16383);
}
