// Matches Naman's recruit_notes, plus rating (pending his answer).
export type Note = {
  id: string
  recruit_id: string
  author_id: string          // staff_members.id
  author_name: string        // staff_members.display_name
  body: string
  occurred_at: string
  created_at: string
  updated_at: string         // later than created_at → show "edited"
}

/** What every save function returns. The saved note comes back so the list can show it. */
export type NoteResult = { ok: true; note: Note } | { ok: false; formError: string }