// SF64 binary format parsers + CRC-64 hash
// SF64 uses separate archive resources (AUFC/APCB/APCL/INST/DRUM/SFNT)
// cross-referenced by CRC64 hash, unlike OOT which embeds everything.

import type { ParsedSample, ParsedBook, ParsedLoop, ParsedSoundFont } from './types';
import {
  BODY_OFFSET, ADPCM_FRAME_BYTES, ADPCM_FRAME_SAMPLES,
  SF64_SAMPLE, CODEC_ADPCM, CODEC_S16,
} from './constants';

// ─── CRC-64 (matches libultraship StrHash64) ──────────────────────────────

const CRC64_TABLE = [
  0x0000000000000000n, 0x42F0E1EBA9EA3693n, 0x85E1C3D753D46D26n, 0xC711223CFA3E5BB5n,
  0x493366450E42ECDFn, 0x0BC387AEA7A8DA4Cn, 0xCCD2A5925D9681F9n, 0x8E224479F47CB76An,
  0x9266CC8A1C85D9BEn, 0xD0962D61B56FEF2Dn, 0x17870F5D4F51B498n, 0x5577EEB6E6BB820Bn,
  0xDB55AACF12C73561n, 0x99A54B24BB2D03F2n, 0x5EB4691841135847n, 0x1C4488F3E8F96ED4n,
  0x663D78FF90E185EFn, 0x24CD9914390BB37Cn, 0xE3DCBB28C335E8C9n, 0xA12C5AC36ADFDE5An,
  0x2F0E1EBA9EA36930n, 0x6DFEFF5137495FA3n, 0xAAEFDD6DCD770416n, 0xE81F3C86649D3285n,
  0xF45BB4758C645C51n, 0xB6AB559E258E6AC2n, 0x71BA77A2DFB03177n, 0x334A9649765A07E4n,
  0xBD68D2308226B08En, 0xFF9833DB2BCC861Dn, 0x388911E7D1F2DDA8n, 0x7A79F00C7818EB3Bn,
  0xCC7AF1FF21C30BDEn, 0x8E8A101488293D4Dn, 0x499B3228721766F8n, 0x0B6BD3C3DBFD506Bn,
  0x854997BA2F81E701n, 0xC7B97651866BD192n, 0x00A8546D7C558A27n, 0x4258B586D5BFBCB4n,
  0x5E1C3D753D46D260n, 0x1CECDC9E94ACE4F3n, 0xDBFDFEA26E92BF46n, 0x990D1F49C77889D5n,
  0x172F5B3033043EBFn, 0x55DFBADB9AEE082Cn, 0x92CE98E760D05399n, 0xD03E790CC93A650An,
  0xAA478900B1228E31n, 0xE8B768EB18C8B8A2n, 0x2FA64AD7E2F6E317n, 0x6D56AB3C4B1CD584n,
  0xE374EF45BF6062EEn, 0xA1840EAE168A547Dn, 0x66952C92ECB40FC8n, 0x2465CD79455E395Bn,
  0x3821458AADA7578Fn, 0x7AD1A461044D611Cn, 0xBDC0865DFE733AA9n, 0xFF3067B657990C3An,
  0x711223CFA3E5BB50n, 0x33E2C2240A0F8DC3n, 0xF4F3E018F031D676n, 0xB60301F359DBE0E5n,
  0xDA050215EA6C212Fn, 0x98F5E3FE438617BCn, 0x5FE4C1C2B9B84C09n, 0x1D14202910527A9An,
  0x93366450E42ECDF0n, 0xD1C685BB4DC4FB63n, 0x16D7A787B7FAA0D6n, 0x5427466C1E109645n,
  0x4863CE9FF6E9F891n, 0x0A932F745F03CE02n, 0xCD820D48A53D95B7n, 0x8F72ECA30CD7A324n,
  0x0150A8DAF8AB144En, 0x43A04931514122DDn, 0x84B16B0DAB7F7968n, 0xC6418AE602954FFBn,
  0xBC387AEA7A8DA4C0n, 0xFEC89B01D3679253n, 0x39D9B93D2959C9E6n, 0x7B2958D680B3FF75n,
  0xF50B1CAF74CF481Fn, 0xB7FBFD44DD257E8Cn, 0x70EADF78271B2539n, 0x321A3E938EF113AAn,
  0x2E5EB66066087D7En, 0x6CAE578BCFE24BEDn, 0xABBF75B735DC1058n, 0xE94F945C9C3626CBn,
  0x676DD025684A91A1n, 0x259D31CEC1A0A732n, 0xE28C13F23B9EFC87n, 0xA07CF2199274CA14n,
  0x167FF3EACBAF2AF1n, 0x548F120162451C62n, 0x939E303D987B47D7n, 0xD16ED1D631917144n,
  0x5F4C95AFC5EDC62En, 0x1DBC74446C07F0BDn, 0xDAAD56789639AB08n, 0x985DB7933FD39D9Bn,
  0x84193F60D72AF34Fn, 0xC6E9DE8B7EC0C5DCn, 0x01F8FCB784FE9E69n, 0x43081D5C2D14A8FAn,
  0xCD2A5925D9681F90n, 0x8FDAB8CE70822903n, 0x48CB9AF28ABC72B6n, 0x0A3B7B1923564425n,
  0x70428B155B4EAF1En, 0x32B26AFEF2A4998Dn, 0xF5A348C2089AC238n, 0xB753A929A170F4ABn,
  0x3971ED50550C43C1n, 0x7B810CBBFCE67552n, 0xBC902E8706D82EE7n, 0xFE60CF6CAF321874n,
  0xE224479F47CB76A0n, 0xA0D4A674EE214033n, 0x67C58448141F1B86n, 0x253565A3BDF52D15n,
  0xAB1721DA49899A7Fn, 0xE9E7C031E063ACECn, 0x2EF6E20D1A5DF759n, 0x6C0603E6B3B7C1CAn,
  0xF6FAE5C07D3274CDn, 0xB40A042BD4D8425En, 0x731B26172EE619EBn, 0x31EBC7FC870C2F78n,
  0xBFC9838573709812n, 0xFD39626EDA9AAE81n, 0x3A28405220A4F534n, 0x78D8A1B9894EC3A7n,
  0x649C294A61B7AD73n, 0x266CC8A1C85D9BE0n, 0xE17DEA9D3263C055n, 0xA38D0B769B89F6C6n,
  0x2DAF4F0F6FF541ACn, 0x6F5FAEE4C61F773Fn, 0xA84E8CD83C212C8An, 0xEABE6D3395CB1A19n,
  0x90C79D3FEDD3F122n, 0xD2377CD44439C7B1n, 0x15265EE8BE079C04n, 0x57D6BF0317EDAA97n,
  0xD9F4FB7AE3911DFDn, 0x9B041A914A7B2B6En, 0x5C1538ADB04570DBn, 0x1EE5D94619AF4648n,
  0x02A151B5F156289Cn, 0x4051B05E58BC1E0Fn, 0x87409262A28245BAn, 0xC5B073890B687329n,
  0x4B9237F0FF14C443n, 0x0962D61B56FEF2D0n, 0xCE73F427ACC0A965n, 0x8C8315CC052A9FF6n,
  0x3A80143F5CF17F13n, 0x7870F5D4F51B4980n, 0xBF61D7E80F251235n, 0xFD913603A6CF24A6n,
  0x73B3727A52B393CCn, 0x31439391FB59A55Fn, 0xF652B1AD0167FEEAn, 0xB4A25046A88DC879n,
  0xA8E6D8B54074A6ADn, 0xEA16395EE99E903En, 0x2D071B6213A0CB8Bn, 0x6FF7FA89BA4AFD18n,
  0xE1D5BEF04E364A72n, 0xA3255F1BE7DC7CE1n, 0x64347D271DE22754n, 0x26C49CCCB40811C7n,
  0x5CBD6CC0CC10FAFCn, 0x1E4D8D2B65FACC6Fn, 0xD95CAF179FC497DAn, 0x9BAC4EFC362EA149n,
  0x158E0A85C2521623n, 0x577EEB6E6BB820B0n, 0x906FC95291867B05n, 0xD29F28B9386C4D96n,
  0xCEDBA04AD0952342n, 0x8C2B41A1797F15D1n, 0x4B3A639D83414E64n, 0x09CA82762AAB78F7n,
  0x87E8C60FDED7CF9Dn, 0xC51827E4773DF90En, 0x020905D88D03A2BBn, 0x40F9E43324E99428n,
  0x2CFFE7D5975E55E2n, 0x6E0F063E3EB46371n, 0xA91E2402C48A38C4n, 0xEBEEC5E96D600E57n,
  0x65CC8190991CB93Dn, 0x273C607B30F68FAEn, 0xE02D4247CAC8D41Bn, 0xA2DDA3AC6322E288n,
  0xBE992B5F8BDB8C5Cn, 0xFC69CAB42231BACFn, 0x3B78E888D80FE17An, 0x7988096371E5D7E9n,
  0xF7AA4D1A85996083n, 0xB55AACF12C735610n, 0x724B8ECDD64D0DA5n, 0x30BB6F267FA73B36n,
  0x4AC29F2A07BFD00Dn, 0x08327EC1AE55E69En, 0xCF235CFD546BBD2Bn, 0x8DD3BD16FD818BB8n,
  0x03F1F96F09FD3CD2n, 0x41011884A0170A41n, 0x86103AB85A2951F4n, 0xC4E0DB53F3C36767n,
  0xD8A453A01B3A09B3n, 0x9A54B24BB2D03F20n, 0x5D45907748EE6495n, 0x1FB5719CE1045206n,
  0x919735E51578E56Cn, 0xD367D40EBC92D3FFn, 0x1476F63246AC884An, 0x568617D9EF46BED9n,
  0xE085162AB69D5E3Cn, 0xA275F7C11F7768AFn, 0x6564D5FDE549331An, 0x279434164CA30589n,
  0xA9B6706FB8DFB2E3n, 0xEB46918411358470n, 0x2C57B3B8EB0BDFC5n, 0x6EA7525342E1E956n,
  0x72E3DAA0AA188782n, 0x30133B4B03F2B111n, 0xF7021977F9CCEAA4n, 0xB5F2F89C5026DC37n,
  0x3BD0BCE5A45A6B5Dn, 0x79205D0E0DB05DCEn, 0xBE317F32F78E067Bn, 0xFCC19ED95E6430E8n,
  0x86B86ED5267CDBD3n, 0xC4488F3E8F96ED40n, 0x0359AD0275A8B6F5n, 0x41A94CE9DC428066n,
  0xCF8B0890283E370Cn, 0x8D7BE97B81D4019Fn, 0x4A6ACB477BEA5A2An, 0x089A2AACD2006CB9n,
  0x14DEA25F3AF9026Dn, 0x562E43B4931334FEn, 0x913F6188692D6F4Bn, 0xD3CF8063C0C759D8n,
  0x5DEDC41A34BBEEB2n, 0x1F1D25F19D51D821n, 0xD80C07CD676F8394n, 0x9AFCE626CE85B507n,
];

