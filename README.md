# Livsplanlegg - Ditt personlige styringssystem

A comprehensive Personal Operating System that unifies work (Asplan Viak), business (ytly.no), private life, personal finance, training, and planning into one AI-enabled, voice-enabled dashboard.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **AI**: Anthropic Claude API (Sonnet 4 for routing, Opus 4.1 for planning)
- **Voice**: Web Speech API + MediaRecorder fallback
- **Testing**: Vitest, Playwright

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase project (free tier works)
- Anthropic API key

### Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd Livsplanlegg
   pnpm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and Anthropic credentials.

3. **Supabase setup**
   - Create a new Supabase project
   - Run the migrations in order:
     ```bash
     # In Supabase SQL Editor, run each file:
     # supabase/migrations/00001_initial_schema.sql
     # supabase/migrations/00002_rls_policies.sql
     # supabase/migrations/00003_storage_buckets.sql
     ```
   - Optionally run `supabase/seed.sql` for demo data

4. **Run locally**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm test:all` | Run typecheck + lint + tests |

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Authenticated app routes
│   │   ├── page.tsx        # Dashboard
│   │   ├── idag/           # Today planner
│   │   ├── kalender/       # Calendar
│   │   ├── oppgaver/       # Tasks
│   │   ├── maal/           # Goals
│   │   ├── prosjekter/     # Projects
│   │   ├── asplan-viak/    # Work workspace
│   │   ├── ytly/           # Business workspace
│   │   ├── privat/         # Private workspace
│   │   ├── okonomi/        # Finance
│   │   ├── trening/        # Training
│   │   ├── logg/           # Reviews & logs
│   │   ├── innboks/        # Inbox / capture
│   │   ├── assistent/      # AI assistant
│   │   └── innstillinger/  # Settings
│   ├── api/                # API routes
│   │   ├── ai/             # AI endpoints
│   │   ├── tasks/          # Task CRUD
│   │   ├── events/         # Event CRUD
│   │   ├── finance/        # Finance CRUD
│   │   ├── voice/          # Voice transcription
│   │   └── export/         # Data export
│   ├── auth/               # Auth callback
│   └── login/              # Login page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├��─ dashboard/          # Dashboard widgets
│   ├── calendar/           # Calendar views
│   ├── tasks/              # Task components
│   ├── Sidebar.tsx         # App sidebar
│   ├── TopBar.tsx          # Top bar
│   ├── CommandPalette.tsx  # Command palette (Ctrl+K)
│   ├── QuickAdd.tsx        # Quick add dialog
��   └── MicButton.tsx       # Voice input button
├── hooks/
│   ├── useVoice.ts         # Voice capture hook
│   └── useTheme.ts         # Theme management
├── lib/
│   ├── ai/                 # AI orchestration
│   ├── schemas/            # Zod validation schemas
│   ├── services/           # Domain services
│   ├── supabase/           # Supabase clients
│   ├── constants.ts        # App constants
│   ├── dates.ts            # Date utilities
│   └── utils.ts            # General utilities
├── types/                  # TypeScript types
└── middleware.ts            # Auth middleware

supabase/
├── migrations/             # SQL migrations
│   ├── 00001_initial_schema.sql
│   ├── 00002_rls_policies.sql
│   └── 00003_storage_buckets.sql
└── seed.sql                # Demo data
```

## Modules

### Areas (System Defaults)
- **Asplan Viak** - Work at consulting engineering firm
- **ytly.no** - Personal business
- **Privat** - Personal life
- **Økonomi** - Personal finance
- **Trening** - Training & fitness

### Key Features
- **Dashboard** - Unified overview with configurable widgets
- **Today Planner** - Daily focus and scheduling
- **Calendar** - Day/week/month views with events and tasks
- **Tasks** - Full task management with priorities, areas, due dates
- **Goals** - Multi-horizon goal tracking
- **Tender Pipeline** - Asplan Viak offer/tender management
- **Finance** - Bills, subscriptions, receipts, due dates
- **Training** - Workout planning and logging
- **AI Assistant** - Norwegian-language command routing with tool calling
- **Voice** - Speech recognition and synthesis
- **Reviews** - Daily/weekly/monthly reflections

## AI System

The AI system uses Anthropic's Claude models with structured tool calling:

- **Command Router** (Claude Sonnet 4) - Interprets user commands and routes to tools
- **Executive Planner** (Claude Opus 4.1) - Day/week planning and prioritization
- **Tender Pilot** - Tender-specific summaries and risk analysis
- **Finance Clerk** - Bill reminders and categorization
- **Training Coach** - Workout planning and logging
- **Review Writer** - Draft reviews from activity data

All AI writes go through typed service layers with validation and audit logging.

## Voice System

Hybrid approach:
1. **Browser path**: Web Speech API for live recognition + speechSynthesis for responses
2. **Fallback path**: MediaRecorder capture + server-side transcription
3. **Shared pipeline**: Both paths feed into the same intent router

Supports Norwegian (nb-NO) and English commands.

## Security

- Row Level Security (RLS) on all Supabase tables
- Service role key never exposed to browser
- All inputs validated with Zod
- AI writes require confirmation for medium/low confidence
- Private storage buckets with access control
- Tender data marked as confidential by default

## Environment Variables

See `.env.example` for all required and optional variables.

## License

Private project.
