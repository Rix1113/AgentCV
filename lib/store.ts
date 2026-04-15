import type { Project, UsageEvent, UsageEventType, UserPlanProfile } from "@/types";
import {
  hasSupabasePersistence,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase/config";

const memoryStore = new Map<string, Project>();
const memoryUsageEvents: UsageEvent[] = [];
const memoryUserPlanProfiles = new Map<string, UserPlanProfile>();
let isUserProfilesTableMissing = false;

type SupabaseProjectRow = {
  id: string;
  user_id: string;
  title: string;
  cv_text: string | null;
  job_ad_text: string | null;
  analysis: Project["analysis"] | null;
  documents: Project["documents"] | null;
  created_at: string;
  updated_at: string;
};

type SupabaseUsageEventRow = {
  id: string;
  user_id: string | null;
  event_type: UsageEventType;
  route: string | null;
  project_id: string | null;
  metadata: UsageEvent["metadata"] | null;
  created_at: string;
};

type SupabaseUserPlanProfileRow = {
  user_id: string;
  email: string | null;
  plan: UserPlanProfile["plan"];
  created_at: string;
  updated_at: string;
};

function rowToProject(row: SupabaseProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
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
    user_id: project.userId,
    title: project.title,
    cv_text: project.cvText,
    job_ad_text: project.jobAdText,
    analysis: project.analysis ?? null,
    documents: project.documents ?? null,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

function rowToUsageEvent(row: SupabaseUsageEventRow): UsageEvent {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    eventType: row.event_type,
    route: row.route ?? undefined,
    projectId: row.project_id ?? undefined,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at,
  };
}

function usageEventToSupabaseRow(event: UsageEvent) {
  return {
    id: event.id,
    user_id: event.userId ?? null,
    event_type: event.eventType,
    route: event.route ?? null,
    project_id: event.projectId ?? null,
    metadata: event.metadata ?? null,
    created_at: event.createdAt,
  };
}

function rowToUserPlanProfile(row: SupabaseUserPlanProfileRow): UserPlanProfile {
  return {
    userId: row.user_id,
    email: row.email,
    plan: row.plan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function userPlanProfileToSupabaseRow(profile: UserPlanProfile) {
  return {
    user_id: profile.userId,
    email: profile.email,
    plan: profile.plan,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
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
    throw new Error(formatSupabaseError(response.status, details, init?.method));
  }

  if (response.status === 204) {
    return null;
  }

  const contentLength = response.headers.get("content-length");
  const contentType = response.headers.get("content-type") ?? "";

  if (contentLength === "0" || !contentType.includes("application/json")) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

function formatSupabaseError(status: number, details: string, method?: string) {
  const baseMessage = `Supabase request failed (${status}): ${details}`;
  const normalizedMethod = (method ?? "GET").toUpperCase();
  const isWrite = normalizedMethod !== "GET" && normalizedMethod !== "HEAD";
  const serviceKeyMatchesAnon = Boolean(
    supabaseServiceRoleKey &&
      supabaseAnonKey &&
      supabaseServiceRoleKey.trim() === supabaseAnonKey.trim()
  );

  try {
    const payload = JSON.parse(details) as { code?: string; message?: string };
    const rowLevelSecurityFailure =
      status === 401 &&
      payload.code === "42501" &&
      payload.message?.includes("row-level security policy");

    if (isWrite && rowLevelSecurityFailure) {
      return [
        "Supabase write failed because the app is not using a real service-role key.",
        "Check SUPABASE_SERVICE_ROLE_KEY in .env.local and make sure it is the secret service_role key, not the public anon key.",
        serviceKeyMatchesAnon ? "Right now SUPABASE_SERVICE_ROLE_KEY appears to match NEXT_PUBLIC_SUPABASE_ANON_KEY." : null,
        `Original Supabase error (${status}/${payload.code}): ${payload.message}`,
      ]
        .filter(Boolean)
        .join(" ");
    }
  } catch {
    return baseMessage;
  }

  return baseMessage;
}

function isMissingSupabaseTableError(error: unknown, tableName: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("PGRST205") && error.message.includes(`'public.${tableName}'`);
}

export async function listProjects(userId: string): Promise<Project[]> {
  if (!hasSupabasePersistence) {
    return Array.from(memoryStore.values())
      .filter((project) => project.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  const rows = (await supabaseRequest(
    `projects?select=id,user_id,title,cv_text,job_ad_text,analysis,documents,created_at,updated_at&user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc`
  )) as SupabaseProjectRow[];
  return rows.map(rowToProject);
}

export async function getProject(id: string, userId: string): Promise<Project | undefined> {
  if (!hasSupabasePersistence) {
    const project = memoryStore.get(id);
    return project?.userId === userId ? project : undefined;
  }

  const rows = (await supabaseRequest(
    `projects?select=id,user_id,title,cv_text,job_ad_text,analysis,documents,created_at,updated_at&id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`
  )) as SupabaseProjectRow[];
  const row = rows[0];
  return row ? rowToProject(row) : undefined;
}

export async function saveProject(project: Project): Promise<Project> {
  if (!hasSupabasePersistence) {
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

export async function createUsageEvent(event: UsageEvent): Promise<UsageEvent> {
  if (!hasSupabasePersistence) {
    memoryUsageEvents.unshift(event);
    return event;
  }

  await supabaseRequest("usage_events", {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify(usageEventToSupabaseRow(event)),
  });

  return event;
}

export async function listUsageEvents(limit = 250): Promise<UsageEvent[]> {
  if (!hasSupabasePersistence) {
    return [...memoryUsageEvents]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  const rows = (await supabaseRequest(
    `usage_events?select=id,user_id,event_type,route,project_id,metadata,created_at&order=created_at.desc&limit=${Math.max(1, limit)}`
  )) as SupabaseUsageEventRow[];

  return rows.map(rowToUsageEvent);
}

export async function listUsageEventsForUser(
  userId: string,
  limit = 250,
  sinceIso?: string
): Promise<UsageEvent[]> {
  if (!hasSupabasePersistence) {
    return [...memoryUsageEvents]
      .filter((event) => event.userId === userId && (!sinceIso || event.createdAt >= sinceIso))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  const filters = [
    "select=id,user_id,event_type,route,project_id,metadata,created_at",
    `user_id=eq.${encodeURIComponent(userId)}`,
    sinceIso ? `created_at=gte.${encodeURIComponent(sinceIso)}` : null,
    "order=created_at.desc",
    `limit=${Math.max(1, limit)}`,
  ]
    .filter(Boolean)
    .join("&");

  const rows = (await supabaseRequest(`usage_events?${filters}`)) as SupabaseUsageEventRow[];

  return rows.map(rowToUsageEvent);
}

export async function getUserPlanProfile(userId: string): Promise<UserPlanProfile | undefined> {
  if (!hasSupabasePersistence) {
    return memoryUserPlanProfiles.get(userId);
  }

  if (isUserProfilesTableMissing) {
    return memoryUserPlanProfiles.get(userId);
  }

  try {
    const rows = (await supabaseRequest(
      `user_profiles?select=user_id,email,plan,created_at,updated_at&user_id=eq.${encodeURIComponent(userId)}&limit=1`
    )) as SupabaseUserPlanProfileRow[];

    const row = rows[0];
    return row ? rowToUserPlanProfile(row) : undefined;
  } catch (error) {
    if (isMissingSupabaseTableError(error, "user_profiles")) {
      isUserProfilesTableMissing = true;
      return memoryUserPlanProfiles.get(userId);
    }

    throw error;
  }
}

export async function saveUserPlanProfile(profile: UserPlanProfile): Promise<UserPlanProfile> {
  if (!hasSupabasePersistence) {
    memoryUserPlanProfiles.set(profile.userId, profile);
    return profile;
  }

  if (isUserProfilesTableMissing) {
    memoryUserPlanProfiles.set(profile.userId, profile);
    return profile;
  }

  try {
    const rows = (await supabaseRequest("user_profiles?on_conflict=user_id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(userPlanProfileToSupabaseRow(profile)),
    })) as SupabaseUserPlanProfileRow[];

    return rowToUserPlanProfile(rows[0]);
  } catch (error) {
    if (isMissingSupabaseTableError(error, "user_profiles")) {
      isUserProfilesTableMissing = true;
      memoryUserPlanProfiles.set(profile.userId, profile);
      return profile;
    }

    throw error;
  }
}
