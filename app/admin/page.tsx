import { AdminPlanForm } from "@/components/AdminPlanForm";
import { Header } from "@/components/Header";
import { updateUserPlanAction } from "@/app/admin/actions";
import { requireAdminUser } from "@/lib/auth";
import { listAdminManagedUsers } from "@/lib/store";
import { buildAdminAnalytics, recordUsageEvent } from "@/lib/usage";

export default async function AdminPage() {
  const user = await requireAdminUser();
  const analytics = await buildAdminAnalytics();
  const managedUsers = await listAdminManagedUsers();
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
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Admin settings</p>
            <h1 className="mt-2 text-3xl font-bold">Users and usage overview</h1>
            <p className="mt-2 text-sm text-slate-400">
              Generated at {new Date(analytics.generatedAt).toLocaleString("en-GB", { timeZone: "Europe/Tallinn" })}
            </p>
          </div>
        </div>

        <div className="card mb-8 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">User plans</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Review signed-in users and update their stored `user_profiles.plan` without editing Supabase rows by hand.
                Accounts listed in `ADMIN_EMAILS` always resolve to the `admin` plan and cannot be changed here.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Managed users</p>
              <p className="mt-2 text-3xl font-bold text-white">{managedUsers.length}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Effective plan</th>
                  <th className="pb-3 pr-4 font-medium">Last sign-in</th>
                  <th className="pb-3 font-medium">Update stored plan</th>
                </tr>
              </thead>
              <tbody>
                {managedUsers.length ? (
                  managedUsers.map((managedUser) => (
                    <tr key={managedUser.userId} className="border-b border-white/5 align-top last:border-b-0">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-white">{managedUser.displayEmail}</p>
                        <p className="mt-1 text-xs text-slate-500">{managedUser.userId}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          Created {formatDateTime(managedUser.createdAt)}
                          {managedUser.profileUpdatedAt ? ` • Profile updated ${formatDateTime(managedUser.profileUpdatedAt)}` : ""}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                          {managedUser.effectivePlan}
                        </span>
                        {managedUser.isAdmin ? (
                          <p className="mt-2 max-w-xs text-xs text-slate-500">
                            This user is an admin because their email matches `ADMIN_EMAILS`.
                          </p>
                        ) : null}
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{formatDateTime(managedUser.lastSignInAt)}</td>
                      <td className="py-4">
                        <AdminPlanForm user={managedUser} action={updateUserPlanAction} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-sm text-slate-400">
                      No users found yet. Once people sign in, they will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString("en-GB", { timeZone: "Europe/Tallinn" });
}
