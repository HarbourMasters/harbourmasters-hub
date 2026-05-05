import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLatestRelease } from '@/hooks/useGitHub'
import { Game } from '@/types/game'
import type { GameId } from '@/types/game'
import { formatDate } from '@/utils/formatters'
import { Calendar, Download, ExternalLink } from 'lucide-react'
import { PlatformIcon } from '@/utils/platformIcons'
import { GameIcon } from '@/components/common/GameIcon'
import { detectOS, type DetectedOS } from '@/utils/platform'

interface GameCardProps {
  game: Game
  className?: string
}

const GameCard = React.memo(function GameCard({ game, className = '' }: GameCardProps) {
  const { t } = useTranslation(['common', 'games', 'home'])
  const { release, loading } = useLatestRelease(game.id as GameId)

  const userOS = detectOS()

  function getDownloadUrl(os: DetectedOS): string | null {
    if (!release?.assets) return null

    const assets = release.assets

    if (os === 'windows') {
      return assets.find(a =>
        a.name.toLowerCase().includes('windows') ||
        a.name.toLowerCase().includes('win') ||
        a.name.endsWith('.exe') ||
        a.name.includes('.zip')
      )?.browser_download_url || null
    } else if (os === 'linux') {
      return assets.find(a =>
        a.name.toLowerCase().includes('linux') ||
        a.name.toLowerCase().includes('ubuntu') ||
        a.name.endsWith('.AppImage') ||
        a.name.includes('.tar.gz')
      )?.browser_download_url || null
    } else if (os === 'macos') {
      return assets.find(a =>
        a.name.toLowerCase().includes('mac') ||
        a.name.toLowerCase().includes('osx') ||
        a.name.toLowerCase().includes('darwin')
      )?.browser_download_url || null
    }

    return null
  }

  const downloadUrl = release ? getDownloadUrl(userOS) : null

  function handleDownload(e: React.MouseEvent) {
    if (downloadUrl) {
      e.preventDefault()
      e.stopPropagation()
      window.open(downloadUrl, '_blank')
    }
  }

  // Determine available platforms from release assets
  const platforms = release?.assets ? release.assets.reduce((acc, asset) => {
    const name = asset.name.toLowerCase()
    if (name.includes('win') || name.includes('windows')) acc.hasWindows = true
    if (name.includes('linux') || name.includes('ubuntu')) acc.hasLinux = true
    if (name.includes('macos') || name.includes('osx') || name.includes('darwin') || name.endsWith('.dmg') || /(?:^|[-_\s.])mac(?:[-_\s.]|$)/.test(name)) acc.hasMac = true
    if (name.includes('switch')) acc.hasSwitch = true
    if ((name.includes('wii') && name.includes('u')) || name.includes('wiiu')) acc.hasWiiU = true
    return acc
  }, { hasWindows: false, hasLinux: false, hasMac: false, hasSwitch: false, hasWiiU: false }) : { hasWindows: false, hasLinux: false, hasMac: false, hasSwitch: false, hasWiiU: false }

  return (
    <Link
      to={`/game/${game.id}`}
      className={`group relative overflow-hidden rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] card-hover ${className}`}
    >
      {/* Theme Background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
            <GameIcon game={game} className="w-10 h-10" />
          </div>
          {loading ? (
            <div className="skeleton w-20 h-6 rounded-full" />
          ) : release ? (
            <span className="px-3 py-1 text-xs font-mono font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
              {release.tag_name}
            </span>
          ) : null}
        </div>

        {/* Content */}
        <h3 className="font-display text-xl font-bold mb-1 group-hover:text-[var(--color-primary)] transition-colors">
          {game.name}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          {game.tagline}
        </p>

        {/* Release Info */}
        {release && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(release.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <Download size={14} />
                {release.assets.reduce((sum, asset) => sum + asset.download_count, 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Platform Badges */}
        {(platforms.hasWindows || platforms.hasLinux || platforms.hasMac || platforms.hasSwitch || platforms.hasWiiU) && (
          <div className="flex items-center gap-2 mb-4">
            {platforms.hasWindows && (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center">
                <PlatformIcon platform="windows" size={18} />
              </div>
            )}
            {platforms.hasLinux && (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center">
                <PlatformIcon platform="linux" size={18} />
              </div>
            )}
            {platforms.hasMac && (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center">
                <PlatformIcon platform="apple" size={18} />
              </div>
            )}
            {platforms.hasSwitch && (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center">
                <PlatformIcon platform="nintendo-switch" size={18} />
              </div>
            )}
            {platforms.hasWiiU && (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center">
                <PlatformIcon platform="wii-u" size={18} />
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <ul className="space-y-1.5 mb-4">
          {game.features.slice(0, 3).map((feature, index) => (
            <li
              key={index}
              className="text-sm text-[var(--color-text-muted)] flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center justify-between">
          {loading ? (
            <div className="w-32 h-9 bg-[var(--color-surface-hover)] rounded-lg animate-pulse" />
          ) : downloadUrl ? (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-background)] font-bold text-sm rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Download size={16} />
              <span>{t('home:hero.getRelease', { version: release?.tag_name })}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] font-medium text-sm">
              <span>{t('common:viewDownloads')}</span>
              <Download size={16} />
            </div>
          )}
          <ExternalLink size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
        </div>
      </div>
    </Link>
  )
})

export default GameCard
