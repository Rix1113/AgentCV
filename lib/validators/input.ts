import { analysisSchema } from "@/lib/ai/schemas";
import { z } from "zod";

export const projectInputSchema = z.object({
  title: z.string().min(2).max(120),
  cvText: z.string().min(80, "CV is too short"),
  jobAdText: z.string().min(80, "Job ad is too short"),
});

const requestProjectIdSchema = z.string().min(1, "Project id is required");

export const analyzeRequestSchema = z
  .object({
    projectId: requestProjectIdSchema.optional(),
    cvText: z.string().min(80, "CV is too short"),
    jobAdText: z.string().min(80, "Job ad is too short"),
    demo: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.demo !== true && !value.projectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project id is required",
        path: ["projectId"],
      });
    }
  });

export const generateRequestSchema = z
  .object({
    projectId: requestProjectIdSchema.optional(),
    cvText: z.string().min(80, "CV is too short"),
    jobAdText: z.string().min(80, "Job ad is too short"),
    analysis: analysisSchema,
    demo: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.demo !== true && !value.projectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project id is required",
        path: ["projectId"],
      });
    }
  });

export const regenerateSectionSchema = z.object({
  projectId: z.string().min(1),
  section: z.enum([
    "analysis_summary_et",
    "cv_et",
    "motivation_letter_et",
    "statement_short_et",
    "statement_long_et",
  ]),
  cvText: z.string().min(80),
  jobAdText: z.string().min(80),
});

export const updateProjectDocumentsSchema = z.object({
  projectId: z.string().min(1),
  documents: z.object({
    analysis_summary_et: z.string(),
    cv_et: z.string(),
    motivation_letter_et: z.string(),
    statement_short_et: z.string(),
    statement_long_et: z.string(),
  }),
  changeSources: z
    .object({
      analysis_summary_et: z.enum(["manual_edit", "restored"]).optional(),
      cv_et: z.enum(["manual_edit", "restored"]).optional(),
      motivation_letter_et: z.enum(["manual_edit", "restored"]).optional(),
      statement_short_et: z.enum(["manual_edit", "restored"]).optional(),
      statement_long_et: z.enum(["manual_edit", "restored"]).optional(),
    })
    .partial()
    .optional(),
});

export function formatValidationErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
