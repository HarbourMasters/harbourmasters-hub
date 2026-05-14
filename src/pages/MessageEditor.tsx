import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { O2RReader } from '@/tools/message-editor/lib/o2r-reader';
import { detectGame, type DetectedGame } from '@/tools/message-editor/lib/game-detection';
import { parseMessages, messagesToBlob, type MessageEntry } from '@/tools/message-editor/lib/message-parser';
import { ResourceResolver } from '@/tools/message-editor/lib/resource-resolver';
import { SFXResolver } from '@/tools/message-editor/lib/sfx-resolver';
import { SFXPlayer } from '@/lib/audio/sfx-player';
import { PlaySimulator, type SimulationState } from '@/tools/message-editor/lib/play-simulator';
import { TextureCache } from '@/tools/message-editor/lib/texture-cache';
import { FontRenderer } from '@/tools/message-editor/lib/font-renderer';
import { MessageEditorFileUpload } from '@/tools/message-editor/components/FileUpload';
import { MessageList } from '@/tools/message-editor/components/MessageList';
import { MessageEditorPanel } from '@/tools/message-editor/components/MessageEditor';
import { DOMPreview } from '@/tools/message-editor/components/preview/DOMPreview';
import { PlayControls } from '@/tools/message-editor/components/preview/PlayControls';
import JSZip from 'jszip';

