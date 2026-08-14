import { useState, useRef, useEffect, useCallback } from 'react';
import { Undo2, Redo2, Play, Square, Upload, Volume2, X } from 'lucide-react';
import { charCodesToEditableText, editableTextToCharCodes, getPriorityFromCharCodes } from '../lib/radio-parser';
import { INSERTABLE_CONTROLS, INSERTABLE_SPECIALS, PRIORITY_LABELS, RADIO_CHARACTER_ENTRIES, getBriefingSpeakerName } from '../lib/radio-char-codes';
import type { RadioMessageEntry } from '../lib/radio-parser';
import type { SF64TextureCache } from '../lib/sf64-texture-cache';
import type { SF64VoicePlayer } from '../lib/sf64-voice-player';
import { RadioPreview } from './RadioPreview';

const MAX_UNDO = 30;

interface AudioEntry {
  extension: string;
  data: Uint8Array;
}

interface RadioMessageEditorProps {
  message: RadioMessageEntry;
  onUpdate: (charCodes: Uint16Array) => void;
  onCharacterChange?: (characterId: number) => void;
  onAudioReplace?: (msgId: number, extension: string, data: Uint8Array) => void;
  onAudioRemove?: (msgId: number) => void;
  onPlaybackStateChange?: (playing: boolean) => void;
  textureCache: SF64TextureCache | null;
  textureVersion?: number;
  voicePlayer: SF64VoicePlayer | null;
  isPlaying: boolean;
  replacedAudio: AudioEntry | null;
}

