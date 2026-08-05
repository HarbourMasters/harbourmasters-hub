import { Download, Monitor, Gamepad2, Globe, Zap, Settings, Shield, Heart, Github as GitHubIcon, ExternalLink, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DiscordWidget } from '@/components/home/DiscordWidget'
import { GitHubStats } from '@/components/home/GitHubStats'
import { QuickStartGuide } from '@/components/home/QuickStartGuide'
import { HeroVideo } from '@/components/common/VideoBackground'
import { GAMES } from '@/data/games'

// Types for feature/about items with icon IDs
interface FeatureItem {
  icon: string
  title: string
  description: string
}

// Feature icon mapping - uses icon IDs from translations
const featureIconMap: Record<string, React.ReactNode> = {
  'monitor': <Monitor size={32} />,
  'zap': <Zap size={32} />,
  'gamepad': <Gamepad2 size={32} />,
  'settings': <Settings size={32} />,
  'sparkles': <Sparkles size={32} />,
  'globe': <Globe size={32} />
}

// About icon mapping - uses icon IDs from translations
const aboutIconMap: Record<string, React.ReactNode> = {
  'heart': <Heart size={24} />,
  'shield': <Shield size={24} />,
  'globe': <Globe size={24} />,
  'monitor': <Monitor size={24} />
}

function Home() {
  const { t } = useTranslation(['home', 'common'])

  // Get features from translations
  const featuresList = t('home:whatWeOffer.features', { returnObjects: true }) as FeatureItem[]
  const aboutList = t('home:about.features', { returnObjects: true }) as FeatureItem[]

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative py-4 sm:py-10 md:py-14 flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto overflow-hidden">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
            <Sparkles size={16} className="text-[var(--color-accent)]" />
            <span className="text-sm font-bold text-[var(--color-accent)]">
              {t('home:hero.badge')}
            </span>
          </div>

          {/* Main Title - shown immediately (no opacity-0 entrance) so the
              preloaded poster becomes the LCP element at first paint. The
              surrounding badge/subtitle/CTAs still animate in. */}
          <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
            <HeroVideo />
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-xl lg:text-2xl text-[var(--color-text-muted)] mb-6 sm:mb-12 max-w-2xl mx-auto opacity-0 animate-slide-up" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
            {t('home:hero.subtitleAlt')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto opacity-0 animate-slide-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
            <Link
              to="/downloads"
              className="group inline-flex items-center gap-2 sm:gap-3 px-5 py-2.5 sm:px-10 sm:py-5 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-background)] font-bold text-sm sm:text-xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[var(--color-primary)]/30 hover:-translate-y-1"
            >
              <Download size={18} className="group-hover:animate-bounce-subtle" />
              <span>{t('home:hero.downloadNow')}</span>
            </Link>
            <a
              href="https://github.com/HarbourMasters"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 sm:gap-3 px-5 py-2.5 sm:px-8 sm:py-5 border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] font-bold text-sm sm:text-xl rounded-2xl transition-all duration-300 hover:bg-[var(--color-surface-hover)] hover:-translate-y-1"
            >
              <GitHubIcon size={18} className="group-hover:rotate-12 transition-transform" />
              <span>GitHub</span>
              <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
          </div>

          {/* Available Games Pills */}
          <div className="mt-10 sm:mt-16 flex flex-wrap items-center justify-center gap-2 opacity-0 animate-slide-up" style={{ animationDelay: '650ms', animationFillMode: 'both' }}>
            {Object.values(GAMES).map((game) => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="group relative px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 font-medium text-xs sm:text-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--color-accent)]/20 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                {game.icon && (
                  <img src={game.icon} alt={game.name} width={20} height={20} loading="lazy" decoding="async" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                )}
                <span className="group-hover:text-[var(--color-accent)] transition-colors">{game.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-[var(--color-surface)]/30">
        <div className="container">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t('home:whatWeOffer.title')}
            </h2>
            <p className="text-base md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
              {t('home:whatWeOffer.subtitle')}
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto stagger-children">
            {featuresList.map((feature, index: number) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors duration-300 hover:border-[var(--color-border)]/80 animate-on-scroll"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] mb-6 transition-all duration-300">
                  {'icon' in feature && typeof feature.icon === 'string'
                    ? featureIconMap[feature.icon] || <Sparkles size={32} />
                    : <Sparkles size={32} />}
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GITHUB STATS SECTION */}
      <GitHubStats />

      {/* ABOUT SECTION */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t('home:about.title')}
              </h2>
              <p className="text-base md:text-xl text-[var(--color-text-muted)]">
                {t('home:about.subtitle')}
              </p>
            </div>

            {/* About Cards */}
            <div className="grid md:grid-cols-2 gap-6 stagger-children">
              {aboutList.map((point, index: number) => (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] transition-colors duration-300 animate-on-scroll"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-accent)] transition-all duration-300">
                      {'icon' in point && typeof point.icon === 'string'
                        ? aboutIconMap[point.icon] || <Heart size={24} />
                        : <Heart size={24} />}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold mb-2">{point.title}</h3>
                      <p className="text-[var(--color-text-muted)] leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DISCORD & GAMES SECTION */}
      <section className="py-24 bg-[var(--color-surface)]/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start stagger-children">
            {/* Discord Widget */}
            <div className="animate-on-scroll min-w-0">
              <h2 className="font-display text-3xl font-bold mb-4">{t('home:community.title')}</h2>
              <p className="text-[var(--color-text-muted)] mb-8">
                {t('home:community.subtitle')}
              </p>
              <DiscordWidget />
            </div>

            {/* Quick Start Guide */}
            <div className="animate-on-scroll min-w-0">
              <h2 className="font-display text-3xl font-bold mb-4">{t('home:quickStart.title')}</h2>
              <p className="text-[var(--color-text-muted)] mb-8">
                {t('home:quickStart.subtitle')}
              </p>
              <QuickStartGuide />
            </div>
          </div>
        </div>
      </section>

      {/* LEGAL NOTICE */}
      <section className="py-16 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Shield size={24} className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-yellow-500 mb-3">
                    {t('home:legalNotice.title')}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t('home:legalNotice.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
