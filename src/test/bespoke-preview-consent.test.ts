import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  PREVIEW_CONSENT_TEXT,
  PREVIEW_CONSENT_VERSION,
  previewConsentLocale,
  previewConsentPayload,
} from "@/lib/bespoke-preview-consent";

describe("on-face preview consent", () => {
  it("sends nothing unless the customer ticked the box", () => {
    expect(previewConsentPayload(false)).toEqual({});
    expect(previewConsentPayload(false, "pl")).toEqual({});
  });
  it("sends the exact wording shown, in the language shown", () => {
    expect(previewConsentPayload(true, "pl")).toEqual({
      previewConsentGiven: true,
      previewConsentText: PREVIEW_CONSENT_TEXT.pl,
      previewConsentVersion: PREVIEW_CONSENT_VERSION,
    });
  });
  it("shows Polish only to a browser set to Polish", () => {
    expect(previewConsentLocale("pl-PL")).toBe("pl");
    expect(previewConsentLocale("pl")).toBe("pl");
    for (const other of ["en-US", "de-DE", "el-GR", "", null, undefined]) {
      expect(previewConsentLocale(other as string | null)).toBe("en");
    }
  });
  it("names the new recipient and says the order does not depend on it", () => {
    expect(PREVIEW_CONSENT_TEXT.en).toContain("AI image service");
    expect(PREVIEW_CONSENT_TEXT.en).toContain("Saying no changes nothing about my order");
  });
  it("is never pre-ticked on either page", () => {
    for (const page of ["src/pages/bespoke/Measurements.tsx", "src/pages/bespoke/Photo.tsx"]) {
      const src = readFileSync(page, "utf8");
      expect(src).toContain("const [previewConsent, setPreviewConsent] = useState(false);");
      expect(src).not.toMatch(/defaultChecked/);
    }
  });
  it("is cleared by a new front photo sent without the box", () => {
    const fn = readFileSync("supabase/functions/bespoke-photo-submit/index.ts", "utf8");
    expect(fn).toContain("preview_consent_at: previewConsent?.preview_consent_at ?? null");
    expect(fn).toContain('body?.previewConsentGiven === true');
  });
});
