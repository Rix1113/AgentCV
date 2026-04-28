import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";
import { parseExportBlocks } from "@/lib/exports/structured-text";

function formatExportDate() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());
}

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

export async function buildDocx(title: string, text: string) {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true })],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 120 },
      border: {
        bottom: {
          color: "D9E0EF",
          style: BorderStyle.SINGLE,
          size: 6,
          space: 6,
        },
      },
    }),
    new Paragraph({
      text: `Prepared by Estonian Job Agent • ${formatExportDate()}`,
      spacing: { after: 260 },
      thematicBreak: false,
    }),
    ...createStyledParagraphsFromText(text),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 260 },
      children: [
        new TextRun({
          children: ["Page ", PageNumber.CURRENT],
        }),
      ],
    }),
  ];

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
