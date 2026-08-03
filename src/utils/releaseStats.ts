import type { GitHubRelease } from '@/types/github'

export type AssetPlatform = 'windows' | 'linux' | 'mac' | 'switch' | 'wiiu' | 'other'

export interface ReleaseDownloadSummary {
  tag: string
  total: number
  windows: number
  linux: number
  mac: number
  switch: number
  wiiu: number
}

const PLATFORM_KEYS = ['windows', 'linux', 'mac', 'switch', 'wiiu'] as const

/**
 * Classify a release asset filename into a platform bucket.
 * Mirrors the PLATFORM_ORDER logic used on the game-detail page so the chart
 * agrees with the per-platform numbers already shown inline.
 */
export function classifyAssetPlatform(name: string): AssetPlatform {
  const lower = name.toLowerCase()
  if (lower.includes('win') || lower.includes('windows')) return 'windows'
  if (lower.includes('linux') || lower.includes('ubuntu')) return 'linux'
  if (
    lower.includes('macos') ||
    lower.includes('osx') ||
    lower.includes('darwin') ||
    lower.endsWith('.dmg') ||
    /(?:^|[-_\s.])mac(?:[-_\s.]|$)/.test(lower)
  ) {
    return 'mac'
  }
  if ((lower.includes('wii') && lower.includes('u')) || lower.includes('wiiu')) return 'wiiu'
  if (lower.includes('switch')) return 'switch'
  return 'other'
}

/**
 * Sum a release's asset download_count per platform + total.
 * Used to build the "downloads by version" matrix for the hover chart —
 * all values are the current cumulative totals GitHub reports.
 */
export function summarizeReleaseDownloads(release: GitHubRelease): ReleaseDownloadSummary {
  const summary: ReleaseDownloadSummary = {
    tag: release.tag_name,
    total: 0,
    windows: 0,
    linux: 0,
    mac: 0,
    switch: 0,
    wiiu: 0,
  }

  for (const asset of release.assets) {
    const platform = classifyAssetPlatform(asset.name)
    const count = asset.download_count
    summary.total += count
    if (platform !== 'other') {
      summary[platform] += count
    }
  }

  return summary
}

/** Read a platform's count off a summary by key (0 for the synthetic 'other'). */
export function platformCount(summary: ReleaseDownloadSummary, platform: AssetPlatform): number {
  if (platform === 'other') return summary.total - (summary.windows + summary.linux + summary.mac + summary.switch + summary.wiiu)
  return summary[platform]
}

/** The platform keys that have at least one download across the given summaries. */
export function platformsInUse(summaries: ReleaseDownloadSummary[]): readonly AssetPlatform[] {
  const used = new Set<AssetPlatform>()
  for (const key of PLATFORM_KEYS) {
    if (summaries.some(s => s[key] > 0)) used.add(key)
  }
  return [...used]
}

export interface VersionBar {
  label: string
  value: number
  highlight: boolean
}

/**
 * Build the bar rows for the "downloads by version" hover chart.
 * - `os` omitted → each release's total; otherwise that release's total for the OS.
 * - The highlighted release's bar is always included (even when it falls beyond
 *   `limit`), swapping out the oldest shown entry so the popover stays compact.
 * `matrix` is assumed latest-first (the order GitHub returns releases).
 */
export function buildVersionBars(
  matrix: ReleaseDownloadSummary[],
  { os, highlightTag, limit = 8 }: { os?: AssetPlatform; highlightTag: string; limit?: number }
): VersionBar[] {
  const rows = matrix.map(s => ({
    label: s.tag,
    value: os ? platformCount(s, os) : s.total,
  }))

  const hasHighlight = rows.some(r => r.label === highlightTag)
  const capped = rows.slice(0, limit)
  if (!hasHighlight) {
    const highlighted = rows.find(r => r.label === highlightTag)
    if (highlighted && capped.length > 0) {
      capped[capped.length - 1] = highlighted
    }
  }

  return capped.map(r => ({ ...r, highlight: r.label === highlightTag }))
}
