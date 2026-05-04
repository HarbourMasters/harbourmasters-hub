import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReleases } from '@/hooks/useGitHub'
import type { GameId } from '@/types/game'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import ReactMarkdown from 'react-markdown'

interface ChangelogViewerProps {
  gameId: string
}

function ChangelogViewer({ gameId }: ChangelogViewerProps) {
  const { t } = useTranslation('gameDetail')
  const { releases, loading, error } = useReleases(gameId as GameId)
  const [expandedReleases, setExpandedReleases] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedReleases(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-40 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-error)]">{error}</p>
      </div>
    )
  }

  if (!releases || releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)]">{t('noReleasesYet')}</p>
      </div>
    )
  }

  // Expand the first release by default
  if (expandedReleases.size === 0 && releases.length > 0) {
    setExpandedReleases(new Set([releases[0].id.toString()]))
  }

  return (
    <div className="space-y-4">
      {releases.map((release, index) => {
        const isExpanded = expandedReleases.has(release.id.toString())
        const isLatest = index === 0

        return (
          <div
            key={release.id}
            className={`border rounded-lg overflow-hidden transition-all ${
              isLatest
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]'
            }`}
          >
            {/* Header */}
            <button
              onClick={() => toggleExpand(release.id.toString())}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {isLatest && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-accent)] text-[var(--color-background)] rounded-full">
                      {t('latest')}
                    </span>
                  )}
                  <h3 className="font-display font-bold">
                    {release.name || release.tag_name}
                  </h3>
                  <span className="text-sm text-[var(--color-text-muted)] font-mono">
                    {release.tag_name}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {formatDate(release.published_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {release.assets.length > 0 && (
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {release.assets.reduce((sum, a) => sum + a.download_count, 0).toLocaleString()} {t('downloads')}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp size={20} className="text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronDown size={20} className="text-[var(--color-text-muted)]" />
                )}
              </div>
            </button>

            {/* Content */}
            {isExpanded && (
              <div className="px-6 pb-6 border-t border-[var(--color-border)]">
                <div className="pt-4 prose prose-invert max-w-none prose-sm">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h2 className="font-display text-xl font-bold mt-6 mb-3" {...props} />,
                      h2: ({ node, ...props }) => <h3 className="font-display text-lg font-bold mt-5 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h4 className="font-semibold text-base mt-4 mb-2" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-3" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-3" {...props} />,
                      li: ({ node, ...props }) => <li className="text-[var(--color-text)]" {...props} />,
                      p: ({ node, ...props }) => <p className="text-[var(--color-text)] my-2" {...props} />,
                      a: ({ node, ...props }) => (
                        <a className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                      ),
                      code: ({ node, inline, ...props }: any) =>
                        inline ? (
                          <code className="px-1.5 py-0.5 rounded bg-[var(--color-background)] text-sm" {...props} />
                        ) : (
                          <code className="block p-3 rounded-lg bg-[var(--color-background)] text-sm overflow-x-auto" {...props} />
                        ),
                      strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                    }}
                  >
                    {release.body || t('noChangelog')}
                  </ReactMarkdown>
                </div>

                {/* Download Links */}
                {release.assets.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                    <p className="text-sm font-medium mb-3">{t('changelog')}</p>
                    <div className="flex flex-wrap gap-2">
                      {release.assets.map((asset) => (
                        <a
                          key={asset.id}
                          href={asset.browser_download_url}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-background)] rounded-lg text-sm font-medium transition-colors"
                        >
                          {t('downloadFile')}
                          <span className="opacity-75">({asset.name})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ChangelogViewer
