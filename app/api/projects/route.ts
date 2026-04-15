import { NextRequest, NextResponse } from "next/server";
import { projectInputSchema } from "@/lib/validators/input";
import { makeId } from "@/lib/utils";
import { getProject, listProjects, saveProject } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = projectInputSchema.parse(body);
  const now = new Date().toISOString();
  const project = {
    id: makeId("proj"),
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
  const body = await request.json();
  const existing = await getProject(body.projectId);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const updated = {
    ...existing,
    documents: body.documents ?? existing.documents,
    updatedAt: new Date().toISOString(),
  };
  await saveProject(updated);
  return NextResponse.json(updated);
}
