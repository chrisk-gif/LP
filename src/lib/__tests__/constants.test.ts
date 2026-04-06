import { describe, it, expect } from "vitest";
import {
  AREA_SLUGS,
  AREA_DEFAULTS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TENDER_STATUSES,
  FINANCE_TYPES,
  FINANCE_STATUSES,
  CONFIDENCE_THRESHOLDS,
} from "../constants";

describe("AREA_SLUGS", () => {
  it("has exactly 5 area slugs", () => {
    expect(AREA_SLUGS).toHaveLength(5);
  });

  it("contains exactly: asplan-viak, ytly, privat, okonomi, trening", () => {
    expect([...AREA_SLUGS]).toEqual([
      "asplan-viak",
      "ytly",
      "privat",
      "okonomi",
      "trening",
    ]);
  });
});

describe("AREA_DEFAULTS", () => {
  it("has defaults for every area slug", () => {
    for (const slug of AREA_SLUGS) {
      expect(AREA_DEFAULTS[slug]).toBeDefined();
      expect(AREA_DEFAULTS[slug].name).toBeTruthy();
      expect(AREA_DEFAULTS[slug].color).toBeTruthy();
      expect(AREA_DEFAULTS[slug].icon).toBeTruthy();
    }
  });

  it("colors are valid hex codes", () => {
    for (const slug of AREA_SLUGS) {
      expect(AREA_DEFAULTS[slug].color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("TASK_STATUSES", () => {
  it("matches SQL enum: inbox, todo, in_progress, waiting, done, archived", () => {
    expect([...TASK_STATUSES]).toEqual([
      "inbox",
      "todo",
      "in_progress",
      "waiting",
      "done",
      "archived",
    ]);
  });

  it("has exactly 6 statuses", () => {
    expect(TASK_STATUSES).toHaveLength(6);
  });

  it("does not contain deprecated values", () => {
    expect(TASK_STATUSES).not.toContain("backlog");
    expect(TASK_STATUSES).not.toContain("cancelled");
  });
});

describe("TASK_PRIORITIES", () => {
  it("matches SQL enum: critical, high, medium, low", () => {
    expect([...TASK_PRIORITIES]).toEqual(["critical", "high", "medium", "low"]);
  });

  it("has exactly 4 priorities", () => {
    expect(TASK_PRIORITIES).toHaveLength(4);
  });

  it("does not contain deprecated value 'urgent'", () => {
    expect(TASK_PRIORITIES).not.toContain("urgent");
  });
});

describe("TENDER_STATUSES", () => {
  it("has expected tender statuses", () => {
    expect(TENDER_STATUSES).toContain("identified");
    expect(TENDER_STATUSES).toContain("preparing");
    expect(TENDER_STATUSES).toContain("submitted");
    expect(TENDER_STATUSES).toContain("won");
    expect(TENDER_STATUSES).toContain("lost");
    expect(TENDER_STATUSES).toContain("cancelled");
  });

  it("has exactly 6 statuses", () => {
    expect(TENDER_STATUSES).toHaveLength(6);
  });
});

describe("FINANCE_TYPES", () => {
  it("matches SQL enum: bill, subscription, receipt, reimbursement, savings, investment, other", () => {
    expect([...FINANCE_TYPES]).toEqual([
      "bill",
      "subscription",
      "receipt",
      "reimbursement",
      "savings",
      "investment",
      "other",
    ]);
  });

  it("has exactly 7 types", () => {
    expect(FINANCE_TYPES).toHaveLength(7);
  });

  it("does not contain deprecated values", () => {
    expect(FINANCE_TYPES).not.toContain("income");
    expect(FINANCE_TYPES).not.toContain("expense");
    expect(FINANCE_TYPES).not.toContain("transfer");
  });
});

describe("FINANCE_STATUSES", () => {
  it("matches SQL enum: upcoming, due, overdue, paid, archived", () => {
    expect([...FINANCE_STATUSES]).toEqual([
      "upcoming",
      "due",
      "overdue",
      "paid",
      "archived",
    ]);
  });

  it("has exactly 5 statuses", () => {
    expect(FINANCE_STATUSES).toHaveLength(5);
  });
});

describe("CONFIDENCE_THRESHOLDS", () => {
  it("has HIGH > MEDIUM > LOW", () => {
    expect(CONFIDENCE_THRESHOLDS.HIGH).toBeGreaterThan(CONFIDENCE_THRESHOLDS.MEDIUM);
    expect(CONFIDENCE_THRESHOLDS.MEDIUM).toBeGreaterThan(CONFIDENCE_THRESHOLDS.LOW);
  });

  it("all values are between 0 and 1", () => {
    for (const value of Object.values(CONFIDENCE_THRESHOLDS)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
