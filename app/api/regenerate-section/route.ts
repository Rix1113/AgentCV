import { NextRequest, NextResponse } from "next/server";
import { regenerateDocumentSection } from "@/lib/ai/service";
import { requireApiUser } from "@/lib/auth";
import { normalizeStoredDocuments, updateDocumentSection } from "@/lib/documents";
import { assertTextInputWithinLimit, getValidationErrorStatus } from "@/lib/input-limits";
import { assertPlanAllowance } from "@/lib/plans";
import { getProject, saveProject } from "@/lib/store";
import { regenerateSectionSchema } from "@/lib/validators/input";
import { normalizeText } from "@/lib/parsers/text";
import { recordUsageEvent } from "@/lib/usage";
import { ZodError } from "zod";

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
    const parsed = regenerateSectionSchema.parse(body);
    const project = await getProject(parsed.projectId, user.id);

    if (!project?.analysis || !project.documents) {
      return NextResponse.json({ error: "Project documents are not ready yet" }, { status: 400 });
    }

    const cvText = normalizeText(project.cvText || parsed.cvText);
    const jobAdText = normalizeText(project.jobAdText || parsed.jobAdText);

    assertTextInputWithinLimit("cvText", cvText);
    assertTextInputWithinLimit("jobAdText", jobAdText);

    const currentDocuments = normalizeStoredDocuments(project.documents, project.updatedAt);
    const content = await regenerateDocumentSection(
      cvText,
      jobAdText,
      project.analysis,
      parsed.section,
      currentDocuments
    );

    const now = new Date().toISOString();
    const updatedDocuments = updateDocumentSection(currentDocuments, parsed.section, content, "regenerated", now);
    const updatedProject = {
      ...project,
      documents: updatedDocuments,
      updatedAt: now,
    };

    await saveProject(updatedProject);
    await recordUsageEvent({
      userId: user.id,
      userEmail: user.email,
      eventType: "section_regenerated",
      route: request.nextUrl.pathname,
      projectId: updatedProject.id,
      metadata: {
        method: request.method,
        pathname: request.nextUrl.pathname,
        section: parsed.section,
      },
    });

    return NextResponse.json({
      project: updatedProject,
      section: parsed.section,
      content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Section regeneration failed" },
      { status: error instanceof ZodError ? getValidationErrorStatus(error) : error instanceof Error && "status" in error && typeof error.status === "number" ? error.status : 500 }
    );
  }
}
