import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, Archive } from 'lucide-react';
import JSZip from 'jszip';
import type { SampleItem } from '../hooks/useAudioSamples';
import type { ConversionResult } from '../hooks/useConversion';

interface ConvertButtonProps {
  items: SampleItem[];
  convertSample: (item: SampleItem) => ConversionResult;
  onUpdate: (id: string, updates: Partial<SampleItem>) => void;
}

export function ConvertButton({ items, convertSample, onUpdate }: ConvertButtonProps) {
  const { t } = useTranslation('tools');

  const readyItems = items.filter(i => i.status === 'ready');
  const convertedItems = items.filter(i => i.status === 'converted' && i.convertedData);
  const converting = items.some(i => i.status === 'converting');

  const handleConvert = useCallback(() => {
    for (const item of readyItems) {
      onUpdate(item.id, { status: 'converting', statusMessage: 'Converting...' });
    }

    // Use setTimeout to let the UI update
    setTimeout(() => {
      for (const item of readyItems) {
        const result = convertSample(item);
        onUpdate(item.id, {
          status: result.success ? 'converted' : 'error',
          statusMessage: result.message,
          convertedData: result.data,
        });
      }
    }, 10);
  }, [readyItems, convertSample, onUpdate]);

  const handleDownloadAll = useCallback(async () => {
    if (convertedItems.length === 0) return;

    if (convertedItems.length === 1) {
      const item = convertedItems[0];
      if (item.convertedData) downloadBlob(item.convertedData, `${item.outputName}.sohsample`);
      return;
    }

    const zip = new JSZip();
    for (const item of convertedItems) {
      if (item.convertedData) {
        zip.file(`${item.outputName}.sohsample`, item.convertedData);
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'samples.zip');
  }, [convertedItems]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleConvert}
        disabled={readyItems.length === 0 || converting}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {converting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {t('audioTool.convert')} ({readyItems.length})
      </button>

      {convertedItems.length > 0 && (
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-primary)]/10 text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <Archive className="w-4 h-4" />
          {t('audioTool.downloadAll')} ({convertedItems.length})
        </button>
      )}
    </div>
  );
}

function downloadBlob(data: BlobPart, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
