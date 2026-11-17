// FAKE import functions. Same shapes as types.ts, so swapping in
// Naman's real ones later is a one-line import change.
import { isLikelyDuplicate, type ExistingRecruit } from '@/lib/recruits/duplicates'
import type { CommitResult, PreviewResult, PreviewRow } from './types'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Pretend these are already in the database (Reese is in seed-v2.sql too).
const EXISTING: ExistingRecruit[] = [
  { id: 'a2000000-0000-4000-8000-000000000014', first_name: 'Reese', last_name: 'Brooks',
    graduation_year: 2028, high_school: 'Riverbend Prep High School' },
]

// Simple split; breaks on quoted commas. Naman's real one uses csv-parse.
async function readRows(file: File): Promise<string[][]> {
  const text = await file.text()
  return text.trim().split(/\r?\n/).map((line) => line.split(',').map((c) => c.trim()))
}

export async function getHeaders(file: File): Promise<string[]> {
  await wait(300)
  if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Please upload a CSV file.')
  const [headers = []] = await readRows(file)
  return headers
}

/** mapping: CSV header -> recruit field name, or 'ignore'. */
export async function previewImport(file: File, mapping: Record<string, string>): Promise<PreviewResult> {
  await wait(500)
  const [headers, ...data] = await readRows(file)

  const rows: PreviewRow[] = data.map((cells, i) => {
    const rowNumber = i + 2 // +1 for header, +1 because sheets start at 1
    const values: Record<string, string> = {}
    headers.forEach((h, c) => {
      const field = mapping[h]
      if (field && field !== 'ignore') values[field] = cells[c] ?? ''
    })

    if (!values.first_name || !values.last_name)
      return { rowNumber, status: 'error', values, reason: 'Missing first or last name' }
    if (!/^\d{4}$/.test(values.graduation_year ?? ''))
      return { rowNumber, status: 'error', values, reason: 'Graduation year must be 4 digits' }

    const candidate = {
      first_name: values.first_name, last_name: values.last_name,
      graduation_year: Number(values.graduation_year),
      high_school: values.high_school ?? null, club_team: values.club_team ?? null,
    }
    const hit = EXISTING.find((e) => isLikelyDuplicate(candidate, e))
    if (hit)
      return { rowNumber, status: 'duplicate', values, reason: 'May already exist',
        match: { id: hit.id, name: `${hit.first_name} ${hit.last_name}`,
          gradYear: hit.graduation_year, school: hit.high_school ?? null } }

    return { rowNumber, status: 'new', values }
  })

  const count = (s: PreviewRow['status']) => rows.filter((r) => r.status === s).length
  return { rows, counts: { new: count('new'), duplicate: count('duplicate'), error: count('error') },
    previewId: 'mock-preview-1' }
}

export async function commitImport(
  preview: PreviewResult,
  duplicateChoices: Record<number, 'skip' | 'create'>,
): Promise<CommitResult> {
  await wait(700)
  const dups = preview.rows.filter((r) => r.status === 'duplicate')
  const createdDups = dups.filter((r) => duplicateChoices[r.rowNumber] === 'create').length
  return {
    batchId: 'mock-batch-1',
    created: preview.counts.new + createdDups,
    skipped: dups.length - createdDups,
    errors: preview.counts.error,
  }
}

export async function undoImport(_batchId: string): Promise<{ removed: number }> {
  await wait(300)
  return { removed: 0 }
}