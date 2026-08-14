import { useState, useCallback, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

interface RadioFileUploadProps {
  onFile: (file: File) => void;
}

export function RadioFileUpload({ onFile }: RadioFileUploadProps) {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const file = Array.from(e.dataTransfer.files).find(f =>
      f.name.toLowerCase().endsWith('.o2r')
    );
    if (file) onFile(file);
  }, [onFile]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = Array.from(e.target.files ?? []).find(f =>
      f.name.toLowerCase().endsWith('.o2r')
    );
    if (file) onFile(file);
    e.target.value = '';
  }, [onFile]);

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
        accept=".o2r"
        onChange={handleChange}
        className="hidden"
      />
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
        ${active ? 'bg-[var(--color-accent)]/20 scale-110' : 'bg-[var(--color-primary)]/10'}
      `}>
        {active ? (
          <FileText className="w-8 h-8 text-[var(--color-accent)]" />
        ) : (
          <Upload className="w-8 h-8 text-[var(--color-accent)]" />
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-[var(--color-text)] mb-1">
          {active ? 'Drop your sf64.o2r here' : 'Drop sf64.o2r or click to browse'}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Star Fox 64 radio message editor
        </p>
      </div>
    </div>
  );
}
