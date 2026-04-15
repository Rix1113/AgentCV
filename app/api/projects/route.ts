import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { normalizeStoredDocuments, updateDocumentSection } from "@/lib/documents";
import { projectInputSchema, updateProjectDocumentsSchema } from "@/lib/validators/input";
import { makeId } from "@/lib/utils";
import { DOCUMENT_SECTION_KEYS } from "@/types";
import { getProject, listProjects, saveProject } from "@/lib/store";

export async function GET() {
  const { error, user } = await requireApiUser();
  if (error) {
    return error;
  }

  return NextResponse.json({ projects: await listProjects(user.id) });
}

export async function POST(request: NextRequest) {
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
    createdAt: now,
    updatedAt: now,
  };
  await saveProject(project);
  return NextResponse.json(project, { status: 201 });
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
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update project" }, { status: 400 });
  }
}
