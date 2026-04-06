// =============================================================================
// Livsplanlegg – Goal Zod Schemas
// Aligned with SQL enums in 00001_initial_schema.sql
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas (match SQL exactly)
// ---------------------------------------------------------------------------

export const goalHorizonSchema = z.enum([
  'short-term',
  'monthly',
  'quarterly',
  'yearly',
  'long-term',
]);

export const goalStatusSchema = z.enum([
  'active',
  'completed',
  'paused',
  'archived',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createGoalSchema = z.object({
  area_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(10000).nullable().optional(),
  horizon: goalHorizonSchema.optional().default('quarterly'),
  status: goalStatusSchema.optional().default('active'),
  target_date: z.string().date().nullable().optional(),
  measurable_metric: z.string().max(500).nullable().optional(),
  current_progress: z.number().min(0).optional().default(0),
  why_it_matters: z.string().max(5000).nullable().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateGoalSchema = z.object({
  area_id: z.string().uuid().optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  horizon: goalHorizonSchema.optional(),
  status: goalStatusSchema.optional(),
  target_date: z.string().date().nullable().optional(),
  measurable_metric: z.string().max(500).nullable().optional(),
  current_progress: z.number().min(0).optional(),
  why_it_matters: z.string().max(5000).nullable().optional(),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
