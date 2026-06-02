import type JSZip from 'jszip';
import {
  vadpcmToPcm, createAudioBuffer,
  parseSampleBinary, parseBookBinary, effectiveSampleRate,
  crc64,
  type ParsedBook,
} from '../../../lib/n64-audio';
import voiceMapData from './voice-map.json';

interface VoiceMapEntry {
  path: string;
  slot: string;
  tuning: number;
}

const voiceMap = voiceMapData as unknown as Record<string, VoiceMapEntry[]>;

function normalSample(entries: VoiceMapEntry[]): VoiceMapEntry | undefined {
  return entries.find(e => e.slot === 'normal') ?? entries[0];
}

function normalTuning(entries: VoiceMapEntry[]): number {
  const n = entries.find(e => e.slot === 'normal');
  return n ? n.tuning : entries[0].tuning;
}

export class SF64VoicePlayer {
  private zip: JSZip;
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private sampleCache = new Map<string, AudioBuffer>();
  private bookCache = new Map<string, ParsedBook>();
  private bookIndex = new Map<string, string>();
  private resourceIndexReady = false;
  private onStateChange?: (playing: boolean) => void;
  private playGeneration = 0;

  constructor(zip: JSZip, onStateChange?: (playing: boolean) => void) {
    this.zip = zip;
    this.onStateChange = onStateChange;
  }

  private ensureResourceIndex(): void {
    if (this.resourceIndexReady) return;
    for (const path of Object.keys(this.zip.files)) {
      const hash = crc64(path);
      this.bookIndex.set(hash.toString(16), path);
    }
    this.resourceIndexReady = true;
  }

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  private async decodeSample(samplePath: string, tuning: number): Promise<AudioBuffer | null> {
    const cacheKey = `${samplePath}@${tuning}`;
    const cached = this.sampleCache.get(cacheKey);
    if (cached) return cached;

    try {
      const file = this.zip.file(samplePath);
      if (!file) return null;

      const raw = await file.async('uint8array');
      const sample = parseSampleBinary(raw);
      if (!sample) return null;

      let pcm: Int16Array;
      if (sample.codec === 5) {
        pcm = new Int16Array(sample.raw.buffer, sample.raw.byteOffset, sample.raw.byteLength >> 1);
      } else if (sample.codec === 0) {
        const book = await this.resolveBook(sample.bookHash);
        if (!book) return null;
        pcm = vadpcmToPcm(sample.raw, book);
      } else {
        return null;
      }

      if (pcm.length === 0) return null;

      const ctx = this.getAudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = createAudioBuffer(ctx, pcm, effectiveSampleRate(tuning));
      this.sampleCache.set(cacheKey, buffer);
      return buffer;
    } catch (err) {
      console.warn('Failed to decode sample:', samplePath, err);
      return null;
    }
  }

  private startSource(buffer: AudioBuffer): void {
    this.stopCurrentSource();
    const ctx = this.getAudioCtx();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(ctx.currentTime);
    this.currentSource = source;
  }

  private stopCurrentSource(): void {
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch { /* already stopped */ }
      this.currentSource = null;
    }
  }

  async preloadVoice(msgId: number): Promise<void> {
    const entries = voiceMap[String(msgId)];
    if (!entries || entries.length === 0) return;
    const tuning = normalTuning(entries);
    for (const entry of entries) {
      await this.decodeSample(entry.path, tuning);
    }
  }

  async playVoice(msgId: number): Promise<boolean> {
    this.stop();

    const entries = voiceMap[String(msgId)];
    if (!entries || entries.length === 0) return false;

    const tuning = normalTuning(entries);
    const gen = ++this.playGeneration;
    this.onStateChange?.(true);

    for (let i = 0; i < entries.length; i++) {
      if (this.playGeneration !== gen) return false;

      const buffer = await this.decodeSample(entries[i].path, tuning);
      if (this.playGeneration !== gen) return false;
      if (!buffer) continue;

      this.startSource(buffer);

      if (i < entries.length - 1) {
        await new Promise<void>(resolve => {
          const src = this.currentSource;
          if (src) {
            src.onended = () => { this.currentSource = null; resolve(); };
          } else {
            resolve();
          }
        });
        if (this.playGeneration !== gen) return false;
        await new Promise<void>(resolve => setTimeout(resolve, 200));
      }
    }

    if (this.currentSource) {
      await new Promise<void>(resolve => {
        const src = this.currentSource;
        if (src) {
          src.onended = () => { this.currentSource = null; resolve(); };
        } else {
          resolve();
        }
      });
    }

    if (this.playGeneration === gen) {
      this.onStateChange?.(false);
    }
    return true;
  }

  private async resolveBook(bookHash: bigint): Promise<ParsedBook | null> {
    this.ensureResourceIndex();
    const key = bookHash.toString(16);
    if (this.bookCache.has(key)) return this.bookCache.get(key)!;

    const bookPath = this.bookIndex.get(key);
    if (!bookPath) return null;

    const file = this.zip.file(bookPath);
    if (!file) return null;

    const data = await file.async('uint8array');
    const book = parseBookBinary(data);
    if (book) this.bookCache.set(key, book);
    return book;
  }

  hasVoice(msgId: number): boolean {
    return String(msgId) in voiceMap;
  }

  stop(): void {
    this.playGeneration++;
    this.stopCurrentSource();
    this.onStateChange?.(false);
  }

  destroy(): void {
    this.stop();
    this.audioCtx?.close();
    this.audioCtx = null;
    this.sampleCache.clear();
    this.bookCache.clear();
  }

  getSamplePath(msgId: number): string | undefined {
    const entries = voiceMap[String(msgId)];
    return entries ? normalSample(entries)!.path : undefined;
  }

  getSamplePaths(msgId: number): VoiceMapEntry[] {
    return voiceMap[String(msgId)] ?? [];
  }
}
