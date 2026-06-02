import { useEffect, useState, useRef } from 'react';
import type { SF64TextureCache } from '../lib/sf64-texture-cache';
import { RADIO_CHARACTER_NAMES, getBriefingSpeakerName } from '../lib/radio-char-codes';

interface RadioPreviewProps {
  charCodes: Uint16Array | null;
  textureCache: SF64TextureCache | null;
  textureVersion?: number;
  characterId?: number;
  isPlaying?: boolean;
  messageType?: 'radio' | 'briefing' | 'title' | 'prologue' | 'credits';
}

export function RadioPreview({ charCodes, textureCache, textureVersion, characterId = 0, isPlaying = false, messageType = 'radio' }: RadioPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mouthOpen, setMouthOpen] = useState(false);
  const prevKey = useRef('');
  const animRef = useRef(0);

  // Animate mouth during voice playback
  useEffect(() => {
    if (!isPlaying) {
      setMouthOpen(false);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      }
      return;
    }

    const tick = () => {
      setMouthOpen(prev => !prev);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!charCodes || charCodes.length === 0) {
      setPreviewUrl(null);
      return;
    }

    const key = `${Array.from(charCodes).join(',')}:${characterId}:${mouthOpen}:${messageType}:${textureVersion}`;
    if (key === prevKey.current && previewUrl) return;
    prevKey.current = key;

    if (textureCache?.fontRenderer.isLoaded) {
      const url = messageType === 'briefing'
        ? textureCache.renderBriefingPreview(charCodes, characterId, mouthOpen)
        : messageType === 'prologue'
          ? textureCache.renderProloguePreview(charCodes)
          : messageType === 'credits'
            ? textureCache.renderCreditsPreview(charCodes)
            : textureCache.renderPreview(charCodes, characterId, mouthOpen);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [charCodes, textureCache, previewUrl, characterId, mouthOpen, messageType, textureVersion]);

  const charName = messageType === 'briefing'
    ? (getBriefingSpeakerName(characterId) ?? undefined)
    : messageType === 'prologue'
      ? 'Prologue'
      : messageType === 'credits'
        ? 'Credits / Score'
        : (characterId >= 0 ? RADIO_CHARACTER_NAMES[characterId] : undefined);

  if (!charCodes || charCodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
        Select a message to preview
      </div>
    );
  }

  if (previewUrl && textureCache?.fontRenderer.isLoaded) {
    return (
      <div className="flex flex-col items-center">
        {charName && (
          <div className="text-xs text-[var(--color-accent)] mb-2 font-medium">
            {charName}
          </div>
        )}
        <img
          src={previewUrl}
          alt="Radio message preview"
          className="rounded border border-blue-400/30 max-w-full"
          style={{ imageRendering: 'pixelated' }}
        />
        <span className="text-xs text-[var(--color-text-muted)] mt-2">
          Rendered with game textures
        </span>
      </div>
    );
  }

  return <CSSFallbackPreview charCodes={charCodes} charName={charName} />;
}

function CSSFallbackPreview({ charCodes, charName }: { charCodes: Uint16Array; charName?: string }) {
  type Seg = { text: string; yellow?: boolean };
  const lines: Seg[][] = [[]];
  let currentLine = lines[0]!;

  for (let i = 0; i < charCodes.length; i++) {
    const code = charCodes[i]!;
    if (code === 0x00) break;
    if (code === 0x01) {
      const newLine: Seg[] = [];
      lines.push(newLine);
      currentLine = newLine;
    } else if (code >= 0x02 && code <= 0x07) {
      // no-op
    } else if (code >= 0x08 && code <= 0x0B) {
      currentLine.push({ text: `[PRI${code - 0x08}]` });
    } else if (code === 0x0C) {
      currentLine.push({ text: ' ' });
    } else if (code === 0x0D || code === 0x0E) {
      // half/quarter space
    } else if (code === 0x0F) {
      const newLine: Seg[] = [];
      lines.push(newLine);
      currentLine = newLine;
    } else if (code >= 0x10 && code <= 0x13) {
      const cButtons = ['C←', 'C↑', 'C→', 'C↓'];
      currentLine.push({ text: cButtons[code - 0x10] ?? '?', yellow: true });
    } else if (code >= 0x14 && code <= 0x17) {
      const arrows = ['↑', '←', '↓', '→'];
      currentLine.push({ text: arrows[code - 0x14] ?? '?' });
    } else {
      const charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?-.,0123456789\'():|';
      const idx = code - 0x18;
      if (idx >= 0 && idx < charMap.length) {
        currentLine.push({ text: charMap[idx]! });
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      {charName && (
        <div className="text-xs text-[var(--color-accent)] mb-2 font-medium">
          {charName}
        </div>
      )}
      <div className="flex items-center gap-2">
        {/* Portrait placeholder */}
        <div
          className="w-11 h-11 rounded border border-blue-400/30 flex items-center justify-center text-[10px] text-blue-300/60"
          style={{ background: 'rgba(30, 30, 80, 0.8)' }}
        >
          {charName ? charName.split(' ')[0] : '?'}
        </div>
        {/* Textbox */}
        <div
          className="flex-1 rounded border border-blue-400/30 p-2"
          style={{ background: 'rgba(60, 60, 255, 0.67)' }}
        >
          <div className="text-white text-xs leading-4 whitespace-pre-wrap break-words" style={{ fontFamily: 'monospace' }}>
            {lines.map((line, li) => (
              <div key={li}>
                {line.map((seg, si) =>
                  seg.yellow
                    ? <span key={si} className="text-yellow-400">{seg.text}</span>
                    : seg.text
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="text-xs text-[var(--color-text-muted)] mt-2">
        CSS fallback preview
      </span>
    </div>
  );
}
