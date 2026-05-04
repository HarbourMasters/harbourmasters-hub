import { useState } from 'react'
import { CheckCircle, XCircle, QrCode, ChevronDown, Gamepad2, Disc, Download, Bug, FlaskConical, Monitor, Building } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getRomsForGame } from '@/data/romDatabase'
import { GAMES } from '@/data/games'
import { getRegionFlag } from '@/utils/romHelpers'
import { GameIcon } from '@/components/common/GameIcon'

// Format icons with colors - matching ship.equipment style
const FORMAT_ICONS: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; key: string; color: string }> = {
  'cart': { icon: Gamepad2, key: 'cart', color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10' },
  'optical': { icon: Disc, key: 'disc', color: 'text-purple-500 dark:text-purple-400 bg-purple-500/10' },
  'digital': { icon: Download, key: 'digital', color: 'text-green-500 dark:text-green-400 bg-green-500/10' },
  'debug': { icon: Bug, key: 'debug', color: 'text-yellow-500 dark:text-yellow-400 bg-yellow-500/10' },
  'beta': { icon: FlaskConical, key: 'beta', color: 'text-orange-500 dark:text-orange-400 bg-orange-500/10' },
  'kiosk': { icon: Monitor, key: 'kiosk', color: 'text-pink-500 dark:text-pink-400 bg-pink-500/10' },
  'hotel': { icon: Building, key: 'hotel', color: 'text-gray-500 dark:text-gray-400 bg-gray-500/10' },
}

interface RomDatabaseTableProps {
  highlightedHash?: string
}

export function RomDatabaseTable({ highlightedHash }: RomDatabaseTableProps) {
  const { t } = useTranslation(['tools', 'common'])
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

  // Get translated format label
  const getFormatLabel = (key: string): string => {
    return t(`common:romDatabase.${key}`)
  }

  // Copy SHA-1 to clipboard
  const copyHash = async (sha1: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(sha1)
      setCopiedHash(sha1)
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Get all ROMs grouped by game
  const gamesWithRoms = Object.values(GAMES).map(game => ({
    game,
    roms: getRomsForGame(game.id)
  }))

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
          {t('verification.databaseTitle')}
        </h3>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {t('verification.databaseSubtitle')}
        </p>
      </div>

      {/* Game Tables - 3 per row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gamesWithRoms.map(({ game, roms }) => {
          const isExpanded = expandedGame === game.id
          const supportedCount = roms.filter(r => r.supported).length

          return (
            <div
              key={game.id}
              className="flex flex-col"
            >
              {/* Game Header - Clickable to expand/collapse */}
              <button
                onClick={() => setExpandedGame(isExpanded ? null : game.id)}
                className={`
                  relative flex items-center justify-between p-4 rounded-t-xl border-b-0
                  transition-all duration-300
                  ${isExpanded
                    ? `bg-gradient-to-r ${game.gradient} text-[var(--color-background)]`
                    : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'
                  }
                  rounded-t-xl
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isExpanded
                      ? 'bg-white/20'
                      : `bg-gradient-to-br ${game.gradient}`
                    }
                  `}>
                    <GameIcon game={game} className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h4 className={`font-display font-bold ${isExpanded ? 'text-white' : ''}`}>{game.name}</h4>
                    <p className={`text-xs ${isExpanded ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                      {supportedCount} supported • {roms.length - supportedCount} unsupported
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`}
                />
              </button>

              {/* Table Content */}
              {isExpanded && (
                <div className="flex-1 bg-[var(--color-surface)] border border-t-0 border-[var(--color-border)] rounded-b-xl overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[24px_1fr_32px_32px_40px] gap-3 px-4 py-2.5 bg-[var(--color-background)]/50 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] items-center">
                    <div className="flex justify-center">✓</div>
                    <div>{t('common:common.version')}</div>
                    <div className="flex justify-center">{t('common:romDatabase.region')}</div>
                    <div className="flex justify-center">{t('common:romDatabase.format')}</div>
                    <div className="flex justify-center">SHA-1</div>
                  </div>

                  {/* ROM Rows */}
                  <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                    {roms.map((rom) => {
                      const regionInfo = getRegionFlag(rom.region)
                      const isHighlighted = rom.sha1.toUpperCase() === highlightedHash?.toUpperCase()
                      const isCopied = copiedHash === rom.sha1

                      return (
                        <div
                          key={rom.sha1}
                          className={`
                            grid grid-cols-[24px_1fr_32px_32px_40px] gap-3 px-4 py-2.5 border-b border-[var(--color-border)]
                            transition-colors items-center
                            ${isHighlighted
                              ? 'bg-[var(--color-primary)]/10'
                              : rom.supported
                                ? 'hover:bg-[var(--color-background)]/30'
                                : 'opacity-50'
                            }
                            ${!rom.supported ? 'bg-[var(--color-background)]/20' : ''}
                          `}
                        >
                          {/* Status Icon */}
                          <div className="flex justify-center">
                            {rom.supported ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-400" />
                            )}
                          </div>

                          {/* Version */}
                          <div className="min-w-0">
                            <span className="text-sm font-medium truncate block" title={rom.version}>
                              {rom.version}
                            </span>
                          </div>

                          {/* Region Flag */}
                          <div className="flex justify-center">
                            <span
                              className={`fi rounded-sm ${regionInfo.flagClass}`}
                              title={regionInfo.label}
                            />
                          </div>

                          {/* Format Badge */}
                          <div className="flex justify-center">
                            {rom.formats && rom.formats.length > 0 && FORMAT_ICONS[rom.formats[0]] && (
                              <span
                                className={`p-1 rounded ${FORMAT_ICONS[rom.formats[0]].color}`}
                                title={getFormatLabel(FORMAT_ICONS[rom.formats[0]].key)}
                              >
                                {(() => {
                                  const IconComponent = FORMAT_ICONS[rom.formats[0]].icon
                                  return <IconComponent size={12} />
                                })()}
                              </span>
                            )}
                          </div>

                          {/* SHA-1 Copy Button */}
                          <div className="flex justify-center">
                            <button
                              onClick={(e) => copyHash(rom.sha1, e)}
                              className={`
                                flex items-center justify-center w-8 h-8 rounded transition-all
                                ${isCopied
                                  ? 'text-green-500 bg-green-500/20'
                                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10'
                                }
                              `}
                              title={rom.sha1}
                            >
                              {isCopied ? (
                                <CheckCircle size={14} />
                              ) : (
                                <QrCode size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span className="font-medium">{t('common:romDatabase.formats')}:</span>
        {Object.entries(FORMAT_ICONS).map(([key, { icon: IconComponent, key: labelKey, color }]) => (
          <span key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]`}>
            <span className={`p-0.5 rounded ${color}`}>
              <IconComponent size={12} />
            </span>
            <span>{getFormatLabel(labelKey)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
