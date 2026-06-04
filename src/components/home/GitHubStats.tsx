import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, TrendingUp } from 'lucide-react'
import { GAMES } from '@/data/games'
import { PortStatCard } from '@/components/common/PortStatCard'

// Rate limiting: space out GitHub API calls
const REQUEST_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

async function rateLimitedFetch(url: string, etag?: string): Promise<{ response: Response; notModified: boolean }> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const response = await fetch(url, { headers });
  return { response, notModified: response.status === 304 };
}

interface RepoStats {
  stars: number
  forks: number
  totalDownloads: number
  latestRelease: string
  latestReleaseUrl: string
}

interface GitHubAsset {
  name: string
  browser_download_url: string
}

interface GitHubRelease {
  tag_name: string
  html_url: string
  assets: GitHubAsset[]
}

interface GameWithStats {
  id: string
  name: string
  fullName: string
  tagline: string
  description: string
  gradient: string
  githubUrl: string
  stats: RepoStats
  releaseData?: GitHubRelease
}

interface CacheData {
  stats: GameWithStats[]
  total: number
  etags: Record<string, string>
}

const CACHE_KEY = 'github_stats_cache_v3'
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

async function fetchFromGitHub(cachedData?: CacheData): Promise<CacheData> {
  const stats: GameWithStats[] = []
  let total = 0
  const newEtas: Record<string, string> = { ...cachedData?.etags }
  const cachedStats = new Map(cachedData?.stats.map(s => [s.id, s]))

  for (const [id, game] of Object.entries(GAMES)) {
    try {
      const owner = game.repo?.owner ?? 'HarbourMasters'
      const name = game.repo?.name ?? game.id
      const githubUrl = `https://github.com/${owner}/${name}`
      const repoUrl = `https://api.github.com/repos/${owner}/${name}`
      const releasesUrl = `https://api.github.com/repos/${owner}/${name}/releases`

      // Fetch repo info with ETag
      const { response: repoResponse, notModified: repoUnchanged } = await rateLimitedFetch(repoUrl, newEtas[repoUrl])

      if (repoUnchanged) {
        // Reuse cached stats for this game — no API cost
        const cached = cachedStats.get(id)
        if (cached) {
          stats.push(cached)
          total += cached.stats.totalDownloads
          continue
        }
      }

      if (!repoResponse.ok) {
        throw new Error(`GitHub API error: ${repoResponse.statusText}`)
      }

      const repoEtag = repoResponse.headers.get('ETag')
      if (repoEtag) newEtas[repoUrl] = repoEtag

      const repoData = await repoResponse.json()

      // Fetch releases with ETag
      const { response: releasesResponse } = await rateLimitedFetch(releasesUrl, newEtas[releasesUrl])

      if (!releasesResponse.ok) {
        throw new Error(`GitHub API error: ${releasesResponse.statusText}`)
      }

      const releasesEtag = releasesResponse.headers.get('ETag')
      if (releasesEtag) newEtas[releasesUrl] = releasesEtag

      const releasesData = await releasesResponse.json()

      let totalDownloads = 0
      let latestRelease = 'N/A'
      let latestReleaseUrl = githubUrl
      let releaseData: GitHubRelease | undefined = undefined

      if (Array.isArray(releasesData) && releasesData.length > 0) {
        latestRelease = releasesData[0].tag_name || game.latestVersion || 'N/A'
        latestReleaseUrl = releasesData[0].html_url || `${githubUrl}/releases/latest`

        // Store release data for download button
        releaseData = {
          tag_name: releasesData[0].tag_name,
          html_url: releasesData[0].html_url,
          assets: releasesData[0].assets || []
        }

        // Sum downloads from ALL releases (each asset's download_count is cumulative)
        for (const release of releasesData) {
          if (release.assets) {
            for (const asset of release.assets) {
              totalDownloads += asset.download_count || 0
            }
          }
        }
      }

      const gameStat: GameWithStats = {
        id,
        name: game.name,
        fullName: game.fullName,
        tagline: game.tagline ?? game.fullName ?? game.name,
        description: game.description,
        gradient: game.gradient ?? 'from-[var(--color-primary)]/30 to-[var(--color-accent)]/20',
        githubUrl,
        stats: {
          stars: repoData.stargazers_count || 0,
          forks: repoData.forks_count || 0,
          totalDownloads,
          latestRelease,
          latestReleaseUrl
        },
        releaseData
      }

      stats.push(gameStat)
      total += totalDownloads
    } catch (error) {
      console.error(`Error fetching stats for ${game.name}:`, error)
      const githubUrl = `https://github.com/${game.repo?.owner ?? 'HarbourMasters'}/${game.repo?.name ?? game.id}`
      stats.push({
        id,
        name: game.name,
        fullName: game.fullName,
        tagline: game.tagline ?? game.fullName ?? game.name,
        description: game.description,
        gradient: game.gradient ?? 'from-[var(--color-primary)]/30 to-[var(--color-accent)]/20',
        githubUrl,
        stats: {
          stars: parseInt(game.stars || '0'),
          forks: 0,
          totalDownloads: 0,
          latestRelease: game.latestVersion || 'N/A',
          latestReleaseUrl: `${githubUrl}/releases`
        }
      })
    }
  }

  return { stats, total, etags: newEtas }
}

