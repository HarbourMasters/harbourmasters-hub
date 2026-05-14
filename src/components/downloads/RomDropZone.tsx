import { Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isValidRomFile } from '@/utils/romVerifier'
import { cn } from '@/utils/cn'

interface RomDropZoneProps {
  verifying: boolean
  progress: number
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function RomDropZone({ verifying, progress, onFileSelect, disabled }: RomDropZoneProps) {
  const { t } = useTranslation(['tools'])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const validFile = files.find(file => isValidRomFile(file))

    if (validFile) {
      onFileSelect(validFile)
    }
  }, [disabled, onFileSelect])

  const handleClick = useCallback(() => {
    if (disabled || verifying) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.z64,.n64,.v64,.rom,.bin'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && isValidRomFile(file)) {
        onFileSelect(file)
      }
    }
    input.click()
  }, [disabled, verifying, onFileSelect])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        'rom-drop-zone relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
        'min-h-[200px] flex flex-col items-center justify-center text-center',
        !disabled && !verifying && 'hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5',
        isDragging && 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-[1.02]',
        disabled && 'opacity-50 cursor-not-allowed',
        verifying && 'pointer-events-none'
      )}
    >
      {verifying ? (
        <div className="verifying-state flex flex-col items-center gap-4">
          {/* Progress Bar */}
          <div className="w-full max-w-xs h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[var(--color-text-muted)] animate-pulse">
            {t('verification.verifying')}... {Math.round(progress)}%
          </p>
        </div>
      ) : (
        <div className="idle-state flex flex-col items-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
            isDragging ? 'bg-[var(--color-primary)] text-[var(--color-background)] scale-110' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
          )}>
            <Upload size={32} />
          </div>
          <div>
            <p className="text-lg font-medium mb-1">
              {t('verification.dropZone')}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t('verification.supportedFormats')}
            </p>
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-2xl border-2 border-[var(--color-primary)] flex items-center justify-center">
          <p className="text-xl font-bold text-[var(--color-primary)]">
            {t('verification.dropZoneActive')}
          </p>
        </div>
      )}
    </div>
  )
}
