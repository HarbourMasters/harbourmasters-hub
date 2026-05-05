import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'
import { getGame, GAMES } from '@/data/games'
import { useReleases } from '@/hooks/useGitHub'
import type { GameId } from '@/types/game'
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, TrendingUp, Download, Gamepad2, Calendar } from 'lucide-react'
import { formatDate, formatDownloadCount } from '@/utils/formatters'
import { parseChangelog, ChangelogContent, ParsedChangelog } from '@/utils/changelogParser'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { PlatformIcon } from '@/utils/platformIcons'
import { GameIcon } from '@/components/common/GameIcon'

function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'gameDetail'])
  const { setGameTheme, setTheme } = useTheme()

  const game = getGame(gameId || '')

  useEffect(() => {
    if (game) {
      setGameTheme(game.id)
    }

    return () => {
      setTheme('common')
    }
  }, [game, setGameTheme, setTheme])

  if (!game) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">{t('gameDetail:notFound.title')}</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          {t('gameDetail:notFound.description')}
        </p>
        <Link
          to="/downloads"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-background)] font-semibold rounded-lg"
        >
          <ArrowLeft size={20} />
          {t('gameDetail:notFound.backToDownloads')}
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden pt-[var(--header-height)]">
        <div className="absolute inset-0 opacity-30">
          <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient || 'from-[var(--color-primary)] to-[var(--color-accent)]'}`} />
          <div className="absolute inset-0 bg-[var(--color-background)]/60" />
        </div>
        <div className="container relative z-10 pt-6 pb-16">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-lg bg-[var(--color-surface)]/80 backdrop-blur border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all duration-200 hover:translate-x-[-2px]"
          >
            <ArrowLeft size={18} />
            {t('common:back')}
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Game Icon with glow */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-3xl bg-[var(--color-accent)]/20 blur-2xl scale-150" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shadow-2xl">
                <GameIcon game={game} className="w-20 h-20 md:w-28 md:h-28" />
              </div>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-3">
              {game.name}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-4">
              {game.tagline}
            </p>
            <p className="text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
              {game.description}
            </p>
          </div>
        </div>
      </section>

      {/* Latest Release */}
      <section className="py-12">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-6">{t('gameDetail:sections.latestRelease')}</h2>
          <LatestReleaseDownloads gameId={game.id} />
        </div>
      </section>

      {/* Older Versions */}
      <section className="py-12 bg-[var(--color-surface)]/50">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-6">{t('gameDetail:sections.olderVersions')}</h2>
          <OlderVersionsList gameId={game.id} repoUrl={game.links.github} />
        </div>
      </section>

      {/* Other Games */}
      <section className="py-12">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-6">{t('gameDetail:sections.otherPorts')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(GAMES)
              .filter(g => g.id !== game.id)
              .map((otherGame) => (
                <Link
                  key={otherGame.id}
                  to={`/game/${otherGame.id}`}
                  className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mb-3">
                    <GameIcon game={otherGame} className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-sm">{otherGame.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{otherGame.tagline}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}


// --- Platform detection & download helpers ---

type PlatformConfig = {
  key: string
  name: string
  iconKey: string | null
  filter: (name: string) => boolean
}

const PLATFORM_ORDER: PlatformConfig[] = [
  { key: 'windows', name: 'Windows', iconKey: 'windows', filter: (name: string) => name.toLowerCase().includes('win') || name.toLowerCase().includes('windows') },
  { key: 'linux', name: 'Linux (Steam Deck)', iconKey: 'linux', filter: (name: string) => name.toLowerCase().includes('linux') || name.toLowerCase().includes('ubuntu') },
  { key: 'mac', name: 'macOS', iconKey: 'apple', filter: (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('macos') || lower.includes('osx') || lower.includes('darwin') || lower.endsWith('.dmg')) return true
    if (/(?:^|[-_\s.])mac(?:[-_\s.]|$)/.test(lower)) return true
    return false
  }},
  { key: 'wiiu', name: 'Wii U', iconKey: 'wii-u', filter: (name: string) => (name.toLowerCase().includes('wii') && name.toLowerCase().includes('u')) || name.toLowerCase().includes('wiiu') },
  { key: 'switch', name: 'Switch', iconKey: 'nintendo-switch', filter: (name: string) => name.toLowerCase().includes('switch') },
]

function DownloadButton({ asset, platform }: { asset: any, platform: PlatformConfig }) {
  return (
    <a
      key={asset.id}
      href={asset.browser_download_url}
      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
        {platform.iconKey ? (
          <PlatformIcon platform={platform.iconKey} size={22} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
        ) : (
          <Gamepad2 size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-base truncate">{asset.name}</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {(asset.size / 1024 / 1024).toFixed(1)} MB
        </p>
      </div>
    </a>
  )
}

// --- Latest Release ---

function LatestReleaseDownloads({ gameId }: { gameId: string }) {
  const { t } = useTranslation(['common', 'gameDetail'])
  const { releases, loading, error } = useReleases(gameId as GameId)
  const [showChangelog, setShowChangelog] = useState(false)
  const [parsedChangelog, setParsedChangelog] = useState<ParsedChangelog | null>(null)
  const game = getGame(gameId)
  const repoUrl = game?.links.github || 'https://github.com/HarbourMasters/Shipwright'

  useEffect(() => {
    if (releases && releases.length > 0 && releases[0].body) {
      setParsedChangelog(parseChangelog(releases[0].body, repoUrl))
    }
  }, [releases, gameId, repoUrl])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error || !releases || releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)]">
          {error || t('gameDetail:noReleases')}
        </p>
      </div>
    )
  }

  const latestRelease = releases[0]

  const platformStats: Record<string, number> = { windows: 0, linux: 0, mac: 0, wiiu: 0, switch: 0 }
  let totalDownloads = 0

  const platformAssets: Record<string, typeof latestRelease.assets> = {
    windows: [], linux: [], mac: [], wiiu: [], switch: [], other: []
  }

  for (const asset of latestRelease.assets) {
    let placed = false
    for (const platform of PLATFORM_ORDER) {
      if (platform.filter(asset.name)) {
        platformAssets[platform.key].push(asset)
        platformStats[platform.key] += asset.download_count
        totalDownloads += asset.download_count
        placed = true
        break
      }
    }
    if (!placed) {
      platformAssets.other.push(asset)
    }
  }

  const availablePlatforms = PLATFORM_ORDER.filter(p => platformAssets[p.key].length > 0)

  return (
    <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold">{latestRelease.name || latestRelease.tag_name}</h3>
          <p className="text-base text-[var(--color-text-muted)] flex items-center gap-2">
            <Calendar size={18} />
            {formatDate(latestRelease.published_at)}
          </p>
        </div>
        <a
          href={latestRelease.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-hover)] rounded-lg text-base hover:bg-[var(--color-primary)] hover:text-[var(--color-background)] transition-colors"
        >
          <FontAwesomeIcon icon={faGithub} />
          {t('gameDetail:viewOnGitHub')}
        </a>
      </div>

      {/* Download Stats */}
      {(totalDownloads > 0 || availablePlatforms.length > 0) && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-background)]/50 border border-[var(--color-border)]">
          <div className="flex flex-wrap items-center gap-4 text-base">
            {availablePlatforms.map((platform) => {
              const count = platformStats[platform.key]
              return (
                <div key={platform.key} className="flex items-center gap-2">
                  <PlatformIcon platform={platform.iconKey || 'windows'} size={20} />
                  <span className="font-medium">{formatDownloadCount(count, '')}</span>
                </div>
              )
            })}
            {totalDownloads > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-accent)] font-bold ml-auto">
                <TrendingUp size={16} />
                <span>{formatDownloadCount(totalDownloads)} {t('gameDetail:total')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Downloads Grid */}
      <div className={`grid gap-4 ${availablePlatforms.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : availablePlatforms.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-' + availablePlatforms.length}`}>
        {availablePlatforms.map((platform) => {
          const assets = platformAssets[platform.key]
          if (assets.length === 0) return null

          return (
            <div key={platform.key} className="space-y-2">
              <p className="text-base font-semibold text-[var(--color-text-muted)] flex items-center gap-2">
                <PlatformIcon platform={platform.iconKey || 'windows'} size={16} />
                {t(`gameDetail:platforms.${platform.key}`)}
              </p>
              {assets.map((asset) => (
                <DownloadButton key={asset.id} asset={asset} platform={platform} />
              ))}
            </div>
          )
        })}

        {platformAssets.other.length > 0 && (
          <div className="space-y-2">
            <p className="text-base font-semibold text-[var(--color-text-muted)] flex items-center gap-2">
              <Gamepad2 size={16} />
              {t('gameDetail:platforms.other')}
            </p>
            {platformAssets.other.map((asset) => (
              <DownloadButton key={asset.id} asset={asset} platform={{
                iconKey: null, name: 'Other', key: 'other', filter: () => true
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Changelog */}
      {parsedChangelog && (parsedChangelog.whatsChanged.length > 0 || parsedChangelog.newContributors.length > 0) && (
        <div className="mt-6">
          <button
            onClick={() => setShowChangelog(!showChangelog)}
            className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-3"
          >
            {showChangelog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {t('gameDetail:changelog')}
          </button>
          {showChangelog && (
            <div className="p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
              <ChangelogContent parsed={parsedChangelog} repoUrl={game?.links.github || 'https://github.com/HarbourMasters/Shipwright'} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Older Versions ---

interface VersionStats {
  tag: string
  name: string
  displayName: string
  date: string
  htmlUrl: string
  body: string
  windows: number
  linux: number
  mac: number
  switch: number
  wiiu: number
  total: number
  hasAssets: boolean
}

function OlderVersionsList({ gameId, repoUrl }: { gameId: string; repoUrl: string }) {
  const { t } = useTranslation(['common', 'gameDetail'])
  const { releases, loading, error } = useReleases(gameId as GameId)
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [expandedChangelogs, setExpandedChangelogs] = useState<Set<string>>(new Set())
  const [parsedChangelogs, setParsedChangelogs] = useState<Record<string, ParsedChangelog>>({})

  const handleToggleChangelog = (tag: string, body: string) => {
    const newSet = new Set(expandedChangelogs)
    if (newSet.has(tag)) {
      newSet.delete(tag)
    } else {
      newSet.add(tag)
      if (!parsedChangelogs[tag]) {
        const game = getGame(gameId)
        const repoUrl = game?.links.github || 'https://github.com/HarbourMasters/Shipwright'
        setParsedChangelogs(prev => ({
          ...prev,
          [tag]: parseChangelog(body, repoUrl)
        }))
      }
    }
    setExpandedChangelogs(newSet)
  }

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse">
        <div className="h-8 w-48 bg-[var(--color-border)] rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[var(--color-border)] rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !releases || releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)]">
          {error || t('gameDetail:noOlderVersions')}
        </p>
      </div>
    )
  }

  const versionStats: VersionStats[] = releases.slice(1).map(release => {
    const platformDownloads: Record<string, number> = { windows: 0, linux: 0, mac: 0, wiiu: 0, switch: 0 }
    let totalDownloads = 0

    for (const asset of release.assets) {
      const lower = asset.name.toLowerCase()
      if (lower.includes('win') || lower.includes('windows')) {
        platformDownloads.windows += asset.download_count
        totalDownloads += asset.download_count
      } else if (lower.includes('linux') || lower.includes('ubuntu')) {
        platformDownloads.linux += asset.download_count
        totalDownloads += asset.download_count
      } else if (lower.includes('mac') || lower.includes('osx') || lower.includes('darwin')) {
        platformDownloads.mac += asset.download_count
        totalDownloads += asset.download_count
      } else if (lower.includes('switch')) {
        platformDownloads.switch += asset.download_count
        totalDownloads += asset.download_count
      } else if ((lower.includes('wii') && lower.includes('u')) || lower.includes('wiiu')) {
        platformDownloads.wiiu += asset.download_count
        totalDownloads += asset.download_count
      }
    }

    const displayName = release.name && release.name !== release.tag_name
      ? `${release.tag_name} - ${release.name}`
      : release.tag_name

    return {
      tag: release.tag_name,
      name: release.name,
      displayName,
      date: release.published_at,
      htmlUrl: release.html_url,
      body: release.body || '',
      windows: platformDownloads.windows,
      linux: platformDownloads.linux,
      mac: platformDownloads.mac,
      wiiu: platformDownloads.wiiu,
      switch: platformDownloads.switch,
      total: totalDownloads,
      hasAssets: release.assets.length > 0
    }
  })

  if (versionStats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)]">
          {t('gameDetail:noOlderVersions')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {versionStats.map((stat) => {
        const isExpanded = expandedVersion === stat.tag
        const release = releases.find(r => r.tag_name === stat.tag)

        return (
          <div
            key={stat.tag}
            className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedVersion(isExpanded ? null : stat.tag)}
              className="w-full p-5 flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-colors text-left"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="font-mono font-bold text-lg text-[var(--color-accent)] min-w-[150px]">
                  {stat.displayName}
                </div>

                {stat.total > 0 || stat.hasAssets ? (
                  <div className="flex items-center gap-3 text-base">
                    {(() => {
                      const allPlatforms = [
                        { key: 'windows', count: stat.windows, iconKey: 'windows' },
                        { key: 'linux', count: stat.linux, iconKey: 'linux' },
                        { key: 'mac', count: stat.mac, iconKey: 'apple' },
                        { key: 'wiiu', count: stat.wiiu, iconKey: 'wii-u' },
                        { key: 'switch', count: stat.switch, iconKey: 'nintendo-switch' }
                      ] as const
                      const hasAssets = (key: string) => {
                        if (!release?.assets) return false
                        return release.assets.some((a: any) => {
                          const lower = a.name.toLowerCase()
                          if (key === 'windows') return lower.includes('win') || lower.includes('windows')
                          if (key === 'linux') return lower.includes('linux') || lower.includes('ubuntu')
                          if (key === 'mac') return lower.includes('mac') || lower.includes('osx') || lower.includes('darwin')
                          if (key === 'switch') return lower.includes('switch')
                          if (key === 'wiiu') return (lower.includes('wii') && lower.includes('u')) || lower.includes('wiiu')
                          return false
                        })
                      }
                      const visiblePlatforms = allPlatforms.filter(p => p.count > 0 || hasAssets(p.key))

                      return visiblePlatforms.map((p) => (
                        <div key={p.key} className="flex items-center gap-1.5">
                          <PlatformIcon platform={p.iconKey} size={18} className="text-[var(--color-text-muted)]" />
                          <span className="font-medium">{formatDownloadCount(p.count)}</span>
                        </div>
                      ))
                    })()}
                    {stat.total > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-accent)] font-bold">
                        <TrendingUp size={14} />
                        <span>{formatDownloadCount(stat.total)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-base text-[var(--color-text-muted)]">
                    {t('gameDetail:noDownloadStats')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                <span className="text-sm">
                  {new Date(stat.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && release && (
              <div className="border-t border-[var(--color-border)] p-5 space-y-6">
                {/* Downloads */}
                <div>
                  <h4 className="font-semibold text-base text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
                    <Download size={16} />
                    {t('common:downloads')}
                  </h4>
                  {(() => {
                    const availablePlatforms = PLATFORM_ORDER.filter(platform =>
                      release.assets.some(a => platform.filter(a.name))
                    )
                    const platformCount = availablePlatforms.length
                    const gridClasses = platformCount <= 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : platformCount === 3
                        ? 'grid-cols-1 md:grid-cols-3'
                        : `grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(platformCount, 4)}`

                    return (
                      <div className={`grid gap-3 ${gridClasses}`}>
                        {availablePlatforms.map((platform) => {
                          const assets = release.assets.filter(a => platform.filter(a.name))
                          return (
                            <div key={platform.key} className="space-y-2">
                              <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1">
                                <PlatformIcon platform={platform.iconKey || 'windows'} size={18} />
                                {t(`gameDetail:platforms.${platform.key}`)}
                              </p>
                              {assets.map((asset) => (
                                <DownloadButton key={asset.id} asset={asset} platform={platform} />
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>

                {/* Changelog */}
                {stat.body && (
                  <div>
                    <button
                      onClick={() => handleToggleChangelog(stat.tag, stat.body)}
                      className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-3"
                    >
                      {expandedChangelogs.has(stat.tag) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {t('gameDetail:changelog')}
                    </button>
                    {expandedChangelogs.has(stat.tag) && parsedChangelogs[stat.tag] && (
                      <div className="p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
                        <ChangelogContent parsed={parsedChangelogs[stat.tag]} repoUrl={repoUrl} />
                      </div>
                    )}
                  </div>
                )}

                {/* GitHub link */}
                <a
                  href={stat.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <FontAwesomeIcon icon={faGithub} />
                  {t('gameDetail:viewOnGitHub')}
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default GameDetail
