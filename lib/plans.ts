import { isAdminEmail } from "@/lib/auth";
import { getUserPlanProfile, isUsageTrackingAvailable, listUsageEventsForUser, saveUserPlanProfile } from "@/lib/store";
import type { PlanTier, PlanUsageSummary, UsageEventType, UserPlanProfile } from "@/types";

type LimitedAction = "generation" | "export";

type RateLimitPolicy = {
  max: number;
  windowMs: number;
};

type PlanLimits = {
  dailyGenerations: number;
  dailyExports: number;
  generationRate: RateLimitPolicy;
  exportRate: RateLimitPolicy;
};

type PlanAllowanceInput = {
  userId: string;
  userEmail?: string | null;
  action: LimitedAction;
};

type PlanAllowanceResult =
  | {
      ok: true;
      plan: PlanTier;
    }
  | {
      ok: false;
      plan: PlanTier;
      status: 429;
      code: "rate_limit_exceeded" | "daily_limit_exceeded";
      error: string;
      retryAfterSeconds: number;
    };

const GENERATION_EVENT_TYPES: UsageEventType[] = ["documents_generated", "section_regenerated"];
const EXPORT_EVENT_TYPES: UsageEventType[] = ["exported_pdf", "exported_docx"];
let hasLoggedPlanFallbackWarning = false;

const DEFAULT_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    dailyGenerations: 10,
    dailyExports: 8,
    generationRate: { max: 3, windowMs: 10 * 60 * 1000 },
    exportRate: { max: 5, windowMs: 10 * 60 * 1000 },
  },
  pro: {
    dailyGenerations: 75,
    dailyExports: 50,
    generationRate: { max: 12, windowMs: 10 * 60 * 1000 },
    exportRate: { max: 20, windowMs: 10 * 60 * 1000 },
  },
  admin: {
    dailyGenerations: Number.MAX_SAFE_INTEGER,
    dailyExports: Number.MAX_SAFE_INTEGER,
    generationRate: { max: Number.MAX_SAFE_INTEGER, windowMs: 60 * 1000 },
    exportRate: { max: Number.MAX_SAFE_INTEGER, windowMs: 60 * 1000 },
  },
};

const proPlanEmails = parseEmailList(process.env.PRO_PLAN_EMAILS);

export async function getUserPlan(userId: string, userEmail?: string | null): Promise<PlanTier> {
  const normalizedEmail = userEmail?.trim().toLowerCase();

  if (isAdminEmail(normalizedEmail)) {
    return "admin";
  }

  const fallbackPlan = getFallbackUserPlan(normalizedEmail);

  try {
    const profile = await ensureUserPlanProfile(userId, normalizedEmail, fallbackPlan);
    return profile.plan;
  } catch (error) {
    if (!hasLoggedPlanFallbackWarning) {
      hasLoggedPlanFallbackWarning = true;
      console.error("Failed to resolve user plan from user_profiles, falling back to env allowlists.", error);
    }
    return fallbackPlan;
  }
}

export async function assertPlanAllowance(input: PlanAllowanceInput): Promise<PlanAllowanceResult> {
  const plan = await getUserPlan(input.userId, input.userEmail);
  const limits = getPlanLimits(plan);

  if (plan === "admin") {
    return { ok: true, plan };
  }

  if (!isUsageTrackingAvailable()) {
    return { ok: true, plan };
  }

  const actionLimits =
    input.action === "generation"
      ? {
          eventTypes: GENERATION_EVENT_TYPES,
          dailyMax: limits.dailyGenerations,
          rate: limits.generationRate,
          label: "generation",
        }
      : {
          eventTypes: EXPORT_EVENT_TYPES,
          dailyMax: limits.dailyExports,
          rate: limits.exportRate,
          label: "export",
        };

  const now = Date.now();
  const windowStartIso = new Date(now - actionLimits.rate.windowMs).toISOString();
  const dayStartIso = getUtcDayStart(now).toISOString();
  const recentEvents = await listUsageEventsForUser(input.userId, 500, dayStartIso);

  const matchingEvents = recentEvents.filter((event) => actionLimits.eventTypes.includes(event.eventType));
  const dailyCount = matchingEvents.length;

  if (dailyCount >= actionLimits.dailyMax) {
    const retryAt = getNextUtcDayStart(now);
    return {
      ok: false,
      plan,
      status: 429,
      code: "daily_limit_exceeded",
      error: `Your ${plan} plan has reached its daily ${actionLimits.label} limit.`,
      retryAfterSeconds: secondsUntil(retryAt, now),
    };
  }

  const windowEvents = matchingEvents.filter((event) => event.createdAt >= windowStartIso);
  if (windowEvents.length >= actionLimits.rate.max) {
    const oldestWindowEvent = windowEvents
      .map((event) => new Date(event.createdAt).getTime())
      .sort((a, b) => a - b)[0];
    const retryAt = oldestWindowEvent + actionLimits.rate.windowMs;

    return {
      ok: false,
      plan,
      status: 429,
      code: "rate_limit_exceeded",
      error: `Too many ${actionLimits.label} requests for your ${plan} plan. Please wait and try again.`,
      retryAfterSeconds: secondsUntil(retryAt, now),
    };
  }

  return { ok: true, plan };
}

