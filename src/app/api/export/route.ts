import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { exportLimiter } from "@/lib/rate-limit";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 3 exports/minute per user
    const rateCheck = exportLimiter.check(user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "For mange eksportforespørsler. Vent litt." },
        { status: 429 }
      );
    }

    // Export all user data
    const [tasks, events, goals, projects, tenders, financeItems, notes, reviews, workoutSessions, inboxItems] = await Promise.all([
      supabase.from("tasks").select("*").then(r => r.data),
      supabase.from("events").select("*").then(r => r.data),
      supabase.from("goals").select("*").then(r => r.data),
      supabase.from("projects").select("*").then(r => r.data),
      supabase.from("tenders").select("*").then(r => r.data),
      supabase.from("finance_items").select("*").then(r => r.data),
      supabase.from("notes").select("*").then(r => r.data),
      supabase.from("reviews").select("*").then(r => r.data),
      supabase.from("workout_sessions").select("*").then(r => r.data),
      supabase.from("inbox_items").select("*").then(r => r.data),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      data: {
        tasks,
        events,
        goals,
        projects,
        tenders,
        finance_items: financeItems,
        notes,
        reviews,
        workout_sessions: workoutSessions,
        inbox_items: inboxItems,
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="livsplanlegg-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("[export] Export failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Eksport feilet. Prøv igjen senere." }, { status: 500 });
  }
}
