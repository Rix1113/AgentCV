import { jsPDF } from "jspdf";
import type { GeneratedDocuments } from "@/types";

export function buildPdf(documents: GeneratedDocuments) {
  const pdf = new jsPDF();
  const blocks = [
    ["Analüüs ja sobivuse kokkuvõte", documents.analysis_summary_et],
    ["CV", documents.cv_et],
    ["Motivatsioonikiri", documents.motivation_letter_et],
    ["Enesetutvustus – lühike versioon", documents.statement_short_et],
    ["Enesetutvustus – pikk versioon", documents.statement_long_et],
  ] as const;

  let y = 20;
  blocks.forEach(([title, body], index) => {
    if (index > 0) {
      pdf.addPage();
      y = 20;
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 14, y);
    y += 10;
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(body, 180);
    pdf.text(lines, 14, y);
  });

  return Buffer.from(pdf.output("arraybuffer"));
}
