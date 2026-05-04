// SoH Sample binary format reader/writer
// Ports SohSampleWriter.cpp and BuildLoopState from main.cpp
//
// Binary layout:
//   0x40-byte OSMP header
//   4 bytes: codec/medium/unk/relocated
//   U32 LE: adpcm data size + raw bytes
//   Loop info (16 bytes + optional 32 bytes)
//   Codebook: order + predictors + count + vectors

const OSMP_MAGIC = 0x4f534d50; // "OSMP"
const OSMP_VERSION = 2;
const OSMP_RESOURCE_ID_LOW = 0xDEADBEEF;
const OSMP_RESOURCE_ID_HIGH = 0xDEADBEEF;
const HEADER_SIZE = 0x40;

export interface SohSampleData {
  adpcmData: Uint8Array;
  sampleCount: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  loopCount: number;
  loopState: Int16Array; // 16 samples
  order: number;
  predictors: number;
  book: Int16Array;
}

/** Build 16-sample decoder state at the loop point (main.cpp:217-238) */
export function buildLoopState(samples: Int16Array, loopStart: number): Int16Array {
  const state = new Int16Array(16);
  if (samples.length === 0) return state;

  if (loopStart >= 16) {
    for (let i = 0; i < 16; i++) {
      state[i] = samples[loopStart - 16 + i];
    }
  } else {
    const pad = 16 - loopStart;
    for (let i = 0; i < pad; i++) {
      state[i] = 0;
    }
    for (let i = 0; i < loopStart; i++) {
      state[pad + i] = samples[i];
    }
  }
  return state;
}

function writeU8(view: DataView, offset: number, value: number): void {
  view.setUint8(offset, value);
}

function writeU16LE(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeU32LE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

function writeU64LE(view: DataView, offset: number, low: number, high: number): void {
  view.setUint32(offset, low, true);
  view.setUint32(offset + 4, high, true);
}

/** Write a .sohsample binary file */
export function writeSohSample(sample: SohSampleData): Uint8Array {
  const bookBytes = sample.book.length * 2;
  const loopStateBytes = sample.loopEnabled ? 16 * 2 : 0;
  const totalSize = HEADER_SIZE + 4 + 4 + sample.adpcmData.length +
    (sample.loopEnabled ? 16 + loopStateBytes : 16) +
    4 + 4 + 4 + bookBytes;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // OSMP header (0x40 bytes)
  let off = 0;
  writeU32LE(view, off, 0); off += 4; // padding
  writeU32LE(view, off, OSMP_MAGIC); off += 4;
  writeU32LE(view, off, OSMP_VERSION); off += 4;
  writeU64LE(view, off, OSMP_RESOURCE_ID_LOW, OSMP_RESOURCE_ID_HIGH); off += 8;
  writeU32LE(view, off, 0); off += 4;
  writeU64LE(view, off, 0, 0); off += 8;
  writeU32LE(view, off, 0); off += 4;
  // Pad to 0x40
  while (off < HEADER_SIZE) {
    writeU32LE(view, off, 0); off += 4;
  }

  // Codec info
  writeU8(view, off, 0); off += 1; // CODEC_ADPCM
  writeU8(view, off, 0); off += 1; // medium
  writeU8(view, off, 0); off += 1; // unk_bit26
  writeU8(view, off, 0); off += 1; // isRelocated

  // ADPCM data
  writeU32LE(view, off, sample.adpcmData.length); off += 4;
  bytes.set(sample.adpcmData, off); off += sample.adpcmData.length;

  // Loop info
  if (sample.loopEnabled) {
    writeU32LE(view, off, sample.loopStart); off += 4;
    writeU32LE(view, off, sample.loopEnd); off += 4;
    writeU32LE(view, off, sample.loopCount); off += 4;
    writeU32LE(view, off, 16); off += 4; // loop state size
    for (let i = 0; i < 16; i++) {
      writeU16LE(view, off, sample.loopState[i]); off += 2;
    }
  } else {
    writeU32LE(view, off, 0); off += 4;
    writeU32LE(view, off, sample.sampleCount); off += 4;
    writeU32LE(view, off, 0); off += 4;
    writeU32LE(view, off, 0); off += 4;
  }

  // Codebook
  writeU32LE(view, off, sample.order); off += 4;
  writeU32LE(view, off, sample.predictors); off += 4;
  writeU32LE(view, off, sample.book.length); off += 4;
  for (let i = 0; i < sample.book.length; i++) {
    writeU16LE(view, off, sample.book[i]); off += 2;
  }

  return bytes;
}

/** Read a .sohsample binary file */
export function readSohSample(data: Uint8Array): SohSampleData {
  if (data.length < HEADER_SIZE + 4) {
    throw new Error('File too small to be a .sohsample.');
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // Verify OSMP header
  const magic = view.getUint32(4, true);
  if (magic !== OSMP_MAGIC) {
    throw new Error('Not a .sohsample file (missing OSMP magic).');
  }

  let off = HEADER_SIZE;

  // Skip codec info (4 bytes)
  off += 4;

  // ADPCM data
  const adpcmSize = view.getUint32(off, true); off += 4;
  const adpcmData = data.slice(off, off + adpcmSize); off += adpcmSize;

  // Loop info
  const loopStart = view.getUint32(off, true); off += 4;
  const loopEnd = view.getUint32(off, true); off += 4;
  const loopCount = view.getInt32(off, true); off += 4;
  const loopStateSize = view.getUint32(off, true); off += 4;

  const loopEnabled = loopStart !== 0 || loopEnd !== 0;
  let sampleCount = 0;
  let loopState = new Int16Array(16);

  if (loopEnabled) {
    // Loop state
    for (let i = 0; i < Math.min(loopStateSize, 16); i++) {
      loopState[i] = view.getInt16(off, true); off += 2;
    }
    off += Math.max(0, loopStateSize - 16) * 2;
    sampleCount = loopEnd;
  } else {
    sampleCount = loopEnd;
  }

  // Codebook
  const order = view.getUint32(off, true); off += 4;
  const predictors = view.getUint32(off, true); off += 4;
  const bookCount = view.getUint32(off, true); off += 4;
  const book = new Int16Array(bookCount);
  for (let i = 0; i < bookCount; i++) {
    book[i] = view.getInt16(off, true); off += 2;
  }

  return {
    adpcmData,
    sampleCount,
    loopEnabled,
    loopStart,
    loopEnd,
    loopCount,
    loopState,
    order,
    predictors,
    book,
  };
}
