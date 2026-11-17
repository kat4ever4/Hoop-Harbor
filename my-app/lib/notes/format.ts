import type { Note } from './types'

export const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })

export const isEdited = (n: Note) => Date.parse(n.updated_at) > Date.parse(n.created_at)

/** Newest first: by when it happened, then by when it was written. */
export function newestFirst(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) =>
      Date.parse(b.occurred_at) - Date.parse(a.occurred_at) ||
      Date.parse(b.created_at) - Date.parse(a.created_at),
  )
}