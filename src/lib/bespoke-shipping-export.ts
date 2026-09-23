// Shipping export for the Bespoke admin panel. One workbook per download,
// covering whatever rows the panel currently has loaded. exceljs is used
// deliberately: the community SheetJS build drops cell styling, so the header
// fill, the MISSING markers and the hand-filled columns would ship unformatted.

import { bespokeOrderGaps, bespokeShippingStatus, lensWithStrength } from "./bespoke-gaps";
import { crmStageLabel, crmStageOf } from "./bespoke-crm";

const FONT = { name: "Arial", size: 10 } as const;
const HEADER_FILL = "FFCAA449";
const HANDFILL = "FFFFFDE7";
const MISSING_COLOUR = "FFC13A2E";

export const CONTENTS_LINE = "1 x prescription frames with lenses, acetate";
export const ORIGIN_LINE = "Greece (EU)";
export const HS_CODE = "9004.90";

type Order = Record<string, any>;

const COLUMNS: { header: string; width: number; wrap?: boolean; handFilled?: boolean }[] = [
  { header: "Order ref", width: 14 },
  { header: "Status", width: 14 },
  { header: "Pipeline stage", width: 24 },
  { header: "Paid on", width: 12 },
  { header: "Recipient", width: 24 },
  { header: "Phone", width: 18 },
  { header: "Email", width: 28 },
  { header: "Street and number", width: 30 },
  { header: "City", width: 18 },
  { header: "State / province", width: 18 },
  { header: "Postal code", width: 12 },
  { header: "Country", width: 20 },
  { header: "Address confirmed", width: 16 },
  { header: "Contents", width: 34, wrap: true },
  { header: "Model", width: 22 },
  { header: "Front", width: 22, wrap: true },
  { header: "Temples", width: 22, wrap: true },
  { header: "Finish", width: 16 },
  { header: "Lenses", width: 16 },
  { header: "Lens colour code", width: 18 },
  { header: "Engraving", width: 20 },
  { header: "Temple length", width: 14 },
  { header: "Declared value", width: 14 },
  { header: "Currency", width: 10 },
  { header: "Origin", width: 14 },
  { header: "HS code", width: 10 },
  { header: "Courier", width: 16, handFilled: true },
  { header: "Tracking number", width: 22, handFilled: true },
  { header: "Weight (kg)", width: 12, handFilled: true },
  { header: "Ship date", width: 12, handFilled: true },
  { header: "Note", width: 30, wrap: true, handFilled: true },
  { header: "Outstanding gaps", width: 60, wrap: true },
  { header: "Payment ref", width: 50 },
];

const MISSING = "MISSING";

const s = (v: unknown) => (v == null || v === "" ? "" : String(v).trim());

