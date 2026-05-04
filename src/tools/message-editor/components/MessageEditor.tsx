import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit3, Code2, Save, X, Undo2 } from 'lucide-react';
import { parseMessageData, type MessageEntry } from '../lib/message-parser';
import {
  messageDataToSegments,
  segmentsToMessageData,
  insertSegmentAt,
  type EditorSegment,
} from '../lib/editor-model';
import { TEXTBOX_TYPE_NAMES, TEXTBOX_POS_NAMES } from '../lib/control-codes';
import { RichMessageEditor } from './editor/RichMessageEditor';
import type { RichMessageEditorHandle } from './editor/RichMessageEditor';
import { EditorToolbar } from './editor/EditorToolbar';
import type { TextureCache } from '../lib/texture-cache';
import type { SFXPlayer } from '@/lib/audio/sfx-player';

const MAX_UNDO = 20;

interface MessageEditorPanelProps {
  message: MessageEntry;
  onUpdate?: (message: MessageEntry) => void;
  onDraftChange?: (draftData: Uint8Array) => void;
  textureCache?: TextureCache | null;
  sfxPlayer?: SFXPlayer | null;
}

export function MessageEditorPanel({ message, onUpdate, onDraftChange, textureCache, sfxPlayer }: MessageEditorPanelProps) {
  const { t } = useTranslation('tools');
  const [view, setView] = useState<'parsed' | 'edit' | 'hex'>('parsed');
  const [segments, setSegments] = useState<EditorSegment[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [iconUrls, setIconUrls] = useState<Map<number, string>>(new Map());
  const [syncTrigger, setSyncTrigger] = useState(0);
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const editorHandleRef = useRef<RichMessageEditorHandle>(null);
  const undoStackRef = useRef<EditorSegment[][]>([]);
  const undoIndexRef = useRef(-1);

  const pushUndo = useCallback((segs: EditorSegment[]) => {
    const stack = undoStackRef.current;
    const idx = undoIndexRef.current;
    stack.length = idx + 1;
    stack.push(segs.map(s => ({ ...s })));
    if (stack.length > MAX_UNDO) stack.shift();
    undoIndexRef.current = stack.length - 1;
  }, []);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (undoIndexRef.current <= 0) return;
    undoIndexRef.current--;
    const prev = stack[undoIndexRef.current];
    if (prev) {
      setSegments(prev);
      setHasChanges(true);
      setSyncTrigger(t => t + 1);
    }
  }, []);

  useEffect(() => {
    const segs = messageDataToSegments(message.data, message.isJapanese);
    setSegments(segs);
    setHasChanges(false);
    setView('parsed');
    undoStackRef.current = [segs.map(s => ({ ...s }))];
    undoIndexRef.current = 0;
    setSyncTrigger(t => t + 1);
  }, [message.id, message.data, message.isJapanese]);

  // Load item icon URLs when textureCache is available
  useEffect(() => {
    if (!textureCache) return;
    textureCache.preloadAllItemIcons().then(setIconUrls);
  }, [textureCache]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo]);

  const handleSave = () => {
    if (!onUpdate) return;
    const newData = segmentsToMessageData(segments, message.isJapanese);
    onUpdate({ ...message, data: newData });
    setHasChanges(false);
  };

  const handleCancel = () => {
    const segs = messageDataToSegments(message.data, message.isJapanese);
    setSegments(segs);
    setHasChanges(false);
    setView('parsed');
  };

  const handleSegmentsChange = useCallback((newSegments: EditorSegment[]) => {
    pushUndo(segmentsRef.current);
    setSegments(newSegments);
    setHasChanges(true);
    onDraftChange?.(segmentsToMessageData(newSegments, message.isJapanese));
  }, [pushUndo, onDraftChange, message.isJapanese]);

  const handleInsert = useCallback((code: number, name: string, args: number[]) => {
    const curSegs = segmentsRef.current;
    const cursorIdx = editorHandleRef.current?.getCursorSegmentIndex() ?? curSegs.length;
    // Insert after the segment the cursor is in
    const insertIdx = cursorIdx + 1;
    const newSeg: EditorSegment = { type: 'control', code, name, args };
    const updated = insertSegmentAt(curSegs, insertIdx, newSeg);
    pushUndo(curSegs);
    setSegments(updated);
    setHasChanges(true);
    onDraftChange?.(segmentsToMessageData(updated, message.isJapanese));
    setSyncTrigger(t => t + 1);
  }, [pushUndo, onDraftChange, message.isJapanese]);

  const canUndo = undoIndexRef.current > 0;

  const typeName = TEXTBOX_TYPE_NAMES[message.textboxType] ?? `Type ${message.textboxType}`;
  const posName = TEXTBOX_POS_NAMES[message.textboxYPos] ?? `Pos ${message.textboxYPos}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-mono font-bold text-[var(--color-accent)]">
            0x{message.id.toString(16).toUpperCase().padStart(4, '0')}
            <span className="text-sm font-normal text-[var(--color-text-muted)] ml-2">({message.id})</span>
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-muted)]">
            <span>{t('messageEditor.textboxType')}: <strong className="text-[var(--color-text)]">{typeName}</strong></span>
            <span>{t('messageEditor.position')}: <strong className="text-[var(--color-text)]">{posName}</strong></span>
            {hasChanges && <span className="text-amber-400">{t('messageEditor.unsavedChanges')}</span>}
          </div>
        </div>

        <div className="flex gap-1.5">
          {([
            { key: 'parsed' as const, icon: Eye, label: t('messageEditor.view') },
            { key: 'edit' as const, icon: Edit3, label: t('messageEditor.edit') },
            { key: 'hex' as const, icon: Code2, label: t('messageEditor.hex') },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === key
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)] min-h-[400px]">
        {view === 'edit' && (
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
              <EditorToolbar
                onInsert={handleInsert}
                textboxType={message.textboxType}
                iconUrls={iconUrls.size > 0 ? iconUrls : undefined}
                sfxPlayer={sfxPlayer}
              />
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Ctrl+Z"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> {t('messageEditor.save')}
                </button>
                {hasChanges && (
                  <button onClick={handleCancel} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors">
                    <X className="w-3.5 h-3.5" /> {t('messageEditor.cancel')}
                  </button>
                )}
              </div>
            </div>

            {/* Rich editor */}
            <RichMessageEditor
              ref={editorHandleRef}
              segments={segments}
              onChange={handleSegmentsChange}
              textboxType={message.textboxType}
              textureCache={textureCache ?? null}
              syncTrigger={syncTrigger}
            />
          </div>
        )}

        {view === 'parsed' && (
          <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {parseMessageData(message.data, message.isJapanese).map((item, idx) => (
              <span key={idx}>
                {item.type === 'control' ? (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold align-middle mx-0.5"
                    style={{
                      backgroundColor: item.value === 'COLOR' ? 'rgba(0,0,255,0.1)' : undefined,
                      color: item.value === 'COLOR' ? '#60a5fa' : undefined,
                    }}
                  >
                    {item.value}
                    {item.bytes.length > 1 && (
                      <span className="text-[var(--color-text-muted)] font-normal">
                        ({item.bytes.slice(1).map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(', ')})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-[var(--color-text)]">{item.value}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {view === 'hex' && (
          <div className="font-mono text-xs overflow-auto">
            <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-0.5">
              <span className="text-[var(--color-text-muted)]">Offset</span>
              <span className="text-[var(--color-text-muted)]">Hex</span>
              <span className="text-[var(--color-text-muted)]">ASCII</span>
              {Array.from({ length: Math.ceil(message.data.length / 16) }).map((_, row) => {
                const offset = row * 16;
                const rowData = message.data.slice(offset, offset + 16);
                return (
                  <div key={row} className="contents">
                    <span className="text-[var(--color-accent)]">{offset.toString(16).toUpperCase().padStart(8, '0')}</span>
                    <span className="text-[var(--color-text)]">
                      {Array.from(rowData).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
                    </span>
                    <span className="text-[var(--color-text-muted)]">
                      {Array.from(rowData).map(b => b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.').join('')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
