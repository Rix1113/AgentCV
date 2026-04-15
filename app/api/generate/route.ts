import { NextRequest, NextResponse } from "next/server";
import { generateDocuments } from "@/lib/ai/service";
import { requireApiUser } from "@/lib/auth";
import { normalizeStoredDocuments } from "@/lib/documents";
import { getProject, saveProject } from "@/lib/store";
import { normalizeText } from "@/lib/parsers/text";

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireApiUser();
    if (error) {
      return error;
    }

    const body = await request.json();
    const documents = normalizeStoredDocuments(
      await generateDocuments(normalizeText(body.cvText), normalizeText(body.jobAdText), body.analysis)
    );
    const project = await getProject(body.projectId, user.id);
    if (project) {
      await saveProject({ ...project, documents, updatedAt: new Date().toISOString() });
    }
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation failed" }, { status: 500 });
  }
}
