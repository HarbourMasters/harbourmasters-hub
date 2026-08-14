import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ParsedChangelog {
  whatsChanged: ChangelogEntry[]
  newContributors: NewContributor[]
  sections: ChangelogSection[]
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

// Hand-written release notes (e.g. Starship) that have no PR attributions are
// surfaced as plain labelled bullet groups instead.
export interface ChangelogSection {
  label: string
  items: string[]
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

  // Match by line shape rather than section heading, so PRs and contributors
  // are picked up no matter what the release author titled the section.
  const lines = markdown.split('\n')
  const seenPR = new Set<string>()
  const seenContributor = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) continue

    // "Full Changelog" link may sit inside a <details> block
    if (line.match(/^__?Full\s+Changelog__:?\s*/i) || line.match(/^\*\*Full\s+Changelog\*\*:/i)) {
      const urlMatch = line.match(/(https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\/compare\/[^\s\)]+)/)
      if (urlMatch) {
        fullChangelogUrl = urlMatch[1]
      } else {
        const versionMatch = line.match(/\d+\.\d+\.\d+\.\.\.(\d+\.\d+\.\d+)/)
        if (versionMatch) {
          fullChangelogUrl = `${repoUrl}/compare/${versionMatch[0]}`
        }
      }
      continue
    }

    if (/^<\/?(?:details|summary)\b/i.test(line) || line.startsWith('#')) continue

    const content = line.replace(/^[-*•]\s*/, '').trim()
    if (!content) continue

    const contribMatch = content.match(/^@([\w-]+)(?:\s+made their first contribution\s+(?:in|at))?\s*(?:https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/)?#?(\d+)?/)
    if (contribMatch) {
      const username = contribMatch[1]
      const prNumber = contribMatch[2] || ''
      if (username && !seenContributor.has(username)) {
        seenContributor.add(username)
        newContributors.push({
          username,
          prNumber,
          prUrl: prNumber ? `https://github.com/${owner}/${repo}/pull/${prNumber}` : ''
        })
      }
      continue
    }

    const prMatch = content.match(/^(.+?)\s+by\s+@([\w-]+)(?:\s+(?:in|at|via)\s+(?:https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/)?#?(\d+))?/)
    if (prMatch) {
      const title = prMatch[1].trim()
      const author = prMatch[2]
      const prNumber = prMatch[3] || ''
      const dedupeKey = prNumber || `${author}:${title}`
      if (title && author && !seenPR.has(dedupeKey)) {
        seenPR.add(dedupeKey)
        whatsChanged.push({
          title,
          author,
          prNumber,
          url: prNumber ? `https://github.com/${owner}/${repo}/pull/${prNumber}` : ''
        })
      }
    }
  }

  // Fallback for hand-written notes: if we found no PRs or contributors, lift
  // the bullet lists out of the body grouped by the heading/label above them.
  const sections: ChangelogSection[] = []
  if (whatsChanged.length === 0 && newContributors.length === 0) {
    let label = ''
    let items: string[] = []
    const flush = () => {
      if (items.length > 0) sections.push({ label, items: items })
      label = ''
      items = []
    }
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue
      if (/^<\/?(?:details|summary)\b/i.test(line)) continue
      if (/^(?:<a\b|<\/a>|<picture|<\/picture>|<img\b|<source\b|!\[)/i.test(line)) continue
      if (/^__?Full\s+Changelog__:?\s*/i.test(line) || /^\*\*Full\s+Changelog\*\*:/.test(line)) { flush(); continue }
      if (/^#+\s*Download\b/i.test(line)) { flush(); continue }

      const bullet = line.match(/^[-*•]\s+(.+)/)
      if (bullet) {
        items.push(bullet[1].trim())
        continue
      }

      flush()
      label = line.replace(/^#+\s*/, '').replace(/[:：]\s*$/, '').trim()
    }
    flush()
  }

  return {
    whatsChanged,
    newContributors,
    sections,
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

      {/* Manual notes (hand-written release bodies without PR attributions) */}
      {parsed.sections.length > 0 && (
        <div className="space-y-6">
          {parsed.sections.map((section, index) => (
            <div key={index}>
              {section.label && (
                <h4 className="font-semibold text-lg text-[var(--color-text)] mb-4">{section.label}</h4>
              )}
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-base leading-relaxed">
                    <span className="text-[var(--color-text-muted)] shrink-0 mt-0.5">•</span>
                    <span className="flex-1 min-w-0 text-[var(--color-text)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
      {parsed.whatsChanged.length === 0 && parsed.newContributors.length === 0 && parsed.sections.length === 0 && (
        <p className="text-[var(--color-text-muted)] italic">
          {t('gameDetail:noChangelog')}
        </p>
      )}
    </div>
  )
}
