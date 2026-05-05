import { Link, useLocation } from 'react-router-dom'
import { Github, MessageCircle, Heart, ArrowUp, Code2, Users, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ORG_STATS } from '@/data/games'

function Footer() {
  const { t } = useTranslation(['common'])
  const location = useLocation()
  const currentYear = new Date().getFullYear()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const showCommunityHero = location.pathname === '/' || location.pathname === '/about'

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navLinks = [
    { path: '/', label: t('common:nav.home') },
    { path: '/downloads', label: t('common:nav.downloads') },
    { path: '/faq', label: t('common:nav.faq') },
    { path: '/about', label: t('common:nav.about') }
  ]

  const openSourceBadges = [
    { icon: <Code2 size={18} />, text: t('common:footer.openSource') },
    { icon: <Heart size={18} />, text: t('common:footer.communityDriven') },
    { icon: <Users size={18} />, text: t('common:footer.freeForever') }
  ]

  return (
    <footer className={`relative overflow-hidden mt-12 ${showCommunityHero ? '' : 'min-h-[400px] flex flex-col justify-center'}`}>
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)]/50 to-[var(--color-background)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-30" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/3 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[var(--color-accent)]/3 blur-[120px]" />
      </div>

      <div className={`container relative z-10 ${showCommunityHero ? 'pt-24 pb-20' : 'py-12'}`}>
        {/* Open Source Hero Section */}
        {showCommunityHero && (
        <div className="mb-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-accent)]/5 to-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 overflow-hidden">

            <div className="relative p-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-sm font-bold mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {t('common:footer.freeOpenSourceBadge')}
              </div>

              {/* Main message */}
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('common:footer.builtByCommunity').split('\n').map((line, i) => (
                  <span key={i} className={i === 0 ? 'block' : 'block gradient-text'}>{line}</span>
                ))}
              </h3>

              <p className="text-lg text-[var(--color-text-muted)] mb-8 max-w-2xl">
                Every line of code is publicly available on GitHub. Fork it, modify it, learn from it —
                it's all yours. Harbour Masters ports will never be behind a paywall.
              </p>

              {/* Open source badges */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {openSourceBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-background)]/50 border border-[var(--color-border)] text-sm font-medium"
                  >
                    <span className="text-[var(--color-accent)]">{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>

              {/* GitHub CTA */}
              <a
                href="https://github.com/HarbourMasters"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-background)] font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[var(--color-primary)]/20"
              >
                <Github size={20} />
                <span>{t('common:footer.viewSourceOnGitHub')}</span>
                <ArrowUp size={16} className="rotate-45" />
              </a>
            </div>
          </div>
        </div>
        )}

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-[var(--color-primary)]/20">
                <video
                  src="/videos/HM64.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-display text-2xl font-bold gradient-text">Harbour Masters</h4>
                <p className="text-sm text-[var(--color-text-muted)]">{t('common:footer.definitiveN64Ports')}</p>
              </div>
            </div>

            <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 max-w-md">
              {t('common:footer.nativePortsDescription').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 ? <br /> : null}</span>
              ))}
            </p>

            {/* GitHub Stats Mini */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star size={18} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">{ORG_STATS.totalStars.toLocaleString()}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{t('common:footer.githubStars')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">{ORG_STATS.totalForks.toLocaleString()}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{t('common:forks')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-display font-semibold mb-5 text-lg">{t('common:footer.quickLinks')}</h5>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300 py-2 px-3 rounded-lg hover:bg-[var(--color-surface-hover)] -mx-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/50 group-hover:bg-[var(--color-accent)] group-hover:scale-125 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform inline-block">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h5 className="font-display font-semibold mb-5 text-lg">{t('common:footer.connect')}</h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/HarbourMasters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300 py-2 px-3 rounded-lg hover:bg-[var(--color-surface-hover)] -mx-3"
                >
                  <Github size={18} className="group-hover:text-[var(--color-accent)] transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform inline-block">GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/shipofharkinian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300 py-2 px-3 rounded-lg hover:bg-[var(--color-surface-hover)] -mx-3"
                >
                  <MessageCircle size={18} className="group-hover:text-indigo-400 transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform inline-block">Discord</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t border-[var(--color-border)] ${showCommunityHero ? 'pb-4' : ''}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span>© {currentYear} Harbour Masters</span>
              <span className="text-[var(--color-border)]">•</span>
              <span className="flex items-center gap-1.5">
                {t('common:footer.madeWithLove').split('❤️').map((part, i) => (
                  <span key={i}>{part}{i === 0 && <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse inline mx-0.5" />}</span>
                ))}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://github.com/HarbourMasters"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
              >
                <Code2 size={16} />
                <span>{t('common:footer.mitLicense')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-[var(--color-background)] shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 animate-fade-in hover:shadow-[var(--color-primary)]/30"
          aria-label={t('common:ariaLabels.scrollToTop')}
        >
          <ArrowUp size={24} />
        </button>
      )}
    </footer>
  )
}

export default Footer
