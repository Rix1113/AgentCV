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
      <section className="mx-auto max-w-6xl px-6 py-10">
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
            <h1 className="mb-6 text-3xl font-bold">New project</h1>
            <ProjectForm />
          </>
        )}
      </section>
    </main>
  );
}
