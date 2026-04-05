import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface TenderInput {
  title: string;
  client?: string;
  due_date?: string;
  status?: string;
  probability?: number;
  risk_level?: string;
  next_milestone?: string;
  project_id?: string;
  submitted_at?: string;
  won_lost_status?: string;
  lessons_learned?: string;
  sensitivity?: string;
}

export async function getTenders(filters?: {
  status?: string;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("tenders")
    .select("*, projects(title)")
    .order("due_date", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getActiveTenders() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tenders")
    .select("*, projects(title)")
    .in("status", ["identified", "preparing", "submitted"])
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTender(input: TenderInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get asplan-viak area ID
  const { data: area } = await supabase
    .from("areas")
    .select("id")
    .eq("slug", "asplan-viak")
    .eq("user_id", user.id)
    .single();

  const { data, error } = await supabase
    .from("tenders")
    .insert({
      ...input,
      user_id: user.id,
      area_id: area?.id,
      status: input.status ?? "identified",
      sensitivity: input.sensitivity ?? "confidential",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTender(
  id: string,
  updates: Partial<TenderInput>
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tenders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTender(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("tenders").delete().eq("id", id);
  if (error) throw error;
}
