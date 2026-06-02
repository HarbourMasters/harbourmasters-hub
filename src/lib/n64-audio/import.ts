// Audio file import using WebAudio API
// Handles WAV/MP3/OGG/FLAC via browser's native decoders

import { AUDIO_REF_HZ } from './constants';
import { resamplePCM, mixToMono, float32ToInt16 } from './resample';

/** Import an audio file and convert to Int16 PCM at the target sample rate (mono).
 *  Uses WebAudio's decodeAudioData which supports WAV, MP3, OGG, FLAC, etc. */
export async function importAudioFile(file: File, targetRate = AUDIO_REF_HZ): Promise<Int16Array> {
  const arrayBuffer = await file.arrayBuffer();

  const audioCtx = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    await audioCtx.close();
  }

  return audioBufferToPCM(decoded, targetRate);
}

/** Convert an AudioBuffer to Int16 PCM at the target sample rate (mono). */
export function audioBufferToPCM(buffer: AudioBuffer, targetRate = AUDIO_REF_HZ): Int16Array {
  const srcRate = buffer.sampleRate;
  const srcLength = buffer.length;
  const channels = buffer.numberOfChannels;

  // Mix down to mono
  let mono = new Float32Array(srcLength);
  for (let ch = 0; ch < channels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < srcLength; i++) {
      mono[i] += channelData[i]!;
    }
  }
  if (channels > 1) {
    mono = mixToMono(
      // Flatten all channels into one buffer for mixToMono
      new Float32Array(
        Array.from({ length: srcLength * channels }, (_, i) =>
          buffer.getChannelData(i % channels)[Math.floor(i / channels)]!
        )
      ),
      channels
    );
  }

  // Convert to Int16 at source rate
  const pcmSrc = float32ToInt16(mono);

  // Resample to target rate
  return resamplePCM(pcmSrc, srcRate, targetRate);
}
