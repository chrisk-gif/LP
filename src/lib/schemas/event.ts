// =============================================================================
// Livsplanlegg – Event Zod Schemas
// Aligned with SQL enums in 00001_initial_schema.sql
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas (match SQL event_type)
// ---------------------------------------------------------------------------

export const eventTypeSchema = z.enum([
  'meeting',
  'deadline',
  'reminder',
  'block',
  'personal',
  'other',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createEventSchema = z
  .object({
    area_id: z.string().uuid(),
    project_id: z.string().uuid().nullable().optional(),
    tender_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1, 'Title is required').max(500),
    description: z.string().max(10000).nullable().optional(),
    event_type: eventTypeSchema.optional().default('other'),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    all_day: z.boolean().optional().default(false),
    location: z.string().max(1000).nullable().optional(),
    recurrence_pattern: z.string().max(200).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
  })
  .refine(
    (data) => {
      return new Date(data.end_time) >= new Date(data.start_time);
    },
    { message: 'End time must be after start time', path: ['end_time'] },
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateEventSchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(10000).nullable().optional(),
    area_id: z.string().uuid().optional(),
    project_id: z.string().uuid().nullable().optional(),
    tender_id: z.string().uuid().nullable().optional(),
    event_type: eventTypeSchema.optional(),
    start_time: z.string().datetime().optional(),
    end_time: z.string().datetime().nullable().optional(),
    all_day: z.boolean().optional(),
    location: z.string().max(1000).nullable().optional(),
    recurrence_pattern: z.string().max(200).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.end_time && data.start_time) {
        return new Date(data.end_time) >= new Date(data.start_time);
      }
      return true;
    },
    { message: 'End time must be after start time', path: ['end_time'] },
  );

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
