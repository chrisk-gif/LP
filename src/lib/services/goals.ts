import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface GoalInput {
  title: string;
  description?: string;
  area_id?: string;
  horizon?: string;
  status?: string;
  target_date?: string;
  measurable_metric?: string;
  current_progress?: number;
  why_it_matters?: string;
}

export async function getGoals(filters?: {
  area_id?: string;
  horizon?: string;
  status?: string;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("goals")
    .select("*, areas(name, slug, color)")
    .order("created_at", { ascending: false });

  if (filters?.area_id) query = query.eq("area_id", filters.area_id);
  if (filters?.horizon) query = query.eq("horizon", filters.horizon);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getActiveGoals() {
  return getGoals({ status: "active" });
}

export async function createGoal(input: GoalInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("goals")
    .insert({
      ...input,
      user_id: user.id,
      status: input.status ?? "active",
      horizon: input.horizon ?? "quarterly",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, updates: Partial<GoalInput>) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
