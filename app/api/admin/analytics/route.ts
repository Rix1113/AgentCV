import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/auth";
import { buildAdminAnalytics, recordUsageEvent } from "@/lib/usage";

export async function GET(request: NextRequest) {
  const { error, user } = await requireAdminApiUser();
  if (error) {
    return error;
  }

  const analytics = await buildAdminAnalytics();

  await recordUsageEvent({
    userId: user.id,
    userEmail: user.email,
    eventType: "admin_analytics_viewed",
    route: request.nextUrl.pathname,
    metadata: {
      method: request.method,
      pathname: request.nextUrl.pathname,
    },
  });

  return NextResponse.json(analytics);
}
