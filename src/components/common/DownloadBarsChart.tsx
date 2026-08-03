import { formatNumber } from '@/utils/formatters'

export interface DownloadBar {
  label: string
  value: number
  /** The bar belonging to the hovered context is drawn at full opacity. */
  highlight?: boolean
}

interface DownloadBarsChartProps {
  title: string
  bars: DownloadBar[]
  /** Optional small caption under the title (e.g. "showing latest 8"). */
  caption?: string
}

/**
 * Compact horizontal bar chart for the "downloads by version" hover popover.
 * Single hue (the active game's accent), one bar highlighted by context,
 * value labels in text tokens (never the bar color). Bars grow in on mount
 * via the `.animate-bar-grow` utility, staggered — which replays each time
 * the popover opens.
 */
export function DownloadBarsChart({ title, bars, caption }: DownloadBarsChartProps) {
  const maxValue = bars.reduce((m, b) => Math.max(m, b.value), 0)

  return (
    <div>
      <div className="mb-2">
        <p className="text-xs font-semibold text-[var(--color-text)]">{title}</p>
        {caption && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{caption}</p>}
      </div>

      {bars.length === 0 || maxValue === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">No download data</p>
      ) : (
        <ul className="space-y-2" role="list">
          {bars.map((bar, i) => {
            const pct = Math.max((bar.value / maxValue) * 100, bar.value > 0 ? 2 : 0)
            return (
              <li key={`${bar.label}-${i}`} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={`font-mono truncate ${
                      bar.highlight ? 'text-[var(--color-text)] font-semibold' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {bar.label}
                  </span>
                  <span
                    className={`tabular-nums whitespace-nowrap ${
                      bar.highlight ? 'text-[var(--color-text)] font-semibold' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {formatNumber(bar.value)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-background)]/60">
                  <div
                    className="h-full rounded-full animate-bar-grow"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: 'var(--color-accent)',
                      opacity: bar.highlight ? 1 : 0.4,
                      animationDelay: `${i * 45}ms`,
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
