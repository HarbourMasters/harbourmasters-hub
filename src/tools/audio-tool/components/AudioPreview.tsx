import { useCallback, useRef } from 'react';
import { Play } from 'lucide-react';
import { AudioPreviewPlayer } from '@/lib/audio/audio-preview';
import type { SampleItem } from '../hooks/useAudioSamples';

interface AudioPreviewProps {
  item: SampleItem;
}

export function AudioPreview({ item }: AudioPreviewProps) {
  const playerRef = useRef<AudioPreviewPlayer | null>(null);

  const handlePlay = useCallback(async () => {
    if (!playerRef.current) {
      playerRef.current = new AudioPreviewPlayer();
    }

    if (!item.floatSamples || !item.wavData) return;

    try {
      await playerRef.current.play(item.floatSamples, item.wavData.sampleRate);
    } catch { /* playback failed */ }
  }, [item]);

  if (!item.floatSamples) return null;

  return (
    <button
      onClick={handlePlay}
      className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-accent)] transition-colors"
      title="Listen custom sample"
    >
      <Play className="w-3.5 h-3.5" />
    </button>
  );
}