/** CRC-64 hash matching libultraship StrHash64. */
export function crc64(s: string): bigint {
  let crc = 0xFFFFFFFFFFFFFFFFn;
  for (let i = 0; i < s.length; i++) {
    const byte = s.charCodeAt(i);
    const idx = Number((crc >> 56n) & 0xFFn) ^ byte;
    crc = (CRC64_TABLE[idx & 0xFF] ?? 0n) ^ ((crc << 8n) & 0xFFFFFFFFFFFFFFFFn);
  }
  return crc & 0xFFFFFFFFFFFFFFFFn;
}

// ─── Resource type detection ───────────────────────────────────────────────

function resType(data: Uint8Array): number {
  if (data.length < 8) return 0;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return view.getUint32(4, true);
}

function resVersion(data: Uint8Array): number {
  if (data.length < 12) return 0;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return view.getUint32(8, true);
}

export function isSampleEntry(data: Uint8Array): boolean {
  if (data.length < BODY_OFFSET + 8 || data[0] === 0x3C) return false; // starts with '<'
  return resType(data) === SF64_SAMPLE;
}

export function getResType(data: Uint8Array): number {
  return resType(data);
}

// ─── SF64 Sample binary parsing ───────────────────────────────────────────

/** Parse an SF64 sample binary (AUFC, separate book/loop by hash). */
export function parseSampleBinary(data: Uint8Array): ParsedSample | null {
  if (data.length < BODY_OFFSET + 8) return null;

  const version = resVersion(data);
  if (version === 2) {
    // v2 redirect — canonical hash only
    return {
      codec: 0, medium: 0, size: 0,
      raw: new Uint8Array(0),
      loop: null, book: null,
      isRedirect: true,
      pcmSamples: 0, adpcmFrames: 0,
      bookHash: 0n, loopHash: 0n,
    };
  }

  if (data.length < BODY_OFFSET + 23) return null;

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const off = BODY_OFFSET;
  const codec = data[off]!;
  const medium = data[off + 1]!;
  const size = view.getUint32(off + 3, true);
  const loopH = view.getBigUint64(off + 7, true);
  const bookH = view.getBigUint64(off + 15, true);
  const bodyStart = off + 23;
  const raw = data.slice(bodyStart, bodyStart + size);

  const adpcmFrames = codec === CODEC_ADPCM ? Math.floor(size / ADPCM_FRAME_BYTES) : 0;
  const pcmSamples = codec === CODEC_ADPCM ? adpcmFrames * ADPCM_FRAME_SAMPLES
    : codec === CODEC_S16 ? Math.floor(size / 2) : 0;

  return {
    codec, medium, size, raw,
    loop: null, book: null,
    isRedirect: false,
    pcmSamples, adpcmFrames,
    bookHash: bookH, loopHash: loopH,
  };
}

