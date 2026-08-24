import { useTranslation } from 'react-i18next'
import { Code, Users, Scale, Github, Sparkles } from 'lucide-react'
import { useHashSpy } from '@/hooks/useHashSpy'
import { DiscordWidget } from '@/components/home/DiscordWidget'

function About() {
  const { t } = useTranslation('about')
  useHashSpy(['whatIsHM', 'whatIsLUS', 'ourPorts', 'team', 'legal'])

  const sections = [
    {
      id: 'whatIsHM',
      icon: Users,
      title: t('whatIsHM.title'),
      content: t('whatIsHM.content')
    },
    {
      id: 'whatIsLUS',
      icon: Code,
      title: t('whatIsLUS.title'),
      content: t('whatIsLUS.content'),
      features: t('whatIsLUS.features', { returnObjects: true }) as string[]
    },
    {
      id: 'ourPorts',
      icon: Github,
      title: t('ourPorts.title'),
      intro: t('ourPorts.intro'),
      features: t('ourPorts.enhancements', { returnObjects: true }) as string[]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero - Centered with background effects */}
      <section className="relative pt-[var(--header-height)] pb-10 md:pb-14 bg-[var(--color-surface)]/50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-[150px]" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <Sparkles size={16} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-[var(--color-accent)]">
                {t('badge')}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[var(--color-text-muted)] opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-16">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.id} className="scroll-mt-20 animate-on-scroll" id={section.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <Icon className="text-[var(--color-primary)]" size={24} />
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold">
                      {section.title}
                    </h2>
                  </div>

                  <p className="text-lg text-[var(--color-text)] mb-6">
                    {section.content}
                  </p>

                  {section.intro && (
                    <p className="text-[var(--color-text-muted)] mb-6">
                      {section.intro}
                    </p>
                  )}

                  {section.features && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                        >
                          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0" />
                          <span className="text-[var(--color-text)]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="scroll-mt-20 py-16 bg-[var(--color-surface)]/50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Users className="text-[var(--color-primary)]" size={24} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                {t('team.title')}
              </h2>
            </div>

            <p className="text-lg text-[var(--color-text)] mb-8">
              {t('team.content')}
            </p>

            <DiscordWidget />
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section id="legal" className="scroll-mt-20 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                <Scale className="text-[var(--color-warning)]" size={24} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                {t('legal.title')}
              </h2>
            </div>

            <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <p className="text-[var(--color-text-muted)]">
                {t('legal.content')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
