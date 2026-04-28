import { jsPDF } from "jspdf";

const PAGE_MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const LINE_HEIGHT = 8;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

export function buildPdf(title: string, text: string) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = PAGE_MARGIN;

  const addLines = (lines: string[]) => {
    for (const line of lines) {
      if (y + LINE_HEIGHT > PAGE_HEIGHT - PAGE_MARGIN) {
        pdf.addPage();
        y = PAGE_MARGIN;
      }
      pdf.text(line, PAGE_MARGIN, y);
      y += LINE_HEIGHT;
    }
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(title, PAGE_MARGIN, y);
  y += LINE_HEIGHT + 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const paragraphs = text.split(/\r?\n/).flatMap((line) =>
    line.trim() === "" ? [""] : [line]
  );

  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      y += LINE_HEIGHT;
      continue;
    }
    const lines = pdf.splitTextToSize(paragraph, CONTENT_WIDTH);
    addLines(lines);
    y += LINE_HEIGHT;
  }

  return Buffer.from(pdf.output("arraybuffer"));
}
