import { NextRequest, NextResponse } from "next/server";
import { routeCommand } from "@/lib/ai/orchestrator";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { executeToolCall } from "@/lib/ai/executor";
import type { ExecutionResult } from "@/lib/ai/executor";
import { CONFIDENCE_THRESHOLDS } from "@/lib/constants";

interface ActionResult {
  action: string;
  status: "done" | "failed";
  entityId?: string;
  entityType?: string;
  message: string;
  data?: Record<string, unknown>;
}

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
    const { input, context, confirm, pendingToolCalls } = body as {
      input?: string;
      context?: Record<string, unknown>;
      confirm?: boolean;
      pendingToolCalls?: Array<{ name: string; input: Record<string, unknown> }>;
    };

    // -----------------------------------------------------------------
    // Confirmation flow: execute previously-returned pending tool calls
    // -----------------------------------------------------------------
    if (confirm && pendingToolCalls && Array.isArray(pendingToolCalls)) {
      const actions: ActionResult[] = [];
      const responses: string[] = [];

      for (const tc of pendingToolCalls) {
        const result: ExecutionResult = await executeToolCall(
          tc.name,
          tc.input,
          user.id
        );
        actions.push({
          action: tc.name,
          status: result.success ? "done" : "failed",
          entityId: result.entityId,
          entityType: result.entityType,
          message: result.message,
          data: result.data,
        });
        responses.push(result.message);
      }

      return NextResponse.json({
        intent: pendingToolCalls[0]?.name ?? "unknown",
        confidence: 1,
        response: responses.join(" "),
        actions,
        confirmationRequired: false,
      });
    }

    // -----------------------------------------------------------------
    // Standard flow: parse command and optionally execute
    // -----------------------------------------------------------------
    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    // Route the command through AI
    const result = await routeCommand(input, context);

    // Log the AI run (best-effort)
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
      console.error("Failed to log AI run");
    }

    // Determine whether to auto-execute
    const hasToolCalls =
      result.toolCalls && result.toolCalls.length > 0;
    const highConfidence =
      result.confidence >= CONFIDENCE_THRESHOLDS.HIGH;
    const canAutoExecute =
      hasToolCalls && highConfidence && !result.confirmationRequired;

    if (canAutoExecute && result.toolCalls) {
      // Auto-execute the tool calls
      const actions: ActionResult[] = [];
      const responses: string[] = [];

      for (const tc of result.toolCalls) {
        const execResult: ExecutionResult = await executeToolCall(
          tc.name,
          tc.input,
          user.id
        );
        actions.push({
          action: tc.name,
          status: execResult.success ? "done" : "failed",
          entityId: execResult.entityId,
          entityType: execResult.entityType,
          message: execResult.message,
          data: execResult.data,
        });
        responses.push(execResult.message);
      }

      return NextResponse.json({
        intent: result.intent,
        confidence: result.confidence,
        response:
          responses.join(" ") || result.explanation,
        actions,
        confirmationRequired: false,
      });
    }

    // Return parsed intent without executing (confirmation required or
    // low confidence or no tool calls)
    return NextResponse.json({
      intent: result.intent,
      confidence: result.confidence,
      response: result.explanation,
      fields: result.fields,
      area: result.area,
      confirmationRequired: result.confirmationRequired,
      toolCalls: result.toolCalls,
      actions: [],
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
