import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  convertInchesToTwip,
} from "docx";
import { parseExportBlocks } from "@/lib/exports/structured-text";

function createStyledParagraphsFromText(text: string) {
  const blocks = parseExportBlocks(text);

  if (!blocks.length) {
    return [new Paragraph("")];
  }

  return blocks.map((block) => {
    if (block.type === "subheading") {
      return new Paragraph({
        text: block.text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 220, after: 100 },
      });
    }

    if (block.type === "bullet") {
      return new Paragraph({
        text: block.text,
        bullet: { level: 0 },
        spacing: { after: 90, line: 320 },
      });
    }

    return new Paragraph({
      text: block.text,
      spacing: { after: 140, line: 320 },
    });
  });
}

export async function buildDocx(_title: string, text: string) {
  const children = createStyledParagraphsFromText(text);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Aptos",
            size: 22,
            color: "16213E",
          },
          paragraph: {
            spacing: {
              line: 320,
            },
          },
        },
        heading1: {
          run: {
            bold: true,
            size: 28,
            color: "16213E",
          },
          paragraph: {
            spacing: {
              before: 220,
              after: 100,
            },
          },
        },
        heading2: {
          run: {
            bold: true,
            size: 26,
            color: "16213E",
          },
          paragraph: {
            spacing: {
              before: 220,
              after: 100,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.9),
              bottom: convertInchesToTwip(0.85),
              left: convertInchesToTwip(0.9),
              right: convertInchesToTwip(0.9),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
