// SFX Player — loads and plays game sound effects from O2R archives
// Uses the shared VADPCM decoder for audio decompression
// Falls back to synthetic beeps when real audio is unavailable

import { decodeAifcVadpcm } from './vadpcm-decoder';

export interface AudioResourceResolver {
  findFiles(prefix: string): string[];
  getFileData(path: string): Promise<Uint8Array>;
}

export class SFXPlayer {
  private audioCtx: AudioContext | null = null;
  private resolver: AudioResourceResolver | null;
  private bufferCache = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer | null>>();

  constructor(resolver?: AudioResourceResolver | null) {
    this.resolver = resolver ?? null;
  }

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  async resume(): Promise<void> {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  /** Play an SFX by file path. Returns false if not found. */
  async play(path: string): Promise<boolean> {
    const buffer = await this.getBuffer(path);
    if (!buffer) return false;

    await this.resume();
    const ctx = this.getCtx();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(ctx.currentTime);
    return true;
  }

  /** Preload an SFX file into cache */
  async preload(path: string): Promise<void> {
    await this.getBuffer(path);
  }

  private async getBuffer(path: string): Promise<AudioBuffer | null> {
    const cached = this.bufferCache.get(path);
    if (cached) return cached;

    const loading = this.loading.get(path);
    if (loading) return loading;

    const promise = this.loadBuffer(path);
    this.loading.set(path, promise);
    return promise;
  }

  private async loadBuffer(path: string): Promise<AudioBuffer | null> {
    if (!this.resolver) return null;

    try {
      const data = await this.resolver.getFileData(path);

      // Try VADPCM AIFC decode
      const decoded = decodeAifcVadpcm(data);
      if (decoded) {
        const ctx = this.getCtx();
        const buffer = ctx.createBuffer(1, decoded.samples.length, decoded.sampleRate);
        buffer.getChannelData(0).set(decoded.samples);
        this.bufferCache.set(path, buffer);
        return buffer;
      }

      return null;
    } catch {
      return null;
    } finally {
      this.loading.delete(path);
    }
  }

  destroy(): void {
    this.audioCtx?.close();
    this.audioCtx = null;
    this.bufferCache.clear();
    this.loading.clear();
  }
}
