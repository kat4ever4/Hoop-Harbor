'use client'

import { startTransition, useActionState, useRef, type FormEvent } from 'react'
import { StaffPicker } from '@/components/staff-picker'
import { inputClass } from '@/lib/form-styles'
import { NOTE_TYPES } from '@/lib/recruits/notes'
import type { StaffOption } from '@/lib/staff/types'
import { createNote, type NoteFormState } from './note-actions'

export function NoteForm({ recruitId, staff }: { recruitId: string; staff: StaffOption[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(async (previous, data) => {
    const result = await createNote(previous, data)
    if (result.saved) formRef.current?.reset()
    return result
  }, {})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => formAction(data))
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5">
      <h3 className="font-semibold">Add a note</h3>
      <input type="hidden" name="recruit_id" value={recruitId} />
      <StaffPicker staff={staff} name="author_id" label="Note author" automaticLabel="Automatic (your account)" disabled={pending} />
      <label className="text-sm font-medium">
        Note type
        <select name="note_type" className={inputClass} disabled={pending}>
          {NOTE_TYPES.map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">
        Title (optional)
        <input name="title" className={inputClass} disabled={pending} />
      </label>
      <label className="text-sm font-medium">
        Note
        <textarea name="body" rows={4} required className={inputClass} disabled={pending} />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.saved && <p role="status" className="text-sm text-green-700">Note saved.</p>}
      <button type="submit" disabled={pending || staff.length === 0}
        className="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300">
        {pending ? 'Saving…' : 'Save note'}
      </button>
    </form>
  )
}
