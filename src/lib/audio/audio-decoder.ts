import { readWav, type WavData } from './wav-reader';

export interface DecodedAudio {
  sampleRate: number;
  samples: Int16Array;
  originalSampleRate: number;
  originalChannels: number;
}

export async function decodeAudioFile(file: File | ArrayBuffer, fileName: string): Promise<DecodedAudio> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.wav')) {
    return decodeWav(file);
  }

  if (lower.endsWith('.ogg') || lower.endsWith('.oga')) {
    return decodeOgg(file);
  }

  throw new Error(`Unsupported audio format: ${fileName}`);
}

async function decodeWav(file: File | ArrayBuffer): Promise<DecodedAudio> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const buffer = arrayBuffer instanceof ArrayBuffer ? new Uint8Array(arrayBuffer) : new Uint8Array(arrayBuffer);

  const wav: WavData = readWav(buffer.buffer);
  return {
    sampleRate: wav.sampleRate,
    samples: wav.samples,
    originalSampleRate: wav.sampleRate,
    originalChannels: 1,
  };
}

async function decodeOgg(file: File | ArrayBuffer): Promise<DecodedAudio> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;

  const ctx = new AudioContext();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;

    const mono = new Float32Array(length);
    if (numChannels === 1) {
      mono.set(audioBuffer.getChannelData(0));
    } else {
      for (let ch = 0; ch < numChannels; ch++) {
        const channelData = audioBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          mono[i] += channelData[i];
        }
      }
      const scale = 1 / numChannels;
      for (let i = 0; i < length; i++) {
        mono[i] *= scale;
      }
    }

    const samples = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const clamped = Math.max(-1, Math.min(1, mono[i]));
      samples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    }

    return {
      sampleRate,
      samples,
      originalSampleRate: sampleRate,
      originalChannels: numChannels,
    };
  } finally {
    await ctx.close();
  }
}
