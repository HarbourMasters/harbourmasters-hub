import { useTranslation } from 'react-i18next'
import { GAMES } from '@/data/games'
import { fetchModCount } from '@/utils/gamebanana'
import { ExternalLink, Sparkles, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

type ModCountState = { count: number } | 'loading' | 'error'

function ModLibrary() {
  const { t } = useTranslation(['common', 'tools'])
  const games = Object.values(GAMES)
  const [modCounts, setModCounts] = useState<Record<string, ModCountState>>({})

  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, ModCountState> = {}
      for (const game of games) {
        if (game.gamebanana) {
          counts[game.id] = 'loading'
        }
      }
      setModCounts(counts)

      await Promise.allSettled(
        games
          .filter(g => g.gamebanana)
          .map(async (game) => {
            try {
              const count = await fetchModCount(game.gamebanana!.gameId)
              setModCounts(prev => ({ ...prev, [game.id]: { count } }))
            } catch {
              setModCounts(prev => ({ ...prev, [game.id]: 'error' }))
            }
          })
      )
    }

    loadCounts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-[var(--header-height)] pb-10 md:pb-14 bg-[var(--color-surface)]/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-[150px]" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <Sparkles size={16} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-[var(--color-accent)]">
                {t('tools:modLibrary.badge')}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              {t('tools:modLibrary.title')}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {t('tools:modLibrary.subtitle')}
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed text-lg max-w-2xl mx-auto opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              {t('tools:modLibrary.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Game Cards Grid */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => {
              const gb = game.gamebanana
              if (!gb) return null

              const modState = modCounts[game.id]

              return (
                <div
                  key={game.id}
                  className={`group relative flex flex-col p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[var(--color-accent)]/15 animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

                  <div className="relative z-10">
                    {/* Game Icon + Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        {game.icon && (
                          <img
                            src={game.icon}
                            alt={game.name}
                            className="w-8 h-8"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold group-hover:text-[var(--color-accent)] transition-colors">
                          {game.name}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {game.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Mod Count */}
                    <div className="mb-4 py-3 px-4 rounded-xl bg-[var(--color-surface-hover)]">
                      {modState === 'loading' && (
                        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">{t('tools:modLibrary.loadingMods')}</span>
                        </div>
                      )}
                      {modState === 'error' && (
                        <span className="text-sm text-red-400">{t('tools:modLibrary.errorLoading')}</span>
                      )}
                      {typeof modState === 'object' && (
                        <span className="text-sm font-medium text-[var(--color-accent)]">
                          {t('tools:modLibrary.totalMods', { count: modState.count })}
                        </span>
                      )}
                    </div>

                    {/* GameBanana Link */}
                    <a
                      href={gb.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-background)] font-semibold text-sm hover:opacity-90 transition-opacity w-full justify-center"
                    >
                      <ExternalLink size={16} />
                      {typeof modState === 'object'
                        ? t('tools:modLibrary.viewAll', { count: modState.count })
                        : t('tools:modLibrary.browseMods')}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ModLibrary
