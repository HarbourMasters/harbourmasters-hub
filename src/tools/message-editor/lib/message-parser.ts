// TXTO message parser for OoT O2R format
// Ported from o2r-message-editor + adapted for OTR binary format

import {
  CTRL_NAMES, getExtraBytes, gameByteToChar, UNICODE_TO_CHAR,
  JPN_CTRL_NAMES, getJpnExtraWords, sjisToDisplay,
  UNICODE_TO_SJIS,
} from './control-codes';

export interface MessageEntry {
  id: number;
  textboxType: number;
  textboxYPos: number;
  data: Uint8Array;
  preview: string;
  isJapanese?: boolean;
}

const OTR_HEADER_SIZE = 64;

function readU32LE(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24);
}

function readU16LE(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8);
}

export function parseMessages(rawData: Uint8Array, language?: string): MessageEntry[] {
  const messages: MessageEntry[] = [];
  const isJpn = language === 'ja';

  if (rawData.length < OTR_HEADER_SIZE + 4) return messages;

  const msgCount = readU32LE(rawData, OTR_HEADER_SIZE);
  let offset = OTR_HEADER_SIZE + 4;

  for (let i = 0; i < msgCount; i++) {
    if (offset + 8 > rawData.length) break;

    const id = readU16LE(rawData, offset);
    const textboxType = rawData[offset + 2];
    const textboxYPos = rawData[offset + 3];
    offset += 4;

    if (offset + 4 > rawData.length) break;

    const stringLength = readU32LE(rawData, offset);
    offset += 4;

    if (offset + stringLength > rawData.length) break;

    const msgData = rawData.slice(offset, offset + stringLength);
    offset += stringLength;

    if (msgData.length > 0) {
      messages.push({
        id,
        textboxType,
        textboxYPos,
        data: msgData,
        preview: isJpn ? generateJpnPreview(msgData) : generatePreview(msgData),
        isJapanese: isJpn,
      });
    }
  }

  return messages;
}

function generatePreview(data: Uint8Array): string {
  let preview = '';
  let i = 0;

  while (i < data.length && preview.length < 80) {
    const byte = data[i];

    if (byte < 0x20) {
      const extra = getExtraBytes(byte);
      i += extra;
    } else if (byte >= 0x20) {
      preview += gameByteToChar(byte);
    }

    i++;
  }

  if (i < data.length) preview += '...';

  return preview;
}

function generateJpnPreview(data: Uint8Array): string {
  let preview = '';
  let i = 0;

  while (i < data.length - 1 && preview.length < 40) {
    const word = data[i] | (data[i + 1] << 8);

    if (JPN_CTRL_NAMES[word]) {
      // Skip control code + its args
      const extra = getJpnExtraWords(word);
      i += (1 + extra) * 2;
    } else if (word >= 0x8100) {
      // Shift-JIS character
      preview += sjisToDisplay(word);
      i += 2;
    } else if (word === 0x000A) {
      // Japanese newline
      i += 2;
    } else {
      i += 2;
    }
  }

  if (i < data.length) preview += '...';

  return preview;
}

export function parseMessageData(
  data: Uint8Array,
  isJapanese = false,
): Array<{ type: 'text' | 'control'; value: string; bytes: number[] }> {
  if (isJapanese) {
    return parseJpnMessageData(data);
  }

  const result: Array<{ type: 'text' | 'control'; value: string; bytes: number[] }> = [];
  let i = 0;

  while (i < data.length) {
    const byte = data[i];

    if (byte < 0x20) {
      const name = CTRL_NAMES[byte] || `CTRL_${byte.toString(16).toUpperCase().padStart(2, '0')}`;
      const extra = getExtraBytes(byte);
      const bytes = [byte];

      for (let j = 1; j <= extra; j++) {
        if (i + j < data.length) bytes.push(data[i + j]);
      }

      result.push({ type: 'control', value: name, bytes });
      i += 1 + extra;
    } else {
      let text = '';
      const bytes: number[] = [];

      while (i < data.length && data[i] >= 0x20) {
        bytes.push(data[i]);
        text += gameByteToChar(data[i]);
        i++;
      }

      result.push({ type: 'text', value: text, bytes });
    }
  }

  return result;
}

