import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExecutionResult {
  success: boolean;
  message: string;
  entityType?: string;
  entityId?: string;
  data?: Record<string, unknown>;
}

interface AuditEntry {
  user_id: string;
  agent_name: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown> | null;
  confidence: number | null;
  auto_executed: boolean;
  confirmed_by_user: boolean;
  success: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resolveAreaId(
  supabase: SupabaseClient,
  areaSlug: string
): Promise<string | null> {
  const { data } = await supabase
    .from("areas")
    .select("id")
    .eq("slug", areaSlug)
    .single();
  return data?.id ?? null;
}

async function logAudit(
  supabase: SupabaseClient,
  entry: AuditEntry
): Promise<void> {
  try {
    await supabase.from("ai_action_audit").insert({
      user_id: entry.user_id,
      agent_name: entry.agent_name,
      action_type: entry.action_type,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      input_data: entry.input_data,
      output_data: entry.output_data,
      confidence: entry.confidence,
      auto_executed: entry.auto_executed,
      confirmed_by_user: entry.confirmed_by_user,
    });
  } catch {
    // Audit logging must never break the main flow
  }
}

function fail(message: string): ExecutionResult {
  return { success: false, message };
}

function ok(
  message: string,
  entityType?: string,
  entityId?: string,
  data?: Record<string, unknown>
): ExecutionResult {
  return { success: true, message, entityType, entityId, data };
}

// ---------------------------------------------------------------------------
// Tool executors
// ---------------------------------------------------------------------------

async function executeCreateTask(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
  userId: string
): Promise<ExecutionResult> {
  const title = input.title as string | undefined;
  if (!title) return fail("Mangler tittel for oppgaven.");

  let areaId: string | null = null;
  if (input.area) {
    areaId = await resolveAreaId(supabase, input.area as string);
    if (!areaId) return fail(`Fant ikke omr\u00e5det: ${input.area}`);
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title,
      description: (input.description as string) ?? null,
      area_id: areaId,
      priority: (input.priority as string) ?? "medium",
      due_date: (input.due_date as string) ?? null,
      scheduled_date: (input.scheduled_date as string) ?? null,
      scheduled_time: (input.scheduled_time as string) ?? null,
      estimated_minutes: (input.estimated_minutes as number) ?? null,
      status: "todo",
    })
    .select("id")
    .single();

  if (error) return fail(`Kunne ikke opprette oppgave: ${error.message}`);
  return ok(`Oppgave opprettet: ${title}`, "task", data.id);
}

async function executeCreateEvent(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
  userId: string
): Promise<ExecutionResult> {
  const title = input.title as string | undefined;
  const startTime = input.start_time as string | undefined;
  if (!title || !startTime) return fail("Mangler tittel eller starttid.");

  let areaId: string | null = null;
  if (input.area) {
    areaId = await resolveAreaId(supabase, input.area as string);
    if (!areaId) return fail(`Fant ikke omr\u00e5det: ${input.area}`);
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: userId,
      title,
      description: (input.description as string) ?? null,
      area_id: areaId,
      start_time: startTime,
      end_time: (input.end_time as string) ?? null,
      all_day: (input.all_day as boolean) ?? false,
      location: (input.location as string) ?? null,
      event_type: (input.event_type as string) ?? "other",
    })
    .select("id")
    .single();

  if (error) return fail(`Kunne ikke opprette hendelse: ${error.message}`);
  return ok(`Hendelse opprettet: ${title}`, "event", data.id);
}