export function RadioMessageEditor({
  message, onUpdate, onCharacterChange, onAudioReplace, onAudioRemove,
  onPlaybackStateChange, textureCache, textureVersion, voicePlayer, isPlaying, replacedAudio,
}: RadioMessageEditorProps) {
  const [text, setText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState(message.characterId);
  const [importing, setImporting] = useState(false);
  const [isPlayingReplacement, setIsPlayingReplacement] = useState(false);
  const undoStack = useRef<string[]>([]);
  const undoIndex = useRef(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const replacementSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const pushUndo = useCallback((val: string) => {
    const stack = undoStack.current;
    const idx = undoIndex.current;
    stack.length = idx + 1;
    stack.push(val);
    if (stack.length > MAX_UNDO) stack.shift();
    undoIndex.current = stack.length - 1;
  }, []);

  useEffect(() => {
    // Stop all audio when switching messages
    voicePlayer?.stop();
    if (replacementSourceRef.current) {
      try { replacementSourceRef.current.stop(); } catch { /* already stopped */ }
      replacementSourceRef.current = null;
    }
    setIsPlayingReplacement(false);
    onPlaybackStateChange?.(false);

    const editable = charCodesToEditableText(message.charCodes);
    setText(editable);
    setHasChanges(false);
    setSelectedCharId(message.characterId);
    undoStack.current = [editable];
    undoIndex.current = 0;
    voicePlayer?.preloadVoice(message.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.id]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    pushUndo(val);
    setText(val);
    setHasChanges(true);
    onUpdate(editableTextToCharCodes(val));
  }, [onUpdate, pushUndo]);

  const undo = useCallback(() => {
    if (undoIndex.current <= 0) return;
    undoIndex.current--;
    const prev = undoStack.current[undoIndex.current];
    if (prev !== undefined) {
      setText(prev);
      setHasChanges(true);
      onUpdate(editableTextToCharCodes(prev));
    }
  }, [onUpdate]);

  const redo = useCallback(() => {
    const stack = undoStack.current;
    if (undoIndex.current >= stack.length - 1) return;
    undoIndex.current++;
    const next = stack[undoIndex.current];
    if (next !== undefined) {
      setText(next);
      setHasChanges(true);
      onUpdate(editableTextToCharCodes(next));
    }
  }, [onUpdate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const insertControl = useCallback((_code: number, name: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const insertText = `[${name}]`;
    const newText = text.substring(0, start) + insertText + text.substring(end);
    pushUndo(newText);
    setText(newText);
    setHasChanges(true);
    onUpdate(editableTextToCharCodes(newText));

    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
      textarea.focus();
    });
  }, [text, onUpdate, pushUndo]);

  const handleCharChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedCharId(id);
    onCharacterChange?.(id);
  }, [onCharacterChange]);

  const priority = getPriorityFromCharCodes(message.charCodes);

  // --- Audio playback ---

  const stopReplacement = useCallback(() => {
    if (replacementSourceRef.current) {
      try { replacementSourceRef.current.stop(); } catch { /* already stopped */ }
      replacementSourceRef.current = null;
    }
    setIsPlayingReplacement(false);
    onPlaybackStateChange?.(false);
  }, [onPlaybackStateChange]);

  const handlePlayOriginal = useCallback(async () => {
    if (!voicePlayer) return;
    stopReplacement();
    if (isPlaying) {
      voicePlayer.stop();
      return;
    }
    const played = await voicePlayer.playVoice(message.id);
    if (!played) {
      console.warn('No voice sample found for message', message.id);
    }
  }, [voicePlayer, message.id, isPlaying, stopReplacement]);

  const handlePlayReplacement = useCallback(async () => {
    if (!replacedAudio) return;
    voicePlayer?.stop();
    stopReplacement();

    try {
      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(replacedAudio.data.buffer.slice(0));
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(audioCtx.destination);
      source.start();
      replacementSourceRef.current = source;
      setIsPlayingReplacement(true);
      onPlaybackStateChange?.(true);
      source.onended = () => {
        replacementSourceRef.current = null;
        setIsPlayingReplacement(false);
        onPlaybackStateChange?.(false);
        audioCtx.close();
      };
    } catch (err) {
      console.error('Failed to play replacement audio:', err);
    }
  }, [replacedAudio, voicePlayer, stopReplacement, onPlaybackStateChange]);

  // --- Audio import ---

  const handleImportAudio = useCallback(() => {
    if (importing) return;
    const input = audioInputRef.current;
    if (!input) return;
    input.value = '';
    input.click();
  }, [importing]);

  const handleAudioFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'wav';
    if (!['wav', 'mp3', 'ogg'].includes(extension)) {
      alert('Unsupported audio format. Use WAV, MP3, or OGG.');
      return;
    }

    setImporting(true);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      onAudioReplace?.(message.id, extension, data);
    } catch (err) {
      console.error('Audio import failed:', err);
      alert(`Failed to import audio: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
    }
  }, [message.id, onAudioReplace]);

  const handleRemoveAudio = useCallback(() => {
    stopReplacement();
    onAudioRemove?.(message.id);
  }, [message.id, onAudioRemove, stopReplacement]);

  const hasVoice = voicePlayer?.hasVoice(message.id) ?? false;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Message ID: {message.id}
          </h3>
          {priority !== null && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {PRIORITY_LABELS[priority] ?? `Priority ${priority - 0x08}`}
            </p>
          )}
        </div>
      </div>

      {/* Audio toolbar — always show when voicePlayer exists */}
      {voicePlayer && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
          <input
            ref={audioInputRef}
            type="file"
            accept=".wav,.mp3,.ogg"
            onChange={handleAudioFileSelected}
            className="hidden"
          />
          <button
            onClick={handlePlayOriginal}
            disabled={!hasVoice}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            title={hasVoice ? 'Play original game voice' : 'No original voice mapped'}
          >
            {isPlaying ? <Square className="w-3 h-3 inline mr-1" /> : <Volume2 className="w-3 h-3 inline mr-1" />}
            Original
          </button>
          {replacedAudio && (
            <button
              onClick={handlePlayReplacement}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                isPlayingReplacement
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-blue-400 hover:text-blue-300'
              }`}
              title="Play your replacement audio"
            >
              {isPlayingReplacement ? <Square className="w-3 h-3 inline mr-1" /> : <Play className="w-3 h-3 inline mr-1" />}
              Replacement
            </button>
          )}
          <button
            onClick={handleImportAudio}
            disabled={importing}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={replacedAudio ? 'Replace with different audio' : 'Import audio (WAV, MP3, OGG)'}
          >
            <Upload className="w-3 h-3 inline mr-1" />
            {replacedAudio ? 'Replace' : 'Import Audio'}
          </button>
          {replacedAudio && (
            <button
              onClick={handleRemoveAudio}
              className="p-1 rounded-md text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
              title="Remove replacement audio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Speaker + Control codes */}
      <div className="flex flex-col gap-2">
        {message.messageType !== 'prologue' && message.messageType !== 'credits' && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">
            Speaker:
          </label>
          <select
            value={selectedCharId}
            onChange={handleCharChange}
            className="text-xs px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]/50"
          >
            {message.messageType === 'briefing' ? (
              <>
                <option value={10}>Gen. Pepper</option>
                <option value={20}>Fox</option>
              </>
            ) : (
              RADIO_CHARACTER_ENTRIES.map(entry => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))
            )}
          </select>
          {message.messageType === 'briefing' && getBriefingSpeakerName(selectedCharId) && (
            <span className="text-xs text-[var(--color-accent)]">
              ({getBriefingSpeakerName(selectedCharId)} speaking)
            </span>
          )}
        </div>
        )}
        {message.messageType === 'prologue' && (
          <div className="text-xs text-[var(--color-text-muted)]">Prologue scrolling text — no speaker</div>
        )}
        {message.messageType === 'credits' && (
          <div className="text-xs text-[var(--color-text-muted)]">Credits / score text — no speaker</div>
        )}

        {/* Control codes */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)] self-center mr-1">Control Codes:</span>
          {INSERTABLE_CONTROLS.map(ctrl => (
            <button
              key={ctrl.code}
              onClick={() => insertControl(ctrl.code, ctrl.name)}
              className="px-2 py-1 text-xs rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/50 transition-colors"
              title={ctrl.label}
            >
              {ctrl.icon} {ctrl.name}
            </button>
          ))}
        </div>
        {/* Glyphs: C-buttons yellow, arrows default */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)] self-center mr-1">Glyphs:</span>
          {INSERTABLE_SPECIALS.map(sp => {
            const isCButton = sp.code >= 0x10 && sp.code <= 0x13;
            return (
              <button
                key={sp.code}
                onClick={() => insertControl(sp.code, sp.name)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  isCButton
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/50'
                }`}
                title={sp.label}
              >
                {sp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor + Preview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Text editor */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--color-text-muted)]">
              Edit Text
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={undoIndex.current <= 0}
                className="p-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={undoIndex.current >= undoStack.current.length - 1}
                className="p-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            className="w-full h-48 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-sm resize-y focus:outline-none focus:border-[var(--color-accent)]/50"
            spellCheck={false}
            placeholder="Enter message text..."
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Space = SPC, Enter = NWL. Use [PRI1]-[PRI3] for priority, [NXT] for next textbox.
          </p>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-text-muted)]">
            Preview
          </label>
          <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
            <RadioPreview charCodes={message.charCodes} textureCache={textureCache} textureVersion={textureVersion} characterId={selectedCharId} isPlaying={isPlaying || isPlayingReplacement} messageType={message.messageType} />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <span>{message.charCodes.length} character codes</span>
        {hasVoice && (
          <span className="text-green-500">Has voice audio</span>
        )}
        {replacedAudio && (
          <span className="text-blue-400">Audio replaced (.{replacedAudio.extension})</span>
        )}
        {hasChanges && (
          <span className="text-[var(--color-accent)]">Text modified</span>
        )}
      </div>

      {/* Audio Info */}
      {voicePlayer && (
        <div className="text-xs text-[var(--color-text-muted)] flex flex-col gap-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-3">
          <div className="flex items-center gap-3">
            <span>Voice Bank: <strong>{Math.floor(message.id / 1000)}</strong></span>
            <span>Voice ID: <strong>{message.id % 1000}</strong></span>
          </div>
          {(() => {
            const paths = voicePlayer.getSamplePaths(message.id);
            return paths.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {paths.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-[10px]">
                    <span className={
                      entry.slot === 'normal' ? 'text-green-400' :
                      entry.slot === 'low' ? 'text-yellow-400' :
                      entry.slot === 'high' ? 'text-blue-400' :
                      'text-[var(--color-text-muted)]'
                    }>
                      [{entry.slot}]
                    </span>
                    <span className="truncate">{entry.path}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-yellow-500/80">No audio samples mapped for this message</span>
            );
          })()}
        </div>
      )}
    </div>
  );
}
