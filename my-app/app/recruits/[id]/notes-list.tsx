import type { Note, NoteResult } from '@/lib/notes/types'
import { NoteItem } from './note-item'

type Props = {
  notes: Note[]                       // already sorted newest first
  currentStaffId: string
  isAdmin: boolean
  updateNote: (fd: FormData) => Promise<NoteResult>
  onUpdated: (note: Note) => void
}

export function NotesList({ notes, currentStaffId, isAdmin, updateNote, onUpdated }: Props) {
  if (notes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
        No notes yet.
      </p>
    )
  }
  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li key={n.id}>
          <NoteItem
            note={n}
            canEdit={isAdmin || n.author_id === currentStaffId}   // Naman's rule: own notes, or admin
            updateNote={updateNote}
            onUpdated={onUpdated}
          />
        </li>
      ))}
    </ul>
  )
}