const dateOnly = (v: unknown) => {
  if (!v) return "";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export const orderRef = (id: unknown) => `WLT-${String(id ?? "").slice(0, 8).toUpperCase()}`;

const countryCell = (code: unknown) => {
  const iso = s(code).toUpperCase();
  if (!iso) return "";
  let name = iso;
  try {
    name = new Intl.DisplayNames(["en"], { type: "region" }).of(iso) ?? iso;
  } catch {
    /* keep the code */
  }
  return `${name} (${iso})`;
};

function rowValues(o: Order): (string | number)[] {
  const street = [s(o.shipping_line1), s(o.shipping_line2)].filter(Boolean).join(" ");
  const gaps = bespokeOrderGaps(o);
  return [
    orderRef(o.id),
    bespokeShippingStatus(o),
    `${crmStageOf(o)}/6 ${crmStageLabel(crmStageOf(o))}`,
    dateOnly(o.created_at),
    s(o.shipping_name),
    s(o.shipping_phone) || MISSING,
    s(o.customer_email),
    street,
    s(o.shipping_city) || MISSING,
    s(o.shipping_state),
    s(o.shipping_postal_code),
    countryCell(o.shipping_country),
    o.shipping_submitted_at ? "yes" : "no",
    CONTENTS_LINE,
    s(o.frame_name),
    s(o.front_code),
    s(o.temple_code),
    s(o.finish_id),
    lensWithStrength(o),
    s(o.lens_tint_code),
    s(o.engraving_text),
    s(o.metadata?.temple_length),
    o.amount_cents == null ? "" : Number(o.amount_cents) / 100,
    s(o.currency).toUpperCase(),
    ORIGIN_LINE,
    HS_CODE,
    s(o.tracking_number),
    o.parcel_weight_kg == null || o.parcel_weight_kg === "" ? "" : Number(o.parcel_weight_kg),
    dateOnly(o.shipped_at),
    s(o.dispatch_note),
    gaps.join(" | "),
    s(o.stripe_session_id),
  ];
}

const fileStamp = () => new Date().toISOString().slice(0, 10);

function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export async function exportShippingXlsx(orders: Order[]) {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new (ExcelJS as any).Workbook();

  const sheet = wb.addWorksheet("Shipping");
  sheet.columns = COLUMNS.map((c) => ({ header: c.header, width: c.width }));

  const header = sheet.getRow(1);
  header.height = 30;
  header.font = { ...FONT, bold: true, color: { argb: "FF000000" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  header.alignment = { vertical: "middle", wrapText: true };

  orders.forEach((o) => sheet.addRow(rowValues(o)));

  const lastRow = Math.max(2, sheet.rowCount);
  const missingCols = [6, 9]; // Phone, City

  for (let r = 2; r <= sheet.rowCount; r += 1) {
    const row = sheet.getRow(r);
    row.font = FONT;
    COLUMNS.forEach((c, i) => {
      const cell = row.getCell(i + 1);
      if (c.wrap) cell.alignment = { wrapText: true, vertical: "top" };
      if (c.handFilled) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HANDFILL } };
      }
      if (c.header === "Declared value") cell.numFmt = "#,##0.00";
      if (missingCols.includes(i + 1) && cell.value === MISSING) {
        cell.font = { ...FONT, bold: true, color: { argb: MISSING_COLOUR } };
      }
    });
  }

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: lastRow, column: COLUMNS.length } };

  // Summary — every figure is a live formula over the Shipping sheet so the
  // numbers stay true after someone edits a row by hand.
  const sum = wb.addWorksheet("Summary");
  sum.columns = [{ width: 34 }, { width: 58 }];
  const statusRange = `Shipping!$B$2:$B$${lastRow}`;
  const rows: [string, string | { formula: string }][] = [
    ["Orders in this sheet", { formula: `COUNTA(Shipping!$A$2:$A$${lastRow})` }],
    ["Ready to ship", { formula: `COUNTIF(${statusRange},"Ready to ship")` }],
    ["On hold", { formula: `COUNTIF(${statusRange},"On hold")` }],
    ["Shipped", { formula: `COUNTIF(${statusRange},"Shipped")` }],
    ["Delivered", { formula: `COUNTIF(${statusRange},"Delivered")` }],
    ["Total declared value", { formula: `SUM(Shipping!$W$2:$W$${lastRow})` }],
    ["Missing a phone number", { formula: `COUNTIF(Shipping!$F$2:$F$${lastRow},"MISSING")` }],
    ["Missing a city", { formula: `COUNTIF(Shipping!$I$2:$I$${lastRow},"MISSING")` }],
    ["Addresses not confirmed", { formula: `COUNTIF(Shipping!$M$2:$M$${lastRow},"no")` }],
  ];
  rows.forEach(([label, value]) => {
    const row = sum.addRow([label, value]);
    row.font = FONT;
    row.getCell(1).font = { ...FONT, bold: true };
  });
  sum.getCell(`B${6}`).numFmt = "#,##0.00";

  const note = (text: string, bold = false) => {
    const row = sum.addRow([text]);
    row.font = { ...FONT, bold };
    row.getCell(1).alignment = { wrapText: true, vertical: "top" };
    sum.mergeCells(`A${row.number}:B${row.number}`);
  };

  note("");
  note("Filled in by hand", true);
  note("Courier · Tracking number · Weight (kg) · Ship date · Note — the pale yellow columns.");
  note("Ship date: 2026-09-16 · Weight: 0.6 · Status values: Ready to ship, On hold, Shipped, Delivered.");
  note("");
  note("Customs", true);
  note('Describe the contents as "prescription frames with lenses, acetate" — never plain "glasses".');
  note(
    "HS 9004.90 is spectacles with lenses fitted; 9003.11 is bare plastic frames. Confirm the code with the courier before the first shipment.",
  );
  note(
    "Country of origin is Greece, where the frame is made. The acetate is Italian and belongs in the description only.",
  );
  note("A parcel leaving the EU needs a CN23 declaration and a proforma invoice in triplicate.");

  const buffer = await wb.xlsx.writeBuffer();
  download(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `Woolet-Bespoke-shipping-${fileStamp()}.xlsx`,
  );
}

const csvCell = (v: string | number) => {
  const text = v == null ? "" : String(v);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function exportShippingCsv(orders: Order[]) {
  const lines = [
    COLUMNS.map((c) => csvCell(c.header)).join(","),
    ...orders.map((o) => rowValues(o).map(csvCell).join(",")),
  ];
  download(
    new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }),
    `Woolet-Bespoke-shipping-${fileStamp()}.csv`,
  );
}
