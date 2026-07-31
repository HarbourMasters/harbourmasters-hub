import React from 'react'
import { Download, Star, GitFork, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GameIcon } from './GameIcon'
import { detectOS, type DetectedOS } from '@/utils/platform'
import { getTheme, getGameTheme } from '@/themes'
import { getGame } from '@/data/games'

interface GitHubRelease {
  tag_name: string
  html_url: string
  assets: Array<{
    name: string
    browser_download_url: string
  }>
}

interface GameWithStats {
  id: string
  name: string
  fullName: string
  tagline: string
  description: string
  gradient: string
  githubUrl: string
  stats: {
    stars: number
    forks: number
    totalDownloads: number
    latestRelease: string
    latestReleaseUrl: string
  }
  releaseData?: GitHubRelease
}

interface PortStatCardProps {
  game: GameWithStats
  index: number
}

export const PortStatCard = React.memo(function PortStatCard({ game, index }: PortStatCardProps) {
  const { t } = useTranslation(['common', 'home'])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`
    return num.toLocaleString()
  }

  const userOS = detectOS()

  // Signature colour for this card: the game's explicit cardColour if set, else
  // its theme accent. Drives the hover border/glow and the icon background so
  // each port reads as a distinct colour (e.g. Starship deep blue, Lighthouse orange).
  const cardTheme = getTheme(getGameTheme(game.id))
  const cardColor = getGame(game.id)?.cardColor ?? cardTheme.colors.accent

  function getDownloadUrl(os: DetectedOS): { url: string | null; isAvailable: boolean } {
    if (!game.releaseData?.assets) {
      return { url: null, isAvailable: false }
    }

    const assets = game.releaseData.assets

    if (os === 'windows') {
      const windowsAsset = assets.find(a =>
        a.name.toLowerCase().includes('windows') ||
        a.name.toLowerCase().includes('win64') ||
        a.name.toLowerCase().endsWith('.exe')
      )
      return { url: windowsAsset?.browser_download_url || null, isAvailable: !!windowsAsset }
    } else if (os === 'linux') {
      const linuxAsset = assets.find(a =>
        a.name.toLowerCase().includes('linux') ||
        a.name.toLowerCase().includes('ubuntu') ||
        a.name.toLowerCase().endsWith('.appimage') ||
        a.name.toLowerCase().endsWith('.tar.gz')
      )
      return { url: linuxAsset?.browser_download_url || null, isAvailable: !!linuxAsset }
    } else if (os === 'macos') {
      const macAsset = assets.find(a => {
        const n = a.name.toLowerCase()
        return n.includes('macos') || n.includes('osx') || n.includes('darwin') || n.endsWith('.dmg') || /(?:^|[-_\s.])mac(?:[-_\s.]|$)/.test(n)
      })
      return { url: macAsset?.browser_download_url || null, isAvailable: !!macAsset }
    }

    return { url: null, isAvailable: false }
  }

  const { url: downloadUrl, isAvailable } = getDownloadUrl(userOS)

  // Ensure version has 'v' prefix but don't duplicate it
  const versionWithPrefix = game.stats.latestRelease.startsWith('v')
    ? game.stats.latestRelease
    : `v${game.stats.latestRelease}`

  return (
    <div
      className="group relative flex flex-col p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--card-accent)] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[var(--card-accent)]/15 animate-on-scroll"
      style={{ '--card-accent': cardColor, animationDelay: `${index * 100}ms` } as React.CSSProperties}
    >
      {/* Gradient Background Effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{ background: 'linear-gradient(135deg, oklch(from var(--card-accent) l c h / 0.25), oklch(from var(--card-accent) l c h / 0.12))' }}
      />

      {/* Game Icon */}
      <div
        className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
        style={{ background: 'linear-gradient(135deg, oklch(from var(--card-accent) l c h / 0.45), oklch(from var(--card-accent) l c h / 0.20))' }}
      >
        <GameIcon game={{ id: game.id, name: game.name, icon: game.githubUrl.includes('Shipwright') ? '/icons/games/ShipOfHarkinian.png' :
                                game.githubUrl.includes('2ship') ? '/icons/games/2Ship2Hakinian.png' :
                                game.githubUrl.includes('Ghostship') ? '/icons/games/Ghostship.png' :
                                game.githubUrl.includes('Spaghetti') ? '/icons/games/SpaghettiKart.png' :
                                game.githubUrl.includes('Starship') ? '/icons/games/Starship.png' :
                                game.githubUrl.includes('Lighthouse') ? '/icons/games/Lighthouse.png' : undefined } as any} className="w-12 h-12" />
      </div>

      {/* Game Name & Tagline */}
      <div className="text-center mb-6">
        <h3 className="font-display font-bold text-lg mb-1 group-hover:text-[var(--card-accent)] transition-colors">
          {game.name}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{game.tagline}</p>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-6 flex-grow">
        <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-[var(--color-background)]/50">
          <div className="flex items-center gap-2 text-amber-400">
            <Star size={16} />
            <span className="text-[var(--color-text-muted)]">{t('common:stars')}</span>
          </div>
          <span className="font-bold">{formatNumber(game.stats.stars)}</span>
        </div>

        <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-[var(--color-background)]/50">
          <div className="flex items-center gap-2 text-green-400">
            <Download size={16} />
            <span className="text-[var(--color-text-muted)]">{t('common:downloads')}</span>
          </div>
          <span className="font-bold">{formatNumber(game.stats.totalDownloads)}</span>
        </div>

        {game.stats.forks > 0 && (
          <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-[var(--color-background)]/50">
            <div className="flex items-center gap-2 text-blue-400">
              <GitFork size={16} />
              <span className="text-[var(--color-text-muted)]">{t('common:forks')}</span>
            </div>
            <span className="font-bold">{formatNumber(game.stats.forks)}</span>
          </div>
        )}

        {/* Latest Version */}
        {game.stats.latestRelease !== 'N/A' && (
          <div className="text-center pt-2 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)]">{t('common:latestRelease')}: </span>
            <span className="text-xs font-mono font-bold text-[var(--color-accent)]">
              {game.stats.latestRelease}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {isAvailable && downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); window.open(downloadUrl, '_blank'); }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-background)] font-bold rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Download size={18} />
            <span>{t('home:hero.getRelease', { version: versionWithPrefix })}</span>
          </a>
        ) : userOS !== 'unknown' && game.releaseData?.assets ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full py-3 px-2 bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] font-semibold rounded-xl cursor-not-allowed opacity-60 text-xs sm:text-sm text-center"
            title={t('common:notAvailableOnYourSystem', { os: t(`common:${userOS}`) })}
          >
            <Download size={18} />
            <span>{t('common:notAvailableOnYourSystem', { os: t(`common:${userOS}`) })}</span>
          </button>
        ) : (
          <a
            href={game.stats.latestReleaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-background)] font-bold rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Download size={18} />
            <span>{t('home:hero.getRelease', { version: versionWithPrefix })}</span>
          </a>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a
            href={game.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-primary)] font-semibold text-sm rounded-xl transition-all duration-300"
            title={t('common:ariaLabels.viewOnGitHub')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>

          <Link
            to={`/game/${game.id}`}
            className="flex items-center justify-center gap-1 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] font-semibold text-sm rounded-xl transition-all duration-300"
            title={t('common:ariaLabels.viewDetails')}
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
})
