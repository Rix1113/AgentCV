import type { PlanUsageSummary } from "@/types";
import { formatIsoDateTimeUtc } from "@/lib/utils";

function formatPlanName(plan: PlanUsageSummary["plan"]) {
  if (plan === "free") {
    return "Demo";
  }
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function formatQuotaValue(value: number | null) {
  return value === null ? "Unknown" : value.toString();
}

function formatRemainingText(value: number | null, limit: number | null) {
  if (value === null) {
    return "remaining today";
  }
  return `remaining today${limit === null ? "" : ` of ${limit}`}`;
}

function formatResetTime(iso: string) {
  return formatIsoDateTimeUtc(iso);
}

export function PlanUsageCard({
  summary,
  trackingMessage,
  title = "Plan and quota",
  description = "Daily limits refresh automatically at the next UTC reset.",
}: {
  summary: PlanUsageSummary;
  trackingMessage?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="hero-panel p-6 sm:p-8">
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="eyebrow">{title}</p>
          <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">{formatPlanName(summary.plan)} access</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Resets {formatResetTime(summary.resetsAt)}</p>
        </div>
        <div className="metric-tile min-w-40">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Status</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{summary.trackingEnabled ? "Tracking live" : "Limited"}</p>
          <p className="mt-2 text-sm text-muted">{summary.trackingEnabled ? "Usage events are recording normally." : "Some quota details may be delayed."}</p>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 md:grid-cols-2">
        <div className="metric-tile">
          <p className="text-sm font-semibold text-ink">Generations</p>
          <p className="mt-3 text-4xl font-semibold text-ink">{formatQuotaValue(summary.generations.remaining)}</p>
          <p className="mt-1 text-sm text-muted">
            {formatRemainingText(summary.generations.remaining, summary.generations.limit)}
          </p>
          <p className="mt-3 text-xs text-muted">Used: {summary.generations.used === null ? "Unknown" : summary.generations.used}</p>
        </div>

        <div className="metric-tile">
          <p className="text-sm font-semibold text-ink">Exports</p>
          <p className="mt-3 text-4xl font-semibold text-ink">{formatQuotaValue(summary.exports.remaining)}</p>
          <p className="mt-1 text-sm text-muted">
            {formatRemainingText(summary.exports.remaining, summary.exports.limit)}
          </p>
          <p className="mt-3 text-xs text-muted">Used: {summary.exports.used === null ? "Unknown" : summary.exports.used}</p>
        </div>
      </div>
      {!summary.trackingEnabled ? (
        <p className="status-panel mt-4 border-amber-200 bg-amber-50/95 text-amber-700">
          {trackingMessage ??
            "Usage tracking is unavailable because Supabase persistence is not fully configured or the usage_events table is missing."}
        </p>
      ) : null}
    </section>
  );
}
