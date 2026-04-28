import { extractTextFromImageUrl } from "@/lib/ocr/tesseract";
import {
  InputSizeLimitError,
  JOB_AD_TEXT_MAX_LENGTH,
  JOB_AD_TEXT_MIN_LENGTH,
  getTextInputLengthMessage,
} from "@/lib/input-limits";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 2_000_000;
const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^\[::1\]$/i,
  /^::1$/i,
];

const PRIVATE_IPV6_PREFIXES = ["fc", "fd", "fe80"];

type ExtractedJobAd = {
  text: string;
  title?: string;
  warning?: string;
};

export function assertSafeRemoteUrl(rawUrl: string) {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid vacancy URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https vacancy links are supported.");
  }

  const hostname = url.hostname.trim().toLowerCase();
  if (!hostname) {
    throw new Error("Enter a valid vacancy URL.");
  }

  if (PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new Error("This link cannot be fetched.");
  }

  const normalizedIpv6 = hostname.replace(/^\[|\]$/g, "");
  if (PRIVATE_IPV6_PREFIXES.some((prefix) => normalizedIpv6.startsWith(prefix))) {
    throw new Error("This link cannot be fetched.");
  }

  return url;
}

export async function fetchJobAdFromUrl(rawUrl: string): Promise<ExtractedJobAd> {
  const url = assertSafeRemoteUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobAdFetcher/1.0; +https://localhost)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`The vacancy page returned ${response.status}.`);
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error("This link did not return a readable job ad page.");
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) {
      throw new InputSizeLimitError("The vacancy page is too large to import.");
    }

    const html = await response.text();
    if (html.length > MAX_HTML_BYTES) {
      throw new InputSizeLimitError("The vacancy page is too large to import.");
    }

    const extracted = contentType.includes("text/plain")
      ? finalizeExtractedText({ text: html })
      : await extractJobAdFromHtml(html);

    return {
      ...extracted,
      warning: extracted.text.length < JOB_AD_TEXT_MIN_LENGTH ? getTextInputLengthMessage("jobAdText") : undefined,
    };
  } catch (error) {
    if (error instanceof InputSizeLimitError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Fetching the vacancy page timed out. Try again or paste the ad text directly.");
    }

    throw error instanceof Error ? error : new Error("Unable to fetch the vacancy page.");
  } finally {
    clearTimeout(timeout);
  }
}