function getPlanLimits(plan: PlanTier): PlanLimits {
  const defaults = DEFAULT_LIMITS[plan];

  if (plan === "admin") {
    return defaults;
  }

  const prefix = plan.toUpperCase();

  return {
    dailyGenerations: readNumberEnv(`PLAN_${prefix}_DAILY_GENERATIONS`, defaults.dailyGenerations),
    dailyExports: readNumberEnv(`PLAN_${prefix}_DAILY_EXPORTS`, defaults.dailyExports),
    generationRate: {
      max: readNumberEnv(`PLAN_${prefix}_GENERATION_RATE_MAX`, defaults.generationRate.max),
      windowMs: readNumberEnv(
        `PLAN_${prefix}_GENERATION_RATE_WINDOW_MS`,
        defaults.generationRate.windowMs
      ),
    },
    exportRate: {
      max: readNumberEnv(`PLAN_${prefix}_EXPORT_RATE_MAX`, defaults.exportRate.max),
      windowMs: readNumberEnv(`PLAN_${prefix}_EXPORT_RATE_WINDOW_MS`, defaults.exportRate.windowMs),
    },
  };
}

export async function getPlanUsageSummary(userId: string, userEmail?: string | null): Promise<PlanUsageSummary> {
  const plan = await getUserPlan(userId, userEmail);
  const limits = getPlanLimits(plan);
  const now = Date.now();
  const dayStartIso = getUtcDayStart(now).toISOString();
  const trackingEnabled = plan === "admin" ? true : isUsageTrackingAvailable();
  let generationCount: number | null = null;
  let exportCount: number | null = null;

  if (plan === "admin") {
    generationCount = 0;
    exportCount = 0;
  } else if (trackingEnabled) {
    const usageEvents = await listUsageEventsForUser(userId, 500, dayStartIso);
    generationCount = usageEvents.filter((event) => GENERATION_EVENT_TYPES.includes(event.eventType)).length;
    exportCount = usageEvents.filter((event) => EXPORT_EVENT_TYPES.includes(event.eventType)).length;
  }

  return {
    plan,
    resetsAt: new Date(getNextUtcDayStart(now)).toISOString(),
    trackingEnabled,
    generations: summarizeUsage(generationCount, limits.dailyGenerations),
    exports: summarizeUsage(exportCount, limits.dailyExports),
  };
}

function getFallbackUserPlan(userEmail?: string | null): Exclude<PlanTier, "admin"> {
  if (userEmail && proPlanEmails.has(userEmail)) {
    return "pro";
  }

  return "free";
}

async function ensureUserPlanProfile(
  userId: string,
  userEmail: string | null | undefined,
  fallbackPlan: Exclude<PlanTier, "admin">
): Promise<UserPlanProfile> {
  const existing = await getUserPlanProfile(userId);

  if (existing) {
    if (existing.email === userEmail || userEmail === undefined) {
      return existing;
    }

    const updatedProfile: UserPlanProfile = {
      ...existing,
      email: userEmail ?? null,
      updatedAt: new Date().toISOString(),
    };
    return saveUserPlanProfile(updatedProfile);
  }

  const now = new Date().toISOString();
  return saveUserPlanProfile({
    userId,
    email: userEmail ?? null,
    plan: fallbackPlan,
    createdAt: now,
    updatedAt: now,
  });
}

function parseEmailList(value?: string) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

function summarizeUsage(used: number | null, limit: number) {
  if (used === null) {
    return {
      used: null,
      limit: null,
      remaining: null,
    };
  }

  if (!Number.isFinite(limit) || limit >= Number.MAX_SAFE_INTEGER) {
    return {
      used,
      limit: null,
      remaining: null,
    };
  }

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getUtcDayStart(timestampMs: number) {
  const date = new Date(timestampMs);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getNextUtcDayStart(timestampMs: number) {
  const dayStart = getUtcDayStart(timestampMs);
  dayStart.setUTCDate(dayStart.getUTCDate() + 1);
  return dayStart.getTime();
}

function secondsUntil(targetMs: number, fromMs: number) {
  return Math.max(1, Math.ceil((targetMs - fromMs) / 1000));
}
