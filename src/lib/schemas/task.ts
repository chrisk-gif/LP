// =============================================================================
// Livsplanlegg – Task Zod Schemas
// Aligned with SQL enums in 00001_initial_schema.sql
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas (match SQL exactly)
// ---------------------------------------------------------------------------

export const taskStatusSchema = z.enum([
  'inbox',
  'todo',
  'in_progress',
  'waiting',
  'done',
  'archived',
]);

export const taskPrioritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
]);

export const energyLevelSchema = z.enum(['high', 'medium', 'low']);

export const taskSourceSchema = z.enum(['manual', 'ai', 'voice', 'recurring', 'import']);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createTaskSchema = z.object({
  area_id: z.string().uuid(),
  project_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  tender_id: z.string().uuid().nullable().optional(),
  event_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(10000).nullable().optional(),
  status: taskStatusSchema.optional().default('todo'),
  priority: taskPrioritySchema.optional().default('medium'),
  energy_level: energyLevelSchema.nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  scheduled_date: z.string().date().nullable().optional(),
  scheduled_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS')
    .nullable()
    .optional(),
  estimated_minutes: z.number().int().positive().nullable().optional(),
  recurrence_pattern: z.string().max(200).nullable().optional(),
  tags: z.array(z.string().max(100)).optional().default([]),
  source: taskSourceSchema.optional().default('manual'),
  created_by_ai: z.boolean().optional().default(false),
  ai_confidence: z.number().min(0).max(1).nullable().optional(),
  sort_order: z.number().int().optional().default(0),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  area_id: z.string().uuid().optional(),
  project_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  tender_id: z.string().uuid().nullable().optional(),
  event_id: z.string().uuid().nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  energy_level: energyLevelSchema.nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  scheduled_date: z.string().date().nullable().optional(),
  scheduled_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .nullable()
    .optional(),
  estimated_minutes: z.number().int().positive().nullable().optional(),
  recurrence_pattern: z.string().max(200).nullable().optional(),
  tags: z.array(z.string().max(100)).optional(),
  sort_order: z.number().int().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
