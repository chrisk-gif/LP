// =============================================================================
// Livsplanlegg – Project Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const projectStatusSchema = z.enum([
  'active',
  'on_hold',
  'completed',
  'archived',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createProjectSchema = z.object({
  area_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Name is required').max(500),
  description: z.string().max(10000).nullable().optional(),
  status: projectStatusSchema.optional().default('active'),
  start_date: z.string().date().nullable().optional(),
  target_date: z.string().date().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color')
    .nullable()
    .optional(),
  sort_order: z.number().int().optional().default(0),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  area_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  status: projectStatusSchema.optional(),
  start_date: z.string().date().nullable().optional(),
  target_date: z.string().date().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
  sort_order: z.number().int().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
