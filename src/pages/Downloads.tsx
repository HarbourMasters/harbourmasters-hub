import { useTranslation } from 'react-i18next'
import { GitHubStats } from '@/components/home/GitHubStats'
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

function Downloads() {
  const { t } = useTranslation(['common', 'downloads', 'home'])

  return (
    <div className="min-h-screen">
      {/* Hero - Centered with background effects */}
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
                {t('downloads:badge')}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              {t('downloads:title')}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {t('downloads:subtitle')}
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed text-lg max-w-2xl mx-auto opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              {t('downloads:description')}
            </p>
          </div>
        </div>
      </section>

      {/* ROM Compatibility Link */}
      <section className="py-16 border-b border-[var(--color-border)]">
        <div className="container max-w-6xl">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
              <AlertCircle className="text-[var(--color-accent)] flex-shrink-0 mt-1" size={24} />
              <div className="text-left">
                <h3 className="font-display font-bold mb-2">
                  {t('downloads:romCheckLink.title')}
                </h3>
                <p className="text-[var(--color-text-muted)] mb-3">
                  {t('downloads:romCheckLink.description')}
                </p>
                <Link
                  to="/tools/rom-checker"
                  className="text-[var(--color-accent)] hover:underline font-medium text-sm inline-flex items-center gap-1"
                >
                  {t('downloads:romCheckLink.cta')}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Downloads */}
      <GitHubStats />

      {/* FAQ Link */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-start gap-4 p-6 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
              <AlertCircle className="text-[var(--color-accent)] flex-shrink-0 mt-1" size={24} />
              <div className="text-left">
                <h3 className="font-display font-bold mb-2">
                  {t('downloads:help.title')}
                </h3>
                <p className="text-[var(--color-text-muted)] mb-3">
                  {t('downloads:help.description')}
                </p>
                <a
                  href="/faq"
                  className="text-[var(--color-accent)] hover:underline font-medium text-sm inline-flex items-center gap-1"
                >
                  {t('downloads:help.faqLink')}
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Downloads
