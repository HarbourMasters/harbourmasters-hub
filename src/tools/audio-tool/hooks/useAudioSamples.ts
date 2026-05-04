import { useState, useCallback } from 'react';
import { type WavData } from '@/lib/audio/wav-reader';
import { decodeAudioFile, type DecodedAudio } from '@/lib/audio/audio-decoder';
import { resampleAudio } from '@/lib/audio/audio-resampler';
import { pcmToFloat32 } from '@/lib/audio/audio-preview';

const TARGET_SAMPLE_RATE = 32000;

export interface SampleItem {
  id: string;
  fileName: string;
  fileData: Uint8Array;
  wavData: WavData | null;
  floatSamples: Float32Array | null;
  originalSampleRate: number;
  outputName: string;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  loopCount: number;
  status: 'ready' | 'converting' | 'converted' | 'error';
  statusMessage: string;
  convertedData: Uint8Array | null;
  format: 'wav' | 'ogg';
}

let nextId = 0;

export function useAudioSamples() {
  const [items, setItems] = useState<SampleItem[]>([]);

  const addFiles = useCallback((files: File[]) => {
    const newItems: SampleItem[] = [];
    let loaded = 0;

    files.forEach(file => {
      const lower = file.name.toLowerCase();
      const format = lower.endsWith('.ogg') || lower.endsWith('.oga') ? 'ogg' : 'wav';

      const reader = new FileReader();
      reader.onload = async () => {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        let wavData: WavData | null = null;
        let floatSamples: Float32Array | null = null;
        let originalSampleRate = 0;
        let status: SampleItem['status'] = 'error';
        let statusMessage = '';

        try {
          const decoded: DecodedAudio = await decodeAudioFile(data, file.name);
          originalSampleRate = decoded.originalSampleRate;

          let samples = decoded.samples;

          if (decoded.sampleRate !== TARGET_SAMPLE_RATE) {
            samples = await resampleAudio(samples, decoded.sampleRate, TARGET_SAMPLE_RATE);
            statusMessage = `Resampled ${decoded.sampleRate} → ${TARGET_SAMPLE_RATE} Hz`;
          }

          wavData = { sampleRate: TARGET_SAMPLE_RATE, samples };
          floatSamples = pcmToFloat32(samples);
          status = 'ready';
          if (!statusMessage) statusMessage = 'Ready';
        } catch (e) {
          statusMessage = e instanceof Error ? e.message : 'Failed to read audio';
        }

        newItems.push({
          id: `sample-${nextId++}`,
          fileName: file.name,
          fileData: data,
          wavData,
          floatSamples,
          originalSampleRate,
          outputName: '',
          loopEnabled: false,
          loopStart: 0,
          loopEnd: 0,
          loopCount: -1,
          status,
          statusMessage,
          convertedData: null,
          format,
        });

        loaded++;
        if (loaded === files.length) {
          setItems(prev => [...prev, ...newItems]);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<SampleItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return { items, setItems, addFiles, removeItem, updateItem, clearAll };
}
