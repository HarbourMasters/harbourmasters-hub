/**
 * Helper functions for ROM verification display
 * Region flags, format badges, and utility formatting
 */

import 'flag-icons/css/flag-icons.min.css'

export type RegionCode = 'NTSC-U' | 'NTSC-J' | 'PAL' | 'PAL (France)' | 'PAL (Germany)' | 'iQue' | string

export type FormatType = 'cart' | 'optical' | 'digital' | 'debug' | 'beta' | 'kiosk' | 'hotel' | 'builtin' | string

export interface RegionFlag {
  flag: string
  label: string
  flagClass: string
}

/**
 * Get region flag information (emoji, label, and flag-icons class)
 */
export function getRegionFlag(region: RegionCode): RegionFlag {
  const flagMap: Record<string, RegionFlag> = {
    'NTSC-U': { flag: '🇺🇸', label: 'USA', flagClass: 'fi fi-us' },
    'NTSC-J': { flag: '🇯🇵', label: 'Japan', flagClass: 'fi fi-jp' },
    'PAL': { flag: '🇬🇧', label: 'Europe', flagClass: 'fi fi-eu' },
    'PAL (France)': { flag: '🇫🇷', label: 'France', flagClass: 'fi fi-fr' },
    'PAL (Germany)': { flag: '🇩🇪', label: 'Germany', flagClass: 'fi fi-de' },
    'iQue': { flag: '🇨🇳', label: 'China', flagClass: 'fi fi-cn' },
  }
  return flagMap[region] || { flag: '🌐', label: region, flagClass: 'fi fi-un' }
}

/**
 * Get human-readable format badge
 */
export function getFormatBadge(format: FormatType): string {
  const badges: Record<string, string> = {
    'cart': 'Cartridge',
    'optical': 'Disc',
    'digital': 'Digital',
    'debug': 'Debug',
    'beta': 'Beta',
    'kiosk': 'Kiosk',
    'hotel': 'LodgeNet',
    'builtin': 'Built-in',
  }
  return badges[format] || format
}

/**
 * Get CSS classes for format badge styling
 */
export function getFormatColor(format: FormatType): string {
  const colors: Record<string, string> = {
    'cart': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    'optical': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    'digital': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700',
    'debug': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    'beta': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700',
    'kiosk': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-700',
    'hotel': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    'builtin': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700',
  }
  return colors[format] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format date as relative time
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff === 0) return 'Today'
  if (daysDiff === 1) return 'Yesterday'
  if (daysDiff < 7) return `${daysDiff} days ago`
  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Truncate SHA-1 hash for display
 */
export function truncateHash(hash: string, showLength: number = 16): string {
  if (hash.length <= showLength) return hash
  return hash.substring(0, showLength) + '...'
}
