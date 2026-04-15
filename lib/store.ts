import type { Project } from "@/types";

const memoryStore = new Map<string, Project>();

export function listProjects(): Project[] {
  return Array.from(memoryStore.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProject(id: string): Project | undefined {
  return memoryStore.get(id);
}

export function saveProject(project: Project): Project {
  memoryStore.set(project.id, project);
  return project;
}
