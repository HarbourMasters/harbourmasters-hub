import { CheckCircle, XCircle, Gamepad2, Disc, Download, Bug, FlaskConical, Monitor, Building } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RomMatch } from '@/utils/romVerifier'
import { getRegionFlag } from '@/utils/romHelpers'
import type { Game } from '@/types/game'
import { cn } from '@/utils/cn'
import { GameIcon } from '@/components/common/GameIcon'

const FORMAT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'cart': Gamepad2,
  'optical': Disc,
  'digital': Download,
  'debug': Bug,
  'beta': FlaskConical,
  'kiosk': Monitor,
  'hotel': Building,
}

interface GameCompatibilityCardProps {
  game: Game
  match?: RomMatch
}

export function GameCompatibilityCard({ game, match }: GameCompatibilityCardProps) {
  const { t } = useTranslation(['tools'])
  const isCompatible = match?.supported

  const regionInfo = match ? getRegionFlag(match.region) : null

  return (
    <div className={cn(
      'compatibility-card p-4 rounded-xl border transition-all duration-300',
      isCompatible
        ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/30 hover:bg-green-500/10'
        : 'bg-red-500/10 border-red-500/20 hover:border-red-500/30 hover:bg-red-500/15'
    )}>
      <div className="flex items-center gap-4">
        {/* Game Icon */}
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          isCompatible
            ? 'bg-green-500/20'
            : 'bg-red-500/20'
        )}>
          <GameIcon game={game} className="w-8 h-8" />
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <h5 className="font-display font-semibold mb-1.5">
            {game.name}
          </h5>

          {/* Status Pill */}
          {isCompatible ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
              <CheckCircle size={12} />
              Compatible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-600 dark:text-red-400 rounded-full border border-red-500/20">
              <XCircle size={12} />
              {t('verification.notCompatible')}
            </span>
          )}

          {/* Match details */}
          {match && isCompatible && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] mt-2">
              <span className="font-medium text-green-600 dark:text-green-400">
                {match.version}
              </span>
              <span className={cn('fi rounded-sm', regionInfo?.flagClass)} title={regionInfo?.label} />
              {match.formats && match.formats.length > 0 && FORMAT_ICONS[match.formats[0]] && (
                <span className="p-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
                  {(() => {
                    const IconComponent = FORMAT_ICONS[match.formats[0]]
                    return <IconComponent size={12} />
                  })()}
                </span>
              )}
              {match.specialNotes && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400" title={match.specialNotes}>
                  ⚠️
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status Icon */}
        <div className="flex-shrink-0">
          {isCompatible ? (
            <CheckCircle size={24} className="text-green-500" />
          ) : (
            <XCircle size={24} className="text-red-400" />
          )}
        </div>
      </div>
    </div>
  )
}
