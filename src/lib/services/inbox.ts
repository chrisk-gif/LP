import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface InboxItemInput {
  content: string;
  item_type?: string;
  area_id?: string;
  source?: string;
  raw_transcript?: string;
}

export async function getInboxItems(filters?: {
  processed?: boolean;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("inbox_items")
    .select("*, areas(name, slug, color)")
    .order("created_at", { ascending: false });

  if (filters?.processed !== undefined)
    query = query.eq("processed", filters.processed);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUnprocessedInboxCount() {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("inbox_items")
    .select("*", { count: "exact", head: true })
    .eq("processed", false);

  if (error) throw error;
  return count ?? 0;
}

export async function createInboxItem(input: InboxItemInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("inbox_items")
    .insert({
      ...input,
      user_id: user.id,
      source: input.source ?? "manual",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function processInboxItem(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("inbox_items")
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInboxItem(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("inbox_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
