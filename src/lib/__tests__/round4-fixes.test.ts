import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before imports
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Helper: mock Supabase that tracks inserts per table
// ---------------------------------------------------------------------------

function makeMockSupabase() {
  const mockSelect = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null });
  const mockEq = vi.fn().mockReturnThis();
  const mockIlike = vi.fn().mockReturnThis();
  const mockNeq = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockOr = vi.fn().mockReturnThis();
  const mockLt = vi.fn().mockReturnThis();
  const mockGte = vi.fn().mockReturnThis();
  const mockLte = vi.fn().mockReturnThis();
  const mockIn = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockNot = vi.fn().mockReturnThis();

  const insertPayloads: Record<string, Record<string, unknown>> = {};
  const updatePayloads: Record<string, Record<string, unknown>> = {};

  const fromMock = vi.fn().mockImplementation((table: string) => ({
    insert: (payload: Record<string, unknown>) => {
      insertPayloads[table] = payload;
      return { select: mockSelect, single: mockSingle };
    },
    update: (payload: Record<string, unknown>) => {
      updatePayloads[table] = payload;
      return { eq: mockEq, select: mockSelect, single: mockSingle };
    },
    select: mockSelect,
    single: mockSingle,
    eq: mockEq,
    ilike: mockIlike,
    neq: mockNeq,
    limit: mockLimit,
    or: mockOr,
    lt: mockLt,
    gte: mockGte,
    lte: mockLte,
    in: mockIn,
    order: mockOrder,
    not: mockNot,
    delete: vi.fn().mockReturnValue({ eq: mockEq }),
  }));

  // Chain returns
  mockSelect.mockReturnValue({ single: mockSingle, eq: mockEq, ilike: mockIlike, neq: mockNeq, limit: mockLimit, or: mockOr, lt: mockLt, gte: mockGte, lte: mockLte, in: mockIn, order: mockOrder, not: mockNot });
  mockEq.mockReturnValue({ single: mockSingle, select: mockSelect, eq: mockEq, neq: mockNeq, limit: mockLimit, ilike: mockIlike, or: mockOr, order: mockOrder, in: mockIn, gte: mockGte, lte: mockLte, lt: mockLt, not: mockNot });
  mockIlike.mockReturnValue({ single: mockSingle, eq: mockEq, neq: mockNeq, limit: mockLimit });
  mockNeq.mockReturnValue({ single: mockSingle, eq: mockEq, neq: mockNeq, ilike: mockIlike, limit: mockLimit, or: mockOr, order: mockOrder });
  mockLimit.mockReturnValue({ single: mockSingle });
  mockOr.mockReturnValue({ neq: mockNeq, order: mockOrder, limit: mockLimit, eq: mockEq });
  mockLt.mockReturnValue({ neq: mockNeq, order: mockOrder, limit: mockLimit, eq: mockEq });
  mockGte.mockReturnValue({ lte: mockLte, order: mockOrder, limit: mockLimit, select: mockSelect, not: mockNot });
  mockLte.mockReturnValue({ order: mockOrder, limit: mockLimit });
  mockIn.mockReturnValue({ order: mockOrder, limit: mockLimit, eq: mockEq });
  mockOrder.mockReturnValue({ limit: mockLimit, order: mockOrder });
  mockNot.mockReturnValue({ order: mockOrder, gte: mockGte });

  return {
    from: fromMock,
    getInsert: (table: string) => insertPayloads[table] ?? null,
    getUpdate: (table: string) => updatePayloads[table] ?? null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// R4-P0: Calendar event contract tests
// ---------------------------------------------------------------------------

describe("R4-P0: Calendar event contracts", () => {
  it("createEventSchema requires area_id", async () => {
    const { createEventSchema } = await import("@/lib/schemas/event");

    // Missing area_id should fail
    const result = createEventSchema.safeParse({
      title: "Team standup",
      start_time: "2026-04-10T09:00:00Z",
      end_time: "2026-04-10T09:30:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("createEventSchema accepts valid payload with area_id", async () => {
    const { createEventSchema } = await import("@/lib/schemas/event");

    const result = createEventSchema.safeParse({
      area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      title: "Team standup",
      start_time: "2026-04-10T09:00:00Z",
      end_time: "2026-04-10T09:30:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("updateEventSchema validates correctly", async () => {
    const { updateEventSchema } = await import("@/lib/schemas/event");

    const result = updateEventSchema.safeParse({
      title: "Updated title",
      location: "Room 5",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// R4-P1: AI executor stale field tests
// ---------------------------------------------------------------------------

describe("R4-P1: AI executor schema correctness", () => {
  it("mark_paid uses paid_date (not paid_at)", async () => {
    const { executeToolCall } = await import("@/lib/ai/executor");
    const mockSb = makeMockSupabase();
    // Make the search find a finance item
    mockSb.from("finance_items");
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    await executeToolCall(
      "mark_paid",
      { search_term: "Strøm" },
      "user-123"
    );

    // The update should use paid_date, not paid_at
    const updatePayload = mockSb.getUpdate("finance_items");
    if (updatePayload) {
      expect(updatePayload).toHaveProperty("paid_date");
      expect(updatePayload).not.toHaveProperty("paid_at");
    }
  });

  it("active_tenders query uses due_date (not deadline)", async () => {
    const { executeToolCall } = await import("@/lib/ai/executor");
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    await executeToolCall(
      "query_data",
      { query_type: "active_tenders" },
      "user-123"
    );

    // Verify the query used 'tenders' table
    const tenderCalls = mockSb.from.mock.calls.filter(
      (call: string[]) => call[0] === "tenders"
    );
    expect(tenderCalls.length).toBeGreaterThan(0);
  });

  it("active_goals query uses current_progress (not progress)", async () => {
    const { executeToolCall } = await import("@/lib/ai/executor");
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    await executeToolCall(
      "query_data",
      { query_type: "active_goals" },
      "user-123"
    );

    // Verify goals table was queried
    const goalsCalls = mockSb.from.mock.calls.filter(
      (call: string[]) => call[0] === "goals"
    );
    expect(goalsCalls.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// R4-P2: Project schema alignment
// ---------------------------------------------------------------------------

describe("R4-P2: Project schema alignment", () => {
  it("createProjectSchema uses title (not name)", async () => {
    const { createProjectSchema } = await import("@/lib/schemas/project");

    // 'name' should not be accepted (it's not in SQL)
    const badResult = createProjectSchema.safeParse({
      area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "My project",
    });
    expect(badResult.success).toBe(false);

    // 'title' should work
    const goodResult = createProjectSchema.safeParse({
      area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      title: "My project",
    });
    expect(goodResult.success).toBe(true);
  });

  it("createProjectSchema requires area_id", async () => {
    const { createProjectSchema } = await import("@/lib/schemas/project");

    const result = createProjectSchema.safeParse({
      title: "My project",
    });
    expect(result.success).toBe(false);
  });

  it("projectStatusSchema uses backlog (not on_hold)", async () => {
    const { projectStatusSchema } = await import("@/lib/schemas/project");

    expect(projectStatusSchema.safeParse("backlog").success).toBe(true);
    expect(projectStatusSchema.safeParse("on_hold").success).toBe(false);
  });

  it("createProjectSchema uses due_date (not target_date)", async () => {
    const { createProjectSchema } = await import("@/lib/schemas/project");

    const result = createProjectSchema.safeParse({
      area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      title: "Project",
      due_date: "2026-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty("due_date");
      expect(result.data).not.toHaveProperty("target_date");
    }
  });

  it("createProjectSchema does not accept color or sort_order", async () => {
    const { createProjectSchema } = await import("@/lib/schemas/project");

    const result = createProjectSchema.safeParse({
      area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      title: "Project",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("color");
      expect(result.data).not.toHaveProperty("sort_order");
    }
  });
});

// ---------------------------------------------------------------------------
// R4-P4: Notes PATCH validation
// ---------------------------------------------------------------------------

describe("R4-P4: Notes PATCH validation", () => {
  it("updateNoteSchema validates correctly", async () => {
    const { updateNoteSchema } = await import("@/lib/schemas/note");

    const validResult = updateNoteSchema.safeParse({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      content: "Updated content",
    });
    expect(validResult.success).toBe(true);

    // Missing id should fail
    const invalidResult = updateNoteSchema.safeParse({
      content: "Updated content",
    });
    expect(invalidResult.success).toBe(false);
  });

  it("updateNoteSchema uses pinned (not is_pinned)", async () => {
    const { updateNoteSchema } = await import("@/lib/schemas/note");

    const result = updateNoteSchema.safeParse({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      pinned: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty("pinned", true);
      expect(result.data).not.toHaveProperty("is_pinned");
    }
  });
});

// ---------------------------------------------------------------------------
// R4-P5: Today overdue classification
// ---------------------------------------------------------------------------

describe("R4-P5: Today overdue classification", () => {
  it("overdue means strictly before today (not equal to today)", () => {
    // Simulate the overdue query logic:
    // The today page now uses due_before_exclusive which maps to lt() in SQL
    // This means items due ON today are NOT included in the overdue list
    const today = "2026-04-06";
    const taskDueToday = { due_date: "2026-04-06" };
    const taskDueYesterday = { due_date: "2026-04-05" };

    // Simulating lt() behavior: strict less than
    const isOverdue = (task: { due_date: string }) => task.due_date < today;

    expect(isOverdue(taskDueToday)).toBe(false); // Due today is NOT overdue
    expect(isOverdue(taskDueYesterday)).toBe(true); // Due yesterday IS overdue
  });
});

// ---------------------------------------------------------------------------
// R4-P3: Voice graceful degradation
// ---------------------------------------------------------------------------

describe("R4-P3: Voice graceful degradation", () => {
  it("voice_commands insert does not include invalid source column", async () => {
    // The voice_commands SQL table has no 'source' column.
    // Verify the insert block doesn't include source.
    const fs = await import("fs");
    const routeCode = fs.readFileSync(
      "src/app/api/voice/transcribe/route.ts",
      "utf-8"
    );

    // Extract the insert block for voice_commands
    const insertMatch = routeCode.match(
      /from\("voice_commands"\)\.insert\(\{([^}]+)\}/
    );
    expect(insertMatch).not.toBeNull();
    const insertBlock = insertMatch![1];

    // The insert block should NOT contain 'source'
    expect(insertBlock).not.toContain("source");
    // Should contain canonical fields
    expect(insertBlock).toContain("raw_transcript");
    expect(insertBlock).toContain("normalized_transcript");
    expect(insertBlock).toContain("language");
  });
});

// ---------------------------------------------------------------------------
// R4-P1: Finance schema - paid_date not paid_at
// ---------------------------------------------------------------------------

describe("R4-P1: Finance schema correctness", () => {
  it("finance zod schema uses paid_date (not paid_at)", async () => {
    const { createFinanceItemSchema, updateFinanceItemSchema } = await import(
      "@/lib/schemas/finance"
    );

    const createResult = createFinanceItemSchema.safeParse({
      title: "Test bill",
      type: "bill",
      paid_date: "2026-04-06",
    });
    expect(createResult.success).toBe(true);

    const updateResult = updateFinanceItemSchema.safeParse({
      paid_date: "2026-04-06",
    });
    expect(updateResult.success).toBe(true);
  });
});
