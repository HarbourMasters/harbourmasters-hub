// OOT (Ship of Harkinian) binary format parsers
// OOT uses single-resource entries (OSMP) with loop+book embedded.
// No CRC64 cross-referencing — everything is self-contained.

import type { ParsedSample, ParsedBook, ParsedLoop } from './types';
import { BODY_OFFSET, ADPCM_FRAME_BYTES, ADPCM_FRAME_SAMPLES, CODEC_ADPCM, CODEC_S16 } from './constants';

// ─── OOT Sample binary parsing (OSMP V2) ──────────────────────────────────
// Layout: codec(u8) + medium(u8) + unk_bit26(u8) + isRelocated(u8) + size(u32)
//         + raw[u8×size]
//         + loop: start(u32) + end(u32) + count(u32) + loopStateCount(u32) + state[i16×count]
//         + book: order(i32) + npredictors(i32) + bookDataCount(u32) + book[i16×count]

export function parseOotSampleBinary(data: Uint8Array): ParsedSample | null {
  const off = BODY_OFFSET;
  if (data.length < off + 8) return null;

  const codec = data[off]!;
  const medium = data[off + 1]!;
  const size =
    data[off + 4]! | (data[off + 5]! << 8) | (data[off + 6]! << 16) | (data[off + 7]! << 24);

  if (data.length < off + 8 + size) return null;

  const raw = data.slice(off + 8, off + 8 + size);
  let pos = off + 8 + size;

  // Parse embedded loop
  let loop: ParsedLoop | null = null;
  if (data.length >= pos + 16) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const start = view.getUint32(pos, true);
    const end = view.getUint32(pos + 4, true);
    const count = view.getUint32(pos + 8, true);
    const loopStateCount = view.getUint32(pos + 12, true);
    const state: number[] = [];
    if (data.length >= pos + 16 + loopStateCount * 2) {
      for (let i = 0; i < loopStateCount && i < 16; i++) {
        state.push(view.getInt16(pos + 16 + i * 2, true));
      }
    }
    loop = { start, end, count, state };
    pos += 16 + loopStateCount * 2;
  }

  // Parse embedded book
  let book: ParsedBook | null = null;
  if (data.length >= pos + 12) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const order = view.getInt32(pos, true);
    const numPredictors = view.getInt32(pos + 4, true);
    const bookDataCount = view.getUint32(pos + 8, true);
    const book: number[] = [];
    if (data.length >= pos + 12 + bookDataCount * 2) {
      for (let i = 0; i < bookDataCount; i++) {
        book.push(view.getInt16(pos + 12 + i * 2, true));
      }
      const parsedBook: ParsedBook = { order, numPredictors, book };
      // Overwrite the outer null with parsed book (need to use the variable)
      const adpcmFrames = codec === CODEC_ADPCM ? Math.floor(size / ADPCM_FRAME_BYTES) : 0;
      const pcmSamples = codec === CODEC_ADPCM ? adpcmFrames * ADPCM_FRAME_SAMPLES
        : codec === CODEC_S16 ? Math.floor(size / 2) : 0;

      return {
        codec, medium, size, raw,
        loop, book: parsedBook,
        isRedirect: false,
        pcmSamples, adpcmFrames,
        bookHash: 0n, loopHash: 0n,
      };
    }
  }

  // Fallback with no book
  const adpcmFrames = codec === CODEC_ADPCM ? Math.floor(size / ADPCM_FRAME_BYTES) : 0;
  const pcmSamples = codec === CODEC_ADPCM ? adpcmFrames * ADPCM_FRAME_SAMPLES
    : codec === CODEC_S16 ? Math.floor(size / 2) : 0;

  return {
    codec, medium, size, raw,
    loop, book,
    isRedirect: false,
    pcmSamples, adpcmFrames,
    bookHash: 0n, loopHash: 0n,
  };
}

// ─── OOT SoundFont binary parsing (OSFT V2) ───────────────────────────────
// Complex format with drums, instruments, sfx — each with envelopes and tuning.
// For now, we expose a simplified version focused on sample→tuning resolution.

export interface OotDrum {
  pan: number;
  tuning: number;
  samplePath: string;
}

export interface OotInstrument {
  normalRangeLo: number;
  normalRangeHi: number;
  low: { samplePath: string; tuning: number } | null;
  normal: { samplePath: string; tuning: number } | null;
  high: { samplePath: string; tuning: number } | null;
}

