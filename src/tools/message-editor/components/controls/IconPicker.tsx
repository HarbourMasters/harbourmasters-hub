import { useState, useMemo } from 'react';
import { Search, X, Package } from 'lucide-react';
import { ITEM_ICONS } from '../../lib/control-codes';

interface IconPickerProps {
  onSelect: (id: number, name: string) => void;
  onClose: () => void;
  iconUrls?: Map<number, string>;
}

export function IconPicker({ onSelect, onClose, iconUrls }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const entries = Object.entries(ITEM_ICONS);
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(([, name]) => name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="absolute z-50 bottom-full left-0 mb-2 w-80 max-h-[350px] rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold text-[var(--color-text)]">Item Icon</span>
        </div>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative px-3 pt-2">
        <Search className="absolute left-6 top-[14px] w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]/50"
          autoFocus
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 max-h-[260px]">
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map(([id, name]) => {
            const itemId = parseInt(id);
            const iconUrl = iconUrls?.get(itemId);

            return (
              <button
                key={id}
                onClick={() => onSelect(itemId, name)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface-hover)] transition-colors text-center"
              >
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt={name}
                    className="w-6 h-6 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="text-[10px] font-mono text-[var(--color-accent)]">
                    0x{itemId.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                )}
                <span className="text-[10px] text-[var(--color-text)] leading-tight line-clamp-2">{name}</span>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)] text-xs py-4">No items found</p>
        )}
      </div>
    </div>
  );
}
