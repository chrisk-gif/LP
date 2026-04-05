import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/orchestrator";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const VALID_AGENTS = [
  "executivePlanner",
  "tenderPilot",
  "ytlyOperator",
  "financeClerk",
  "trainingCoach",
  "reviewWriter",
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agent, input, context } = body;

    if (!agent || !VALID_AGENTS.includes(agent)) {
      return NextResponse.json(
        { error: "Invalid agent name" },
        { status: 400 }
      );
    }

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await runAgent(agent, input, context);
    const duration = Date.now() - startTime;

    // Log the agent run
    try {
      await supabase.from("ai_agent_runs").insert({
        user_id: user.id,
        agent_name: agent,
        input_text: input,
        output_text: result.response,
        model_used: agent === "executivePlanner" || agent === "reviewWriter" ? "planner" : "router",
        duration_ms: duration,
        success: result.success,
        error: result.error,
      });
    } catch {
      console.error("Failed to log agent run");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
