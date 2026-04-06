// =============================================================================
// Livsplanlegg – Note Zod Schemas
// Aligned with SQL: notes(id, user_id, area_id, project_id, tender_id,
//   title, content, pinned, tags, created_at, updated_at)
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createNoteSchema = z.object({
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  tender_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().max(100000).nullable().optional(),
  pinned: z.boolean().optional().default(false),
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
  tender_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  content: z.string().max(100000).nullable().optional(),
  pinned: z.boolean().optional(),
  tags: z.array(z.string().max(100)).optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
