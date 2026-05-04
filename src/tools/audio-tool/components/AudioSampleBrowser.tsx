import { useState, useMemo, useCallback, useRef } from 'react';
import { Search, Play, Square, ChevronRight, Repeat } from 'lucide-react';
import sampleData from '../data/sample-meta-db.json';
import type { SampleMetaEntry } from '../data/sample-meta-types';
import { BANKS } from '../data/sample-meta-types';
import { SFXPlayer } from '@/lib/audio/sfx-player';
import { pcmToFloat32, AudioPreviewPlayer } from '@/lib/audio/audio-preview';
import { readSohSample } from '@/lib/audio/soh-sample';
import { decodeVadpcm } from '@/lib/audio/vadpcm-decoder';

const entries = sampleData as SampleMetaEntry[];

interface AudioSampleBrowserProps {
  sfxPlayer: SFXPlayer | null;
  onSelectSample: (entry: SampleMetaEntry) => void;
}

export function AudioSampleBrowser({ sfxPlayer, onSelectSample }: AudioSampleBrowserProps) {
  const [search, setSearch] = useState('');
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set([0, 1]));
  const [playingName, setPlayingName] = useState<string | null>(null);
  const previewRef = useRef<AudioPreviewPlayer | null>(null);

  const filtered = useMemo(() => {
    let list = entries;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    return list;
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
      // Access the resolver through the SFXPlayer to read _META files
      const resolver = (sfxPlayer as unknown as { resolver: { getFileData: (p: string) => Promise<Uint8Array> } }).resolver;
      if (!resolver) {
        setPlayingName(null);
        return;
      }
      const metaPath = `audio/samples/${entry.name}_META`;
      const data = await resolver.getFileData(metaPath);
      const sample = readSohSample(data);

      // Decode VADPCM to PCM
      const vectors: Int16Array[] = [];
      const vecSize = 8;
      for (let p = 0; p < sample.predictors; p++) {
        for (let o = 0; o < sample.order; o++) {
          const start = (p * sample.order + o) * vecSize;
          vectors.push(sample.book.slice(start, start + vecSize));
        }
      }
      const codebook = {
        order: sample.order,
        predictorCount: sample.predictors,
        vectors,
      };
      const decoded = decodeVadpcm(codebook, sample.adpcmData);
      const floatSamples = pcmToFloat32(decoded);

      if (!previewRef.current) previewRef.current = new AudioPreviewPlayer();
      await previewRef.current.play(floatSamples, entry.sampleRate);
    } catch {
      // Sample decode failed
    }
    setPlayingName(null);
  }, [sfxPlayer, playingName]);

  return (
    <div className="flex flex-col h-full rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80">
        <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Sample Database
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search samples..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]/50"
          />
        </div>
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
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                <span>{bank.label}</span>
                <span className="ml-auto text-[10px] font-normal">{bankEntries.length}</span>
              </button>

              {isExpanded && (
                <div className="pb-1">
                  {bankEntries.map(entry => {
                    const isPlaying = playingName === entry.name;
                    return (
                      <div
                        key={entry.name}
                        className="flex items-center gap-2 px-3 py-1 hover:bg-[var(--color-surface-hover)] group cursor-pointer transition-colors"
                        onClick={() => onSelectSample(entry)}
                      >
                        <span className="flex-1 text-xs text-[var(--color-text)] truncate" title={entry.name}>
                          {entry.name}_META
                        </span>

                        <span className="text-[10px] font-mono text-[var(--color-text-muted)] whitespace-nowrap">
                          {entry.sampleRate >= 1000
                            ? `${(entry.sampleRate / 1000).toFixed(entry.sampleRate % 1000 === 0 ? 0 : 1)}k`
                            : `${entry.sampleRate}`} Hz
                        </span>

                        {entry.loopCount !== 0 && (
                          <Repeat className="w-3 h-3 text-green-400 flex-shrink-0" />
                        )}

                        {sfxPlayer && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              playSample(entry);
                            }}
                            className={`p-0.5 rounded hover:bg-[var(--color-surface)] flex-shrink-0 transition-colors ${
                              isPlaying
                                ? 'text-[var(--color-error)]'
                                : 'text-[var(--color-accent)]'
                            }`}
                            title={isPlaying ? 'Stop' : 'Preview'}
                          >
                            {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] flex justify-between">
        <span>{entries.length} samples</span>
        <span>{filtered.length} shown</span>
      </div>
    </div>
  );
}
