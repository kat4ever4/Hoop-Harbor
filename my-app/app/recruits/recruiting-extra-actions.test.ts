
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createRecruitVisit,
  updateRecruitVisit,
  createOutsideOffer,
  updateOutsideOffer,
} from "./recruiting-actions";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

const recruitId = "a2000000-0000-4000-8000-000000000001";
const staffId = "b2000000-0000-4000-8000-000000000001";
const visitId = "c2000000-0000-4000-8000-000000000001";
const offerId = "d2000000-0000-4000-8000-000000000001";
const schoolId = "e2000000-0000-4000-8000-000000000001";

function makeQuery() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: offerId },
      error: null,
    }),
    maybeSingle: vi.fn().mockResolvedValue({
      data: { id: visitId },
      error: null,
    }),
    limit: vi.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
  };
}

let visits: ReturnType<typeof makeQuery>;
let offers: ReturnType<typeof makeQuery>;
let aliases: ReturnType<typeof makeQuery>;
let schools: ReturnType<typeof makeQuery>;

const visit = {
  recruitId,
  staffId,
  visitType: "official",
  visitDate: "2026-11-10",
  status: "planned",
  details: "Campus visit",
};

const offer = {
  recruitId,
  staffId,
  schoolName: "UConn",
  dateLearned: "2026-11-10",
  source: "Coach call",
};

beforeEach(() => {
  vi.clearAllMocks();

  visits = makeQuery();
  offers = makeQuery();
  aliases = makeQuery();
  schools = makeQuery();

  visits.single.mockResolvedValue({
    data: { id: visitId },
    error: null,
  });

  offers.single.mockResolvedValue({
    data: { id: offerId },
    error: null,
  });

  offers.maybeSingle.mockResolvedValue({
    data: { id: offerId },
    error: null,
  });

  aliases.maybeSingle.mockResolvedValue({
    data: { school_id: schoolId },
    error: null,
  });

  schools.maybeSingle.mockResolvedValue({
    data: {
      id: schoolId,
      name: "University of Connecticut",
    },
    error: null,
  });

  mocks.getUser.mockResolvedValue({
    data: { user: { id: "authenticated-user" } },
    error: null,
  });

  mocks.from.mockImplementation((table: string) => {
    if (table === "recruit_visits") return visits;
    if (table === "recruit_other_offers") return offers;
    if (table === "school_aliases_v2") return aliases;
    if (table === "schools_v2") return schools;

    throw new Error(`Unexpected table: ${table}`);
  });
});

// ------------------------------
// VISIT TESTS
// ------------------------------

describe("visit actions", () => {
  it("creates a visit with the final column names", async () => {
    const result = await createRecruitVisit(visit);

    expect(result).toEqual({
      success: true,
      id: visitId,
    });

    expect(visits.insert).toHaveBeenCalledWith({
      recruit_id: recruitId,
      visit_type: "official",
      visit_date: "2026-11-10",
      status: "planned",
      details: "Campus visit",
      changed_by_staff_id: staffId,
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/recruits/${recruitId}`
    );
  });

  it("updates an existing visit", async () => {
    const result = await updateRecruitVisit({
      ...visit,
      visitId,
      status: "completed",
    });

    expect(result).toEqual({
      success: true,
      id: visitId,
    });

    expect(visits.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
      })
    );

    expect(visits.eq).toHaveBeenCalledWith("id", visitId);
  });

  it("rejects invalid dates before calling Supabase", async () => {
    const result = await createRecruitVisit({
      ...visit,
      visitDate: "2026-02-30",
    });

    expect(result.success).toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("does not save for signed-out users", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await createRecruitVisit(visit);

    expect(result.success).toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

// ------------------------------
// OUTSIDE OFFER TESTS
// ------------------------------

describe("outside offer actions", () => {
  it("resolves an alias to the canonical school ID", async () => {
    const result = await createOutsideOffer(offer);

    expect(result).toEqual({
      success: true,
      id: offerId,
    });

    expect(aliases.eq).toHaveBeenCalledWith(
      "normalized_alias",
      "uconn"
    );

    expect(offers.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        school_id: schoolId,
        school: "University of Connecticut",
        changed_by_staff_id: staffId,
      })
    );
  });

  it("rejects a duplicate offer from the same canonical school", async () => {
    offers.limit.mockResolvedValue({
      data: [{ id: offerId }],
      error: null,
    });

    const result = await createOutsideOffer(offer);

    expect(result).toMatchObject({
      success: false,
      duplicate: true,
    });

    expect(offers.insert).not.toHaveBeenCalled();
  });

  it("rejects a race-condition duplicate using the database unique error", async () => {
    offers.single.mockResolvedValue({
      data: null,
      error: { code: "23505" },
    });

    const result = await createOutsideOffer(offer);

    expect(result).toMatchObject({
      success: false,
      duplicate: true,
    });
  });

  it("rejects unknown schools rather than saving free text", async () => {
    aliases.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await createOutsideOffer(offer);

    expect(result.success).toBe(false);
    expect(offers.insert).not.toHaveBeenCalled();
  });

  it("updates an existing offer without treating itself as duplicate", async () => {
    const result = await updateOutsideOffer({
      ...offer,
      offerId,
    });

    expect(result).toEqual({
      success: true,
      id: offerId,
    });

    expect(offers.neq).toHaveBeenCalledWith(
      "id",
      offerId
    );

    expect(offers.update).toHaveBeenCalledWith(
      expect.objectContaining({
        school_id: schoolId,
        source: "Coach call",
      })
    );
  });
});
