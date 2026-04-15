import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { toGeneratedDocuments } from "@/lib/documents";
import { buildDocx } from "@/lib/exports/docx";
import { recordUsageEvent } from "@/lib/usage";

export async function POST(request: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) {
    return error;
  }

  const body = await request.json();
  const buffer = await buildDocx(toGeneratedDocuments(body.documents));
  const bytes = new Uint8Array(buffer);

  await recordUsageEvent({
    userId: user.id,
    userEmail: user.email,
    eventType: "exported_docx",
    route: request.nextUrl.pathname,
    projectId: body.projectId,
    metadata: {
      method: request.method,
      pathname: request.nextUrl.pathname,
      exportFormat: "docx",
    },
  });

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="estonian-job-agent.docx"',
    },
  });
}
