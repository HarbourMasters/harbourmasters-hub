import { useCallback } from 'react';
import { encodeVadpcm } from '@/lib/audio/vadpcm-encoder';
import { decodeVadpcm } from '@/lib/audio/vadpcm-decoder';
import { writeSohSample, buildLoopState, type SohSampleData } from '@/lib/audio/soh-sample';
import type { SampleItem } from './useAudioSamples';

export interface ConversionResult {
  success: boolean;
  message: string;
  data: Uint8Array | null;
}

export function useConversion() {
  const convertSample = useCallback((item: SampleItem): ConversionResult => {
    if (!item.wavData) {
      return { success: false, message: 'No WAV data loaded.', data: null };
    }

    const wav = item.wavData;

    // Encode to VADPCM
    let encoded;
    try {
      encoded = encodeVadpcm(wav.samples, 4);
    } catch (e) {
      return {
        success: false,
        message: `Encode failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
        data: null,
      };
    }

    // Decode to verify
    const decoded = decodeVadpcm(encoded.codebook, encoded.adpcmData);
    let maxAbs = 0;
    for (let i = 0; i < decoded.length; i++) {
      const v = Math.abs(decoded[i]);
      if (v > maxAbs) maxAbs = v;
    }
    if (maxAbs === 0) {
      return { success: false, message: 'Encoded audio is silent.', data: null };
    }

    // Build loop state if needed
    let loopState = new Int16Array(16);
    if (item.loopEnabled) {
      const maxIndex = decoded.length - 1;
      const loopStart = item.loopStart;
      const loopEnd = item.loopEnd === 0 ? maxIndex : item.loopEnd;

      if (loopStart > loopEnd || loopEnd > maxIndex) {
        return {
          success: false,
          message: `Invalid loop range. Max index = ${maxIndex}.`,
          data: null,
        };
      }

      loopState = buildLoopState(decoded, loopStart);

      const sampleData: SohSampleData = {
        adpcmData: encoded.adpcmData,
        sampleCount: wav.samples.length,
        loopEnabled: true,
        loopStart,
        loopEnd,
        loopCount: item.loopCount,
        loopState,
        order: encoded.codebook.order,
        predictors: encoded.codebook.predictorCount,
        book: flattenBook(encoded.codebook),
      };

      return {
        success: true,
        message: `OK (SNR: ${computeSNR(encoded.signalMeanSquare, encoded.errorMeanSquare).toFixed(1)} dB)`,
        data: writeSohSample(sampleData),
      };
    }

    const sampleData: SohSampleData = {
      adpcmData: encoded.adpcmData,
      sampleCount: wav.samples.length,
      loopEnabled: false,
      loopStart: 0,
      loopEnd: wav.samples.length,
      loopCount: 0,
      loopState: new Int16Array(16),
      order: encoded.codebook.order,
      predictors: encoded.codebook.predictorCount,
      book: flattenBook(encoded.codebook),
    };

    return {
      success: true,
      message: `OK (SNR: ${computeSNR(encoded.signalMeanSquare, encoded.errorMeanSquare).toFixed(1)} dB)`,
      data: writeSohSample(sampleData),
    };
  }, []);

  return { convertSample };
}

function flattenBook(codebook: { vectors: Int16Array[] }): Int16Array {
  const total = codebook.vectors.reduce((sum, v) => sum + v.length, 0);
  const book = new Int16Array(total);
  let offset = 0;
  for (const v of codebook.vectors) {
    book.set(v, offset);
    offset += v.length;
  }
  return book;
}

function computeSNR(signalMS: number, errorMS: number): number {
  if (errorMS <= 0) return 999;
  return 10 * Math.log10(signalMS / errorMS);
}
