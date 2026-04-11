# Remediation Round 8 — Production Readiness

## Pre-audit findings

### Already correct — verified and untouched:
- middleware.ts: Standard Supabase session middleware pattern, correct for Next.js 16
- middleware correctly redirects unauthenticated users to /login for app pages
- middleware correctly skips API routes (API routes do their own auth)
- API routes (events, tasks, projects, etc.) all check auth and return JSON 401
- Export route is user-scoped via RLS + auth check
- .env.example covers all required vars with clear comments
- netlify.toml uses @netlify/plugin-nextjs with standalone mode
- next.config.ts is minimal and correct
- Supabase server/client setup follows @supabase/ssr patterns correctly
- proxy.ts not needed — middleware.ts is the correct pattern for Next.js 16

### Still open:
- No /api/health route
- No rate limiting on expensive routes
- No error.tsx or not-found.tsx at app root
- No structured logging conventions
- Export route exposes raw errors in catch
- AI config will throw opaque error if ANTHROPIC_API_KEY is missing
- No release checklist or ship status docs
- README needs update for current state

## Batch A — Deploy/Runtime/Auth Hardening
- [x] Document middleware rationale (middleware.ts is correct for Next.js 16)
- [x] Verify auth: pages redirect, APIs return JSON 401 — already correct
- [x] Add /api/health route
- [x] Add env var validation at app startup
- [x] Netlify config verified — documented

## Batch B — Security, Rate Limiting, Storage Safety
- [x] Add app-level rate limiter for AI/export/voice routes
- [x] Sanitize error responses in export and AI routes
- [x] Verify storage paths are user-scoped
- [x] Document security assumptions

## Batch C — Observability, Failure UX, Recovery
- [x] Add error.tsx and not-found.tsx
- [x] Add structured logging to critical flows
- [x] Create release-checklist.md
- [x] Document smoke-test steps

## Batch D — Final UX Truthfulness, Ship Check
- [x] Create ship-status.md
- [x] Update README for current state
- [x] Verify export honesty
