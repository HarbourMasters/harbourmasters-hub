/**
 * ROM Verification Service
 * Handles N64 ROM format detection, byte swapping, and SHA-1 hashing
 */

import { GAME_DISPLAY_NAMES, lookupRomByHash } from '@/data/romDatabase'

export type RomFormat = 'big-endian' | 'byte-swapped' | 'word-swapped' | 'little-endian' | 'unknown'

export interface RomVerificationResult {
  fileName: string
  fileSize: number
  format: RomFormat
  sha1: string
  matches: RomMatch[]
}

export interface RomMatch {
  game: string
  gameDisplayName: string
  version: string
  region: string
  supported: boolean
  formats?: string[]
  specialNotes?: string
  fullName: string
}

/**
 * N64 ROM format identifiers
 * Based on ship.equipment N64 detection logic
 */
const N64_IDENTIFIERS = {
  'big-endian': [0x80, 0x37, 0x12, 0x40] as const,
  'byte-swapped': [0x37, 0x80, 0x40, 0x12] as const,
  'word-swapped': [0x12, 0x40, 0x80, 0x37] as const,
  'little-endian': [0x40, 0x12, 0x37, 0x80] as const,
}

/**
 * Detect N64 ROM format from header bytes
 */
export function detectRomFormat(buffer: Uint8Array): RomFormat {
  if (buffer.length < 4) return 'unknown'

  for (const [format, identifier] of Object.entries(N64_IDENTIFIERS)) {
    if (identifier.every((byte, i) => buffer[i] === byte)) {
      return format as RomFormat
    }
  }
  return 'unknown'
}

/**
 * Get format display name
 */
export function getFormatDisplayName(format: RomFormat): string {
  const names: Record<RomFormat, string> = {
    'big-endian': '.z64 (Big-Endian)',
    'byte-swapped': '.v64 (Byte-Swapped)',
    'word-swapped': '.n64 (Word-Swapped)',
    'little-endian': 'Little-Endian',
    'unknown': 'Unknown Format',
  }
  return names[format]
}

/**
 * Byte swap a buffer in place (for .v64 format)
 * Swaps every pair of bytes: 01 23 45 -> 10 32 54
 */
function byteSwapInPlace(buffer: Uint8Array): void {
  for (let i = 0; i < buffer.length - 1; i += 2) {
    const temp = buffer[i]
    buffer[i] = buffer[i + 1]
    buffer[i + 1] = temp
  }
}

/**
 * Word swap a buffer in place (for .n64 format)
 * Swaps every two bytes in 4-byte words: 01 23 45 67 -> 45 67 01 23
 */
function wordSwapInPlace(buffer: Uint8Array): void {
  for (let i = 0; i < buffer.length - 3; i += 4) {
    const temp0 = buffer[i]
    const temp1 = buffer[i + 1]
    buffer[i] = buffer[i + 2]
    buffer[i + 1] = buffer[i + 3]
    buffer[i + 2] = temp0
    buffer[i + 3] = temp1
  }
}

/**
 * Convert ROM to big-endian format for hashing
 * Returns a new buffer (original is not modified)
 */
export function convertToBigEndian(buffer: Uint8Array, format: RomFormat): Uint8Array {
  // Already big-endian, return a copy
  if (format === 'big-endian') {
    return new Uint8Array(buffer)
  }

  // Create a copy to modify
  const copy = new Uint8Array(buffer)

  if (format === 'byte-swapped') {
    byteSwapInPlace(copy)
  } else if (format === 'word-swapped') {
    wordSwapInPlace(copy)
  }
  // little-endian would require different handling, but N64 ROMs
  // typically use one of the above formats

  return copy
}

/**
 * Calculate SHA-1 hash using Web Crypto API
 */
export async function calculateSha1(buffer: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

/**
 * Verify a ROM file
 * Main entry point for ROM verification
 */
export async function verifyRomFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<RomVerificationResult> {
  // Read file
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // Detect format
  const format = detectRomFormat(buffer)

  // Convert to big-endian for hashing
  const bigEndianBuffer = convertToBigEndian(buffer, format)

  // Calculate SHA-1 with progress updates
  onProgress?.(50)
  const sha1 = await calculateSha1(bigEndianBuffer)
  onProgress?.(75)

  // Lookup in database
  const dbEntries = lookupRomByHash(sha1)

  // Build matches array
  const matches: RomMatch[] = dbEntries.map((entry): RomMatch => ({
    game: entry.game,
    gameDisplayName: GAME_DISPLAY_NAMES[entry.game] || entry.game,
    version: entry.version,
    region: entry.region,
    supported: entry.supported,
    formats: entry.formats,
    specialNotes: entry.specialNotes,
    fullName: entry.fullName,
  }))

  onProgress?.(100)

  return {
    fileName: file.name,
    fileSize: file.size,
    format,
    sha1,
    matches,
  }
}

/**
 * Validate if a file looks like a ROM
 * Based on file size and extension
 */
export function isValidRomFile(file: File): boolean {
  // Check file extension
  const validExtensions = ['.z64', '.n64', '.v64', '.rom', '.bin']
  const hasValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  )

  // Check file size (N64 ROMs are typically 8MB - 64MB)
  const minSize = 4 * 1024 * 1024 // 4MB minimum
  const maxSize = 128 * 1024 * 1024 // 128MB maximum
  const hasValidSize = file.size >= minSize && file.size <= maxSize

  return hasValidExtension || hasValidSize
}

/**
 * Get compatibility summary for a ROM verification result
 */
export function getCompatibilitySummary(result: RomVerificationResult): {
  supportedGames: RomMatch[]
  unsupportedGames: RomMatch[]
  hasSupported: boolean
} {
  const supportedGames = result.matches.filter(m => m.supported)
  const unsupportedGames = result.matches.filter(m => !m.supported)

  return {
    supportedGames,
    unsupportedGames,
    hasSupported: supportedGames.length > 0,
  }
}
