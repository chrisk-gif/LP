import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ReviewInput {
  period: string;
  period_start: string;
  period_end: string;
  wins?: string;
  blockers?: string;
  lessons_learned?: string;
  next_focus?: string;
  freeform_notes?: string;
  metrics_snapshot?: Record<string, unknown>;
  ai_generated?: boolean;
}

export async function getReviews(filters?: {
  period?: string;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .order("period_start", { ascending: false });

  if (filters?.period) query = query.eq("period", filters.period);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createReview(input: ReviewInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("reviews")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReview(
  id: string,
  updates: Partial<ReviewInput>
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