function parseJpnMessageData(
  data: Uint8Array,
): Array<{ type: 'text' | 'control'; value: string; bytes: number[] }> {
  const result: Array<{ type: 'text' | 'control'; value: string; bytes: number[] }> = [];
  let i = 0;

  while (i < data.length - 1) {
    const word = data[i] | (data[i + 1] << 8);

    if (JPN_CTRL_NAMES[word]) {
      const name = JPN_CTRL_NAMES[word];
      const extraWords = getJpnExtraWords(word);
      const bytes = [data[i]!, data[i + 1]!];

      for (let j = 1; j <= extraWords; j++) {
        if (i + j * 2 + 1 < data.length) {
          bytes.push(data[i + j * 2]!, data[i + j * 2 + 1]!);
        }
      }

      result.push({ type: 'control', value: name, bytes });
      i += (1 + extraWords) * 2;
    } else {
      // Text character(s) — collect consecutive non-control words
      let text = '';
      const bytes: number[] = [];

      while (i < data.length - 1) {
        const w = data[i] | (data[i + 1] << 8);
        if (JPN_CTRL_NAMES[w]) break;
        if (w === 0x000A) break; // Japanese NEWLINE is also a control

        bytes.push(data[i]!, data[i + 1]!);
        text += sjisToDisplay(w);
        i += 2;
      }

      if (bytes.length > 0) {
        result.push({ type: 'text', value: text, bytes });
      }
    }
  }

  return result;
}

