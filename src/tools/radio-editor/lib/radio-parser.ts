// Star Fox 64 radio message binary parser
// Format: 64-byte OTR header + U32LE char count + U16LE[] char codes

import { radioCharToDisplay, radioCharToName, asciiToRadioCode, getCharacterIdForMessage } from './radio-char-codes';

const OTR_HEADER_SIZE = 64;

export interface RadioMessageEntry {
  id: number;
  fileName: string;
  charCodes: Uint16Array;
  preview: string;
  characterId: number; // RadioCharacterId (-1 = unknown)
  messageType: 'radio' | 'briefing' | 'title' | 'prologue' | 'credits';
  category: string;
}

export interface MessageCategory {
  name: string;
  test: (id: number) => boolean;
}

export const MESSAGE_CATEGORIES: MessageCategory[] = [
  { name: 'Prologue', test: (id) => id === 1 },
  { name: 'Title / Intro', test: (id) => id >= 10 && id <= 60 },
  { name: 'Mission Briefing', test: (id) => id >= 1200 && id <= 1470 },
  { name: 'Corneria', test: (id) => id >= 2000 && id <= 2340 },
  { name: 'Meteo', test: (id) => id >= 3000 && id <= 3380 },
  { name: 'Titania', test: (id) => id >= 4000 && id <= 4120 },
  { name: 'Sector X', test: (id) => id >= 5000 && id <= 5510 },
  { name: 'Zoness', test: (id) => id >= 6000 && id <= 6110 },
  { name: 'Area 6', test: (id) => id >= 7000 && id <= 7100 },
  { name: 'Venom (Approach)', test: (id) => id >= 8000 && id <= 8140 },
  { name: 'Venom (Star Wolf)', test: (id) => id >= 8200 && id <= 8320 },
  { name: 'Fortuna', test: (id) => id >= 9000 && id <= 9440 },
  { name: 'Solar', test: (id) => id >= 10000 && id <= 10330 },
  { name: 'Bolse', test: (id) => id >= 11000 && id <= 11250 },
  { name: 'Sector Y', test: (id) => id >= 14000 && id <= 14380 },
  { name: 'Aquas', test: (id) => id >= 15000 && id <= 15260 },
  { name: 'Sector Z', test: (id) => id >= 16000 && id <= 16290 },
  { name: 'Macbeth', test: (id) => id >= 17000 && id <= 17480 },
  { name: 'Katina', test: (id) => id >= 18000 && id <= 18160 },
  { name: 'Venom 2 (Bolse Breakup)', test: (id) => id >= 19000 && id <= 19020 },
  { name: 'Venom 2 (Andross)', test: (id) => id >= 19200 && id <= 19470 },
  { name: 'In-Game / General', test: (id) => id >= 20000 && id <= 20350 },
  { name: 'Expanding Route Select', test: (id) => id >= 21000 && id <= 21093 },
  { name: 'Star Wolf / VS Mode', test: (id) => id >= 22000 && id <= 22011 },
  { name: 'Credits / Score', test: (id) => id >= 22012 && id <= 22020 },
  { name: 'Training Mode', test: (id) => id >= 23000 },
];

export function getCategoryForId(id: number): string {
  for (const cat of MESSAGE_CATEGORIES) {
    if (cat.test(id)) return cat.name;
  }
  return 'Other';
}

function readU32LE(data: Uint8Array, offset: number): number {
  return data[offset]! | (data[offset + 1]! << 8) | (data[offset + 2]! << 16) | (data[offset + 3]! << 24);
}

function readU16LE(data: Uint8Array, offset: number): number {
  return data[offset]! | (data[offset + 1]! << 8);
}

export function parseRadioMessage(rawData: Uint8Array, fileName: string): RadioMessageEntry | null {
  if (rawData.length < OTR_HEADER_SIZE + 4) return null;

  const idMatch = fileName.match(/gMsg_ID_(\d+)/);
  const id = idMatch ? parseInt(idMatch[1]!) : 0;

  const charCount = readU32LE(rawData, OTR_HEADER_SIZE);
  if (charCount === 0 || charCount * 2 + OTR_HEADER_SIZE + 4 > rawData.length) return null;

  const charCodes = new Uint16Array(charCount);
  for (let i = 0; i < charCount; i++) {
    charCodes[i] = readU16LE(rawData, OTR_HEADER_SIZE + 4 + i * 2);
  }

  const preview = generatePreview(charCodes);
  const characterId = getCharacterIdForMessage(id) ?? -1;
  const messageType: RadioMessageEntry['messageType'] =
    id === 1 ? 'prologue' :
    (id >= 1200 && id <= 1470 && id % 10 === 0) ? 'briefing' :
    (id >= 10 && id <= 60) ? 'title' :
    (id >= 22012 && id <= 22020) ? 'credits' :
    'radio';

  return { id, fileName, charCodes, preview, characterId, messageType, category: getCategoryForId(id) };
}

