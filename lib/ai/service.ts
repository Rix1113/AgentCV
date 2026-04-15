import { getOpenAIClient } from "@/lib/ai/client";
import { ANALYSIS_INSTRUCTIONS, GENERATION_INSTRUCTIONS, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { analysisSchema, documentsSchema } from "@/lib/ai/schemas";
import type { AnalysisResult, GeneratedDocuments } from "@/types";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5";

export async function analyzeInputs(cvText: string, jobAdText: string): Promise<AnalysisResult> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${ANALYSIS_INSTRUCTIONS}\n\nCV:\n${cvText}\n\nJOB AD:\n${jobAdText}` },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "analysis",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            target_role: { type: "string" },
            employer_name: { type: "string" },
            candidate_summary: { type: "string" },
            matched_skills: { type: "array", items: { type: "string" } },
            transferable_skills: { type: "array", items: { type: "string" } },
            keyword_targets: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            weak_points: { type: "array", items: { type: "string" } },
            missing_information: { type: "array", items: { type: "string" } },
            relevant_experience_areas: { type: "array", items: { type: "string" } },
            tone_guidance: { type: "string" },
            fit_score_band: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["target_role", "employer_name", "candidate_summary", "matched_skills", "transferable_skills", "keyword_targets", "strengths", "weak_points", "missing_information", "relevant_experience_areas", "tone_guidance", "fit_score_band"]
        }
      }
    }
  });

  const raw = response.output_text;
  return analysisSchema.parse(JSON.parse(raw));
}

export async function generateDocuments(cvText: string, jobAdText: string, analysis: AnalysisResult): Promise<GeneratedDocuments> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${GENERATION_INSTRUCTIONS}\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n\nCV:\n${cvText}\n\nJOB AD:\n${jobAdText}`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "documents",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            analysis_summary_et: { type: "string" },
            cv_et: { type: "string" },
            motivation_letter_et: { type: "string" },
            statement_short_et: { type: "string" },
            statement_long_et: { type: "string" }
          },
          required: ["analysis_summary_et", "cv_et", "motivation_letter_et", "statement_short_et", "statement_long_et"]
        }
      }
    }
  });

  const raw = response.output_text;
  return documentsSchema.parse(JSON.parse(raw));
}
