import Link from "next/link";
import type { Project } from "@/types";
import { formatIsoDateTimeUtc } from "@/lib/utils";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <div key={project.id} className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Saved project</p>
              <h3 className="mt-3 text-2xl font-semibold text-ink">{project.title}</h3>
              <p className="mt-2 text-sm text-muted">Updated {formatIsoDateTimeUtc(project.updatedAt)}</p>
            </div>
            <Link href={`/dashboard?projectId=${project.id}`} className="button-secondary">Open</Link>
          </div>
        </div>
      ))}
      {!projects.length ? <div className="card p-6 text-sm text-muted">No projects yet.</div> : null}
    </div>
  );
}
