# Livsplanlegg Remediation Log

## Date: 2026-04-06

### P0 — Blockers and Structural Repair

- [x] P0.1 Route audit and 404 elimination
  - Fixed Sidebar.tsx routes: /dashboard→/, /i-dag→/idag, /mal→/maal
  - Removed non-existent child routes /asplan-viak/tilbud and /asplan-viak/oppgaver
  - Fixed CommandPalette.tsx routes (same mismatches)
  - Added redirects in next.config.ts: /dashboard→/, /i-dag→/idag, /mal→/maal
  - Removed hardcoded badge count from Innboks nav item

- [x] P0.2 Fix middleware auth interception
  - Added API route exclusion from redirect logic — API routes no longer redirect to /login
  - API routes return 401 JSON when unauthenticated
  - Kept middleware.ts (Next.js 16 still uses this convention, not proxy.ts)

- [x] P0.3 Normalize domain model
  - Rewrote `src/types/database.ts` to match actual SQL schema exactly
  - Fixed all zod schemas to match SQL enums:
    - task.ts: status→inbox/todo/in_progress/waiting/done/archived, priority→critical/high/medium/low
    - event.ts: event_type→meeting/deadline/reminder/block/personal/other
    - finance.ts: type→bill/subscription/receipt/reimbursement/savings/investment/other, status→upcoming/due/overdue/paid/archived
    - goal.ts: horizon→short-term/monthly/quarterly/yearly/long-term
    - tender.ts: status→identified/preparing/submitted/won/lost/cancelled
    - inbox.ts: source→manual/voice/ai, item_type→task/idea/note/bill/event/training/voice_memo
  - Created migration `00004_normalize_areas.sql`:
    - Migrates jobb→asplan-viak, helse→trening for existing users
    - Adds missing ytly and trening areas
    - Replaces handle_new_user trigger with canonical 5 areas
  - Updated seed.sql to use canonical areas (asplan-viak, ytly, privat, okonomi, trening)
  - Constants.ts was already correct and unchanged

- [x] P0.4 Fix schema/API contract mismatches
  - All API route handlers now validate with zod before hitting Supabase
  - Added PATCH to events and finance routes (were missing)
  - Added GET to tasks/[id] route
  - area_id is required in create schemas matching DB NOT NULL constraint
  - Event end_time is required in create schema matching DB NOT NULL

- [x] P0.5 Netlify deployment cleanup
  - netlify.toml was already correctly configured
  - next.config.ts kept minimal with redirects added

### P1 — Real Data Integration

- [x] P1.1 Remove demo data from authenticated pages
  - Removed inline demo arrays from all 15 authenticated pages
  - No shipped page renders fake data — only real DB data or empty states

- [x] P1.2 Make Tasks fully real (DB-backed CRUD)
  - /oppgaver page fetches real tasks, areas, projects, goals
  - Quick add creates tasks via POST /api/tasks
  - Toggle status via PATCH /api/tasks/[id]
  - Create/edit via dialog with real area/project/goal selectors
  - TaskForm accepts dynamic projects/goals props instead of hardcoded options

- [x] P1.3 Make Calendar and Today real
  - /kalender fetches real events and tasks based on visible date range
  - Re-fetches on view mode or date change
  - /idag fetches today's tasks, events, and overdue items
  - Task toggle works through API

- [x] P1.4 Make Finance real
  - /okonomi fetches real finance_items
  - "Merk som betalt" button patches status to paid
  - Create dialog for new finance items
  - Stats computed from real data

- [x] P1.5 Replace workspace demo pages with DB-backed read models
  - /asplan-viak: real tenders and tasks filtered by area
  - /ytly: real projects, tasks, goals for ytly area
  - /privat: real tasks, events, goals, notes for privat area
  - /trening: real workout sessions and training plans
  - /logg: real reviews
  - /maal: real goals with area info
  - /prosjekter: real projects with area info
  - /innboks: real inbox items with create/process/delete
  - Dashboard: all widgets query real data (StatsBar, all 9 widgets)
  - TopBar: dynamic profile name/avatar, working logout

### P2 — AI Execution, Voice, Settings, Quality

- [x] P2.1 AI typed executor pipeline
  - Created `src/lib/ai/executor.ts` with typed executors for:
    - create_task, create_event, complete_task, create_finance_item
    - mark_paid, log_workout, create_note, reschedule, query_data
  - All writes go through Supabase with RLS enforced
  - All actions logged to ai_action_audit table
  - AI command route executes tool calls when confidence is high
  - Confirmation flow for medium-confidence actions
  - Area slug resolution from AI output to DB area_id

- [x] P2.2 Voice end-to-end fix
  - MicButton uses browser SpeechRecognition (nb-NO) when available
  - Falls back to audio recording + /api/voice/transcribe
  - Transcript routed through /api/ai/command for execution
  - Shows transcript and AI response in popup
  - Graceful degradation when STT not configured (clear user message)
  - Storage upload path user-scoped: ${userId}/voice-*.webm
  - Voice commands logged in voice_commands table

- [x] P2.3 Settings persistence and export
  - Settings page loads/saves real user_preferences from Supabase
  - Theme toggle (lys/mork/system) persists and applies dark mode class
  - AI auto-execute toggle persists
  - Voice TTS toggle persists
  - Export JSON downloads from /api/export
  - Export CSV converts JSON export to CSV client-side
  - QuickAdd actually submits to correct APIs based on type

- [x] P2.4 Tests (110 tests, all passing)
  - navigation.test.ts: verifies canonical routes, no deprecated routes
  - schemas.test.ts: validates all zod schemas match SQL enums
  - ai-executor.test.ts: tests executor error paths and structure
  - constants.test.ts: expanded to verify all enum alignment
  - dates.test.ts: existing tests still passing
  - e2e/navigation.spec.ts: redirect tests for deprecated routes

### Validation Results

- `pnpm typecheck`: 0 errors
- `pnpm lint`: 0 errors, 12 warnings (unused vars in calendar sub-components)
- `pnpm test`: 110 tests passing across 5 test files
- `pnpm build`: successful, all 25 routes generated

### Known Limitations (post-remediation)

- AI execution requires valid ANTHROPIC_API_KEY environment variable
- Voice STT server-side requires external provider (Whisper etc.) — browser speech works without config
- Browser speech recognition depends on browser support (Chrome/Edge recommended)
- Recurring items generation is structural but automated scheduling is not yet implemented
- E2E tests with auth require running Supabase instance
- Calendar event create/edit dialog not yet implemented (click handlers are TODOs)
- No drag-and-drop rescheduling in calendar views
- Notification push not yet implemented (settings UI shows "Kommer snart")
