import { useState } from 'react'
import { CheckCircle, XCircle, QrCode, ChevronDown, ChevronUp, Gamepad2, Disc, Download, Bug, FlaskConical, Monitor, Building } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getRomsForGame } from '@/data/romDatabase'
import { GAMES } from '@/data/games'
import { getRegionFlag } from '@/utils/romHelpers'
import { GameIcon } from '@/components/common/GameIcon'

// Format icons with colors and labels
const FORMAT_ICONS: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string }> = {
  'cart': { icon: Gamepad2, label: 'Cart', color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10' },
  'optical': { icon: Disc, label: 'Disc', color: 'text-purple-500 dark:text-purple-400 bg-purple-500/10' },
  'digital': { icon: Download, label: 'Digital', color: 'text-green-500 dark:text-green-400 bg-green-500/10' },
  'debug': { icon: Bug, label: 'Debug', color: 'text-yellow-500 dark:text-yellow-400 bg-yellow-500/10' },
  'beta': { icon: FlaskConical, label: 'Beta', color: 'text-orange-500 dark:text-orange-400 bg-orange-500/10' },
  'kiosk': { icon: Monitor, label: 'Kiosk', color: 'text-pink-500 dark:text-pink-400 bg-pink-500/10' },
  'hotel': { icon: Building, label: 'LodgeNet', color: 'text-gray-500 dark:text-gray-400 bg-gray-500/10' },
}

interface RomDatabaseCardsProps {
  highlightedHash?: string
}

export function RomDatabaseCards({ highlightedHash }: RomDatabaseCardsProps) {
  const { t } = useTranslation(['tools'])
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set())

  // Toggle game expansion
  const toggleGame = (gameId: string) => {
    setExpandedGames(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gameId)) {
        newSet.delete(gameId)
      } else {
        newSet.add(gameId)
      }
      return newSet
    })
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

  // Truncate SHA-1 for display
  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-4)}`
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
          {t('verification.databaseTitle')}
        </h3>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {t('verification.databaseSubtitle')}
        </p>
      </div>

      {/* Game Cards Grid - 3 columns on larger screens */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(GAMES).map((game, index) => {
          const roms = getRomsForGame(game.id)
          const supportedRoms = roms.filter(r => r.supported)
          const unsupportedRoms = roms.filter(r => !r.supported)
          const isExpanded = expandedGames.has(game.id)

          return (
            <div
              key={game.id}
              className="group relative p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[var(--color-accent)]/15 animate-on-scroll"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

              {/* Game Icon */}
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <GameIcon game={game} className="w-14 h-14" />
              </div>

              {/* Game Name */}
              <div className="text-center mb-4">
                <h4 className="font-display font-bold text-lg mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                  {game.name}
                </h4>
                <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span className="text-green-400">{supportedRoms.length} supported</span>
                  <span>•</span>
                  <span className="text-red-400">{unsupportedRoms.length} unsupported</span>
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleGame(game.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[var(--color-background)]/50 hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 mb-4"
              >
                <span className="text-sm font-medium">
                  {isExpanded ? t('verification.hideRoms') : t('verification.viewRoms')}
                </span>
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {/* ROM List (Expanded) */}
              {isExpanded && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {roms.map((rom) => {
                    const regionInfo = getRegionFlag(rom.region)
                    const isHighlighted = rom.sha1.toUpperCase() === highlightedHash?.toUpperCase()
                    const isCopied = copiedHash === rom.sha1

                    return (
                      <div
                        key={rom.sha1}
                        className={`p-3 rounded-xl border transition-all ${
                          isHighlighted
                            ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/50'
                            : rom.supported
                              ? 'bg-[var(--color-background)]/50 border-[var(--color-border)] hover:border-[var(--color-border)]'
                              : 'bg-[var(--color-background)]/30 border-[var(--color-border)]/50 opacity-60'
                        }`}
                      >
                        {/* Version Row */}
                        <div className="flex items-center gap-2 mb-2">
                          {rom.supported ? (
                            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-red-400 flex-shrink-0" />
                          )}
                          <span className="text-xs font-medium truncate flex-1">
                            {rom.version}
                          </span>
                        </div>

                        {/* Region & Format */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`fi rounded-sm ${regionInfo.flagClass}`}
                            title={regionInfo.label}
                          />
                          {rom.formats && rom.formats.length > 0 && FORMAT_ICONS[rom.formats[0]] && (
                            <span
                              className={`p-1 rounded ${FORMAT_ICONS[rom.formats[0]].color}`}
                              title={FORMAT_ICONS[rom.formats[0]].label}
                            >
                              {(() => {
                                const IconComponent = FORMAT_ICONS[rom.formats[0]].icon
                                return <IconComponent size={12} />
                              })()}
                            </span>
                          )}
                        </div>

                        {/* SHA-1 Copy Button */}
                        <button
                          onClick={(e) => copyHash(rom.sha1, e)}
                          className={`flex items-center gap-1.5 text-[10px] font-mono transition-all ${
                            isCopied
                              ? 'text-green-500'
                              : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'
                          }`}
                          title={rom.sha1}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle size={12} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <QrCode size={12} />
                              <span className="truncate">{truncateHash(rom.sha1)}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span className="font-medium">{t('verification.formats')}:</span>
        {Object.entries(FORMAT_ICONS).map(([key, { icon: IconComponent, label, color }]) => (
          <span key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]`}>
            <span className={`p-0.5 rounded ${color}`}>
              <IconComponent size={12} />
            </span>
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
