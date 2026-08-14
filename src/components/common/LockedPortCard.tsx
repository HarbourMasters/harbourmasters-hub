import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getTheme, getGameTheme } from '@/themes'
import { GameIcon } from './GameIcon'
import type { LockedPort } from '@/data/upcomingPorts'

interface LockedPortCardProps {
  port: LockedPort
  index: number
}

/**
 * A locked placeholder for an upcoming, not-yet-released port.
 *
 * Rendered only as a sibling of the live port cards in GitHubStats — it is NOT
 * part of `GAMES`, so it never counts toward "Active Ports", never triggers a
 * GitHub fetch, and never appears on any other surface.
 */
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

export function LockedPortCard({ port, index }: LockedPortCardProps) {
  const { t } = useTranslation(['common'])
  // `getGameTheme('township')` falls back to 'common' → neutral colours.
  const cardTheme = getTheme(getGameTheme(port.id))

  const buttonRef = useRef<HTMLButtonElement>(null)
  const shakeAnim = useRef<Animation | null>(null)
  const [intensified, setIntensified] = useState(false)
  const intensifyTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => {
    shakeAnim.current?.cancel()
    window.clearTimeout(intensifyTimer.current)
  }, [])

  function handleClick() {
    const el = buttonRef.current
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (el && !reduceMotion) {
      // Cancel any in-flight shake so rapid clicks restart cleanly.
      shakeAnim.current?.cancel()
      shakeAnim.current = el.animate(SHAKE_KEYFRAMES, { duration: 500, easing: 'ease-in-out' })
    }
    setIntensified(true)
    window.clearTimeout(intensifyTimer.current)
    // ~1.5s tail of the intensified label after the 0.5s shake.
    intensifyTimer.current = window.setTimeout(() => setIntensified(false), 2000)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={`${port.name} — ${t('common:githubStats.locked')}`}
      onClick={handleClick}
      style={{
        '--card-primary': cardTheme.colors.primary,
        '--card-accent': cardTheme.colors.accent,
        animationDelay: `${index * 100}ms`,
      } as CSSProperties}
      className="group relative @container flex flex-col p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] card-hover animate-on-scroll overflow-hidden text-center cursor-pointer select-none"
    >
      {/* Logo at the usual place (mirrors PortStatCard's icon container). */}
      <div className="relative z-10 w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--card-primary)] to-[var(--card-accent)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <GameIcon game={{ id: port.id, name: port.name, icon: port.icon } as any} className="w-16 h-16" />
      </div>

      {/* Name + tagline (mirrors PortStatCard) */}
      <div className="relative z-10 mb-6">
        <h3 className="font-display font-bold text-lg mb-1">{port.name}</h3>
        <p className="text-xs text-[var(--color-text-muted)]">{port.tagline}</p>
      </div>

      {/* Spacer so the centre padlock / bottom label sit low. */}
      <div className="flex-grow" />

      {/* Chain-lock: 4 diagonal chains from each corner converging on the
          centre. Round-capped dashes read as chain links; the group breathes. */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full text-[var(--color-text-muted)]"
        >
          <g
            className="animate-chain-breathe"
            stroke="currentColor"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="8 6"
            opacity={0.5}
          >
            <line x1="0" y1="0" x2="50" y2="50" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="0" x2="50" y2="50" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="100" x2="50" y2="50" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="100" x2="50" y2="50" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>

      {/* Central padlock at the convergence point. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" aria-hidden="true">
        <Lock size={48} className="text-[var(--card-accent)] animate-lock-rattle" />
      </div>

      {/* "In Progress" label near the bottom. */}
      <div className="absolute bottom-8 left-0 right-0 px-6 z-10">
        <span
          className={`inline-flex items-center gap-1.5 font-display font-bold text-sm text-[var(--card-accent)] ${intensified ? 'animate-in-progress-intense' : 'animate-in-progress'}`}
        >
          <Lock size={12} />
          {t('common:githubStats.inProgress')}
        </span>
      </div>
    </button>
  )
}
