/**
 * Simple in-memory rate limiter for production API abuse protection.
 *
 * Limits: per-user (by userId or IP), sliding window.
 * This is app-level protection, not infra-grade. For high-traffic production
 * use, replace with Redis-backed or edge-level rate limiting.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 *   const result = limiter.check(userId);
 *   if (!result.allowed) return NextResponse.json({ error: "..." }, { status: 429 });
 */

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window per key */
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup to prevent memory leak
  const CLEANUP_INTERVAL = Math.max(config.windowMs * 2, 60_000);
  let lastCleanup = Date.now();

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart > config.windowMs) {
        store.delete(key);
      }
    }
  }

  function check(key: string): RateLimitResult {
    cleanup();
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart > config.windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    entry.count += 1;
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetAt = entry.windowStart + config.windowMs;

    if (entry.count > config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return { allowed: true, remaining, resetAt };
  }

  return { check };
}

// Pre-configured limiters for critical routes
export const aiCommandLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
});

export const exportLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 3,
});

export const voiceLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 15,
});
