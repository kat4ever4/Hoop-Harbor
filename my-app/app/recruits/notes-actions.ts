
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  asNote,
  NOTE_COLUMNS,
  ratingToTitle,
  type NoteRow,
} from "@/lib/notes/real-mapping";
import type { NoteResult } from "@/lib/notes/types";

const UUID =
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

type Client = Awaited<ReturnType<typeof createClient>>;

function getRating(
  fd: FormData
):
  | { rating: number | null; error?: never }
  | { rating?: never; error: string } {
  const value = String(fd.get("rating") ?? "").trim();

  if (!value) return { rating: null };

  const n = Number(value);

  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return {
      error: "Rating must be a whole number between 1 and 5.",
    };
  }

  return { rating: n };
}

// Get the authenticated and active staff member.
async function activeStaff(): Promise<{
  client: Client;
  staffId: string;
} | null> {
  const client = await createClient();

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) return null;

  const { data: staffId, error } =
    await client.rpc("current_staff_v2_id");

  if (
    error ||
    typeof staffId !== "string" ||
    !UUID.test(staffId)
  ) {
    return null;
  }

  return { client, staffId };
}

// Look up the author's display name.
async function displayNote(
  client: Client,
  row: NoteRow
) {
  const { data: staff } = await client
    .from("staff_members_v2")
    .select("display_name")
    .eq("id", row.author_id)
    .maybeSingle();

  return asNote(
    row,
    staff?.display_name ?? "Staff member"
  );
}

function refreshNotePages(recruitId: string) {
  revalidatePath(`/recruits-v2/${recruitId}/notes`);
  revalidatePath(`/recruits/${recruitId}`);
}

function matchesSavedRequest(
  existing: NoteRow,
  recruitId: string,
  staffId: string,
  body: string,
  title: string | null
) {
  return (
    existing.recruit_id === recruitId &&
    existing.author_id === staffId &&
    existing.body === body &&
    existing.title === title
  );
}

// ====================================
// CREATE EVALUATION NOTE
// ====================================

export async function addNote(
  fd: FormData
): Promise<NoteResult> {
  const recruitId = String(
    fd.get("recruit_id") ?? ""
  );

  const requestId = String(
    fd.get("client_request_id") ?? ""
  );

  const requestedAuthor = String(
    fd.get("author_id") ?? ""
  ).trim();

  const body = String(fd.get("body") ?? "").trim();
  const parsed = getRating(fd);

  // Validate recruit ID.
  if (!UUID.test(recruitId)) {
    return {
      ok: false,
      formError: "Invalid recruit ID.",
    };
  }

  // Validate request receipt.
  if (!UUID.test(requestId)) {
    return {
      ok: false,
      formError: "Invalid request ID.",
    };
  }

  // Reject empty notes.
  if (!body) {
    return {
      ok: false,
      formError: "Write a note before saving.",
    };
  }

  if (body.length > 10000) {
    return {
      ok: false,
      formError: "Note is too long.",
    };
  }

  if (parsed.error) {
    return {
      ok: false,
      formError: parsed.error,
    };
  }

  // Require an authenticated staff member.
  const session = await activeStaff();

  if (!session) {
    return {
      ok: false,
      formError: "You must be signed in as active staff.",
    };
  }

  const { client, staffId } = session;

  // Existing RLS permits adding notes as yourself.
  if (
    requestedAuthor &&
    requestedAuthor !== staffId
  ) {
    return {
      ok: false,
      formError: "You can only create notes as yourself.",
    };
  }

  const title = ratingToTitle(
    parsed.rating ?? null
  );

  // Save to the existing recruit_notes_v2 table.
  const { data, error } = await client
    .from("recruit_notes_v2")
    .insert({
      id: requestId,
      recruit_id: recruitId,
      author_id: staffId,
      note_type: "evaluation",
      body,
      title,
    })
    .select(NOTE_COLUMNS)
    .single();

  if (!error && data) {
    refreshNotePages(recruitId);

    return {
      ok: true,
      note: await displayNote(
        client,
        data as NoteRow
      ),
    };
  }

  // SAFE RETRY:
  // If the first save succeeded, retrying with
  // the same UUID causes PostgreSQL error 23505.
  // Return the original note instead of duplicating it.
  if (error?.code === "23505") {
    const {
      data: existing,
      error: lookupError,
    } = await client
      .from("recruit_notes_v2")
      .select(NOTE_COLUMNS)
      .eq("id", requestId)
      .maybeSingle();

    if (lookupError || !existing) {
      return {
        ok: false,
        formError:
          "This request ID is already used or inaccessible.",
      };
    }

    if (
      !matchesSavedRequest(
        existing as NoteRow,
        recruitId,
        staffId,
        body,
        title
      )
    ) {
      return {
        ok: false,
        formError:
          "This request ID was already used for a different note.",
      };
    }

    return {
      ok: true,
      note: await displayNote(
        client,
        existing as NoteRow
      ),
    };
  }

  return {
    ok: false,
    formError:
      "Unable to save note. Check staff access and recruit ID.",
  };
}

// ====================================
// UPDATE EVALUATION NOTE
// ====================================

export async function updateNote(
  fd: FormData
): Promise<NoteResult> {
  const id = String(fd.get("id") ?? "");
  const body = String(fd.get("body") ?? "").trim();
  const parsed = getRating(fd);

  if (!UUID.test(id)) {
    return {
      ok: false,
      formError: "Invalid note ID.",
    };
  }

  if (!body) {
    return {
      ok: false,
      formError: "A note cannot be empty.",
    };
  }

  if (body.length > 10000) {
    return {
      ok: false,
      formError: "Note is too long.",
    };
  }

  if (parsed.error) {
    return {
      ok: false,
      formError: parsed.error,
    };
  }

  const session = await activeStaff();

  if (!session) {
    return {
      ok: false,
      formError: "You must be signed in as active staff.",
    };
  }

  const { client } = session;

  // RLS allows the author or an admin to edit.
  const { data, error } = await client
    .from("recruit_notes_v2")
    .update({
      body,
      title: ratingToTitle(
        parsed.rating ?? null
      ),
    })
    .eq("id", id)
    .select(NOTE_COLUMNS)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      formError: "Note not found or edit not permitted.",
    };
  }

  refreshNotePages(data.recruit_id);

  return {
    ok: true,
    note: await displayNote(
      client,
      data as NoteRow
    ),
  };
}
