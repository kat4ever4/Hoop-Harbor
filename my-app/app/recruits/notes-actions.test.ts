
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  addNote,
  updateNote,
} from "./notes-actions";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: mocks.getUser,
    },
    rpc: mocks.rpc,
    from: mocks.from,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

const RECRUIT =
  "a2000000-0000-4000-8000-000000000001";

const STAFF =
  "b2000000-0000-4000-8000-000000000001";

const RECEIPT =
  "11111111-2222-4333-8444-555555555555";

const NOTE_ID =
  "22222222-2222-4333-8444-555555555555";

const row = {
  id: NOTE_ID,
  client_request_id: RECEIPT,
  note_type: "evaluation",
  recruit_id: RECRUIT,
  author_id: STAFF,
  body: "Strong on-ball defense",
  occurred_at: "2026-11-08T18:00:00Z",
  created_at: "2026-11-08T18:00:00Z",
  updated_at: "2026-11-08T18:00:00Z",
};

function form(
  fields: Record<string, string> = {}
) {
  const fd = new FormData();

  Object.entries({
    recruit_id: RECRUIT,
    client_request_id: RECEIPT,
    body: "Strong on-ball defense",
    ...fields,
  }).forEach(([key, value]) => {
    fd.set(key, value);
  });

  return fd;
}

function query() {
  return {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
}

let notes: ReturnType<typeof query>;
let staff: ReturnType<typeof query>;

beforeEach(() => {
  vi.clearAllMocks();

  notes = query();
  staff = query();

  mocks.getUser.mockResolvedValue({
    data: {
      user: {
        id: "logged-in-user",
      },
    },
    error: null,
  });

  mocks.rpc.mockResolvedValue({
    data: STAFF,
    error: null,
  });

  mocks.from.mockImplementation((table: string) => {
    if (table === "recruit_notes") {
      return notes;
    }

    if (table === "staff_members") {
      return staff;
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  notes.single.mockResolvedValue({
    data: row,
    error: null,
  });

  notes.maybeSingle.mockResolvedValue({
    data: row,
    error: null,
  });

  staff.maybeSingle.mockResolvedValue({
    data: {
      display_name: "Dana Mercer",
    },
    error: null,
  });
});

describe("Real evaluation note server actions", () => {
  it("creates a note with a separate request UUID", async () => {
    const result = await addNote(form());

    expect(result).toMatchObject({
      ok: true,
      note: {
        id: NOTE_ID,
        author_name: "Dana Mercer",
      },
    });

    expect(notes.insert).toHaveBeenCalledWith({
      client_request_id: RECEIPT,
      recruit_id: RECRUIT,
      author_id: STAFF,
      note_type: "evaluation",
      body: "Strong on-ball defense",
    });

    expect(
      mocks.revalidatePath
    ).toHaveBeenCalledWith(
      `/recruits/${RECRUIT}/notes`
    );
  });

  it("handles a retry without creating a second note", async () => {
    notes.single.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
      },
    });

    const result = await addNote(form());

    expect(result).toMatchObject({
      ok: true,
      note: {
        id: NOTE_ID,
      },
    });

    expect(notes.eq).toHaveBeenCalledWith(
      "client_request_id",
      RECEIPT
    );

    expect(notes.insert).toHaveBeenCalledTimes(1);
  });

  it("rejects a reused receipt with different content", async () => {
    notes.single.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
      },
    });

    const result = await addNote(
      form({
        body: "Different note",
      })
    );

    expect(result).toMatchObject({
      ok: false,
      formError: expect.stringContaining(
        "different note"
      ),
    });
  });

  it("rejects a receipt belonging to another staff member", async () => {
    notes.single.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
      },
    });

    notes.maybeSingle.mockResolvedValue({
      data: {
        ...row,
        author_id:
          "b2000000-0000-4000-8000-000000000002",
      },
      error: null,
    });

    const result = await addNote(form());

    expect(result.ok).toBe(false);
  });

  it("rejects empty notes", async () => {
    const result = await addNote(
      form({
        body: "   ",
      })
    );

    expect(result.ok).toBe(false);

    expect(
      mocks.getUser
    ).not.toHaveBeenCalled();
  });

  it("rejects notes longer than 10000 characters", async () => {
    const result = await addNote(
      form({ body: "X".repeat(10001) })
    );

    expect(result.ok).toBe(false);
    expect(notes.insert).not.toHaveBeenCalled();
  });

  it("blocks signed-out users", async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: null,
    });

    const result = await addNote(form());

    expect(result.ok).toBe(false);

    expect(
      notes.insert
    ).not.toHaveBeenCalled();
  });

  it("blocks users without an active staff record", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await addNote(form());

    expect(result.ok).toBe(false);

    expect(
      notes.insert
    ).not.toHaveBeenCalled();
  });

  it("rejects another coach's author ID", async () => {
    const result = await addNote(
      form({
        author_id:
          "b2000000-0000-4000-8000-000000000002",
      })
    );

    expect(result.ok).toBe(false);

    expect(
      notes.insert
    ).not.toHaveBeenCalled();
  });

  it("updates an existing note", async () => {
    const fd = new FormData();

    fd.set("id", NOTE_ID);
    fd.set("body", "Strong on-ball defense");

    const result = await updateNote(fd);

    expect(result).toMatchObject({
      ok: true,
      note: {
        id: NOTE_ID,
      },
    });

    expect(notes.update).toHaveBeenCalledWith({
      body: "Strong on-ball defense",
    });

    expect(notes.eq).toHaveBeenCalledWith(
      "id",
      NOTE_ID
    );
  });

  it("handles an update denied by RLS", async () => {
    notes.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const fd = new FormData();

    fd.set("id", NOTE_ID);
    fd.set("body", "Edited text");

    const result = await updateNote(fd);

    expect(result.ok).toBe(false);
  });
});
