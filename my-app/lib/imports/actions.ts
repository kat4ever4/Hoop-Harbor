import 'server-only'
import { basename } from 'node:path'
import type { ColumnMapping } from './csv'
import { openImportSession, reviewImport } from './preview'
import { writeImport } from './store'

export { previewImport } from './preview'

export type DuplicateChoices = Readonly<Record<number, 'skip' | 'create'>>
export type CommitResult = { batchId: string; created: number; skipped: number; errors: number }

/** Call with a trusted server path. Keys in duplicateChoices are preview row numbers. */
export async function commitImport(
  path: string,
  mapping: ColumnMapping,
  duplicateChoices: DuplicateChoices = {},
  sheetName = basename(path),
): Promise<CommitResult> {
  const { client, userId } = await openImportSession()

  // Rebuild the preview on the server. Only explicit choices can override a duplicate.
  async function* decisions() {
    for await (const { preview, recruit, note } of reviewImport(client, path, mapping)) {
      if (!recruit) {
        yield { status: 'error' } as const
      } else if (preview.status === 'duplicate' && duplicateChoices[preview.rowNumber] !== 'create') {
        yield { status: 'skip' } as const
      } else {
        yield { status: 'create', recruit, note, duplicate: preview.status === 'duplicate' } as const
      }
    }
  }
  return writeImport(userId, sheetName, decisions())
}
