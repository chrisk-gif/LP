import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatShortDate,
  formatRelative,
  parseNorwegianDate,
  parseNorwegianTime,
  isOverdue,
  isDueSoon,
  daysUntil,
} from "../dates";

describe("formatDate", () => {
  it("formats a date in Norwegian", () => {
    const result = formatDate("2026-04-15");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });
});

describe("formatShortDate", () => {
  it("formats a short date", () => {
    const result = formatShortDate("2026-04-15");
    expect(result).toContain("15");
  });
});

describe("parseNorwegianDate", () => {
  it('parses "i morgen"', () => {
    const result = parseNorwegianDate("i morgen");
    expect(result).not.toBeNull();
    if (result) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(result.getDate()).toBe(tomorrow.getDate());
    }
  });

  it('parses "i dag"', () => {
    const result = parseNorwegianDate("i dag");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.getDate()).toBe(new Date().getDate());
    }
  });

  it("parses weekday names", () => {
    const result = parseNorwegianDate("på mandag");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.getDay()).toBe(1); // Monday
    }
  });

  it('parses "den 15." date pattern', () => {
    const result = parseNorwegianDate("den 15.");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.getDate()).toBe(15);
    }
  });

  it("returns null for unrecognized input", () => {
    const result = parseNorwegianDate("random text");
    expect(result).toBeNull();
  });
});

describe("parseNorwegianTime", () => {
  it('parses "klokken 14"', () => {
    const result = parseNorwegianTime("klokken 14");
    expect(result).toBe("14:00");
  });

  it('parses "kl 09:30"', () => {
    const result = parseNorwegianTime("kl 09:30");
    expect(result).toBe("09:30");
  });

  it('parses "kl. 8"', () => {
    const result = parseNorwegianTime("kl. 8");
    expect(result).toBe("08:00");
  });

  it("parses bare time like 14:30", () => {
    const result = parseNorwegianTime("14:30");
    expect(result).toBe("14:30");
  });

  it("returns null for no time", () => {
    const result = parseNorwegianTime("ingen tid");
    expect(result).toBeNull();
  });
});

describe("isOverdue", () => {
  it("returns true for past dates", () => {
    expect(isOverdue("2020-01-01")).toBe(true);
  });

  it("returns false for future dates", () => {
    expect(isOverdue("2030-01-01")).toBe(false);
  });
});

describe("isDueSoon", () => {
  it("returns true for dates within threshold", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isDueSoon(tomorrow.toISOString().split("T")[0])).toBe(true);
  });

  it("returns false for dates far in the future", () => {
    expect(isDueSoon("2030-01-01")).toBe(false);
  });
});

describe("daysUntil", () => {
  it("returns positive for future dates", () => {
    expect(daysUntil("2030-01-01")).toBeGreaterThan(0);
  });

  it("returns negative for past dates", () => {
    expect(daysUntil("2020-01-01")).toBeLessThan(0);
  });
});
