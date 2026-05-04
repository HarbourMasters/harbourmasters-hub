import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import type { SampleItem } from '../hooks/useAudioSamples';
import type { SampleMetaEntry } from '../data/sample-meta-types';
import { AudioPreview } from './AudioPreview';
import { SampleComboBrowser } from './SampleComboBrowser';
import type { SFXPlayer } from '@/lib/audio/sfx-player';

interface SampleTableProps {
  items: SampleItem[];
  onUpdate: (id: string, updates: Partial<SampleItem>) => void;
  onRemove: (id: string) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  sfxPlayer?: SFXPlayer | null;
  onSelectSample?: (itemId: string, entry: SampleMetaEntry) => void;
}

export function SampleTable({ items, onUpdate, onRemove, selectedId, onSelect, sfxPlayer, onSelectSample }: SampleTableProps) {
  const { t } = useTranslation('tools');

  if (items.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] min-h-[500px]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-surface)]/80 text-[var(--color-text-muted)]">
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.preview')}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.inputFile')}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider min-w-[220px]">
              {t('audioTool.outputName')}
            </th>
            <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.loopEnabled')}
            </th>
            <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.loopStart')}
            </th>
            <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.loopEnd')}
            </th>
            <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.loopCount')}
            </th>
            <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.sampleRate')}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">
              {t('audioTool.status')}
            </th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {items.map(item => {
            const isSelected = item.id === selectedId;
            const rateConverted = item.originalSampleRate !== 0 && item.originalSampleRate !== 32000;

            return (
              <tr
                key={item.id}
                onClick={() => onSelect?.(isSelected ? null : item.id)}
                className={`transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-accent)]/10'
                    : 'hover:bg-[var(--color-surface-hover)]/50'
                }`}
              >
                <td className="px-4 py-3">
                  <AudioPreview item={item} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.format === 'ogg'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.format.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-[var(--color-text)] truncate max-w-[160px]" title={item.fileName}>
                      {item.fileName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  {onSelectSample ? (
                    <SampleComboBrowser
                      value={item.outputName}
                      sfxPlayer={sfxPlayer ?? null}
                      onSelect={entry => onSelectSample(item.id, entry)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.outputName}
                      onChange={e => onUpdate(item.id, { outputName: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-transparent border border-[var(--color-border)] text-[var(--color-text)] text-xs focus:outline-none focus:border-[var(--color-accent)]/50"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={item.loopEnabled}
                    onChange={e => onUpdate(item.id, { loopEnabled: e.target.checked })}
                    className="accent-[var(--color-accent)]"
                  />
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    min={0}
                    value={item.loopStart}
                    onChange={e => onUpdate(item.id, { loopStart: parseInt(e.target.value) || 0 })}
                    disabled={!item.loopEnabled}
                    className="w-full px-2 py-1 rounded bg-transparent border border-[var(--color-border)] text-[var(--color-text)] text-xs text-center disabled:opacity-40 focus:outline-none focus:border-[var(--color-accent)]/50"
                  />
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    min={0}
                    value={item.loopEnd}
                    onChange={e => onUpdate(item.id, { loopEnd: parseInt(e.target.value) || 0 })}
                    disabled={!item.loopEnabled}
                    className="w-full px-2 py-1 rounded bg-transparent border border-[var(--color-border)] text-[var(--color-text)] text-xs text-center disabled:opacity-40 focus:outline-none focus:border-[var(--color-accent)]/50"
                  />
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    value={item.loopCount}
                    onChange={e => onUpdate(item.id, { loopCount: parseInt(e.target.value) || 0 })}
                    disabled={!item.loopEnabled}
                    className="w-full px-2 py-1 rounded bg-transparent border border-[var(--color-border)] text-[var(--color-text)] text-xs text-center disabled:opacity-40 focus:outline-none focus:border-[var(--color-accent)]/50"
                  />
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {item.wavData ? (
                    rateConverted ? (
                      <span>
                        <span className="text-[var(--color-text-muted)]">{item.originalSampleRate.toLocaleString()}</span>
                        <span className="text-[var(--color-accent)] mx-1">&rarr;</span>
                        <span className="text-[var(--color-text)]">32,000</span>
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">{item.wavData.sampleRate.toLocaleString()} Hz</span>
                    )
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${
                    item.status === 'converted' ? 'text-[var(--color-success)]' :
                    item.status === 'error' ? 'text-[var(--color-error)]' :
                    item.status === 'converting' ? 'text-[var(--color-warning)]' :
                    'text-[var(--color-text-muted)]'
                  }`}>
                    {item.statusMessage}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                    className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
