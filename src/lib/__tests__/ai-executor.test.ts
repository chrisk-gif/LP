import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the AI executor module.
 *
 * We mock the Supabase server client so that we can test the executor logic
 * (tool dispatch, input validation, error paths) without hitting a real database.
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
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null });
  const mockEq = vi.fn().mockReturnThis();
  const mockIlike = vi.fn().mockReturnThis();
  const mockNeq = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();

  const fromMock = vi.fn().mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    single: mockSingle,
    eq: mockEq,
    ilike: mockIlike,
    neq: mockNeq,
    limit: mockLimit,
    update: vi.fn().mockReturnThis(),
  });

  // Make chaining work
  mockInsert.mockReturnValue({ select: mockSelect, single: mockSingle });
  mockSelect.mockReturnValue({ single: mockSingle, eq: mockEq, ilike: mockIlike, neq: mockNeq, limit: mockLimit });
  mockEq.mockReturnValue({ single: mockSingle, select: mockSelect, eq: mockEq, neq: mockNeq, limit: mockLimit });
  mockIlike.mockReturnValue({ single: mockSingle, eq: mockEq, neq: mockNeq, limit: mockLimit });
  mockNeq.mockReturnValue({ single: mockSingle, eq: mockEq, neq: mockNeq, ilike: mockIlike, limit: mockLimit, or: vi.fn().mockReturnThis() });
  mockLimit.mockReturnValue({ single: mockSingle });

  return {
    from: fromMock,
    _mocks: { mockInsert, mockSelect, mockSingle },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
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
