import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, Volume2, X, Play, Square } from 'lucide-react';
import { SFX_ENTRIES, SFX_CATEGORIES } from '../../lib/sfx-data';
import type { SFXPlayer } from '@/lib/audio/sfx-player';

interface SFXBrowserProps {
  onSelect: (name: string, id: number) => void;
  onClose: () => void;
  sfxPlayer?: SFXPlayer | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  PL: 'Player',
  SY: 'System/UI',
  IT: 'Item',
  EV: 'Event/Env',
  EN: 'Enemy/NPC',
  VO: 'Voice',
  OC: 'Ocarina',
  FISHING: 'Fishing',
};

const CATEGORY_COLORS: Record<string, string> = {
  PL: '#22c55e',
  SY: '#3b82f6',
  IT: '#f59e0b',
  EV: '#f97316',
  EN: '#ef4444',
  VO: '#a855f7',
  OC: '#06b6d4',
  FISHING: '#8b5cf6',
};

export function SFXBrowser({ onSelect, onClose, sfxPlayer }: SFXBrowserProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let entries = SFX_ENTRIES;
    if (activeCategory) {
      entries = entries.filter(e => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(e => e.name.toLowerCase().includes(q));
    }
    return entries.slice(0, 200);
  }, [search, activeCategory]);

  const handlePlay = useCallback(async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!sfxPlayer) return;

    if (playingId === id) {
      // Stop handled by timeout, just reset
      setPlayingId(null);
      return;
    }

    setPlayingId(id);
    const hexId = id.toString(16).toUpperCase().padStart(4, '0');
    try {
      await sfxPlayer.play(`audio/sfx/${hexId}.aifc`);
    } catch {
      // SFX not available
    }
    setPlayingId(null);
  }, [sfxPlayer, playingId]);

  useEffect(() => {
    listRef.current?.focus();
  }, []);

  return (
    <div className="absolute z-50 bottom-full left-0 right-0 mb-2 min-w-[360px] max-w-[440px] rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: 'min(400px, calc(100vh - 200px))' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold text-[var(--color-text)]">SFX Browser</span>
        </div>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative px-3 pt-2 flex-shrink-0">
        <Search className="absolute left-6 top-[14px] w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search NA_SE_..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]/50"
          autoFocus
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1 px-3 py-2 flex-shrink-0">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            activeCategory === null
              ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          All
        </button>
        {SFX_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              activeCategory === cat
                ? `text-white`
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
            }`}
            style={activeCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-2" style={{ maxHeight: '200px' }}>
        {filtered.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] text-xs py-4">No SFX found</p>
        ) : (
          filtered.map(entry => {
            const isPlaying = playingId === entry.id;
            return (
              <div
                key={entry.name}
                onClick={() => onSelect(entry.name, entry.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--color-surface-hover)] group cursor-pointer transition-colors"
                style={{ borderLeft: `2px solid ${CATEGORY_COLORS[entry.category] ?? 'transparent'}` }}
              >
                <span className="flex-1 text-xs font-mono text-[var(--color-text)] truncate">{entry.name}</span>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  0x{entry.id.toString(16).toUpperCase()}
                </span>
                {sfxPlayer && (
                  <button
                    onClick={e => handlePlay(e, entry.id)}
                    className={`p-0.5 rounded flex-shrink-0 transition-colors ${
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
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] flex justify-between flex-shrink-0">
        <span>{SFX_ENTRIES.length} sounds</span>
        <span>{filtered.length} shown</span>
      </div>
    </div>
  );
}
