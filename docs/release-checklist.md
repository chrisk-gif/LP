# Release Checklist — Livsplanlegg

## Required Environment Variables

| Variable | Required | Where |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Netlify env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Netlify env |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Netlify env |
| `ANTHROPIC_API_KEY` | For AI features | Netlify env |
| `ANTHROPIC_MODEL_ROUTER` | No (defaults to claude-sonnet-4) | Netlify env |
| `ANTHROPIC_MODEL_PLANNER` | No (defaults to claude-opus-4) | Netlify env |

## Pre-deploy

1. Ensure all migrations are applied to Supabase production:
   - `supabase/FULL_SETUP.sql` contains the complete schema
   - RLS policies must be enabled on all tables
2. Verify Supabase storage buckets exist: `voice-audio`, `attachments`
3. Verify areas seed data exists (5 canonical areas: asplan-viak, ytly, privat, okonomi, trening)

## Netlify Build

- Build command: `pnpm build`
- Publish directory: `.next`
- Node version: 20
- Plugin: `@netlify/plugin-nextjs` (standalone mode)
- `NEXT_PRIVATE_STANDALONE=true` must be set

## Post-deploy Smoke Test

1. **Health check**: `GET /api/health` — should return `{"status":"healthy"}`
2. **Login**: Navigate to `/login`, sign in with Supabase auth
3. **Dashboard**: After login, verify `/` loads with data
4. **Create task**: Go to `/oppgaver`, click "Ny oppgave", fill form, submit
5. **Create event**: Go to `/kalender`, click a time slot, fill form, submit
6. **AI command**: Go to `/assistent`, type "Hva er viktigst i dag?", verify response
7. **Export**: Go to `/innstillinger`, click "Eksporter JSON", verify file downloads

## Rollback

- Netlify supports instant rollback to previous deploy via the deploy dashboard
- If a migration was applied, coordinate with Supabase separately (migrations are not auto-reversible)

## Known Limitations

- Google Fonts may fail during build in restricted network environments (non-blocking for functionality)
- AI features require `ANTHROPIC_API_KEY` — app works without it but AI commands return 503
- Voice uses browser Web Speech API only (Chrome/Edge) — no server-side STT
- Rate limits are in-memory (reset on redeploy)
