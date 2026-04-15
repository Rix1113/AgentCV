import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { regenerateSectionSchema } from "@/lib/validators/input";

export async function POST(request: NextRequest) {
  const { error } = await requireApiUser();
  if (error) {
    return error;
  }

  const body = await request.json();
  const parsed = regenerateSectionSchema.parse(body);
  return NextResponse.json({
    message: `Regenerate single section flow placeholder for ${parsed.section}`,
  });
}
