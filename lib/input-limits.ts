import { ZodError } from "zod";

export const PROJECT_TITLE_MAX_LENGTH = 120;
export const CV_TEXT_MIN_LENGTH = 80;
export const CV_TEXT_MAX_LENGTH = 20_000;
export const JOB_AD_TEXT_MIN_LENGTH = 80;
export const JOB_AD_TEXT_MAX_LENGTH = 16_000;

export const TEXT_INPUT_LIMITS = {
  cvText: {
    label: "CV",
    min: CV_TEXT_MIN_LENGTH,
    max: CV_TEXT_MAX_LENGTH,
  },
  jobAdText: {
    label: "Job ad",
    min: JOB_AD_TEXT_MIN_LENGTH,
    max: JOB_AD_TEXT_MAX_LENGTH,
  },
} as const;

export type TextInputField = keyof typeof TEXT_INPUT_LIMITS;

export class InputSizeLimitError extends Error {
  status: number;

  constructor(message: string, status = 413) {
    super(message);
    this.name = "InputSizeLimitError";
    this.status = status;
  }
}

export function getTextInputLengthMessage(field: TextInputField) {
  const config = TEXT_INPUT_LIMITS[field];
  return `${config.label} must be between ${formatCharacterCount(config.min)} and ${formatCharacterCount(config.max)}.`;
}

export function getTextInputMaxLengthMessage(field: TextInputField) {
  const config = TEXT_INPUT_LIMITS[field];
  return `${config.label} must be ${formatCharacterCount(config.max)} or less.`;
}

export function getRemainingCharacters(field: TextInputField, value: string) {
  return TEXT_INPUT_LIMITS[field].max - value.length;
}

export function assertTextInputWithinLimit(field: TextInputField, value: string) {
  if (value.length > TEXT_INPUT_LIMITS[field].max) {
    throw new InputSizeLimitError(getTextInputMaxLengthMessage(field));
  }
}

export function getValidationErrorStatus(error: ZodError) {
  return error.issues.some((issue) => issue.code === "too_big") ? 413 : 400;
}

export function formatCharacterCount(value: number) {
  return `${value.toLocaleString()} characters`;
}
