import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  PREVIEW_CONSENT_TEXT,
  PREVIEW_CONSENT_VERSION,
  previewConsentPayload,
} from "@/lib/bespoke-preview-consent";

describe("on-face preview consent", () => {
  it("sends nothing unless the customer ticked the box", () => {
    expect(previewConsentPayload(false)).toEqual({});
  });
  it("sends the exact wording shown", () => {
    expect(previewConsentPayload(true)).toEqual({
      previewConsentGiven: true,
      previewConsentText: PREVIEW_CONSENT_TEXT,
      previewConsentVersion: PREVIEW_CONSENT_VERSION,
    });
  });
  it("is English only on both upload pages, whatever the route or browser", () => {
    expect(PREVIEW_CONSENT_TEXT).not.toMatch(/[ąćęłńóśźż]/i);
    const photo = readFileSync("src/pages/bespoke/Photo.tsx", "utf8");
    expect(photo).toContain('const locale: keyof typeof CONSENT_TEXT = "en";');
    const form = readFileSync("src/pages/bespoke/Measurements.tsx", "utf8");
    expect(form).toContain("{PREVIEW_CONSENT_TEXT}");
  });
  it("names the new recipient and says the order does not depend on it", () => {
    expect(PREVIEW_CONSENT_TEXT).toContain("AI image service");
    expect(PREVIEW_CONSENT_TEXT).toContain("Saying no changes nothing about my order");
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
