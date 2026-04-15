import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { toGeneratedDocuments } from "@/lib/documents";
import { buildPdf } from "@/lib/exports/pdf";
import { recordUsageEvent } from "@/lib/usage";

export async function POST(request: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) {
    return error;
  }

  const body = await request.json();
  const buffer = buildPdf(toGeneratedDocuments(body.documents));

  await recordUsageEvent({
    userId: user.id,
    userEmail: user.email,
    eventType: "exported_pdf",
    route: request.nextUrl.pathname,
    projectId: body.projectId,
    metadata: {
      method: request.method,
      pathname: request.nextUrl.pathname,
      exportFormat: "pdf",
    },
  });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="estonian-job-agent.pdf"',
    },
  });
}
