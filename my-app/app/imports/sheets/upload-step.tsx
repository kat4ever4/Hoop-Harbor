'use client'

import { useState } from 'react'
import { getHeaders } from '@/lib/imports/mock-actions'
import { autoMap } from '@/lib/imports/mapping'
import type { WizardState } from '@/lib/imports/types'

type Props = {
  w: WizardState
  update: (changes: Partial<WizardState>) => void
}

export function UploadStep({ w, update }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onPick(file: File | undefined) {
    setError(null)
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file. In Google Sheets: File → Download → Comma-separated values (.csv).')
      return
    }
    setLoading(true)
    try {
      const headers = await getHeaders(file)
      if (headers.length === 0) throw new Error('This file is empty.')
      // New file = start the later steps fresh, with a best-guess mapping.
      update({ file, headers, mapping: autoMap(headers), preview: null, duplicateChoices: {}, summary: null })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        Upload a CSV exported from your Google Sheet. The first row must be the column names.
      </p>

      <label
        htmlFor="csv-file"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-blue-500 hover:bg-blue-50"
      >
        <span className="font-medium text-slate-800">{w.file ? 'Choose a different file' : 'Choose a CSV file'}</span>
        <span className="text-xs text-slate-500">.csv only</span>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </label>

      {loading && <p className="text-sm text-slate-500">Reading file…</p>}

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {w.file && !error && !loading && (
        <p className="rounded-lg bg-slate-100 p-3 text-sm">
          <span className="font-medium">{w.file.name}</span> · {w.headers.length} columns found
        </p>
      )}
    </div>
  )
}