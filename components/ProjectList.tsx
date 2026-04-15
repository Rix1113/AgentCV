import Link from "next/link";
import type { Project } from "@/types";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <div key={project.id} className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="mt-1 text-sm text-slate-300">Updated {new Date(project.updatedAt).toLocaleString()}</p>
            </div>
            <Link href={`/dashboard?projectId=${project.id}`} className="button-secondary">Open</Link>
          </div>
        </div>
      ))}
      {!projects.length ? <div className="card p-5 text-sm text-slate-300">No projects yet.</div> : null}
    </div>
  );
}
