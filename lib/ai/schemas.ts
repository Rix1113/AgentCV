import { z } from "zod";

export const analysisResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "candidate_profile_summary",
    "target_role_summary",
    "direct_matches",
    "transferable_matches",
    "job_ad_keywords",
    "relevant_experience_areas",
    "evidence_based_strengths",
    "missing_or_unclear_requirements",
    "clarification_points",
    "cv_focus_points",
    "motivation_letter_focus_points",
    "risk_notes",
  ],
  properties: {
    candidate_profile_summary: { type: "string" },
    target_role_summary: { type: "string" },
    direct_matches: { type: "array", items: { type: "string" } },
    transferable_matches: { type: "array", items: { type: "string" } },
    job_ad_keywords: { type: "array", items: { type: "string" } },
    relevant_experience_areas: { type: "array", items: { type: "string" } },
    evidence_based_strengths: { type: "array", items: { type: "string" } },
    missing_or_unclear_requirements: { type: "array", items: { type: "string" } },
    clarification_points: { type: "array", items: { type: "string" } },
    cv_focus_points: { type: "array", items: { type: "string" } },
    motivation_letter_focus_points: { type: "array", items: { type: "string" } },
    risk_notes: { type: "array", items: { type: "string" } },
  },
} as const;

export const generationResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "analysis_summary_et",
    "cv_et",
    "motivation_letter_et",
    "statement_short_et",
    "statement_long_et",
  ],
  properties: {
    analysis_summary_et: { type: "string" },
    cv_et: { type: "string" },
    motivation_letter_et: { type: "string" },
    statement_short_et: { type: "string" },
    statement_long_et: { type: "string" },
  },
} as const;

export const analysisSchema = z.object({
  candidate_profile_summary: z.string(),
  target_role_summary: z.string(),
  direct_matches: z.array(z.string()),
  transferable_matches: z.array(z.string()),
  job_ad_keywords: z.array(z.string()),
  relevant_experience_areas: z.array(z.string()),
  evidence_based_strengths: z.array(z.string()),
  missing_or_unclear_requirements: z.array(z.string()),
  clarification_points: z.array(z.string()),
  cv_focus_points: z.array(z.string()),
  motivation_letter_focus_points: z.array(z.string()),
  risk_notes: z.array(z.string()),
});

export const documentsSchema = z.object({
  analysis_summary_et: z.string(),
  cv_et: z.string(),
  motivation_letter_et: z.string(),
  statement_short_et: z.string(),
  statement_long_et: z.string(),
});

export function createSectionRegenerationResponseJsonSchema(section: string) {
  return {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    maxProperties: 1,
    properties: {
      [section]: { type: "string" },
    },
    required: [section],
  } as const;
}
