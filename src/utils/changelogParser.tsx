import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ParsedChangelog {
  whatsChanged: ChangelogEntry[]
  newContributors: NewContributor[]
  fullChangelogUrl: string
}

export interface ChangelogEntry {
  title: string
  author: string
  url: string
  prNumber: string
}

export interface NewContributor {
  username: string
  prUrl: string
  prNumber: string
}

/**
 * Parses GitHub release markdown to extract structured changelog data.
 * Extracts "What's Changed" PRs, "New Contributors", and the Full Changelog link.
 * Handles multiple GitHub release formats.
 */
export function parseChangelog(markdown: string, repoUrl: string): ParsedChangelog {
  const whatsChanged: ChangelogEntry[] = []
  const newContributors: NewContributor[] = []
  let fullChangelogUrl = ''

  // Extract owner/repo from URL for constructing full PR links
  const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  const owner = repoMatch?.[1] || 'HarbourMasters'
  const repo = repoMatch?.[2] || 'Shipwright'

  // Split by lines
  const lines = markdown.split('\n')
  let currentSection: 'whatsChanged' | 'newContributors' | null = null

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    // Skip empty lines
    if (!line) continue

    // Detect "What's Changed" section (case-insensitive, with/without apostrophe)
    if (line.match(/^##+\s+What'?s?\s+Changed/i)) {
      currentSection = 'whatsChanged'
      continue
    }

    // Detect "New Contributors" section
    if (line.match(/^##+\s+New\s+Contributors/i)) {
      currentSection = 'newContributors'
      continue
    }

    // Detect "Full Changelog" link (various formats)
    if (line.match(/^__?Full\s+Changelog__:?\s*/i) || line.match(/^\*\*Full\s+Changelog\*\*:/i)) {
      const urlMatch = line.match(/(https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\/compare\/[^\s\)]+)/)
      if (urlMatch) {
        fullChangelogUrl = urlMatch[1]
      } else {
        // Extract version range if URL is not present
        const versionMatch = line.match(/\d+\.\d+\.\d+\.\.\.(\d+\.\d+\.\d+)/)
        if (versionMatch) {
          fullChangelogUrl = `${repoUrl}/compare/${versionMatch[0]}`
        }
      }
      continue
    }

    // Skip lines outside our sections or that are headers
    if (!currentSection || line.startsWith('#')) {
      continue
    }

    // Remove leading list markers (-, *, •)
    line = line.replace(/^[-*•]\s*/, '').trim()

    // Parse PR entries in "What's Changed"
    if (currentSection === 'whatsChanged') {
      // Format 1: "description by @author in https://github.com/org/repo/pull/123"
      // Format 2: "description by @author in #123"
      // Format 3: "description by @author (https://github.com/org/repo/pull/123)"
      // Handle various prepositions: "in", "at", "via"

      let prMatch = line.match(/^(.+?)\s+by\s+@(\w+)(?:\s+(?:in|at|via)\s+(?:https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/)?#?(\d+))?/)

      if (prMatch) {
        const title = prMatch[1].trim()
        const author = prMatch[2]
        const prNumber = prMatch[3]
        const url = prMatch[3]
          ? `https://github.com/${owner}/${repo}/pull/${prMatch[3]}`
          : `https://github.com/${owner}/${repo}/pull/${prNumber || ''}`

        if (title && author) {
          whatsChanged.push({ title, author, url, prNumber: prNumber || '' })
        }
      }
    }

    // Parse contributor entries in "New Contributors"
    if (currentSection === 'newContributors') {
      // Format 1: "@username made their first contribution in https://github.com/org/repo/pull/123"
      // Format 2: "@username made their first contribution in #123"
      // Format 3: "@username in #123" (shortened format)

      let contribMatch = line.match(/^@(\w+)(?:\s+made their first contribution\s+(?:in|at))?\s*(?:https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/)?#?(\d+)?/)

      if (contribMatch) {
        const username = contribMatch[1]
        const prNumber = contribMatch[2]
        const prUrl = contribMatch[2]
          ? `https://github.com/${owner}/${repo}/pull/${contribMatch[2]}`
          : ''

        if (username) {
          newContributors.push({ username, prUrl, prNumber: prNumber || '' })
        }
      }
    }
  }

  return {
    whatsChanged,
    newContributors,
    fullChangelogUrl
  }
}

/**
 * Component to render the parsed changelog
 */
export function ChangelogContent({ parsed, repoUrl: _repoUrl }: { parsed: ParsedChangelog; repoUrl: string }) {
  const { t } = useTranslation(['common', 'gameDetail'])

  return (
    <div className="space-y-6">
      {/* What's Changed */}
      {parsed.whatsChanged.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg text-[var(--color-text)] mb-4">{t('common:changelog.whatsChanged')}</h4>
          <div className="space-y-2">
            {parsed.whatsChanged.map((entry, index) => (
              <div key={index} className="flex items-start gap-3 text-base leading-relaxed">
                <span className="text-[var(--color-text-muted)] shrink-0 mt-0.5">•</span>
                <div className="flex-1 min-w-0">
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                    title={entry.title}
                  >
                    {entry.title}
                  </a>
                  <span className="mx-1.5 px-1.5 py-0.5 rounded text-[var(--color-text-muted)] bg-[var(--color-surface)]/50 border border-[var(--color-border)]/50 shrink-0 text-sm font-medium">{t('common:changelog.by')}</span>
                  <a
                    href={`https://github.com/${entry.author}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 align-middle font-semibold group relative"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-primary)]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                    <img
                      src={`https://github.com/${entry.author}.png?size=64`}
                      alt={entry.author}
                      className="w-8 h-8 rounded-full opacity-80 group-hover:opacity-100 transition-opacity shrink-0 relative"
                      loading="lazy"
                    />
                    <span className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent group-hover:from-[var(--color-accent)] group-hover:to-[var(--color-primary)] transition-all duration-300">{entry.author}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Contributors */}
      {parsed.newContributors.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg text-[var(--color-text)] mb-4">
            {t('common:changelog.newContributors')}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-sm">
              {parsed.newContributors.length}
            </span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {parsed.newContributors.map((contributor, index) => (
              <a
                key={index}
                href={`https://github.com/${contributor.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <img
                  src={`https://github.com/${contributor.username}.png?size=64`}
                  alt={contributor.username}
                  className="w-8 h-8 rounded-full shrink-0 relative"
                  loading="lazy"
                />
                <span className="font-semibold relative bg-gradient-to-r from-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent group-hover:from-[var(--color-accent)] group-hover:to-[var(--color-primary)] transition-all duration-300">
                  {contributor.username}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Full Changelog Link */}
      {parsed.fullChangelogUrl && (
        <div className="pt-4 border-t border-[var(--color-border)]">
          <a
            href={parsed.fullChangelogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors font-medium"
          >
            {t('gameDetail:sections.latestRelease')}
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Fallback if nothing was parsed */}
      {parsed.whatsChanged.length === 0 && parsed.newContributors.length === 0 && (
        <p className="text-[var(--color-text-muted)] italic">
          {t('gameDetail:noChangelog')}
        </p>
      )}
    </div>
  )
}
