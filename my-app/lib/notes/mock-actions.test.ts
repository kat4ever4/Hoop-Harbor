import { describe, it, expect, vi, afterEach } from 'vitest'
import { addNote } from './mock-actions'

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}
const base = { recruit_id: 'mock-recruit-1', author_id: 'mock-dana', body: 'Test', client_request_id: 'req-1' }

afterEach(() => vi.restoreAllMocks())

describe('mock addNote', () => {
  it('saves once even if retried with the same receipt', async () => {
    const a = await addNote(form(base))
    const b = await addNote(form(base))
    expect(a.ok && b.ok && a.note.id === b.note.id).toBe(true)
  })
  it('rejects an empty note', async () => {
    const r = await addNote(form({ ...base, body: '  ', client_request_id: 'req-2' }))
    expect(r.ok).toBe(false)
  })
  it('throws when offline, like a real server call', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    await expect(addNote(form({ ...base, client_request_id: 'req-3' }))).rejects.toThrow()
  })
})