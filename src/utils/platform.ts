export type DetectedOS = 'windows' | 'linux' | 'macos' | 'unknown'

export function detectOS(): DetectedOS {
  if (typeof window === 'undefined') return 'unknown'
  const ua = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform.toLowerCase()

  if (platform.includes('win') || ua.includes('windows')) {
    return 'windows'
  }
  if (platform.includes('mac') || ua.includes('mac')) {
    return 'macos'
  }
  if (platform.includes('linux') || ua.includes('linux') || ua.includes('x11')) {
    return 'linux'
  }

  return 'unknown'
}
