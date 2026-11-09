'use client'

import { useState } from 'react'
import { addNote, updateNote } from '@/lib/notes/mock-actions'   // ← the ONE line to swap later
import { newestFirst } from '@/lib/notes/format'
import type { Note } from '@/lib/notes/types'
import type { StaffOption } from '@/lib/staff/types'
import { AddNote } from './add-note'
import { NotesList } from './notes-list'

type Props = {
  recruitId: string
  initialNotes: Note[]
  staff: StaffOption[]
  currentStaffId: string
  isAdmin?: boolean
  pickAuthor: boolean
}

export function NotesClient({ recruitId, initialNotes, staff, currentStaffId, isAdmin = false, pickAuthor }: Props) {
  const [notes, setNotes] = useState(initialNotes)

  // Add a new note, or replace an edited one. Matching by id means a retry can never show twice.
  const upsert = (note: Note) => setNotes((prev) => [note, ...prev.filter((n) => n.id !== note.id)])

  return (
    <div className="space-y-4">
      <AddNote recruitId={recruitId} staff={staff} pickAuthor={pickAuthor} addNote={addNote} onSaved={upsert} />
      <NotesList
        notes={newestFirst(notes)}
        currentStaffId={currentStaffId}
        isAdmin={isAdmin}
        updateNote={updateNote}
        onUpdated={upsert}
      />
    </div>
  )
}