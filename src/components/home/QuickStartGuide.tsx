import { Download, FileText, Gamepad2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const stepIcons = [
  <Download size={24} />,
  <FileText size={24} />,
  <Gamepad2 size={24} />
]

const stepLinks = ['/downloads', '/faq', '/faq']

export function QuickStartGuide() {
  const { t } = useTranslation('home')
  const steps = t('quickStart.steps', { returnObjects: true }) as Array<{
    title: string
    description: string
    linkText: string
  }>

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Link
          key={index}
          to={stepLinks[index]}
          className="group block p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[var(--color-accent)]/10"
        >
          <div className="flex items-start gap-4">
            {/* Step Number */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center text-2xl font-bold text-[var(--color-accent)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-accent)]">
                  {stepIcons[index]}
                </div>
                <h3 className="font-display font-bold text-lg group-hover:text-[var(--color-accent)] transition-colors">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-2 leading-relaxed">
                {step.description}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]">
                <span>{step.linkText}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
