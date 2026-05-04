import { useState, useEffect, useMemo } from 'react';
import type { MessageEntry } from '../../lib/message-parser';
import type { TextureCache } from '../../lib/texture-cache';
import { TextboxRenderer, getColorCSS } from '../../lib/textbox-renderer';
import {
  TEXTBOX_WIDTH,
  TEXTBOX_HEIGHT,
  R_TEXTBOX_X,
  R_TEXT_INIT_XPOS_NES,
  R_TEXT_INIT_XPOS_JP,
  R_TEXT_LINE_SPACING_NES,
  R_TEXT_LINE_SPACING_JP,
  R_TEXT_CHAR_SCALE_NES,
  R_TEXT_CHAR_SCALE_JP,
  getTextInitY,
  TEXTBOX_END_ICON_Y_OFFSETS,
  getCharAdvance,
} from '../../lib/textbox-renderer';
import { CHAR_SIZE } from '../../lib/font-renderer';
import { CTRL } from '../../lib/control-codes';
import { PlaySimulator } from '../../lib/play-simulator';

interface DOMPreviewProps {
  message: MessageEntry;
  resolver: { findFiles: (prefix: string) => string[] } | null;
  textureCache: TextureCache | null;
  revealChars?: number;
  isPlaying?: boolean;
  isWaiting?: boolean;
  isChoosing?: boolean;
  choiceCount?: 0 | 2 | 3;
  selectedChoice?: number;
  boxOpenFrame?: number;
  fadeAlpha?: number;
  onClick?: () => void;
  onChoiceSelect?: (index: number) => void;
}

// A single positioned element in the textbox
interface RenderGlyph {
  type: 'char';
  charIndex: number; // absolute index across all boxes (for reveal)
  charCode: number;
  color: string;
  x: number; // px from textbox left (N64 coordinates, relative to textbox origin)
  y: number; // px from textbox top
}

interface RenderIcon {
  type: 'icon';
  charIndex: number;
  itemId: number;
  x: number;
  y: number;
  size: number;
}

type RenderElement = RenderGlyph | RenderIcon;

interface ParsedBox {
  elements: RenderElement[];
  totalChars: number;
  lineCount: number;
  endType: 'triangle' | 'arrow' | 'square' | 'none';
  bgUrl: string;
  indicatorUrl: string;
}

const RENDER_SCALE = 2;

const boxPixelWidth = TEXTBOX_WIDTH * RENDER_SCALE;
const boxPixelHeight = TEXTBOX_HEIGHT * RENDER_SCALE;

// Indicator position from z_message_PAL.c: R_TEXTBOX_END_XPOS=158, sTextboxEndIconYOffset=59
// Relative to textbox origin: X = 158 - R_TEXTBOX_X(34) = 124
const INDICATOR_X = 158 - R_TEXTBOX_X;
// Y offset per textbox type (index into TEXTBOX_END_ICON_Y_OFFSETS)
// sCharTexSize = 16 * (R_TEXT_CHAR_SCALE/100) = 16 * 0.75 = 12
const INDICATOR_SIZE = 12;

