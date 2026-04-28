import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const OCR_TIMEOUT_MS = 45_000;
const OCR_LANGUAGE = process.env.TESSERACT_LANGUAGE ?? "est";
const OCR_CACHE_PATH = process.env.TESSERACT_CACHE_PATH ?? path.join(os.tmpdir(), "tesseract-cache");
const MIN_CONFIDENCE = Number(process.env.TESSERACT_MIN_CONFIDENCE ?? "45");

export async function extractTextFromImageUrl(imageUrl: string) {
  const imageBuffer = await downloadImage(imageUrl);
  const preparedImages = await preprocessImageVariants(imageBuffer);
  const worker = await createWorker(OCR_LANGUAGE, 1, {
    cachePath: OCR_CACHE_PATH,
    logger: () => undefined,
  });

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: "6",
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });

    let bestText = "";
    let bestScore = -1;

    for (const preparedImageBuffer of preparedImages) {
      const result = await withTimeout(worker.recognize(preparedImageBuffer), OCR_TIMEOUT_MS, "OCR timed out.");
      const cleanedText = cleanupOcrText(result.data.lines, result.data.text);
      const score = scoreExtractedText(cleanedText);

      if (score > bestScore) {
        bestScore = score;
        bestText = cleanedText;
      }
    }

    return bestText;
  } finally {
    await worker.terminate();
  }
}

async function downloadImage(imageUrl: string) {
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; JobAdFetcher/1.0; +https://localhost)",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`The vacancy image returned ${response.status}.`);
  }

  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    throw new Error("The vacancy image is too large to OCR.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("The vacancy image is too large to OCR.");
  }

  return buffer;
}

async function preprocessImageVariants(imageBuffer: Buffer) {
  const normalized = sharp(imageBuffer)
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.2, m1: 1, m2: 2 })
    .resize({ width: 2200, withoutEnlargement: false, fit: "inside" })
    .png()
    .toBuffer();

  const thresholded = sharp(imageBuffer)
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.2, m1: 1, m2: 2 })
    .resize({ width: 2200, withoutEnlargement: false, fit: "inside" })
    .threshold(168, { grayscale: true })
    .png()
    .toBuffer();

  return Promise.all([normalized, thresholded]);
}

type OcrLine = {
  text?: string;
  confidence?: number;
};

function cleanupOcrText(lines: OcrLine[] | undefined, rawText: string | undefined) {
  const filteredLines = (lines ?? [])
    .map((line) => ({
      text: normalizeOcrLine(line.text ?? ""),
      confidence: typeof line.confidence === "number" ? line.confidence : 0,
    }))
    .filter((line) => line.text)
      .filter((line) => shouldKeepLine(line.text, line.confidence))
    .map((line) => line.text);

  const mergedLines: string[] = [];

  for (const line of filteredLines) {
    const previous = mergedLines[mergedLines.length - 1];

    if (previous && shouldMergeLines(previous, line)) {
      mergedLines[mergedLines.length - 1] = mergeLines(previous, line);
      continue;
    }

    mergedLines.push(line);
  }

  const cleanedFromLines = dedupeLines(mergedLines).join("\n").trim();
  const cleanedFromRaw = cleanupRawOcrText(rawText ?? "");

  if (scoreExtractedText(cleanedFromLines) >= scoreExtractedText(cleanedFromRaw)) {
    return cleanedFromLines;
  }

  return cleanedFromRaw;
}

function normalizeOcrLine(value: string) {
  return value
    .replace(/[“”„"]/g, '"')
    .replace(/[’‘`´]/g, "'")
    .replace(/[•·●]/g, "-")
    .replace(/[|]+/g, " ")
    .replace(/[<>]+/g, " ")
    .replace(/[—–]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\bGelering\.ee\b/g, "@elering.ee")
    .replace(/\belering\.ee\b/g, "@elering.ee")
    .replace(/\b([A-Za-zÕÄÖÜõäöü]+)\.(\w+)([A-Za-zÕÄÖÜõäöü]+)@/g, "$1.$2$3@")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function shouldKeepLine(text: string, confidence: number) {
  const letterCount = countLetters(text);
  const symbolCount = countSymbols(text);

  if (letterCount === 0) {
    return false;
  }

  if (text.length <= 2 && confidence < 70) {
    return false;
  }

  if (confidence < MIN_CONFIDENCE && symbolCount > letterCount / 2) {
    return false;
  }

  if (looksLikeNoise(text)) {
    return false;
  }

  return true;
}

function shouldMergeLines(previous: string, next: string) {
  if (isSectionHeading(previous) || isBulletLine(next) || isContactLine(next)) {
    return false;
  }

  if (/[.:!?]$/.test(previous)) {
    return false;
  }

  if (previous.length < 25) {
    return false;
  }

  if (/^[a-zõäöü]/.test(next)) {
    return true;
  }

  return false;
}

function mergeLines(previous: string, next: string) {
  return `${previous} ${next}`
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function isSectionHeading(text: string) {
  return /^[A-ZÕÄÖÜ][A-ZÕÄÖÜ\s]{3,}$/.test(text) || /^(LISAINFO|ASUKOHT|SOOVID SAADA ROHKEM LISAINFOT)\b/.test(text);
}

function isBulletLine(text: string) {
  return /^[-*]\s/.test(text) || /^\d+[.)]\s/.test(text);
}

function isContactLine(text: string) {
  return /@|abistab Sind|küsimustes|v ärbamis|värbamis/i.test(text);
}

function looksLikeNoise(text: string) {
  if (/^[^A-Za-zÕÄÖÜõäöü]+$/.test(text)) {
    return true;
  }

  if (text.length <= 6 && countUppercase(text) >= 3 && !/[ÕÄÖÜA-Z][a-zõäöü]/.test(text)) {
    return true;
  }

  if (countSymbols(text) > text.length * 0.35 && !/@/.test(text)) {
    return true;
  }

  return false;
}

function dedupeLines(lines: string[]) {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = line.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function cleanupRawOcrText(rawText: string) {
  return dedupeLines(
    rawText
      .split(/\r?\n/)
      .map((line) => normalizeOcrLine(line))
      .filter(Boolean)
      .filter((line) => !looksLikeNoise(line))
  )
    .join("\n")
    .trim();
}

function scoreExtractedText(value: string) {
  const letters = countLetters(value);
  const lines = value.split(/\r?\n/).filter(Boolean).length;
  return letters + lines * 8;
}

function countLetters(value: string) {
  return (value.match(/[A-Za-zÕÄÖÜõäöüŠŽšž]/g) ?? []).length;
}

function countUppercase(value: string) {
  return (value.match(/[A-ZÕÄÖÜŠŽ]/g) ?? []).length;
}

function countSymbols(value: string) {
  return (value.match(/[^A-Za-zÕÄÖÜõäöüŠŽšž0-9\s.,;:!?()@&/-]/g) ?? []).length;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}
