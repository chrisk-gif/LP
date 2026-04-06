// =============================================================================
// Livsplanlegg – Tender Zod Schemas
// Aligned with SQL enums in 00001_initial_schema.sql
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas (match SQL exactly)
// ---------------------------------------------------------------------------

export const tenderStatusSchema = z.enum([
  'identified',
  'preparing',
  'submitted',
  'won',
  'lost',
  'cancelled',
]);

export const riskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createTenderSchema = z.object({
  area_id: z.string().uuid(),
  project_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  client: z.string().max(500).nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  status: tenderStatusSchema.optional().default('identified'),
  probability: z.number().min(0).max(100).nullable().optional(),
  risk_level: riskLevelSchema.nullable().optional(),
  next_milestone: z.string().max(500).nullable().optional(),
  sensitivity: z.enum(['normal', 'confidential', 'restricted']).optional().default('confidential'),
});

export type CreateTenderInput = z.infer<typeof createTenderSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateTenderSchema = z.object({
  area_id: z.string().uuid().optional(),
  project_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  client: z.string().max(500).nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  status: tenderStatusSchema.optional(),
  probability: z.number().min(0).max(100).nullable().optional(),
  risk_level: riskLevelSchema.nullable().optional(),
  next_milestone: z.string().max(500).nullable().optional(),
  submitted_at: z.string().datetime().nullable().optional(),
  won_lost_status: z.string().max(200).nullable().optional(),
  lessons_learned: z.string().max(10000).nullable().optional(),
  sensitivity: z.enum(['normal', 'confidential', 'restricted']).optional(),
});

export type UpdateTenderInput = z.infer<typeof updateTenderSchema>;
