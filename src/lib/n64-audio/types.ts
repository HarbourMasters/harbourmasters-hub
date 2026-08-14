export interface ParsedSample {
  codec: number;
  medium: number;
  size: number;
  raw: Uint8Array;
  loop: ParsedLoop | null;
  book: ParsedBook | null;
  isRedirect: boolean;
  pcmSamples: number;
  adpcmFrames: number;
  // SF64-specific: hash references to separate book/loop resources
  bookHash: bigint;
  loopHash: bigint;
}

export interface ParsedBook {
  order: number;
  numPredictors: number;
  book: number[];
}

export interface ParsedLoop {
  start: number;
  end: number;
  count: number;
  state: number[];
}

export interface ParsedInstrument {
  low: { sampleHash: bigint; tuning: number } | null;
  normal: { sampleHash: bigint; tuning: number } | null;
  high: { sampleHash: bigint; tuning: number } | null;
}

export interface ParsedDrum {
  sampleHash: bigint;
  tuning: number;
  pan: number;
}

export interface ParsedSoundFont {
  numInst: number;
  numDrums: number;
  bankId1: number;
  instCrcs: bigint[];
  drumCrcs: bigint[];
}
