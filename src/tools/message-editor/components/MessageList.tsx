import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { TEXTBOX_TYPE_NAMES } from '../lib/control-codes';
import type { MessageEntry } from '../lib/message-parser';

interface MessageListProps {
  messages: MessageEntry[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  selectedForExport: Set<number>;
  onToggleExport: (id: number) => void;
}

export function MessageList({ messages, selectedId, onSelect, selectedForExport, onToggleExport }: MessageListProps) {
  const { t } = useTranslation('tools');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase().trim();
    return messages.filter(msg => {
      if (msg.id.toString().includes(q)) return true;
      const hexId = msg.id.toString(16).toLowerCase();
      const clean = q.startsWith('0x') ? q.slice(2) : q;
      if (hexId.includes(clean)) return true;
      if (msg.preview.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [messages, searchQuery]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder={t('messageEditor.search')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-accent)]/50"
        />
      </div>

      <div className="max-h-[calc(100vh-22rem)] overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-8">No messages found</p>
        ) : (
          filtered.map(msg => {
            const typeName = TEXTBOX_TYPE_NAMES[msg.textboxType] ?? `Type ${msg.textboxType}`;
            const isSelected = selectedId === msg.id;

            return (
              <div
                key={msg.id}
                onClick={() => onSelect(msg.id)}
                className={`
                  flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border
                  ${isSelected
                    ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
                    : 'bg-[var(--color-surface)]/50 border-transparent hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)]'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedForExport.has(msg.id)}
                  onChange={() => onToggleExport(msg.id)}
                  onClick={e => e.stopPropagation()}
                  className="mt-1 accent-[var(--color-accent)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-mono font-semibold text-[var(--color-accent)]">
                      0x{msg.id.toString(16).toUpperCase().padStart(4, '0')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-text-muted)]">
                        {typeName}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">{msg.data.length} {t('messageEditor.bytes')}</span>
                    </div>
                  </div>
                  <p className="text-sm font-mono text-[var(--color-text)]/70 truncate mt-0.5">{msg.preview}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
