import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Round 8 Production Hardening Tests
 *
 * Tests for:
 * 1. Rate limiter behavior
 * 2. AI config env var validation
 * 3. Health route contract
 * 4. Auth middleware API route behavior
 */

// ===========================================================================
// R8-B: Rate limiter
// ===========================================================================

describe("R8-B: Rate limiter", () => {
  it("allows requests within limit", async () => {
    const { createRateLimiter } = await import("@/lib/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });

    expect(limiter.check("user-1").allowed).toBe(true);
    expect(limiter.check("user-1").allowed).toBe(true);
    expect(limiter.check("user-1").allowed).toBe(true);
  });

  it("blocks requests over limit", async () => {
    const { createRateLimiter } = await import("@/lib/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 2 });

    limiter.check("user-2");
    limiter.check("user-2");
    const result = limiter.check("user-2");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks users independently", async () => {
    const { createRateLimiter } = await import("@/lib/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 1 });

    expect(limiter.check("user-a").allowed).toBe(true);
    expect(limiter.check("user-b").allowed).toBe(true);
    expect(limiter.check("user-a").allowed).toBe(false);
    expect(limiter.check("user-b").allowed).toBe(false);
  });

  it("resets after window expires", async () => {
    const { createRateLimiter } = await import("@/lib/rate-limit");
    const limiter = createRateLimiter({ windowMs: 50, maxRequests: 1 });

    expect(limiter.check("user-3").allowed).toBe(true);
    expect(limiter.check("user-3").allowed).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 60));

    expect(limiter.check("user-3").allowed).toBe(true);
  });

  it("returns correct remaining count", async () => {
    const { createRateLimiter } = await import("@/lib/rate-limit");
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });

    expect(limiter.check("user-4").remaining).toBe(2);
    expect(limiter.check("user-4").remaining).toBe(1);
    expect(limiter.check("user-4").remaining).toBe(0);
  });

  it("pre-configured limiters exist with correct names", async () => {
    const { aiCommandLimiter, exportLimiter, voiceLimiter } = await import("@/lib/rate-limit");
    expect(aiCommandLimiter).toBeDefined();
    expect(aiCommandLimiter.check).toBeDefined();
    expect(exportLimiter).toBeDefined();
    expect(voiceLimiter).toBeDefined();
  });
});

// ===========================================================================
// R8-A: AI config env var validation
// ===========================================================================

describe("R8-A: AI config fails explicitly without API key", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  it("getAnthropicClient throws when ANTHROPIC_API_KEY is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const { getAnthropicClient } = await import("@/lib/ai/config");

    expect(() => getAnthropicClient()).toThrow("ANTHROPIC_API_KEY");

    // Restore
    if (originalKey) process.env.ANTHROPIC_API_KEY = originalKey;
  });
});

// ===========================================================================
// R8-A: Health route contract
// ===========================================================================

describe("R8-A: Health route contract", () => {
  it("health route module exports GET handler", async () => {
    const mod = await import("@/app/api/health/route");
    expect(mod.GET).toBeDefined();
    expect(typeof mod.GET).toBe("function");
  });
});

// ===========================================================================
// R8-C: Error boundary and not-found exist
// ===========================================================================

describe("R8-C: Error and not-found pages exist", () => {
  it("error.tsx exports a default component", async () => {
    const mod = await import("@/app/error");
    expect(mod.default).toBeDefined();
  });

  it("not-found.tsx exports a default component", async () => {
    const mod = await import("@/app/not-found");
    expect(mod.default).toBeDefined();
  });
});
