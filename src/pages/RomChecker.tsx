import { useTranslation } from 'react-i18next'
import { RomVerifier } from '@/components/downloads/RomVerifier'
import { RomDatabaseTable } from '@/components/downloads/RomDatabaseTable'
import { AlertCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BackToTools } from '@/components/tools/BackToTools'
import { useHashSpy } from '@/hooks/useHashSpy'

function RomChecker() {
  const { t } = useTranslation(['common', 'tools'])
  const [verifiedHash, setVerifiedHash] = useState<string | undefined>()
  useHashSpy(['database', 'help'])

  return (
    <div className="min-h-screen">
      {/* Hero - Centered with background effects */}
      <section className="relative pt-[var(--header-height)] pb-10 md:pb-14 bg-[var(--color-surface)]/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-[150px]" />
        </div>

        <div className="container relative z-10">
          <BackToTools />
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <Sparkles size={16} className="text-[var(--color-accent)]" />
              <span className="text-sm font-bold text-[var(--color-accent)]">
                {t('tools:badge')}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              {t('tools:romChecker.title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[var(--color-text-muted)] mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {t('tools:romChecker.subtitle')}
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed text-lg max-w-2xl mx-auto opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              {t('tools:romChecker.description')}
            </p>
          </div>
        </div>
      </section>

      {/* ROM Verification Tool + Database */}
      <section className="py-16 border-b border-[var(--color-border)]">
        <div className="container max-w-6xl">
          <RomVerifier onHashVerified={setVerifiedHash} />

          {/* Full ROM Database Table */}
          <div id="database" className="scroll-mt-20 mt-16">
            <RomDatabaseTable highlightedHash={verifiedHash} />
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section id="help" className="scroll-mt-20 py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-start gap-4 p-6 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
              <AlertCircle className="text-[var(--color-accent)] flex-shrink-0 mt-1" size={24} />
              <div className="text-left">
                <h3 className="font-display font-bold mb-2">
                  {t('tools:help.title')}
                </h3>
                <p className="text-[var(--color-text-muted)] mb-3">
                  {t('tools:help.description')}
                </p>
                <Link
                  to="/faq"
                  className="text-[var(--color-accent)] hover:underline font-medium text-sm inline-flex items-center gap-1"
                >
                  {t('tools:help.faqLink')}
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RomChecker