function MessageEditor() {
  const { t } = useTranslation('tools');
  const [o2r, setO2r] = useState<O2RReader | null>(null);
  const [gameInfo, setGameInfo] = useState<DetectedGame | null>(null);
  const [resolver, setResolver] = useState<ResourceResolver | null>(null);
  const [textureCache, setTextureCache] = useState<TextureCache | null>(null);
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedForExport, setSelectedForExport] = useState<Set<number>>(new Set());
  const [fileName, setFileName] = useState('');
  const [revealChars, setRevealChars] = useState<number | undefined>(undefined);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [boxOpenFrame, setBoxOpenFrame] = useState<number>(0);
  const [fadeAlpha, setFadeAlpha] = useState<number>(1);
  const [choiceCount, setChoiceCount] = useState<0 | 2 | 3>(0);
  const [selectedChoice, setSelectedChoice] = useState(0);
  const [draftData, setDraftData] = useState<Uint8Array | null>(null);
  const simulatorRef = useRef<PlaySimulator | null>(null);
  const sfxPlayerRef = useRef<SFXPlayer | null>(null);

  useEffect(() => {
    simulatorRef.current?.destroy();
    simulatorRef.current = null;
    setRevealChars(undefined);
    setSimState(null);
    setBoxOpenFrame(0);
    setFadeAlpha(1);
    setChoiceCount(0);
    setSelectedChoice(0);
    setDraftData(null);
  }, [selectedId]);

  const handleFileLoad = useCallback(async (file: File) => {
    const reader = new O2RReader();
    await reader.load(file);

    const detected = detectGame(reader);
    const res = new ResourceResolver(reader);

    const fontRenderer = new FontRenderer();
    const fontFiles = res.findFiles('textures/nes_font_static/');
    for (const path of fontFiles) {
      const match = path.match(/gMsgChar([0-9A-Fa-f]{2})/);
      if (match) {
        const charCode = parseInt(match[1], 16);
        try {
          const texData = await res.getTextData(path);
          fontRenderer.loadGlyph(charCode, texData);
        } catch { /* skip failed glyph */ }
      }
    }
    fontRenderer.setLoaded();

    const tc = new TextureCache(res, fontRenderer);

    // Set up SFX player for real audio playback from the O2R archive
    sfxPlayerRef.current?.destroy();
    const sfxResolver = new SFXResolver(reader);
    sfxPlayerRef.current = new SFXPlayer(sfxResolver);

    setO2r(reader);
    setGameInfo(detected);
    setResolver(res);
    setTextureCache(tc);
    setFileName(file.name);

    const lang = detected.languages.includes('en') ? 'en' : detected.languages[0];
    if (lang) {
      setSelectedLanguage(lang);
      await loadMessages(reader, detected, lang, tc);
    }
  }, []);

  const loadMessages = async (reader: O2RReader, info: DetectedGame, lang: string, tc?: TextureCache) => {
    const textPath = info.textPaths[lang];
    if (!textPath) return;

    try {
      const data = await reader.readFile(textPath);
      const parsed = parseMessages(data, lang);
      setMessages(parsed);
      setSelectedId(null);
      setSelectedForExport(new Set());
      if (parsed.length > 0) {
        setSelectedId(parsed[0].id);
      }

      // Preload kanji glyphs if loading Japanese messages
      if (lang === 'ja' && tc) {
        tc.preloadKanjiGlyphs();
      }
    } catch {
      setMessages([]);
    }
  };

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    if (o2r && gameInfo) {
      await loadMessages(o2r, gameInfo, lang, textureCache ?? undefined);
    }
  };

  const handleUpdateMessage = (updated: MessageEntry) => {
    setMessages(prev => prev.map(msg => msg.id === updated.id ? updated : msg));
    setSelectedForExport(prev => new Set(prev).add(updated.id));
  };

  const handleToggleExport = (id: number) => {
    setSelectedForExport(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async () => {
    const toExport = messages.filter(m => selectedForExport.has(m.id));
    if (toExport.length === 0) return;

    const blob = messagesToBlob(toExport);
    const binaryData = await blob.arrayBuffer();

    const uuid = crypto.randomUUID();
    const zip = new JSZip();
    const langFolder = selectedLanguage === 'en' ? 'nes' : selectedLanguage === 'de' ? 'ger' :
      selectedLanguage === 'fr' ? 'fra' : selectedLanguage === 'ja' ? 'jpn' : 'nes';
    zip.file(`override/text/${langFolder}_message_data_static/${uuid}`, binaryData);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'messageOverrides.o2r';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedMessage = messages.find(m => m.id === selectedId);
  const previewMessage = selectedMessage && draftData
    ? { ...selectedMessage, data: draftData }
    : selectedMessage;

  const handlePlay = useCallback(() => {
    if (!selectedMessage) return;
    if (!simulatorRef.current) {
      const sim = new PlaySimulator(previewMessage?.data ?? selectedMessage.data, sfxPlayerRef.current);
      sim.onEvent((e) => {
        if (e.type === 'char' && e.charIndex !== undefined) {
          setRevealChars(e.charIndex);
        }
        if (e.type === 'boxOpening' && e.boxOpenFrame !== undefined) {
          setBoxOpenFrame(e.boxOpenFrame);
        }
        if (e.type === 'fade' && e.fadeAlpha !== undefined) {
          setFadeAlpha(e.fadeAlpha);
        }
        if (e.type === 'choice') {
          if (e.choiceCount !== undefined) setChoiceCount(e.choiceCount as 0 | 2 | 3);
          if (e.selectedChoice !== undefined) setSelectedChoice(e.selectedChoice);
        }
        setSimState({ ...sim.state });
      });
      simulatorRef.current = sim;
    }
    simulatorRef.current.play();
  }, [selectedMessage]);

  const handlePause = useCallback(() => {
    simulatorRef.current?.pause();
    if (simulatorRef.current) {
      setSimState({ ...simulatorRef.current.state });
    }
  }, []);

  const handleReset = useCallback(() => {
    simulatorRef.current?.reset();
    setRevealChars(undefined);
    setBoxOpenFrame(0);
    setFadeAlpha(1);
    if (simulatorRef.current) {
      setSimState({ ...simulatorRef.current.state });
    }
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (simulatorRef.current) {
      if (simulatorRef.current.state.phase === 'choosing') {
        simulatorRef.current.confirmChoice();
      } else {
        simulatorRef.current.advanceInput();
      }
    }
  }, []);

  const handleChoiceSelect = useCallback((index: number) => {
    simulatorRef.current?.selectChoice(index);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-[var(--header-height)] pb-10 md:pb-14 bg-[var(--color-surface)]/30 overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <Sparkles size={16} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-[var(--color-accent)]">
                {t('messageEditor.badge')}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              {t('messageEditor.title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[var(--color-text-muted)] mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {t('messageEditor.description')}
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8">
        {!o2r ? (
          <MessageEditorFileUpload onFileLoad={handleFileLoad} />
        ) : (
          <>
            {/* Info bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--color-accent)] font-semibold">{fileName}</span>
                <span className="text-[var(--color-text-muted)]">—</span>
                <span className="text-[var(--color-text-muted)]">{t('messageEditor.messageCount', { count: messages.length })}</span>
              </div>

              {gameInfo && gameInfo.languages.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{t('messageEditor.language')}:</span>
                  <div className="flex gap-1">
                    {gameInfo.languages.map(lang => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          selectedLanguage === lang
                            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-transparent'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="ml-auto">
                <button
                  onClick={handleExport}
                  disabled={selectedForExport.size === 0}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('messageEditor.export', { count: selectedForExport.size })}
                </button>
              </div>
            </div>

            {/* Main layout: message list + editor side by side on desktop, stacked on mobile */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Message list */}
              <div className="w-full md:w-72 flex-shrink-0">
                <MessageList
                  messages={messages}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  selectedForExport={selectedForExport}
                  onToggleExport={handleToggleExport}
                />
              </div>

              {/* Editor */}
              <div className="flex-1 min-w-0">
              {selectedMessage ? (
                <MessageEditorPanel
                  message={selectedMessage}
                  onUpdate={handleUpdateMessage}
                  onDraftChange={setDraftData}
                  textureCache={textureCache}
                  sfxPlayer={sfxPlayerRef.current}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)] rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border)]">
                  {t('messageEditor.selectMessage')}
                </div>
              )}
              </div>
            </div>

            {/* Preview — full width below the editor row */}
            {previewMessage && (
              <div className="mt-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Preview</span>
                  <PlayControls
                    isPlaying={simState?.phase === 'playing' || simState?.phase === 'box_opening'}
                    isFinished={simState?.phase === 'finished'}
                    charIndex={simState?.charIndex ?? 0}
                    totalChars={simState?.totalChars ?? 0}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onReset={handleReset}
                  />
                </div>
                <DOMPreview
                  message={previewMessage!}
                  resolver={resolver}
                  textureCache={textureCache}
                  revealChars={revealChars}
                  isPlaying={simState?.phase === 'playing' || simState?.phase === 'box_opening'}
                  isWaiting={simState?.phase === 'box_wait'}
                  isChoosing={simState?.phase === 'choosing'}
                  choiceCount={choiceCount}
                  selectedChoice={selectedChoice}
                  boxOpenFrame={simState?.phase === 'box_opening' ? boxOpenFrame : undefined}
                  fadeAlpha={simState?.phase === 'fading' ? fadeAlpha : undefined}
                  onClick={handleCanvasClick}
                  onChoiceSelect={handleChoiceSelect}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default MessageEditor;
