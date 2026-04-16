import { NextRequest, NextResponse } from "next/server";
import { analyzeInputs } from "@/lib/ai/service";
import { requireApiUser } from "@/lib/auth";
import { assertPlanAllowance } from "@/lib/plans";
import { getProject, saveProject } from "@/lib/store";
import { normalizeText } from "@/lib/parsers/text";
import { recordUsageEvent } from "@/lib/usage";

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireApiUser();
    if (error) {
      return error;
    }

    const allowance = await assertPlanAllowance({
      userId: user.id,
      userEmail: user.email,
      action: "generation",
    });
    if (!allowance.ok) {
      return NextResponse.json(
        {
          error: allowance.error,
          code: allowance.code,
          plan: allowance.plan,
          retryAfterSeconds: allowance.retryAfterSeconds,
        },
        {
          status: allowance.status,
          headers: {
            "Retry-After": String(allowance.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const analysis = await analyzeInputs(normalizeText(body.cvText), normalizeText(body.jobAdText), body.model);
    const project = await getProject(body.projectId, user.id);
    if (project) {
      await saveProject({ ...project, analysis, updatedAt: new Date().toISOString() });
    }
    await recordUsageEvent({
      userId: user.id,
      userEmail: user.email,
      eventType: "analysis_generated",
      route: request.nextUrl.pathname,
      projectId: project?.id ?? body.projectId,
      metadata: {
        method: request.method,
        pathname: request.nextUrl.pathname,
        fitScoreBand: analysis.fit_score_band,
      },
    });
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("/api/analyze failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
