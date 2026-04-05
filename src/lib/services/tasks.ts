import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface TaskInput {
  title: string;
  description?: string;
  area_id?: string;
  project_id?: string;
  goal_id?: string;
  tender_id?: string;
  event_id?: string;
  status?: string;
  priority?: string;
  energy_level?: string;
  due_date?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_minutes?: number;
  recurrence_pattern?: string;
  tags?: string[];
  source?: string;
  created_by_ai?: boolean;
  ai_confidence?: number;
}

export async function getTasks(filters?: {
  area_id?: string;
  status?: string;
  due_before?: string;
  scheduled_date?: string;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("tasks")
    .select("*, areas(name, slug, color)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.area_id) query = query.eq("area_id", filters.area_id);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.due_before)
    query = query.lte("due_date", filters.due_before);
  if (filters?.scheduled_date)
    query = query.eq("scheduled_date", filters.scheduled_date);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTasksForToday() {
  const today = new Date().toISOString().split("T")[0];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, areas(name, slug, color)")
    .or(`scheduled_date.eq.${today},due_date.eq.${today}`)
    .not("status", "in", '("done","archived")')
    .order("priority", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getOverdueTasks() {
  const today = new Date().toISOString().split("T")[0];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, areas(name, slug, color)")
    .lt("due_date", today)
    .not("status", "in", '("done","archived")')
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTask(input: TaskInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...input,
      user_id: user.id,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      source: input.source ?? "manual",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  id: string,
  updates: Partial<TaskInput> & { status?: string }
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeTask(id: string) {
  return updateTask(id, { status: "done" });
}

export async function deleteTask(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function searchTasks(searchTerm: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, areas(name, slug, color)")
    .ilike("title", `%${searchTerm}%`)
    .not("status", "in", '("done","archived")')
    .limit(10);

  if (error) throw error;
  return data;
}
