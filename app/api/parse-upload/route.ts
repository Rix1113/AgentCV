import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { parseUploadedDocument } from "@/lib/parsers/upload";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireApiUser();
    if (error) {
      return error;
    }

    const formData = await request.formData();
    const uploaded = formData.get("file");

    if (!(uploaded instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (uploaded.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
    }

    if (uploaded.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "File is too large. Maximum size is 10 MB" }, { status: 400 });
    }

    const text = await parseUploadedDocument(uploaded);
    return NextResponse.json({ text, fileName: uploaded.name });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse uploaded file" },
      { status: 500 }
    );
  }
}
