import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'

interface ToolCardProps {
  to: string
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  openLabel: string
  index?: number
}

/** Card for an available in-site tool; navigates internally. */
export function ToolCard({ to, icon: Icon, title, description, gradient, openLabel, index = 0 }: ToolCardProps) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[var(--color-accent)]/15 animate-slide-up text-left"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Icon Tile */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
          <Icon size={26} className="text-white" />
        </div>

        <h3 className="font-display text-lg font-bold mb-1 group-hover:text-[var(--color-accent)] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 flex-1">
          {description}
        </p>

        {/* Open */}
        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-background)] font-semibold text-sm justify-center">
          {openLabel}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
