import { describe, it, expect } from "vitest";
import { createTaskSchema, taskStatusSchema, taskPrioritySchema } from "@/lib/schemas/task";
import { createEventSchema } from "@/lib/schemas/event";
import {
  createFinanceItemSchema,
  financeTypeSchema,
  financeStatusSchema,
} from "@/lib/schemas/finance";

// ---------------------------------------------------------------------------
// Task schema
// ---------------------------------------------------------------------------

describe("createTaskSchema", () => {
  const validTask = {
    area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    title: "Write unit tests",
  };

  it("accepts valid input with area_id UUID and title", () => {
    const result = createTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("accepts valid input with all optional fields", () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      description: "Comprehensive test coverage",
      status: "in_progress",
      priority: "high",
      due_date: "2026-05-01",
      tags: ["testing", "vitest"],
      estimated_minutes: 60,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createTaskSchema.safeParse({
      area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority value 'urgent' (old wrong value)", () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      priority: "urgent",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid area_id (not a UUID)", () => {
    const result = createTaskSchema.safeParse({
      area_id: "not-a-uuid",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("defaults status to 'todo' when omitted", () => {
    const result = createTaskSchema.parse(validTask);
    expect(result.status).toBe("todo");
  });

  it("defaults priority to 'medium' when omitted", () => {
    const result = createTaskSchema.parse(validTask);
    expect(result.priority).toBe("medium");
  });
});

describe("taskStatusSchema", () => {
  it.each(["inbox", "todo", "in_progress", "waiting", "done", "archived"])(
    "accepts valid status '%s'",
    (status) => {
      const result = taskStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    }
  );

  it("rejects old wrong value 'backlog'", () => {
    const result = taskStatusSchema.safeParse("backlog");
    expect(result.success).toBe(false);
  });

  it("rejects old wrong value 'cancelled'", () => {
    const result = taskStatusSchema.safeParse("cancelled");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = taskStatusSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("taskPrioritySchema", () => {
  it.each(["critical", "high", "medium", "low"])(
    "accepts valid priority '%s'",
    (priority) => {
      const result = taskPrioritySchema.safeParse(priority);
      expect(result.success).toBe(true);
    }
  );

  it("rejects 'urgent' (not a valid priority)", () => {
    const result = taskPrioritySchema.safeParse("urgent");
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Event schema
// ---------------------------------------------------------------------------

describe("createEventSchema", () => {
  const validEvent = {
    area_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    title: "Team standup",
    start_time: "2026-04-10T09:00:00Z",
    end_time: "2026-04-10T09:30:00Z",
  };

  it("accepts valid input with required fields", () => {
    const result = createEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it("requires area_id", () => {
    const { area_id, ...noArea } = validEvent;
    const result = createEventSchema.safeParse(noArea);
    expect(result.success).toBe(false);
  });

  it("requires title", () => {
    const { title, ...noTitle } = validEvent;
    const result = createEventSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it("requires start_time", () => {
    const { start_time, ...noStart } = validEvent;
    const result = createEventSchema.safeParse(noStart);
    expect(result.success).toBe(false);
  });

  it("requires end_time", () => {
    const { end_time, ...noEnd } = validEvent;
    const result = createEventSchema.safeParse(noEnd);
    expect(result.success).toBe(false);
  });

  it("rejects end_time before start_time", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      start_time: "2026-04-10T10:00:00Z",
      end_time: "2026-04-10T09:00:00Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endTimeError = result.error.issues.find(
        (issue) => issue.path.includes("end_time")
      );
      expect(endTimeError).toBeDefined();
    }
  });

  it("accepts end_time equal to start_time (zero-duration event)", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      start_time: "2026-04-10T09:00:00Z",
      end_time: "2026-04-10T09:00:00Z",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Finance schema
// ---------------------------------------------------------------------------

describe("createFinanceItemSchema", () => {
  const validFinance = {
    title: "Electricity bill",
    type: "bill" as const,
  };

  it("accepts valid input with title and type", () => {
    const result = createFinanceItemSchema.safeParse(validFinance);
    expect(result.success).toBe(true);
  });

  it("accepts valid input with all optional fields", () => {
    const result = createFinanceItemSchema.safeParse({
      ...validFinance,
      amount: 1500,
      currency: "NOK",
      vendor: "Fjordkraft",
      due_date: "2026-04-20",
      category: "utilities",
      status: "upcoming",
    });
    expect(result.success).toBe(true);
  });

  it("defaults currency to NOK", () => {
    const result = createFinanceItemSchema.parse(validFinance);
    expect(result.currency).toBe("NOK");
  });

  it("defaults status to upcoming", () => {
    const result = createFinanceItemSchema.parse(validFinance);
    expect(result.status).toBe("upcoming");
  });

  it("rejects missing title", () => {
    const result = createFinanceItemSchema.safeParse({ type: "bill" });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = createFinanceItemSchema.safeParse({ title: "Test" });
    expect(result.success).toBe(false);
  });
});

describe("financeTypeSchema", () => {
  it.each(["bill", "subscription", "receipt", "reimbursement", "savings", "investment", "other"])(
    "accepts canonical value '%s'",
    (type) => {
      const result = financeTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    }
  );

  it("rejects old wrong value 'income'", () => {
    const result = financeTypeSchema.safeParse("income");
    expect(result.success).toBe(false);
  });

  it("rejects old wrong value 'expense'", () => {
    const result = financeTypeSchema.safeParse("expense");
    expect(result.success).toBe(false);
  });

  it("rejects old wrong value 'transfer'", () => {
    const result = financeTypeSchema.safeParse("transfer");
    expect(result.success).toBe(false);
  });
});

describe("financeStatusSchema", () => {
  it.each(["upcoming", "due", "overdue", "paid", "archived"])(
    "accepts canonical value '%s'",
    (status) => {
      const result = financeStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    }
  );

  it("rejects arbitrary string", () => {
    const result = financeStatusSchema.safeParse("pending");
    expect(result.success).toBe(false);
  });
});
