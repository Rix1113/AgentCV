import { NextRequest, NextResponse } from "next/server";
import { regenerateSectionSchema } from "@/lib/validators/input";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = regenerateSectionSchema.parse(body);
  return NextResponse.json({
    message: `Regenerate single section flow placeholder for ${parsed.section}`,
  });
}
