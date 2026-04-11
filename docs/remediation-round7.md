# Remediation Round 7

## Pre-audit findings (from Round 6)

### Already verified/working — DO NOT TOUCH:
- ytly "Nytt initiativ" — real, persists via /api/projects
- asplan-viak "Nytt tilbud" — real, persists via /api/tenders
- mål "Nytt mål" — real, persists via /api/goals
- trening "Logg økt" — real, persists via /api/workouts
- prosjekter deep-link (?projectId) — working from R6
- logg note deep-link (?noteId) — working from R6
- calendar event deep-link (?eventId) — working from R6

### Still open:
- prosjekter "Nytt prosjekt" button — DEAD (no onClick, no form)
- logg "Ny gjennomgang" button — DEAD (no onClick, no form)
- innstillinger — disabled "Kommer snart" controls still visible
- calendar area-loading hack (throwaway fetch + direct Supabase)
- no /api/areas route exists
- no /api/reviews route exists
- prosjekter/logg use direct Supabase client instead of API routes

## Batch A — Finish Dead/Incomplete Product Flows

- [x] Implement prosjekter create flow (real form → /api/projects POST)
- [x] Implement logg/review create flow (real form → /api/reviews POST)
- [x] Create /api/reviews route (GET + POST)
- [x] Verify ytly/asplan-viak/maal/trening CTAs (already real)

## Batch B — Data Access Consolidation + Areas/API Cleanup

- [x] Create /api/areas route
- [x] Fix calendar area-loading to use /api/areas
- [x] Move prosjekter from direct Supabase to /api/projects
- [x] Move logg from direct Supabase to /api/reviews + /api/notes

## Batch C — Truthful Settings, UX Cleanup, Norwegian Copy

- [x] Fix innstillinger disabled/placeholder controls
- [x] Fix Norwegian copy issues in touched files
- [x] Clean up error/success messages
