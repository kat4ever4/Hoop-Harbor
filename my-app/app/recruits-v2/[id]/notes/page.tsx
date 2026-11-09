
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NotesClient } from "@/app/recruits/[id]/notes-client";
import {
  asNote,
  NOTE_COLUMNS,
  type NoteRow,
} from "@/lib/notes/real-mapping";

type StaffRow = {
  id: string;
  display_name: string;
  role: string;
};

const UUID =
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export default async function RecruitV2NotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID.test(id)) {
    return <main className="p-6">Invalid recruit ID.</main>;
  }

  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return (
      <main className="p-6">
        Please{" "}
        <Link className="underline" href="/auth/login">
          sign in
        </Link>{" "}
        to view notes.
      </main>
    );
  }

  const { data: staffId, error: staffError } =
    await client.rpc("current_staff_v2_id");

  if (staffError || !staffId) {
    return (
      <main className="p-6">
        Your login is not linked to an active
        staff_members_v2 record.
      </main>
    );
  }

  const [recruitResult, notesResult, staffResult] =
    await Promise.all([
      client
        .from("recruits_v2")
        .select("first_name,last_name")
        .eq("id", id)
        .maybeSingle(),

      client
        .from("recruit_notes_v2")
        .select(NOTE_COLUMNS)
        .eq("recruit_id", id)
        .order("occurred_at", {
          ascending: false,
        }),

      client
        .from("staff_members_v2")
        .select("id,display_name,role")
        .eq("is_active", true),
    ]);

  if (recruitResult.error || !recruitResult.data) {
    return (
      <main className="p-6">
        Recruit not found or access denied.
      </main>
    );
  }

  if (notesResult.error || staffResult.error) {
    return (
      <main className="p-6">
        Could not load notes or staff directory.
      </main>
    );
  }

  const staffRows =
    (staffResult.data ?? []) as StaffRow[];

  const nameById = new Map(
    staffRows.map((s) => [s.id, s.display_name])
  );

  const notes = (
    (notesResult.data ?? []) as NoteRow[]
  ).map((row) =>
    asNote(
      row,
      nameById.get(row.author_id) ?? "Staff member"
    )
  );

  const me = staffRows.find(
    (s) => s.id === staffId
  );

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <Link
        className="text-sm text-indigo-700 underline"
        href="/recruits"
      >
        All recruits
      </Link>

      <h1 className="text-2xl font-bold">
        Evaluation notes —{" "}
        {recruitResult.data.first_name}{" "}
        {recruitResult.data.last_name}
      </h1>

      <p className="text-sm text-slate-600">
        Notes are saved in the existing
        recruit_notes_v2 database table.
      </p>

      <NotesClient
        recruitId={id}
        initialNotes={notes}
        staff={staffRows.map((s) => ({
          id: s.id,
          display_name: s.display_name,
        }))}
        currentStaffId={staffId}
        isAdmin={me?.role === "admin"}
        pickAuthor={false}
      />
    </main>
  );
}
