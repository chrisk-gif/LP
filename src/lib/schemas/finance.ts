// =============================================================================
// Livsplanlegg – Finance Zod Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enum schemas
// ---------------------------------------------------------------------------

export const financeTypeSchema = z.enum([
  'income',
  'expense',
  'transfer',
  'investment',
]);

export const financeStatusSchema = z.enum([
  'pending',
  'completed',
  'reconciled',
  'cancelled',
]);

// ---------------------------------------------------------------------------
// Create finance item
// ---------------------------------------------------------------------------

export const createFinanceItemSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  area_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).nullable().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').optional().default('NOK'),
  finance_type: financeTypeSchema,
  status: financeStatusSchema.optional().default('pending'),
  date: z.string().date(),
  is_recurring: z.boolean().optional().default(false),
  recurring_template_id: z.string().uuid().nullable().optional(),
  vendor: z.string().max(500).nullable().optional(),
  reference: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(100)).optional().default([]),
});

export type CreateFinanceItemInput = z.infer<typeof createFinanceItemSchema>;

// ---------------------------------------------------------------------------
// Update finance item
// ---------------------------------------------------------------------------

export const updateFinanceItemSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  area_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  finance_type: financeTypeSchema.optional(),
  status: financeStatusSchema.optional(),
  date: z.string().date().optional(),
  is_recurring: z.boolean().optional(),
  recurring_template_id: z.string().uuid().nullable().optional(),
  vendor: z.string().max(500).nullable().optional(),
  reference: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(100)).optional(),
});

export type UpdateFinanceItemInput = z.infer<typeof updateFinanceItemSchema>;

// ---------------------------------------------------------------------------
// Create finance category
// ---------------------------------------------------------------------------

export const createFinanceCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  parent_category_id: z.string().uuid().nullable().optional(),
  budget_monthly: z.number().nonnegative().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color')
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export type CreateFinanceCategoryInput = z.infer<typeof createFinanceCategorySchema>;

// ---------------------------------------------------------------------------
// Update finance category
// ---------------------------------------------------------------------------

export const updateFinanceCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  parent_category_id: z.string().uuid().nullable().optional(),
  budget_monthly: z.number().nonnegative().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
  icon: z.string().max(50).nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateFinanceCategoryInput = z.infer<typeof updateFinanceCategorySchema>;
