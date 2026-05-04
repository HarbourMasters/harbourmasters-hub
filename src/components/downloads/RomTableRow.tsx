import { CheckCircle, XCircle, AlertTriangle, Gamepad2, Disc, Download, Bug, FlaskConical, Monitor, Building } from 'lucide-react'
import { RomDatabaseEntry } from '@/data/romDatabase'
import { getRegionFlag } from '@/utils/romHelpers'
import { cn } from '@/utils/cn'

// Format icons map
const FORMAT_ICONS: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string }> = {
  'cart': { icon: Gamepad2, label: 'Cart', color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10' },
  'optical': { icon: Disc, label: 'Disc', color: 'text-purple-500 dark:text-purple-400 bg-purple-500/10' },
  'digital': { icon: Download, label: 'Digital', color: 'text-green-500 dark:text-green-400 bg-green-500/10' },
  'debug': { icon: Bug, label: 'Debug', color: 'text-yellow-500 dark:text-yellow-400 bg-yellow-500/10' },
  'beta': { icon: FlaskConical, label: 'Beta', color: 'text-orange-500 dark:text-orange-400 bg-orange-500/10' },
  'kiosk': { icon: Monitor, label: 'Kiosk', color: 'text-pink-500 dark:text-pink-400 bg-pink-500/10' },
  'hotel': { icon: Building, label: 'LodgeNet', color: 'text-gray-500 dark:text-gray-400 bg-gray-500/10' },
}

interface RomTableRowProps {
  rom: RomDatabaseEntry
  isHighlighted: boolean
}

export function RomTableRow({ rom, isHighlighted }: RomTableRowProps) {
  const regionInfo = getRegionFlag(rom.region)
  const formatKey = rom.formats?.[0] || 'cart'
  const formatInfo = FORMAT_ICONS[formatKey] || FORMAT_ICONS['cart']

  return (
    <div className={cn(
      'rom-row flex items-center gap-3 px-4 py-3 text-sm transition-colors',
      isHighlighted && 'bg-[var(--color-primary)]/10',
      !rom.supported && 'opacity-60'
    )}>
      {/* Status Icon */}
      <div className="flex-shrink-0 w-6">
        {rom.supported ? (
          <CheckCircle size={18} className="text-green-500" />
        ) : (
          <XCircle size={18} className="text-red-400" />
        )}
      </div>

      {/* Version */}
      <div className="flex-1 min-w-0">
        <span className="font-medium block">{rom.version}</span>
        <span className="text-xs text-[var(--color-text-muted)] truncate block" title={rom.fullName}>
          {rom.fullName}
        </span>
      </div>

      {/* Region Flag */}
      <div className="flex-shrink-0">
        <span
          className={cn('fi rounded-sm shadow-sm', regionInfo.flagClass)}
          title={regionInfo.label}
        />
      </div>

      {/* Format Badge */}
      <div className="flex-shrink-0">
        <span
          className={cn(
            'p-1.5 rounded',
            formatInfo.color
          )}
          title={formatInfo.label}
        >
          <formatInfo.icon size={14} />
        </span>
      </div>

      {/* Special Notes */}
      {rom.specialNotes && (
        <div className="flex-shrink-0" title={rom.specialNotes}>
          <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
        </div>
      )}

      {/* Hash (truncated) */}
      {isHighlighted && (
        <div className="flex-shrink-0">
          <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded">
            ✓ MATCH
          </span>
        </div>
      )}
    </div>
  )
}
