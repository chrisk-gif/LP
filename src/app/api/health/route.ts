import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Health/readiness endpoint for monitoring and deploy verification.
 * Checks:
 * - App is booted and can handle requests
 * - Supabase DB is reachable
 * - Required environment variables are present
 */
export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // 1. Required env vars
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  checks.env = missingVars.length === 0
    ? { ok: true }
    : { ok: false, detail: `Missing: ${missingVars.join(", ")}` };

  // 2. Optional but important env vars
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  checks.ai = hasAnthropicKey
    ? { ok: true }
    : { ok: true, detail: "ANTHROPIC_API_KEY not set — AI features unavailable" };

  // 3. Supabase DB reachability
  try {
    const supabase = await createServiceRoleClient();
    const { error } = await supabase.from("areas").select("id").limit(1);
    checks.database = error
      ? { ok: false, detail: error.message }
      : { ok: true };
  } catch (err) {
    checks.database = {
      ok: false,
      detail: err instanceof Error ? err.message : "DB connection failed",
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
