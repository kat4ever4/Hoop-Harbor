import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { saveUsnaOffer } from "./recruiting-actions";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
    from: mocks.from,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

const recruitId =
  "a2000000-0000-4000-8000-000000000001";

const staffId =
  "b2000000-0000-4000-8000-000000000001";

const input = {
  recruitId,
  staffId,
  offerDate: "2026-11-09",
};

function makeQuery() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  };
}

let recruits: ReturnType<typeof makeQuery>;
let staff: ReturnType<typeof makeQuery>;

beforeEach(() => {
  vi.clearAllMocks();

  recruits = makeQuery();
  staff = makeQuery();

  mocks.getUser.mockResolvedValue({
    data: { user: { id: "test-user" } },
    error: null,
  });

  mocks.rpc.mockResolvedValue({
    data: staffId,
    error: null,
  });

  staff.maybeSingle.mockResolvedValue({
    data: { id: staffId },
    error: null,
  });

  recruits.maybeSingle.mockResolvedValue({
    data: { id: recruitId },
    error: null,
  });

  mocks.from.mockImplementation((table: string) => {
    if (table === "recruits") return recruits;
    if (table === "staff_members") return staff;

    throw new Error(`Unexpected table: ${table}`);
  });
});

describe("saveUsnaOffer", () => {
  it("saves an offer with the correct fields", async () => {
    const result = await saveUsnaOffer(input);

    expect(result).toEqual({ success: true });

    expect(recruits.update).toHaveBeenCalledWith({
      usna_offer_date: "2026-11-09",
      usna_offered_by_staff_id: staffId,
      pipeline_changed_by_staff_id: staffId,
    });

    expect(recruits.eq).toHaveBeenCalledWith(
      "id",
      recruitId
    );

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/recruits/${recruitId}`
    );
  });

  it("checks that the user is active staff", async () => {
    await saveUsnaOffer(input);

    expect(mocks.rpc).toHaveBeenCalledWith(
      "current_staff_id"
    );
  });

  it("checks that the offering coach is active", async () => {
    await saveUsnaOffer(input);

    expect(staff.eq).toHaveBeenCalledWith(
      "id",
      staffId
    );

    expect(staff.eq).toHaveBeenCalledWith(
      "is_active",
      true
    );
  });

  it("rejects invalid recruit IDs", async () => {
    const result = await saveUsnaOffer({
      ...input,
      recruitId: "invalid",
    });

    expect(result.success).toBe(false);
    expect(recruits.update).not.toHaveBeenCalled();
  });

  it("rejects invalid dates", async () => {
    const result = await saveUsnaOffer({
      ...input,
      offerDate: "2026-02-30",
    });

    expect(result.success).toBe(false);
    expect(recruits.update).not.toHaveBeenCalled();
  });

  it("rejects signed-out users", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await saveUsnaOffer(input);

    expect(result.success).toBe(false);
    expect(recruits.update).not.toHaveBeenCalled();
  });

  it("rejects users without active staff access", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await saveUsnaOffer(input);

    expect(result.success).toBe(false);
    expect(recruits.update).not.toHaveBeenCalled();
  });

  it("rejects an inactive offering coach", async () => {
    staff.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await saveUsnaOffer(input);

    expect(result.success).toBe(false);
    expect(recruits.update).not.toHaveBeenCalled();
  });

  it("handles database errors", async () => {
    recruits.maybeSingle.mockResolvedValue({
      data: null,
      error: { code: "42501" },
    });

    const result = await saveUsnaOffer(input);

    expect(result.success).toBe(false);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("handles missing recruits", async () => {
    recruits.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await saveUsnaOffer(input);

    expect(result.success).toBe(false);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
