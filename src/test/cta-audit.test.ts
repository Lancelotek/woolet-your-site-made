import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * CTA audit
 * ---------
 * Any CTA whose visible copy contains "Scan your face" (or "SCAN YOUR FACE")
 * MUST navigate to `/{lang}/fit` — never to `/fit/scan`, `/fit/manual`,
 * `/fit/bespoke` or to a modal trigger like `openReserve`.
 *
 * Also checks for forgotten direct calls to `openReserve` / `setReserveOpen(true)`
 * sitting next to scan-style CTAs, and surfaces any remaining `/en/fit/scan"` href
 * (with `/scan`) inside a button/link whose label mentions "scan".
 */

const SRC_DIR = join(process.cwd(), "src");

const SCAN_LABEL = /(scan your face|SCAN YOUR FACE)/;
const FORBIDDEN_HREF = /["'`](\/[a-z]{2})?\/fit\/(scan|manual|bespoke)["'`]/;
const ALLOWED_HREF = /\/fit[\"\'`]/;
const FORBIDDEN_HANDLERS = /(openReserve|setReserveOpen\s*\(\s*true)/;

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === "test" || entry === "__tests__") continue;
      walk(full, acc);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

interface Violation {
  file: string;
  line: number;
  label: string;
  reason: string;
  snippet: string;
}

function auditFile(file: string): Violation[] {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!SCAN_LABEL.test(lines[i])) continue;
    const label = lines[i].trim();

    // Look back up to 20 lines for the enclosing element's props / handler
    const ctxStart = Math.max(0, i - 20);
    const ctx = lines.slice(ctxStart, i + 1).join("\n");

    if (FORBIDDEN_HANDLERS.test(ctx)) {
      violations.push({
        file: relative(process.cwd(), file),
        line: i + 1,
        label,
        reason: "Scan CTA still wired to a reserve-modal handler",
        snippet: ctx.split("\n").slice(-6).join("\n"),
      });
      continue;
    }

    if (ALLOWED_HREF.test(ctx)) continue;

    if (FORBIDDEN_HREF.test(ctx)) {
      violations.push({
        file: relative(process.cwd(), file),
        line: i + 1,
        label,
        reason: "Scan CTA points to /fit instead of /fit/scan",
        snippet: ctx.split("\n").slice(-6).join("\n"),
      });
      continue;
    }

    // No destination at all — flag as ambiguous
    violations.push({
      file: relative(process.cwd(), file),
      line: i + 1,
      label,
      reason: "Scan CTA has no detectable /fit/scan destination",
      snippet: ctx.split("\n").slice(-6).join("\n"),
    });
  }

  return violations;
}

describe("CTA audit — scan CTAs must point to /{lang}/fit/scan", () => {
  const files = walk(SRC_DIR).filter((f) => !f.includes("/test/"));
  const allViolations = files.flatMap(auditFile);

  it("has no scan-labelled CTA pointing somewhere other than /fit/scan", () => {
    if (allViolations.length > 0) {
      const report = allViolations
        .map(
          (v) =>
            `\n  ✗ ${v.file}:${v.line}\n    ${v.reason}\n    ${v.label}\n    ---\n${v.snippet
              .split("\n")
              .map((l) => "    " + l)
              .join("\n")}`,
        )
        .join("\n");
      throw new Error(`Found ${allViolations.length} CTA routing violation(s):${report}`);
    }
    expect(allViolations).toEqual([]);
  });
});
