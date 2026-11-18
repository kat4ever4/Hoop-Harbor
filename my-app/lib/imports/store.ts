import 'server-only'
import { randomUUID } from 'node:crypto'
import knex, { type Knex } from 'knex'
import type { RecruitValues } from '@/lib/recruits/fields'

type ImportWrite = {
  recruit: RecruitValues
  duplicate: boolean
  note?: { body: string; authorId: string }
}

type ImportDecision = ({ status: 'create' } & ImportWrite) | { status: 'skip' } | { status: 'error' }

type Staff = { id: string; display_name: string; user_id: string; is_active: boolean }

let db: Knex | undefined

function database(): Knex {
  const connection = process.env.IMPORT_DATABASE_URL
  if (!connection) throw new Error('IMPORT_DATABASE_URL is required to commit an import.')
  return db ??= knex({ client: 'pg', connection, pool: { min: 0, max: 2 } })
}

async function writeChunk(trx: Knex.Transaction, batchId: string, chunk: ImportWrite[]) {
  const authorIds = [...new Set(chunk.flatMap(({ note }) => note ? [note.authorId] : []))]
  if (authorIds.length > 0) {
    const activeAuthors = await trx('public.staff_members')
      .select('id').whereIn('id', authorIds).where('is_active', true).forShare()
    if (activeAuthors.length !== authorIds.length) throw new Error('An evaluation note author is no longer active.')
  }

  const rows = chunk.map((row) => ({ ...row, id: randomUUID() }))
  await trx('public.recruits').insert(rows.map(({ id, recruit, duplicate }) => ({
    ...recruit,
    id,
    guardian_contacts: JSON.stringify(recruit.guardian_contacts),
    import_batch_id: batchId,
    created_despite_duplicate: duplicate,
    duplicate_override_at: duplicate ? trx.fn.now() : null,
  })))
  const notes = rows.flatMap(({ id, note }) => note ? [{
    recruit_id: id,
    author_id: note.authorId,
    body: note.body,
    note_type: 'evaluation',
    import_batch_id: batchId,
  }] : [])
  if (notes.length) await trx('public.recruit_notes').insert(notes)
}

export async function writeImport(
  userId: string,
  sheetName: string,
  decisions: AsyncIterable<ImportDecision>,
) {
  return database().transaction(async (trx) => {
    // Let one import finish before the next one rechecks for duplicates.
    await trx.raw("select pg_advisory_xact_lock(hashtext('hoop-harbor:recruit-import'))")
    const staff = await trx<Staff>('public.staff_members')
      .select('id', 'display_name').where({ user_id: userId, is_active: true }).forShare().first()
    if (!staff) throw new Error('You must be signed in as active staff.')

    const batchId = randomUUID()
    await trx('public.import_batches').insert({
      id: batchId, sheet_name: sheetName, imported_by_staff_id: staff.id, staff_name: staff.display_name,
    })

    const result = { batchId, created: 0, skipped: 0, errors: 0 }
    let chunk: ImportWrite[] = []
    for await (const decision of decisions) {
      if (decision.status === 'error') result.errors++
      else if (decision.status === 'skip') result.skipped++
      else {
        result.created++
        chunk.push(decision)
        if (chunk.length === 100) {
          await writeChunk(trx, batchId, chunk)
          chunk = []
        }
      }
    }
    if (chunk.length) await writeChunk(trx, batchId, chunk)
    return result
  })
}
