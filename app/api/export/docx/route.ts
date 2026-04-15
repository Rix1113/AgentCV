import { NextRequest } from "next/server";
import { toGeneratedDocuments } from "@/lib/documents";
import { buildDocx } from "@/lib/exports/docx";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const buffer = await buildDocx(toGeneratedDocuments(body.documents));
  const bytes = new Uint8Array(buffer);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="estonian-job-agent.docx"',
    },
  });
}
