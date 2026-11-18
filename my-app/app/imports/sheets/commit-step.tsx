'use client'

import { useState } from 'react'
import { commitImport } from '@/lib/imports/mock-actions'
import type { WizardState } from '@/lib/imports/types'
import { willCreate } from './preview-step'

type Props = {
  w: WizardState
  update: (changes: Partial<WizardState>) => void
}

export function CommitStep({ w, update }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!w.preview) return null
  const create = willCreate(w)
  const skip = w.preview.rows.length - create

  async function onCommit() {
    if (!w.preview || saving) return // saving guard = no double import on double-click
    setSaving(true)
    setError(null)
    try {
      const summary = await commitImport(w.preview, w.duplicateChoices)
      update({ summary, step: 4 })
    } catch {
      setError('Import failed. Nothing was saved. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-slate-800">
        Ready to import from <b>{w.file?.name}</b>:
      </p>
      <ul className="list-inside list-disc text-sm">
        <li><b>{create}</b> recruit{create === 1 ? '' : 's'} will be created</li>
        <li><b>{skip}</b> row{skip === 1 ? '' : 's'} will be skipped (errors and duplicates you didn’t choose)</li>
      </ul>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>
      )}

      <button
        onClick={onCommit}
        disabled={saving || create === 0}
        className="self-start rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-40"
      >
        {saving ? 'Importing…' : `Import ${create} recruit${create === 1 ? '' : 's'}`}
      </button>
      {create === 0 && <p className="text-sm text-slate-500">Nothing to import. Go back and fix the mapping or your sheet.</p>}
    </div>
  )
}