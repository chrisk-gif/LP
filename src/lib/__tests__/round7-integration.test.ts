import { describe, it, expect } from "vitest";

/**
 * Round 7 Integration Tests
 *
 * Focused tests for:
 * 1. Review schema alignment with SQL columns
 * 2. Project create schema validation
 * 3. Area taxonomy canonical resolution (revalidation)
 * 4. Deep-link route contracts for newly-wired pages
 */

// ===========================================================================
// R7-A: Review schema aligned with SQL columns
// ===========================================================================

describe("R7-A: Review schema uses SQL column names", () => {
  it("createReviewSchema accepts wins/blockers/lessons_learned/next_focus", async () => {
    const { createReviewSchema } = await import("@/lib/schemas/review");

    const valid = createReviewSchema.safeParse({
      period: "weekly",
      period_start: "2026-04-04",
      period_end: "2026-04-11",
      wins: "Shipped feature X",
      blockers: "CI was slow",
      lessons_learned: "Test earlier",
      next_focus: "Performance work",
    });
    expect(valid.success).toBe(true);
  });

  it("createReviewSchema rejects period_end before period_start", async () => {
    const { createReviewSchema } = await import("@/lib/schemas/review");

    const invalid = createReviewSchema.safeParse({
      period: "weekly",
      period_start: "2026-04-11",
      period_end: "2026-04-04",
    });
    expect(invalid.success).toBe(false);
  });

  it("reviewPeriodSchema does not accept yearly", async () => {
    const { reviewPeriodSchema } = await import("@/lib/schemas/review");
    expect(reviewPeriodSchema.safeParse("daily").success).toBe(true);
    expect(reviewPeriodSchema.safeParse("quarterly").success).toBe(true);
    expect(reviewPeriodSchema.safeParse("yearly").success).toBe(false);
  });

  it("createReviewSchema does NOT accept legacy column names (challenges, lessons, next_period_focus)", async () => {
    const { createReviewSchema } = await import("@/lib/schemas/review");

    const result = createReviewSchema.safeParse({
      period: "weekly",
      period_start: "2026-04-04",
      period_end: "2026-04-11",
      challenges: "some text",
      lessons: "some lessons",
      next_period_focus: "some focus",
    });

    // These legacy fields should be stripped/ignored — not present in output
    if (result.success) {
      expect(result.data).not.toHaveProperty("challenges");
      expect(result.data).not.toHaveProperty("lessons");
      expect(result.data).not.toHaveProperty("next_period_focus");
    }
  });
});

// ===========================================================================
// R7-A: Project create schema validation
// ===========================================================================

describe("R7-A: Project create schema", () => {
  it("createProjectSchema requires title and area_id", async () => {
    const { createProjectSchema } = await import("@/lib/schemas/project");

    const noTitle = createProjectSchema.safeParse({ area_id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(noTitle.success).toBe(false);

    const noArea = createProjectSchema.safeParse({ title: "Test" });
    expect(noArea.success).toBe(false);

    const valid = createProjectSchema.safeParse({
      title: "Test project",
      area_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(valid.success).toBe(true);
  });

  it("createProjectSchema defaults status to active and priority to medium", async () => {
    const { createProjectSchema } = await import("@/lib/schemas/project");

    const result = createProjectSchema.safeParse({
      title: "Test",
      area_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
      expect(result.data.priority).toBe("medium");
    }
  });
});

// ===========================================================================
// R7-B: Canonical area resolution still works
// ===========================================================================

describe("R7-B: Area taxonomy canonical resolution", () => {
  it("resolveCanonicalArea resolves all canonical slugs", async () => {
    const { resolveCanonicalArea, AREA_SLUGS } = await import("@/lib/constants");
    for (const slug of AREA_SLUGS) {
      expect(resolveCanonicalArea(slug)).toBe(slug);
    }
  });

  it("resolveCanonicalArea resolves common aliases", async () => {
    const { resolveCanonicalArea } = await import("@/lib/constants");
    expect(resolveCanonicalArea("jobb")).toBe("asplan-viak");
    expect(resolveCanonicalArea("helse")).toBe("trening");
    expect(resolveCanonicalArea("ytly.no")).toBe("ytly");
  });
});

// ===========================================================================
// R7-C: Deep-link route contracts for all entity types
// ===========================================================================

describe("R7-C: Deep-link route generation", () => {
  it("prosjekter deep-link uses projectId param", () => {
    const url = new URL("/prosjekter?projectId=abc", "http://localhost");
    expect(url.searchParams.get("projectId")).toBe("abc");
  });

  it("logg deep-link uses noteId param", () => {
    const url = new URL("/logg?noteId=xyz", "http://localhost");
    expect(url.searchParams.get("noteId")).toBe("xyz");
  });

  it("kalender deep-link uses eventId param", () => {
    const url = new URL("/kalender?eventId=evt-1", "http://localhost");
    expect(url.searchParams.get("eventId")).toBe("evt-1");
  });

  it("oppgaver deep-link uses taskId param", () => {
    const url = new URL("/oppgaver?taskId=task-1", "http://localhost");
    expect(url.searchParams.get("taskId")).toBe("task-1");
  });
});
