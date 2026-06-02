import { useState, useCallback, useRef, useMemo } from 'react';
import { Download, RotateCcw, Radio, Save, FolderOpen } from 'lucide-react';
import JSZip from 'jszip';
import { detectStarship, loadRadioMessages, exportModifiedO2R } from '@/tools/radio-editor/lib/radio-detection';
import { radioMessageToBlob, generatePreview, type RadioMessageEntry } from '@/tools/radio-editor/lib/radio-parser';
import { SF64TextureCache } from '@/tools/radio-editor/lib/sf64-texture-cache';
import { SF64VoicePlayer } from '@/tools/radio-editor/lib/sf64-voice-player';
import { RadioFileUpload } from '@/tools/radio-editor/components/RadioFileUpload';
import { RadioMessageList } from '@/tools/radio-editor/components/RadioMessageList';
import { RadioMessageEditor } from '@/tools/radio-editor/components/RadioMessageEditor';

interface AudioEntry {
  extension: string;
  data: Uint8Array;
}

interface ProjectEntry {
  id: number;
  charCodes: number[];
  characterId: number;
}

interface ProjectFileV1 {
  version: 1;
  o2rFileName: string;
  changes: ProjectEntry[];
}

interface ProjectFileV2 {
  version: 2;
  o2rFileName: string;
  textChanges: ProjectEntry[];
  audioChanges: { id: number; extension: string; audioFile: string }[];
}

