import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { isLikelyDuplicate, normalize } from '@/lib/recruits/duplicates'
import { findPossibleDuplicates } from '@/lib/recruits/duplicates-query'
import type { RecruitValues } from '@/lib/recruits/fields'
import { readImportRows, type ColumnMapping } from './csv'

export type PreviewRow = {
  rowNumber: number
  values: Record<string, string>
  status: 'new' | 'duplicate' | 'error'
  reason?: string
  match?: { id: string; name: string; gradYear: number | null; school: string | null }
}

export type PreviewResult = {
  counts: Record<PreviewRow['status'], number>
  rows: PreviewRow[]
}

type Client = Awaited<ReturnType<typeof createClient>>
type Staff = { id: string; display_name: string }
type ReviewedRow = {
  preview: PreviewRow
  recruit?: RecruitValues
  note?: { body: string; authorId: string }
}

export async function openImportSession() {
  const client = await createClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('You must be signed in as active staff.')

  const { data: staffId, error: staffError } = await client.rpc('current_staff_id')
  if (staffError || !staffId) throw new Error('You must be signed in as active staff.')
  return { client, userId: data.user.id }
}

async function listAuthors(client: Client): Promise<Staff[]> {
  const { data, error } = await client.from('staff_members').select('id, display_name').eq('is_active', true)
  if (error) throw new Error('Could not look up the evaluation note authors.')
  return data
}

export async function* reviewImport(client: Client, path: string, mapping: ColumnMapping): AsyncGenerator<ReviewedRow> {
  const seen = new Map<string, RecruitValues[]>()
  let authors: Staff[] | undefined

  for await (const { rowNumber, values, recruit, reason } of readImportRows(path, mapping)) {
    const base = { rowNumber, values }
    if (!recruit) {
      yield { preview: { ...base, status: 'error', reason } }
      continue
    }

    let note: ReviewedRow['note']
    const body = values.notes?.trim()
    if (body) {
      authors ??= await listAuthors(client)
      const coach = values.coach?.trim().toLowerCase()
      const matches = authors.filter((staff) => staff.id === coach || staff.display_name.toLowerCase() === coach)
      if (body.length > 10000 || matches.length !== 1) {
        yield { preview: { ...base, status: 'error', reason: body.length > 10000
          ? 'Evaluation notes must be 10,000 characters or fewer.'
          : 'Map the evaluation note to a single active coach by name or staff ID.' } }
        continue
      }
      note = { body, authorId: matches[0].id }
    }

    const { matches, error } = await findPossibleDuplicates(client, recruit)
    if (error) throw new Error(error)

    const key = `${recruit.graduation_year}:${normalize(recruit.last_name)}`
    const earlier = seen.get(key) ?? []
    const sameFile = earlier.some((candidate) => isLikelyDuplicate(recruit, candidate))
    earlier.push(recruit)
    seen.set(key, earlier)

    const hit = matches[0]
    const preview: PreviewRow = hit ? {
      ...base,
      status: 'duplicate',
      reason: 'May already exist.',
      match: { id: hit.id, name: hit.name, gradYear: hit.graduation_year, school: hit.high_school },
    } : sameFile ? {
      ...base, status: 'duplicate', reason: 'Matches an earlier row in this CSV.',
    } : { ...base, status: 'new' }
    yield { preview, recruit, note }
  }
}

/** Preview a trusted server-side CSV path without writing to the database. */
export async function previewImport(path: string, mapping: ColumnMapping): Promise<PreviewResult> {
  const { client } = await openImportSession()
  const result: PreviewResult = { counts: { new: 0, duplicate: 0, error: 0 }, rows: [] }
  for await (const { preview } of reviewImport(client, path, mapping)) {
    result.rows.push(preview)
    result.counts[preview.status]++
  }
  return result
}
