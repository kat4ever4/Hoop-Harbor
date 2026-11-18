// @vitest-environment node
import { resolve } from 'node:path'
import { expect, it, vi } from 'vitest'
import { isLikelyDuplicate } from '@/lib/recruits/duplicates'
import { previewImport } from './preview'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    rpc: async () => ({ data: 's1' }),
    from: () => ({ select: () => ({ eq: async () => ({ data: [{ id: 's1', display_name: 'Coach A' }] }) }) }),
  }),
}))
vi.mock('@/lib/recruits/duplicates-query', () => ({
  findPossibleDuplicates: async (_client: unknown, candidate: Parameters<typeof isLikelyDuplicate>[0]) => {
    const existing = [
      { first_name: 'Reese', last_name: 'Brooks', graduation_year: 2028 },
      { first_name: 'Samantha', last_name: 'Torres', graduation_year: 2029, high_school: 'Central High School' },
      { first_name: 'Julia', last_name: 'Chen', graduation_year: 2030 },
    ]
    return {
      error: null,
      matches: existing.filter((row) => isLikelyDuplicate(candidate, row)).map((row) => ({
        id: row.last_name,
        name: `${row.first_name} ${row.last_name}`,
        graduation_year: row.graduation_year,
        high_school: row.high_school ?? null,
      })),
    }
  },
}))

it('previews 15 new recruits, 3 possible duplicates and 2 errors without any writes', async () => {
  const result = await previewImport(resolve('tests/fixtures/import_test.csv'), {
    'First Name': 'first_name', 'Last Name': 'last_name', 'Grad Year': 'graduation_year',
    School: 'high_school', Notes: 'notes', Coach: 'coach',
  })
  expect(result.counts).toEqual({ new: 15, duplicate: 3, error: 2 })
  expect(result.rows[0].values.notes).toBe('Good footwork, kept her head up.')
  expect(result.rows[15].match?.name).toBe('Reese Brooks')
  expect(result.rows[18].reason).toMatch(/first name is required/i)
})
