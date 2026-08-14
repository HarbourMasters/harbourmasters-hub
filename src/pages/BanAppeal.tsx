import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Send, CheckCircle, AlertTriangle, Loader2, OctagonAlert } from 'lucide-react'

const FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSfeTOuk9tezoqyByLtn5aFQw9UT609snfWJcvPMUEDFIX1f4g/formResponse'

function BanAppeal() {
  const { t } = useTranslation('banAppeal')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await fetch(FORM_ACTION, {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      })
    } catch {
      // no-cors responses are opaque — errors here don't mean failure
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-[var(--header-height)] pb-10 md:pb-14 bg-[var(--color-surface)]/50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-[150px]" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <Shield size={16} className="text-[var(--color-accent)]" />
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

      {/* Form Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              /* Success State */
              <div className="animate-slide-up text-center p-10 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-accent)]/20">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-[var(--color-accent)]" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-3">{t('successTitle')}</h2>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{t('successMessage')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-on-scroll">
                {/* Piracy Warning */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/30">
                  <OctagonAlert size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-red-400 font-medium">
                    {t('privacyNote')}
                  </p>
                </div>

                {/* Discord Username */}
                <div className="space-y-2">
                  <label htmlFor="discord-username" className="block text-lg font-semibold text-[var(--color-text)]">
                    {t('discordUsername')} <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    id="discord-username"
                    type="text"
                    name="entry.1890403493"
                    required
                    placeholder={t('discordUsernamePlaceholder')}
                    className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50"
                  />
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-warning)]/5 border border-[var(--color-warning)]/20">
                    <AlertTriangle size={18} className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                    <p className="text-base text-[var(--color-text-muted)]">
                      {t('discordUsernameHelp')}
                      <br />
                      {t('discordUsernameHelpAlt')}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label htmlFor="reason" className="block text-lg font-semibold text-[var(--color-text)]">
                    {t('reason')} <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <textarea
                    id="reason"
                    name="entry.770856174"
                    required
                    rows={6}
                    placeholder={t('reasonPlaceholder')}
                    className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 resize-y"
                  />
                  <p className="text-base text-[var(--color-text-muted)]">
                    {t('reasonHelp')}
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white bg-[var(--color-primary)] hover:brightness-110 active:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t('submitting')}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t('submitButton')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BanAppeal
