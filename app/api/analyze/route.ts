import { NextRequest, NextResponse } from "next/server";
import { analyzeInputs } from "@/lib/ai/service";
import { requireApiUser } from "@/lib/auth";
import { getProject, saveProject } from "@/lib/store";
import { normalizeText } from "@/lib/parsers/text";

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireApiUser();
    if (error) {
      return error;
    }

    const body = await request.json();
    const analysis = await analyzeInputs(normalizeText(body.cvText), normalizeText(body.jobAdText));
    const project = await getProject(body.projectId, user.id);
    if (project) {
      await saveProject({ ...project, analysis, updatedAt: new Date().toISOString() });
    }
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
