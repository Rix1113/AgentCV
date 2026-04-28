import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error: "Combined DOCX export has been removed. Download each document section separately from the project workspace.",
    },
    { status: 410 }
  );
}
