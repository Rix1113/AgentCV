import { createUsageEvent, listUsageEvents } from "@/lib/store";
import { makeId } from "@/lib/utils";
import type { UsageEvent, UsageEventType } from "@/types";

type RecordUsageEventInput = {
  userId?: string | null;
  userEmail?: string | null;
  eventType: UsageEventType;
  route?: string;
  projectId?: string | null;
  metadata?: UsageEvent["metadata"];
};

export type AdminAnalytics = {
  generatedAt: string;
  totals: {
    events: number;
    activeUsers: number;
    projectsCreated: number;
    analysesRun: number;
    documentGenerations: number;
    exports: number;
  };
  eventsByType: Array<{ eventType: UsageEventType; count: number }>;
  dailyUsage: Array<{ date: string; events: number; users: number }>;
  topUsers: Array<{ userId: string; userEmail: string | null; events: number }>;
  recentActivity: UsageEvent[];
};

export async function recordUsageEvent(input: RecordUsageEventInput) {
  const event: UsageEvent = {
    id: makeId("evt"),
    userId: input.userId ?? undefined,
    eventType: input.eventType,
    route: input.route,
    projectId: input.projectId ?? undefined,
    metadata: {
      ...(input.metadata ?? {}),
      userEmail: input.userEmail ?? input.metadata?.userEmail ?? null,
    },
    createdAt: new Date().toISOString(),
  };

  try {
    await createUsageEvent(event);
  } catch (error) {
    console.error("Failed to record usage event", error);
  }
}

export async function buildAdminAnalytics(days = 7): Promise<AdminAnalytics> {
  const events = await listUsageEvents(1000);
  const recentActivity = events.slice(0, 12);

  const eventCounts = new Map<UsageEventType, number>();
  const userCounts = new Map<string, { userEmail: string | null; events: number }>();
  const dailyCounts = new Map<string, { events: number; users: Set<string> }>();

  for (const event of events) {
    eventCounts.set(event.eventType, (eventCounts.get(event.eventType) ?? 0) + 1);

    if (event.userId) {
      const existing = userCounts.get(event.userId) ?? {
        userEmail: event.metadata?.userEmail ?? null,
        events: 0,
      };
      existing.events += 1;
      existing.userEmail = existing.userEmail ?? event.metadata?.userEmail ?? null;
      userCounts.set(event.userId, existing);
    }

    const date = event.createdAt.slice(0, 10);
    const existingDay = dailyCounts.get(date) ?? { events: 0, users: new Set<string>() };
    existingDay.events += 1;
    if (event.userId) {
      existingDay.users.add(event.userId);
    }
    dailyCounts.set(date, existingDay);
  }

  const dailyUsage = buildDailyUsage(dailyCounts, days);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      events: events.length,
      activeUsers: new Set(events.map((event) => event.userId).filter(Boolean)).size,
      projectsCreated: eventCounts.get("project_created") ?? 0,
      analysesRun: eventCounts.get("analysis_generated") ?? 0,
      documentGenerations: eventCounts.get("documents_generated") ?? 0,
      exports: (eventCounts.get("exported_pdf") ?? 0) + (eventCounts.get("exported_docx") ?? 0),
    },
    eventsByType: [...eventCounts.entries()]
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count),
    dailyUsage,
    topUsers: [...userCounts.entries()]
      .map(([userId, value]) => ({
        userId,
        userEmail: value.userEmail,
        events: value.events,
      }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 8),
    recentActivity,
  };
}

function buildDailyUsage(
  dailyCounts: Map<string, { events: number; users: Set<string> }>,
  days: number
) {
  const results: Array<{ date: string; events: number; users: number }> = [];
  const today = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const entry = dailyCounts.get(key);

    results.push({
      date: key,
      events: entry?.events ?? 0,
      users: entry?.users.size ?? 0,
    });
  }

  return results;
}
