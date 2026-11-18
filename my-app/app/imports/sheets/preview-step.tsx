'use client'

import { useEffect, useState } from 'react'
import { previewImport } from '@/lib/imports/mock-actions'
import type { PreviewRow, WizardState } from '@/lib/imports/types'

type Props = {
  w: WizardState
  update: (changes: Partial<WizardState>) => void
}

const SHOW_MAX = 50

const STATUS_STYLE: Record<PreviewRow['status'], { label: string; badge: string; row: string }> = {
  new: { label: 'New', badge: 'bg-green-100 text-green-800', row: '' },
  duplicate: { label: 'Possible duplicate', badge: 'bg-amber-100 text-amber-900', row: 'bg-amber-50' },
  error: { label: 'Error', badge: 'bg-red-100 text-red-800', row: 'bg-red-50' },
}

export function PreviewStep({ w, update }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0) // bump to retry

  // Build the preview when we arrive (or after the mapping changed, which clears it).
  useEffect(() => {
    if (w.preview || !w.file) return
    let cancelled = false
    previewImport(w.file, w.mapping)
      .then((preview) => { if (!cancelled) update({ preview }) })
      .catch(() => { if (!cancelled) setError('Could not build the preview.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.preview, w.file, attempt])

  if (error)
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        {error}
        <button onClick={() => { setError(null); setAttempt((a) => a + 1) }} className="rounded-lg border border-red-400 px-3 py-1">Try again</button>
      </div>
    )

  if (!w.preview) return <p className="text-sm text-slate-500">Checking your rows…</p>

  const { counts, rows } = w.preview
  const choose = (rowNumber: number, choice: 'skip' | 'create') =>
    update({ duplicateChoices: { ...w.duplicateChoices, [rowNumber]: choice } })

  return (
    <div className="flex flex-col gap-4">
      {/* Counts */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-green-50 p-3"><div className="text-2xl font-bold text-green-800">{counts.new}</div>new</div>
        <div className="rounded-lg bg-amber-50 p-3"><div className="text-2xl font-bold text-amber-900">{counts.duplicate}</div>possible duplicates</div>
        <div className="rounded-lg bg-red-50 p-3"><div className="text-2xl font-bold text-red-800">{counts.error}</div>errors (skipped)</div>
      </div>

      {counts.duplicate > 0 && (
        <p className="text-sm text-slate-600">Possible duplicates are skipped unless you choose <b>Create anyway</b>.</p>
      )}

      {/* Phone: the table scrolls sideways instead of squishing. */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Row</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Grad year</th>
              <th className="px-3 py-2">School</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.slice(0, SHOW_MAX).map((r) => {
              const s = STATUS_STYLE[r.status]
              const choice = w.duplicateChoices[r.rowNumber] ?? 'skip'
              return (
                <tr key={r.rowNumber} className={s.row}>
                  <td className="px-3 py-2 text-slate-500">{r.rowNumber}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>{s.label}</span>
                  </td>
                  <td className="px-3 py-2 font-medium">{r.values.first_name} {r.values.last_name}</td>
                  <td className="px-3 py-2">{r.values.graduation_year}</td>
                  <td className="px-3 py-2">{r.values.high_school}</td>
                  <td className="px-3 py-2">
                    {r.status === 'error' && <span className="text-red-800">{r.reason}</span>}
                    {r.status === 'duplicate' && r.match && (
                      <div className="flex flex-col gap-1">
                        <span>
                          Matches{' '}
                          <a href={`/recruits/${r.match.id}`} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                            {r.match.name}
                          </a>{' '}
                          ({r.match.gradYear ?? '—'}, {r.match.school ?? '—'})
                        </span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={choice === 'create'}
                            onChange={(e) => choose(r.rowNumber, e.target.checked ? 'create' : 'skip')}
                          />
                          Create anyway
                        </label>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rows.length > SHOW_MAX && (
        <p className="text-xs text-slate-500">Showing the first {SHOW_MAX} of {rows.length} rows. All rows will be imported.</p>
      )}
    </div>
  )
}

/** How many recruits Commit will actually create. */
export function willCreate(w: WizardState): number {
  if (!w.preview) return 0
  const dupsCreated = w.preview.rows.filter(
    (r) => r.status === 'duplicate' && w.duplicateChoices[r.rowNumber] === 'create',
  ).length
  return w.preview.counts.new + dupsCreated
}