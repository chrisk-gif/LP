// =============================================================================
// Livsplanlegg – Training Zod Schemas
// Aligned with SQL: workout_sessions(id, user_id, plan_id, title, session_type,
//   planned_at, completed_at, duration_minutes, intensity, notes, metrics)
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const planTypeSchema = z.enum([
  'running',
  'strength',
  'hybrid',
  'cycling',
  'swimming',
  'other',
]);

export const workoutIntensitySchema = z.enum([
  'easy',
  'moderate',
  'hard',
  'max',
]);

// ---------------------------------------------------------------------------
// Create training plan
// SQL columns: id, user_id, title, description, goal_id, start_date,
//   end_date, status (training_status), created_at, updated_at
// No plan_type, name, is_active, goal_description, or schedule columns.
// ---------------------------------------------------------------------------

export const createTrainingPlanSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  status: z.enum(['active', 'completed', 'paused']).optional().default('active'),
});

export type CreateTrainingPlanInput = z.infer<typeof createTrainingPlanSchema>;

// ---------------------------------------------------------------------------
// Update training plan
// ---------------------------------------------------------------------------

export const updateTrainingPlanSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
});

export type UpdateTrainingPlanInput = z.infer<typeof updateTrainingPlanSchema>;

// ---------------------------------------------------------------------------
// Create workout session (matches SQL: workout_sessions)
// ---------------------------------------------------------------------------

export const createWorkoutSessionSchema = z.object({
  plan_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  session_type: z.string().max(200).nullable().optional(),
  planned_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  intensity: workoutIntensitySchema.nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  metrics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CreateWorkoutSessionInput = z.infer<typeof createWorkoutSessionSchema>;

// ---------------------------------------------------------------------------
// Update workout session
// ---------------------------------------------------------------------------

export const updateWorkoutSessionSchema = z.object({
  id: z.string().uuid(),
  plan_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  session_type: z.string().max(200).nullable().optional(),
  planned_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  intensity: workoutIntensitySchema.nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  metrics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UpdateWorkoutSessionInput = z.infer<typeof updateWorkoutSessionSchema>;
