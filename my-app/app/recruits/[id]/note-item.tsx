'use client'

import { useState, useTransition } from 'react'
import { inputClass } from '@/lib/form-styles'
import { formatWhen, isEdited } from '@/lib/notes/format'
import type { Note, NoteResult } from '@/lib/notes/types'

type Props = {
  note: Note
  canEdit: boolean
  updateNote: (fd: FormData) => Promise<NoteResult>
  onUpdated: (note: Note) => void
}

export function NoteItem({ note, canEdit, updateNote, onUpdated }: Props) {
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(note.body)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const changed = body.trim() !== note.body
  const canSave = body.trim() !== '' && changed && !pending

  function startEdit() {
    setBody(note.body)
    setError(null)
    setEditing(true)
  }

  function save() {
    const fd = new FormData()
    fd.set('id', note.id)
    fd.set('body', body.trim())
    setError(null)
    startTransition(async () => {
      try {
        const res = await updateNote(fd)
        if (!res.ok) { setError(res.formError); return }
        onUpdated(res.note)
        setEditing(false)
      } catch {
        setError('Not saved — check your connection and try again.')
      }
    })
  }

  return (
    <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          <span className="font-semibold text-slate-700">{note.author_name}</span> · {formatWhen(note.occurred_at)}
          {isEdited(note) && (
            <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">edited</span>
          )}
        </span>
      </header>

      {editing ? (
        <div className="mt-3 space-y-3">
          <label htmlFor={`edit-${note.id}`} className="sr-only">Edit note</label>
          <textarea id={`edit-${note.id}`} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={!canSave}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300">
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={pending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 [overflow-wrap:anywhere]">{note.body}</p>
          {canEdit && (
            <button type="button" onClick={startEdit} className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
              Edit
            </button>
          )}
        </>
      )}
    </article>
  )
}