export function DOMPreview({ message, resolver, textureCache, revealChars, isPlaying, isWaiting, isChoosing, choiceCount, selectedChoice, boxOpenFrame, fadeAlpha, onClick, onChoiceSelect }: DOMPreviewProps) {
  const [textboxRenderer, setTextboxRenderer] = useState<TextboxRenderer | null>(null);
  const [boxes, setBoxes] = useState<ParsedBox[]>([]);
  const [indicatorPhase, setIndicatorPhase] = useState(0);

  // Animate indicator pulsation (~600ms cycle = 12 frames at ~20fps)
  useEffect(() => {
    if (!isWaiting) {
      setIndicatorPhase(0);
      return;
    }
    let frame = 0;
    let rafId: number;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      if (now - lastTime >= 50) {
        frame = (frame + 1) % 12;
        setIndicatorPhase(frame);
        lastTime = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isWaiting]);

  useEffect(() => {
    if (!resolver) return;
    setTextboxRenderer(new TextboxRenderer(resolver as any));
  }, [resolver]);

  // Parse message data into per-character positioned elements
  // All positions are relative to textbox origin (0,0 = top-left of textbox)
  useEffect(() => {
    if (!textboxRenderer || !textureCache) return;

    const isJpn = message.isJapanese ?? false;
    const lineSpacing = (isJpn ? R_TEXT_LINE_SPACING_JP : R_TEXT_LINE_SPACING_NES);
    // Text X on N64 screen = R_TEXT_INIT_XPOS. Relative to textbox = R_TEXT_INIT_XPOS - R_TEXTBOX_X
    const textInitX = (isJpn ? R_TEXT_INIT_XPOS_JP : R_TEXT_INIT_XPOS_NES) - R_TEXTBOX_X;

    if (isJpn) {
      // TODO: Japanese per-character rendering
      setBoxes([]);
      return;
    }

    const rawBoxes = textboxRenderer.splitIntoBoxes(message.data);
    const parsedBoxes: ParsedBox[] = [];
    let globalCharIdx = 0;

    for (const box of rawBoxes) {
      const elements: RenderElement[] = [];
      let currentColor = getColorCSS(0x40, message.textboxType);
      let curX = textInitX;
      let curY = 0;
      let curLine = 0;
      let di = 0;
      let iconOffset = 0; // +32 after ITEM_ICON, applied to all lines

      // First pass: count newlines to determine textInitY
      let nlCount = 0;
      for (let i = 0; i < box.data.length; i++) {
        if (box.data[i] === CTRL.NEWLINE) nlCount++;
        else if (box.data[i] < 0x20) {
          i += getControlCodeArgCount(box.data[i]);
        }
      }
      const textInitY = getTextInitY(nlCount, message.textboxType);

      curY = textInitY;
      curX = textInitX;

      // Second pass: build positioned elements
      while (di < box.data.length) {
        const byte = box.data[di];

        if (byte === CTRL.NEWLINE) {
          curLine++;
          curX = textInitX + iconOffset;
          curY = textInitY + curLine * lineSpacing;
          di++;
        } else if (byte === CTRL.COLOR) {
          const colorId = box.data[di + 1];
          currentColor = getColorCSS(colorId ?? 0x40, message.textboxType);
          di += 2;
        } else if (byte === CTRL.ITEM_ICON) {
          const itemId = box.data[di + 1] ?? 0;
          // From z_message_PAL.c:
          //   R_TEXTBOX_ICON_XPOS = R_TEXT_INIT_XPOS - 72 (for 24px items)
          //   Draw at: textPosX + R_TEXTBOX_ICON_XPOS (screen coords)
          //   textPosX = R_TEXT_INIT_XPOS at this point
          //   Screen X = R_TEXT_INIT_XPOS + (R_TEXT_INIT_XPOS - 72) = 2*R_TEXT_INIT_XPOS - 72
          //   Relative to textbox: (2*R_TEXT_INIT_XPOS - 72) - R_TEXTBOX_X
          const screenIconX = 2 * (textInitX + R_TEXTBOX_X) - 72;
          const boxIconX = screenIconX - R_TEXTBOX_X;
          elements.push({
            type: 'icon',
            charIndex: globalCharIdx,
            itemId,
            x: boxIconX,
            y: textInitY + 10,
            size: 24,
          });
          // Text advances by 32px after icon (R_TEXT_INIT_XPOS += 32 in game)
          // This offset persists across all subsequent lines
          iconOffset = 32;
          curX = textInitX + iconOffset;
          di += 2;
        } else if (byte === CTRL.SHIFT) {
          const shift = box.data[di + 1] ?? 0;
          curX += shift;
          di += 2;
        } else if (byte === CTRL.NAME) {
          for (const ch of 'Link') {
            elements.push({
              type: 'char',
              charIndex: globalCharIdx++,
              charCode: ch.charCodeAt(0),
              color: currentColor,
              x: curX,
              y: curY,
            });
            curX += getCharAdvance(ch.charCodeAt(0));
          }
          di++;
        } else if (byte < 0x20) {
          di += 1 + getControlCodeArgCount(byte);
        } else {
          // Printable character
          elements.push({
            type: 'char',
            charIndex: globalCharIdx++,
            charCode: byte,
            color: currentColor,
            x: curX,
            y: curY,
          });
          curX += getCharAdvance(byte);
          di++;
        }
      }

      parsedBoxes.push({
        elements,
        totalChars: globalCharIdx,
        lineCount: nlCount,
        endType: box.endType,
        bgUrl: '',
        indicatorUrl: '',
      });
    }

    // Async load backgrounds and indicators, then set state
    const loadAssets = async () => {
      for (const box of parsedBoxes) {
        try { box.bgUrl = (await textureCache.getBackgroundUrl(message.textboxType)) ?? ''; } catch { /* no bg */ }
        const indName = box.endType === 'arrow' ? 'arrow' : box.endType === 'triangle' ? 'triangle' : 'square';
        if (box.endType !== 'none') {
          try { box.indicatorUrl = await textureCache.getIndicatorUrl(indName); } catch { /* no indicator */ }
        }
      }
      setBoxes(parsedBoxes);
    };
    loadAssets();

  }, [message.data, message.textboxType, message.isJapanese, textboxRenderer, textureCache]);

  const totalCharsPerBox = useMemo(() => {
    return boxes.map(box => {
      let count = 0;
      for (const el of box.elements) {
        if (el.type === 'char') count++;
      }
      return count;
    });
  }, [boxes]);

  const isPlayMode = isPlaying || isWaiting || revealChars !== undefined;

  const currentPlayBox = useMemo(() => {
    if (!isPlayMode || revealChars === undefined) return 0;
    let count = 0;
    for (let i = 0; i < totalCharsPerBox.length; i++) {
      count += totalCharsPerBox[i]!;
      if (revealChars <= count) return i;
    }
    return boxes.length - 1;
  }, [isPlayMode, revealChars, totalCharsPerBox, boxes.length]);

  if (!resolver) {
    return (
      <div className="flex items-center justify-center h-32 text-[var(--color-text-muted)] text-sm">
        Load an O2R file to see preview
      </div>
    );
  }

  if (!textureCache) {
    return (
      <div className="flex items-center justify-center h-32 text-[var(--color-text-muted)] text-sm">
        Loading textures...
      </div>
    );
  }

  const isJpn = message.isJapanese ?? false;
  const charScale = (isJpn ? R_TEXT_CHAR_SCALE_JP : R_TEXT_CHAR_SCALE_NES) / 100;
  const glyphH = Math.ceil(CHAR_SIZE * charScale * RENDER_SCALE);

  // Indicator Y offset for current textbox type
  const indYOffset = TEXTBOX_END_ICON_Y_OFFSETS[message.textboxType] ?? 59;

  return (
    <div
      className={`inline-flex ${isPlayMode ? 'flex-col items-center' : 'flex-row items-start gap-3 flex-wrap justify-center'} ${isWaiting ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {boxes.map((box, boxIdx) => {
        if (isPlayMode && boxIdx > currentPlayBox) return null;

        // Box opening animation
        const isOpening = isPlayMode && boxOpenFrame !== undefined && boxIdx === currentPlayBox;
        const { scaleX, scaleY, alpha: openAlpha } = isOpening
          ? PlaySimulator.getBoxOpenScale(boxOpenFrame)
          : { scaleX: 1, scaleY: 1, alpha: 1 };
        const fadeOpacity = fadeAlpha !== undefined ? fadeAlpha : 1;
        const boxOpacity = Math.min(openAlpha, fadeOpacity);

        const boxStyle: React.CSSProperties = isOpening
          ? { width: boxPixelWidth * scaleX, height: boxPixelHeight * scaleY, opacity: boxOpacity }
          : fadeOpacity < 1
            ? { width: boxPixelWidth, height: boxPixelHeight, opacity: boxOpacity }
            : { width: boxPixelWidth, height: boxPixelHeight };

        const indSize = INDICATOR_SIZE * RENDER_SCALE;

        return (
          <div
            key={boxIdx}
            className="relative overflow-hidden flex-shrink-0"
            style={boxStyle}
          >
            {/* Background */}
            {box.bgUrl && (
              <img
                src={box.bgUrl}
                className="absolute inset-0 w-full h-full"
                style={{ imageRendering: 'pixelated', objectFit: 'fill' }}
              />
            )}

            {/* Characters and icons — rendered individually */}
            {box.elements.map((el, elIdx) => {
              if (el.type === 'icon') {
                const iconSize = el.size * RENDER_SCALE;
                return (
                  <ItemIconElement
                    key={`icon-${elIdx}`}
                    textureCache={textureCache}
                    itemId={el.itemId}
                    style={{
                      position: 'absolute',
                      left: el.x * RENDER_SCALE,
                      top: el.y * RENDER_SCALE,
                      width: iconSize,
                      height: iconSize,
                      imageRendering: 'pixelated',
                    }}
                  />
                );
              }

              // Character glyph
              const isRevealed = !isPlayMode || revealChars === undefined || el.charIndex < revealChars;
              if (!isRevealed) return null;

              return (
                <GlyphElement
                  key={`char-${elIdx}`}
                  textureCache={textureCache}
                  charCode={el.charCode}
                  color={el.color}
                  style={{
                    position: 'absolute',
                    left: el.x * RENDER_SCALE,
                    top: el.y * RENDER_SCALE,
                    width: glyphH,
                    height: glyphH,
                    imageRendering: 'pixelated',
                  }}
                />
              );
            })}

            {/* Indicator — positioned per z_message_PAL.c: center-bottom of textbox */}
            {box.indicatorUrl && box.endType !== 'none' && !isChoosing && (() => {
              const isActive = isWaiting && boxIdx === currentPlayBox;
              const t = isActive ? (Math.sin((indicatorPhase / 12) * Math.PI * 2) + 1) / 2 : 1;
              const r = Math.round(0 + t * 50);
              const g = Math.round(80 + t * 50);
              const b = Math.round(200 + t * 55);
              return (
                <div
                  className="absolute"
                  style={{
                    width: indSize,
                    height: indSize,
                    left: INDICATOR_X * RENDER_SCALE,
                    top: indYOffset * RENDER_SCALE,
                    backgroundColor: `rgb(${r},${g},${b})`,
                  }}
                >
                  <img
                    src={box.indicatorUrl}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated', mixBlendMode: 'multiply' }}
                  />
                </div>
              );
            })()}

            {/* Choice selection overlay */}
            {isChoosing && choiceCount && choiceCount > 0 && boxIdx === currentPlayBox && (() => {
              const textInitY = getTextInitY(box.lineCount, message.textboxType);
              const textInitX = (isJpn ? R_TEXT_INIT_XPOS_JP : R_TEXT_INIT_XPOS_NES) - R_TEXTBOX_X;
              const choiceYOffsets = [20, 32, 44];
              const arrowSize = INDICATOR_SIZE * RENDER_SCALE;
              const choiceX = textInitX * RENDER_SCALE;
              return (
                <>
                  {Array.from({ length: choiceCount }, (_, ci) => {
                    const choiceY = (textInitY + choiceYOffsets[ci]!) * RENDER_SCALE;
                    const isSelected = ci === selectedChoice;
                    return (
                      <div
                        key={`choice-${ci}`}
                        className="absolute cursor-pointer"
                        style={{
                          left: choiceX,
                          top: choiceY,
                          width: boxPixelWidth - choiceX,
                          height: INDICATOR_SIZE * RENDER_SCALE,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        onMouseEnter={() => onChoiceSelect?.(ci)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChoiceSelect?.(ci);
                          onClick?.();
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              width: arrowSize,
                              height: arrowSize,
                              backgroundColor: 'rgb(80,200,80)',
                              clipPath: 'polygon(100% 50%, 0 0, 0 100%)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        );
      })}

      {isWaiting && !isChoosing && (
        <div className="text-center py-1.5 text-[10px] text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-md border border-[var(--color-accent)]/20 w-full mt-1">
          Click to advance
        </div>
      )}
      {isChoosing && (
        <div className="text-center py-1.5 text-[10px] text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-md border border-[var(--color-accent)]/20 w-full mt-1">
          Click to select
        </div>
      )}
    </div>
  );
}

// Individual glyph element — loads its own tinted texture on demand
function GlyphElement({ textureCache, charCode, color, style }: {
  textureCache: TextureCache;
  charCode: number;
  color: string;
  style: React.CSSProperties;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    textureCache.getGlyphUrl(charCode, color).then(u => {
      if (!cancelled) setUrl(u);
    });
    return () => { cancelled = true; };
  }, [textureCache, charCode, color]);

  if (!url) return <div style={style} />;
  return <img src={url} style={style} />;
}

// Item icon element — loads its icon texture on demand
function ItemIconElement({ textureCache, itemId, style }: {
  textureCache: TextureCache;
  itemId: number;
  style: React.CSSProperties;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    textureCache.getItemIconUrl(itemId).then(u => {
      if (!cancelled && u) setUrl(u);
    });
    return () => { cancelled = true; };
  }, [textureCache, itemId]);

  if (!url) return <div style={style} />;
  return <img src={url} style={style} />;
}

function getControlCodeArgCount(code: number): number {
  switch (code) {
    case CTRL.COLOR: return 1;
    case CTRL.SHIFT: return 1;
    case CTRL.SFX: return 2;
    case CTRL.ITEM_ICON: return 1;
    case CTRL.TEXT_SPEED: return 1;
    case CTRL.BACKGROUND: return 3;
    case CTRL.OCARINA: return 3;
    case CTRL.HIGHSCORE: return 1;
    case CTRL.TEXTID: return 2;
    case CTRL.FADE: return 1;
    case CTRL.FADE2: return 2;
    case CTRL.BOX_BREAK_DELAYED: return 1;
    default: return 0;
  }
}
