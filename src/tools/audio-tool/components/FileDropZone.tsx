import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileAudio } from 'lucide-react';

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  labelActive?: string;
  subtitle?: string;
}

export function FileDropZone({ onFiles, accept = '.wav,.ogg,.oga', multiple = true, label, labelActive, subtitle }: FileDropZoneProps) {
  const { t } = useTranslation('tools');
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const extensions = accept.split(',').map(e => e.trim());

  const isValidFile = useCallback((name: string) => {
    const lower = name.toLowerCase();
    return extensions.some(ext => lower.endsWith(ext));
  }, [extensions]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => isValidFile(f.name));
    if (files.length > 0) onFiles(files);
  }, [onFiles, isValidFile]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFiles(files);
    e.target.value = '';
  }, [onFiles]);

  const displayLabel = active
    ? (labelActive ?? t('audioTool.dropZoneActive'))
    : (label ?? t('audioTool.dropZone'));

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center gap-4 py-16 px-8
        rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
        ${active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.01]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]/30 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
        ${active ? 'bg-[var(--color-accent)]/20 scale-110' : 'bg-[var(--color-primary)]/10'}
      `}>
        {active ? (
          <FileAudio className="w-8 h-8 text-[var(--color-accent)]" />
        ) : (
          <Upload className="w-8 h-8 text-[var(--color-accent)]" />
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-[var(--color-text)] mb-1">
          {displayLabel}
        </p>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
