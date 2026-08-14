/**
 * Format date to DD Month YYYY (e.g., "20 April 2026")
 */
export function formatDate(date: string | Date, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'en-US' ? 'en-GB' : locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSecs < 60) {
    return rtf.format(-diffSecs, 'second');
  }
  if (diffMins < 60) {
    return rtf.format(-diffMins, 'minute');
  }
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  }
  if (diffDays < 30) {
    return rtf.format(-diffDays, 'day');
  }
  if (diffMonths < 12) {
    return rtf.format(-diffMonths, 'month');
  }
  return rtf.format(-diffYears, 'year');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Strip markdown for previews
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/\*\*/g, '') // Bold
    .replace(/\*/g, '') // Italic
    .replace(/`/g, '') // Code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
    .replace(/^>\s+/gm, '') // Blockquotes
    .replace(/^[-*+]\s+/gm, '') // Lists
    .replace(/^\d+\.\s+/gm, '') // Numbered lists
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines
    .trim();
}

/**
 * Extract plain text preview from changelog
 */
export function getChangelogPreview(markdown: string, maxLength = 200): string {
  const stripped = stripMarkdown(markdown);
  return truncate(stripped, maxLength);
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number, locale = 'en-US'): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2
  });

  return `${formatter.format(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

/**
 * Full number with locale grouping (follows the browser/OS locale).
 * 0 → zeroDisplay (default '—').
 */
export function formatNumber(count: number, zeroDisplay = '—'): string {
  if (count === 0) return zeroDisplay
  return count.toLocaleString()
}

/**
 * Compact number with K/M suffix; decimal separator follows the browser locale.
 * Used only where horizontal space is tight (e.g. narrow port cards).
 * 1000 → 1K, 3200 → 3.2K (or 3,2K), 1,234,567 → 1.2M.
 */
export function formatNumberCompact(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`
  if (count >= 1000) return `${(count / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`
  return count.toLocaleString()
}

/**
 * Parse platform from asset name
 */
export function parsePlatform(assetName: string): 'windows' | 'linux' | 'mac' | 'source' | null {
  const name = assetName.toLowerCase();

  if (name.includes('windows') || name.includes('win') || name.endsWith('.exe')) {
    return 'windows';
  }
  if (name.includes('linux') || name.includes('ubuntu') || name.includes('appimage')) {
    return 'linux';
  }
  if (name.includes('mac') || name.includes('darwin') || name.includes('osx') || name.endsWith('.dmg')) {
    return 'mac';
  }
  if (name.includes('source') || name.endsWith('.tar.gz') || name.endsWith('.zip')) {
    return 'source';
  }

  return null;
}
