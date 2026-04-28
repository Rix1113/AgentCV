import { Header } from "@/components/Header";
import { PlanUsageCard } from "@/components/PlanUsageCard";
import { ProjectForm } from "@/components/ProjectForm";
import { ResultsWorkspace } from "@/components/ResultsWorkspace";
import { requireUser } from "@/lib/auth";
import { hasGeneratedDocuments } from "@/lib/documents";
import { getPlanUsageSummary } from "@/lib/plans";
import { getProject, getUsageTrackingStatus } from "@/lib/store";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const project = params.projectId ? await getProject(params.projectId, user.id) : undefined;
  const planSummary = await getPlanUsageSummary(user.id, user.email);
  const usageTrackingStatus = getUsageTrackingStatus();

  return (
    <main>
      <Header />
      <section className="page-shell">
        <div className="mb-6">
          <PlanUsageCard
            summary={planSummary}
            title="Current plan"
            description={planSummary.plan === "free" ? "Your free plan includes one completed generation per UTC day." : "Your quota reflects completed generations and exports for the current UTC day."}
            trackingMessage={usageTrackingStatus.available ? undefined : usageTrackingStatus.message}
          />
        </div>
        {hasGeneratedDocuments(project?.documents) ? (
          <ResultsWorkspace project={project} />
        ) : (
          <>
            <div className="hero-panel mb-8 overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
                <div className="max-w-3xl">
                  <p className="eyebrow">New project</p>
                  <h1 className="mt-5 text-5xl font-semibold leading-[0.96] text-ink sm:text-6xl">
                    Build a refined application set from your CV and the role brief.
                  </h1>
                  <p className="mt-5 max-w-2xl section-copy">
                    Bring in both source texts and the workspace will shape them into tailored Estonian application materials with room to review, edit, and export.
                  </p>
                </div>

                <div className="relative grid gap-3">
                  <div className="metric-tile">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Deliverables</p>
                    <p className="mt-3 text-xl font-semibold text-ink">CV, motivation letter, and profile statements</p>
                  </div>
                  <div className="metric-tile">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Workflow</p>
                    <p className="mt-3 text-sm leading-7 text-muted">Paste or upload, generate once, refine section by section, then export polished files.</p>
                  </div>
                </div>
              </div>
            </div>
            <ProjectForm />
          </>
        )}
      </section>
    </main>
  );
}
