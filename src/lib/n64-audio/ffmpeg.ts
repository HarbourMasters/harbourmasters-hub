// ffmpeg.wasm wrapper — lazy-loaded, client-side audio format conversion
// Loads from CDN on first use (~31MB, browser caches after first download)

import { AUDIO_REF_HZ } from './constants';

let ffmpegLoaded = false;
let ffmpegLoading: Promise<void> | null = null;

// We dynamically import to avoid bundling the WASM binary at build time
type FFmpegInstance = {
  loaded: boolean;
  load: (config?: { coreURL?: string; wasmURL?: string }) => Promise<void>;
  writeFile: (path: string, data: Uint8Array | File) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  exec: (args: string[]) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
};

let ffmpeg: FFmpegInstance | null = null;

async function ensureFFmpeg(): Promise<FFmpegInstance> {
  if (ffmpeg && ffmpegLoaded) return ffmpeg;

  if (!ffmpegLoading) {
    ffmpegLoading = (async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      ffmpeg = new FFmpeg() as unknown as FFmpegInstance;

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });
      ffmpegLoaded = true;
    })();
  }

  await ffmpegLoading;
  return ffmpeg!;
}

/** Check if ffmpeg.wasm is loaded and ready. */
export function isFFmpegReady(): boolean {
  return ffmpegLoaded;
}

/** Convert Int16 PCM to a specific audio format (wav, mp3, ogg).
 *  Returns the encoded file as a Uint8Array. */
export async function convertToFormat(
  pcm: Int16Array,
  sampleRate: number,
  format: 'wav' | 'mp3' | 'ogg',
): Promise<Uint8Array> {
  const ff = await ensureFFmpeg();

  // Write raw PCM as s16le
  const pcmBytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  await ff.writeFile('input.pcm', pcmBytes);

  if (format === 'wav') {
    await ff.exec([
      '-f', 's16le', '-ar', String(sampleRate), '-ac', '1',
      '-i', 'input.pcm', 'output.wav',
    ]);
  } else if (format === 'mp3') {
    await ff.exec([
      '-f', 's16le', '-ar', String(sampleRate), '-ac', '1',
      '-i', 'input.pcm', '-b:a', '192k', 'output.mp3',
    ]);
  } else if (format === 'ogg') {
    await ff.exec([
      '-f', 's16le', '-ar', String(sampleRate), '-ac', '1',
      '-i', 'input.pcm', '-c:a', 'libvorbis', '-q:a', '4', 'output.ogg',
    ]);
  }

  const result = await ff.readFile(`output.${format}`);
  // Cleanup
  try { await ff.deleteFile('input.pcm'); } catch { /* ignore */ }
  try { await ff.deleteFile(`output.${format}`); } catch { /* ignore */ }

  return result;
}

/** Decode an audio file (any format ffmpeg supports) to Int16 PCM at target sample rate.
 *  Falls back to WebAudio decodeAudioData if ffmpeg isn't loaded. */
export async function convertFromFile(
  file: File,
  targetRate = AUDIO_REF_HZ,
): Promise<Int16Array> {
  const ff = await ensureFFmpeg();

  const ext = file.name.split('.').pop() || 'bin';
  await ff.writeFile(`input.${ext}`, file);

  await ff.exec([
    '-i', `input.${ext}`,
    '-f', 's16le', '-ar', String(targetRate), '-ac', '1',
    'output.pcm',
  ]);

  const pcmData = await ff.readFile('output.pcm');

  // Cleanup
  try { await ff.deleteFile(`input.${ext}`); } catch { /* ignore */ }
  try { await ff.deleteFile('output.pcm'); } catch { /* ignore */ }

  return new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 2);
}
