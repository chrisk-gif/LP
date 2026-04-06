// =============================================================================
// Livsplanlegg – Finance Zod Schemas
// Aligned with SQL enums in 00001_initial_schema.sql
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas (match SQL exactly)
// ---------------------------------------------------------------------------

export const financeTypeSchema = z.enum([
  'bill',
  'subscription',
  'receipt',
  'reimbursement',
  'savings',
  'investment',
  'other',
]);

export const financeStatusSchema = z.enum([
  'upcoming',
  'due',
  'overdue',
  'paid',
  'archived',
]);

// ---------------------------------------------------------------------------
// Create finance item
// ---------------------------------------------------------------------------

export const createFinanceItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).nullable().optional(),
  type: financeTypeSchema,
  status: financeStatusSchema.optional().default('upcoming'),
  amount: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').optional().default('NOK'),
  vendor: z.string().max(500).nullable().optional(),
  category: z.string().max(200).nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  paid_date: z.string().date().nullable().optional(),
  recurrence_pattern: z.string().max(200).nullable().optional(),
  reminder_days_before: z.number().int().nonnegative().optional().default(3),
  notes: z.string().max(10000).nullable().optional(),
  attachment_id: z.string().uuid().nullable().optional(),
});

export type CreateFinanceItemInput = z.infer<typeof createFinanceItemSchema>;

// ---------------------------------------------------------------------------
// Update finance item
// ---------------------------------------------------------------------------

export const updateFinanceItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  type: financeTypeSchema.optional(),
  status: financeStatusSchema.optional(),
  amount: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional(),
  vendor: z.string().max(500).nullable().optional(),
  category: z.string().max(200).nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  paid_date: z.string().date().nullable().optional(),
  recurrence_pattern: z.string().max(200).nullable().optional(),
  reminder_days_before: z.number().int().nonnegative().optional(),
  notes: z.string().max(10000).nullable().optional(),
  attachment_id: z.string().uuid().nullable().optional(),
});

export type UpdateFinanceItemInput = z.infer<typeof updateFinanceItemSchema>;
