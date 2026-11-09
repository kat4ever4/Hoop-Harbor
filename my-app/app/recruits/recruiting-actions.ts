
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
 
type SaveResult =
  | { success: true; id: string }
  | { success: false; error: string; duplicate?: true };

type VisitInput = {
  recruitId: string;
  staffId: string;
  visitType: string;
  visitDate: string;
  status: string;
  details?: string;
};

type OfferInput = {
  recruitId: string;
  staffId: string;
  schoolName: string;
  dateLearned: string;
  source: string;
};

const VISIT_TYPES = [
  "official",
  "unofficial",
  "campus_tour",
  "home",
  "school",
  "other",
];

const VISIT_STATUSES = ["planned", "completed"];

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function validIds(recruitId: string, staffId: string): boolean {
  return UUID_PATTERN.test(recruitId) && UUID_PATTERN.test(staffId);
}

async function signedInClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return !error && user ? supabase : null;
}

function refreshRecruit(recruitId: string) {
  revalidatePath("/recruits");
  revalidatePath(`/recruits/${recruitId}`);
}

function validateVisit(input: VisitInput): string | null {
  if (!validIds(input.recruitId, input.staffId)) {
    return "Invalid recruit or staff ID.";
  }

  if (!VISIT_TYPES.includes(input.visitType)) {
    return "Invalid visit type.";
  }

  if (!VISIT_STATUSES.includes(input.status)) {
    return "Invalid visit status.";
  }

  if (!validDate(input.visitDate)) {
    return "Invalid visit date (use YYYY-MM-DD).";
  }

  return null;
}

// ------------------------------
// CREATE RECRUIT VISIT
// ------------------------------

export async function createRecruitVisit(
  input: VisitInput
): Promise<SaveResult> {
  const problem = validateVisit(input);

  if (problem) {
    return { success: false, error: problem };
  }

  const supabase = await signedInClient();

  if (!supabase) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const { data, error } = await supabase
    .from("recruit_visits")
    .insert({
      recruit_id: input.recruitId,
      visit_type: input.visitType,
      visit_date: input.visitDate,
      status: input.status,
      details: input.details?.trim() || null,
      changed_by_staff_id: input.staffId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: "Could not save visit. Check staff access and values.",
    };
  }

  refreshRecruit(input.recruitId);

  return { success: true, id: data.id };
}

// ------------------------------
// UPDATE RECRUIT VISIT
// ------------------------------

export async function updateRecruitVisit(
  input: VisitInput & { visitId: string }
): Promise<SaveResult> {
  const problem = validateVisit(input);

  if (problem) {
    return { success: false, error: problem };
  }

  if (!UUID_PATTERN.test(input.visitId)) {
    return {
      success: false,
      error: "Invalid visit ID.",
    };
  }

  const supabase = await signedInClient();

  if (!supabase) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const { data, error } = await supabase
    .from("recruit_visits")
    .update({
      visit_type: input.visitType,
      visit_date: input.visitDate,
      status: input.status,
      details: input.details?.trim() || null,
      changed_by_staff_id: input.staffId,
    })
    .eq("id", input.visitId)
    .eq("recruit_id", input.recruitId)
    .is("archived_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: "Could not update visit.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Visit not found or access denied.",
    };
  }

  refreshRecruit(input.recruitId);

  return { success: true, id: data.id };
}

// ------------------------------
// SCHOOL LOOKUP
// ------------------------------

type School = {
  id: string;
  name: string;
};

type SchoolResult =
  | { school: School; error?: never }
  | { school?: never; error: string };

async function resolveSchool(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolName: string
): Promise<SchoolResult> {
  const { data: alias, error: aliasError } = await supabase
    .from("school_aliases")
    .select("school_id")
    .eq("normalized_alias", schoolName.trim().toLowerCase())
    .maybeSingle();

  if (aliasError) {
    return { error: "Could not look up school." };
  }

  if (!alias) {
    return {
      error: "Unknown school. Add it to the school directory first.",
    };
  }

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("id, name")
    .eq("id", alias.school_id)
    .maybeSingle();

  if (schoolError || !school) {
    return {
      error: "Could not find the school record.",
    };
  }

  return { school };
}