export interface OotSoundFont {
  fntIndex: number;
  sampleBankId1: number;
  sampleBankId2: number;
  drums: OotDrum[];
  instruments: OotInstrument[];
}

/** Parse an OOT SoundFont binary (OSFT V2).
 * Note: sample references are by archive path string, not hash. */
export function parseOotSoundFontBinary(data: Uint8Array): OotSoundFont | null {
  const off = BODY_OFFSET;
  if (data.length < off + 16) return null;

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let pos = off;

  const fntIndex = view.getInt32(pos, true);
  pos += 4;
  // medium(i8) + cachePolicy(i8)
  pos += 2;
  const data1 = view.getUint16(pos, true);
  pos += 2;
  const sampleBankId1 = data1 >> 8;
  const sampleBankId2 = data1 & 0xFF;
  // data2(u16) + data3(u16)
  pos += 4;

  if (data.length < pos + 12) return null;
  const drumCount = view.getUint32(pos, true);
  pos += 4;
  const instrumentCount = view.getUint32(pos, true);
  pos += 4;
  // skip sfxCount
  pos += 4;

  const drums: OotDrum[] = [];
  const instruments: OotInstrument[] = [];

  // Parse drums
  for (let i = 0; i < drumCount; i++) {
    if (data.length < pos + 8) break;
    // skip releaseRate(u8)
    const pan = data[pos + 1]!;
    pos += 3; // releaseRate + pan + loaded

    const envelopeCount = view.getUint32(pos, true);
    pos += 4;
    pos += envelopeCount * 4; // skip envelopes (delay:i16 + arg:i16 each)

    const hasSample = data[pos]!;
    pos += 1;
    // Read string (length-prefixed: u16 length + chars)
    let samplePath = '';
    if (hasSample && data.length >= pos + 4) {
      const strLen = view.getUint32(pos, true);
      pos += 4;
      if (data.length >= pos + strLen) {
        samplePath = new TextDecoder().decode(data.slice(pos, pos + strLen));
        pos += strLen;
      }
    }
    const tuning = view.getFloat32(pos, true);
    pos += 4;

    if (samplePath) {
      drums.push({ pan, tuning, samplePath });
    }
  }

  // Parse instruments
  for (let i = 0; i < instrumentCount; i++) {
    if (data.length < pos + 8) break;
    const isValid = data[pos]!;
    pos += 1; // isValid
    pos += 1; // loaded

    const normalRangeLo = data[pos]!;
    const normalRangeHi = data[pos + 1]!;
    pos += 3; // normalRangeLo + normalRangeHi + releaseRate

    const envelopeCount = view.getInt32(pos, true);
    pos += 4;
    pos += envelopeCount * 4; // skip envelopes

    // Low sound
    let low: OotInstrument['low'] = null;
    const hasLow = data[pos]!;
    pos += 1;
    if (hasLow) {
      pos += 1; // hasRef byte
      let sp = '';
      const strLen = view.getUint32(pos, true);
      pos += 4;
      if (data.length >= pos + strLen) {
        sp = new TextDecoder().decode(data.slice(pos, pos + strLen));
        pos += strLen;
      }
      const t = view.getFloat32(pos, true);
      pos += 4;
      if (sp) low = { samplePath: sp, tuning: t };
    }

    // Normal sound
    let normal: OotInstrument['normal'] = null;
    const hasNormal = data[pos]!;
    pos += 1;
    if (hasNormal) {
      pos += 1; // hasRef byte
      let sp = '';
      const strLen = view.getUint32(pos, true);
      pos += 4;
      if (data.length >= pos + strLen) {
        sp = new TextDecoder().decode(data.slice(pos, pos + strLen));
        pos += strLen;
      }
      const t = view.getFloat32(pos, true);
      pos += 4;
      if (sp) normal = { samplePath: sp, tuning: t };
    }

    // High sound
    let high: OotInstrument['high'] = null;
    const hasHigh = data[pos]!;
    pos += 1;
    if (hasHigh) {
      pos += 1; // hasRef byte
      let sp = '';
      const strLen = view.getUint32(pos, true);
      pos += 4;
      if (data.length >= pos + strLen) {
        sp = new TextDecoder().decode(data.slice(pos, pos + strLen));
        pos += strLen;
      }
      const t = view.getFloat32(pos, true);
      pos += 4;
      if (sp) high = { samplePath: sp, tuning: t };
    }

    if (isValid) {
      instruments.push({ normalRangeLo, normalRangeHi, low, normal, high });
    }
  }

  return { fntIndex, sampleBankId1, sampleBankId2, drums, instruments };
}
