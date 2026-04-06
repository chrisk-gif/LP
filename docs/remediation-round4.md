# Remediation Round 4

## Canonical: SQL schema wins

## R4-P0: Calendar Event Contracts
- [x] area_id NOT NULL in SQL but missing from create dialog → add area selector to dialog
- [x] Zod createEventSchema requires area_id → keep it required
- [x] Delete UI sends query param but route reads JSON body → fix to JSON body
- [x] Make create/edit/delete contracts consistent

## R4-P1: AI Executor Schema Drift
- [x] mark_paid uses `paid_at` → SQL has `paid_date`
- [x] active_tenders query uses `deadline` → SQL has `due_date`  
- [x] active_goals query uses `progress` → SQL has `current_progress`
- [x] All other fields validated against SQL

## R4-P2: Project Schema Alignment
- [x] Zod uses `name` → SQL has `title`
- [x] Zod uses `target_date` → SQL has `due_date`
- [x] Zod uses `on_hold` → SQL has `backlog`
- [x] Zod has `color`, `sort_order`, `completed_at` → none exist in SQL
- [x] Zod has area_id optional → SQL has NOT NULL
- [x] ytly create dialog sends correct payload

## R4-P3: Voice Honest Degradation
- [x] Single coherent voice model
- [x] Honest browser-unavailable messaging
- [x] No fake server STT fallback paths

## R4-P4: Validation Tightening
- [x] All write routes validate bodies
- [x] DELETE routes validate ID
- [x] No raw unvalidated updates

## R4-P5: Today Page Logic
- [x] Overdue = strictly before today
- [x] Day notes no duplicates

## R4-P6: Command Palette Search
- [x] Real search via /api/search endpoint
- [x] Remove fake "recent actions" placeholder

## R4-P7: Auth/Deploy Cleanup
- [x] Check middleware behavior
- [x] Verify auth gates

## Tests
- [x] Calendar create/delete contract
- [x] Project create contract
- [x] AI executor stale fields
- [x] Notes PATCH validation
- [x] Today overdue classification
- [x] Command palette search
- [x] Voice degradation
