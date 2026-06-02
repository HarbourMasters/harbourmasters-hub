import JSZip from 'jszip';
import { parseRadioMessage, radioMessageToBlob, type RadioMessageEntry } from './radio-parser';

const AST_RADIO_PREFIX = 'ast_radio/';
const MSG_FILE_REGEX = /^ast_radio\/gMsg_ID_\d+$/;

export function detectStarship(zip: JSZip): boolean {
  for (const path of Object.keys(zip.files)) {
    if (MSG_FILE_REGEX.test(path)) return true;
  }
  return false;
}

export async function loadRadioMessages(zip: JSZip): Promise<RadioMessageEntry[]> {
  const messages: RadioMessageEntry[] = [];
  const entries: [string, JSZip.JSZipObject][] = [];

  zip.forEach((path, file) => {
    if (MSG_FILE_REGEX.test(path) && !file.dir) {
      entries.push([path, file]);
    }
  });

  entries.sort((a, b) => {
    const idA = parseInt(a[0].match(/gMsg_ID_(\d+)/)?.[1] ?? '0');
    const idB = parseInt(b[0].match(/gMsg_ID_(\d+)/)?.[1] ?? '0');
    return idA - idB;
  });

  for (const [path, file] of entries) {
    try {
      const data = await file.async('uint8array');
      const fileName = path.replace(AST_RADIO_PREFIX, '');
      const msg = parseRadioMessage(data, fileName);
      if (msg) messages.push(msg);
    } catch {
      // Skip unreadable files
    }
  }

  return messages;
}

export async function exportModifiedO2R(
  _zip: JSZip,
  modifiedMessages: RadioMessageEntry[],
  _textModifiedIds: Set<number>,
  audioEntries: Map<number, { extension: string; data: Uint8Array }>,
): Promise<Blob> {
  const output = new JSZip();

  // Text modifications
  for (const msg of modifiedMessages) {
    const path = `${AST_RADIO_PREFIX}${msg.fileName}`;
    const blob = radioMessageToBlob(msg.charCodes);
    const data = new Uint8Array(await blob.arrayBuffer());
    output.file(path, data);
  }

  // Audio modifications — XML descriptor + audio file
  for (const [msgId, audioInfo] of audioEntries) {
    const voiceId = msgId === 1 ? 1000 : msgId;
    const voiceBase = `gMsg_ID_${voiceId}_Voice`;
    const audioFileName = `${voiceBase}.${audioInfo.extension}`;
    const audioPath = `${AST_RADIO_PREFIX}${audioFileName}`;

    // Write the audio file
    output.file(audioPath, audioInfo.data);

    // Write the XML descriptor (extensionless)
    const xmlContent = `<Sample Version="0" Codec="S16" Medium="Ram" Tuning="1.0" Size="${audioInfo.data.byteLength}" Path="${audioPath}" CustomFormat="${audioInfo.extension}" />\n`;
    output.file(`${AST_RADIO_PREFIX}${voiceBase}`, xmlContent);
  }

  return output.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
