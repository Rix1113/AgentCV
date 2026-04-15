import type { Project } from "@/types";

const memoryStore = new Map<string, Project>();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabase = Boolean(supabaseUrl && supabaseServiceRoleKey);

type SupabaseProjectRow = {
  id: string;
  title: string;
  cv_text: string | null;
  job_ad_text: string | null;
  analysis: Project["analysis"] | null;
  documents: Project["documents"] | null;
  created_at: string;
  updated_at: string;
};

function rowToProject(row: SupabaseProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    cvText: row.cv_text ?? "",
    jobAdText: row.job_ad_text ?? "",
    analysis: row.analysis ?? undefined,
    documents: row.documents ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function projectToSupabaseRow(project: Project) {
  return {
    id: project.id,
    title: project.title,
    cv_text: project.cvText,
    job_ad_text: project.jobAdText,
    analysis: project.analysis ?? null,
    documents: project.documents ?? null,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseServiceRoleKey!,
      Authorization: `Bearer ${supabaseServiceRoleKey!}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${details}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listProjects(): Promise<Project[]> {
  if (!hasSupabase) {
    return Array.from(memoryStore.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  const rows = (await supabaseRequest(
    "projects?select=id,title,cv_text,job_ad_text,analysis,documents,created_at,updated_at&order=updated_at.desc"
  )) as SupabaseProjectRow[];
  return rows.map(rowToProject);
}

export async function getProject(id: string): Promise<Project | undefined> {
  if (!hasSupabase) {
    return memoryStore.get(id);
  }

  const rows = (await supabaseRequest(
    `projects?select=id,title,cv_text,job_ad_text,analysis,documents,created_at,updated_at&id=eq.${encodeURIComponent(id)}&limit=1`
  )) as SupabaseProjectRow[];
  const row = rows[0];
  return row ? rowToProject(row) : undefined;
}

export async function saveProject(project: Project): Promise<Project> {
  if (!hasSupabase) {
    memoryStore.set(project.id, project);
    return project;
  }

  await supabaseRequest("projects?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(projectToSupabaseRow(project)),
  });
  return project;
}
