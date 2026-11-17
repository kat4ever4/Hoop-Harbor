
import { beforeEach, describe, expect, it, vi } from "vitest";
import { changeRecruitStage } from "./recruiting-actions";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

const recruitId = "a2000000-0000-4000-8000-000000000001";
const staffId = "b2000000-0000-4000-8000-000000000001";

describe("changeRecruitStage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getUser.mockResolvedValue({
      data: { user: { id: "test-user" } },
      error: null,
    });

    mocks.rpc.mockResolvedValue({
      data: recruitId,
      error: null,
    });
  });

  it("calls the RPC with the correct values", async () => {
    const result = await changeRecruitStage(
      recruitId,
      "priority",
      staffId
    );

    expect(result).toEqual({ success: true });

    expect(mocks.rpc).toHaveBeenCalledWith(
      "set_recruit_stage",
      {
        p_recruit_id: recruitId,
        p_stage: "priority",
        p_staff_id: staffId,
      }
    );
  });

  it("rejects an invalid stage", async () => {
    const result = await changeRecruitStage(
      recruitId,
      "superstar",
      staffId
    );

    expect(result.success).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects invalid IDs", async () => {
    const result = await changeRecruitStage(
      "not-a-uuid",
      "priority",
      staffId
    );

    expect(result.success).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects signed-out users", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await changeRecruitStage(
      recruitId,
      "priority",
      staffId
    );

    expect(result.success).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("handles a database error", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "42501",
        message: "Permission denied",
      },
    });

    const result = await changeRecruitStage(
      recruitId,
      "priority",
      staffId
    );

    expect(result.success).toBe(false);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("refreshes recruit pages after success", async () => {
    await changeRecruitStage(
      recruitId,
      "priority",
      staffId
    );

    expect(mocks.revalidatePath)
      .toHaveBeenCalledWith("/recruits");

    expect(mocks.revalidatePath)
      .toHaveBeenCalledWith(`/recruits/${recruitId}`);
  });
});
