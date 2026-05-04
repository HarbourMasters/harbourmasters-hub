import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PlayControlsProps {
  isPlaying: boolean;
  isFinished: boolean;
  charIndex: number;
  totalChars: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function PlayControls({
  isPlaying,
  isFinished,
  charIndex,
  totalChars,
  onPlay,
  onPause,
  onReset,
}: PlayControlsProps) {
  const { t } = useTranslation('tools');

  const progress = totalChars > 0 ? (charIndex / totalChars) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={isFinished && !isPlaying}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/30 transition-colors disabled:opacity-40"
        title={isPlaying ? t('messageEditor.pause') : t('messageEditor.play')}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <button
        onClick={onReset}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
        title={t('messageEditor.reset')}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-xs text-[var(--color-text-muted)] font-mono tabular-nums">
        {charIndex}/{totalChars}
      </span>
    </div>
  );
}
