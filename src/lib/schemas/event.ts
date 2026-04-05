// =============================================================================
// Livsplanlegg – Event Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const eventTypeSchema = z.enum([
  'meeting',
  'deadline',
  'reminder',
  'focus_block',
  'personal',
  'travel',
  'workout',
  'other',
]);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createEventSchema = z
  .object({
    area_id: z.string().uuid().nullable().optional(),
    project_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1, 'Title is required').max(500),
    description: z.string().max(10000).nullable().optional(),
    event_type: eventTypeSchema.optional().default('other'),
    start_time: z.string().datetime(),
    end_time: z.string().datetime().nullable().optional(),
    all_day: z.boolean().optional().default(false),
    location: z.string().max(1000).nullable().optional(),
    url: z.string().url().nullable().optional(),
    is_recurring: z.boolean().optional().default(false),
    recurring_template_id: z.string().uuid().nullable().optional(),
    external_id: z.string().max(500).nullable().optional(),
    external_source: z.string().max(100).nullable().optional(),
    reminder_minutes: z.number().int().nonnegative().nullable().optional(),
    tags: z.array(z.string().max(100)).optional().default([]),
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

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateEventSchema = z
  .object({
    id: z.string().uuid(),
    area_id: z.string().uuid().nullable().optional(),
    project_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(10000).nullable().optional(),
    event_type: eventTypeSchema.optional(),
    start_time: z.string().datetime().optional(),
    end_time: z.string().datetime().nullable().optional(),
    all_day: z.boolean().optional(),
    location: z.string().max(1000).nullable().optional(),
    url: z.string().url().nullable().optional(),
    is_recurring: z.boolean().optional(),
    recurring_template_id: z.string().uuid().nullable().optional(),
    external_id: z.string().max(500).nullable().optional(),
    external_source: z.string().max(100).nullable().optional(),
    reminder_minutes: z.number().int().nonnegative().nullable().optional(),
    tags: z.array(z.string().max(100)).optional(),
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
