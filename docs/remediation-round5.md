# Round 5 Remediation — 2026-04-06

## R5-P0: AI Executor + AI Tool Contracts

### Tasks
- [x] P0.1: Eliminate schema drift in executor logic
  - [x] Remove `completed_at` from `complete_task` (column does not exist on tasks)
  - [x] Fix `create_task` to reject writes when area cannot be resolved (area_id is NOT NULL in SQL)
  - [x] Fix `create_event` to reject writes when area cannot be resolved (area_id is NOT NULL in SQL)
  - [x] Fix `create_event` to always produce a valid `end_time` (NOT NULL in SQL)
  - [x] Remove `success` from audit insert (column does not exist on ai_action_audit)
  - [x] Fix `weekly_summary` query: tasks.completed_at does not exist — use updated_at + status filter instead
- [x] P0.2: Create write-normalization layer for AI
  - [x] Add `normalizeToolCallInput()` that validates required fields before DB execution
  - [x] Three outcomes: normalized payload, confirmation required, or rejection
- [x] P0.3: Tighten AI tool contracts
  - [x] Make `area` required in create_task tool definition
  - [x] Make `area` required in create_event tool definition
  - [x] Align area enum with SQL defaults (add jobb, helse; keep ytly, trening for manual areas)
- [x] P0.4: Explicit event end_time rule
  - [x] Rule: if timed event has start_time but no end_time, default to +60 minutes
  - [x] Applied consistently in AI normalization
- [x] P0.5: Resolve task completion timestamp
  - [x] Option A: remove all dependence on tasks.completed_at
  - [x] Weekly summary uses updated_at with status='done' filter instead
- [x] P0.6: Honor ai_auto_execute strictly
  - [x] Write tools must not auto-execute with unresolved required fields
  - [x] Normalization layer enforces this before executor

### Schema drift fixes
- `reviewPeriodSchema`: remove 'yearly' (not in SQL enum)
- `createTrainingPlanSchema`: align with SQL columns (title not name, no plan_type/is_active/goal_description/schedule)
- Area slugs in AI tools: expanded to include jobb, helse

## R5-P1: Consistent Voice Experience

### Tasks
- [x] P1.1: Unify voice command pipeline (assistant auto-submits on final transcript)
- [x] P1.2: Unify confirmation behavior (global mic surfaces confirmation via notification)
- [x] P1.3: Remove fake fallback (fail early if no browser speech and no server STT)
- [x] P1.4: Make server STT stub explicit (client never presents it as available)
- [x] P1.5: Wire voice_tts_enabled honestly (implement basic TTS for assistant responses)
- [x] P1.6: Voice logging schema-correct (no invalid columns)

## R5-P2: Real Integration Tests

### Tasks
- [x] P2.1: Calendar integration test (create/delete event contracts)
- [x] P2.2: Assistant confirmation integration test
- [x] P2.3: Voice integration test
- [x] P2.4: Command palette integration test
- [x] P2.5: AI executor write path integration test (unresolved fields blocked)

## R5-P3: Command Palette Result Behavior

### Tasks
- [x] P3.1: Deep-link search results to specific records
- [x] P3.2: Page-level support for query param record selection
