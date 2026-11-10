'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { NOTE_TYPES } from '@/lib/recruits/notes'

export type NoteFormState = { error?: string; saved?: boolean }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function createNote(_previous: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const recruitId = String(formData.get('recruit_id') ?? '')
  const authorId = String(formData.get('author_id') ?? '')
  const body = String(formData.get('body') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim() || null
  const noteType = String(formData.get('note_type') ?? 'general')
  if (!UUID.test(recruitId)) return { error: 'Choose a valid recruit.' }
  if (authorId && !UUID.test(authorId)) return { error: 'Choose an active staff name or Automatic.' }
  if (!body) return { error: 'Enter a note before saving.' }
  if (!(NOTE_TYPES as readonly string[]).includes(noteType)) return { error: 'Choose a valid note type.' }

  const supabase = await createClient()
  // This RPC resolves the session on the server and excludes inactive accounts.
  const { data: currentStaffId, error: accessError } = await supabase.rpc('current_staff_id')
  if (accessError || !currentStaffId) return { error: 'Sign in with an active staff account to add a note.' }

  const { error } = await supabase.from('recruit_notes').insert({
    recruit_id: recruitId,
    author_id: authorId || currentStaffId,
    note_type: noteType,
    title,
    body,
  })
  if (error) return { error: error.code === '42501'
    ? 'Could not save. Check your staff access and choose an active staff name.'
    : `Could not save note: ${error.message}` }

  revalidatePath(`/recruits/${recruitId}`)
  return { saved: true }
}
