import { NextRequest } from "next/server";
import { buildPdf } from "@/lib/exports/pdf";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const buffer = buildPdf(body.documents);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="estonian-job-agent.pdf"',
    },
  });
}
