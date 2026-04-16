import { NextRequest, NextResponse } from "next/server";
import { generateDocuments } from "@/lib/ai/service";
import { requireApiUser } from "@/lib/auth";
import { normalizeStoredDocuments } from "@/lib/documents";
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
    const documents = normalizeStoredDocuments(
      await generateDocuments(normalizeText(body.cvText), normalizeText(body.jobAdText), body.analysis, body.model)
    );
    const project = await getProject(body.projectId, user.id);
    if (project) {
      await saveProject({ ...project, documents, updatedAt: new Date().toISOString() });
    }
    await recordUsageEvent({
      userId: user.id,
      userEmail: user.email,
      eventType: "documents_generated",
      route: request.nextUrl.pathname,
      projectId: project?.id ?? body.projectId,
      metadata: {
        method: request.method,
        pathname: request.nextUrl.pathname,
      },
    });
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation failed" }, { status: 500 });
  }
}
