// =============================================================================
// Livsplanlegg – Inbox Zod Schemas
// Aligned with SQL enums in 00001_initial_schema.sql
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas (match SQL exactly)
// ---------------------------------------------------------------------------

export const inboxItemTypeSchema = z.enum([
  'task',
  'idea',
  'note',
  'bill',
  'event',
  'training',
  'voice_memo',
]);

export const inboxSourceSchema = z.enum([
  'manual',
  'voice',
  'ai',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createInboxItemSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000),
  item_type: inboxItemTypeSchema.nullable().optional(),
  area_id: z.string().uuid().nullable().optional(),
  source: inboxSourceSchema.optional().default('manual'),
  raw_transcript: z.string().max(50000).nullable().optional(),
});

export type CreateInboxItemInput = z.infer<typeof createInboxItemSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateInboxItemSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  item_type: inboxItemTypeSchema.nullable().optional(),
  area_id: z.string().uuid().nullable().optional(),
  processed: z.boolean().optional(),
  processed_at: z.string().datetime().nullable().optional(),
});

export type UpdateInboxItemInput = z.infer<typeof updateInboxItemSchema>;
