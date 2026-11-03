import type { Note } from './types'

export const MOCK_RECRUIT_ID = 'mock-recruit-1'
/** Pretend the signed-in coach is Dana (matches lib/staff/mock.ts). */
export const CURRENT_STAFF_ID = 'mock-dana'

export const MOCK_NOTES: Note[] = [
  {
    id: 'note-1', recruit_id: MOCK_RECRUIT_ID, author_id: 'mock-robin', author_name: 'Robin Ellis',
    body: 'Long arms, good closeouts. Needs to finish through contact.', rating: 3,
    occurred_at: '2026-10-12T19:30:00Z', created_at: '2026-10-12T20:00:00Z', updated_at: '2026-10-12T20:00:00Z',
  },
  {
    id: 'note-2', recruit_id: MOCK_RECRUIT_ID, author_id: 'mock-dana', author_name: 'Dana Mercer',
    body: 'Strong on-ball defense; quick hands.', rating: 4,
    occurred_at: '2026-10-28T23:15:00Z', created_at: '2026-10-28T23:20:00Z', updated_at: '2026-10-29T14:02:00Z', // edited
  },
  {
    id: 'note-3', recruit_id: MOCK_RECRUIT_ID, author_id: 'mock-casey', author_name: 'Casey Rowan',
    body: 'Talked with club coach — academics are a strength.', rating: null,
    occurred_at: '2026-11-01T16:00:00Z', created_at: '2026-11-01T16:10:00Z', updated_at: '2026-11-01T16:10:00Z',
  },
]