async function executeCompleteTask(
  supabase: SupabaseClient,
  input: Record<string, unknown>
): Promise<ExecutionResult> {
  const search = input.task_title_search as string | undefined;
  if (!search) return fail("Mangler s\u00f8keord for oppgaven.");

  const { data: task, error: findErr } = await supabase
    .from("tasks")
    .select("id, title")
    .ilike("title", `%${search}%`)
    .eq("status", "todo")
    .limit(1)
    .single();

  if (findErr || !task) return fail(`Fant ingen oppgave som matcher: ${search}`);

  const { error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", task.id);

  if (error) return fail(`Kunne ikke fullf\u00f8re oppgave: ${error.message}`);
  return ok(`Oppgave fullf\u00f8rt: ${task.title}`, "task", task.id);
}

async function executeCreateFinanceItem(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
  userId: string
): Promise<ExecutionResult> {
  const title = input.title as string | undefined;
  const type = input.type as string | undefined;
  if (!title || !type) return fail("Mangler tittel eller type for finanspost.");

  const { data, error } = await supabase
    .from("finance_items")
    .insert({
      user_id: userId,
      title,
      type,
      amount: (input.amount as number) ?? null,
      vendor: (input.vendor as string) ?? null,
      due_date: (input.due_date as string) ?? null,
      category: (input.category as string) ?? null,
      status: "upcoming",
    })
    .select("id")
    .single();

  if (error) return fail(`Kunne ikke opprette finanspost: ${error.message}`);
  return ok(`Finanspost opprettet: ${title}`, "finance_item", data.id);
}

async function executeMarkPaid(
  supabase: SupabaseClient,
  input: Record<string, unknown>
): Promise<ExecutionResult> {
  const search = input.search_term as string | undefined;
  if (!search) return fail("Mangler s\u00f8keord for finansposten.");

  const { data: item, error: findErr } = await supabase
    .from("finance_items")
    .select("id, title")
    .ilike("title", `%${search}%`)
    .neq("status", "paid")
    .limit(1)
    .single();

  if (findErr || !item) return fail(`Fant ingen finanspost som matcher: ${search}`);

  const { error } = await supabase
    .from("finance_items")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", item.id);

  if (error) return fail(`Kunne ikke markere som betalt: ${error.message}`);
  return ok(`Markert som betalt: ${item.title}`, "finance_item", item.id);
}

async function executeLogWorkout(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
  userId: string
): Promise<ExecutionResult> {
  const title = input.title as string | undefined;
  if (!title) return fail("Mangler tittel for trenings\u00f8kten.");

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      title,
      session_type: (input.session_type as string) ?? null,
      duration_minutes: (input.duration_minutes as number) ?? null,
      intensity: (input.intensity as string) ?? null,
      notes: (input.notes as string) ?? null,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return fail(`Kunne ikke logge trening: ${error.message}`);
  return ok(`Trening logget: ${title}`, "workout_session", data.id);
}

async function executeCreateNote(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
  userId: string
): Promise<ExecutionResult> {
  const title = input.title as string | undefined;
  const content = input.content as string | undefined;
  if (!title || !content) return fail("Mangler tittel eller innhold for notatet.");

  let areaId: string | null = null;
  if (input.area) {
    areaId = await resolveAreaId(supabase, input.area as string);
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title,
      content,
      area_id: areaId,
    })
    .select("id")
    .single();

  if (error) return fail(`Kunne ikke opprette notat: ${error.message}`);
  return ok(`Notat opprettet: ${title}`, "note", data.id);
}