async function extractJobAdFromHtml(html: string): Promise<ExtractedJobAd> {
  const jobPosting = extractJobPostingJsonLd(html);
  const vacancyImageUrl = extractVacancyImageUrl(html);
  const ocrText = vacancyImageUrl ? await extractImageTextSafely(vacancyImageUrl) : "";
  if (jobPosting) {
    const title = cleanText(jobPosting.title);
    const company = cleanText(readNestedValue(jobPosting, ["hiringOrganization", "name"]));
    const location = cleanText(readNestedValue(jobPosting, ["jobLocation", "address", "addressLocality"]));
    const employmentType = cleanText(jobPosting.employmentType);
    const description = cleanText(jobPosting.description);
    const qualifications = cleanText(jobPosting.qualifications);
    const responsibilities = cleanText(jobPosting.responsibilities);
    const skills = cleanText(jobPosting.skills);

    return finalizeExtractedText({
      title,
      text: [
        title,
        company ? `Company: ${company}` : "",
        location ? `Location: ${location}` : "",
        employmentType ? `Employment type: ${employmentType}` : "",
        ocrText ? `Job description:\n${ocrText}` : "",
        description,
        responsibilities ? `Responsibilities:\n${responsibilities}` : "",
        qualifications ? `Qualifications:\n${qualifications}` : "",
        skills ? `Skills:\n${skills}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  }

  const nextData = extractNextDataText(html);
  const metaTitle = extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = extractMetaContent(html, "description") ?? extractMetaProperty(html, "og:description");
  const mainContent = extractMainHtml(html);
  const headings = extractAllMatches(mainContent, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)
    .map(stripHtml)
    .filter(Boolean)
    .slice(0, 8)
    .join("\n");
  const bodyText = stripHtml(mainContent);

  return finalizeExtractedText({
    title: cleanText(metaTitle),
    text: [
      cleanText(metaTitle),
      cleanText(metaDescription),
      nextData,
      ocrText,
      headings,
      bodyText,
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
}

function finalizeExtractedText(extracted: ExtractedJobAd): ExtractedJobAd {
  const normalized = cleanText(extracted.text);
  const title = cleanText(extracted.title);
  const deduped = dedupeParagraphs(normalized);

  if (!deduped) {
    throw new Error("The vacancy page did not contain enough readable text to import.");
  }

  return {
    title: title || undefined,
    text: deduped.length > JOB_AD_TEXT_MAX_LENGTH ? deduped.slice(0, JOB_AD_TEXT_MAX_LENGTH).trim() : deduped,
  };
}

function extractJobPostingJsonLd(html: string): Record<string, unknown> | null {
  const matches = extractAllMatches(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const match of matches) {
    const parsed = safeJsonParse(stripHtmlComments(match));
    const candidate = findJobPosting(parsed);
    if (candidate) {
      return candidate;
    }
  }

  return null;
}

function extractNextDataText(html: string) {
  const raw = extractTagContent(html, /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  const parsed = safeJsonParse(raw);
  if (!parsed) {
    return "";
  }

  const hits = collectStringValues(parsed, (value) => value.length > 80 && /[A-Za-zÀ-ÿ]/.test(value));
  return dedupeParagraphs(hits.join("\n\n"));
}

function collectStringValues(value: unknown, predicate: (value: string) => boolean, seen = new Set<string>()) {
  if (value == null) {
    return [];
  }

  if (typeof value === "string") {
    const cleaned = cleanText(value);
    if (!predicate(cleaned) || seen.has(cleaned)) {
      return [];
    }

    seen.add(cleaned);
    return [cleaned];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringValues(item, predicate, seen));
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) => collectStringValues(item, predicate, seen));
  }

  return [];
}

function findJobPosting(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJobPosting(item);
      if (found) {
        return found;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const type = record["@type"];

  if (typeof type === "string" && type.toLowerCase() === "jobposting") {
    return record;
  }

  if (Array.isArray(type) && type.some((entry) => typeof entry === "string" && entry.toLowerCase() === "jobposting")) {
    return record;
  }

  if (record["@graph"]) {
    return findJobPosting(record["@graph"]);
  }

  for (const nested of Object.values(record)) {
    const found = findJobPosting(nested);
    if (found) {
      return found;
    }
  }

  return null;
}

function extractMainHtml(html: string) {
  const vacancyScoped =
    sliceBetween(html, 'class="jsx-270292618 job-ad"', '<div id="similarContainer"') ??
    sliceBetween(html, 'class="jsx-270292618 job-ad"', "<footer") ??
    sliceBetween(html, 'class="jsx-2720671842 vacancy-content"', '<div id="similarContainer"');

  if (vacancyScoped) {
    return vacancyScoped;
  }

  return (
    extractTagContent(html, /<main[^>]*>([\s\S]*?)<\/main>/i) ??
    extractTagContent(html, /<body[^>]*>([\s\S]*?)<\/body>/i) ??
    html
  );
}

function extractVacancyImageUrl(html: string) {
  const scoped = extractMainHtml(html);
  const vacancyImageMatch = scoped.match(
    /<div[^>]*vacancy-details__image[^>]*>[\s\S]*?<img[^>]+src=["']([^"']*files-service[^"']+)["']/i
  );
  if (vacancyImageMatch?.[1]) {
    return toAbsoluteCvOnlineUrl(vacancyImageMatch[1]);
  }

  const fileServiceMatches = extractAllMatches(scoped, /<img[^>]+src=["']([^"']*files-service[^"']+)["'][^>]*>/gi)
    .map(toAbsoluteCvOnlineUrl)
    .filter(Boolean);

  return fileServiceMatches[fileServiceMatches.length - 1] ?? "";
}

function extractMetaContent(html: string, name: string) {
  const escaped = escapeRegex(name);
  const regex = new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([\\s\\S]*?)["'][^>]*>`, "i");
  return extractTagContent(html, regex);
}

function extractMetaProperty(html: string, property: string) {
  const escaped = escapeRegex(property);
  const regex = new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([\\s\\S]*?)["'][^>]*>`, "i");
  return extractTagContent(html, regex);
}

function extractTagContent(html: string, regex: RegExp) {
  const match = html.match(regex);
  return match?.[1] ?? null;
}

function extractAllMatches(html: string, regex: RegExp) {
  return Array.from(html.matchAll(regex), (match) => match[1] ?? "");
}

function stripHtml(html: string) {
  return decodeHtmlEntities(
    stripHtmlComments(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|li|ul|ol|h1|h2|h3|h4|h5|h6)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

function stripHtmlComments(value: string) {
  return value.replace(/<!--[\s\S]*?-->/g, " ");
}

function dedupeParagraphs(text: string) {
  const seen = new Set<string>();

  return text
    .split(/\n{2,}/)
    .map((part) => cleanText(part))
    .filter((part) => {
      if (!part || seen.has(part)) {
        return false;
      }

      seen.add(part);
      return true;
    })
    .join("\n\n")
    .trim();
}

function cleanText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return decodeHtmlEntities(value)
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function safeJsonParse(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeHtmlEntities(value));
  } catch {
    return null;
  }
}

async function extractImageTextSafely(imageUrl: string) {
  try {
    return cleanText(await extractTextFromImageUrl(imageUrl));
  } catch (error) {
    console.error("Image OCR failed for job ad import", {
      imageUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  }
}

function toAbsoluteCvOnlineUrl(url: string) {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `https://www.cvonline.ee${url}`;
  }

  return url;
}

function sliceBetween(value: string, startMarker: string, endMarker: string) {
  const startIndex = value.indexOf(startMarker);
  if (startIndex === -1) {
    return null;
  }

  const endIndex = value.indexOf(endMarker, startIndex);
  if (endIndex === -1) {
    return value.slice(startIndex);
  }

  return value.slice(startIndex, endIndex);
}

function readNestedValue(value: unknown, path: string[]) {
  let current = value;

  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return "";
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : "";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
