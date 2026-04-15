import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import type { GeneratedDocuments } from "@/types";

export async function buildDocx(documents: GeneratedDocuments) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Analüüs ja sobivuse kokkuvõte", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(documents.analysis_summary_et),
          new Paragraph({ text: "CV", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(documents.cv_et),
          new Paragraph({ text: "Motivatsioonikiri", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(documents.motivation_letter_et),
          new Paragraph({ text: "Enesetutvustus – lühike versioon", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(documents.statement_short_et),
          new Paragraph({ text: "Enesetutvustus – pikk versioon", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(documents.statement_long_et),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