function saveToCache(data: CacheData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.warn('Failed to save cache:', error)
  }
}

function loadFromCache(): { data: CacheData; age: number } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached)
    const age = Date.now() - parsed.timestamp

    if (age < CACHE_TTL) {
      return { data: parsed.data, age }
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    console.warn('Failed to load cache:', error)
    return null
  }
}

function loadEtasFromCache(): Record<string, string> | undefined {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return undefined
    const parsed = JSON.parse(cached)
    return parsed.data?.etags
  } catch {
    return undefined
  }
}

export function GitHubStats() {
  const { t } = useTranslation(['common'])
  const [gameStats, setGameStats] = useState<GameWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDownloads, setTotalDownloads] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      // Check cache first
      const cached = loadFromCache()

      if (cached) {
        const ageMinutes = Math.floor(cached.age / 60000)
        console.log(`Using cached GitHub stats (age: ${ageMinutes} minutes)`)

        setGameStats(cached.data.stats)
        setTotalDownloads(cached.data.total)
        setLoading(false)

        // Refresh in background if cache is getting stale (> 80% of TTL)
        if (cached.age > CACHE_TTL * 0.8) {
          fetchFromGitHub(cached.data).then(freshData => {
            saveToCache(freshData)
            setGameStats(freshData.stats)
            setTotalDownloads(freshData.total)
            console.log('Background refresh complete')
          }).catch(err => {
            console.warn('Background refresh failed:', err)
          })
        }
        return
      }

      // No cache or expired, fetch fresh data (pass any stale etags for conditional requests)
      setLoading(true)
      try {
        const staleEtas = loadEtasFromCache()
        const freshData = await fetchFromGitHub(staleEtas ? { stats: [], total: 0, etags: staleEtas } : undefined)
        saveToCache(freshData)
        setGameStats(freshData.stats)
        setTotalDownloads(freshData.total)
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`
    return num.toLocaleString()
  }

  return (
    <section className="py-20 bg-[var(--color-surface)]/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-accent)] mb-4">
            <TrendingUp size={16} />
            <span>{t('common:githubStats.liveBadge')}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('common:githubStats.title')}
          </h2>
          <p className="text-base md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
            {t('common:githubStats.subtitle')}
          </p>
        </div>

        {/* Total Stats Banner */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {gameStats.reduce((sum, g) => sum + g.stats.stars, 0).toLocaleString()}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">{t('common:githubStats.githubStars')}</div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {formatNumber(totalDownloads)}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">{t('common:githubStats.totalDownloads')}</div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {gameStats.length}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">{t('common:githubStats.activePorts')}</div>
            </div>
          </div>
        )}

        {/* Port Cards - The Main Feature */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse">
                <div className="h-20 w-20 bg-[var(--color-border)] rounded-2xl mb-4 mx-auto" />
                <div className="h-6 w-32 bg-[var(--color-border)] rounded mx-auto mb-3" />
                <div className="h-4 w-48 bg-[var(--color-border)] rounded mx-auto mb-6" />
                <div className="space-y-2">
                  <div className="h-10 w-full bg-[var(--color-border)] rounded-xl" />
                  <div className="h-10 w-full bg-[var(--color-border)] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {gameStats.map((game, index) => (
              <PortStatCard key={game.id} game={game} index={index} />
            ))}
          </div>
        )}

        {/* GitHub Org Link */}
        <div className="mt-16 text-center">
          <a
            href="https://github.com/HarbourMasters"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-primary)] font-bold text-base sm:text-lg rounded-2xl transition-all duration-300 hover:scale-105 group"
          >
            <span>{t('common:githubStats.viewAllOnGitHub')}</span>
            <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}
