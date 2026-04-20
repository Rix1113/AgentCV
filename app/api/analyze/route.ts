import { NextRequest, NextResponse } from "next/server";
import { analyzeInputs } from "@/lib/ai/service";
import { requireApiUser } from "@/lib/auth";
import { getValidationErrorStatus } from "@/lib/input-limits";
import { assertPlanAllowance } from "@/lib/plans";
import { getProject, saveProject } from "@/lib/store";
import { normalizeText } from "@/lib/parsers/text";
import { recordUsageEvent } from "@/lib/usage";
import { analyzeRequestSchema, formatValidationErrors } from "@/lib/validators/input";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = analyzeRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatValidationErrors(parsedBody.error),
        },
        { status: getValidationErrorStatus(parsedBody.error) }
      );
    }

    const payload = parsedBody.data;
    const isDemo = payload.demo === true;

    let user = null;
    if (!isDemo) {
      const { error, user: authUser } = await requireApiUser();
      if (error) {
        return error;
      }
      user = authUser;

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
    }

    const analysis = await analyzeInputs(normalizeText(payload.cvText), normalizeText(payload.jobAdText));

    if (!isDemo) {
      const project = await getProject(payload.projectId!, user!.id);
      if (project) {
        await saveProject({ ...project, analysis, updatedAt: new Date().toISOString() });
      }
      await recordUsageEvent({
        userId: user!.id,
        userEmail: user!.email,
        eventType: "analysis_generated",
        route: request.nextUrl.pathname,
        projectId: project?.id ?? payload.projectId,
        metadata: {
          method: request.method,
          pathname: request.nextUrl.pathname,
        },
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("/api/analyze failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
