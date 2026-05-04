import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileCode2, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileLoad: (file: File) => void;
}

export function MessageEditorFileUpload({ onFileLoad }: FileUploadProps) {
  const { t } = useTranslation('tools');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.o2r') && !file.name.endsWith('.zip')) return;
    setIsLoading(true);
    try {
      await onFileLoad(file);
    } finally {
      setIsLoading(false);
    }
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.o2r,.zip';
    input.onchange = () => {
      if (input.files?.[0]) handleFile(input.files[0]);
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={isLoading ? undefined : handleClick}
      className={`
        relative flex flex-col items-center justify-center gap-6 p-16 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
        ${isDragging
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.02]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]/30 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]/50'
        }
        ${isLoading ? 'pointer-events-none opacity-70' : ''}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-16 h-16 text-[var(--color-accent)] animate-spin" />
          <p className="text-[var(--color-text-muted)]">{t('messageEditor.loading')}</p>
        </>
      ) : (
        <>
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--color-accent)]/20 blur-xl rounded-full" />
            {isDragging ? (
              <Upload className="relative w-16 h-16 text-[var(--color-accent)]" />
            ) : (
              <FileCode2 className="relative w-16 h-16 text-[var(--color-text-muted)]" />
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-[var(--color-text)]">
              {isDragging ? t('messageEditor.dropZoneActive') : t('messageEditor.dropZone')}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">Supports .o2r files</p>
          </div>
        </>
      )}
    </div>
  );
}
