// =============================================================================
// Livsplanlegg – Review Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const reviewPeriodSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createReviewSchema = z
  .object({
    period: reviewPeriodSchema,
    period_start: z.string().date(),
    period_end: z.string().date(),
    wins: z.string().max(10000).nullable().optional(),
    challenges: z.string().max(10000).nullable().optional(),
    lessons: z.string().max(10000).nullable().optional(),
    next_period_focus: z.string().max(10000).nullable().optional(),
    energy_rating: z.number().int().min(1).max(10).nullable().optional(),
    productivity_rating: z.number().int().min(1).max(10).nullable().optional(),
    satisfaction_rating: z.number().int().min(1).max(10).nullable().optional(),
    is_completed: z.boolean().optional().default(false),
  })
  .refine(
    (data) => new Date(data.period_end) >= new Date(data.period_start),
    { message: 'Period end must be after period start', path: ['period_end'] },
  );

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateReviewSchema = z.object({
  id: z.string().uuid(),
  period: reviewPeriodSchema.optional(),
  period_start: z.string().date().optional(),
  period_end: z.string().date().optional(),
  wins: z.string().max(10000).nullable().optional(),
  challenges: z.string().max(10000).nullable().optional(),
  lessons: z.string().max(10000).nullable().optional(),
  next_period_focus: z.string().max(10000).nullable().optional(),
  energy_rating: z.number().int().min(1).max(10).nullable().optional(),
  productivity_rating: z.number().int().min(1).max(10).nullable().optional(),
  satisfaction_rating: z.number().int().min(1).max(10).nullable().optional(),
  is_completed: z.boolean().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
