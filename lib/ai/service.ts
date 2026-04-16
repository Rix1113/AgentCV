import { getOpenAIClient } from "@/lib/ai/client";
import {
  ANALYSIS_INSTRUCTIONS,
  GENERATION_INSTRUCTIONS,
  SECTION_REGENERATION_INSTRUCTIONS,
  SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import { analysisSchema, documentsSchema } from "@/lib/ai/schemas";
import { DOCUMENT_SECTION_KEYS } from "@/types";
import type { AnalysisResult, DocumentSectionKey, GeneratedDocuments } from "@/types";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

export async function analyzeInputs(cvText: string, jobAdText: string, model?: string): Promise<AnalysisResult> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: model ?? MODEL,
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

export async function generateDocuments(cvText: string, jobAdText: string, analysis: AnalysisResult, model?: string): Promise<GeneratedDocuments> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: model ?? MODEL,
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

export async function regenerateDocumentSection(
  cvText: string,
  jobAdText: string,
  analysis: AnalysisResult,
  section: DocumentSectionKey,
  currentContent: string
): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${SECTION_REGENERATION_INSTRUCTIONS}

SECTION TO REGENERATE: ${section}

ANALYSIS:
${JSON.stringify(analysis, null, 2)}

CURRENT SECTION CONTENT:
${currentContent}

CV:
${cvText}

JOB AD:
${jobAdText}`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "regenerated_section",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: DOCUMENT_SECTION_KEYS.reduce((acc, key) => {
            if (key === section) {
              acc[key] = { type: "string" };
            }
            return acc;
          }, {} as Record<string, { type: "string" }>),
          required: [section],
        },
      },
    },
  });

  const raw = JSON.parse(response.output_text) as Partial<GeneratedDocuments>;
  const content = raw[section];

  if (typeof content !== "string") {
    throw new Error(`Regenerated section ${section} is missing`);
  }

  return content;
}
