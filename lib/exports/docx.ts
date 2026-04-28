import { Document, Packer, Paragraph, HeadingLevel } from "docx";

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

export async function buildDocx(title: string, text: string) {
  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    ...createParagraphsFromText(text),
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
