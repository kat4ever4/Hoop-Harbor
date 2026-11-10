import { beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
  currentStaffId: 'b2000000-0000-4000-8000-000000000002' as string | null,
  error: null as { code: string; message: string } | null,
  insert: vi.fn(),
  from: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    rpc: async () => ({ data: db.currentStaffId, error: null }),
    from: db.from,
  }),
}))

import { createNote } from './note-actions'
import { revalidatePath } from 'next/cache'

const recruitId = 'a2000000-0000-4000-8000-000000000001'
const coachA = 'b2000000-0000-4000-8000-000000000004'
function note(fields: Record<string, string> = {}) {
  const form = new FormData()
  for (const [key, value] of Object.entries({ recruit_id: recruitId, body: ' Good footwork. ', note_type: 'evaluation', ...fields })) {
    form.set(key, value)
  }
  return form
}

beforeEach(() => {
  vi.clearAllMocks()
  db.currentStaffId = 'b2000000-0000-4000-8000-000000000002'
  db.error = null
  db.insert.mockImplementation(async () => ({ error: db.error }))
  db.from.mockReturnValue({ insert: db.insert })
})

describe('createNote', () => {
  it('uses the signed-in staff profile for automatic attribution', async () => {
    expect(await createNote({}, note({ author_id: '' }))).toEqual({ saved: true })
    expect(db.from).toHaveBeenCalledWith('recruit_notes')
    expect(db.insert).toHaveBeenCalledWith({ recruit_id: recruitId, author_id: db.currentStaffId,
      body: 'Good footwork.', title: null, note_type: 'evaluation' })
    expect(revalidatePath).toHaveBeenCalledWith(`/recruits/${recruitId}`)
  })

  it('accepts a selected coach who differs from the signed-in account', async () => {
    expect(await createNote({}, note({ author_id: coachA }))).toEqual({ saved: true })
    expect(db.insert.mock.calls[0][0].author_id).toBe(coachA)
  })

  it('cannot bypass staff authorization by selecting a coach', async () => {
    db.currentStaffId = null
    expect((await createNote({}, note({ author_id: coachA }))).error).toMatch(/Sign in/)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it.each<Record<string, string>>([{ body: ' ' }, { recruit_id: 'invalid' }, { author_id: 'invalid' }, { note_type: 'invalid' }])(
    'rejects invalid input: %o', async (fields) => {
      expect((await createNote({}, note(fields))).error).toBeDefined()
      expect(db.insert).not.toHaveBeenCalled()
    },
  )

  it('reports a staff profile becoming inactive without claiming the note was saved', async () => {
    db.error = { code: '42501', message: 'RLS rejected' }
    const state = await createNote({}, note({ author_id: coachA }))
    expect(state.error).toMatch(/active staff name/)
    expect(state.saved).toBeUndefined()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
