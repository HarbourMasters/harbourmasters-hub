import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Search, BookOpen, Code, Shield, Rocket } from 'lucide-react'
import { DiscordWidget } from '@/components/home/DiscordWidget'

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  general: <BookOpen size={20} />,
  gettingStarted: <Rocket size={20} />,
  technical: <Code size={20} />,
  legal: <Shield size={20} />
}

function FAQ() {
  const { t } = useTranslation('faq')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const categories = [
    { id: 'general', label: t('categories.general'), questions: ['whatIs', 'whatIsLUS', 'whichGames', 'free'] },
    { id: 'gettingStarted', label: t('categories.gettingStarted'), questions: ['romRequired', 'whereToGetRom', 'controller', 'updates', 'saves'] },
    { id: 'technical', label: t('categories.technical'), questions: ['graphics', 'multiplayer', 'mods', 'bugs', 'contribute', 'translation'] },
    { id: 'legal', label: t('categories.legal'), questions: ['legal'] }
  ]

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const filterQuestions = (questions: string[]) => {
    if (!searchQuery.trim()) return questions
    return questions.filter(q => {
      const question = t(`questions.${q}.question`).toLowerCase()
      const answer = t(`questions.${q}.answer`).toLowerCase()
      return question.includes(searchQuery.toLowerCase()) ||
             answer.includes(searchQuery.toLowerCase())
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative pt-[var(--header-height)] pb-20 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
               style={{ background: 'var(--color-primary)' }} />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
               style={{ background: 'var(--color-accent)' }} />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm font-bold text-[var(--color-accent)] mb-6">
              <BookOpen size={16} />
              <span>{t('badge')}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold mb-4 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 sticky top-[var(--header-height)] z-40 backdrop-blur-lg">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-12 pr-4 py-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-[var(--color-text-muted)] mt-3 text-center">
                {t('searchResults', { count: categories.reduce((acc, cat) => acc + filterQuestions(cat.questions).length, 0) })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-12">
            {categories.map((category) => {
              const filteredQuestions = filterQuestions(category.questions)

              if (filteredQuestions.length === 0) return null

              return (
                <div key={category.id} className="animate-on-scroll">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-accent)]">
                      {categoryIcons[category.id]}
                    </div>
                    <h2 className="font-display text-2xl font-bold text-[var(--color-primary)]">
                      {category.label}
                    </h2>
                    <span className="px-2 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                      {filteredQuestions.length}
                    </span>
                  </div>

                  {/* Questions */}
                  <div className="space-y-3">
                    {filteredQuestions.map((questionKey) => {
                      const key = `${category.id}-${questionKey}`
                      const isExpanded = expandedItems.has(key)

                      return (
                        <div
                          key={key}
                          className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30 transition-colors"
                        >
                          <button
                            onClick={() => toggleExpand(key)}
                            className="w-full p-5 text-left flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-colors group"
                          >
                            <span className="font-semibold pr-4 group-hover:text-[var(--color-accent)] transition-colors">
                              {t(`questions.${questionKey}.question`)}
                            </span>
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp size={20} className="text-[var(--color-accent)] flex-shrink-0" />
                              ) : (
                                <ChevronDown size={20} className="text-[var(--color-text-muted)] flex-shrink-0" />
                              )}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-5 pb-5 pt-0 text-[var(--color-text-muted)] leading-relaxed border-t border-[var(--color-border)]">
                              <p className="pt-4">{t(`questions.${questionKey}.answer`)}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* No results */}
            {searchQuery && categories.every(c => filterQuestions(c.questions).length === 0) && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                  <Search size={32} className="text-[var(--color-text-muted)]" />
                </div>
                <p className="text-lg text-[var(--color-text-muted)] mb-2">
                  {t('noResults', { query: searchQuery })}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t('noResultsHint')}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="py-16 bg-[var(--color-surface)]/30 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4 text-center">{t('stillNeedHelp')}</h2>
            <p className="text-[var(--color-text-muted)] mb-8 text-center">
              {t('stillNeedHelpDesc')}
            </p>
            <DiscordWidget />
          </div>
        </div>
      </section>
    </div>
  )
}

export default FAQ
