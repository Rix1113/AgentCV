import { NextRequest, NextResponse } from "next/server";
import { generateDocuments } from "@/lib/ai/service";
import { getProject, saveProject } from "@/lib/store";
import { normalizeText } from "@/lib/parsers/text";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documents = await generateDocuments(normalizeText(body.cvText), normalizeText(body.jobAdText), body.analysis);
    const project = await getProject(body.projectId);
    if (project) {
      await saveProject({ ...project, documents, updatedAt: new Date().toISOString() });
    }
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation failed" }, { status: 500 });
  }
}
