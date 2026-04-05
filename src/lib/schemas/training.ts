// =============================================================================
// Livsplanlegg – Training Zod Schemas
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

// ---------------------------------------------------------------------------
// Create training plan
// ---------------------------------------------------------------------------

export const createTrainingPlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  description: z.string().max(5000).nullable().optional(),
  plan_type: planTypeSchema,
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  goal_description: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().optional().default(true),
  schedule: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CreateTrainingPlanInput = z.infer<typeof createTrainingPlanSchema>;

// ---------------------------------------------------------------------------
// Update training plan
// ---------------------------------------------------------------------------

export const updateTrainingPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  plan_type: planTypeSchema.optional(),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  goal_description: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().optional(),
  schedule: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UpdateTrainingPlanInput = z.infer<typeof updateTrainingPlanSchema>;

// ---------------------------------------------------------------------------
// Exercise schema (for workout sessions)
// ---------------------------------------------------------------------------

export const exerciseSchema = z.object({
  name: z.string().min(1).max(200),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight_kg: z.number().nonnegative().optional(),
  duration_seconds: z.number().int().positive().optional(),
  distance_km: z.number().nonnegative().optional(),
  rest_seconds: z.number().int().nonnegative().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;

// ---------------------------------------------------------------------------
// Create workout session
// ---------------------------------------------------------------------------

export const createWorkoutSessionSchema = z.object({
  training_plan_id: z.string().uuid().nullable().optional(),
  workout_type: z.string().min(1).max(200),
  title: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  scheduled_date: z.string().date().nullable().optional(),
  started_at: z.string().datetime().nullable().optional(),
  ended_at: z.string().datetime().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  distance_km: z.number().nonnegative().nullable().optional(),
  calories: z.number().int().nonnegative().nullable().optional(),
  heart_rate_avg: z.number().int().positive().nullable().optional(),
  heart_rate_max: z.number().int().positive().nullable().optional(),
  perceived_effort: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  exercises: z.array(exerciseSchema).nullable().optional(),
  is_completed: z.boolean().optional().default(false),
});

export type CreateWorkoutSessionInput = z.infer<typeof createWorkoutSessionSchema>;

// ---------------------------------------------------------------------------
// Update workout session
// ---------------------------------------------------------------------------

export const updateWorkoutSessionSchema = z.object({
  id: z.string().uuid(),
  training_plan_id: z.string().uuid().nullable().optional(),
  workout_type: z.string().min(1).max(200).optional(),
  title: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  scheduled_date: z.string().date().nullable().optional(),
  started_at: z.string().datetime().nullable().optional(),
  ended_at: z.string().datetime().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  distance_km: z.number().nonnegative().nullable().optional(),
  calories: z.number().int().nonnegative().nullable().optional(),
  heart_rate_avg: z.number().int().positive().nullable().optional(),
  heart_rate_max: z.number().int().positive().nullable().optional(),
  perceived_effort: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  exercises: z.array(exerciseSchema).nullable().optional(),
  is_completed: z.boolean().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export type UpdateWorkoutSessionInput = z.infer<typeof updateWorkoutSessionSchema>;
