'use client'

import Link from 'next/link'
import { useState } from 'react'
import { undoImport } from '@/lib/imports/mock-actions'
import { skippedCsv, skippedRows } from '@/lib/imports/skipped-csv'
import type { WizardState } from '@/lib/imports/types'

type Props = {
  w: WizardState
  onStartOver: () => void
}

export function SummaryStep({ w, onStartOver }: Props) {
  const [undoState, setUndoState] = useState<'idle' | 'confirm' | 'working' | 'done' | 'failed'>('idle')
  if (!w.summary || !w.preview) return null

  const { created, skipped, errors } = w.summary
  const skippedList = skippedRows(w.preview.rows, w.duplicateChoices)

  function download() {
    const blob = new Blob([skippedCsv(skippedList)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skipped-rows-${(w.file?.name ?? 'import').replace(/\.csv$/i, '')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function undo() {
    if (!w.summary) return
    setUndoState('working')
    try {
      await undoImport(w.summary.batchId)
      setUndoState('done')
    } catch {
      setUndoState('failed')
    }
  }

  if (undoState === 'done')
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="rounded-lg border border-slate-300 bg-slate-50 p-4 text-slate-800">
          Import undone. The {created} recruit{created === 1 ? '' : 's'} from <b>{w.file?.name}</b> were removed.
        </p>
        <button onClick={onStartOver} className="self-start rounded-lg bg-blue-600 px-4 py-2 text-white">Import a file</button>
      </div>
    )

  return (
    <div className="flex flex-col gap-5">
      <p role="status" className="rounded-lg border border-green-300 bg-green-50 p-4 font-medium text-green-900">
        Import complete. {created} recruit{created === 1 ? '' : 's'} added from {w.file?.name}.
      </p>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-green-50 p-3"><div className="text-2xl font-bold text-green-800">{created}</div>created</div>
        <div className="rounded-lg bg-amber-50 p-3"><div className="text-2xl font-bold text-amber-900">{skipped}</div>duplicates skipped</div>
        <div className="rounded-lg bg-red-50 p-3"><div className="text-2xl font-bold text-red-800">{errors}</div>errors skipped</div>
      </div>

      {/* Phone: buttons stack full width. Wider: one row. */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/recruits" className="rounded-lg bg-blue-600 px-4 py-2 text-center text-white">View roster</Link>
        {skippedList.length > 0 && (
          <button onClick={download} className="rounded-lg border border-slate-300 px-4 py-2">
            Download skipped rows (CSV)
          </button>
        )}
        <button onClick={onStartOver} className="rounded-lg border border-slate-300 px-4 py-2">Import another file</button>
      </div>

      {/* Undo: the only way to remove recruits in Hoop Harbor (no delete button). */}
      <div className="border-t border-slate-200 pt-4">
        {undoState === 'idle' && (
          <button onClick={() => setUndoState('confirm')} className="text-sm text-red-700 underline">
            Undo this import
          </button>
        )}
        {undoState === 'confirm' && (
          <div role="alert" className="flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            Remove all {created} recruit{created === 1 ? '' : 's'} added by this import? Notes added to them since will be lost too.
            <div className="flex gap-3">
              <button onClick={undo} className="rounded-lg bg-red-600 px-4 py-2 text-white">Yes, undo import</button>
              <button onClick={() => setUndoState('idle')} className="rounded-lg border border-slate-300 bg-white px-4 py-2">Cancel</button>
            </div>
          </div>
        )}
        {undoState === 'working' && <p className="text-sm text-slate-500">Undoing…</p>}
        {undoState === 'failed' && (
          <p role="alert" className="text-sm text-red-800">
            Couldn’t undo. Nothing was removed.{' '}
            <button onClick={undo} className="underline">Try again</button>
          </p>
        )}
      </div>
    </div>
  )
}