function RadioEditor() {
  const [zip, setZip] = useState<JSZip | null>(null);
  const [messages, setMessages] = useState<RadioMessageEntry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [textModifiedIds, setTextModifiedIds] = useState<Set<number>>(new Set());
  const [audioModifiedIds, setAudioModifiedIds] = useState<Set<number>>(new Set());
  const [audioEntries, setAudioEntries] = useState<Map<number, AudioEntry>>(new Map());
  const [textureVersion, setTextureVersion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const textureCacheRef = useRef<SF64TextureCache | null>(null);
  const voicePlayerRef = useRef<SF64VoicePlayer | null>(null);

  const allModifiedIds = useMemo(() => {
    const s = new Set(textModifiedIds);
    for (const id of audioModifiedIds) s.add(id);
    return s;
  }, [textModifiedIds, audioModifiedIds]);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const loaded = await JSZip.loadAsync(buffer);

      if (!detectStarship(loaded)) {
        alert('This does not appear to be a valid sf64.o2r file. No ast_radio messages found.');
        setLoading(false);
        return;
      }

      const msgs = await loadRadioMessages(loaded);
      setZip(loaded);
      const cache = new SF64TextureCache(loaded);
      textureCacheRef.current = cache;
      cache.loadAll().then(() => setTextureVersion(v => v + 1)).catch(err => console.warn('Texture loading failed, using CSS fallback:', err));
      voicePlayerRef.current = new SF64VoicePlayer(loaded, (playing) => setIsPlaying(playing));
      setMessages(msgs);
      setFileName(file.name);
      setTextModifiedIds(new Set());
      setAudioModifiedIds(new Set());
      setAudioEntries(new Map());
      if (msgs.length > 0) setSelectedId(msgs[0].id);
    } catch (err) {
      console.error('Failed to load O2R:', err);
      alert('Failed to load the file. Make sure it is a valid sf64.o2r archive.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateMessage = useCallback((id: number, charCodes: Uint16Array) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== id) return msg;
      return { ...msg, charCodes, preview: generatePreview(charCodes) };
    }));
    setTextModifiedIds(prev => new Set(prev).add(id));
  }, []);

  const handleCharacterChange = useCallback((id: number, characterId: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== id) return msg;
      return { ...msg, characterId };
    }));
  }, []);

  const handleAudioReplace = useCallback((msgId: number, extension: string, data: Uint8Array) => {
    setAudioModifiedIds(prev => new Set(prev).add(msgId));
    setAudioEntries(prev => new Map(prev).set(msgId, { extension, data }));
  }, []);

  const handleAudioRemove = useCallback((msgId: number) => {
    setAudioModifiedIds(prev => {
      const next = new Set(prev);
      next.delete(msgId);
      return next;
    });
    setAudioEntries(prev => {
      const next = new Map(prev);
      next.delete(msgId);
      return next;
    });
  }, []);

  const handleExport = useCallback(async () => {
    if (!zip) return;
    if (allModifiedIds.size === 0) return;

    try {
      const textModified = messages.filter(m => textModifiedIds.has(m.id));
      const blob = await exportModifiedO2R(zip, textModified, textModifiedIds, audioEntries);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'sf64.o2r';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [zip, messages, textModifiedIds, audioEntries, allModifiedIds, fileName]);

  const handleReset = useCallback(() => {
    textureCacheRef.current = null;
    voicePlayerRef.current?.destroy();
    voicePlayerRef.current = null;
    setZip(null);
    setMessages([]);
    setSelectedId(null);
    setFileName('');
    setTextModifiedIds(new Set());
    setAudioModifiedIds(new Set());
    setAudioEntries(new Map());
  }, []);

  const handleSaveProject = useCallback(async () => {
    if (allModifiedIds.size === 0) return;

    const textChanges = messages
      .filter(m => textModifiedIds.has(m.id))
      .sort((a, b) => a.id - b.id)
      .map(m => ({
        id: m.id,
        charCodes: Array.from(m.charCodes),
        characterId: m.characterId,
      }));

    const audioChanges: { id: number; extension: string; audioFile: string }[] = [];
    for (const [id, entry] of audioEntries) {
      audioChanges.push({
        id,
        extension: entry.extension,
        audioFile: `audio/${id}.${entry.extension}`,
      });
    }

    if (audioChanges.length > 0) {
      // ZIP bundle with embedded audio
      const bundle = new JSZip();
      const project: ProjectFileV2 = {
        version: 2,
        o2rFileName: fileName,
        textChanges,
        audioChanges,
      };
      bundle.file('project.json', JSON.stringify(project, null, 2));
      for (const [id, entry] of audioEntries) {
        bundle.file(`audio/${id}.${entry.extension}`, entry.data);
      }
      const blob = await bundle.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'RadioMessages.starship';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Text-only: plain JSON
      const project: ProjectFileV1 = {
        version: 1,
        o2rFileName: fileName,
        changes: textChanges,
      };
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'RadioMessages.starship';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [messages, textModifiedIds, audioEntries, allModifiedIds, fileName]);

  const projectInputRef = useRef<HTMLInputElement>(null);

  const handleLoadProject = useCallback(() => {
    const input = projectInputRef.current;
    if (!input) return;
    input.value = '';
    input.click();
  }, []);

  const handleProjectFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !zip) return;

    try {
      const buffer = await file.arrayBuffer();

      // Try to detect if this is a ZIP (v2 bundle) or plain JSON (v1)
      let isZip = false;
      try {
        const testZip = await JSZip.loadAsync(buffer);
        if (testZip.file('project.json')) isZip = true;
      } catch { /* not a zip */ }

      if (isZip) {
        const bundle = await JSZip.loadAsync(buffer);
        const jsonStr = await bundle.file('project.json')!.async('string');
        const project = JSON.parse(jsonStr) as ProjectFileV2;

        if (project.version !== 2 || !Array.isArray(project.textChanges)) {
          alert('Invalid project file format.');
          return;
        }

        // Apply text changes
        const newTextModified = new Set<number>();
        setMessages(prev => prev.map(msg => {
          const change = project.textChanges.find(c => c.id === msg.id);
          if (!change) return msg;
          newTextModified.add(msg.id);
          const newCodes = new Uint16Array(change.charCodes);
          return {
            ...msg,
            charCodes: newCodes,
            characterId: change.characterId,
            preview: generatePreview(newCodes),
          };
        }));
        setTextModifiedIds(newTextModified);

        // Update zip with text changes
        for (const change of project.textChanges) {
          const charCodes = new Uint16Array(change.charCodes);
          const blob = radioMessageToBlob(charCodes);
          const data = new Uint8Array(await blob.arrayBuffer());
          const msg = messages.find(m => m.id === change.id);
          if (msg) {
            zip.file(`ast_radio/${msg.fileName}`, data);
          }
        }

        // Restore audio entries
        const newAudioModified = new Set<number>();
        const newAudioEntries = new Map<number, AudioEntry>();
        for (const ac of project.audioChanges ?? []) {
          const audioFile = bundle.file(ac.audioFile);
          if (audioFile) {
            const audioData = await audioFile.async('uint8array');
            newAudioModified.add(ac.id);
            newAudioEntries.set(ac.id, { extension: ac.extension, data: audioData });
          }
        }
        setAudioModifiedIds(newAudioModified);
        setAudioEntries(newAudioEntries);
      } else {
        // v1 plain JSON
        const text = await file.text();
        const project = JSON.parse(text) as ProjectFileV1;

        if (project.version !== 1 || !Array.isArray(project.changes)) {
          alert('Invalid project file format.');
          return;
        }

        const newModifiedIds = new Set<number>();
        setMessages(prev => prev.map(msg => {
          const change = project.changes.find(c => c.id === msg.id);
          if (!change) return msg;
          newModifiedIds.add(msg.id);
          const newCodes = new Uint16Array(change.charCodes);
          return {
            ...msg,
            charCodes: newCodes,
            characterId: change.characterId,
            preview: generatePreview(newCodes),
          };
        }));
        setTextModifiedIds(newModifiedIds);

        for (const change of project.changes) {
          const charCodes = new Uint16Array(change.charCodes);
          const blob = radioMessageToBlob(charCodes);
          const data = new Uint8Array(await blob.arrayBuffer());
          const msg = messages.find(m => m.id === change.id);
          if (msg) {
            zip.file(`ast_radio/${msg.fileName}`, data);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      alert('Failed to load project file.');
    }
  }, [zip, messages]);

  const selectedMessage = messages.find(m => m.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-text-muted)]">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-[var(--header-height)] pb-10 md:pb-14 bg-[var(--color-surface)]/30 overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <Radio size={16} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-[var(--color-accent)]">
                Starship Tool
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              Radio Message Editor
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[var(--color-text-muted)] mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              Edit Star Fox 64 radio dialogue text directly from your sf64.o2r
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8">
        {!zip ? (
          <RadioFileUpload onFile={handleFile} />
        ) : (
          <>
            {/* Info bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--color-accent)] font-semibold">{fileName}</span>
                <span className="text-[var(--color-text-muted)]">—</span>
                <span className="text-[var(--color-text-muted)]">{messages.length} messages</span>
              </div>

              {textModifiedIds.size > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  {textModifiedIds.size} text
                </span>
              )}
              {audioModifiedIds.size > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {audioModifiedIds.size} audio
                </span>
              )}

              <div className="ml-auto flex items-center gap-2">
                <input
                  ref={projectInputRef}
                  type="file"
                  accept=".starship,.json"
                  onChange={handleProjectFileSelected}
                  className="hidden"
                />
                <button
                  onClick={handleSaveProject}
                  disabled={allModifiedIds.size === 0}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Save project (.starship)"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Project
                </button>
                <button
                  onClick={handleLoadProject}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="Load project (.starship)"
                >
                  <FolderOpen className="w-4 h-4 inline mr-1" />
                  Load Project
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  Reset
                </button>
                <button
                  onClick={handleExport}
                  disabled={allModifiedIds.size === 0}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Export ({allModifiedIds.size})
                </button>
              </div>
            </div>

            {/* Main layout */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Message list */}
              <div className="w-full md:w-72 flex-shrink-0">
                <RadioMessageList
                  messages={messages}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onDoubleClick={(id) => {
                    setSelectedId(id);
                    voicePlayerRef.current?.playVoice(id);
                  }}
                  textModifiedIds={textModifiedIds}
                  audioModifiedIds={audioModifiedIds}
                />
              </div>

              {/* Editor */}
              <div className="flex-1 min-w-0">
                {selectedMessage ? (
                  <RadioMessageEditor
                    key={selectedMessage.id}
                    message={selectedMessage}
                    onUpdate={(charCodes) => handleUpdateMessage(selectedMessage.id, charCodes)}
                    onCharacterChange={(charId) => handleCharacterChange(selectedMessage.id, charId)}
                    onAudioReplace={handleAudioReplace}
                    onAudioRemove={handleAudioRemove}
                    onPlaybackStateChange={(playing) => setIsPlaying(playing)}
                    textureCache={textureCacheRef.current}
                    textureVersion={textureVersion}
                    voicePlayer={voicePlayerRef.current}
                    isPlaying={isPlaying}
                    replacedAudio={audioEntries.get(selectedMessage.id) ?? null}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">
                    Select a message from the list to edit
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default RadioEditor;
