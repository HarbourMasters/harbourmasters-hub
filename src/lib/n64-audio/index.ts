// N64 Audio Library — shared across SF64 and OOT
// Universal VADPCM decoder, WAV I/O, resampling, format parsers

// Types
export type { ParsedSample, ParsedBook, ParsedLoop, ParsedInstrument, ParsedDrum, ParsedSoundFont } from './types';

// Constants
export {
  OTR_HEADER_SIZE, BODY_OFFSET,
  ADPCM_FRAME_BYTES, ADPCM_FRAME_SAMPLES,
  AUDIO_REF_HZ, MIXER_RATE_HZ,
  LOOP_INFINITE,
  CODEC_ADPCM, CODEC_S8, CODEC_S16MEM, CODEC_SMALL_ADPCM, CODEC_REVERB, CODEC_S16,
  CODEC_NAMES, MEDIUM_NAMES,
  SF64_SAMPLE, SF64_BOOK, SF64_LOOP, SF64_INST, SF64_DRUM, SF64_FONT,
  OOT_SAMPLE, OOT_FONT, OOT_SEQ,
} from './constants';

// Universal VADPCM decoder
export { vadpcmToPcm, pcmToFloat32, createAudioBuffer } from './adpcm';

// WAV encode/decode
export { encodeWav, decodeWav, type WavData } from './wav';

// Resampling
export { resamplePCM, mixToMono, float32ToInt16 } from './resample';

// Audio import
export { importAudioFile, audioBufferToPCM } from './import';

// SF64 format parsers + CRC64
export {
  crc64, isSampleEntry, getResType,
  parseSampleBinary, parseBookBinary, parseLoopBinary,
  parseInstrumentTunings, parseDrumTuning, parseSoundfontBinary,
  scaleLoop, effectiveSampleRate,
  type Sf64InstrumentSlot, type Sf64DrumEntry,
} from './sf64-format';

// OOT format parsers
export {
  parseOotSampleBinary, parseOotSoundFontBinary,
  type OotDrum, type OotInstrument, type OotSoundFont,
} from './oot-format';

// ffmpeg.wasm (lazy-loaded)
export { convertToFormat, convertFromFile, isFFmpegReady } from './ffmpeg';
