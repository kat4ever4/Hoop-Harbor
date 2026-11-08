
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_STAGES = [
  "identified",
  "evaluating",
  "priority",
  "offered",
  "committed_to_usna",
  "committed_elsewhere",
  "not_pursuing",
  "to_be_confirmed",
] as const;

type RecruitStage = (typeof VALID_STAGES)[number];

export type StageActionResult =
  | { success: true }
  | { success: false; error: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export async function changeRecruitStage(
  recruitId: string,
  newStage: string,
  staffId: string
): Promise<StageActionResult> {
  // Validate recruit and coach IDs.
  if (
    !UUID_PATTERN.test(recruitId) ||
    !UUID_PATTERN.test(staffId)
  ) {
    return {
      success: false,
      error: "Invalid recruit or staff ID.",
    };
  }

  // Validate the requested recruiting stage.
  if (!VALID_STAGES.includes(newStage as RecruitStage)) {
    return {
      success: false,
      error: "Invalid recruiting stage.",
    };
  }

  const supabase = await createClient();

  // Verify that the user is signed in.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  // Call the atomic stage-change RPC.
  const { error } = await supabase.rpc(
    "set_recruit_stage",
    {
      p_recruit_id: recruitId,
      p_stage: newStage,
      p_staff_id: staffId,
    }
  );

  if (error) {
    if (error.code === "42501") {
      return {
        success: false,
        error: "You do not have permission to change this stage.",
      };
    }

    if (error.code === "P0002") {
      return {
        success: false,
        error: "Recruit not found.",
      };
    }

    return {
      success: false,
      error: "Could not update recruiting stage.",
    };
  }

  // Refresh the pages after saving.
  revalidatePath("/recruits");
  revalidatePath(`/recruits/${recruitId}`);

  return { success: true };
}
