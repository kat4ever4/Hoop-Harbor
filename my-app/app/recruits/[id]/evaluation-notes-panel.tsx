
import { createClient } from "@/lib/supabase/server";
import { NotesClient } from "./notes-client";
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

export async function EvaluationNotesPanel({
  recruitId,
}: {
  recruitId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Please sign in to view evaluation notes.</p>;
  }

  const { data: staffId, error: staffError } =
    await supabase.rpc("current_staff_id");

  if (staffError || !staffId) {
    return <p>An active staff account is required.</p>;
  }

  const [notesResult, staffResult] = await Promise.all([
    supabase
      .from("recruit_notes")
      .select(NOTE_COLUMNS)
      .eq("recruit_id", recruitId)
      .eq("note_type", "evaluation")
      .order("occurred_at", { ascending: false }),

    supabase
      .from("staff_members")
      .select("id,display_name,role")
      .eq("is_active", true),
  ]);

  if (notesResult.error || staffResult.error) {
    return <p>Could not load evaluation notes.</p>;
  }

  const staff = (staffResult.data ?? []) as StaffRow[];

  const names = new Map(
    staff.map((member) => [member.id, member.display_name])
  );

  const notes = ((notesResult.data ?? []) as NoteRow[]).map(
    (row) =>
      asNote(
        row,
        names.get(row.author_id) ?? "Staff member"
      )
  );

  const currentStaff = staff.find(
    (member) => member.id === staffId
  );

  return (
    <NotesClient
      recruitId={recruitId}
      initialNotes={notes}
      staff={staff.map((member) => ({
        id: member.id,
        display_name: member.display_name,
      }))}
      currentStaffId={staffId}
      isAdmin={currentStaff?.role === "admin"}
      pickAuthor={false}
    />
  );
}
