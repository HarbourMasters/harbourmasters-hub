export interface WaveformPeaks {
  mins: Float32Array;
  maxs: Float32Array;
  sampleRate: number;
  duration: number;
}

export function extractPeaks(
  samples: Float32Array,
  sampleRate: number,
  targetWidth: number,
): WaveformPeaks {
  const width = Math.max(1, targetWidth);
  const len = samples.length;
  const bucketSize = len / width;

  const mins = new Float32Array(width);
  const maxs = new Float32Array(width);

  for (let i = 0; i < width; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.min(Math.floor((i + 1) * bucketSize), len);

    let min = 0;
    let max = 0;
    for (let j = start; j < end; j++) {
      const v = samples[j];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    mins[i] = min;
    maxs[i] = max;
  }

  return {
    mins,
    maxs,
    sampleRate,
    duration: len / sampleRate,
  };
}
