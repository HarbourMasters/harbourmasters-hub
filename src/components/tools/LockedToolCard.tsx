import { useEffect, useRef } from 'react'
import { Lock, type LucideIcon } from 'lucide-react'

interface LockedToolCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  comingSoonLabel: string
  index?: number
}

const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: 'translateX(0) rotate(0deg)' },
  { transform: 'translateX(-6px) rotate(-1deg)', offset: 0.1 },
  { transform: 'translateX(6px) rotate(1deg)', offset: 0.2 },
  { transform: 'translateX(-5px) rotate(-0.8deg)', offset: 0.3 },
  { transform: 'translateX(5px) rotate(0.8deg)', offset: 0.4 },
  { transform: 'translateX(-4px)', offset: 0.5 },
  { transform: 'translateX(4px)', offset: 0.6 },
  { transform: 'translateX(-3px)', offset: 0.7 },
  { transform: 'translateX(3px)', offset: 0.8 },
  { transform: 'translateX(-1px)', offset: 0.9 },
  { transform: 'translateX(0) rotate(0deg)' },
]

/** Placeholder card for a tool that hasn't shipped yet. Never navigates. */
export function LockedToolCard({ icon: Icon, title, description, gradient, comingSoonLabel, index = 0 }: LockedToolCardProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const shakeAnim = useRef<Animation | null>(null)

  useEffect(() => () => {
    shakeAnim.current?.cancel()
  }, [])

  function handleClick() {
    const el = buttonRef.current
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (el && !reduceMotion) {
      shakeAnim.current?.cancel()
      shakeAnim.current = el.animate(SHAKE_KEYFRAMES, { duration: 500, easing: 'ease-in-out' })
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className="group relative flex flex-col p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-300 animate-slide-up text-left cursor-pointer select-none opacity-80 hover:opacity-100"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          {/* Icon Tile */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg grayscale group-hover:grayscale-0 transition-all duration-300`}>
            <Icon size={26} className="text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)]">
            <Lock size={11} />
            {comingSoonLabel}
          </span>
        </div>

        <h3 className="font-display text-lg font-bold mb-1 text-[var(--color-text-muted)]">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed flex-1 opacity-80">
          {description}
        </p>
      </div>
    </button>
  )
}
