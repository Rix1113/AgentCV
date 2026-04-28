import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { getValidationErrorStatus } from "@/lib/input-limits";
import { fetchJobAdFromUrl } from "@/lib/parsers/job-ad-url";

export const runtime = "nodejs";

const fetchJobAdSchema = z.object({
  url: z.string().min(1, "Vacancy URL is required."),
});

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireApiUser();
    if (error) {
      return error;
    }

    const body = await request.json();
    const parsed = fetchJobAdSchema.parse(body);
    const result = await fetchJobAdFromUrl(parsed.url);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => issue.message).join(", ")
        : error instanceof Error
          ? error.message
          : "Unable to fetch vacancy text";

    return NextResponse.json(
      { error: message },
      {
        status:
          error instanceof ZodError
            ? getValidationErrorStatus(error)
            : error instanceof Error && "status" in error && typeof error.status === "number"
              ? error.status
              : 400,
      }
    );
  }
}
