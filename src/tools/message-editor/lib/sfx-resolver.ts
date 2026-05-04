import type { O2RReader } from './o2r-reader';
import type { AudioResourceResolver } from '@/lib/audio/sfx-player';

export class SFXResolver implements AudioResourceResolver {
  private reader: O2RReader;
  private pathCache: Map<string, string[]> | null = null;

  constructor(reader: O2RReader) {
    this.reader = reader;
  }

  private ensureCache(): Map<string, string[]> {
    if (this.pathCache) return this.pathCache;

    const cache = new Map<string, string[]>();
    for (const file of this.reader.files) {
      // Group files by directory prefix for efficient prefix searches
      const parts = file.path.split('/');
      for (let i = 1; i <= parts.length; i++) {
        const prefix = parts.slice(0, i).join('/');
        let list = cache.get(prefix);
        if (!list) {
          list = [];
          cache.set(prefix, list);
        }
        list.push(file.path);
      }
    }
    this.pathCache = cache;
    return cache;
  }

  findFiles(prefix: string): string[] {
    const cache = this.ensureCache();
    return cache.get(prefix) ?? [];
  }

  async getFileData(path: string): Promise<Uint8Array> {
    return this.reader.readFile(path);
  }
}
