// Sample rate conversion — linear interpolation (good quality, fast)

/** Resample Int16 PCM from srcRate to dstRate using linear interpolation.
 *  Handles mono only — stereo channels should be processed separately. */
export function resamplePCM(pcm: Int16Array, srcRate: number, dstRate: number): Int16Array {
  if (srcRate === dstRate) return pcm;

  const ratio = dstRate / srcRate;
  const srcLength = pcm.length;
  const dstLength = Math.ceil(srcLength * ratio);
  const resampled = new Int16Array(dstLength);

  for (let i = 0; i < dstLength; i++) {
    const srcPos = i / ratio;
    const idx = Math.floor(srcPos);
    const frac = srcPos - idx;
    if (idx + 1 < srcLength) {
      const a = pcm[idx]!;
      const b = pcm[idx + 1]!;
      resampled[i] = Math.round(a * (1 - frac) + b * frac);
    } else {
      resampled[i] = pcm[Math.min(idx, srcLength - 1)]!;
    }
  }

  return resampled;
}

/** Mix multiple channels down to mono by averaging. */
export function mixToMono(samples: Float32Array, channels: number): Float32Array {
  if (channels <= 1) return samples;
  const monoLength = Math.floor(samples.length / channels);
  const mono = new Float32Array(monoLength);
  for (let i = 0; i < monoLength; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch++) {
      sum += samples[i * channels + ch]!;
    }
    mono[i] = sum / channels;
  }
  return mono;
}

/** Convert Float32 samples to Int16 PCM. */
export function float32ToInt16(float32: Float32Array): Int16Array {
  const pcm = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]!));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return pcm;
}
