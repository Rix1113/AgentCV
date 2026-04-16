import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import type { GeneratedDocuments } from "@/types";

function createParagraphsFromText(text: string) {
  if (!text) {
    return [new Paragraph("")];
  }

  return text.split(/\r?\n/).flatMap((line) => {
    if (line.trim() === "") {
      return [new Paragraph("")];
    }
    return [new Paragraph(line)];
  });
}

export async function buildDocx(documents: GeneratedDocuments) {
  const children = [
    new Paragraph({ text: "Analüüs ja sobivuse kokkuvõte", heading: HeadingLevel.HEADING_1 }),
    ...createParagraphsFromText(documents.analysis_summary_et),
    new Paragraph({ text: "CV", heading: HeadingLevel.HEADING_1 }),
    ...createParagraphsFromText(documents.cv_et),
    new Paragraph({ text: "Motivatsioonikiri", heading: HeadingLevel.HEADING_1 }),
    ...createParagraphsFromText(documents.motivation_letter_et),
    new Paragraph({ text: "Enesetutvustus – lühike versioon", heading: HeadingLevel.HEADING_1 }),
    ...createParagraphsFromText(documents.statement_short_et),
    new Paragraph({ text: "Enesetutvustus – pikk versioon", heading: HeadingLevel.HEADING_1 }),
    ...createParagraphsFromText(documents.statement_long_et),
  ];

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
