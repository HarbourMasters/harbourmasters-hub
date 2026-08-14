// N64 audio constants shared across games (SF64 + OOT)

export const OTR_HEADER_SIZE = 64;
export const BODY_OFFSET = 64;

export const ADPCM_FRAME_BYTES = 9;
export const ADPCM_FRAME_SAMPLES = 16;

export const AUDIO_REF_HZ = 32000;
export const MIXER_RATE_HZ = 32000;

export const LOOP_INFINITE = 0xFFFFFFFF;

// Codec IDs (same for both games)
export const CODEC_ADPCM = 0;
export const CODEC_S8 = 1;
export const CODEC_S16MEM = 2;
export const CODEC_SMALL_ADPCM = 3;
export const CODEC_REVERB = 4;
export const CODEC_S16 = 5;

export const CODEC_NAMES: Record<number, string> = {
  0: 'ADPCM',
  1: 'S8',
  2: 'S16MEM',
  3: 'SMALL_ADPCM',
  4: 'REVERB',
  5: 'S16',
};

export const MEDIUM_NAMES: Record<number, string> = {
  0: 'Ram',
  1: 'Unk',
  2: 'Cart',
  3: 'Disk',
  5: 'RamUnloaded',
};

// SF64 resource types (separate resources, CRC64 cross-referencing)
export const SF64_SAMPLE = 0x41554643; // AUFC
export const SF64_BOOK = 0x41504342;   // APCB
export const SF64_LOOP = 0x4150434C;   // APCL
export const SF64_INST = 0x494E5354;   // INST
export const SF64_DRUM = 0x4452554D;   // DRUM
export const SF64_FONT = 0x53464E54;   // SFNT

// OOT resource types (embedded resources)
export const OOT_SAMPLE = 0x4F534D50;  // OSMP
export const OOT_FONT = 0x4F534654;    // OSFT
export const OOT_SEQ = 0x4F534551;     // OSEQ
