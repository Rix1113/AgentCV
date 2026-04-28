export type ExportBlock =
  | { type: "subheading"; text: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string };

function isBulletLine(line: string) {
  return /^([-*•]|\d+[.)])\s+/.test(line);
}

function stripBulletPrefix(line: string) {
  return line.replace(/^([-*•]|\d+[.)])\s+/, "").trim();
}

function isSubheading(line: string, previousWasBlank: boolean, nextIsBlank: boolean) {
  if (!previousWasBlank) {
    return false;
  }

  const normalized = line.trim();
  if (!normalized || normalized.length > 72) {
    return false;
  }

  if (normalized.endsWith(":")) {
    return true;
  }

  return nextIsBlank && !/[.!?]$/.test(normalized);
}

export function parseExportBlocks(text: string): ExportBlock[] {
  const lines = text.split(/\r?\n/);
  const blocks: ExportBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphBuffer.join(" ").trim(),
    });
    paragraphBuffer = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const previousWasBlank = index === 0 ? true : lines[index - 1].trim() === "";
    const nextIsBlank = index === lines.length - 1 ? true : lines[index + 1].trim() === "";

    if (!line) {
      flushParagraph();
      return;
    }

    if (isBulletLine(line)) {
      flushParagraph();
      blocks.push({ type: "bullet", text: stripBulletPrefix(line) });
      return;
    }

    if (isSubheading(line, previousWasBlank, nextIsBlank)) {
      flushParagraph();
      blocks.push({ type: "subheading", text: line.replace(/:$/, "") });
      return;
    }

    paragraphBuffer.push(line);
  });

  flushParagraph();
  return blocks;
}
