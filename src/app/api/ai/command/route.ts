import { NextRequest, NextResponse } from "next/server";
import { routeCommand } from "@/lib/ai/orchestrator";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { input, context } = body;

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    // Rate limiting: simple in-memory check
    // In production, use a proper rate limiter

    // Route the command through AI
    const result = await routeCommand(input, context);

    // Log the AI run
    try {
      await supabase.from("ai_agent_runs").insert({
        user_id: user.id,
        agent_name: "command-router",
        input_text: input,
        output_text: result.explanation,
        model_used: "router",
        success: result.intent !== "unknown",
      });
    } catch {
      // Don't fail the request if logging fails
      console.error("Failed to log AI run");
    }

    return NextResponse.json({
      intent: result.intent,
      confidence: result.confidence,
      fields: result.fields,
      area: result.area,
      confirmationRequired: result.confirmationRequired,
      explanation: result.explanation,
      response: result.explanation,
      toolCalls: result.toolCalls,
    });
  } catch (error) {
    console.error("AI command error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        response: "Beklager, en feil oppstod ved behandling av kommandoen.",
      },
      { status: 500 }
    );
  }
}
