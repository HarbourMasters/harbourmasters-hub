import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

/**
 * "Back to Tools & Modding" pill shown at the top of individual tool pages,
 * mirroring the back button on the docs pages.
 */
export function BackToTools() {
  const { t } = useTranslation(['tools'])

  return (
    <div className="flex justify-start mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
      <Link
        to="/tools"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface)]/80 backdrop-blur border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium text-sm transition-all duration-200 hover:translate-x-[-2px]"
      >
        <ArrowLeft size={16} />
        {t('tools:docs.backToTools')}
      </Link>
    </div>
  )
}
