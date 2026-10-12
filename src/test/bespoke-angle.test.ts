import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FEATURED_RENDER_KEYS } from "@/data/bespoke-featured-renders";
import { COMPOSITION_RULES } from "../../supabase/functions/_shared/bespoke-composition";

describe("fixed-angle Bespoke renders", () => {
  it("pins four exact combinations including the original Round reference", () => {
    expect(FEATURED_RENDER_KEYS).toHaveLength(4);
    expect(FEATURED_RENDER_KEYS[3]).toBe("v2|round|a332 1203|3102 7110|matte|plano|-");
    expect(FEATURED_RENDER_KEYS.slice(0, 3).every((k) => k.endsWith("|matte|plano|-"))).toBe(true);
  });
  it("assigns geometry and composition references separately", () => {
    expect(COMPOSITION_RULES).toContain("Image 1 is the geometry authority");
    expect(COMPOSITION_RULES).toContain("Never copy its shape, colours, finish or lenses");
    const source = readFileSync("supabase/functions/bespoke-preview-render/index.ts", "utf8");
    expect(source).toContain("[patternUrl, COMPOSITION_REFERENCE_URL, ...(aviator ? AVIATOR_CONSTRUCTION_REFERENCES : [])]");
    expect(source).toContain("if (cached && !regenerationId)");
    expect(source).toContain('Admin authorization required');
  });
});