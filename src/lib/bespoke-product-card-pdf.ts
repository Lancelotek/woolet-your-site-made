/**
 * Customer-facing product card (PDF) for a Woolet Bespoke build.
 * Client-side only — built from the configurator state on this device.
 * When the buyer generated an AI render in step 3, that render is the hero
 * image; otherwise the pattern silhouette is shown with a hint to render.
 */
import {
  COLORS,
  ENGRAVING_FONTS,
  FINISHES,
  LENS_TYPES,
} from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import {
  type BespokeConfig,
  computePricing,
  formatAddOn,
  formatEur,
  formatLensWithStrength,
  hasEngraving,
  selectedLensTint,
} from "@/lib/bespoke-state";
import { BESPOKE_FRONT_WIDTH_RANGE } from "@/lib/bespoke-spec";

export type ProductCardInput = {
  config: BespokeConfig;
  /** Latest AI render for this configuration (data URL or hosted URL). */
  renderUrl?: string | null;
  /** Pseudonymous build reference shown on the card. */
  buildRef?: string | null;
  configuratorUrl?: string;
};

type Rgb = [number, number, number];
const DARK: Rgb = [8, 8, 7];
const INK: Rgb = [31, 27, 22];
const GOLD: Rgb = [202, 164, 73];
const MUTED: Rgb = [122, 112, 98];
const CREAM: Rgb = [237, 231, 217];
const PAPER: Rgb = [239, 233, 223];
const RULE: Rgb = [226, 220, 210];

/** jsPDF core fonts are WinAnsi only — normalise dashes/quotes, drop the rest. */
const pdfText = (s: string): string =>
  s
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00A0/g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\xFF]/g, "");

const hexToRgb = (hex?: string | null): Rgb | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Loads any image (data URL, hosted render, same-origin SVG) as a JPEG data URL. */
async function loadImage(url: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  if (!url || typeof document === "undefined") return null;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
      img.src = url;
    });
    const w = img.naturalWidth || 1200;
    const h = img.naturalHeight || 800;
    // Cap the embedded size so the PDF stays light enough to email.
    const scale = Math.min(1, 1800 / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#EFE9DF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.9), w: canvas.width, h: canvas.height };
  } catch {
    return null;
  }
}

/** Engraving rendered in the house font as an image, so any script prints correctly. */
async function engravingImage(text: string, cssFamily: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  if (typeof document === "undefined") return null;
  try {
    await document.fonts?.load?.(`48px ${cssFamily}`, text);
  } catch {
    /* fall back to whatever font the browser has */
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const font = `48px ${cssFamily}`;
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width) + 8;
  canvas.width = Math.max(width, 10);
  canvas.height = 64;
  ctx.font = font;
  ctx.fillStyle = "#1F1B16";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 4, 34);
  return { dataUrl: canvas.toDataURL("image/png"), w: canvas.width, h: canvas.height };
}

const formatDate = (d = new Date()) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);

