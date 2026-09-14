// Two scans that agree are the only honest evidence that a number is right.
// This compares the two most recent scans of an order, per measurement, and
// turns the largest difference into a verdict.
//
// Mirror of src/lib/scan-repeatability.ts — keep in step.

export type ScanRow = {
  measurement_ref?: string | null;
  scan_id?: string | null;
  created_at?: string | null;
  source?: string | null;
  status?: string | null;
  temple_to_temple_mm?: number | null;
  face_width_mm?: number | null;
  pd_mm?: number | null;
  nose_bridge_width_mm?: number | null;
};

export type RepeatabilityRow = {
  label: string;
  a: number;
  b: number;
  delta: number;
};

export type Repeatability =
  | { kind: "single"; line: string }
  | {
      kind: "compared";
      refA: string;
      refB: string;
      verdict: "agree" | "review" | "disagree";
      rows: RepeatabilityRow[];
      line: string;
    };

export const AGREE_MM = 2;
export const REVIEW_MM = 4;

const PAIRS: Array<[string, keyof ScanRow]> = [
  ["temple-to-temple", "temple_to_temple_mm"],
  ["face width", "face_width_mm"],
  ["PD", "pd_mm"],
  ["inner-canthal", "nose_bridge_width_mm"],
];

const label = (s: ScanRow) => s.measurement_ref || s.scan_id || "unreferenced scan";

/** Newest first. */
export function sortScans(scans: ScanRow[]): ScanRow[] {
  return [...scans].sort(
    (x, y) => Date.parse(y.created_at ?? "") - Date.parse(x.created_at ?? ""),
  );
}

export function compareRepeatability(scans: ScanRow[]): Repeatability {
  const sorted = sortScans(scans);
  if (sorted.length < 2) {
    return { kind: "single", line: "One scan only - no repeatability check yet." };
  }
  const [a, b] = sorted;
  const rows: RepeatabilityRow[] = [];
  for (const [name, key] of PAIRS) {
    const va = a[key];
    const vb = b[key];
    if (typeof va !== "number" || typeof vb !== "number") continue;
    rows.push({
      label: name,
      a: va,
      b: vb,
      delta: Math.round(Math.abs(va - vb) * 10) / 10,
    });
  }
  const largest = rows.reduce((m, r) => Math.max(m, r.delta), 0);
  const verdict = rows.length === 0 ? "review" : largest <= AGREE_MM ? "agree" : largest <= REVIEW_MM ? "review" : "disagree";
  const refA = label(a);
  const refB = label(b);
  const detail = rows.map((r) => `${r.label} ${r.a} vs ${r.b} (${r.delta} mm)`).join(" · ");
  return {
    kind: "compared",
    refA,
    refB,
    verdict,
    rows,
    line: `Repeatability - scan ${refA} vs ${refB}: ${detail || "no comparable measurements"} → ${verdict}`,
  };
}
