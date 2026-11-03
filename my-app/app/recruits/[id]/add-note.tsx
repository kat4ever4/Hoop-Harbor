'use client'

import { useRef, useState, useTransition } from 'react'
import { StaffPicker } from '@/components/staff-picker'
import { StarRating } from '@/components/star-rating'
import { inputClass } from '@/lib/form-styles'
import { newRequestId } from '@/lib/notes/request-id'
import type { Note, NoteResult } from '@/lib/notes/types'
import type { StaffOption } from '@/lib/staff/types'

type Props = {
  recruitId: string
  staff: StaffOption[]
  pickAuthor: boolean                 // Naman's Q2: show the "Entered by" picker?
  addNote: (fd: FormData) => Promise<NoteResult>
  onSaved: (note: Note) => void
}

export function AddNote({ recruitId, staff, pickAuthor, addNote, onSaved }: Props) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [staffId, setStaffId] = useState('')
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const requestId = useRef<string | null>(null)   // the draft's receipt number
  const textRef = useRef<HTMLTextAreaElement>(null)

  const canSave = body.trim() !== '' && (!pickAuthor || staffId !== '') && !pending

  function openComposer() {
    setOpen(true)
    requestAnimationFrame(() => {
      textRef.current?.focus()
      textRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }

  function reset() {
    setBody('')
    setRating(null)
    setFailed(false)
    setError(null)
    requestId.current = null                      // next draft gets a new receipt
    setOpen(false)
  }

  function save() {
    requestId.current ??= newRequestId()          // made once per draft, reused on Retry
    const fd = new FormData()
    fd.set('recruit_id', recruitId)
    if (pickAuthor) fd.set('author_id', staffId)
    fd.set('body', body.trim())
    if (rating) fd.set('rating', String(rating))
    fd.set('client_request_id', requestId.current)

    setFailed(false)
    setError(null)
    startTransition(async () => {
      try {
        const res = await addNote(fd)
        if (!res.ok) { setFailed(true); setError(res.formError); return }
        onSaved(res.note)
        reset()                                   // keeps the chosen staff name for the next note
      } catch {
        setFailed(true)                           // offline: text stays in the box
      }
    })
  }

  return (
    <>
      {open && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label htmlFor="new-note" className="text-sm font-medium text-slate-700">Note</label>
          <textarea
            id="new-note"
            ref={textRef}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you see?"
            className={inputClass}
          />
          <StarRating value={rating} onChange={setRating} />
          {pickAuthor && <StaffPicker staff={staff} name="author_id" value={staffId} onChange={setStaffId} />}

          {failed && (
            <div role="alert" className="flex flex-wrap items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              <span>Not saved{error ? `: ${error}` : ''} —</span>
              <button type="button" onClick={save} disabled={!canSave} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={!canSave}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300">
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={reset} disabled={pending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!open && (
        // Phones: pinned to the bottom like a chat bar. sm and up: a normal button.
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <button type="button" onClick={openComposer}
            className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 sm:w-auto sm:px-5 sm:py-2">
            + Add note
          </button>
        </div>
      )}
    </>
  )
}