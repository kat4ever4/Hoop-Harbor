
import type { Note } from "@/lib/notes/types";

export type NoteRow = {
  id: string;
  recruit_id: string;
  author_id: string;
  body: string;
  title: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};

export const NOTE_COLUMNS =
  "id,recruit_id,author_id,body,title,occurred_at,created_at,updated_at";

// Store the optional rating in the existing title column.
export function ratingToTitle(
  rating: number | null
): string | null {
  return rating === null ? null : `Rating: ${rating}/5`;
}

export function titleToRating(
  title: string | null
): number | null {
  const match = /^Rating: ([1-5])\/5$/.exec(title ?? "");
  return match ? Number(match[1]) : null;
}

export function asNote(
  row: NoteRow,
  authorName: string
): Note {
  return {
    id: row.id,
    recruit_id: row.recruit_id,
    author_id: row.author_id,
    author_name: authorName,
    body: row.body,
    rating: titleToRating(row.title),
    occurred_at: row.occurred_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
