import { z } from "zod";

export const projectInputSchema = z.object({
  title: z.string().min(2).max(120),
  cvText: z.string().min(80, "CV is too short"),
  jobAdText: z.string().min(80, "Job ad is too short"),
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
