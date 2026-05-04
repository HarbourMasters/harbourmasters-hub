import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Plus, Trash2, HelpCircle, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { O2RReader } from '@/tools/message-editor/lib/o2r-reader';
import { SFXResolver } from '@/tools/message-editor/lib/sfx-resolver';
import { SFXPlayer } from '@/lib/audio/sfx-player';
import { FileDropZone } from '@/tools/audio-tool/components/FileDropZone';
import { SampleTable } from '@/tools/audio-tool/components/SampleTable';
import { ConvertButton } from '@/tools/audio-tool/components/ConvertButton';
import { WaveformVisualizer } from '@/tools/audio-tool/components/WaveformVisualizer';
import { useAudioSamples } from '@/tools/audio-tool/hooks/useAudioSamples';
import { useConversion } from '@/tools/audio-tool/hooks/useConversion';
import type { SampleMetaEntry } from '@/tools/audio-tool/data/sample-meta-types';

function AudioTool() {
  const { t } = useTranslation('tools');
  const { items, addFiles, removeItem, updateItem, clearAll } = useAudioSamples();
  const { convertSample } = useConversion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sfxPlayer, setSfxPlayer] = useState<SFXPlayer | null>(null);
  const [o2rName, setO2rName] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const selectedItem = items.find(i => i.id === selectedItemId) ?? null;
  const o2rLoaded = !!sfxPlayer;
  const hasItems = items.length > 0;
  const sourceWaveform = selectedItem?.floatSamples ?? null;

  const handleAddMore = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAddMoreFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) addFiles(files);
    e.target.value = '';
  }, [addFiles]);

  const handleO2RFile = useCallback(async (files: File[]) => {
    const o2rFile = files.find(f => f.name.toLowerCase().endsWith('.o2r'));
    if (!o2rFile) return;
    try {
      const reader = new O2RReader();
      await reader.load(o2rFile);
      const resolver = new SFXResolver(reader);
      setSfxPlayer(new SFXPlayer(resolver));
      setO2rName(o2rFile.name);
    } catch {
      // O2R load failed
    }
  }, []);

  const handleSelectSample = useCallback((itemId: string, entry: SampleMetaEntry) => {
    updateItem(itemId, {
      outputName: entry.name,
      loopEnabled: entry.loopEnabled,
      loopStart: entry.loopStart,
      loopEnd: entry.loopEnd,
      loopCount: entry.loopCount,
    });
  }, [updateItem]);

  const handleLoopChange = useCallback((start: number, end: number) => {
    if (selectedItem) {
      updateItem(selectedItem.id, { loopStart: start, loopEnd: end });
    }
  }, [selectedItem, updateItem]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-10 md:py-14 bg-[var(--color-surface)]/30 overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 animate-fade-in">
              <Music size={16} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-[var(--color-accent)]">
                {t('audioTool.badge')}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight animate-slide-up">
              {t('audioTool.title')}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              {t('audioTool.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
        {/* Help toggle */}
        <div className="mb-6">
          <button
            onClick={() => setHelpOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('audioTool.helpTitle')}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${helpOpen ? 'rotate-180' : ''}`} />
          </button>

          {helpOpen && (
            <div className="mt-3 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-4">
              <ol className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex gap-2"><span className="font-bold text-[var(--color-accent)]">1.</span> {t('audioTool.helpStep1')}</li>
                <li className="flex gap-2"><span className="font-bold text-[var(--color-accent)]">2.</span> {t('audioTool.helpStep2')}</li>
                <li className="flex gap-2"><span className="font-bold text-[var(--color-accent)]">3.</span> {t('audioTool.helpStep3')}</li>
                <li className="flex gap-2"><span className="font-bold text-[var(--color-accent)]">4.</span> {t('audioTool.helpStep4')}</li>
                <li className="flex gap-2"><span className="font-bold text-[var(--color-accent)]">5.</span> {t('audioTool.helpStep5')}</li>
                <li className="flex gap-2"><span className="font-bold text-[var(--color-accent)]">6.</span> {t('audioTool.helpStep6')}</li>
              </ol>
            </div>
          )}
        </div>

        {/* Two-step flow */}
        {!o2rLoaded ? (
          /* Step 1: Load O2R */
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('audioTool.step1Title')}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{t('audioTool.step1Subtitle')}</p>
            </div>
            <FileDropZone
              onFiles={handleO2RFile}
              accept=".o2r"
              multiple={false}
              label={t('audioTool.step1DropZone')}
              subtitle={t('audioTool.step1Subtitle')}
            />
          </div>
        ) : !hasItems ? (
          /* Step 2: Import audio files */
          <div className="max-w-xl mx-auto">
            {/* O2R status */}
            <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm font-medium text-green-400">{t('audioTool.o2rLoaded')}</span>
              <span className="text-sm text-[var(--color-text-muted)]">— {o2rName}</span>
              <button
                onClick={() => {
                  setSfxPlayer(null);
                  setO2rName('');
                }}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {t('audioTool.changeO2r')}
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('audioTool.step2Title')}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{t('audioTool.step2Subtitle')}</p>
            </div>
            <FileDropZone
              onFiles={addFiles}
              subtitle={t('audioTool.step2Subtitle')}
            />
          </div>
        ) : (
          /* Step 3: Working view */
          <>
            {/* Controls bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* O2R status badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-xs">
                <Check className="w-3 h-3 text-green-400" />
                <span className="font-medium text-green-400">{o2rName}</span>
              </div>

              <ConvertButton
                items={items}
                convertSample={convertSample}
                onUpdate={updateItem}
              />

              <div className="flex-1" />

              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.ogg,.oga"
                multiple
                onChange={handleAddMoreFiles}
                className="hidden"
              />

              <button
                onClick={handleAddMore}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('audioTool.addFiles')}
              </button>

              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-error)] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t('audioTool.clearList')}
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              {t('audioTool.loopHint')}
            </p>

            {/* Waveform visualizer for selected item */}
            {sourceWaveform && selectedItem && (
              <div className="mb-4">
                <WaveformVisualizer
                  samples={sourceWaveform}
                  sampleRate={32000}
                  loopStart={selectedItem.loopStart}
                  loopEnd={selectedItem.loopEnd || (sourceWaveform?.length ?? 0)}
                  loopEnabled={selectedItem.loopEnabled}
                  onLoopChange={handleLoopChange}
                  label={t('audioTool.waveformSource')}
                />
              </div>
            )}

            {/* Sample table with combobox browser */}
            <SampleTable
              items={items}
              onUpdate={updateItem}
              onRemove={removeItem}
              selectedId={selectedItemId}
              onSelect={setSelectedItemId}
              sfxPlayer={sfxPlayer}
              onSelectSample={handleSelectSample}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default AudioTool;
