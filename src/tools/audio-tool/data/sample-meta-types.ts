export interface SampleMetaEntry {
  name: string;
  bank: number;
  sampleRate: number;
  adpcmSize: number;
  sampleCount: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  loopCount: number;
  order: number;
  predictors: number;
  bookSize: number;
}

export interface BankInfo {
  id: number;
  label: string;
  color: string;
}

export const BANKS: BankInfo[] = [
  { id: 0, label: 'Bank 0 — SFX', color: '#22c55e' },
  { id: 1, label: 'Bank 1 — Instruments', color: '#3b82f6' },
  { id: 2, label: 'Bank 2', color: '#8b5cf6' },
  { id: 3, label: 'Bank 3', color: '#f59e0b' },
  { id: 4, label: 'Bank 4', color: '#ef4444' },
  { id: 5, label: 'Bank 5', color: '#ec4899' },
  { id: 6, label: 'Bank 6', color: '#6366f1' },
];
