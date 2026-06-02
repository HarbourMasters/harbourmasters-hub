// WAV encode/decode — manual implementation, no dependencies needed

export interface WavData {
  samples: Int16Array;
  sampleRate: number;
  channels: number;
}

/** Encode Int16 PCM as a WAV file (16-bit PCM, little-endian). */
export function encodeWav(pcm: Int16Array, sampleRate: number, channels = 1): Uint8Array {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = pcm.length * bytesPerSample;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);       // chunk size
  view.setUint16(20, 1, true);        // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);      // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM data (Int16 → bytes)
  const bytes = new Uint8Array(buffer);
  const pcmOffset = 44;
  for (let i = 0; i < pcm.length; i++) {
    const val = pcm[i]!;
    bytes[pcmOffset + i * 2] = val & 0xFF;
    bytes[pcmOffset + i * 2 + 1] = (val >> 8) & 0xFF;
  }

  return bytes;
}

/** Decode a WAV file to Int16 PCM. */
export function decodeWav(data: Uint8Array): WavData {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // Verify RIFF header
  const riff = readString(view, 0, 4);
  if (riff !== 'RIFF') throw new Error('Not a WAV file');

  const wave = readString(view, 8, 4);
  if (wave !== 'WAVE') throw new Error('Not a WAV file');

  // Find fmt and data chunks
  let offset = 12;
  let sampleRate = 44100;
  let channels = 1;
  let bitsPerSample = 16;
  let audioFormat = 1;
  let dataOffset = 0;
  let dataSize = 0;

  while (offset < data.length - 8) {
    const chunkId = readString(view, offset, 4);
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      audioFormat = view.getUint16(offset + 8, true);
      channels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }

    offset += 8 + chunkSize;
    // Align to even byte
    if (chunkSize % 2 !== 0) offset++;
  }

  if (dataOffset === 0) throw new Error('No data chunk found in WAV');
  if (audioFormat !== 1) throw new Error(`Unsupported WAV format: ${audioFormat} (only PCM supported)`);
  if (bitsPerSample !== 16) throw new Error(`Unsupported bit depth: ${bitsPerSample} (only 16-bit supported)`);

  const numSamples = Math.floor(dataSize / 2);
  const samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    samples[i] = view.getInt16(dataOffset + i * 2, true);
  }

  return { samples, sampleRate, channels };
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function readString(view: DataView, offset: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}
