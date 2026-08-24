import { useTranslation } from 'react-i18next'
import { Sparkles, FileSearch, Library, Radio, MessageSquare, Music, Wrench } from 'lucide-react'
import { GAMES } from '@/data/games'
import { DOCS_SUMMARY } from '@/data/docs'
import { GameIcon } from '@/components/common/GameIcon'
import { ToolCard } from '@/components/tools/ToolCard'
import { LockedToolCard } from '@/components/tools/LockedToolCard'
import { DocsCard } from '@/components/tools/DocsCard'
import type { Game } from '@/types/game'
import type { LucideIcon } from 'lucide-react'

interface ToolsProps { }

/** Section header for a game group: icon tile + name + tagline. */
function GameSectionHeader({ game, icon: Icon }: { game: Game; icon?: LucideIcon }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg`}>
        {Icon ? <Icon size={18} className="text-white" /> : <GameIcon game={game} className="w-6 h-6" />}
      </div>
      <div>
        <h2 className="font-display text-xl font-bold">{game.name}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">{game.tagline}</p>
      </div>
    </div>
  )
}

function Tools({ }: ToolsProps) {
  const { t } = useTranslation(['common', 'tools'])

  const starship = GAMES.starship
  const soh = GAMES.shipofharkinian
  const ship2 = GAMES['2ship2harkinian']

  const docsSummary = (gameId: string) => DOCS_SUMMARY.games[gameId]
  const docsMeta = (gameId: string) => {
    const s = docsSummary(gameId)
    return s ? t('tools:landing.docsMeta', { tables: s.tableCount, entries: s.totalRows }) : ''
  }
  const gradientOf = (game: Game) => game.gradient ?? 'from-[var(--color-primary)]/60 to-[var(--color-accent)]/40'

  let cardIndex = 0

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
                {t('tools:landing.badge')}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              {t('tools:landing.title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[var(--color-text-muted)] mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {t('tools:landing.subtitle')}
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed text-lg max-w-2xl mx-auto opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              {t('tools:landing.description')}
            </p>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="container max-w-6xl space-y-16">
          {/* General */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/40 to-slate-400/30 flex items-center justify-center shadow-lg">
                <Wrench size={18} className="text-white" />
              </div>
              <h2 className="font-display text-xl font-bold">{t('tools:landing.sections.general')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ToolCard
                to="/tools/rom-checker"
                icon={FileSearch}
                title={t('tools:romChecker.title')}
                description={t('tools:romChecker.subtitle')}
                gradient="from-blue-600/60 to-indigo-400/40"
                openLabel={t('tools:landing.openTool')}
                index={cardIndex++}
              />
              <ToolCard
                to="/tools/mods"
                icon={Library}
                title={t('tools:modLibrary.title')}
                description={t('tools:modLibrary.subtitle')}
                gradient="from-emerald-600/60 to-teal-400/40"
                openLabel={t('tools:landing.openTool')}
                index={cardIndex++}
              />
            </div>
          </section>

          {/* Ship of Harkinian (2022) — docs first, then tools */}
          <section>
            <GameSectionHeader game={soh} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docsSummary('shipofharkinian') && (
                <DocsCard
                  game={soh}
                  title={t('tools:landing.docsTitle', { game: soh.name })}
                  metaLabel={docsMeta('shipofharkinian')}
                  badge={t('tools:landing.docsBadge')}
                  index={cardIndex++}
                />
              )}
              <LockedToolCard
                icon={MessageSquare}
                title={t('tools:messageEditor.title')}
                description={t('tools:messageEditor.subtitle')}
                gradient={gradientOf(soh)}
                comingSoonLabel={t('tools:landing.comingSoon')}
                index={cardIndex++}
              />
              <LockedToolCard
                icon={Music}
                title={t('tools:audioTool.title')}
                description={t('tools:audioTool.subtitle')}
                gradient={gradientOf(soh)}
                comingSoonLabel={t('tools:landing.comingSoon')}
                index={cardIndex++}
              />
            </div>
          </section>

          {/* 2ship2Harkinian (2024) — docs first, then tools */}
          <section>
            <GameSectionHeader game={ship2} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docsSummary('2ship2harkinian') && (
                <DocsCard
                  game={ship2}
                  title={t('tools:landing.docsTitle', { game: ship2.name })}
                  metaLabel={docsMeta('2ship2harkinian')}
                  badge={t('tools:landing.docsBadge')}
                  index={cardIndex++}
                />
              )}
              <LockedToolCard
                icon={Wrench}
                title={t('tools:landing.lockedToolsCard.title')}
                description={t('tools:landing.lockedToolsCard.description')}
                gradient={gradientOf(ship2)}
                comingSoonLabel={t('tools:landing.comingSoon')}
                index={cardIndex++}
              />
            </div>
          </section>

          {/* Starship (2025) — docs first, then tools */}
          <section>
            <GameSectionHeader game={starship} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docsSummary('starship') && (
                <DocsCard
                  game={starship}
                  title={t('tools:landing.docsTitle', { game: starship.name })}
                  metaLabel={docsMeta('starship')}
                  badge={t('tools:landing.docsBadge')}
                  index={cardIndex++}
                />
              )}
              <ToolCard
                to="/tools/radio-editor"
                icon={Radio}
                title={t('tools:landing.tools.spaceCommunication')}
                description={t('tools:landing.tools.spaceCommunicationDesc')}
                gradient={gradientOf(starship)}
                openLabel={t('tools:landing.openTool')}
                index={cardIndex++}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Tools
