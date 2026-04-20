import { NextRequest, NextResponse } from "next/server";
import { generateDocuments } from "@/lib/ai/service";
import { requireApiUser } from "@/lib/auth";
import { normalizeStoredDocuments } from "@/lib/documents";
import { getValidationErrorStatus } from "@/lib/input-limits";
import { assertPlanAllowance } from "@/lib/plans";
import { getProject, saveProject } from "@/lib/store";
import { normalizeText } from "@/lib/parsers/text";
import { recordUsageEvent } from "@/lib/usage";
import { formatValidationErrors, generateRequestSchema } from "@/lib/validators/input";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = generateRequestSchema.safeParse(body);

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

    const documents = normalizeStoredDocuments(
      await generateDocuments(normalizeText(payload.cvText), normalizeText(payload.jobAdText), payload.analysis)
    );

    if (!isDemo) {
      const project = await getProject(payload.projectId!, user!.id);
      if (project) {
        await saveProject({ ...project, documents, updatedAt: new Date().toISOString() });
      }
      await recordUsageEvent({
        userId: user!.id,
        userEmail: user!.email,
        eventType: "documents_generated",
        route: request.nextUrl.pathname,
        projectId: project?.id ?? payload.projectId,
        metadata: {
          method: request.method,
          pathname: request.nextUrl.pathname,
        },
      });
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("/api/generate failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation failed" }, { status: 500 });
  }
}
