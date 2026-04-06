import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface FinanceItemInput {
  title: string;
  description?: string;
  type: string;
  status?: string;
  amount?: number;
  currency?: string;
  vendor?: string;
  category?: string;
  due_date?: string;
  paid_date?: string;
  recurrence_pattern?: string;
  reminder_days_before?: number;
  notes?: string;
  attachment_id?: string;
}

export async function getFinanceItems(filters?: {
  status?: string;
  type?: string;
  due_before?: string;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("finance_items")
    .select("*")
    .order("due_date", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.due_before)
    query = query.lte("due_date", filters.due_before);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDueFinanceItems(daysAhead = 14) {
  const future = new Date(Date.now() + daysAhead * 86400000)
    .toISOString()
    .split("T")[0];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("finance_items")
    .select("*")
    .lte("due_date", future)
    .not("status", "in", '("paid","archived")')
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getOverdueFinanceItems() {
  const today = new Date().toISOString().split("T")[0];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("finance_items")
    .select("*")
    .lt("due_date", today)
    .not("status", "in", '("paid","archived")')
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createFinanceItem(input: FinanceItemInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("finance_items")
    .insert({
      ...input,
      user_id: user.id,
      status: input.status ?? "upcoming",
      currency: input.currency ?? "NOK",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markPaid(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("finance_items")
    .update({
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFinanceItem(
  id: string,
  updates: Partial<FinanceItemInput>
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("finance_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFinanceItem(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("finance_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
