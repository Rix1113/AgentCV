import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { projectInputSchema } from "@/lib/validators/input";
import { makeId } from "@/lib/utils";
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
  const { error, user } = await requireApiUser();
  if (error) {
    return error;
  }

  const body = await request.json();
  const existing = await getProject(body.projectId, user.id);
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
