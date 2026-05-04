import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Gamepad2, Disc, Download, Bug, FlaskConical, Monitor, Building } from 'lucide-react'
import { getRomsForGame } from '@/data/romDatabase'
import { GAMES } from '@/data/games'
import type { RomDatabaseEntry } from '@/data/romDatabase'
import type { Game } from '@/types/game'
import { getRegionFlag } from '@/utils/romHelpers'
import { GameIcon } from '@/components/common/GameIcon'

// Extended type for ROM with game info (for display)
interface RomWithGameInfo extends RomDatabaseEntry {
  gameInfo?: Game
}

// Media type icons
const MEDIA_ICONS: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string }> = {
  'cart': { icon: Gamepad2, label: 'Cartridge', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  'optical': { icon: Disc, label: 'Disc', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  'digital': { icon: Download, label: 'Digital', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  'debug': { icon: Bug, label: 'Debug', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
  'beta': { icon: FlaskConical, label: 'Beta', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  'kiosk': { icon: Monitor, label: 'Kiosk', color: 'bg-pink-500/20 text-pink-600 dark:text-pink-400' },
  'hotel': { icon: Building, label: 'LodgeNet', color: 'bg-gray-500/20 text-gray-600 dark:text-gray-400' },
}

interface RomCompactTableProps {
  highlightedHash?: string
}

export function RomCompactTable({ highlightedHash }: RomCompactTableProps) {
  const { t } = useTranslation(['tools'])
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  // Get all ROMs grouped by game
  const gamesWithRoms = useMemo(() =>
    Object.values(GAMES).map(game => ({
      game,
      roms: getRomsForGame(game.id)
    })), []
  )

  // Get display ROMs based on selection
  const displayRoms = useMemo((): RomWithGameInfo[] => {
    if (selectedGame) {
      const found = gamesWithRoms.find(g => g.game.id === selectedGame)
      return found?.roms || []
    }

    // When showing all, attach game info to each ROM
    const allRoms: RomWithGameInfo[] = []
    for (const { game, roms } of gamesWithRoms) {
      for (const rom of roms) {
        allRoms.push({ ...rom, gameInfo: game })
      }
    }
    return allRoms
  }, [selectedGame, gamesWithRoms])

  return (
    <div className="rom-compact-table">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg">
          {t('verification.databaseTitle')}
        </h3>
      </div>

      {/* Game Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedGame(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            !selectedGame
              ? 'bg-[var(--color-primary)] text-[var(--color-background)]'
              : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
          }`}
        >
          {t('verification.allGames')}
        </button>
        {gamesWithRoms.map(({ game, roms }) => {
          const supportedCount = roms.filter(r => r.supported).length
          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedGame === game.id
                  ? 'bg-[var(--color-primary)] text-[var(--color-background)]'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
              }`}
            >
              <span className={`w-5 h-5 rounded ${game.gradient} flex items-center justify-center`}>
                <GameIcon game={game} className="w-4 h-4" />
              </span>
              <span>{game.name}</span>
              <span className="text-xs opacity-70">({supportedCount})</span>
            </button>
          )
        })}
      </div>

      {/* Compact Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-3 px-3 font-semibold text-[var(--color-text-muted)]">{t('verification.version')}</th>
              <th className="text-left py-3 px-3 font-semibold text-[var(--color-text-muted)]">{t('verification.region')}</th>
              <th className="text-left py-3 px-3 font-semibold text-[var(--color-text-muted)]">{t('verification.format')}</th>
              {!selectedGame && (
                <th className="text-left py-3 px-3 font-semibold text-[var(--color-text-muted)]">{t('verification.game')}</th>
              )}
              <th className="text-center py-3 px-3 font-semibold text-[var(--color-text-muted)]">{t('verification.status')}</th>
            </tr>
          </thead>
          <tbody>
            {displayRoms.map((rom) => (
              <tr
                key={rom.sha1}
                className={`border-b border-[var(--color-border)] transition-colors ${
                  rom.sha1.toUpperCase() === highlightedHash?.toUpperCase()
                    ? 'bg-[var(--color-primary)]/10'
                    : 'hover:bg-[var(--color-surface)]'
                } ${!rom.supported ? 'opacity-50' : ''}`}
              >
                {/* Version */}
                <td className="py-2.5 px-3">
                  <span className="font-medium">{rom.version}</span>
                </td>

                {/* Region */}
                <td className="py-2.5 px-3">
                  <span
                    className={`fi rounded-sm ${getRegionFlag(rom.region).flagClass}`}
                    title={getRegionFlag(rom.region).label}
                  />
                </td>

                {/* Format */}
                <td className="py-2.5 px-3">
                  {rom.formats && rom.formats.length > 0 && MEDIA_ICONS[rom.formats[0]] && (
                    <span
                      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded text-xs ${
                        MEDIA_ICONS[rom.formats[0]].color
                      }`}
                      title={MEDIA_ICONS[rom.formats[0]].label}
                    >
                      {(() => {
                        const IconComponent = MEDIA_ICONS[rom.formats[0]].icon
                        return <IconComponent size={14} />
                      })()}
                    </span>
                  )}
                </td>

                {/* Game (only when showing all) */}
                {!selectedGame && rom.gameInfo && (
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${rom.gameInfo.gradient}`}>
                      <span className="w-4 h-4 rounded flex items-center justify-center text-[var(--color-background)]">
                        <GameIcon game={rom.gameInfo} className="w-3 h-3" />
                      </span>
                      <span>{rom.gameInfo.name}</span>
                    </span>
                  </td>
                )}

                {/* Status */}
                <td className="py-2.5 px-3 text-center">
                  {rom.supported ? (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                      ✓ {t('verification.supported')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                      ✗ {t('verification.unsupported')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
        <span className="font-medium">{t('verification.formats')}:</span>
        {Object.entries(MEDIA_ICONS).map(([key, { icon: IconComponent, label, color }]) => (
          <span key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] ${color}`}>
            <IconComponent size={12} />
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
