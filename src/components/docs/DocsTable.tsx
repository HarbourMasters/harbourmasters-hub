import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ExternalLink, SearchX } from 'lucide-react'
import type { DocsTable } from '@/data/docs'
import type { ColumnMeta } from '@/data/docs'

interface DocsTableProps {
  table: DocsTable
  columnMeta: ColumnMeta
}

function isTrue(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v === 'true' || v === 'yes' || v === '1' || v === '✓'
}

/** Searchable, filterable rendering of one synced documentation table. */
export function DocsTable({ table, columnMeta }: DocsTableProps) {
  const { t } = useTranslation(['tools'])
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return table.rows
    return table.rows.filter(row => row.some(cell => cell.toLowerCase().includes(q)))
  }, [table, query])

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('tools:docs.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        {/* Open in Google Sheets */}
        <a
          href={table.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-background)] font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <ExternalLink size={16} />
          {t('tools:docs.openInSheets')}
        </a>
      </div>

      {/* Result count */}
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        {query
          ? t('tools:docs.showingOf', { shown: filtered.length, total: table.rowCount })
          : t('tools:docs.entries', { count: table.rowCount })}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/60">
              {table.headers.map((header, i) => (
                <th key={i} className="text-left py-3 px-3 font-semibold text-[var(--color-text-muted)] whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, r) => (
              <tr key={r} className="border-b border-[var(--color-border)] last:border-b-0 transition-colors hover:bg-[var(--color-surface)]">
                {row.map((cell, c) => (
                  <td key={c} className="py-2.5 px-3 align-top">
                    {columnMeta.boolean.has(c) ? (
                      cell === '' ? (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      ) : isTrue(cell) ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">✓</span>
                      ) : (
                        <span className="text-[var(--color-text-muted)] text-xs">–</span>
                      )
                    ) : cell === '' ? (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    ) : columnMeta.mono.has(c) ? (
                      <span className="font-mono text-xs break-all">{cell}</span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchX size={32} className="text-[var(--color-text-muted)] mb-3" />
            <p className="font-semibold mb-1">{t('tools:docs.noResults')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{t('tools:docs.noResultsHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
