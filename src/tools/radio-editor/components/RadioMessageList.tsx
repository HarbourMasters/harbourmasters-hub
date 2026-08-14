import { useState, useMemo } from 'react';
import { Search, Volume2, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import type { RadioMessageEntry } from '../lib/radio-parser';
import { getCategoryForId, MESSAGE_CATEGORIES } from '../lib/radio-parser';
import { RADIO_CHARACTER_NAMES, getBriefingSpeakerName } from '../lib/radio-char-codes';
import voiceMapData from '../lib/voice-map.json';

const voiceMap = new Set(Object.keys(voiceMapData));

interface RadioMessageListProps {
  messages: RadioMessageEntry[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDoubleClick?: (id: number) => void;
  textModifiedIds: Set<number>;
  audioModifiedIds: Set<number>;
}

interface CategoryGroup {
  name: string;
  messages: RadioMessageEntry[];
  textModifiedCount: number;
  audioModifiedCount: number;
}

export function RadioMessageList({ messages, selectedId, onSelect, onDoubleClick, textModifiedIds, audioModifiedIds }: RadioMessageListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCategory = (name: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

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

  const groups = useMemo(() => {
    const map = new Map<string, RadioMessageEntry[]>();
    for (const msg of filtered) {
      const cat = msg.category || getCategoryForId(msg.id);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(msg);
    }
    const sorted: CategoryGroup[] = [];
    const catOrder = MESSAGE_CATEGORIES.map(c => c.name);
    for (const catName of catOrder) {
      const msgs = map.get(catName);
      if (msgs) {
        sorted.push({
          name: catName,
          messages: msgs,
          textModifiedCount: msgs.filter(m => textModifiedIds.has(m.id)).length,
          audioModifiedCount: msgs.filter(m => audioModifiedIds.has(m.id)).length,
        });
      }
    }
    for (const [catName, msgs] of map) {
      if (!catOrder.includes(catName)) {
        sorted.push({
          name: catName,
          messages: msgs,
          textModifiedCount: msgs.filter(m => textModifiedIds.has(m.id)).length,
          audioModifiedCount: msgs.filter(m => audioModifiedIds.has(m.id)).length,
        });
      }
    }
    return sorted;
  }, [filtered, textModifiedIds, audioModifiedIds]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search by ID or text..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-accent)]/50"
        />
      </div>

      <div className="text-xs text-[var(--color-text-muted)] px-1">
        {filtered.length} of {messages.length} messages
      </div>

      <div className="max-h-[calc(100vh-22rem)] overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-8">No messages found</p>
        ) : (
          groups.map(group => {
            const isCollapsed = collapsed.has(group.name);
            return (
              <div key={group.name}>
                <button
                  onClick={() => toggleCategory(group.name)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span className="flex-1 text-left">{group.name}</span>
                  <span className="text-[var(--color-text-muted)]">
                    {group.textModifiedCount > 0 && (
                      <span className="text-yellow-400">{group.textModifiedCount}T</span>
                    )}
                    {group.audioModifiedCount > 0 && (
                      <>{group.textModifiedCount > 0 && ' '}{<span className="text-blue-400">{group.audioModifiedCount}A</span>}</>
                    )}
                    {(group.textModifiedCount > 0 || group.audioModifiedCount > 0) && ' / '}
                    {group.messages.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.messages.map(msg => {
                      const isSelected = selectedId === msg.id;
                      const hasVoice = voiceMap.has(String(msg.id));
                      const isTextModified = textModifiedIds.has(msg.id);
                      const isAudioModified = audioModifiedIds.has(msg.id);
                      const isModified = isTextModified || isAudioModified;
                      return (
                        <div
                          key={msg.id}
                          onClick={() => onSelect(msg.id)}
                          onDoubleClick={() => onDoubleClick?.(msg.id)}
                          className={`
                            flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border
                            ${isSelected
                              ? isModified
                                ? 'bg-orange-500/10 border-orange-500/30'
                                : 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
                              : isModified
                                ? 'bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10'
                                : 'bg-[var(--color-surface)]/50 border-transparent hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)]'
                            }
                          `}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-mono font-semibold ${isModified ? 'text-orange-400' : 'text-[var(--color-accent)]'}`}>
                                ID {msg.id}
                                {msg.characterId >= 0 && (msg.messageType === 'briefing' ? getBriefingSpeakerName(msg.characterId) : RADIO_CHARACTER_NAMES[msg.characterId]) && (
                                  <span className="text-[var(--color-text-muted)] font-normal ml-1.5">
                                    {msg.messageType === 'briefing' ? getBriefingSpeakerName(msg.characterId) : RADIO_CHARACTER_NAMES[msg.characterId]}
                                  </span>
                                )}
                                {hasVoice && (
                                  <Volume2 className="w-3 h-3 inline ml-1 text-green-500" />
                                )}
                                {isTextModified && (
                                  <span title="Text modified"><Pencil className="w-3 h-3 inline ml-1 text-yellow-400" /></span>
                                )}
                                {isAudioModified && (
                                  <span title="Audio replaced"><Volume2 className="w-3 h-3 inline ml-1 text-blue-400" /></span>
                                )}
                              </span>
                              <span className="text-xs text-[var(--color-text-muted)]">
                                {msg.charCodes.length} chars
                              </span>
                            </div>
                            <p className="text-sm font-mono text-[var(--color-text)]/70 truncate mt-0.5">
                              {msg.preview || '(empty)'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
