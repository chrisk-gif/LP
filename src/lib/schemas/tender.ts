// =============================================================================
// Livsplanlegg – Tender Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const tenderStatusSchema = z.enum([
  'identified',
  'qualifying',
  'bid_preparation',
  'submitted',
  'won',
  'lost',
  'no_bid',
  'cancelled',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createTenderSchema = z.object({
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  client: z.string().max(500).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  status: tenderStatusSchema.optional().default('identified'),
  estimated_value: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional().default('NOK'),
  deadline: z.string().datetime().nullable().optional(),
  submission_date: z.string().datetime().nullable().optional(),
  decision_date: z.string().datetime().nullable().optional(),
  probability: z
    .number()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  contact_person: z.string().max(300).nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
  tags: z.array(z.string().max(100)).optional().default([]),
});

export type CreateTenderInput = z.infer<typeof createTenderSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateTenderSchema = z.object({
  id: z.string().uuid(),
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  client: z.string().max(500).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  status: tenderStatusSchema.optional(),
  estimated_value: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional(),
  deadline: z.string().datetime().nullable().optional(),
  submission_date: z.string().datetime().nullable().optional(),
  decision_date: z.string().datetime().nullable().optional(),
  probability: z.number().min(0).max(100).nullable().optional(),
  contact_person: z.string().max(300).nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
  tags: z.array(z.string().max(100)).optional(),
});

export type UpdateTenderInput = z.infer<typeof updateTenderSchema>;