function validateOffer(input: OfferInput): string | null {
  if (!validIds(input.recruitId, input.staffId)) {
    return "Invalid recruit or staff ID.";
  }

  if (!input.schoolName?.trim()) {
    return "Choose a school.";
  }

  if (!validDate(input.dateLearned)) {
    return "Invalid offer date (use YYYY-MM-DD).";
  }

  if (!input.source?.trim()) {
    return "Provide an offer source.";
  }

  return null;
}

// ------------------------------
// DUPLICATE OFFER CHECK
// ------------------------------

async function hasDuplicateOffer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  recruitId: string,
  schoolId: string,
  excludeOfferId?: string
): Promise<{ duplicate: boolean; error: boolean }> {
  let query = supabase
    .from("recruit_other_offers")
    .select("id")
    .eq("recruit_id", recruitId)
    .eq("school_id", schoolId)
    .is("archived_at", null);

  if (excludeOfferId) {
    query = query.neq("id", excludeOfferId);
  }

  const { data, error } = await query.limit(1);

  return {
    duplicate: !!data?.length,
    error: !!error,
  };
}

// ------------------------------
// CREATE OUTSIDE OFFER
// ------------------------------

export async function createOutsideOffer(
  input: OfferInput
): Promise<SaveResult> {
  const problem = validateOffer(input);

  if (problem) {
    return { success: false, error: problem };
  }

  const supabase = await signedInClient();

  if (!supabase) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const resolved = await resolveSchool(supabase, input.schoolName);

  if (!resolved.school) {
    return {
      success: false,
      error: resolved.error,
    };
  }

  const school = resolved.school;

  const check = await hasDuplicateOffer(
    supabase,
    input.recruitId,
    school.id
  );

  if (check.error) {
    return {
      success: false,
      error: "Could not check existing offers.",
    };
  }

  if (check.duplicate) {
    return {
      success: false,
      duplicate: true,
      error: "This recruit already has an active offer from that school.",
    };
  }

  const { data, error } = await supabase
    .from("recruit_other_offers")
    .insert({
      recruit_id: input.recruitId,
      school_id: school.id,
      school: school.name,
      date_learned: input.dateLearned,
      source: input.source.trim(),
      changed_by_staff_id: input.staffId,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    return {
      success: false,
      duplicate: true,
      error: "This recruit already has an active offer from that school.",
    };
  }

  if (error || !data) {
    return {
      success: false,
      error: "Could not save outside offer.",
    };
  }

  refreshRecruit(input.recruitId);

  return { success: true, id: data.id };
}

// ------------------------------
// UPDATE OUTSIDE OFFER
// ------------------------------

export async function updateOutsideOffer(
  input: OfferInput & { offerId: string }
): Promise<SaveResult> {
  const problem = validateOffer(input);

  if (problem) {
    return { success: false, error: problem };
  }

  if (!UUID_PATTERN.test(input.offerId)) {
    return {
      success: false,
      error: "Invalid offer ID.",
    };
  }

  const supabase = await signedInClient();

  if (!supabase) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const resolved = await resolveSchool(supabase, input.schoolName);

  if (!resolved.school) {
    return {
      success: false,
      error: resolved.error,
    };
  }

  const school = resolved.school;

  const check = await hasDuplicateOffer(
    supabase,
    input.recruitId,
    school.id,
    input.offerId
  );

  if (check.error) {
    return {
      success: false,
      error: "Could not check existing offers.",
    };
  }

  if (check.duplicate) {
    return {
      success: false,
      duplicate: true,
      error: "This recruit already has an active offer from that school.",
    };
  }

  const { data, error } = await supabase
    .from("recruit_other_offers")
    .update({
      school_id: school.id,
      school: school.name,
      date_learned: input.dateLearned,
      source: input.source.trim(),
      changed_by_staff_id: input.staffId,
    })
    .eq("id", input.offerId)
    .eq("recruit_id", input.recruitId)
    .is("archived_at", null)
    .select("id")
    .maybeSingle();

  if (error?.code === "23505") {
    return {
      success: false,
      duplicate: true,
      error: "This recruit already has an active offer from that school.",
    };
  }

  if (error) {
    return {
      success: false,
      error: "Could not update outside offer.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Offer not found or access denied.",
    };
  }

  refreshRecruit(input.recruitId);

  return { success: true, id: data.id };
}
