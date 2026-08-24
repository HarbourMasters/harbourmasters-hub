import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ArrowLeft, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import { GAMES } from '@/data/games'
import {
  isDocsGame,
  loadGameDocs,
  getColumnMeta,
  type GameDocs,
  type DocsGameId
} from '@/data/docs'
import { DocsTable } from '@/components/docs/DocsTable'
import { BackToTools } from '@/components/tools/BackToTools'
import { useTheme } from '@/hooks/useTheme'
import { formatDate } from '@/utils/formatters'

type LoadState = 'loading' | 'error' | GameDocs

function GameDocs() {
  const { gameId, tableId } = useParams<{ gameId: string; tableId?: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['common', 'tools'])
  const { setGameTheme, setTheme } = useTheme()
  const [state, setState] = useState<LoadState>('loading')

  const valid = gameId !== undefined && isDocsGame(gameId)
  const game = valid ? GAMES[gameId as DocsGameId] : undefined

  useEffect(() => {
    if (valid && game) {
      setGameTheme(game.id)
    }
    return () => {
      setTheme('common')
    }
  }, [valid, game, setGameTheme, setTheme])

  useEffect(() => {
    if (!valid || !gameId) return
    let cancelled = false
    setState('loading')
    loadGameDocs(gameId as DocsGameId)
      .then(docs => { if (!cancelled) setState(docs) })
      .catch(() => { if (!cancelled) setState('error') })
    return () => { cancelled = true }
  }, [valid, gameId])

  if (!valid || !game) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">{t('tools:docs.notFoundTitle')}</h1>
        <p className="text-[var(--color-text-muted)] mb-6">{t('tools:docs.notFoundDescription')}</p>
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-background)] font-semibold rounded-lg"
        >
          <ArrowLeft size={20} />
          {t('tools:docs.backToTools')}
        </Link>
      </div>
    )
  }

  const docs = typeof state === 'string' ? null : state
  const selectedTable = docs?.tables.find(tb => tb.id === tableId) ?? docs?.tables[0]

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero */}
      <section className="relative pt-[var(--header-height)] pb-10 bg-[var(--color-surface)]/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-[150px]" />
        </div>

        <div className="container relative z-10">
          <BackToTools />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
              <BookOpen size={16} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-[var(--color-accent)]">
                {t('tools:docs.badge')}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <img src={game.icon} alt={game.name} className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  {game.name}
                </h1>
                <p className="text-[var(--color-text-muted)]">{game.tagline}</p>
              </div>
            </div>

            <p className="text-lg text-[var(--color-text-muted)] mb-4">
              {t('tools:docs.subtitle')}
            </p>

            {docs && (
              <p className="text-sm text-[var(--color-text-muted)]">
                {t('tools:docs.lastUpdated', { date: formatDate(docs.updatedAt, i18n.language) })}
                {' · '}
                <a
                  href={`https://docs.google.com/spreadsheets/d/${docs.spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                >
                  Google Sheets
                  <ExternalLink size={12} />
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="container max-w-6xl">
          {state === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-24 text-[var(--color-text-muted)]">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm font-medium">{t('common:loading')}</span>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertTriangle size={32} className="text-[var(--color-accent)] mb-4" />
              <p className="font-semibold mb-2">{t('tools:docs.loadError')}</p>
              <button
                onClick={() => {
                  setState('loading')
                  loadGameDocs(gameId as DocsGameId)
                    .then(setState)
                    .catch(() => setState('error'))
                }}
                className="mt-4 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-background)] font-semibold text-sm"
              >
                {t('tools:docs.loadErrorCta')}
              </button>
            </div>
          )}

          {docs && selectedTable && (
            <div className="animate-fade-in" key={selectedTable.id}>
              {/* Table chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {docs.tables.map(tb => {
                  const active = tb.id === selectedTable.id
                  return (
                    <button
                      key={tb.id}
                      onClick={() => navigate(`/tools/docs/${gameId}/${tb.id}`, { replace: true })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        active
                          ? 'bg-[var(--color-primary)] text-[var(--color-background)]'
                          : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                      }`}
                    >
                      <span>{t(`tools:docs.tables.${tb.id}`)}</span>
                      <span className={`text-xs ${active ? 'opacity-80' : 'text-[var(--color-text-muted)]'}`}>
                        ({tb.rowCount})
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Table description */}
              <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-3xl">
                {t(`tools:docs.tableDescriptions.${selectedTable.id}`)}
              </p>

              <DocsTable
                table={selectedTable}
                columnMeta={getColumnMeta(gameId as DocsGameId, selectedTable)}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default GameDocs
