# Remediation Round 3

## Canonical Choice

**SQL schema is canonical.** Code must conform to existing SQL tables. No new migrations unless the product genuinely requires fields that don't exist.

## Schema Mismatches Found and Resolved

### ai_action_audit
- SQL requires `agent_name` (NOT NULL) and `action_type` (NOT NULL) but executor wrote `action` and omitted `agent_name` entirely — every audit insert silently failed
- SQL has `confidence`, `auto_executed`, `confirmed_by_user` that were never populated
- **Fix:** Updated `logAudit` to use correct column names and populate all required fields

### workout_sessions
- SQL table has NO `area_id` column, but `executeLogWorkout` tried to insert `area_id`
- **Fix:** Removed `area_id` from workout insert in executor

### Training Zod schema
- `createWorkoutSessionSchema` had fields (`workout_type`, `scheduled_date`, `started_at`, `ended_at`, `distance_km`, `calories`, `heart_rate_avg`, `heart_rate_max`, `perceived_effort`, `exercises`, `is_completed`) that don't exist in SQL
- SQL table uses: `plan_id`, `title`, `session_type`, `planned_at`, `completed_at`, `duration_minutes`, `intensity`, `notes`, `metrics`
- **Fix:** Aligned Zod schema to match SQL table

### QuickAdd payloads
- Workout path wrote `session_date` (not a column) — fixed to use `completed_at`
- Inbox path wrote `title` and `raw_text` (not columns) — fixed to use `content`

### Finance create dialog
- Used `FormData.get("type")` which does NOT capture shadcn Select values (not native select)
- **Fix:** Switched to controlled React state for all form fields

## Fields Removed from Code (Invalid)
- `area_id` from workout executor insert
- `session_date` from QuickAdd workout
- `title` and `raw_text` from QuickAdd inbox
- `action` field renamed to `action_type` in audit logger
- Numerous training Zod fields not present in SQL

## Changes by Phase

### R3-P0: AI / Voice / Schema Consistency
- [x] Audit and align schema across all affected domains
- [x] Fix ai_action_audit logging (agent_name, action_type, confidence, auto_executed)
- [x] Fix executor: remove invalid `area_id` from workout insert
- [x] Respect ai_auto_execute from user_preferences server-side
- [x] Implement confirmation UI in assistant page
- [x] Unify voice pipeline: assistant uses shared useVoice hook

### R3-P1: Write Flow Fixes
- [x] QuickAdd: fix workout and inbox payloads, move notes/workouts/inbox behind API routes
- [x] Inbox page: move writes behind API routes
- [x] Finance create: switch to controlled state (not FormData)
- [x] Workspace CTAs: implement real create flows or remove dead buttons

### R3-P2: Today / Calendar / Command Palette
- [x] Today: "Hva er viktigst?" calls AI, "Plan min dag" shows structured plan
- [x] Today: day notes persist via API
- [x] Today: "Legg til oppgave" opens QuickAdd
- [x] Calendar: slot click opens create event dialog
- [x] Calendar: event click opens detail/edit dialog
- [x] Command palette: quick actions open QuickAdd

### R3-P3: Tests
- [x] AI executor schema validation tests (audit logging columns, workout area_id removal)
- [x] Zod schema alignment tests (training, note, inbox schemas match SQL)
- [x] AI auto-execute preference test (executeToolCall passes options)
- [x] Schema field validation tests (workout_type rejected, pinned not is_pinned, content not title)

## Final Validation
- pnpm typecheck: PASS
- pnpm lint: 0 errors (12 pre-existing warnings in untouched files)
- pnpm test: 118 tests passed
- pnpm build: PASS
