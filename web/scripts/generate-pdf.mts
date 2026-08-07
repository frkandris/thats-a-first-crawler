/**
 * Legyártja a letölthető PDF-eket az 50 ötletből, mindkét nyelven:
 *   public/thats-a-first-50.hu.pdf és public/thats-a-first-50.en.pdf
 *
 * Futtatás:   node scripts/generate-pdf.mts        (Node 24+, natív TS-futtatással)
 * Betűtípus:  magyar ékezetekhez (ő/ű) beágyazott TTF kell — alapból a macOS
 *             Arialját használjuk, más gépen a FONT_PATH / FONT_BOLD_PATH
 *             env változókkal adható meg.
 */
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedActivities } from "../lib/seed-data/activities.ts";
import { CATEGORY_LABELS } from "../lib/i18n/dictionaries.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

const FONT =
  process.env.FONT_PATH ?? "/System/Library/Fonts/Supplemental/Arial.ttf";
const FONT_BOLD =
  process.env.FONT_BOLD_PATH ??
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf";

for (const f of [FONT, FONT_BOLD]) {
  if (!fs.existsSync(f)) {
    console.error(
      `Nem találom a betűtípust: ${f}\nAdd meg a FONT_PATH / FONT_BOLD_PATH env változókkal egy TTF-et, ami tud magyar ékezeteket.`
    );
    process.exit(1);
  }
}

// A márka színei (a weboldal tokenjeivel egyezően)
const INK = "#1b2430";
const COBALT = "#2743d6";
const MARKER = "#ffd84d";
const MUTED = "#626c78";
const LINE = "#e0dfd6";
const MARGIN = 56;

const STRINGS = {
  hu: {
    brand: "THAT'S A FIRST",
    title1: "50 dolog, amit érdemes",
    title2: "életedben először kipróbálni",
    intro:
      "Nyomtasd ki, tedd ki a hűtőre, és pipáld ki, ami már megvolt. " +
      "A mi szabályunk: minden hónap utolsó szerdáján egy új. " +
      "Így egy év alatt tizenkettő, négy év alatt majdnem az egész lista meglesz.",
    closingTitle: "Melyikkel kezded?",
    closingText:
      "Friss történetek és havi inspiráció a hírlevelünkben — a hónap első szerdáján küldjük, " +
      "hogy az utolsóra össze tudd szervezni.",
  },
  en: {
    brand: "THAT'S A FIRST",
    title1: "50 things worth trying",
    title2: "for the first time in your life",
    intro:
      "Print it, stick it on the fridge, and tick off what you've already done. " +
      "Our rule: one new thing on the last Wednesday of every month. " +
      "That's twelve a year — in four years, you'll have nearly the whole list.",
    closingTitle: "Which one will you start with?",
    closingText:
      "Fresh stories and monthly inspiration in our newsletter — sent on the first Wednesday " +
      "of the month, so you can get organized for the last one.",
  },
} as const;

type PdfLocale = keyof typeof STRINGS;

function generate(locale: PdfLocale): string {
  const t = STRINGS[locale];
  const outPath = path.join(here, "..", "public", `thats-a-first-50.${locale}.pdf`);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  });
  doc.pipe(fs.createWriteStream(outPath));
  doc.registerFont("body", FONT);
  doc.registerFont("bold", FONT_BOLD);

  const pageWidth = doc.page.width - MARGIN * 2;

  const ensureSpace = (needed: number) => {
    if (doc.y + needed > doc.page.height - MARGIN) {
      doc.addPage();
    }
  };

  // ——— Címoldal-fejléc ———
  doc.font("bold").fontSize(11).fillColor(MUTED);
  doc.text(t.brand, { characterSpacing: 2 });
  doc.moveDown(1.2);

  doc.font("bold").fontSize(30).fillColor(INK);
  doc.text(t.title1, { width: pageWidth });
  // A második sor mögé sárga "szövegkiemelő" sáv kerül — az aláírás-motívum.
  const hlY = doc.y;
  const hlWidth = doc.font("bold").fontSize(30).widthOfString(t.title2);
  doc.save().rect(MARGIN - 3, hlY + 4, hlWidth + 8, 30).fill(MARKER).restore();
  doc.font("bold").fontSize(30).fillColor(INK).text(t.title2, MARGIN, hlY, {
    width: pageWidth,
  });
  doc.moveDown(0.8);

  doc.font("body").fontSize(12).fillColor(MUTED);
  doc.text(t.intro, { width: pageWidth, lineGap: 3 });
  doc.moveDown(1.5);

  // ——— A lista, kategóriánként ———
  const byCategory = new Map<string, typeof seedActivities>();
  for (const a of seedActivities) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }

  let counter = 0;
  for (const [category, items] of byCategory) {
    ensureSpace(60);
    doc.moveDown(0.6);
    doc.font("bold").fontSize(13).fillColor(COBALT);
    const label = CATEGORY_LABELS[locale][category] ?? category;
    doc.text(label.toUpperCase(), { characterSpacing: 1.5 });
    doc
      .moveTo(MARGIN, doc.y + 4)
      .lineTo(MARGIN + pageWidth, doc.y + 4)
      .strokeColor(LINE)
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.8);

    for (const a of items) {
      counter += 1;
      ensureSpace(52);

      const y = doc.y;
      // pipálható négyzet
      doc
        .rect(MARGIN, y + 2, 11, 11)
        .lineWidth(1.4)
        .strokeColor(INK)
        .stroke();

      const textX = MARGIN + 24;
      const textWidth = pageWidth - 24;
      const content = a[locale];
      doc.font("bold").fontSize(12).fillColor(INK);
      doc.text(`${counter}. ${content.title}`, textX, y, { width: textWidth });
      doc.font("body").fontSize(10).fillColor(MUTED);
      doc.text(content.description, textX, doc.y + 2, {
        width: textWidth,
        lineGap: 2,
      });
      doc.moveDown(0.7);
      doc.x = MARGIN;
    }
  }

  // ——— Zárás ———
  ensureSpace(90);
  doc.moveDown(1);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(MARGIN + pageWidth, doc.y)
    .strokeColor(LINE)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.8);
  doc.font("bold").fontSize(12).fillColor(INK);
  doc.text(t.closingTitle, { width: pageWidth });
  doc.font("body").fontSize(10).fillColor(MUTED);
  doc.text(t.closingText, { width: pageWidth, lineGap: 2 });

  doc.end();
  return outPath;
}

for (const locale of ["hu", "en"] as const) {
  const out = generate(locale);
  console.log(`Kész: ${path.relative(process.cwd(), out)}`);
}
