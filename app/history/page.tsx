import { Header } from "@/components/Header";
import { ProjectList } from "@/components/ProjectList";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/store";

export default async function HistoryPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id);
  return (
    <main>
      <Header />
      <section className="page-shell">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Project archive</p>
          <h1 className="mt-4 text-5xl font-semibold text-ink">Reopen past applications and continue refining.</h1>
          <p className="mt-4 section-copy">
            Every project stays available for review, iteration, and export whenever you want to revisit it.
          </p>
        </div>
        <ProjectList projects={projects} />
      </section>
    </main>
  );
}
