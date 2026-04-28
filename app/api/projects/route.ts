import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiUser } from "@/lib/auth";
import {
  buildDocumentExportFilename,
  createEmptyStoredDocuments,
  DOCUMENT_SECTION_EXPORT_TITLES,
  normalizeStoredDocuments,
  updateDocumentSection,
} from "@/lib/documents";
import { buildDocx } from "@/lib/exports/docx";
import { buildPdf } from "@/lib/exports/pdf";
import { getValidationErrorStatus } from "@/lib/input-limits";
import { assertPlanAllowance } from "@/lib/plans";
import {
  projectDocumentExportQuerySchema,
  projectInputSchema,
  updateProjectDocumentsSchema,
} from "@/lib/validators/input";
import { makeId } from "@/lib/utils";
import { DOCUMENT_SECTION_KEYS } from "@/types";
import { getProject, listProjects, saveProject } from "@/lib/store";
import { recordUsageEvent } from "@/lib/usage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) {
    return error;
  }

  const searchParams = request.nextUrl.searchParams;
  const hasExportQuery = searchParams.has("projectId") || searchParams.has("section") || searchParams.has("format");

  if (hasExportQuery) {
    try {
      const parsed = projectDocumentExportQuerySchema.parse({
        projectId: searchParams.get("projectId"),
        section: searchParams.get("section"),
        format: searchParams.get("format"),
      });

      const project = await getProject(parsed.projectId, user.id);
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      const allowance = await assertPlanAllowance({
        userId: user.id,
        userEmail: user.email,
        action: "export",
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

      const documents = normalizeStoredDocuments(project.documents ?? createEmptyStoredDocuments(), project.updatedAt);
      const sectionText = documents[parsed.section];

      if (!sectionText.trim()) {
        return NextResponse.json({ error: "This document section is empty and cannot be downloaded yet." }, { status: 400 });
      }

      const title = DOCUMENT_SECTION_EXPORT_TITLES[parsed.section];
      const fileBuffer =
        parsed.format === "docx"
          ? await buildDocx(title, sectionText)
          : buildPdf(title, sectionText);
      const bytes = new Uint8Array(fileBuffer);
      const filename = buildDocumentExportFilename(project.title, parsed.section, parsed.format);

      await recordUsageEvent({
        userId: user.id,
        userEmail: user.email,
        eventType: parsed.format === "docx" ? "exported_docx" : "exported_pdf",
        route: request.nextUrl.pathname,
        projectId: project.id,
        metadata: {
          method: request.method,
          pathname: request.nextUrl.pathname,
          exportFormat: parsed.format,
          section: parsed.section,
        },
      });

      return new Response(bytes, {
        headers: {
          "Content-Type":
            parsed.format === "docx"
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      const message =
        error instanceof ZodError
          ? error.issues.map((issue) => issue.message).join(", ")
          : error instanceof Error
            ? error.message
            : "Unable to download document";

      return NextResponse.json(
        { error: message },
        { status: error instanceof ZodError ? getValidationErrorStatus(error) : 400 }
      );
    }
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
