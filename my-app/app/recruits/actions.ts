'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseRecruitForm, type FieldErrors } from '@/lib/recruits/validate'
import { changedFields, FIELD_LABELS, pickEditable, type RecruitValues } from '@/lib/recruits/fields'

export type FormState = {
  errors?: FieldErrors
  formError?: string
  /** Someone else saved this recruit after the form was opened. */
  conflict?: { updatedAt: string; theirChanges: string[]; yourChanges: string[] }
}

function friendlyDbError(error: { code?: string; message: string }): string {
  if (error.code === '42501')
    return 'The database refused this change: your account is not on the staff list.'
  return `Could not save: ${error.message}`
}

export async function createRecruit(_prev: FormState, formData: FormData): Promise<FormState> {
  const { values, errors } = parseRecruitForm(formData)
  if (Object.keys(errors).length > 0) return { errors } // nothing is saved

  const supabase = await createClient()
  const { data, error } = await supabase.from('recruits').insert(values).select('id').single()
  if (error) return { formError: friendlyDbError(error) }

  revalidatePath('/recruits')
  redirect(`/recruits/${data.id}`)
}

export async function updateRecruit(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get('id') ?? '')
  const openedAt = String(formData.get('updated_at') ?? '')
  const original = JSON.parse(String(formData.get('original') ?? '{}')) as RecruitValues
  const force = formData.get('intent') === 'force'

  const { values, errors } = parseRecruitForm(formData)
  if (Object.keys(errors).length > 0) return { errors }

  // Only send the fields this coach actually changed. If another coach changed
  // different fields at the same time, both sets of changes are kept.
  const mine = changedFields(original, values)
  if (mine.length === 0) redirect(`/recruits/${id}`)

  const supabase = await createClient()
  const { data: current, error: readError } = await supabase.from('recruits').select('*').eq('id', id).maybeSingle()
  if (readError) return { formError: friendlyDbError(readError) }
  if (!current) return { formError: 'This recruit no longer exists, or your account cannot see it.' }

  if (current.updated_at !== openedAt && !force) {
    const theirs = changedFields(original, pickEditable(current))
    return {
      conflict: {
        updatedAt: current.updated_at,
        theirChanges: theirs.map((c) => FIELD_LABELS[c]),
        yourChanges: mine.map((c) => FIELD_LABELS[c]),
      },
    }
  }

  const changes: Partial<RecruitValues> = {}
  for (const col of mine) Object.assign(changes, { [col]: values[col] })

  const { data: updated, error } = await supabase.from('recruits').update(changes).eq('id', id).select('id')
  if (error) return { formError: friendlyDbError(error) }
  if (!updated || updated.length === 0)
    return { formError: 'The database refused this change: your account is not on the staff list.' }

  revalidatePath('/recruits')
  revalidatePath(`/recruits/${id}`)
  redirect(`/recruits/${id}`)
}
