import { PlatformIcon as PlatformIconUtil, hasPlatformIcon, getPlatformColor } from '@/utils/platformIcons'

export interface PlatformBadgeProps {
  platform: string
  size?: number
  showLabel?: boolean
  variant?: 'default' | 'compact' | 'pill' | 'combined'
  delimiter?: string
}

/**
 * Platform badge component with icon and optional label
 *
 * @example
 * <PlatformBadge platform="windows" />
 * <PlatformBadge platform="nintendo-switch" size={32} showLabel />
 * <PlatformBadge platform="steam-deck" variant="pill" />
 * <PlatformBadge platform="linux / steam-deck" variant="combined" delimiter=" / " />
 */
export function PlatformBadge({
  platform,
  size = 20,
  showLabel = false,
  variant = 'default',
  delimiter = ' / '
}: PlatformBadgeProps) {
  // Handle combined platforms like "linux / steam-deck"
  const platforms = platform.toLowerCase().split(delimiter.trim()).map(p => p.trim())

  if (variant === 'combined' && platforms.length > 1) {
    const validPlatforms = platforms.filter(p => hasPlatformIcon(p))

    if (validPlatforms.length === 0) return null

    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group">
        {validPlatforms.map((p, index) => (
          <span key={p} className="inline-flex items-center gap-1">
            <PlatformIconUtil platform={p} size={size} className="shrink-0" />
            {index < validPlatforms.length - 1 && (
              <span className="text-[var(--color-text-muted)] text-xs">/</span>
            )}
          </span>
        ))}
      </span>
    )
  }

  const singlePlatform = platforms[0]
  if (!hasPlatformIcon(singlePlatform)) {
    return null
  }

  const platformLabel = singlePlatform
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  if (variant === 'pill') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group">
        <PlatformIconUtil platform={singlePlatform} size={size} className="shrink-0" />
        {showLabel && (
          <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
            {platformLabel}
          </span>
        )}
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group">
        <PlatformIconUtil platform={singlePlatform} size={size - 4} className="shrink-0" />
      </span>
    )
  }

  // Default variant
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group">
      <PlatformIconUtil platform={singlePlatform} size={size} className="shrink-0" />
      {showLabel && (
        <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
          {platformLabel}
        </span>
      )}
    </span>
  )
}

/**
 * Platform grid component for displaying multiple platforms
 */
export function PlatformGrid({
  platforms,
  size = 24,
  variant = 'default'
}: {
  platforms: string[]
  size?: number
  variant?: 'default' | 'compact' | 'pill'
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map(platform => (
        <PlatformBadge
          key={platform}
          platform={platform}
          size={size}
          variant={variant}
          showLabel={variant !== 'compact'}
        />
      ))}
    </div>
  )
}

// Re-export PlatformIcon utility and helpers
export { PlatformIconUtil as PlatformIcon, getPlatformColor, hasPlatformIcon }
