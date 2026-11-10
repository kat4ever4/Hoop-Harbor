import type { Note } from "@/lib/notes/types";

export type NoteRow = {
  id: string;
  client_request_id: string;
  recruit_id: string;
  author_id: string;
  note_type: string;
  body: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};

export const NOTE_COLUMNS =
  "id,client_request_id,recruit_id,author_id,note_type,body,occurred_at,created_at,updated_at";

export function asNote(row: NoteRow, authorName: string): Note {
  return {
    id: row.id,
    recruit_id: row.recruit_id,
    author_id: row.author_id,
    author_name: authorName,
    body: row.body,
    occurred_at: row.occurred_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
