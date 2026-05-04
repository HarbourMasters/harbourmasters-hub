import { useRef, useEffect, useCallback, useState } from 'react';
import { Play, Square, Repeat, ChevronDown } from 'lucide-react';
import { extractPeaks, type WaveformPeaks } from '@/lib/audio/audio-waveform';
import { AudioPreviewPlayer } from '@/lib/audio/audio-preview';

const MARKER_HIT_ZONE = 12;

interface WaveformVisualizerProps {
  samples: Float32Array;
  sampleRate: number;
  loopStart: number;
  loopEnd: number;
  loopEnabled: boolean;
  onLoopChange: (start: number, end: number) => void;
  label?: string;
}

// Resolve any CSS color variable to a #rrggbb hex string.
// Uses a temp DOM element because getComputedStyle always returns rgb()/rgba()
// even for oklch/hsl/etc., while Canvas 2D silently rejects non-sRGB colors.
const _colorCache = new Map<string, string>();

function resolveToHex(cssVar: string): string {
  const cached = _colorCache.get(cssVar);
  if (cached) return cached;

  let result = '#6fa8ff';
  try {
    const temp = document.createElement('div');
    temp.style.display = 'none';
    temp.style.color = cssVar;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    const m = computed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
      const r = parseInt(m[1]).toString(16).padStart(2, '0');
      const g = parseInt(m[2]).toString(16).padStart(2, '0');
      const b = parseInt(m[3]).toString(16).padStart(2, '0');
      result = `#${r}${g}${b}`;
    }
  } catch { /* fallback */ }

  _colorCache.set(cssVar, result);
  return result;
}

function hexRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function WaveformVisualizer({
  samples,
  sampleRate,
  loopStart,
  loopEnd,
  loopEnabled,
  onLoopChange,
  label,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const peaksRef = useRef<WaveformPeaks | null>(null);
  const playerRef = useRef<AudioPreviewPlayer | null>(null);
  const dragRef = useRef<{ marker: 'A' | 'B' } | null>(null);

  const [canvasWidth, setCanvasWidth] = useState(600);
  const [playing, setPlaying] = useState<'none' | 'all' | 'loop' | 'once-loop'>('none');
  const [hoverSample, setHoverSample] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const canvasHeight = 200;
  const dpr = window.devicePixelRatio || 1;

  useEffect(() => {
    if (samples.length === 0) return;
    peaksRef.current = extractPeaks(samples, sampleRate, canvasWidth);
  }, [samples, sampleRate, canvasWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setCanvasWidth(Math.floor(entry.contentRect.width));
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Draw waveform
  useEffect(() => {
    if (collapsed) return;
    const canvas = canvasRef.current;
    const peaks = peaksRef.current;
    if (!canvas || !peaks || peaks.mins.length === 0) return;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const midY = canvasHeight / 2;
    const peakCount = peaks.mins.length;

    const accent = resolveToHex('var(--color-accent)');
    const border = resolveToHex('var(--color-border)');

    // Draw loop region highlight
    if (loopEnabled && samples.length > 0) {
      const aX = (loopStart / samples.length) * canvasWidth;
      const bX = (loopEnd / samples.length) * canvasWidth;

      const grad = ctx.createLinearGradient(aX, 0, bX, 0);
      grad.addColorStop(0, hexRgba(accent, 0.03));
      grad.addColorStop(0.5, hexRgba(accent, 0.09));
      grad.addColorStop(1, hexRgba(accent, 0.03));
      ctx.fillStyle = grad;
      ctx.fillRect(aX, 0, bX - aX, canvasHeight);
    }

    // Draw waveform bars with gradient
    for (let i = 0; i < peakCount; i++) {
      const x = i;
      const min = peaks.mins[i];
      const max = peaks.maxs[i];
      const top = midY + min * midY;
      const bottom = midY + max * midY;
      const height = Math.max(1, bottom - top);

      const barGrad = ctx.createLinearGradient(x, top, x, bottom);
      barGrad.addColorStop(0, hexRgba(accent, 0.31));
      barGrad.addColorStop(0.3, hexRgba(accent, 0.69));
      barGrad.addColorStop(0.5, hexRgba(accent, 1));
      barGrad.addColorStop(0.7, hexRgba(accent, 0.69));
      barGrad.addColorStop(1, hexRgba(accent, 0.31));
      ctx.fillStyle = barGrad;
      ctx.fillRect(x, top, 1, height);
    }

    // Zero line
    ctx.strokeStyle = hexRgba(border, 0.38);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(canvasWidth, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw loop markers
    if (loopEnabled && samples.length > 0) {
      const aX = (loopStart / samples.length) * canvasWidth;
      const bX = (loopEnd / samples.length) * canvasWidth;

      drawMarker(ctx, aX, canvasHeight, '#22c55e', 'A');
      drawMarker(ctx, bX, canvasHeight, '#ef4444', 'B');
    }

    // Hover line
    if (hoverSample !== null && samples.length > 0) {
      const x = (hoverSample / samples.length) * canvasWidth;
      ctx.strokeStyle = hexRgba(accent, 0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
  }, [canvasWidth, dpr, loopStart, loopEnd, loopEnabled, samples.length, hoverSample, collapsed]);

  const sampleToX = useCallback(
    (sample: number) => (sample / Math.max(1, samples.length)) * canvasWidth,
    [samples.length, canvasWidth],
  );

  const xToSample = useCallback(
    (x: number) => Math.round((x / canvasWidth) * samples.length),
    [samples.length, canvasWidth],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;

      if (loopEnabled) {
        const aX = sampleToX(loopStart);
        const bX = sampleToX(loopEnd);

        if (Math.abs(x - aX) < MARKER_HIT_ZONE) {
          dragRef.current = { marker: 'A' };
          return;
        }
        if (Math.abs(x - bX) < MARKER_HIT_ZONE) {
          dragRef.current = { marker: 'B' };
          return;
        }
      }
    },
    [loopEnabled, loopStart, loopEnd, sampleToX],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;

      if (dragRef.current) {
        const sample = Math.max(0, Math.min(samples.length, xToSample(x)));
        if (dragRef.current.marker === 'A') {
          onLoopChange(sample, loopEnd);
        } else {
          onLoopChange(loopStart, sample);
        }
        return;
      }

      setHoverSample(xToSample(x));

      if (loopEnabled && canvasRef.current) {
        const aX = sampleToX(loopStart);
        const bX = sampleToX(loopEnd);
        if (Math.abs(x - aX) < MARKER_HIT_ZONE || Math.abs(x - bX) < MARKER_HIT_ZONE) {
          canvasRef.current.style.cursor = 'ew-resize';
        } else {
          canvasRef.current.style.cursor = 'crosshair';
        }
      }
    },
    [samples.length, loopEnabled, loopStart, loopEnd, xToSample, sampleToX, onLoopChange],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    dragRef.current = null;
    setHoverSample(null);
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.stop();
    setPlaying('none');
  }, []);

  const playAll = useCallback(async () => {
    if (!playerRef.current) playerRef.current = new AudioPreviewPlayer();
    stop();
    await playerRef.current.play(samples, sampleRate);
    setPlaying('all');
    setTimeout(() => setPlaying('none'), (samples.length / sampleRate) * 1000);
  }, [samples, sampleRate, stop]);

  const playLoop = useCallback(async () => {
    if (!playerRef.current) playerRef.current = new AudioPreviewPlayer();
    stop();
    const region = samples.slice(loopStart, loopEnd);
    if (region.length === 0) return;
    await playerRef.current.play(region, sampleRate);
    setPlaying('loop');
    setTimeout(() => setPlaying('none'), (region.length / sampleRate) * 1000);
  }, [samples, sampleRate, loopStart, loopEnd, stop]);

  const playOnceThenLoop = useCallback(async () => {
    if (!playerRef.current) playerRef.current = new AudioPreviewPlayer();
    stop();

    const oncePart = samples.slice(0, loopEnd);
    const loopPart = samples.slice(loopStart, loopEnd);

    if (oncePart.length === 0 || loopPart.length === 0) return;

    setPlaying('once-loop');

    await playerRef.current.play(oncePart, sampleRate);

    if (playerRef.current) {
      await playerRef.current.play(loopPart, sampleRate);
    }
    setTimeout(() => setPlaying('none'), (loopPart.length / sampleRate) * 1000);
  }, [samples, sampleRate, loopStart, loopEnd, stop]);

  const formatTime = (sample: number) => {
    const seconds = sample / sampleRate;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : `${secs}s`;
  };

  const isPlaying = playing !== 'none';

  return (
    <div className="rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)] overflow-hidden">
      {/* Header bar — div (not button) to avoid nesting buttons */}
      <div
        onClick={() => setCollapsed(prev => !prev)}
        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
      >
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          {label ?? 'Waveform'}
        </span>
        <span className="text-[10px] font-mono text-[var(--color-text-muted)] ml-1">
          {sampleRate.toLocaleString()} Hz &middot; {(samples.length / sampleRate).toFixed(2)}s
        </span>

        <div className="ml-auto flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {/* Play All */}
          <button
            onClick={playAll}
            disabled={isPlaying}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-40 transition-colors"
            title="Play all"
          >
            <Play className="w-3 h-3" />
            <span className="hidden sm:inline">{playing === 'all' ? 'Playing...' : 'Play'}</span>
          </button>

          {/* Play Loop */}
          {loopEnabled && (
            <button
              onClick={playLoop}
              disabled={isPlaying}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-green-400 hover:bg-green-400/10 disabled:opacity-40 transition-colors"
              title="Play loop region only"
            >
              <Repeat className="w-3 h-3" />
              <span className="hidden sm:inline">{playing === 'loop' ? 'Looping...' : 'Loop'}</span>
            </button>
          )}

          {/* Play Once + Loop */}
          {loopEnabled && (
            <button
              onClick={playOnceThenLoop}
              disabled={isPlaying}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-blue-400 hover:bg-blue-400/10 disabled:opacity-40 transition-colors"
              title="Play once then loop"
            >
              <Play className="w-3 h-3" />
              <Repeat className="w-3 h-3 -ml-1" />
              <span className="hidden sm:inline">{playing === 'once-loop' ? 'Playing...' : 'Once+Loop'}</span>
            </button>
          )}

          {/* Stop */}
          {isPlaying && (
            <button
              onClick={stop}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
              title="Stop"
            >
              <Square className="w-3 h-3" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Waveform canvas — collapsible */}
      {!collapsed && (
        <>
          <div ref={containerRef} className="w-full px-3">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="w-full rounded-lg border border-[var(--color-border)]"
              style={{ background: 'transparent' }}
            />
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-[var(--color-text-muted)]">
            {loopEnabled && (
              <span>
                A: {loopStart.toLocaleString()} ({formatTime(loopStart)})
                {' — '}
                B: {loopEnd.toLocaleString()} ({formatTime(loopEnd)})
              </span>
            )}
            {hoverSample !== null && (
              <span className="font-mono ml-auto">
                {hoverSample.toLocaleString()} ({formatTime(hoverSample)})
              </span>
            )}
            {!loopEnabled && hoverSample === null && <span className="ml-auto">Enable loop to set A/B points</span>}
          </div>
        </>
      )}
    </div>
  );
}

function drawMarker(ctx: CanvasRenderingContext2D, x: number, height: number, color: string, label: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
  ctx.restore();

  const tabW = 16;
  const tabH = 16;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.roundRect(x - tabW / 2, 0, tabW, tabH, 3);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, tabH / 2);
}