export function generatePreview(charCodes: Uint16Array): string {
  let preview = '';
  for (let i = 0; i < charCodes.length && preview.length < 100; i++) {
    const code = charCodes[i]!;
    if (code === 0x00) break;
    if (code === 0x01) { preview += ' '; continue; }
    if (code >= 0x02 && code <= 0x07) continue;
    if (code >= 0x08 && code <= 0x0B) continue;
    if (code === 0x0D || code === 0x0E) continue;
    if (code === 0x0F) { preview += ' '; continue; }
    preview += radioCharToDisplay(code);
  }
  return preview;
}

export function charCodesToEditableText(charCodes: Uint16Array): string {
  let result = '';
  for (let i = 0; i < charCodes.length; i++) {
    const code = charCodes[i]!;
    if (code === 0x00) break; // END
    if (code === 0x01) { result += '\n'; continue; } // NWL → newline
    if (code === 0x0C) { result += ' '; continue; } // SPC → space
    if (code >= 0x02 && code <= 0x07) continue; // NP2-NP7: skip
    if (code >= 0x08 && code <= 0x0B) { result += `[${radioCharToName(code)}]`; continue; } // PRI0-3
    if (code === 0x0D) { result += '[HSP]'; continue; } // HSP
    if (code === 0x0E) { result += '[QSP]'; continue; } // QSP
    if (code === 0x0F) { result += '[NXT]\n'; continue; } // NXT → tag + newline
    if (code >= 0x10 && code <= 0x17) { result += `[${radioCharToName(code)}]`; continue; } // arrows as named tags
    result += radioCharToDisplay(code);
  }
  return result;
}

export function editableTextToCharCodes(text: string): Uint16Array {
  const codes: number[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '[') {
      const endBracket = text.indexOf(']', i);
      if (endBracket === -1) {
        codes.push(0x0C);
        i++;
        continue;
      }
      const codeName = text.substring(i + 1, endBracket);
      const codeValue = nameToCode(codeName);
      if (codeValue !== undefined) {
        codes.push(codeValue);
      }
      i = endBracket + 1;
    } else if (text[i] === '\n') {
      codes.push(0x01); // newline → NWL
      i++;
    } else if (text[i] === ' ') {
      codes.push(0x0C); // space → SPC
      i++;
    } else {
      const ch = text[i]!;
      const radioCode = asciiToRadioCode(ch);
      if (radioCode !== undefined) {
        codes.push(radioCode);
      }
      i++;
    }
  }

  codes.push(0x00); // END
  return new Uint16Array(codes);
}

function nameToCode(name: string): number | undefined {
  const ctrlEntries: Record<number, string> = {
    0x00: 'END', 0x01: 'NWL', 0x02: 'NP2', 0x03: 'NP3',
    0x04: 'NP4', 0x05: 'NP5', 0x06: 'NP6', 0x07: 'NP7',
    0x08: 'PRI0', 0x09: 'PRI1', 0x0A: 'PRI2', 0x0B: 'PRI3',
    0x0C: 'SPC', 0x0D: 'HSP', 0x0E: 'QSP', 0x0F: 'NXT',
    0x10: 'CLEFT', 0x11: 'CUP', 0x12: 'CRIGHT', 0x13: 'CDOWN',
    0x14: 'UP', 0x15: 'LEFT', 0x16: 'DOWN', 0x17: 'RIGHT',
  };
  for (const [codeStr, n] of Object.entries(ctrlEntries)) {
    if (n === name) return parseInt(codeStr);
  }
  return undefined;
}

export function radioMessageToBlob(charCodes: Uint16Array): Blob {
  const totalSize = OTR_HEADER_SIZE + 4 + charCodes.length * 2;
  const buffer = new Uint8Array(totalSize);
  let offset = 0;

  // 64-byte OTR header
  buffer[4] = 0x20; buffer[5] = 0x47; buffer[6] = 0x53; buffer[7] = 0x4D;
  buffer[12] = 0xEF; buffer[13] = 0xBE; buffer[14] = 0xAD; buffer[15] = 0xDE;
  buffer[16] = 0xEF; buffer[17] = 0xBE; buffer[18] = 0xAD; buffer[19] = 0xDE;
  offset = OTR_HEADER_SIZE;

  // Char count (U32LE)
  const count = charCodes.length;
  buffer[offset++] = count & 0xFF;
  buffer[offset++] = (count >> 8) & 0xFF;
  buffer[offset++] = (count >> 16) & 0xFF;
  buffer[offset++] = (count >> 24) & 0xFF;

  // Char data (U16LE array)
  for (let i = 0; i < charCodes.length; i++) {
    const c = charCodes[i]!;
    buffer[offset++] = c & 0xFF;
    buffer[offset++] = (c >> 8) & 0xFF;
  }

  return new Blob([buffer], { type: 'application/octet-stream' });
}

export function getPriorityFromCharCodes(charCodes: Uint16Array): number | null {
  if (charCodes.length > 0) {
    const first = charCodes[0]!;
    if (first >= 0x08 && first <= 0x0B) return first;
  }
  return null;
}
