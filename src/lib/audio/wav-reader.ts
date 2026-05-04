// WAV file reader — ported from SoH-AudioTool/src/AudioFormats.cpp

export interface WavData {
  sampleRate: number;
  samples: Int16Array;
}

export function readWav(buffer: ArrayBuffer): WavData {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  if (bytes.length < 12) {
    throw new Error('WAV header too small.');
  }

  if (
    readAscii(bytes, 0, 4) !== 'RIFF' ||
    readAscii(bytes, 8, 4) !== 'WAVE'
  ) {
    throw new Error('Not a RIFF/WAVE file.');
  }

  let audioFormat = 0;
  let numChannels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataOffset = 0;
  let dataSize = 0;

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkSize = view.getUint32(offset + 4, true);
    if (offset + 8 + chunkSize > bytes.length) {
      throw new Error('Invalid chunk size.');
    }

    const chunkType = readAscii(bytes, offset, 4);

    if (chunkType === 'fmt ') {
      if (chunkSize < 16) {
        throw new Error('Invalid fmt chunk.');
      }
      audioFormat = view.getUint16(offset + 8, true);
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkType === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
    }

    offset += 8 + chunkSize;
    if (chunkSize & 1) {
      offset += 1;
    }
  }

  if (audioFormat !== 1) {
    throw new Error('WAV must be PCM format.');
  }
  if (numChannels !== 1) {
    throw new Error('WAV must be mono.');
  }
  if (bitsPerSample !== 16) {
    throw new Error('WAV must be 16-bit PCM.');
  }
  if (dataOffset === 0 || dataSize === 0) {
    throw new Error('Missing data chunk.');
  }
  if (dataOffset + dataSize > bytes.length) {
    throw new Error('Invalid data range.');
  }
  if (dataSize % 2 !== 0) {
    throw new Error('Data size is not 16-bit aligned.');
  }

  const sampleCount = dataSize / 2;
  const samples = new Int16Array(sampleCount);
  const dataView = new DataView(buffer, dataOffset, dataSize);
  for (let i = 0; i < sampleCount; i++) {
    samples[i] = dataView.getInt16(i * 2, true);
  }

  return { sampleRate, samples };
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += String.fromCharCode(bytes[offset + i]);
  }
  return s;
}
