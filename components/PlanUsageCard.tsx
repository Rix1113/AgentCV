import type { PlanUsageSummary } from "@/types";

function formatPlanName(plan: PlanUsageSummary["plan"]) {
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
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PlanUsageCard({
  summary,
  title = "Plan and quota",
  description = "Daily limits refresh automatically at the next UTC reset.",
}: {
  summary: PlanUsageSummary;
  title?: string;
  description?: string;
}) {
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{formatPlanName(summary.plan)} plan</h2>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
          <p className="mt-2 text-xs text-slate-500">Resets {formatResetTime(summary.resetsAt)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-black/10 p-4">
          <p className="text-sm font-semibold text-white">Generations</p>
          <p className="mt-2 text-3xl font-bold text-white">{formatQuotaValue(summary.generations.remaining)}</p>
          <p className="mt-1 text-sm text-slate-300">
            {formatRemainingText(summary.generations.remaining, summary.generations.limit)}
          </p>
          <p className="mt-3 text-xs text-slate-500">Used: {summary.generations.used === null ? "Unknown" : summary.generations.used}</p>
        </div>

        <div className="rounded-2xl border border-border bg-black/10 p-4">
          <p className="text-sm font-semibold text-white">Exports</p>
          <p className="mt-2 text-3xl font-bold text-white">{formatQuotaValue(summary.exports.remaining)}</p>
          <p className="mt-1 text-sm text-slate-300">
            {formatRemainingText(summary.exports.remaining, summary.exports.limit)}
          </p>
          <p className="mt-3 text-xs text-slate-500">Used: {summary.exports.used === null ? "Unknown" : summary.exports.used}</p>
        </div>
      </div>
      {!summary.trackingEnabled ? (
        <p className="mt-4 text-sm text-amber-300">
          Usage tracking is unavailable because Supabase persistence is not fully configured or the usage_events table is missing.
        </p>
      ) : null}
    </section>
  );
}
