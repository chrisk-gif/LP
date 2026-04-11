# Ship Status — Livsplanlegg

Last updated: 2026-04-11

## Production-Ready

| Module | Status | Notes |
|---|---|---|
| Authentication | Ready | Supabase Auth, middleware-based session, redirect for pages, JSON 401 for APIs |
| Dashboard | Ready | Aggregated view across all areas |
| Tasks (oppgaver) | Ready | Full CRUD, area-scoped, deep-link from command palette |
| Calendar (kalender) | Ready | Week/month/day/list views, create/edit/delete events, deep-link |
| Projects (prosjekter) | Ready | Create with area/priority/status, detail dialog, deep-link |
| Finance (økonomi) | Ready | Create items, mark paid, area-scoped |
| Notes (logg/notater) | Ready | Create notes, deep-link from command palette |
| Reviews (logg/gjennomganger) | Ready | Create reviews with period/wins/blockers/lessons |
| Goals (mål) | Ready | Create goals, area-scoped |
| Tenders (asplan-viak/tilbud) | Ready | Create tenders, status tracking |
| Training (trening) | Ready | Log workouts, training plans |
| Export | Ready | JSON and CSV export, user-scoped, rate-limited |
| Settings | Ready | Theme, AI auto-execute, TTS toggle |
| Health endpoint | Ready | /api/health — DB + env checks |

## Beta-Level

| Module | Status | Notes |
|---|---|---|
| AI Assistant | Beta | Works well for task/event/note creation and queries. Requires ANTHROPIC_API_KEY. Rate-limited at 20 req/min. Clarification flow for invalid inputs. |
| Voice Commands | Beta | Browser Web Speech API only (Chrome/Edge). No server-side STT. TTS optional via settings. |
| Command Palette | Beta | Search across tasks/events/projects/notes with deep-linking. |
| Inbox | Beta | Basic inbox processing, voice/AI source items. |

## Intentionally Out of Scope

| Feature | Rationale |
|---|---|
| Push notifications | Browser notification API not yet integrated. Settings UI marks as "Ikke tilgjengelig". |
| Morning summary | Requires scheduled background jobs. Settings UI marks as "Ikke tilgjengelig". |
| Server-side STT | Only browser speech recognition is supported. Voice route returns 422 for non-browser STT. |
| Multi-language | Norwegian (bokmål) only. Locale settings are display-only. |
| Real-time collaboration | Single-user system. Supabase Realtime not utilized. |
| Mobile app | Web-only. Responsive but no native wrapper. |
| Data import/restore | Export works. Import would require custom tooling. |
| Full audit trail UI | AI actions are audited in ai_action_audit table but no UI to browse them. |

## Security Posture

- All tables have Row Level Security (RLS) enabled
- API routes validate auth and return JSON errors
- Service role key is server-only, never exposed to client
- AI commands require confirmation for write operations (unless auto-execute is enabled)
- Rate limiting on AI, voice, and export routes (in-memory, resets on deploy)
- Export only returns authenticated user's data
- Storage paths are user-scoped (`{user_id}/...`)
