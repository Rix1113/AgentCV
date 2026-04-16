import { getOpenAIClient } from "@/lib/ai/client";
import {
  ANALYSIS_INSTRUCTIONS,
  buildAnalysisUserPrompt,
  buildGenerationUserPrompt,
  buildPreviousOutputsJson,
  buildSectionRegenerationUserPrompt,
  GENERATION_INSTRUCTIONS,
  RETRY_APPEND,
  SECTION_REGENERATION_INSTRUCTIONS,
  SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  analysisResponseJsonSchema,
  analysisSchema,
  createSectionRegenerationResponseJsonSchema,
  documentsSchema,
  generationResponseJsonSchema,
} from "@/lib/ai/schemas";
import type { AnalysisResult, DocumentSectionKey, GeneratedDocuments } from "@/types";
import type { Response as OpenAIResponse, ResponseOutputItem, ResponseOutputMessage } from "openai/resources/responses/responses";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
const MAX_MODEL_ATTEMPTS = 2;

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

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeForComparison(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function validateGeneratedDocuments(documents: GeneratedDocuments) {
  const errors: string[] = [];
  const motivationLetterWords = countWords(documents.motivation_letter_et);
  const shortStatementWords = countWords(documents.statement_short_et);
  const longStatementWords = countWords(documents.statement_long_et);

  if (motivationLetterWords < 250 || motivationLetterWords > 400) {
    errors.push(`motivation_letter_et must be 250-400 words, got ${motivationLetterWords}`);
  }

  if (shortStatementWords < 50 || shortStatementWords > 80) {
    errors.push(`statement_short_et must be 50-80 words, got ${shortStatementWords}`);
  }

  if (longStatementWords < 100 || longStatementWords > 150) {
    errors.push(`statement_long_et must be 100-150 words, got ${longStatementWords}`);
  }

  const sectionsToCompare: Array<[DocumentSectionKey, DocumentSectionKey]> = [
    ["analysis_summary_et", "statement_short_et"],
    ["analysis_summary_et", "statement_long_et"],
    ["statement_short_et", "statement_long_et"],
  ];

  for (const [leftKey, rightKey] of sectionsToCompare) {
    if (normalizeForComparison(documents[leftKey]) === normalizeForComparison(documents[rightKey])) {
      errors.push(`${leftKey} duplicates ${rightKey}`);
    }
  }

  return errors;
}

async function createJsonResponse(
  userContent: string,
  schemaName: string,
  schema: object,
  model?: string,
  correctionMessage?: string
) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: model ?? MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: correctionMessage
          ? `${userContent}\n\n${RETRY_APPEND}\n${correctionMessage}`
          : userContent,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        schema,
      },
    },
  });

  return getResponseOutputText(response);
}

export async function analyzeInputs(cvText: string, jobAdText: string, model?: string): Promise<AnalysisResult> {
  const userContent = `${ANALYSIS_INSTRUCTIONS}\n\n${buildAnalysisUserPrompt(cvText, jobAdText)}`;
  let correctionMessage: string | undefined;

  for (let attempt = 1; attempt <= MAX_MODEL_ATTEMPTS; attempt += 1) {
    const rawOutput = await createJsonResponse(
      userContent,
      "analysis",
      analysisResponseJsonSchema,
      model,
      correctionMessage
    );

    try {
      return analysisSchema.parse(JSON.parse(rawOutput));
    } catch (error) {
      if (attempt === MAX_MODEL_ATTEMPTS) {
        console.error("Failed to parse analysis response", { rawOutput });
        throw new Error(`Analysis response parsing failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      correctionMessage = "The previous analysis response did not match the required schema exactly.";
    }
  }

  throw new Error("Analysis response parsing failed");
}

export async function generateDocuments(cvText: string, jobAdText: string, analysis: AnalysisResult, model?: string): Promise<GeneratedDocuments> {
  const userContent = `${GENERATION_INSTRUCTIONS}\n\n${buildGenerationUserPrompt(
    cvText,
    jobAdText,
    JSON.stringify(analysis, null, 2)
  )}`;
  let correctionMessage: string | undefined;

  for (let attempt = 1; attempt <= MAX_MODEL_ATTEMPTS; attempt += 1) {
    const rawOutput = await createJsonResponse(
      userContent,
      "documents",
      generationResponseJsonSchema,
      model,
      correctionMessage
    );

    try {
      const documents = documentsSchema.parse(JSON.parse(rawOutput));
      const validationErrors = validateGeneratedDocuments(documents);

      if (validationErrors.length === 0) {
        return documents;
      }

      if (attempt === MAX_MODEL_ATTEMPTS) {
        throw new Error(validationErrors.join("; "));
      }
      correctionMessage = validationErrors.join("; ");
    } catch (error) {
      if (attempt === MAX_MODEL_ATTEMPTS) {
        console.error("Failed to parse documents response", { rawOutput });
        throw new Error(`Documents response parsing failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      correctionMessage =
        error instanceof Error && error.message
          ? error.message
          : "The previous documents response failed validation.";
    }
  }

  throw new Error("Documents response parsing failed");
}

export async function regenerateDocumentSection(
  cvText: string,
  jobAdText: string,
  analysis: AnalysisResult,
  section: DocumentSectionKey,
  previousOutputs: GeneratedDocuments
): Promise<string> {
  const userContent = `${SECTION_REGENERATION_INSTRUCTIONS}\n\n${buildSectionRegenerationUserPrompt(
    section,
    cvText,
    jobAdText,
    JSON.stringify(analysis, null, 2),
    buildPreviousOutputsJson(previousOutputs)
  )}`;
  let correctionMessage: string | undefined;

  for (let attempt = 1; attempt <= MAX_MODEL_ATTEMPTS; attempt += 1) {
    const rawOutput = await createJsonResponse(
      userContent,
      "regenerated_section",
      createSectionRegenerationResponseJsonSchema(section),
      MODEL,
      correctionMessage
    );

    try {
      const raw = JSON.parse(rawOutput) as Partial<GeneratedDocuments>;
      const content = raw[section];

      if (typeof content !== "string") {
        throw new Error(`Regenerated section ${section} is missing`);
      }

      if (Object.keys(raw).length !== 1) {
        throw new Error(`Regenerated section ${section} response is malformed`);
      }

      return content;
    } catch (error) {
      if (attempt === MAX_MODEL_ATTEMPTS) {
        console.error("Regenerated section response invalid", { rawOutput });
        throw error instanceof Error ? error : new Error(String(error));
      }

      correctionMessage = `Only return the requested key: ${section}.`;
    }
  }

  throw new Error(`Regenerated section ${section} is missing`);
}
