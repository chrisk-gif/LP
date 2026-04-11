export const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "nb-NO";
export const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "Europe/Oslo";
export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "NOK";

export const AREA_SLUGS = [
  "asplan-viak",
  "ytly",
  "privat",
  "okonomi",
  "trening",
] as const;

export type AreaSlug = (typeof AREA_SLUGS)[number];

/**
 * Alias map: common alternative names → canonical area slugs.
 * AI tool calls may produce these; they must be normalized before execution.
 */
export const AREA_ALIASES: Record<string, AreaSlug> = {
  jobb: "asplan-viak",
  arbeid: "asplan-viak",
  work: "asplan-viak",
  helse: "trening",
  health: "trening",
  "ytly.no": "ytly",
  business: "ytly",
  finance: "okonomi",
  økonomi: "okonomi",
  personal: "privat",
  private: "privat",
};

const CANONICAL_SET = new Set<string>(AREA_SLUGS);

/** Resolve an area input to a canonical slug, or null if unrecognizable. */
export function resolveCanonicalArea(input: unknown): AreaSlug | null {
  if (typeof input !== "string" || !input) return null;
  const lower = input.toLowerCase().trim();
  if (CANONICAL_SET.has(lower)) return lower as AreaSlug;
  return AREA_ALIASES[lower] ?? null;
}

export const AREA_DEFAULTS: Record<
  AreaSlug,
  { name: string; color: string; icon: string }
> = {
  "asplan-viak": { name: "Asplan Viak", color: "#2563eb", icon: "Briefcase" },
  ytly: { name: "ytly.no", color: "#7c3aed", icon: "Rocket" },
  privat: { name: "Privat", color: "#059669", icon: "Home" },
  okonomi: { name: "Økonomi", color: "#d97706", icon: "Wallet" },
  trening: { name: "Trening", color: "#dc2626", icon: "Dumbbell" },
};

export const TASK_STATUSES = [
  "inbox",
  "todo",
  "in_progress",
  "waiting",
  "done",
  "archived",
] as const;

export const TASK_PRIORITIES = ["critical", "high", "medium", "low"] as const;

export const TENDER_STATUSES = [
  "identified",
  "preparing",
  "submitted",
  "won",
  "lost",
  "cancelled",
] as const;

export const GOAL_HORIZONS = [
  "short-term",
  "monthly",
  "quarterly",
  "yearly",
  "long-term",
] as const;

export const REVIEW_PERIODS = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
] as const;

export const FINANCE_TYPES = [
  "bill",
  "subscription",
  "receipt",
  "reimbursement",
  "savings",
  "investment",
  "other",
] as const;

export const FINANCE_STATUSES = [
  "upcoming",
  "due",
  "overdue",
  "paid",
  "archived",
] as const;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.6,
  LOW: 0.3,
} as const;

export const AI_MODELS = {
  router: process.env.ANTHROPIC_MODEL_ROUTER ?? "claude-sonnet-4-20250514",
  planner: process.env.ANTHROPIC_MODEL_PLANNER ?? "claude-opus-4-20250514",
} as const;
