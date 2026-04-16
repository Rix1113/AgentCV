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
import type { Response as OpenAIResponse, ResponseOutputItem, ResponseOutputMessage } from "openai/resources/responses/responses";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

function isOutputMessage(item: ResponseOutputItem): item is ResponseOutputMessage {
  return item.type === "message";
}

function getResponseOutputText(response: OpenAIResponse) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  if (Array.isArray(response.output) && response.output.length > 0) {
    const item = response.output[0];
    if (typeof item === "string") {
      return item;
    }
    if (isOutputMessage(item) && Array.isArray(item.content)) {
      return item.content
        .map((content) => (content.type === "output_text" ? content.text : ""))
        .join("");
    }
  }

  return JSON.stringify(response);
}

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

  const rawOutput = getResponseOutputText(response);

  try {
    return analysisSchema.parse(JSON.parse(rawOutput));
  } catch (error) {
    console.error("Failed to parse analysis response", { rawOutput, response });
    throw new Error(`Analysis response parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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

  const rawOutput = getResponseOutputText(response);

  try {
    return documentsSchema.parse(JSON.parse(rawOutput));
  } catch (error) {
    console.error("Failed to parse documents response", { rawOutput, response });
    throw new Error(`Documents response parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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

  const rawOutput = getResponseOutputText(response);
  const raw = JSON.parse(rawOutput) as Partial<GeneratedDocuments>;
  const content = raw[section];

  if (typeof content !== "string") {
    console.error("Regenerated section response invalid", { rawOutput, response });
    throw new Error(`Regenerated section ${section} is missing`);
  }

  return content;
}
