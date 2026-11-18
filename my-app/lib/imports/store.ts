import 'server-only'
import { randomUUID } from 'node:crypto'
import knex, { type Knex } from 'knex'
import type { RecruitValues } from '@/lib/recruits/fields'

type ImportWrite = {
  recruit: RecruitValues
  duplicate: boolean
  note?: { body: string; authorId: string }
}

type Staff = { id: string; display_name: string; user_id: string; is_active: boolean }

let db: Knex | undefined

function database(): Knex {
  const connection = process.env.IMPORT_DATABASE_URL
  if (!connection) throw new Error('IMPORT_DATABASE_URL is required to commit an import.')
  return db ??= knex({ client: 'pg', connection, pool: { min: 0, max: 2 } })
}

export async function writeImport(
  userId: string,
  sheetName: string,
  selectRows: () => Promise<{ selected: ImportWrite[]; skipped: number; errors: number }>,
) {
  return database().transaction(async (trx) => {
    const staff = await trx<Staff>('public.staff_members')
      .select('id', 'display_name').where({ user_id: userId, is_active: true }).forShare().first()
    if (!staff) throw new Error('You must be signed in as active staff.')

    // Let one import finish before the next one rechecks for duplicates.
    await trx.raw("select pg_advisory_xact_lock(hashtext('hoop-harbor:recruit-import'))")
    const { selected, skipped, errors } = await selectRows()

    const batchId = randomUUID()
    await trx('public.import_batches').insert({
      id: batchId, sheet_name: sheetName, imported_by_staff_id: staff.id, staff_name: staff.display_name,
    })

    const authorIds = [...new Set(selected.flatMap(({ note }) => note ? [note.authorId] : []))]
    if (authorIds.length > 0) {
      const activeAuthors = await trx('public.staff_members')
        .select('id').whereIn('id', authorIds).where('is_active', true).forShare()
      if (activeAuthors.length !== authorIds.length) throw new Error('An evaluation note author is no longer active.')
    }

    const rows = selected.map((row) => ({ ...row, id: randomUUID() }))
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100)
      await trx('public.recruits').insert(chunk.map(({ id, recruit, duplicate }) => ({
        ...recruit,
        id,
        guardian_contacts: JSON.stringify(recruit.guardian_contacts),
        import_batch_id: batchId,
        created_despite_duplicate: duplicate,
        duplicate_override_at: duplicate ? trx.fn.now() : null,
      })))
      const notes = chunk.flatMap(({ id, note }) => note ? [{
        recruit_id: id,
        author_id: note.authorId,
        body: note.body,
        note_type: 'evaluation',
        import_batch_id: batchId,
      }] : [])
      if (notes.length) await trx('public.recruit_notes').insert(notes)
    }

    return { batchId, created: rows.length, skipped, errors }
  })
}
