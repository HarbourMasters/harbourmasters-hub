import JSZip from 'jszip';

export interface O2RFileInfo {
  path: string;
  size: number;
  date: Date;
}

export class O2RReader {
  private zip: JSZip | null = null;
  private fileIndex: Map<string, O2RFileInfo> = new Map();
  private _fileName = '';

  get fileName(): string {
    return this._fileName;
  }

  get fileCount(): number {
    return this.fileIndex.size;
  }

  get files(): O2RFileInfo[] {
    return Array.from(this.fileIndex.values());
  }

  async load(file: File): Promise<void> {
    this.close();
    this._fileName = file.name;

    const buffer = await file.arrayBuffer();
    this.zip = await JSZip.loadAsync(buffer);

    this.fileIndex.clear();
    const entries = Object.entries(this.zip.files);

    for (const [path, zipEntry] of entries) {
      if (!zipEntry.dir) {
        this.fileIndex.set(path, {
          path,
          size: 0,
          date: zipEntry.date,
        });
      }
    }
  }

  close(): void {
    this.zip = null;
    this.fileIndex.clear();
    this._fileName = '';
  }

  hasFile(path: string): boolean {
    return this.fileIndex.has(path);
  }

  findFiles(prefix: string): string[] {
    const result: string[] = [];
    for (const path of this.fileIndex.keys()) {
      if (path.startsWith(prefix)) {
        result.push(path);
      }
    }
    return result;
  }

  async readFile(path: string): Promise<Uint8Array> {
    if (!this.zip) throw new Error('No O2R archive loaded');
    const entry = this.zip.file(path);
    if (!entry) throw new Error(`File not found in archive: ${path}`);
    return entry.async('uint8array');
  }

  async readFileRaw(path: string): Promise<ArrayBuffer> {
    if (!this.zip) throw new Error('No O2R archive loaded');
    const entry = this.zip.file(path);
    if (!entry) throw new Error(`File not found in archive: ${path}`);
    return entry.async('arraybuffer');
  }
}
