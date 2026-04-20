import { analysisSchema } from "@/lib/ai/schemas";
import {
  CV_TEXT_MAX_LENGTH,
  CV_TEXT_MIN_LENGTH,
  getTextInputLengthMessage,
  JOB_AD_TEXT_MAX_LENGTH,
  JOB_AD_TEXT_MIN_LENGTH,
  PROJECT_TITLE_MAX_LENGTH,
} from "@/lib/input-limits";
import { z } from "zod";

const cvTextSchema = z
  .string()
  .min(CV_TEXT_MIN_LENGTH, getTextInputLengthMessage("cvText"))
  .max(CV_TEXT_MAX_LENGTH, getTextInputLengthMessage("cvText"));

const jobAdTextSchema = z
  .string()
  .min(JOB_AD_TEXT_MIN_LENGTH, getTextInputLengthMessage("jobAdText"))
  .max(JOB_AD_TEXT_MAX_LENGTH, getTextInputLengthMessage("jobAdText"));

export const projectInputSchema = z.object({
  title: z.string().min(2).max(PROJECT_TITLE_MAX_LENGTH),
  cvText: cvTextSchema,
  jobAdText: jobAdTextSchema,
});

const requestProjectIdSchema = z.string().min(1, "Project id is required");

export const analyzeRequestSchema = z
  .object({
    projectId: requestProjectIdSchema.optional(),
    cvText: cvTextSchema,
    jobAdText: jobAdTextSchema,
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
    cvText: cvTextSchema,
    jobAdText: jobAdTextSchema,
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
  cvText: cvTextSchema,
  jobAdText: jobAdTextSchema,
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
