// =============================================================================
// Livsplanlegg – Project Zod Schemas
// Aligned with SQL: projects(id, user_id, area_id, goal_id, title, description,
//   type, status, priority, start_date, due_date, progress, notes, archived)
// Status enum: active, backlog, completed, archived
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const projectStatusSchema = z.enum([
  'active',
  'backlog',
  'completed',
  'archived',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createProjectSchema = z.object({
  area_id: z.string().uuid(),
  goal_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(10000).nullable().optional(),
  type: z.string().max(200).nullable().optional(),
  status: projectStatusSchema.optional().default('active'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional().default('medium'),
  start_date: z.string().date().nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  area_id: z.string().uuid().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  type: z.string().max(200).nullable().optional(),
  status: projectStatusSchema.optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  start_date: z.string().date().nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().max(10000).nullable().optional(),
  archived: z.boolean().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
