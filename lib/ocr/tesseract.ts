import os from "node:os";
import path from "node:path";
import { createWorker } from "tesseract.js";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const OCR_TIMEOUT_MS = 45_000;
const OCR_LANGUAGE = process.env.TESSERACT_LANGUAGE ?? "est";
const OCR_CACHE_PATH = process.env.TESSERACT_CACHE_PATH ?? path.join(os.tmpdir(), "tesseract-cache");

export async function extractTextFromImageUrl(imageUrl: string) {
  const imageBuffer = await downloadImage(imageUrl);
  const worker = await createWorker(OCR_LANGUAGE, 1, {
    cachePath: OCR_CACHE_PATH,
    logger: () => undefined,
  });

  try {
    const result = await withTimeout(worker.recognize(imageBuffer), OCR_TIMEOUT_MS, "OCR timed out.");
    return result.data.text.trim();
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
