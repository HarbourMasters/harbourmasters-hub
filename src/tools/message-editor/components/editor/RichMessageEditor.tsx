import { useState, useRef, useCallback, useEffect, useLayoutEffect, forwardRef, useImperativeHandle, memo } from 'react';
import type { EditorSegment } from '../../lib/editor-model';
import { removeSegmentAt, updateSegmentAt, normalizeSegments } from '../../lib/editor-model';
import { EditorPill } from './EditorPill';
import type { TextureCache } from '../../lib/texture-cache';
import { CTRL } from '../../lib/control-codes';

interface RichMessageEditorProps {
  segments: EditorSegment[];
  onChange: (segments: EditorSegment[]) => void;
  textboxType: number;
  textureCache: TextureCache | null;
  /** Incremented by parent when segments change externally (new message, undo). NOT on user edits. */
  syncTrigger: number;
}

export interface RichMessageEditorHandle {
  getCursorSegmentIndex: () => number;
}

// Text span that manages its own DOM content, bypassing React's reconciliation.
// Only syncs from props → DOM when syncTrigger changes (external updates like undo).
// On user typing, the DOM stays untouched so the cursor doesn't jump.
const EditorTextSpan = memo(
  function EditorTextSpan({ value, segIdx, syncTrigger }: {
    value: string;
    segIdx: number;
    syncTrigger: number;
  }) {
    const ref = useRef<HTMLSpanElement>(null);

    // Sync DOM from props when syncTrigger changes or on initial mount
    useLayoutEffect(() => {
      if (ref.current) {
        ref.current.textContent = value;
      }
    }, [syncTrigger]);

    // Set content on initial mount
    useLayoutEffect(() => {
      if (ref.current) {
        ref.current.textContent = value;
      }
    }, []);

    return <span ref={ref} data-seg-idx={segIdx} className="outline-none" />;
  },
  // Skip re-render for value-only changes (user edits). Only re-render on syncTrigger changes.
  (prev, next) => prev.syncTrigger === next.syncTrigger,
);

// Gap element between consecutive pills — zero-width space lets cursor land here
function PillGap({ gapIdx }: { gapIdx: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = '​';
  }, []);
  return <span ref={ref} data-gap-idx={gapIdx} className="inline" style={{ fontSize: 0 }} />;
}

