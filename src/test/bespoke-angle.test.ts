import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FEATURED_RENDER_KEYS, ANGLE_PROMPT_VERSION, COMPOSITION_REFERENCE_ROW_ID } from "@/data/bespoke-featured-renders";
import { COMPOSITION_RULES, COMPOSITION_REFERENCE_URL } from "../../supabase/functions/_shared/bespoke-composition";

describe("fixed-angle Bespoke renders", () => {
  it("pins four exact combinations including the original Round reference", () => {
    expect(FEATURED_RENDER_KEYS).toHaveLength(4);
    expect(FEATURED_RENDER_KEYS[3]).toBe("v2|round|a332 1203|3102 7110|brushed|plano|-");
    expect(ANGLE_PROMPT_VERSION).toBe("angle-v2");
    expect(COMPOSITION_REFERENCE_ROW_ID).toBe("065edb57-0dee-427f-8299-fbfd7afac22d");
    expect(FEATURED_RENDER_KEYS.slice(0, 3).every((k) => k.endsWith("|matte|plano|-"))).toBe(true);
  });
  it("assigns geometry and composition references separately", () => {
    expect(COMPOSITION_RULES).toContain("Image 1 is the geometry authority");
    expect(COMPOSITION_RULES).toContain("Never copy its shape, colours, finish or lenses");
    expect(COMPOSITION_REFERENCE_URL).toContain("brushed-plano-06b46be2.png");
    expect(COMPOSITION_RULES).toContain("front at lower left, temples receding to the upper right, camera about 20 degrees above");
    const source = readFileSync("supabase/functions/bespoke-preview-render/index.ts", "utf8");
    expect(source).toContain("[patternUrl, COMPOSITION_REFERENCE_URL, ...(aviator ? AVIATOR_CONSTRUCTION_REFERENCES : [])]");
    expect(source).toContain("if (cached && !regenerationId)");
    expect(source).toContain('Admin authorization required');
    expect(source).toContain('row.storage_path.endsWith("brushed-plano-06b46be2.png")');
    expect(source).not.toContain("1fff96e7");
  });
});