// ─── SF64 Book binary parsing ─────────────────────────────────────────────

export function parseBookBinary(data: Uint8Array): ParsedBook | null {
  if (data.length < BODY_OFFSET + 12) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const off = BODY_OFFSET;
  const order = view.getUint32(off, true);
  const numPredictors = view.getUint32(off + 4, true);
  const count = view.getUint32(off + 8, true);
  if (data.length < off + 12 + count * 2) return null;

  const book: number[] = [];
  for (let i = 0; i < count; i++) {
    book.push(view.getInt16(off + 12 + i * 2, true));
  }
  return { order, numPredictors, book };
}

// ─── SF64 Loop binary parsing ─────────────────────────────────────────────

/** Parse an SF64 AdpcmLoop binary (APCL). */
export function parseLoopBinary(data: Uint8Array): ParsedLoop | null {
  const off = BODY_OFFSET;
  if (data.length < off + 12) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const start = view.getUint32(off, true);
  const end = view.getUint32(off + 4, true);
  const count = view.getUint32(off + 8, true);
  const state: number[] = [];
  if (count !== 0 && data.length >= off + 12 + 32) {
    for (let i = 0; i < 16; i++) {
      state.push(view.getInt16(off + 12 + i * 2, true));
    }
  }
  return { start, end, count, state };
}

