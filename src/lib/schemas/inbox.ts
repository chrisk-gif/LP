// =============================================================================
// Livsplanlegg – Inbox Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const inboxSourceSchema = z.enum([
  'manual',
  'voice',
  'email',
  'api',
  'ai',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createInboxItemSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000),
  source: inboxSourceSchema.optional().default('manual'),
  raw_input: z.string().max(50000).nullable().optional(),
  parsed_data: z.record(z.string(), z.unknown()).nullable().optional(),
  is_processed: z.boolean().optional().default(false),
});

export type CreateInboxItemInput = z.infer<typeof createInboxItemSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateInboxItemSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(10000).optional(),
  source: inboxSourceSchema.optional(),
  raw_input: z.string().max(50000).nullable().optional(),
  parsed_data: z.record(z.string(), z.unknown()).nullable().optional(),
  is_processed: z.boolean().optional(),
  processed_at: z.string().datetime().nullable().optional(),
  result_type: z.string().max(100).nullable().optional(),
  result_id: z.string().uuid().nullable().optional(),
});

export type UpdateInboxItemInput = z.infer<typeof updateInboxItemSchema>;

// ---------------------------------------------------------------------------
// Process inbox item (convert to task/event/note)
// ---------------------------------------------------------------------------

export const processInboxItemSchema = z.object({
  id: z.string().uuid(),
  result_type: z.enum(['task', 'event', 'note', 'goal', 'finance_item']),
  result_id: z.string().uuid(),
});

export type ProcessInboxItemInput = z.infer<typeof processInboxItemSchema>;
