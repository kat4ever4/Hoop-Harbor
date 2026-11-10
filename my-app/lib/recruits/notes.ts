export const NOTE_TYPES = ['general', 'evaluation', 'interaction', 'medical'] as const
export type NoteType = typeof NOTE_TYPES[number]

export type RecruitNote = {
  id: string
  title: string | null
  body: string
  note_type: NoteType
  occurred_at: string
  author: { display_name: string } | null
}
