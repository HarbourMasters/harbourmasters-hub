/**
 * Simple className utility for conditional classes
 * A lightweight alternative to clsx or classnames
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
