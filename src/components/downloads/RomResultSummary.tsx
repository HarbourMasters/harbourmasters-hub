import { CheckCircle, XCircle, AlertCircle, RefreshCw, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RomVerificationResult } from '@/utils/romVerifier'
import { formatFileSize } from '@/utils/romHelpers'
import { GameCompatibilityCard } from './GameCompatibilityCard'
import { GAMES } from '@/data/games'
import { cn } from '@/utils/cn'

interface RomResultSummaryProps {
  result: RomVerificationResult
  onReset: () => void
}

export function RomResultSummary({ result, onReset }: RomResultSummaryProps) {
  const { t } = useTranslation(['tools'])

  const hasSupported = result.matches.some(m => m.supported)

  return (
    <div className="rom-result-summary animate-fade-in" ref={(el) => {
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }}>
      {/* Result Header */}
      <div className={cn(
        'flex items-start gap-4 p-6 rounded-2xl border mb-6',
        hasSupported
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-yellow-500/5 border-yellow-500/20'
      )}>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          hasSupported
            ? 'bg-green-500/20 text-green-500'
            : 'bg-yellow-500/20 text-yellow-500'
        )}>
          {hasSupported ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-display font-bold text-xl mb-2',
            hasSupported ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          )}>
            {hasSupported
              ? t('verification.supportedRom')
              : t('verification.unsupportedRom')}
          </h3>

          {/* File Info */}
          <div className="space-y-1 text-sm text-[var(--color-text-muted)]">
            <p className="font-medium text-[var(--color-text)]">
              {result.fileName}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>{formatFileSize(result.fileSize)}</span>
              <span>•</span>
              <span>{getFormatDisplayName(result.format, t)}</span>
              <span>•</span>
              <span className="font-mono flex items-center gap-1.5">
                <QrCode size={12} className="text-[var(--color-text-muted)]" />
                {t('verification.sha1Label')} {result.sha1}
              </span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
          title={t('verification.tryAnother')}
        >
          <RefreshCw size={20} className="text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Compatibility Cards */}
      <div>
        <h4 className="font-display font-semibold text-lg mb-4">
          {t('verification.compatibilityTitle')}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(GAMES).map((game) => {
            const match = result.matches.find(m => m.game === game.id)
            return (
              <GameCompatibilityCard
                key={game.id}
                game={game}
                match={match}
              />
            )
          })}
        </div>
      </div>

      {/* No Match Message */}
      {result.matches.length === 0 && (
        <div className="mt-6 p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <XCircle size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="text-[var(--color-text-muted)]">
            {t('verification.noMatch')}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            {t('verification.noMatchHint')}
          </p>
        </div>
      )}
    </div>
  )
}

function getFormatDisplayName(format: string, t: (key: string) => string): string {
  const keyMap: Record<string, string> = {
    'big-endian': 'formatNames.bigEndian',
    'byte-swapped': 'formatNames.byteSwapped',
    'word-swapped': 'formatNames.wordSwapped',
    'little-endian': 'formatNames.littleEndian',
    'unknown': 'formatNames.unknown',
  }
  const key = keyMap[format] || 'formatNames.unknown'
  return t(`verification.${key}`)
}
