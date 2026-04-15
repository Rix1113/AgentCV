import { z } from "zod";

export const analysisSchema = z.object({
  target_role: z.string(),
  employer_name: z.string(),
  candidate_summary: z.string(),
  matched_skills: z.array(z.string()),
  transferable_skills: z.array(z.string()),
  keyword_targets: z.array(z.string()),
  strengths: z.array(z.string()),
  weak_points: z.array(z.string()),
  missing_information: z.array(z.string()),
  relevant_experience_areas: z.array(z.string()),
  tone_guidance: z.string(),
  fit_score_band: z.enum(["low", "medium", "high"]),
});

export const documentsSchema = z.object({
  analysis_summary_et: z.string(),
  cv_et: z.string(),
  motivation_letter_et: z.string(),
  statement_short_et: z.string(),
  statement_long_et: z.string(),
});
