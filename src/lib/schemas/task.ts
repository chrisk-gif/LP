// =============================================================================
// Livsplanlegg – Task Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const taskStatusSchema = z.enum([
  'backlog',
  'todo',
  'in_progress',
  'waiting',
  'done',
  'cancelled',
]);

export const taskPrioritySchema = z.enum([
  'urgent',
  'high',
  'medium',
  'low',
  'none',
]);

export const energyLevelSchema = z.enum(['high', 'medium', 'low']);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createTaskSchema = z.object({
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  parent_task_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(10000).nullable().optional(),
  status: taskStatusSchema.optional().default('todo'),
  priority: taskPrioritySchema.optional().default('medium'),
  due_date: z.string().date().nullable().optional(),
  due_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS')
    .nullable()
    .optional(),
  estimated_minutes: z.number().int().positive().nullable().optional(),
  energy_level: energyLevelSchema.nullable().optional(),
  is_recurring: z.boolean().optional().default(false),
  recurring_template_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional().default(0),
  tags: z.array(z.string().max(100)).optional().default([]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  parent_task_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  due_date: z.string().date().nullable().optional(),
  due_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .nullable()
    .optional(),
  estimated_minutes: z.number().int().positive().nullable().optional(),
  actual_minutes: z.number().int().nonnegative().nullable().optional(),
  energy_level: energyLevelSchema.nullable().optional(),
  is_recurring: z.boolean().optional(),
  recurring_template_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
  tags: z.array(z.string().max(100)).optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ---------------------------------------------------------------------------
// Task log
// ---------------------------------------------------------------------------

export const createTaskLogSchema = z.object({
  task_id: z.string().uuid(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export type CreateTaskLogInput = z.infer<typeof createTaskLogSchema>;
