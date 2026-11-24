import 'server-only'
import { basename } from 'node:path'
import type { ColumnMapping, CsvInput } from './csv'
import { openImportSession, reviewImport } from './preview'
import { undoBatch, writeImport } from './store'

export { getCsvHeaders as getHeaders } from './csv'
export { previewImport } from './preview'

export type DuplicateChoices = Readonly<Record<number, 'skip' | 'create'>>
export type CommitResult = { batchId: string; inserted: number; skipped: number; errorCsv: string }

export async function commitImport(
  input: CsvInput,
  mapping: ColumnMapping,
  sheetName = typeof input === 'string' ? basename(input) : input.name,
  duplicateChoices: DuplicateChoices = {},
): Promise<CommitResult> {
  if (typeof sheetName !== 'string' || !sheetName.trim()) throw new Error('Enter a sheet name.')
  const { client, userId } = await openImportSession()
  const errorRows: string[] = []

  // Rebuild the review on the server. Choices apply to preview row numbers.
  async function* decisions() {
    for await (const { preview, recruit, note } of reviewImport(client, input, mapping)) {
      if (!recruit) {
        const reason = (preview.reason ?? 'Invalid recruit.').replaceAll('"', '""')
        errorRows.push(`${preview.rowNumber},"${reason}"`)
      } else if (preview.status === 'duplicate' && duplicateChoices[preview.rowNumber] !== 'create') {
        yield { status: 'skip' } as const
      } else {
        yield { status: 'create', recruit, note, duplicate: preview.status === 'duplicate' } as const
      }
    }
  }

  const result = await writeImport(userId, sheetName.trim(), decisions())
  const errorCsv = errorRows.length ? ['row,reason', ...errorRows, ''].join('\r\n') : ''
  return { ...result, errorCsv }
}

export async function undoImport(batchId: string): Promise<{ removed: number }> {
  if (typeof batchId !== 'string' || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(batchId))
    throw new Error('Invalid import batch ID.')

  const { userId } = await openImportSession()
  return { removed: await undoBatch(userId, batchId) }
}
