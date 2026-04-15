import { Header } from "@/components/Header";
import { ProjectForm } from "@/components/ProjectForm";
import { ResultsWorkspace } from "@/components/ResultsWorkspace";
import { getProject } from "@/lib/store";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const params = await searchParams;
  const project = params.projectId ? await getProject(params.projectId) : undefined;

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-10">
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
