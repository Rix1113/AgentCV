import { Header } from "@/components/Header";
import { PlanUsageCard } from "@/components/PlanUsageCard";
import { requireUser } from "@/lib/auth";
import { getPlanUsageSummary } from "@/lib/plans";
import { getUsageTrackingStatus } from "@/lib/store";

export default async function SettingsPage() {
  const user = await requireUser();
  const planSummary = await getPlanUsageSummary(user.id, user.email);
  const usageTrackingStatus = getUsageTrackingStatus();

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold">Settings</h1>
        <div className="grid gap-6">
          <PlanUsageCard
            summary={planSummary}
            title="Billing and plan limits"
            description="This reflects your currently active plan and the remaining daily quota available right now."
            trackingMessage={usageTrackingStatus.available ? undefined : usageTrackingStatus.message}
          />

          <div className="card p-6 text-slate-300">
            <p className="mb-4">Signed in as <span className="font-semibold text-white">{user.email}</span></p>
            <p>Planned settings areas:</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Account and authentication</li>
              <li>Billing and plan limits</li>
              <li>Default export preferences</li>
              <li>Data retention and privacy controls</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
