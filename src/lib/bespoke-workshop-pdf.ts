/**
 * Workshop production report (PDF) for the bespoke manufacturer.
 * Client-side only — built from the order summary + submitted measurements.
 */

export type WorkshopReportData = {
  sessionId: string;
  orderCreatedAt?: string | null;
  frameName?: string | null;
  frontCode?: string | null;
  templeCode?: string | null;
  finishId?: string | null;
  lensType?: string | null;
  engravingText?: string | null;
  amountLabel?: string | null;
  customerRef?: string | null;
  requestedTempleLength?: string | null;
  aiPreviewUrl?: string | null;
  consent?: {
    grantedAt?: string | null;
    withdrawnAt?: string | null;
    version?: string | null;
    locale?: string | null;
  } | null;
  measurements: {
    ai: Record<string, string>;
    manual: Record<string, string>;
    aiNotes?: string | null;
    manualNotes?: string | null;
  };
};

const INK: [number, number, number] = [31, 27, 22];
const GOLD: [number, number, number] = [202, 164, 73];
const MUTED: [number, number, number] = [122, 112, 98];

const formatDateTime = (value?: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date) + " UTC";
};

async function loadImage(url: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#EFE9DF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.9), w: bitmap.width, h: bitmap.height };
  } catch {
    return null;
  }
}

export async function downloadWorkshopReport(data: WorkshopReportData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const M = 18;
  const W = 210;
  const CW = W - M * 2;
  let y = 0;

  const preview = data.aiPreviewUrl ? await loadImage(data.aiPreviewUrl) : null;

  // Header band
  doc.setFillColor(8, 8, 7);
  doc.rect(0, 0, W, 46, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("W O O L E T   B E S P O K E   ·   P R O D U C T I O N   S H E E T", M, 20);
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.setTextColor(237, 231, 217);
  doc.text(data.frameName || "Woolet Bespoke", M, 33);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(154, 142, 126);
  doc.text(
    `Order ref ${data.sessionId}    ·    Report issued ${formatDateTime(new Date().toISOString())}`,
    M,
    40,
  );

  y = 60;

  const heading = (label: string) => {
    if (y > 250) {
      doc.addPage();
      y = 24;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(label.toUpperCase(), M, y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(M, y + 2.5, M + 12, y + 2.5);
    y += 10;
  };

  const rows = (pairs: [string, string][]) => {
    doc.setFontSize(10);
    pairs.forEach(([k, v]) => {
      if (y > 275) {
        doc.addPage();
        y = 24;
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(k, M, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text(v || "—", M + 78, y);
      doc.setDrawColor(226, 220, 210);
      doc.setLineWidth(0.2);
      doc.line(M, y + 2.4, M + CW, y + 2.4);
      y += 8;
    });
    y += 6;
  };

  const paragraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.splitTextToSize(text, CW).forEach((line: string) => {
      if (y > 278) {
        doc.addPage();
        y = 24;
      }
      doc.text(line, M, y);
      y += 5.6;
    });
    y += 8;
  };

  heading("Build specification");
  rows([
    ["Model / pattern", data.frameName || "—"],
    ["Front acetate", data.frontCode || "—"],
    ["Temple acetate", data.templeCode || "—"],
    ["Finish", data.finishId || "—"],
    ["Lenses", data.lensType || "—"],
    ["Engraving", data.engravingText ? `"${data.engravingText}"` : "None"],
    ["Temple length requested", data.requestedTempleLength || "—"],
    ["Order value", data.amountLabel || "—"],
    ["Customer reference", data.customerRef || "—"],
    ["Order date", formatDateTime(data.orderCreatedAt)],
  ]);

  heading("Customer consent record");
  rows([
    ["Consent status", data.consent?.grantedAt && !data.consent.withdrawnAt ? "Granted" : data.consent?.withdrawnAt ? "Withdrawn" : "Not recorded"],
    ["Consent recorded at", formatDateTime(data.consent?.grantedAt)],
    ["Consent withdrawn at", formatDateTime(data.consent?.withdrawnAt)],
    ["Consent version", data.consent?.version || "—"],
    ["Displayed language", data.consent?.locale?.toUpperCase() || "—"],
  ]);

  const aiPairs = Object.entries(data.measurements.ai).filter(([, v]) => v) as [string, string][];
  heading("Customer measurements — AI scan");
  rows(aiPairs.length ? aiPairs : [["No AI scan values submitted", "—"]]);
  if (data.measurements.aiNotes) paragraph(`Scan notes: ${data.measurements.aiNotes}`);

  const manualPairs = Object.entries(data.measurements.manual).filter(([, v]) => v) as [string, string][];
  heading("Customer measurements — manual");
  rows(manualPairs.length ? manualPairs : [["No manual values submitted", "—"]]);
  if (data.measurements.manualNotes) paragraph(`Workshop notes: ${data.measurements.manualNotes}`);

  heading("Cutting rule");
  paragraph(
    "Where AI and manual values differ, cut to the tighter of the two and confirm with the optician before milling. Front width tolerance ±1 mm, bridge ±0.5 mm, temple length ±2 mm. Hand made in the EU from Italian Mazzucchelli acetate.",
  );

  if (preview) {
    heading("Approved visualisation");
    const maxW = CW;
    const maxH = 70;
    const scale = Math.min(maxW / preview.w, maxH / preview.h);
    const w = preview.w * scale;
    const h = preview.h * scale;
    if (y + h > 278) {
      doc.addPage();
      y = 24;
    }
    doc.setFillColor(239, 233, 223);
    doc.rect(M, y - 4, CW, h + 8, "F");
    doc.addImage(preview.dataUrl, "JPEG", M + (CW - w) / 2, y, w, h);
    y += h + 14;
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Woolet · JAY23 LLC · support@woolet.co    ·    Page ${i} of ${pages}`,
      M,
      289,
    );
  }

  doc.save(`Woolet-Bespoke-Workshop-${data.sessionId.slice(-10)}.pdf`);
}
