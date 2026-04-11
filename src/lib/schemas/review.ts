// =============================================================================
// Livsplanlegg – Review Zod Schemas
// Aligned with SQL: reviews(id, user_id, period, period_start, period_end,
//   wins, blockers, lessons_learned, next_focus, freeform_notes,
//   metrics_snapshot, ai_generated)
// Period enum: daily, weekly, monthly, quarterly
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

// SQL enum: daily, weekly, monthly, quarterly (no 'yearly')
export const reviewPeriodSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
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
    blockers: z.string().max(10000).nullable().optional(),
    lessons_learned: z.string().max(10000).nullable().optional(),
    next_focus: z.string().max(10000).nullable().optional(),
    freeform_notes: z.string().max(10000).nullable().optional(),
  })
  .refine(
    (data) => new Date(data.period_end) >= new Date(data.period_start),
    { message: 'Sluttdato må være etter startdato', path: ['period_end'] },
  );

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateReviewSchema = z.object({
  period: reviewPeriodSchema.optional(),
  period_start: z.string().date().optional(),
  period_end: z.string().date().optional(),
  wins: z.string().max(10000).nullable().optional(),
  blockers: z.string().max(10000).nullable().optional(),
  lessons_learned: z.string().max(10000).nullable().optional(),
  next_focus: z.string().max(10000).nullable().optional(),
  freeform_notes: z.string().max(10000).nullable().optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
