import { jsPDF } from "jspdf";
import { parseExportBlocks } from "@/lib/exports/structured-text";

const PAGE_MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const LINE_HEIGHT = 7;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

export function buildPdf(title: string, text: string) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const blocks = parseExportBlocks(text);
  let y = 44;

  const ensurePageCapacity = (requiredHeight: number) => {
    if (y + requiredHeight <= PAGE_HEIGHT - PAGE_MARGIN) {
      return;
    }

    pdf.addPage();
    y = PAGE_MARGIN + 6;
    drawFooter(pdf);
  };

  const drawFooter = (doc: jsPDF) => {
    const page = doc.getCurrentPageInfo().pageNumber;
    doc.setDrawColor(217, 224, 239);
    doc.line(PAGE_MARGIN, PAGE_HEIGHT - 12, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(98, 112, 138);
    doc.text(`Page ${page}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 7, { align: "right" });
  };

  const formatDate = () =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date());

  pdf.setFillColor(245, 248, 255);
  pdf.roundedRect(PAGE_MARGIN, PAGE_MARGIN, CONTENT_WIDTH, 20, 4, 4, "F");
  pdf.setDrawColor(217, 224, 239);
  pdf.line(PAGE_MARGIN, 41, PAGE_WIDTH - PAGE_MARGIN, 41);
  pdf.setTextColor(22, 33, 62);
  pdf.setFont("times", "bold");
  pdf.setFontSize(18);
  pdf.text(title, PAGE_MARGIN + 4, 27);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(98, 112, 138);
  pdf.text(`Prepared by Estonian Job Agent • ${formatDate()}`, PAGE_MARGIN + 4, 34);
  drawFooter(pdf);

  const addLines = (lines: string[]) => {
    for (const line of lines) {
      ensurePageCapacity(LINE_HEIGHT);
      pdf.text(line, PAGE_MARGIN, y);
      y += LINE_HEIGHT;
    }
  };

  pdf.setTextColor(22, 33, 62);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11.5);

  for (const block of blocks) {
    if (block.type === "subheading") {
      ensurePageCapacity(12);
      pdf.setFont("times", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(22, 33, 62);
      pdf.text(block.text, PAGE_MARGIN, y);
      y += 8;
      pdf.setDrawColor(224, 231, 255);
      pdf.line(PAGE_MARGIN, y - 2.5, PAGE_MARGIN + 40, y - 2.5);
      y += 2;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11.5);
      continue;
    }

    if (block.type === "bullet") {
      const lines = pdf.splitTextToSize(block.text, CONTENT_WIDTH - 8);
      ensurePageCapacity(lines.length * LINE_HEIGHT + 4);
      pdf.text("•", PAGE_MARGIN, y);
      pdf.text(lines, PAGE_MARGIN + 5, y);
      y += lines.length * LINE_HEIGHT + 2;
      continue;
    }

    const lines = pdf.splitTextToSize(block.text, CONTENT_WIDTH);
    ensurePageCapacity(lines.length * LINE_HEIGHT + 4);
    addLines(lines);
    y += 3;
  }

  return Buffer.from(pdf.output("arraybuffer"));
}
