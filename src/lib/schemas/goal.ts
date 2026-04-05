// =============================================================================
// Livsplanlegg – Goal Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const goalHorizonSchema = z.enum([
  '3_year',
  '1_year',
  '90_day',
  '30_day',
  'weekly',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createGoalSchema = z.object({
  area_id: z.string().uuid().nullable().optional(),
  parent_goal_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(10000).nullable().optional(),
  horizon: goalHorizonSchema,
  target_date: z.string().date().nullable().optional(),
  progress: z.number().min(0).max(100).optional().default(0),
  is_completed: z.boolean().optional().default(false),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateGoalSchema = z.object({
  id: z.string().uuid(),
  area_id: z.string().uuid().nullable().optional(),
  parent_goal_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  horizon: goalHorizonSchema.optional(),
  target_date: z.string().date().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  is_completed: z.boolean().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
