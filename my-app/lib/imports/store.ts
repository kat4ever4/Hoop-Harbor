import 'server-only'
import { randomUUID } from 'node:crypto'
import knex, { type Knex } from 'knex'
import type { RecruitValues } from '@/lib/recruits/fields'

type ImportWrite = {
  recruit: RecruitValues
  duplicate: boolean
  note?: { body: string; authorId: string }
}

type ImportDecision = ({ status: 'create' } & ImportWrite) | { status: 'skip' }

type Staff = { id: string; display_name: string; user_id: string; is_active: boolean }

let db: Knex | undefined

function database(): Knex {
  const connection = process.env.IMPORT_DATABASE_URL
  if (!connection) throw new Error('IMPORT_DATABASE_URL is required to write imports.')
  return db ??= knex({ client: 'pg', connection, pool: { min: 0, max: 2 } })
}

async function requireStaff(trx: Knex.Transaction, userId: string) {
  const staff = await trx<Staff>('public.staff_members')
    .select('id', 'display_name').where({ user_id: userId, is_active: true }).forShare().first()
  if (!staff) throw new Error('You must be signed in as active staff.')
  return staff
}

async function writeChunk(trx: Knex.Transaction, batchId: string, sheetName: string, chunk: ImportWrite[]) {
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
    import_source: sheetName,
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
    const staff = await requireStaff(trx, userId)

    const batchId = randomUUID()
    await trx('public.import_batches').insert({
      id: batchId, sheet_name: sheetName, imported_by_staff_id: staff.id, staff_name: staff.display_name,
    })

    const result = { batchId, inserted: 0, skipped: 0 }
    let chunk: ImportWrite[] = []
    for await (const decision of decisions) {
      if (decision.status === 'skip') result.skipped++
      else {
        result.inserted++
        chunk.push(decision)
        if (chunk.length === 100) {
          await writeChunk(trx, batchId, sheetName, chunk)
          chunk = []
        }
      }
    }
    if (chunk.length) await writeChunk(trx, batchId, sheetName, chunk)
    return result
  })
}

export async function undoBatch(userId: string, batchId: string): Promise<number> {
  return database().transaction(async (trx) => {
    const staff = await requireStaff(trx, userId)
    const batch = await trx('public.import_batches').select('undone_at')
      .where({ id: batchId, imported_by_staff_id: staff.id }).forUpdate().first()
    if (!batch) throw new Error('Import batch not found for this staff account.')
    if (batch.undone_at) throw new Error('This import was already undone.')

    // Lock recruits before checking notes, so a concurrent note insert cannot be cascaded away.
    await trx('public.recruits').select('id').where('import_batch_id', batchId).orderBy('id').forUpdate()
    const laterNote = await trx('public.recruit_notes as notes').select('notes.id')
      .join('public.recruits as recruits', 'recruits.id', 'notes.recruit_id')
      .where('recruits.import_batch_id', batchId)
      .whereRaw('notes.import_batch_id is distinct from ?', [batchId]).first()
    if (laterNote) throw new Error('This batch includes recruits with notes added outside the import.')

    await trx('public.recruit_notes').where('import_batch_id', batchId).delete()
    const removed = await trx('public.recruits').where('import_batch_id', batchId).delete()
    await trx('public.import_batches').where('id', batchId).update({ undone_at: trx.fn.now() })
    return removed
  })
}
