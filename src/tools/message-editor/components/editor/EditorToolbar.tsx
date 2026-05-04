import { useState, useRef, useEffect } from 'react';
import { Palette, Type, BoxSelect, Package, Music, Clock, ChevronDown } from 'lucide-react';
import { CTRL, MSG_COLORS } from '../../lib/control-codes';
import { SFXBrowser } from '../controls/SFXBrowser';
import { IconPicker } from '../controls/IconPicker';
import type { SFXPlayer } from '@/lib/audio/sfx-player';

interface EditorToolbarProps {
  onInsert: (code: number, name: string, args: number[]) => void;
  textboxType: number;
  iconUrls?: Map<number, string>;
  sfxPlayer?: SFXPlayer | null;
}

export function EditorToolbar({ onInsert, textboxType: _textboxType, iconUrls, sfxPlayer }: EditorToolbarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!openKey) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openKey]);

  const toggle = (key: string) => {
    setOpenKey(prev => prev === key ? null : key);
  };

  const insert = (code: number, name: string, args: number[] = []) => {
    onInsert(code, name, args);
    setOpenKey(null);
  };

  const handleSfxSelect = (_name: string, id: number) => {
    const hi = (id >> 8) & 0xFF;
    const lo = id & 0xFF;
    insert(CTRL.SFX, 'SFX', [hi, lo]);
  };

  const handleIconSelect = (id: number, _name: string) => {
    insert(CTRL.ITEM_ICON, 'ITEM_ICON', [id]);
  };

  return (
    <div ref={containerRef} className="flex items-center gap-1 flex-wrap">
      {/* Color */}
      <div className="relative">
        <button onClick={() => toggle('color')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${openKey === 'color' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'}`}>
          <Palette className="w-3.5 h-3.5" />Color<ChevronDown className="w-3 h-3" />
        </button>
        {openKey === 'color' && (
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-2">
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(MSG_COLORS).map(([id, { name, css }]) => (
                <button key={id} onClick={() => insert(CTRL.COLOR, 'COLOR', [parseInt(id)])} className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-[var(--color-surface-hover)] transition-colors">
                  <span className="w-3 h-3 rounded-sm ring-1 ring-white/10 flex-shrink-0" style={{ backgroundColor: css }} />
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="relative">
        <button onClick={() => toggle('layout')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${openKey === 'layout' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'}`}>
          <Type className="w-3.5 h-3.5" />Layout<ChevronDown className="w-3 h-3" />
        </button>
        {openKey === 'layout' && (
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-1.5 space-y-0.5">
            {[
              { code: CTRL.NEWLINE, name: 'NEWLINE', label: 'Line Break' },
              { code: CTRL.BOX_BREAK, name: 'BOX_BREAK', label: 'New Box' },
              { code: CTRL.BOX_BREAK_DELAYED, name: 'BOX_BREAK_DELAYED', label: 'New Box (Delayed)', args: [0x00] },
              { code: CTRL.SHIFT, name: 'SHIFT', label: 'Shift +16px', args: [0x10] },
              { code: CTRL.TEXT_SPEED, name: 'TEXT_SPEED', label: 'Text Speed', args: [2] },
              { code: CTRL.UNSKIPPABLE, name: 'UNSKIPPABLE', label: 'Unskippable' },
            ].map(item => (
              <button key={item.code} onClick={() => insert(item.code, item.name, item.args ?? [])} className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-[var(--color-surface-hover)] transition-colors">{item.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Box */}
      <div className="relative">
        <button onClick={() => toggle('box')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${openKey === 'box' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'}`}>
          <BoxSelect className="w-3.5 h-3.5" />Box<ChevronDown className="w-3 h-3" />
        </button>
        {openKey === 'box' && (
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-1.5 space-y-0.5">
            {[
              { code: CTRL.PERSISTENT, name: 'PERSISTENT', label: 'Persistent' },
              { code: CTRL.TWO_CHOICE, name: 'TWO_CHOICE', label: '2 Choices' },
              { code: CTRL.THREE_CHOICE, name: 'THREE_CHOICE', label: '3 Choices' },
              { code: CTRL.AWAIT_BUTTON_PRESS, name: 'AWAIT_BUTTON_PRESS', label: 'Wait Button' },
              { code: CTRL.FADE, name: 'FADE', label: 'Fade Out', args: [0xFF] },
              { code: CTRL.FADE2, name: 'FADE2', label: 'Fade Out 2', args: [0xFF, 0xFF] },
              { code: CTRL.EVENT, name: 'EVENT', label: 'Event Trigger' },
              { code: CTRL.QUICKTEXT_ENABLE, name: 'QUICKTEXT_ENABLE', label: 'Quick Text On' },
              { code: CTRL.QUICKTEXT_DISABLE, name: 'QUICKTEXT_DISABLE', label: 'Quick Text Off' },
              { code: CTRL.END, name: 'END', label: 'End Message' },
            ].map(item => (
              <button key={item.code} onClick={() => insert(item.code, item.name, item.args ?? [])} className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-[var(--color-surface-hover)] transition-colors">{item.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Variables */}
      <div className="relative">
        <button onClick={() => toggle('variables')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${openKey === 'variables' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'}`}>
          <Clock className="w-3.5 h-3.5" />Variables<ChevronDown className="w-3 h-3" />
        </button>
        {openKey === 'variables' && (
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] max-h-[300px] overflow-y-auto rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-1.5 space-y-0.5">
            {[
              { code: CTRL.NAME, name: 'NAME', label: 'Player Name' },
              { code: CTRL.OCARINA, name: 'OCARINA', label: 'Ocarina', args: [0, 0, 0] },
              { code: CTRL.MARATHON_TIME, name: 'MARATHON_TIME', label: 'Marathon Time' },
              { code: CTRL.RACE_TIME, name: 'RACE_TIME', label: 'Race Time' },
              { code: CTRL.POINTS, name: 'POINTS', label: 'Points' },
              { code: CTRL.TOKENS, name: 'TOKENS', label: 'Skulltula Tokens' },
              { code: CTRL.FISH_INFO, name: 'FISH_INFO', label: 'Fish Info' },
              { code: CTRL.HIGHSCORE, name: 'HIGHSCORE', label: 'High Score', args: [0] },
              { code: CTRL.TIME, name: 'TIME', label: 'Time' },
              { code: CTRL.TEXTID, name: 'TEXTID', label: 'Jump to Text', args: [0, 0] },
              { code: CTRL.BACKGROUND, name: 'BACKGROUND', label: 'Background', args: [0, 0, 0] },
            ].map(item => (
              <button key={item.code} onClick={() => insert(item.code, item.name, item.args ?? [])} className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-[var(--color-surface-hover)] transition-colors">{item.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Item */}
      <div className="relative">
        <button onClick={() => toggle('item')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${openKey === 'item' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'}`}>
          <Package className="w-3.5 h-3.5" />Item
        </button>
        {openKey === 'item' && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <IconPicker onSelect={handleIconSelect} onClose={() => setOpenKey(null)} iconUrls={iconUrls} />
          </div>
        )}
      </div>

      {/* SFX */}
      <div className="relative">
        <button onClick={() => toggle('sfx')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${openKey === 'sfx' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'}`}>
          <Music className="w-3.5 h-3.5" />SFX
        </button>
        {openKey === 'sfx' && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <SFXBrowser onSelect={handleSfxSelect} onClose={() => setOpenKey(null)} sfxPlayer={sfxPlayer} />
          </div>
        )}
      </div>
    </div>
  );
}
