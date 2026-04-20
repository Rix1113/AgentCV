import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiUser } from "@/lib/auth";
import { createEmptyStoredDocuments, normalizeStoredDocuments, updateDocumentSection } from "@/lib/documents";
import { getValidationErrorStatus } from "@/lib/input-limits";
import { projectInputSchema, updateProjectDocumentsSchema } from "@/lib/validators/input";
import { makeId } from "@/lib/utils";
import { DOCUMENT_SECTION_KEYS } from "@/types";
import { getProject, listProjects, saveProject } from "@/lib/store";
import { recordUsageEvent } from "@/lib/usage";

export async function GET() {
  const { error, user } = await requireApiUser();
  if (error) {
    return error;
  }

  return NextResponse.json({ projects: await listProjects(user.id) });
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireApiUser();
    if (error) {
      return error;
    }

    const body = await request.json();
    const parsed = projectInputSchema.parse(body);
    const now = new Date().toISOString();
    const project = {
      id: makeId("proj"),
      userId: user.id,
      title: parsed.title,
      cvText: parsed.cvText,
      jobAdText: parsed.jobAdText,
      documents: createEmptyStoredDocuments(),
      createdAt: now,
      updatedAt: now,
    };
    await saveProject(project);
    await recordUsageEvent({
      userId: user.id,
      userEmail: user.email,
      eventType: "project_created",
      route: request.nextUrl.pathname,
      projectId: project.id,
      metadata: {
        method: request.method,
        pathname: request.nextUrl.pathname,
        projectTitle: project.title,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => issue.message).join(", ")
        : error instanceof Error
          ? error.message
          : "Unable to create project";

    return NextResponse.json({ error: message }, { status: error instanceof ZodError ? getValidationErrorStatus(error) : 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, user } = await requireApiUser();
    if (error) {
      return error;
    }

    const body = await request.json();
    const parsed = updateProjectDocumentsSchema.parse(body);
    const existing = await getProject(parsed.projectId, user.id);
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const baseDocuments = existing.documents
      ? normalizeStoredDocuments(existing.documents, existing.updatedAt)
      : normalizeStoredDocuments(parsed.documents, now);

    const nextDocuments = DOCUMENT_SECTION_KEYS.reduce((acc, section) => {
      const nextContent = parsed.documents[section];

      if (acc[section] === nextContent) {
        return acc;
      }

      return updateDocumentSection(acc, section, nextContent, parsed.changeSources?.[section] ?? "manual_edit", now);
    }, baseDocuments);

    const updated = {
      ...existing,
      documents: nextDocuments,
      updatedAt: now,
    };
    await saveProject(updated);
    const changedSections = DOCUMENT_SECTION_KEYS.filter(
      (section) => existing.documents?.[section] !== nextDocuments[section]
    );
    await recordUsageEvent({
      userId: user.id,
      userEmail: user.email,
      eventType: "project_documents_updated",
      route: request.nextUrl.pathname,
      projectId: updated.id,
      metadata: {
        method: request.method,
        pathname: request.nextUrl.pathname,
        changedSections,
        sources: parsed.changeSources,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => issue.message).join(", ")
        : error instanceof Error
          ? error.message
          : "Unable to update project";

    return NextResponse.json({ error: message }, { status: error instanceof ZodError ? getValidationErrorStatus(error) : 400 });
  }
}