async function executeQueryData(
  supabase: SupabaseClient,
  input: Record<string, unknown>
): Promise<ExecutionResult> {
  const queryType = input.query_type as string | undefined;
  if (!queryType) return fail("Mangler sp\u00f8rringstype.");

  const filters = (input.filters as Record<string, unknown>) ?? {};
  const today = new Date().toISOString().split("T")[0];

  switch (queryType) {
    case "today_tasks": {
      const query = supabase
        .from("tasks")
        .select("id, title, status, priority, scheduled_date, due_date")
        .or(`scheduled_date.eq.${today},due_date.eq.${today}`)
        .neq("status", "done")
        .neq("status", "archived")
        .order("priority", { ascending: true })
        .limit(20);

      const { data, error } = await query;
      if (error) return fail(`Feil ved henting av oppgaver: ${error.message}`);
      return ok(`Fant ${data?.length ?? 0} oppgaver for i dag.`, undefined, undefined, {
        items: data ?? [],
        count: data?.length ?? 0,
      });
    }

    case "active_tenders": {
      const { data, error } = await supabase
        .from("tenders")
        .select("id, title, status, deadline, client")
        .in("status", ["identified", "preparing", "submitted"])
        .order("deadline", { ascending: true })
        .limit(20);

      if (error) return fail(`Feil ved henting av tilbud: ${error.message}`);
      return ok(`Fant ${data?.length ?? 0} aktive tilbud.`, undefined, undefined, {
        items: data ?? [],
        count: data?.length ?? 0,
      });
    }

    case "due_finance": {
      const { data, error } = await supabase
        .from("finance_items")
        .select("id, title, type, amount, due_date, status")
        .in("status", ["upcoming", "due", "overdue"])
        .order("due_date", { ascending: true })
        .limit(20);

      if (error) return fail(`Feil ved henting av finansposter: ${error.message}`);
      return ok(`Fant ${data?.length ?? 0} uf\u00f8rte finansposter.`, undefined, undefined, {
        items: data ?? [],
        count: data?.length ?? 0,
      });
    }

    case "upcoming_events": {
      const daysAhead = (filters.days_ahead as number) ?? 7;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_time, end_time, event_type, location")
        .gte("start_time", new Date().toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time", { ascending: true })
        .limit(20);

      if (error) return fail(`Feil ved henting av hendelser: ${error.message}`);
      return ok(`Fant ${data?.length ?? 0} kommende hendelser.`, undefined, undefined, {
        items: data ?? [],
        count: data?.length ?? 0,
      });
    }

    case "active_goals": {
      const { data, error } = await supabase
        .from("goals")
        .select("id, title, horizon, progress, target_date")
        .eq("status", "active")
        .order("target_date", { ascending: true })
        .limit(20);

      if (error) return fail(`Feil ved henting av m\u00e5l: ${error.message}`);
      return ok(`Fant ${data?.length ?? 0} aktive m\u00e5l.`, undefined, undefined, {
        items: data ?? [],
        count: data?.length ?? 0,
      });
    }

    case "overdue_items": {
      const { data: tasks, error: tErr } = await supabase
        .from("tasks")
        .select("id, title, due_date, priority")
        .lt("due_date", today)
        .neq("status", "done")
        .neq("status", "archived")
        .order("due_date", { ascending: true })
        .limit(10);

      const { data: finance, error: fErr } = await supabase
        .from("finance_items")
        .select("id, title, due_date, amount")
        .eq("status", "overdue")
        .order("due_date", { ascending: true })
        .limit(10);

      if (tErr || fErr) return fail("Feil ved henting av forfalte elementer.");
      return ok(
        `Fant ${(tasks?.length ?? 0) + (finance?.length ?? 0)} forfalte elementer.`,
        undefined,
        undefined,
        {
          overdue_tasks: tasks ?? [],
          overdue_finance: finance ?? [],
        }
      );
    }

    case "weekly_summary": {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString();

      const [tasksRes, eventsRes, workoutsRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id", { count: "exact" })
          .eq("status", "done")
          .gte("completed_at", weekAgoStr),
        supabase
          .from("events")
          .select("id", { count: "exact" })
          .gte("start_time", weekAgoStr)
          .lte("start_time", new Date().toISOString()),
        supabase
          .from("workout_sessions")
          .select("id, duration_minutes", { count: "exact" })
          .gte("completed_at", weekAgoStr),
      ]);

      return ok("Ukessammendrag hentet.", undefined, undefined, {
        tasks_completed: tasksRes.count ?? 0,
        events_attended: eventsRes.count ?? 0,
        workouts_logged: workoutsRes.count ?? 0,
        total_workout_minutes: (workoutsRes.data ?? []).reduce(
          (sum: number, w: Record<string, unknown>) =>
            sum + ((w.duration_minutes as number) ?? 0),
          0
        ),
      });
    }

    case "training_history": {
      const daysBack = (filters.days_ahead as number) ?? 30;
      const since = new Date();
      since.setDate(since.getDate() - daysBack);

      const { data, error } = await supabase
        .from("workout_sessions")
        .select("id, title, duration_minutes, intensity, completed_at, notes")
        .gte("completed_at", since.toISOString())
        .order("completed_at", { ascending: false })
        .limit(30);

      if (error) return fail(`Feil ved henting av treningshistorikk: ${error.message}`);
      return ok(`Fant ${data?.length ?? 0} trenings\u00f8kter.`, undefined, undefined, {
        items: data ?? [],
        count: data?.length ?? 0,
      });
    }

    default:
      return fail(`Ukjent sp\u00f8rringstype: ${queryType}`);
  }
}

