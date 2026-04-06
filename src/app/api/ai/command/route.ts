import { NextRequest, NextResponse } from "next/server";
import { routeCommand } from "@/lib/ai/orchestrator";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { executeToolCall, normalizeToolCallInput, READ_ONLY_TOOLS } from "@/lib/ai/executor";
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
        // Normalize before execution — even confirmed writes must not skip validation
        const norm = normalizeToolCallInput(tc.name, tc.input);
        if (!norm.ok) {
          actions.push({
            action: tc.name,
            status: "failed",
            message: norm.message ?? `Mangler felt: ${norm.missing.join(", ")}`,
          });
          responses.push(norm.message ?? "Ufullstendig data.");
          continue;
        }

        const result: ExecutionResult = await executeToolCall(
          tc.name,
          norm.input,
          user.id,
          { confidence: 1.0, autoExecuted: false, confirmedByUser: true }
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
      // best-effort logging
    }

    // Fetch user's ai_auto_execute preference
    let userAutoExecute = false;
    try {
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("ai_auto_execute")
        .eq("user_id", user.id)
        .single();
      if (prefs) {
        userAutoExecute = prefs.ai_auto_execute === true;
      }
    } catch {
      // Default to false if fetch fails
    }

    // Determine whether to auto-execute
    const hasToolCalls =
      result.toolCalls && result.toolCalls.length > 0;
    const highConfidence =
      result.confidence >= CONFIDENCE_THRESHOLDS.HIGH;

    // Read-only queries can always execute (no write side-effects)
    const isReadOnly = result.toolCalls?.every(
      (tc) => READ_ONLY_TOOLS.has(tc.name)
    ) ?? false;

    // Normalize all tool calls before deciding on auto-execution
    let allNormalized = true;
    const normalizedToolCalls = (result.toolCalls ?? []).map((tc) => {
      const norm = normalizeToolCallInput(tc.name, tc.input);
      if (!norm.ok) allNormalized = false;
      return { ...tc, input: norm.input, normOk: norm.ok, normMissing: norm.missing, normMessage: norm.message };
    });

    // Write tools with unresolved required fields must force confirmation, never auto-execute
    const canAutoExecute =
      hasToolCalls &&
      highConfidence &&
      !result.confirmationRequired &&
      allNormalized &&
      (isReadOnly || userAutoExecute);

    if (canAutoExecute && normalizedToolCalls.length > 0) {
      // Auto-execute the tool calls
      const actions: ActionResult[] = [];
      const responses: string[] = [];

      for (const tc of normalizedToolCalls) {
        const execResult: ExecutionResult = await executeToolCall(
          tc.name,
          tc.input,
          user.id,
          {
            confidence: result.confidence,
            autoExecuted: true,
            confirmedByUser: false,
          }
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
    // low confidence or no tool calls or auto-execute disabled or unresolved fields)
    // Send the normalized tool calls so end_time defaults etc. are visible in confirmation UI
    const toolCallsForResponse = normalizedToolCalls.map(({ normOk: _a, normMissing: _b, normMessage: _c, ...rest }) => rest);
    return NextResponse.json({
      intent: result.intent,
      confidence: result.confidence,
      response: !allNormalized
        ? `${result.explanation} (Mangler felt som må fylles ut: ${normalizedToolCalls.filter(tc => !tc.normOk).flatMap(tc => tc.normMissing).join(", ")})`
        : result.explanation,
      fields: result.fields,
      area: result.area,
      confirmationRequired: hasToolCalls && !isReadOnly ? true : false,
      toolCalls: toolCallsForResponse,
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
