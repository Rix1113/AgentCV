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
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold">History</h1>
        <ProjectList projects={projects} />
      </section>
    </main>
  );
}
