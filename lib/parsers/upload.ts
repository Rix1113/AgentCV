import { normalizeText } from "@/lib/parsers/text";

const PDF_MIME_TYPE = "application/pdf";
const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function parseUploadedDocument(file: File): Promise<string> {
  const fileType = resolveFileType(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = "";

  if (fileType === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      extractedText = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    extractedText = result.value;
  }

  const normalizedText = normalizeText(extractedText);
  if (!normalizedText) {
    throw new Error("The uploaded file did not contain readable text");
  }

  return normalizedText;
}

function resolveFileType(file: File): "pdf" | "docx" {
  const fileName = file.name.toLowerCase();

  if (file.type === PDF_MIME_TYPE || fileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (file.type === DOCX_MIME_TYPE || fileName.endsWith(".docx")) {
    return "docx";
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file");
}
