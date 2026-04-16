import { Header } from "@/components/Header";
import { PlanUsageCard } from "@/components/PlanUsageCard";
import { ProjectForm } from "@/components/ProjectForm";
import { ResultsWorkspace } from "@/components/ResultsWorkspace";
import { requireUser } from "@/lib/auth";
import { getPlanUsageSummary } from "@/lib/plans";
import { getProject } from "@/lib/store";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const project = params.projectId ? await getProject(params.projectId, user.id) : undefined;
  const planSummary = await getPlanUsageSummary(user.id, user.email);

  return (
    <main>
      <Header />
      <section className="page-shell">
        <div className="mb-6">
          <PlanUsageCard
            summary={planSummary}
            title="Current plan"
            description="Your quota reflects completed generations and exports for the current UTC day."
          />
        </div>
        {project?.documents ? (
          <ResultsWorkspace project={project} />
        ) : (
          <>
            <div className="mb-8 max-w-3xl">
              <p className="eyebrow">New project</p>
              <h1 className="mt-4 text-5xl font-semibold text-ink">Start with your CV and the target role.</h1>
              <p className="mt-4 section-copy">
                Upload or paste both inputs, choose the generation model, and let the workspace prepare the first tailored draft.
              </p>
            </div>
            <ProjectForm />
          </>
        )}
      </section>
    </main>
  );
}