// ─── SF64 Instrument binary parsing ───────────────────────────────────────

export interface Sf64InstrumentSlot {
  sampleHash: bigint;
  tuning: number;
  slot: 'low' | 'normal' | 'high';
}

/** Extract (sample_hash, tuning, slot) triples from an SF64 Instrument binary. */
export function parseInstrumentTunings(data: Uint8Array): Sf64InstrumentSlot[] {
  const off = BODY_OFFSET;
  if (data.length < off + 48) return [];
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const slots: Sf64InstrumentSlot[] = [];
  let pos = off + 4 + 8; // skip header bytes + envelope_hash

  for (const slot of ['low', 'normal', 'high'] as const) {
    const h = view.getBigUint64(pos, true);
    const t = view.getFloat32(pos + 8, true);
    if (h !== 0n && t !== 0) {
      slots.push({ sampleHash: h, tuning: t, slot });
    }
    pos += 12;
  }
  return slots;
}

// ─── SF64 Drum binary parsing ─────────────────────────────────────────────

export interface Sf64DrumEntry {
  sampleHash: bigint;
  tuning: number;
}

/** Extract (sample_hash, tuning) from an SF64 Drum binary. */
export function parseDrumTuning(data: Uint8Array): Sf64DrumEntry | null {
  const off = BODY_OFFSET;
  if (data.length < off + 15) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const pos = off + 3; // skip 3 header bytes
  const h = view.getBigUint64(pos, true);
  const t = view.getFloat32(pos + 8, true);
  if (h !== 0n && t !== 0) {
    return { sampleHash: h, tuning: t };
  }
  return null;
}

// ─── SF64 SoundFont binary parsing ────────────────────────────────────────

/** Parse an SF64 SoundFont binary (SFNT). */
export function parseSoundfontBinary(data: Uint8Array): ParsedSoundFont | null {
  const off = BODY_OFFSET;
  if (data.length < off + 4) return null;
  const numInst = data[off]!;
  const numDrums = data[off + 1]!;
  const bankId1 = data[off + 2]!;
  let pos = off + 4;

  const instCrcs: bigint[] = [];
  const drumCrcs: bigint[] = [];
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  for (let i = 0; i < numInst; i++) {
    if (data.length < pos + 8) break;
    instCrcs.push(view.getBigUint64(pos, true));
    pos += 8;
  }
  for (let i = 0; i < numDrums; i++) {
    if (data.length < pos + 8) break;
    drumCrcs.push(view.getBigUint64(pos, true));
    pos += 8;
  }

  return { numInst, numDrums, bankId1, instCrcs, drumCrcs };
}

// ─── SF64 loop point scaling ──────────────────────────────────────────────

/** Scale loop points from origRate to newRate. */
export function scaleLoop(loop: ParsedLoop, origRate: number, newRate: number): ParsedLoop {
  const scale = newRate / origRate;
  return {
    start: Math.round(loop.start * scale),
    end: Math.round(loop.end * scale),
    count: loop.count,
    state: loop.state,
  };
}

/** Return effective sample rate from tuning, or fallback to 32000. */
export function effectiveSampleRate(tuning: number | null | undefined): number {
  return tuning ? Math.round(tuning * 32000) : 32000;
}
