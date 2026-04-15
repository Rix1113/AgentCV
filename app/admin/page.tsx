import { Header } from "@/components/Header";
import { requireAdminUser } from "@/lib/auth";
import { buildAdminAnalytics, recordUsageEvent } from "@/lib/usage";

export default async function AdminPage() {
  const user = await requireAdminUser();
  const analytics = await buildAdminAnalytics();
  const maxDailyEvents = Math.max(...analytics.dailyUsage.map((day) => day.events), 0);

  await recordUsageEvent({
    userId: user.id,
    userEmail: user.email,
    eventType: "admin_analytics_viewed",
    route: "/admin",
    metadata: {
      method: "GET",
      pathname: "/admin",
    },
  });

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Admin analytics</p>
            <h1 className="mt-2 text-3xl font-bold">Usage overview</h1>
            <p className="mt-2 text-sm text-slate-400">
              Generated at {new Date(analytics.generatedAt).toLocaleString("en-GB", { timeZone: "Europe/Tallinn" })}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total events" value={analytics.totals.events} />
          <MetricCard label="Active users" value={analytics.totals.activeUsers} />
          <MetricCard label="Projects created" value={analytics.totals.projectsCreated} />
          <MetricCard label="Analyses run" value={analytics.totals.analysesRun} />
          <MetricCard label="Document generations" value={analytics.totals.documentGenerations} />
          <MetricCard label="Exports" value={analytics.totals.exports} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Daily usage</h2>
            <div className="mt-5 space-y-4">
              {analytics.dailyUsage.map((day) => (
                <div key={day.date}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{day.date}</span>
                    <span>{day.events} events / {day.users} users</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-300"
                      style={{
                        width: `${day.events === 0 ? 0 : Math.max(8, Math.round((day.events / maxDailyEvents) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold">Event mix</h2>
            <div className="mt-5 space-y-3">
              {analytics.eventsByType.length ? (
                analytics.eventsByType.map((entry) => (
                  <div key={entry.eventType} className="flex items-center justify-between text-sm text-slate-300">
                    <span className="font-medium text-white">{formatEventType(entry.eventType)}</span>
                    <span>{entry.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No usage events recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Top users</h2>
            <div className="mt-5 space-y-3">
              {analytics.topUsers.length ? (
                analytics.topUsers.map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between gap-4 text-sm text-slate-300">
                    <div>
                      <p className="font-medium text-white">{entry.userEmail ?? entry.userId}</p>
                      <p className="text-xs text-slate-500">{entry.userId}</p>
                    </div>
                    <span>{entry.events} events</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No signed-in activity yet.</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <div className="mt-5 space-y-4">
              {analytics.recentActivity.length ? (
                analytics.recentActivity.map((event) => (
                  <div key={event.id} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-white">{formatEventType(event.eventType)}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(event.createdAt).toLocaleString("en-GB", { timeZone: "Europe/Tallinn" })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {event.metadata?.userEmail ?? event.userId ?? "Unknown user"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[event.route, event.projectId, event.metadata?.section].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No recent activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function formatEventType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