async function executeReschedule(
  supabase: SupabaseClient,
  input: Record<string, unknown>
): Promise<ExecutionResult> {
  const search = input.search_term as string | undefined;
  const newDate = input.new_date as string | undefined;
  if (!search || !newDate) return fail("Mangler s\u00f8keord eller ny dato.");

  const entityType = (input.entity_type as string) ?? "task";
  const newTime = input.new_time as string | undefined;

  if (entityType === "event") {
    const { data: event, error: findErr } = await supabase
      .from("events")
      .select("id, title, start_time")
      .ilike("title", `%${search}%`)
      .limit(1)
      .single();

    if (findErr || !event) return fail(`Fant ingen hendelse som matcher: ${search}`);

    // Build new start_time preserving original time if no new_time given
    let newStart = newDate;
    if (newTime) {
      newStart = `${newDate}T${newTime}:00`;
    } else if (event.start_time) {
      const originalTime = (event.start_time as string).split("T")[1];
      if (originalTime) {
        newStart = `${newDate}T${originalTime}`;
      }
    }

    const { error } = await supabase
      .from("events")
      .update({ start_time: newStart })
      .eq("id", event.id);

    if (error) return fail(`Kunne ikke flytte hendelse: ${error.message}`);
    return ok(`Hendelse flyttet: ${event.title} -> ${newDate}`, "event", event.id);
  }

  // Default: task
  const { data: task, error: findErr } = await supabase
    .from("tasks")
    .select("id, title")
    .ilike("title", `%${search}%`)
    .neq("status", "done")
    .limit(1)
    .single();

  if (findErr || !task) return fail(`Fant ingen oppgave som matcher: ${search}`);

  const updateFields: Record<string, unknown> = {
    scheduled_date: newDate,
  };
  if (newTime) {
    updateFields.scheduled_time = newTime;
  }

  const { error } = await supabase
    .from("tasks")
    .update(updateFields)
    .eq("id", task.id);

  if (error) return fail(`Kunne ikke flytte oppgave: ${error.message}`);
  return ok(`Oppgave flyttet: ${task.title} -> ${newDate}`, "task", task.id);
}

// ---------------------------------------------------------------------------
// Main executor
// ---------------------------------------------------------------------------

const TOOL_EXECUTORS: Record<
  string,
  (
    supabase: SupabaseClient,
    input: Record<string, unknown>,
    userId: string
  ) => Promise<ExecutionResult>
> = {
  create_task: executeCreateTask,
  create_event: executeCreateEvent,
  complete_task: (s, i) => executeCompleteTask(s, i),
  create_finance_item: executeCreateFinanceItem,
  mark_paid: (s, i) => executeMarkPaid(s, i),
  log_workout: executeLogWorkout,
  create_note: executeCreateNote,
  query_data: (s, i) => executeQueryData(s, i),
  reschedule: (s, i) => executeReschedule(s, i),
};

export interface ExecuteOptions {
  confidence?: number;
  autoExecuted?: boolean;
  confirmedByUser?: boolean;
}

export async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  options?: ExecuteOptions
): Promise<ExecutionResult> {
  const supabase = await createServerSupabaseClient();

  const executor = TOOL_EXECUTORS[toolName];
  if (!executor) {
    return fail(`Ukjent verkt\u00f8y: ${toolName}`);
  }

  let result: ExecutionResult;
  try {
    result = await executor(supabase, input, userId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Ukjent feil under utf\u00f8relse";
    result = fail(message);
  }

  // Audit log
  await logAudit(supabase, {
    user_id: userId,
    agent_name: "command-router",
    action_type: toolName,
    entity_type: result.entityType ?? null,
    entity_id: result.entityId ?? null,
    input_data: input,
    output_data: result.data ?? null,
    confidence: options?.confidence ?? null,
    auto_executed: options?.autoExecuted ?? false,
    confirmed_by_user: options?.confirmedByUser ?? false,
    success: result.success,
  });

  return result;
}
