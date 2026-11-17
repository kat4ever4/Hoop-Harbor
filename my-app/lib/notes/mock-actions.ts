// FAKE save functions. They behave like the real server:
// a short delay, a throw when offline, validation, and no duplicate on retry.
// Replaced by Naman's real functions later (see Step 7).
import { MOCK_STAFF } from '@/lib/staff/mock'
import { CURRENT_STAFF_ID, MOCK_NOTES } from './mock-data'
import type { Note, NoteResult } from './types'

const notes = new Map<string, Note>(MOCK_NOTES.map((n) => [n.id, { ...n }]))
const byRequestId = new Map<string, Note>()

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function failIfOffline() {
  // A real server action throws when the network is down; copy that.
  if (typeof navigator !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
}

export async function addNote(fd: FormData): Promise<NoteResult> {
  await wait(500)
  failIfOffline()

  const requestId = String(fd.get('client_request_id') ?? '')
  const already = byRequestId.get(requestId)
  if (already) return { ok: true, note: already } // same receipt → same note, no duplicate

  const body = String(fd.get('body') ?? '').trim()
  if (!body) return { ok: false, formError: 'Write a note before saving.' }

  const authorId = String(fd.get('author_id') ?? CURRENT_STAFF_ID)
  const author = MOCK_STAFF.find((s) => s.id === authorId)
  if (!author) return { ok: false, formError: 'Choose who is entering this note.' }

  const now = new Date().toISOString()
  const note: Note = {
    id: crypto.randomUUID?.() ?? requestId,
    recruit_id: String(fd.get('recruit_id')),
    author_id: author.id,
    author_name: author.display_name,
    body,
    occurred_at: now,
    created_at: now,
    updated_at: now,
  }
  notes.set(note.id, note)
  byRequestId.set(requestId, note)
  return { ok: true, note }
}

export async function updateNote(fd: FormData): Promise<NoteResult> {
  await wait(500)
  failIfOffline()

  const existing = notes.get(String(fd.get('id')))
  if (!existing) return { ok: false, formError: 'This note no longer exists.' }

  const body = String(fd.get('body') ?? '').trim()
  if (!body) return { ok: false, formError: 'A note cannot be empty.' }

  const updated: Note = { ...existing, body, updated_at: new Date().toISOString() }
  notes.set(updated.id, updated)
  return { ok: true, note: updated }
}