// Tests the save logic with a fake database, so it runs in CI without Supabase.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const db = vi.hoisted(() => ({
  row: null as Record<string, unknown> | null,
  updates: [] as Record<string, unknown>[],
  inserts: [] as Record<string, unknown>[],
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => { throw new Error(`REDIRECT:${url}`) },
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      insert: (values: Record<string, unknown>) => {
        db.inserts.push(values)
        return { select: () => ({ single: async () => ({ data: { id: 'new-id' }, error: null }) }) }
      },
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: db.row, error: null }) }) }),
      update: (changes: Record<string, unknown>) => ({
        eq: () => ({
          select: async () => {
            db.updates.push(changes)
            db.row = { ...db.row, ...changes }
            return { data: [{ id: 'r1' }], error: null }
          },
        }),
      }),
    }),
  }),
}))

import { createRecruit, updateRecruit } from './actions'
import { parseRecruitForm } from '@/lib/recruits/validate'
import { pickEditable } from '@/lib/recruits/fields'

function fd(fields: Record<string, string | string[]>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(fields)) for (const item of [v].flat()) f.append(k, item)
  return f
}

const base = { first_name: 'Test', last_name: 'Recruit', graduation_year: '2028', height: '5-10', high_school: 'Central', positions: ['SF'] }
const original = pickEditable({ ...parseRecruitForm(fd(base)).values })

beforeEach(() => {
  db.row = { id: 'r1', ...original, updated_at: 'T1' }
  db.updates = []
  db.inserts = []
})

describe('createRecruit', () => {
  it('saves nothing when a required field is missing', async () => {
    const result = await createRecruit({}, fd({ first_name: 'Test', last_name: 'Recruit' }))
    expect(result.errors?.graduation_year).toBeDefined()
    expect(db.inserts).toHaveLength(0)
  })

  it('saves and opens the new profile', async () => {
    await expect(createRecruit({}, fd(base))).rejects.toThrow('REDIRECT:/recruits/new-id')
    expect(db.inserts[0].height_inches).toBe(70)
  })
})

describe('updateRecruit (two coaches editing at once)', () => {
  const editForm = (changes: Record<string, string | string[]>, extra: Record<string, string> = {}) =>
    fd({ ...base, ...changes, id: 'r1', updated_at: 'T1', original: JSON.stringify(original), ...extra })

  it('warns before saving when someone else saved first, then keeps both changes', async () => {
    // Window 2 changes position and saves.
    await expect(updateRecruit({}, editForm({ positions: ['PG'] }))).rejects.toThrow('REDIRECT')
    db.row = { ...db.row, updated_at: 'T2' }

    // Window 1, opened at T1, changes school.
    const warned = await updateRecruit({}, editForm({ high_school: 'Westfield' }))
    expect(warned.conflict?.theirChanges).toEqual(['Position(s)'])
    expect(warned.conflict?.yourChanges).toEqual(['High school'])

    // Coach confirms. Only the school is sent, so the position change survives.
    await expect(updateRecruit({}, editForm({ high_school: 'Westfield' }, { intent: 'force' }))).rejects.toThrow('REDIRECT')
    expect(db.updates.at(-1)).toEqual({ high_school: 'Westfield' })
    expect(db.row?.positions).toEqual(['PG'])
    expect(db.row?.high_school).toBe('Westfield')
  })
})