export const RichMessageEditor = forwardRef<RichMessageEditorHandle, RichMessageEditorProps>(
  function RichMessageEditor({ segments, onChange, textboxType, textureCache, syncTrigger }, ref) {
    const editorRef = useRef<HTMLDivElement>(null);
    const segmentsRef = useRef(segments);
    segmentsRef.current = segments;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const [iconUrls, setIconUrls] = useState<Map<number, string>>(new Map());
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [dropIdx, setDropIdx] = useState<number | null>(null);

    // Track cursor position for insert-at-cursor
    const cursorSegIdxRef = useRef<number>(segments.length > 0 ? 0 : 0);

    useImperativeHandle(ref, () => ({
      getCursorSegmentIndex: () => cursorSegIdxRef.current,
    }), []);

    // Find which segment index a DOM node belongs to
    const findSegIdx = useCallback((node: Node | null): number | null => {
      while (node && node !== editorRef.current) {
        const el = node instanceof HTMLElement ? node : node.parentElement;
        if (!el) return null;
        const idx = el.dataset?.segIdx;
        if (idx !== undefined) return parseInt(idx);
        node = el.parentElement;
      }
      return null;
    }, []);

    // Find gap index from a DOM node
    const findGapIdx = useCallback((node: Node | null): number | null => {
      while (node && node !== editorRef.current) {
        const el = node instanceof HTMLElement ? node : node.parentElement;
        if (!el) return null;
        const idx = el.dataset?.gapIdx;
        if (idx !== undefined) return parseInt(idx);
        node = el.parentElement;
      }
      return null;
    }, []);

    // Update cursor tracking
    const updateCursorPos = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode || !editorRef.current) return;

      const anchor = sel.anchorNode;

      // Check if cursor is in a gap between pills
      const gapIdx = findGapIdx(anchor);
      if (gapIdx !== null) {
        cursorSegIdxRef.current = gapIdx;
        return;
      }

      const segIdx = findSegIdx(anchor);
      if (segIdx !== null) {
        cursorSegIdxRef.current = segIdx;
      }
    }, [findSegIdx, findGapIdx]);

    // Handle text edits via parent contentEditable's input event
    const handleInput = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) return;

      const segIdx = findSegIdx(sel.anchorNode);
      if (segIdx === null) return;

      const segs = segmentsRef.current;
      const seg = segs[segIdx];
      if (!seg || seg.type !== 'text') return;

      // Walk up to the element with data-seg-idx to read its textContent
      let el: HTMLElement | null;
      if (sel.anchorNode instanceof HTMLElement) {
        el = sel.anchorNode;
      } else {
        el = sel.anchorNode.parentElement;
      }
      while (el && el.dataset.segIdx === undefined && el !== editorRef.current) {
        el = el.parentElement;
      }
      if (!el || el.dataset.segIdx === undefined) return;

      const newText = el.textContent ?? '';
      if (newText !== seg.value) {
        onChangeRef.current(updateSegmentAt(segs, segIdx, () => ({ type: 'text', value: newText })));
      }
    }, [findSegIdx]);

    const handleRemove = useCallback((index: number) => {
      onChange(removeSegmentAt(segments, index));
    }, [segments, onChange]);

    const handleDrop = useCallback((targetIdx: number) => {
      if (dragIdx === null || dragIdx === targetIdx) return;
      const next = [...segments];
      const [moved] = next.splice(dragIdx, 1);
      const insertAt = targetIdx > dragIdx ? targetIdx - 1 : targetIdx;
      next.splice(insertAt, 0, moved!);
      onChange(normalizeSegments(next));
      setDragIdx(null);
      setDropIdx(null);
    }, [segments, onChange, dragIdx]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel || !sel.isCollapsed) return;
        const anchor = sel.anchorNode;
        if (!anchor) return;

        const segIdx = findSegIdx(anchor);
        if (segIdx === null) return;

        const seg = segments[segIdx];
        if (!seg || seg.type !== 'text') return;

        const offset = sel.anchorOffset;
        const before = seg.value.slice(0, offset);
        const after = seg.value.slice(offset);

        const newSegs = [...segments];
        newSegs[segIdx] = { type: 'text', value: before };
        const insertSegs: EditorSegment[] = [
          { type: 'control', code: CTRL.NEWLINE, name: 'NEWLINE', args: [] },
          { type: 'text', value: after },
        ];
        newSegs.splice(segIdx + 1, 0, ...insertSegs);
        onChange(normalizeSegments(newSegs));
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        const sel = window.getSelection();
        if (!sel || !sel.isCollapsed) return;
        const anchor = sel.anchorNode;
        if (!anchor) return;

        const segIdx = findSegIdx(anchor);
        if (segIdx === null) return;

        const seg = segments[segIdx];
        if (!seg) return;

        if (seg.type === 'control') {
          e.preventDefault();
          handleRemove(segIdx);
          return;
        }

        const offset = sel.anchorOffset;
        const textLen = seg.value.length;

        if (e.key === 'Backspace' && offset === 0 && segIdx > 0) {
          const prev = segments[segIdx - 1];
          if (prev?.type === 'control') {
            e.preventDefault();
            handleRemove(segIdx - 1);
          }
        } else if (e.key === 'Delete' && offset === textLen && segIdx < segments.length - 1) {
          const next = segments[segIdx + 1];
          if (next?.type === 'control') {
            e.preventDefault();
            handleRemove(segIdx + 1);
          }
        }
      }
    }, [segments, handleRemove, onChange, findSegIdx]);

    // Load item icon URLs
    useEffect(() => {
      if (!textureCache) return;
      const loadIcons = async () => {
        const urls = new Map<number, string>();
        for (const seg of segments) {
          if (seg.type === 'control' && seg.code === CTRL.ITEM_ICON) {
            const itemId = seg.args[0] ?? 0;
            if (!urls.has(itemId)) {
              const url = await textureCache.getItemIconUrl(itemId);
              if (url) urls.set(itemId, url);
            }
          }
        }
        setIconUrls(urls);
      };
      loadIcons();
    }, [segments, textureCache]);

    // Check if a gap is needed before a segment at this index
    const needsGap = useCallback((idx: number) => {
      if (idx === 0) return false;
      return segments[idx - 1]?.type === 'control' && segments[idx]?.type === 'control';
    }, [segments]);

    return (
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onSelect={updateCursorPos}
        onMouseUp={updateCursorPos}
        className="w-full min-h-[350px] p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-mono text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]/50 resize-y whitespace-pre-wrap leading-relaxed overflow-y-auto"
      >
        {segments.map((seg, idx) => {
          if (seg.type === 'control') {
            const gapBefore = needsGap(idx);
            const content = seg.code === CTRL.NEWLINE
              ? (
                <span className="inline">
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] mx-0.5 select-none"
                    contentEditable={false}
                  >
                    NL
                  </span>
                  <br />
                </span>
              )
              : (
                <span className="inline">
                  <span
                    className="inline-block w-0 h-4 align-middle relative"
                    onDragOver={(e) => { e.preventDefault(); setDropIdx(idx); }}
                    onDragLeave={() => setDropIdx(null)}
                    onDrop={(e) => { e.preventDefault(); handleDrop(idx); }}
                  >
                    {dropIdx === idx && dragIdx !== null && dragIdx !== idx && (
                      <span className="absolute top-0 left-0 w-0.5 h-full bg-[var(--color-accent)] rounded-full" />
                    )}
                  </span>
                  <EditorPill
                    segment={seg}
                    textboxType={textboxType}
                    iconUrl={seg.code === CTRL.ITEM_ICON ? iconUrls.get(seg.args[0] ?? 0) : undefined}
                    onRemove={() => handleRemove(idx)}
                    onDragStart={() => setDragIdx(idx)}
                    onDragEnd={() => { setDragIdx(null); setDropIdx(null); }}
                    draggable
                  />
                </span>
              );

            return (
              <span key={`ctrl-${idx}`} className="inline">
                {gapBefore && <PillGap gapIdx={idx} />}
                {content}
              </span>
            );
          }

          return (
            <EditorTextSpan
              key={`text-${idx}`}
              value={seg.value}
              segIdx={idx}
              syncTrigger={syncTrigger}
            />
          );
        })}
      </div>
    );
  }
);
