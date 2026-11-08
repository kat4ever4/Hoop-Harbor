import { describe, it, expect } from 'vitest'
import { newestFirst, isEdited } from './format'
import type { Note } from './types'

const n = (id: string, occurred: string, created = occurred, updated = created): Note => ({
  id, recruit_id: 'r', author_id: 'a', author_name: 'A', body: id, rating: null,
  occurred_at: occurred, created_at: created, updated_at: updated,
})

describe('newestFirst', () => {
  it('puts the latest note on top', () => {
    const out = newestFirst([n('old', '2026-10-01T12:00:00Z'), n('new', '2026-11-01T12:00:00+00:00')])
    expect(out.map((x) => x.id)).toEqual(['new', 'old'])
  })
  it('breaks ties by created_at', () => {
    const t = '2026-11-01T12:00:00Z'
    const out = newestFirst([n('first', t, '2026-11-01T12:00:00Z'), n('second', t, '2026-11-01T12:05:00Z')])
    expect(out[0].id).toBe('second')
  })
})

describe('isEdited', () => {
  it('is false for an untouched note', () => expect(isEdited(n('x', '2026-11-01T12:00:00Z'))).toBe(false))
  it('is true after an edit', () =>
    expect(isEdited(n('x', '2026-11-01T12:00:00Z', '2026-11-01T12:00:00Z', '2026-11-01T13:00:00Z'))).toBe(true))
})