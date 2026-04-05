import { getAnthropicClient, MODEL_CONFIG, SYSTEM_PROMPTS } from "./config";
import { AI_TOOLS } from "./tools";
import { CONFIDENCE_THRESHOLDS } from "../constants";

export interface ParsedIntent {
  intent: string;
  confidence: number;
  fields: Record<string, unknown>;
  area: string | null;
  confirmationRequired: boolean;
  explanation: string;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
}

export interface AgentResult {
  success: boolean;
  response: string;
  parsedIntent?: ParsedIntent;
  actions?: Array<{
    action: string;
    entityType: string;
    entityId?: string;
    data: Record<string, unknown>;
  }>;
  error?: string;
}

export async function routeCommand(
  input: string,
  context?: Record<string, unknown>
): Promise<ParsedIntent> {
  const client = getAnthropicClient();

  const contextStr = context
    ? `\n\nKontekst:\n${JSON.stringify(context, null, 2)}`
    : "";

  const response = await client.messages.create({
    model: MODEL_CONFIG.router,
    max_tokens: 1024,
    system: SYSTEM_PROMPTS.commandRouter + contextStr,
    tools: AI_TOOLS,
    messages: [{ role: "user", content: input }],
  });

  // Extract tool calls if any
  const toolCalls = response.content
    .filter((block) => block.type === "tool_use")
    .map((block) => {
      if (block.type === "tool_use") {
        return { name: block.name, input: block.input as Record<string, unknown> };
      }
      return null;
    })
    .filter(Boolean) as Array<{ name: string; input: Record<string, unknown> }>;

  // Extract text response
  const textBlock = response.content.find((block) => block.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

  // Try parsing structured response from text
  let parsed: Partial<ParsedIntent> = {};
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Use tool calls as fallback
  }

  // Build intent from tool calls or parsed text
  if (toolCalls.length > 0) {
    const firstTool = toolCalls[0];
    return {
      intent: firstTool.name,
      confidence: 0.9,
      fields: firstTool.input,
      area: (firstTool.input.area as string) ?? null,
      confirmationRequired: shouldRequireConfirmation(firstTool.name, 0.9),
      explanation: text || `Utfører: ${firstTool.name}`,
      toolCalls,
    };
  }

  return {
    intent: parsed.intent ?? "unknown",
    confidence: parsed.confidence ?? 0.3,
    fields: parsed.fields ?? {},
    area: parsed.area ?? null,
    confirmationRequired:
      parsed.confirmationRequired ??
      shouldRequireConfirmation(
        parsed.intent ?? "unknown",
        parsed.confidence ?? 0.3
      ),
    explanation: parsed.explanation ?? text ?? "Kunne ikke tolke kommandoen",
  };
}

export async function runAgent(
  agentName: string,
  input: string,
  context?: Record<string, unknown>
): Promise<AgentResult> {
  const client = getAnthropicClient();

  const systemPrompt =
    SYSTEM_PROMPTS[agentName as keyof typeof SYSTEM_PROMPTS] ??
    SYSTEM_PROMPTS.commandRouter;

  const model =
    agentName === "executivePlanner" || agentName === "reviewWriter"
      ? MODEL_CONFIG.planner
      : MODEL_CONFIG.router;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system:
        systemPrompt +
        (context ? `\n\nKontekst:\n${JSON.stringify(context, null, 2)}` : ""),
      messages: [{ role: "user", content: input }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n");

    return {
      success: true,
      response: text,
    };
  } catch (error) {
    return {
      success: false,
      response: "Beklager, en feil oppstod.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function shouldRequireConfirmation(
  intent: string,
  confidence: number
): boolean {
  // Read-only queries never need confirmation
  if (["query", "query_data", "summarize", "plan_day"].includes(intent)) {
    return false;
  }

  // Low confidence always needs confirmation
  if (confidence < CONFIDENCE_THRESHOLDS.MEDIUM) {
    return true;
  }

  // High confidence, low-risk actions may auto-execute
  const lowRiskActions = ["create_note", "log_workout", "complete_task"];
  if (
    confidence >= CONFIDENCE_THRESHOLDS.HIGH &&
    lowRiskActions.includes(intent)
  ) {
    return false;
  }

  // Default: require confirmation
  return true;
}
