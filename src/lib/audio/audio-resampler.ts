export async function resampleAudio(
  samples: Int16Array,
  sourceRate: number,
  targetRate: number,
): Promise<Int16Array> {
  if (sourceRate === targetRate) return samples;

  // Int16 → Float32
  const float = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    float[i] = samples[i] / (samples[i] < 0 ? 0x8000 : 0x7FFF);
  }

  const offline = new OfflineAudioContext(1, Math.ceil(float.length * targetRate / sourceRate), targetRate);
  const buffer = offline.createBuffer(1, float.length, sourceRate);
  buffer.getChannelData(0).set(float);

  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();

  const rendered = await offline.startRendering();
  const renderedData = rendered.getChannelData(0);

  // Float32 → Int16
  const result = new Int16Array(renderedData.length);
  for (let i = 0; i < renderedData.length; i++) {
    const clamped = Math.max(-1, Math.min(1, renderedData[i]));
    result[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
  }

  return result;
}
