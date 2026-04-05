# CLAUDE.md - Livsplanlegg Project Configuration

## Mission

Livsplanlegg is a **Personal Operating System** that unifies all dimensions of life into one intelligent platform:

- **Work** (Asplan Viak) - Project tracking, tilbud/tender management, time registration, colleague collaboration
- **Business** (ytly.no) - Client pipeline, invoicing, marketing analytics, business metrics
- **Private life** - Calendar, goals, habits, family coordination, personal projects
- **Finance** (okonomi) - Budgets, investments, savings goals, expense tracking, tax planning
- **Training** (trening) - Workout plans, nutrition tracking, health metrics, recovery

The system uses AI (Anthropic Claude) as an orchestration layer to connect these domains, surface insights, and automate routine decisions.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Database | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| AI | Anthropic API (Claude Sonnet for routing, Claude Opus for planning) |
| Voice | Browser Web Speech API (STT), TTS provider configurable |
| Package manager | pnpm |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

## Architecture

```
src/
  app/                    # Next.js App Router pages and layouts
    (auth)/               # Auth-gated route group
    (public)/             # Public pages (landing, login)
    api/                  # Route handlers (API endpoints)
    layout.tsx            # Root layout
    page.tsx              # Landing page
  components/             # Reusable UI components
    ui/                   # shadcn/ui primitives
    dashboard/            # Dashboard-specific widgets
    forms/                # Form components
    layout/               # Shell, sidebar, navigation
  lib/                    # Business logic and utilities
    ai/                   # AI orchestration, prompt templates, memory
    db/                   # Supabase client, typed queries, migrations
    hooks/                # Custom React hooks
    utils/                # Pure utility functions
    validators/           # Zod schemas for runtime validation
  types/                  # TypeScript type definitions and interfaces
    database.ts           # Supabase generated types
    domain.ts             # Domain model types
    api.ts                # API request/response types
supabase/
  migrations/             # SQL migration files (timestamped)
  seed.sql                # Development seed data
  config.toml             # Supabase local config
public/
  icons/
  images/
```

## Coding Standards

### TypeScript
- **Strict mode** always (`strict: true` in tsconfig)
- No `any` types - use `unknown` and narrow with type guards
- Prefer `interface` for object shapes, `type` for unions/intersections
- All function parameters and return types must be explicitly typed
- Use `as const` for literal types and discriminated unions

### Validation
- **Zod** for all runtime validation (API inputs, form data, env vars)
- Every API route handler must validate input with a Zod schema
- Database query results should be parsed through Zod when crossing trust boundaries

### Components
- **Server Components by default** - only add `'use client'` when needed (event handlers, hooks, browser APIs)
- Colocate related files: `page.tsx`, `loading.tsx`, `error.tsx`, `layout.tsx`
- Extract reusable logic into custom hooks in `src/lib/hooks/`
- Use shadcn/ui primitives - do not install competing component libraries

### Language
- **Norwegian (Bokmaal)** for all user-facing UI text, labels, and content
- **English** for all code: variable names, function names, comments, commit messages
- Domain terms in code use English equivalents (see Domain Terms below)

### Styling
- Tailwind CSS utility classes only - no custom CSS unless absolutely necessary
- Follow shadcn/ui theming conventions (CSS variables in `globals.css`)
- Mobile-first responsive design
- Dark mode support via `class` strategy

### File Naming
- Components: `PascalCase.tsx` (e.g., `DashboardWidget.tsx`)
- Utilities/hooks: `camelCase.ts` (e.g., `useFinanceData.ts`)
- Types: `camelCase.ts` (e.g., `domain.ts`)
- Database migrations: `YYYYMMDDHHMMSS_descriptive_name.sql`

## Commands

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm typecheck    # TypeScript type checking (tsc --noEmit)
pnpm test         # Run Vitest unit tests
pnpm test:e2e     # Run Playwright end-to-end tests
pnpm db:generate  # Generate Supabase types from schema
pnpm db:migrate   # Run pending database migrations
pnpm db:reset     # Reset local database (destructive)
```

## Security Rules

1. **Row Level Security (RLS)** must be enabled on every Supabase table - no exceptions
2. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to the client - it bypasses RLS
3. **Validate all inputs** at API boundaries using Zod schemas before processing
4. **Sanitize outputs** - never render raw HTML from user input or AI responses
5. **Auth checks** in every server action and API route - use `createServerClient` from `@supabase/ssr`
6. **Environment variables** prefixed with `NEXT_PUBLIC_` are exposed to the browser - only put non-sensitive values there
7. **API keys** (Anthropic, etc.) must only be used in server-side code (Route Handlers, Server Actions)
8. **CORS** - API routes should validate origin headers for sensitive operations
9. **Rate limiting** - AI endpoints must implement rate limiting per user

## Domain Terms

| Norwegian | English (use in code) | Description |
|---|---|---|
| tilbud | tender | A bid/proposal for a project |
| oppdragsgiver | client | The entity commissioning work |
| okonomi | finance | Financial tracking and planning |
| trening | training | Physical training and health |
| budsjett | budget | Financial budget |
| prosjekt | project | A work project |
| faktura | invoice | A billing invoice |
| mal | goal | A personal or business goal |
| vane | habit | A tracked habit |
| oppgave | task | A to-do item |
| notat | note | A note or journal entry |
| paamelding | reminder | A scheduled reminder |

## Agent Behavior Guidelines

When working as an AI coding agent on this project:

1. **Always run `pnpm typecheck`** after making code changes to catch type errors early
2. **Prefer small, focused changes** - one concern per edit, easy to review
3. **Check existing patterns** before adding new code - follow established conventions in the codebase
4. **Write tests** for business logic in `src/lib/` - use Vitest
5. **Update types** in `src/types/` when changing data shapes
6. **Run `pnpm lint`** before considering work complete
7. **Never modify migration files** that have already been applied - create new migrations instead
8. **Use Server Actions** for form submissions and mutations, Route Handlers for external API integrations
9. **Colocate** loading and error states with their pages
10. **Document complex AI prompts** with comments explaining the reasoning
