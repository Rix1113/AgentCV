import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { assertTextInputWithinLimit, TextInputField } from "@/lib/input-limits";
import { parseUploadedDocument } from "@/lib/parsers/upload";
import { z } from "zod";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const uploadFieldSchema = z.enum(["cvText", "jobAdText"]);

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireApiUser();
    if (error) {
      return error;
    }

    const formData = await request.formData();
    const uploaded = formData.get("file");
    const rawField = formData.get("field");

    if (!(uploaded instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const parsedField = uploadFieldSchema.safeParse(rawField);
    if (!parsedField.success) {
      return NextResponse.json({ error: "Upload field is required" }, { status: 400 });
    }

    if (uploaded.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
    }

    if (uploaded.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "File is too large. Maximum size is 10 MB" }, { status: 400 });
    }

    const text = await parseUploadedDocument(uploaded);
    assertTextInputWithinLimit(parsedField.data as TextInputField, text);
    return NextResponse.json({ text, fileName: uploaded.name });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse uploaded file" },
      { status: error instanceof Error && "status" in error && typeof error.status === "number" ? error.status : 500 }
    );
  }
}
