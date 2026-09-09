import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { BESPOKE_SPEC, BESPOKE_FRONT_WIDTH_RANGE } from "@/lib/bespoke-spec";

/**
 * Guards the bespoke FRONT WIDTH range (145–172 mm) against drift.
 * Temple length (145–155 mm) and bridge (20–24 mm) are different
 * measurements and are intentionally not matched here.
 */
const ROOTS = ["src", "scripts", "public/llms.txt", "public/llms-full.txt", "index.html"];
const EXTS = [".ts", ".tsx", ".mjs", ".js", ".txt", ".html", ".json", ".xml"];

function walk(p: string, out: string[] = []): string[] {
  let st;
  try {
    st = statSync(p);
  } catch {
    return out;
  }
  if (st.isFile()) {
    if (EXTS.some((e) => p.endsWith(e))) out.push(p);
    return out;
  }
  for (const entry of readdirSync(p)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    walk(join(p, entry), out);
  }
  return out;
}

// Ways the bespoke front width has been mis-stated in the past. Sub-bands
// like "162–172 mm" are legitimate (a slice of the range), so only literal
// wrong full-range statements are matched.
const BAD_RANGES = [
  "150–172",
  "150-172",
  "150 mm and 172",
  "150 mm to 172",
  "145–162 mm",
  "145-162 mm",
  "145 mm to 162",
  "145 mm and 162",
];

describe("bespoke front width range", () => {
  it("exposes 145–172 mm", () => {
    expect(BESPOKE_SPEC.frontWidthMin).toBe(145);
    expect(BESPOKE_SPEC.frontWidthMax).toBe(172);
    expect(BESPOKE_FRONT_WIDTH_RANGE).toBe("145–172 mm");
  });

  it("has no page string stating a bespoke front width other than 145–172 mm", () => {
    const offenders: string[] = [];
    for (const root of ROOTS) {
      for (const file of walk(root)) {
        if (file.includes("src/test/") || file.includes("src/config/redirects")) continue;
        const text = readFileSync(file, "utf-8");
        text.split("\n").forEach((line, i) => {
          for (const bad of BAD_RANGES) {
            if (line.includes(bad)) offenders.push(`${file}:${i + 1} — ${bad}`);
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  });
});