export function messageDataToEditableText(data: Uint8Array, isJapanese = false): string {
  const parsed = parseMessageData(data, isJapanese);
  let result = '';

  for (const item of parsed) {
    if (item.type === 'control') {
      if (item.bytes.length > 1) {
        const args = item.bytes
          .slice(1)
          .map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`)
          .join(', ');
        result += `[${item.value}(${args})]`;
      } else {
        result += `[${item.value}]`;
      }
    } else {
      result += item.value;
    }
  }

  return result;
}

export function editableTextToMessageData(text: string, isJapanese = false): Uint8Array {
  if (isJapanese) {
    return editableTextToJpnMessageData(text);
  }

  const bytes: number[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '[') {
      const endBracket = text.indexOf(']', i);
      if (endBracket === -1) {
        bytes.push(text.charCodeAt(i));
        i++;
        continue;
      }

      const codeStr = text.substring(i + 1, endBracket);
      const parenIndex = codeStr.indexOf('(');
      const codeName = parenIndex !== -1 ? codeStr.substring(0, parenIndex) : codeStr;

      let codeValue: number | undefined;
      for (const [byteStr, name] of Object.entries(CTRL_NAMES)) {
        if (name === codeName) {
          codeValue = parseInt(byteStr);
          break;
        }
      }

      if (codeValue === undefined) {
        i = endBracket + 1;
        continue;
      }

      bytes.push(codeValue);

      if (parenIndex !== -1) {
        const argsStr = codeStr.substring(parenIndex + 1, codeStr.length - 1);
        const args = argsStr.split(',').map(arg => {
          const trimmed = arg.trim();
          if (trimmed.startsWith('0x')) return parseInt(trimmed.substring(2), 16);
          return parseInt(trimmed, 10);
        });

        for (const arg of args) {
          if (!isNaN(arg)) bytes.push(arg);
        }
      }

      i = endBracket + 1;
    } else if (text[i] === '\\' && i + 1 < text.length && text[i + 1] === 'x') {
      if (i + 3 < text.length) {
        const hexStr = text.substring(i + 2, i + 4);
        const value = parseInt(hexStr, 16);
        if (!isNaN(value)) {
          bytes.push(value);
          i += 4;
          continue;
        }
      }
      bytes.push(text.charCodeAt(i));
      i++;
    } else {
      const code = text.charCodeAt(i);
      // Check if this Unicode char maps to a game byte
      const gameByte = UNICODE_TO_CHAR[text[i]!];
      if (gameByte !== undefined) {
        bytes.push(gameByte);
      } else {
        bytes.push(code);
      }
      i++;
    }
  }

  return new Uint8Array(bytes);
}

export function insertControlCode(
  text: string,
  cursorPosition: number,
  _code: number,
  name: string,
  args: number[] = [],
): { newText: string; newCursorPosition: number } {
  const codeStr = args.length > 0
    ? `[${name}(${args.map(a => `0x${a.toString(16).toUpperCase().padStart(2, '0')}`).join(', ')})]`
    : `[${name}]`;

  const newText = text.substring(0, cursorPosition) + codeStr + text.substring(cursorPosition);
  return { newText, newCursorPosition: cursorPosition + codeStr.length };
}

export function messagesToBlob(messages: MessageEntry[]): Blob {
  let totalSize = OTR_HEADER_SIZE + 4;

  for (const msg of messages) {
    totalSize += 4 + 4 + msg.data.length;
  }

  const buffer = new Uint8Array(totalSize);
  let offset = 0;

  // 64-byte OTR header
  // Write TXTO magic at offset 4
  buffer[4] = 0x54; // 'T'
  buffer[5] = 0x58; // 'X'
  buffer[6] = 0x54; // 'T'
  buffer[7] = 0x4F; // 'O'
  offset = OTR_HEADER_SIZE;

  // Message count
  const count = messages.length;
  buffer[offset++] = count & 0xff;
  buffer[offset++] = (count >> 8) & 0xff;
  buffer[offset++] = (count >> 16) & 0xff;
  buffer[offset++] = (count >> 24) & 0xff;

  for (const msg of messages) {
    buffer[offset++] = msg.id & 0xff;
    buffer[offset++] = (msg.id >> 8) & 0xff;
    buffer[offset++] = msg.textboxType;
    buffer[offset++] = msg.textboxYPos;

    const len = msg.data.length;
    buffer[offset++] = len & 0xff;
    buffer[offset++] = (len >> 8) & 0xff;
    buffer[offset++] = (len >> 16) & 0xff;
    buffer[offset++] = (len >> 24) & 0xff;

    buffer.set(msg.data, offset);
    offset += msg.data.length;
  }

  return new Blob([buffer], { type: 'application/octet-stream' });
}

function editableTextToJpnMessageData(text: string): Uint8Array {
  const bytes: number[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '[') {
      const endBracket = text.indexOf(']', i);
      if (endBracket === -1) {
        // Treat as text
        const sjis = UNICODE_TO_SJIS[text[i]!];
        if (sjis !== undefined) {
          bytes.push(sjis & 0xFF, (sjis >> 8) & 0xFF);
        }
        i++;
        continue;
      }

      const codeStr = text.substring(i + 1, endBracket);
      const parenIndex = codeStr.indexOf('(');
      const codeName = parenIndex !== -1 ? codeStr.substring(0, parenIndex) : codeStr;

      // Look up Japanese control code
      let codeValue: number | undefined;
      if (JPN_CTRL_NAMES) {
        for (const entries of Object.entries(JPN_CTRL_NAMES)) {
          if (entries[1] === codeName) {
            codeValue = parseInt(entries[0]);
            break;
          }
        }
      }

      if (codeValue === undefined) {
        i = endBracket + 1;
        continue;
      }

      // Write control code as 16-bit LE
      bytes.push(codeValue & 0xFF, (codeValue >> 8) & 0xFF);

      if (parenIndex !== -1) {
        const argsStr = codeStr.substring(parenIndex + 1, codeStr.length - 1);
        const args = argsStr.split(',').map(arg => {
          const trimmed = arg.trim();
          if (trimmed.startsWith('0x')) return parseInt(trimmed.substring(2), 16);
          return parseInt(trimmed, 10);
        });

        for (const arg of args) {
          if (!isNaN(arg)) bytes.push(arg & 0xFF, (arg >> 8) & 0xFF);
        }
      }

      i = endBracket + 1;
    } else {
      const ch = text[i]!;
      const sjis = UNICODE_TO_SJIS[ch];
      if (sjis !== undefined) {
        bytes.push(sjis & 0xFF, (sjis >> 8) & 0xFF);
      } else {
        // Fallback: use char code as 16-bit
        const code = ch.charCodeAt(0);
        bytes.push(code & 0xFF, (code >> 8) & 0xFF);
      }
      i++;
    }
  }

  return new Uint8Array(bytes);
}
