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

// "145–162 mm", "145 mm to 162 mm", "150–172 mm" … anything that is not 145–172.
const RANGE = /(\d{3})\s?(?:mm)?\s?(?:–|—|-|to)\s?(\d{3})\s?mm/g;

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
        if (file.includes("src/test/")) continue;
        const text = readFileSync(file, "utf-8");
        for (const line of text.split("\n")) {
          if (!/bespoke/i.test(line)) continue;
          for (const m of line.matchAll(RANGE)) {
            const [min, max] = [Number(m[1]), Number(m[2])];
            if (max !== 172) continue; // only ranges that top out at the bespoke max
            if (min !== 145) offenders.push(`${file}: ${m[0]}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
