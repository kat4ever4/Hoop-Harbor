// Builds the "Download skipped rows" file from the preview, in the browser.
// No backend needed: the preview already knows which rows were skipped and why.
import type { PreviewRow } from './types'

/** Quote a cell if it has a comma, quote, or newline (standard CSV rules). */
function cell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Rows that were NOT imported: every error, plus duplicates the coach left on "skip". */
export function skippedRows(rows: PreviewRow[], duplicateChoices: Record<number, 'skip' | 'create'>): PreviewRow[] {
  return rows.filter(
    (r) => r.status === 'error' || (r.status === 'duplicate' && duplicateChoices[r.rowNumber] !== 'create'),
  )
}

/** CSV text: sheet row number, reason, then every mapped field. */
export function skippedCsv(rows: PreviewRow[]): string {
  const fields = [...new Set(rows.flatMap((r) => Object.keys(r.values)))]
  const header = ['sheet_row', 'reason', ...fields]
  const lines = rows.map((r) =>
    [String(r.rowNumber), r.reason ?? '', ...fields.map((f) => r.values[f] ?? '')].map(cell).join(','),
  )
  return [header.join(','), ...lines].join('\n')
}