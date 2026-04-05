# AGENTS.md - Instructions for AI Coding Agents

This file provides guidance for AI coding agents (Claude Code, Copilot, Cursor, etc.) working on the Livsplanlegg project.

## Quick Reference

- **Read CLAUDE.md first** - it contains the mission, stack, architecture, and coding standards
- **Use bundled Next.js docs** - the project uses Next.js 16 App Router; refer to the official documentation for API references and patterns
- **Check existing code** before writing new patterns - consistency matters more than novelty

## Architecture Overview

Livsplanlegg is a Next.js 16 App Router application with the following structure:

```
src/app/          -> Routes, layouts, pages (file-system routing)
src/components/   -> Reusable React components (ui/, dashboard/, forms/, layout/)
src/lib/          -> Business logic, AI orchestration, database queries, hooks, validators
src/types/        -> TypeScript interfaces and type definitions
supabase/         -> Database migrations, seed data, config
```

### Key Architectural Decisions

1. **Server Components are the default.** Only use `'use client'` when you need interactivity (event handlers, useState, useEffect, browser APIs). Data fetching happens in Server Components.

2. **Supabase is the single data layer.** All data flows through Supabase PostgreSQL with RLS policies. No direct database connections outside of the Supabase client.

3. **AI orchestration lives in `src/lib/ai/`.** The Anthropic API is called exclusively from server-side code. Claude Sonnet handles fast routing/classification. Claude Opus handles complex planning and reasoning.

4. **Zod validates all boundaries.** API inputs, form submissions, environment variables, and external API responses are validated with Zod schemas before use.

## File Locations

| What you need | Where to find/put it |
|---|---|
| New page | `src/app/(auth)/[section]/page.tsx` |
| New API endpoint | `src/app/api/[endpoint]/route.ts` |
| Reusable UI component | `src/components/ui/` (shadcn) or `src/components/[category]/` |
| Business logic | `src/lib/[domain]/` |
| Custom React hook | `src/lib/hooks/` |
| Zod schema | `src/lib/validators/` |
| TypeScript types | `src/types/` |
| Database migration | `supabase/migrations/YYYYMMDDHHMMSS_name.sql` |
| AI prompt template | `src/lib/ai/prompts/` |
| Static assets | `public/` |

## Adding shadcn/ui Components

Always use the CLI to add shadcn components. Never copy-paste from the website manually.

```bash
pnpm dlx shadcn@latest add [component]
```

Examples:
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add tabs
```

The CLI respects the project's `components.json` configuration and installs components into `src/components/ui/`.

## Common Patterns

### Creating a New Page

```typescript
// src/app/(auth)/finance/page.tsx
import { createServerClient } from '@/lib/db/server'

export default async function FinancePage() {
  const supabase = await createServerClient()
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Okonomi</h1>
      {/* Render budgets */}
    </div>
  )
}
```

### Creating an API Route

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'
import { createTaskSchema } from '@/lib/validators/task'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createTaskSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

### Using AI Orchestration

```typescript
// src/lib/ai/classify.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function classifyUserIntent(input: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL_ROUTER!,
    max_tokens: 256,
    system: 'Classify the user intent into one of: task, finance, training, note, question.',
    messages: [{ role: 'user', content: input }],
  })

  return (message.content[0] as { text: string }).text.trim()
}
```

## Workflow for Agents

1. **Understand the task** - Read relevant existing files before making changes
2. **Plan the change** - Identify which files need to be created or modified
3. **Implement** - Write code following the project conventions in CLAUDE.md
4. **Validate** - Run `pnpm typecheck` and `pnpm lint`
5. **Test** - Add or update tests if touching business logic
6. **Review** - Verify RLS policies if touching database, check for exposed secrets

## Do Not

- Do not install component libraries that overlap with shadcn/ui
- Do not use `any` type - use `unknown` and type guards
- Do not skip Zod validation on API routes
- Do not put API keys in client-side code
- Do not modify existing migration files that have been applied
- Do not use CSS modules or styled-components - use Tailwind
- Do not create pages outside the App Router pattern
- Do not use `getServerSideProps` or `getStaticProps` (Pages Router) - this is App Router only
