import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, Play, Square, ChevronRight, Repeat, X } from 'lucide-react';
import sampleData from '../data/sample-meta-db.json';
import type { SampleMetaEntry } from '../data/sample-meta-types';
import { BANKS } from '../data/sample-meta-types';
import { SFXPlayer } from '@/lib/audio/sfx-player';
import { pcmToFloat32, AudioPreviewPlayer } from '@/lib/audio/audio-preview';
import { readSohSample } from '@/lib/audio/soh-sample';
import { decodeVadpcm } from '@/lib/audio/vadpcm-decoder';

const entries = sampleData as SampleMetaEntry[];

interface SampleComboBrowserProps {
  value: string;
  sfxPlayer: SFXPlayer | null;
  onSelect: (entry: SampleMetaEntry) => void;
}

export function SampleComboBrowser({ value, sfxPlayer, onSelect }: SampleComboBrowserProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set([0, 1]));
  const [playingName, setPlayingName] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<AudioPreviewPlayer | null>(null);

  const filtered = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(e => e.name.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<number, SampleMetaEntry[]>();
    for (const entry of filtered) {
      let group = map.get(entry.bank);
      if (!group) {
        group = [];
        map.set(entry.bank, group);
      }
      group.push(entry);
    }
    return map;
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    const handleMouse = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const toggleBank = useCallback((bankId: number) => {
    setExpandedBanks(prev => {
      const next = new Set(prev);
      if (next.has(bankId)) next.delete(bankId);
      else next.add(bankId);
      return next;
    });
  }, []);

  const playSample = useCallback(async (entry: SampleMetaEntry) => {
    if (playingName === entry.name) {
      previewRef.current?.stop();
      setPlayingName(null);
      return;
    }
    if (!sfxPlayer) return;

    setPlayingName(entry.name);
    try {
      const resolver = (sfxPlayer as unknown as { resolver: { getFileData: (p: string) => Promise<Uint8Array> } }).resolver;
      if (!resolver) { setPlayingName(null); return; }
      const data = await resolver.getFileData(`audio/samples/${entry.name}`);
      const sample = readSohSample(data);

      const vectors: Int16Array[] = [];
      for (let p = 0; p < sample.predictors; p++) {
        for (let o = 0; o < sample.order; o++) {
          const start = (p * sample.order + o) * 8;
          vectors.push(sample.book.slice(start, start + 8));
        }
      }
      const decoded = decodeVadpcm({ order: sample.order, predictorCount: sample.predictors, vectors }, sample.adpcmData);
      const floatSamples = pcmToFloat32(decoded);

      if (!previewRef.current) previewRef.current = new AudioPreviewPlayer();
      await previewRef.current.play(floatSamples, entry.sampleRate);
    } catch { /* */ }
    setPlayingName(null);
  }, [sfxPlayer, playingName]);

  const playSelectedOriginal = useCallback(async () => {
    const entry = entries.find(e => e.name === value);
    if (!entry) return;
    await playSample(entry);
  }, [value, playSample]);

  const isPlayingSelected = playingName === value;
  const canPlay = !!sfxPlayer;

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <input
        ref={inputRef}
        type="text"
        value={open ? search : (value || '')}
        onChange={e => {
          if (open) setSearch(e.target.value);
        }}
        onFocus={() => {
          if (!open) {
            setOpen(true);
            setSearch('');
          }
        }}
        readOnly={!open}
        placeholder="Click to browse samples..."
        className="flex-1 min-w-0 px-2 py-1 rounded bg-transparent border border-[var(--color-border)] text-[var(--color-text)] text-xs focus:outline-none focus:border-[var(--color-accent)]/50 cursor-pointer"
      />

      {/* Listen original sample button — always visible when a sample is selected */}
      {value && (
        <button
          onClick={e => { e.stopPropagation(); playSelectedOriginal(); }}
          disabled={!canPlay}
          className={`p-1 rounded flex-shrink-0 transition-colors ${
            isPlayingSelected
              ? 'text-[var(--color-error)] hover:bg-[var(--color-error)]/10'
              : canPlay
                ? 'text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10'
                : 'text-[var(--color-text-muted)] opacity-40'
          }`}
          title={canPlay ? 'Listen original sample' : 'Load an O2R to preview samples'}
        >
          {isPlayingSelected ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      )}

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-[480px] rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: 'min(600px, calc(100vh - 150px))' }}>
          {/* Search header */}
          <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center gap-2 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter..."
              className="flex-1 bg-transparent text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none"
              autoFocus
            />
            <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0">{filtered.length}/{entries.length}</span>
            <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Bank groups */}
          <div className="flex-1 overflow-y-auto">
            {BANKS.map(bank => {
              const bankEntries = grouped.get(bank.id);
              if (!bankEntries || bankEntries.length === 0) return null;
              const isExpanded = expandedBanks.has(bank.id);

              return (
                <div key={bank.id}>
                  <button
                    onClick={() => toggleBank(bank.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    style={{ borderLeft: `3px solid ${bank.color}` }}
                  >
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <span>{bank.label}</span>
                    <span className="ml-auto text-[10px] font-normal">{bankEntries.length}</span>
                  </button>

                  {isExpanded && (
                    <div className="pb-0.5">
                      {bankEntries.map(entry => {
                        const isPlaying = playingName === entry.name;
                        return (
                          <div
                            key={entry.name}
                            className="flex items-center gap-2 px-3 py-1 hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                            onClick={() => {
                              onSelect(entry);
                              setOpen(false);
                            }}
                          >
                            <span className="flex-1 text-xs text-[var(--color-text)] truncate">{entry.name}</span>
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)] whitespace-nowrap">
                              {entry.sampleRate.toLocaleString()} Hz
                            </span>
                            {entry.loopCount !== 0 && <Repeat className="w-3 h-3 text-green-400 flex-shrink-0" />}
                            <button
                              onClick={e => { e.stopPropagation(); playSample(entry); }}
                              disabled={!canPlay}
                              className={`p-0.5 rounded flex-shrink-0 transition-colors ${
                                isPlaying
                                  ? 'text-[var(--color-error)]'
                                  : canPlay
                                    ? 'text-[var(--color-accent)]'
                                    : 'text-[var(--color-text-muted)] opacity-40'
                              }`}
                              title={canPlay ? (isPlaying ? 'Stop' : 'Preview') : 'Load an O2R to preview'}
                            >
                              {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
