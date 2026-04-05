// =============================================================================
// Livsplanlegg – Note Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const contentTypeSchema = z.enum([
  'markdown',
  'plaintext',
  'html',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createNoteSchema = z.object({
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  title: z.string().max(500).nullable().optional(),
  content: z.string().min(1, 'Content is required').max(100000),
  content_type: contentTypeSchema.optional().default('markdown'),
  is_pinned: z.boolean().optional().default(false),
  tags: z.array(z.string().max(100)).optional().default([]),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateNoteSchema = z.object({
  id: z.string().uuid(),
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  title: z.string().max(500).nullable().optional(),
  content: z.string().min(1).max(100000).optional(),
  content_type: contentTypeSchema.optional(),
  is_pinned: z.boolean().optional(),
  tags: z.array(z.string().max(100)).optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
