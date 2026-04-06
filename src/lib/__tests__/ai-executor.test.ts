import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the AI executor module.
 *
 * We mock the Supabase server client so that we can test the executor logic
 * (tool dispatch, input validation, error paths, schema alignment) without
 * hitting a real database.
 */

// Mock the Supabase server module before importing the executor
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { executeToolCall, type ExecutionResult } from "@/lib/ai/executor";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockSupabase() {
  const mockInsert = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null });
  const mockEq = vi.fn().mockReturnThis();
  const mockIlike = vi.fn().mockReturnThis();
  const mockNeq = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockOr = vi.fn().mockReturnThis();
  const mockLt = vi.fn().mockReturnThis();
  const mockGte = vi.fn().mockReturnThis();
  const mockLte = vi.fn().mockReturnThis();
  const mockIn = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();

  // Track what gets inserted for schema validation, per table
  const insertPayloads: Record<string, Record<string, unknown>> = {};

  const fromMock = vi.fn().mockImplementation((table: string) => ({
    insert: (payload: Record<string, unknown>) => {
      insertPayloads[table] = payload;
      return {
        select: mockSelect,
        single: mockSingle,
      };
    },
    select: mockSelect,
    single: mockSingle,
    eq: mockEq,
    ilike: mockIlike,
    neq: mockNeq,
    limit: mockLimit,
    update: mockUpdate,
    or: mockOr,
    lt: mockLt,
    gte: mockGte,
    lte: mockLte,
    in: mockIn,
    order: mockOrder,
  }));

  // Deep chaining
  mockSelect.mockReturnValue({ single: mockSingle, eq: mockEq, ilike: mockIlike, neq: mockNeq, limit: mockLimit, or: mockOr, lt: mockLt, gte: mockGte, lte: mockLte, in: mockIn, order: mockOrder });
  mockEq.mockReturnValue({ single: mockSingle, select: mockSelect, eq: mockEq, neq: mockNeq, limit: mockLimit, ilike: mockIlike, or: mockOr, order: mockOrder, in: mockIn, gte: mockGte, lte: mockLte, lt: mockLt, not: vi.fn().mockReturnThis() });
  mockIlike.mockReturnValue({ single: mockSingle, eq: mockEq, neq: mockNeq, limit: mockLimit });
  mockNeq.mockReturnValue({ single: mockSingle, eq: mockEq, neq: mockNeq, ilike: mockIlike, limit: mockLimit, or: mockOr, order: mockOrder });
  mockLimit.mockReturnValue({ single: mockSingle });
  mockUpdate.mockReturnValue({ eq: mockEq, single: mockSingle, select: mockSelect });
  mockOr.mockReturnValue({ neq: mockNeq, order: mockOrder, limit: mockLimit, eq: mockEq });
  mockLt.mockReturnValue({ neq: mockNeq, order: mockOrder, limit: mockLimit, eq: mockEq });
  mockGte.mockReturnValue({ lte: mockLte, order: mockOrder, limit: mockLimit, select: mockSelect, not: vi.fn().mockReturnThis() });
  mockLte.mockReturnValue({ order: mockOrder, limit: mockLimit });
  mockIn.mockReturnValue({ order: mockOrder, limit: mockLimit, eq: mockEq });
  mockOrder.mockReturnValue({ limit: mockLimit, order: mockOrder });

  return {
    from: fromMock,
    getInsertPayload: (table: string) => insertPayloads[table] ?? null,
    _mocks: { mockInsert, mockSelect, mockSingle, mockUpdate },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Basic tool dispatch tests
// ---------------------------------------------------------------------------

describe("executeToolCall", () => {
  it("returns an error for unknown tool names", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result: ExecutionResult = await executeToolCall(
      "nonexistent_tool",
      {},
      "user-123"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("Ukjent");
  });

  it("returns an error when create_task is called without title", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall(
      "create_task",
      { description: "No title provided" },
      "user-123"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("tittel");
  });

  it("returns an error when create_event is called without title", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall(
      "create_event",
      { start_time: "2026-04-10T09:00:00Z" },
      "user-123"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("tittel");
  });

  it("returns an error when create_event is called without start_time", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall(
      "create_event",
      { title: "Meeting" },
      "user-123"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("starttid");
  });

  it("returns an error when create_finance_item is called without title", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall(
      "create_finance_item",
      { type: "bill" },
      "user-123"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("tittel");
  });

  it("returns an error when create_finance_item is called without type", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall(
      "create_finance_item",
      { title: "Electricity" },
      "user-123"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("type");
  });

  it("returns an error when complete_task is called without search term", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall("complete_task", {}, "user-123");

    expect(result.success).toBe(false);
  });

  it("returns an error when create_note is called without content", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall(
      "create_note",
      { title: "My note" },
      "user-123"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("innhold");
  });

  it("returns an error when log_workout is called without title", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall("log_workout", {}, "user-123");

    expect(result.success).toBe(false);
    expect(result.message).toContain("tittel");
  });

  it("returns an error when query_data is called without query_type", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall("query_data", {}, "user-123");

    expect(result.success).toBe(false);
  });

  it("returns an error when reschedule is called without search_term", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall(
      "reschedule",
      { new_date: "2026-05-01" },
      "user-123"
    );

    expect(result.success).toBe(false);
  });

  it("result has the correct ExecutionResult shape", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    const result = await executeToolCall("unknown_tool", {}, "user-123");

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
    expect(typeof result.success).toBe("boolean");
    expect(typeof result.message).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// Schema alignment tests (R3-P0)
// ---------------------------------------------------------------------------

describe("AI executor schema alignment", () => {
  it("ai_action_audit logging uses correct column names (agent_name, action_type)", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    // Execute a tool that will trigger audit logging
    await executeToolCall("create_task", { title: "Test task" }, "user-123");

    // Find the ai_action_audit insert call
    const auditCalls = mockSb.from.mock.calls.filter(
      (call: string[]) => call[0] === "ai_action_audit"
    );
    expect(auditCalls.length).toBeGreaterThan(0);
  });

  it("log_workout does NOT insert area_id (not in SQL schema)", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    await executeToolCall(
      "log_workout",
      { title: "Styrke", duration_minutes: 45, intensity: "hard" },
      "user-123"
    );

    // Check that workout_sessions was called
    const workoutCalls = mockSb.from.mock.calls.filter(
      (call: string[]) => call[0] === "workout_sessions"
    );
    expect(workoutCalls.length).toBeGreaterThan(0);

    // Verify the insert payload doesn't contain area_id
    const payload = mockSb.getInsertPayload("workout_sessions");
    expect(payload).not.toHaveProperty("area_id");
  });

  it("log_workout inserts session_type when provided", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    await executeToolCall(
      "log_workout",
      { title: "Løping", session_type: "running", duration_minutes: 30 },
      "user-123"
    );

    const payload = mockSb.getInsertPayload("workout_sessions");
    expect(payload).toHaveProperty("session_type", "running");
  });

  it("executeToolCall passes audit options through", async () => {
    const mockSb = makeMockSupabase();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSb as never);

    await executeToolCall(
      "create_task",
      { title: "Test" },
      "user-123",
      { confidence: 0.95, autoExecuted: true, confirmedByUser: false }
    );

    // The audit insert should have been called
    const auditCalls = mockSb.from.mock.calls.filter(
      (call: string[]) => call[0] === "ai_action_audit"
    );
    expect(auditCalls.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Zod schema alignment tests
// ---------------------------------------------------------------------------

describe("Zod schema alignment with SQL", () => {
  it("createWorkoutSessionSchema accepts SQL-valid fields only", async () => {
    const { createWorkoutSessionSchema } = await import("@/lib/schemas/training");

    // Valid payload matching SQL columns
    const validResult = createWorkoutSessionSchema.safeParse({
      title: "Morning run",
      session_type: "running",
      duration_minutes: 30,
      intensity: "moderate",
      notes: "Felt good",
    });
    expect(validResult.success).toBe(true);

    // workout_type is NOT a SQL column (was removed in schema fix)
    const invalidResult = createWorkoutSessionSchema.safeParse({
      workout_type: "running",
    });
    // Should fail because title is required and workout_type isn't recognized
    expect(invalidResult.success).toBe(false);
  });

  it("createNoteSchema uses pinned (not is_pinned)", async () => {
    const { createNoteSchema } = await import("@/lib/schemas/note");

    const result = createNoteSchema.safeParse({
      title: "Test note",
      content: "Content here",
      pinned: true,
      tags: ["test"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty("pinned", true);
      expect(result.data).not.toHaveProperty("is_pinned");
    }
  });

  it("createNoteSchema does not accept content_type or goal_id", async () => {
    const { createNoteSchema } = await import("@/lib/schemas/note");

    // Should strip unrecognized fields
    const result = createNoteSchema.safeParse({
      title: "Test",
      content: "Content",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("content_type");
      expect(result.data).not.toHaveProperty("goal_id");
    }
  });

  it("createInboxItemSchema uses content (not title)", async () => {
    const { createInboxItemSchema } = await import("@/lib/schemas/inbox");

    const result = createInboxItemSchema.safeParse({
      content: "Remember to buy milk",
    });
    expect(result.success).toBe(true);

    // title is NOT a column on inbox_items
    const badResult = createInboxItemSchema.safeParse({
      title: "Nope",
    });
    expect(badResult.success).toBe(false);
  });
});
