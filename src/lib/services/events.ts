import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface EventInput {
  title: string;
  description?: string;
  area_id?: string;
  project_id?: string;
  tender_id?: string;
  event_type?: string;
  start_time: string;
  end_time?: string;
  all_day?: boolean;
  location?: string;
  recurrence_pattern?: string;
  color?: string;
}

export async function getEvents(filters?: {
  start_after?: string;
  start_before?: string;
  area_id?: string;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("events")
    .select("*, areas(name, slug, color)")
    .order("start_time", { ascending: true });

  if (filters?.start_after)
    query = query.gte("start_time", filters.start_after);
  if (filters?.start_before)
    query = query.lte("start_time", filters.start_before);
  if (filters?.area_id) query = query.eq("area_id", filters.area_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUpcomingEvents(days = 7) {
  const start = new Date().toISOString();
  const end = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toISOString();
  return getEvents({ start_after: start, start_before: end });
}

export async function createEvent(input: EventInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...input,
      user_id: user.id,
      event_type: input.event_type ?? "other",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, updates: Partial<EventInput>) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
