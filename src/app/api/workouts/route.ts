import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createWorkoutSessionSchema } from "@/lib/schemas/training";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const completed = searchParams.get("completed");
    const limit = searchParams.get("limit");

    let query = supabase
      .from("workout_sessions")
      .select("*")
      .order("planned_at", { ascending: false });

    if (completed !== null) {
      if (completed === "true") {
        query = query.not("completed_at", "is", null);
      } else {
        query = query.is("completed_at", null);
      }
    }

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Workouts GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = createWorkoutSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const insertData = {
      ...parsed.data,
      user_id: user.id,
      completed_at: parsed.data.completed_at ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Workouts POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
