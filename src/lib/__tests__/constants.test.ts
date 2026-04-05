import { describe, it, expect } from "vitest";
import {
  AREA_SLUGS,
  AREA_DEFAULTS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TENDER_STATUSES,
  CONFIDENCE_THRESHOLDS,
} from "../constants";

describe("constants", () => {
  it("has 5 area slugs", () => {
    expect(AREA_SLUGS).toHaveLength(5);
  });

  it("has defaults for all areas", () => {
    for (const slug of AREA_SLUGS) {
      expect(AREA_DEFAULTS[slug]).toBeDefined();
      expect(AREA_DEFAULTS[slug].name).toBeTruthy();
      expect(AREA_DEFAULTS[slug].color).toBeTruthy();
      expect(AREA_DEFAULTS[slug].icon).toBeTruthy();
    }
  });

  it("has expected task statuses", () => {
    expect(TASK_STATUSES).toContain("inbox");
    expect(TASK_STATUSES).toContain("todo");
    expect(TASK_STATUSES).toContain("done");
  });

  it("has expected task priorities", () => {
    expect(TASK_PRIORITIES).toContain("critical");
    expect(TASK_PRIORITIES).toContain("low");
  });

  it("has expected tender statuses", () => {
    expect(TENDER_STATUSES).toContain("preparing");
    expect(TENDER_STATUSES).toContain("won");
    expect(TENDER_STATUSES).toContain("lost");
  });

  it("has proper confidence thresholds", () => {
    expect(CONFIDENCE_THRESHOLDS.HIGH).toBeGreaterThan(CONFIDENCE_THRESHOLDS.MEDIUM);
    expect(CONFIDENCE_THRESHOLDS.MEDIUM).toBeGreaterThan(CONFIDENCE_THRESHOLDS.LOW);
  });
});
