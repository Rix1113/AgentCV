export function normalizeText(input: string): string {
  return input.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