async function buildProductCard(input: ProductCardInput) {
  const { config } = input;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);
  const tint = selectedLensTint(config);
  const pricing = computePricing(config);
  const engraving = hasEngraving(config) ? config.engravingText.trim() : "";
  const engravingFont = ENGRAVING_FONTS.find((f) => f.id === config.engravingFontId) ?? ENGRAVING_FONTS[0];

  const render = input.renderUrl ? await loadImage(input.renderUrl) : null;
  const silhouette = !render && frame?.url ? await loadImage(frame.url) : null;
  const hero = render ?? silhouette;
  const engravingImg = engraving ? await engravingImage(engraving, engravingFont.cssFamily) : null;

  const M = 18;
  const W = 210;
  const CW = W - M * 2;
  const BOTTOM = 276;
  let y = 0;

  const ensure = (needed: number) => {
    if (y + needed > BOTTOM) {
      doc.addPage();
      y = 24;
    }
  };

  // ── Header band
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 44, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("W O O L E T   B E S P O K E   ·   P R O D U C T   C A R D", M, 17);
  doc.setFont("times", "normal");
  doc.setFontSize(26);
  doc.setTextColor(...CREAM);
  doc.text(pdfText(frame ? `${frame.name}` : "Woolet Bespoke"), M, 31);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(154, 142, 126);
  const sub = [
    frame && frame.shape !== frame.name ? `Pattern · ${frame.shape}` : "Made to measure",
    `Configured ${formatDate()}`,
    input.buildRef ? `Build ref ${input.buildRef}` : null,
  ].filter(Boolean).join("    ·    ");
  doc.text(pdfText(sub), M, 38);

  // ── Hero image
  y = 52;
  const boxH = hero ? 78 : 0;
  if (hero) {
    doc.setFillColor(...PAPER);
    doc.rect(M, y, CW, boxH, "F");
    const pad = render ? 0 : 14;
    const scale = Math.min((CW - pad * 2) / hero.w, (boxH - pad * 2) / hero.h);
    const w = hero.w * scale;
    const h = hero.h * scale;
    doc.addImage(hero.dataUrl, "JPEG", M + (CW - w) / 2, y + (boxH - h) / 2, w, h);
  }
  y += boxH + (hero ? 6 : 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    pdfText(
      render
        ? "Your AI preview of this configuration. Illustrative render - the hand-made pair varies in acetate grain and highlights."
        : "Pattern silhouette. Generate your AI preview in step 3 of the configurator to see your colours on this card.",
    ),
    M,
    y,
  );
  y += 11;

  // ── Helpers
  const heading = (label: string) => {
    ensure(18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(label.toUpperCase(), M, y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(M, y + 2.5, M + 12, y + 2.5);
    y += 9;
  };

  const VALUE_X = M + 62;
  const row = (label: string, value: string, opts: { swatch?: string | null; bold?: boolean } = {}) => {
    const lines = doc.splitTextToSize(pdfText(value || "-"), CW - (VALUE_X - M) - (opts.swatch ? 6 : 0)) as string[];
    ensure(lines.length * 5 + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(pdfText(label), M, y);
    let x = VALUE_X;
    const rgb = hexToRgb(opts.swatch);
    if (rgb) {
      doc.setFillColor(...rgb);
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.2);
      doc.circle(x + 1.8, y - 1.3, 1.8, "FD");
      x += 6;
    }
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setTextColor(...INK);
    lines.forEach((line, i) => doc.text(line, x, y + i * 5));
    y += (lines.length - 1) * 5;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(M, y + 2.6, M + CW, y + 2.6);
    y += 7;
  };

  // ── Specification
  heading("Your specification");
  row("Pattern", frame ? (frame.shape === frame.name ? frame.name : `${frame.name} · ${frame.shape}`) : "-");
  row("Front acetate", front ? `${front.name} (${front.code})` : "-", { swatch: front?.hex });
  row("Temple acetate", temple ? `${temple.name} (${temple.code})` : "-", { swatch: temple?.hex });
  row("Finish", finish?.name ?? "-");
  row("Temple length", config.templeLengthMm ? `${config.templeLengthMm} mm${config.templeLengthIsCustom ? " (custom)" : ""}` : "-");
  if (engraving) {
    ensure(14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("Engraving", M, y);
    if (engravingImg) {
      const h = 6;
      const w = Math.min((engravingImg.w / engravingImg.h) * h, CW - (VALUE_X - M) - 30);
      doc.addImage(engravingImg.dataUrl, "PNG", VALUE_X, y - 4.6, w, h);
    }
    doc.setFontSize(8);
    doc.text("inner left temple", M + CW, y, { align: "right" });
    doc.setDrawColor(...RULE);
    doc.line(M, y + 2.6, M + CW, y + 2.6);
    y += 7;
  } else {
    row("Engraving", "None");
  }
  row("Lenses", lens ? formatLensWithStrength(lens.name, config) : "-", { swatch: tint?.hex });
  row("Front width", `Cut to your face after the fit scan (bespoke range ${BESPOKE_FRONT_WIDTH_RANGE})`);
  row("Material", "Mazzucchelli acetate from Milan · hand made in the EU");
  y += 4;

  // ── Price (left) + next steps (right), side by side so the card stays one page
  const steps = [
    "Your order is confirmed and paid.",
    "We email you a private link to the AI fit scan (or book a studio appointment).",
    "An optician checks your measurements within 24 hours.",
    "The pattern is cut in the EU to your exact millimetres - 3-4 weeks to ship, free worldwide.",
  ];
  const GAP = 10;
  const COL = (CW - GAP) / 2;
  const RX = M + COL + GAP;
  const priceRows: [string, string, boolean][] = [
    ["Bespoke frame", formatEur(pricing.basePriceEur), false],
    ...(pricing.engravingEur > 0 ? [["Engraving", formatAddOn(pricing.engravingEur), false] as [string, string, boolean]] : []),
    ...(lens ? [[lens.name, formatAddOn(pricing.lensEur), false] as [string, string, boolean]] : []),
    ["Shipping", "Free · worldwide", false],
    ["Total", formatEur(pricing.totalEur), true],
  ];
  doc.setFontSize(9);
  const stepLines = steps.map((t) => doc.splitTextToSize(pdfText(t), COL - 9) as string[]);
  const blockH = 9 + Math.max(priceRows.length * 6.5, stepLines.reduce((a, l) => a + l.length * 4.4 + 2, 0));
  ensure(blockH + 4);
  const top = y;
  const colHeading = (label: string, x: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(label.toUpperCase(), x, top);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(x, top + 2.5, x + 12, top + 2.5);
  };
  colHeading("Price", M);
  colHeading("What happens after payment", RX);

  let py = top + 9;
  priceRows.forEach(([label, value, bold]) => {
    doc.setFontSize(bold ? 11 : 9);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...(bold ? INK : MUTED));
    doc.text(pdfText(label), M, py);
    doc.setTextColor(...INK);
    doc.text(pdfText(value), M + COL, py, { align: "right" });
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    if (!bold) doc.line(M, py + 2.2, M + COL, py + 2.2);
    py += 6.5;
  });

  let sy = top + 9;
  stepLines.forEach((lines, i) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(String(i + 1).padStart(2, "0"), RX, sy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    lines.forEach((line, j) => doc.text(line, RX + 9, sy + j * 4.4));
    sy += lines.length * 4.4 + 2;
  });
  y = Math.max(py, sy) + 4;

  // ── Footer on every page
  const link = input.configuratorUrl ?? "https://woolet.co/en/bespoke/configurator";
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(M, 281, M + CW, 281);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Continue your build:", M, 287);
    doc.setTextColor(...GOLD);
    doc.textWithLink(link.replace(/^https?:\/\//, ""), M + 29, 287, { url: link });
    doc.setTextColor(...MUTED);
    doc.text(`support@woolet.co    ·    ${i} / ${pages}`, M + CW, 287, { align: "right" });
  }

  return doc;
}

export const productCardFileName = (config: BespokeConfig, buildRef?: string | null) => {
  const frame = findFrame(config.frameId);
  const slug = (frame?.name ?? "bespoke").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const ref = buildRef ? `-${buildRef.slice(-6)}` : "";
  return `Woolet-Bespoke-${slug}${ref}.pdf`;
};

export async function downloadProductCard(input: ProductCardInput): Promise<void> {
  const doc = await buildProductCard(input);
  doc.save(productCardFileName(input.config, input.buildRef));
}
