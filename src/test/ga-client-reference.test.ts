import { describe, it, expect, beforeEach } from "vitest";
import { withGaClientReference, withGaPaymentLink } from "@/lib/ga-ids";
import { parseGaClientReference } from "../../supabase/functions/_shared/ga-client-reference";

const clearCookies = () => {
  for (const c of document.cookie.split("; ")) {
    const name = c.split("=")[0];
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};

describe("GA ids in Stripe Payment Link client_reference_id", () => {
  beforeEach(clearCookies);

  it("round-trips client and session id through the webhook parser", () => {
    document.cookie = "_ga=GA1.1.123456789.1700000000; path=/";
    document.cookie = "_ga_SYJZL72DWB=GS2.1.s1760990000$o3$g1$t1760990100$j0$l0$h0; path=/";
    const ref = withGaClientReference("de_fit_result");
    expect(ref).toBe("de_fit_result__ga_123456789_1700000000_1760990000");
    expect(ref).toMatch(/^[A-Za-z0-9_-]{1,200}$/);
    expect(parseGaClientReference(ref)).toEqual({
      base: "de_fit_result",
      gaClientId: "123456789.1700000000",
      gaSessionId: "1760990000",
    });
  });

  it("keeps the base ref untouched without a _ga cookie and never doubles the suffix", () => {
    expect(withGaClientReference("de_x")).toBe("de_x");
    document.cookie = "_ga=GA1.1.1.2; path=/";
    expect(withGaClientReference("de_x__ga_9_9_9")).toBe("de_x__ga_1_2");
    expect(parseGaClientReference("ml-a-e2")).toEqual({ base: "ml-a-e2" });
  });

  it("sets client_reference_id on buy.stripe.com links and keeps existing params", () => {
    document.cookie = "_ga=GA1.1.42.43; path=/";
    const out = new URL(withGaPaymentLink("https://buy.stripe.com/abc?client_reference_id=de_hero&market=de"));
    expect(out.searchParams.get("client_reference_id")).toBe("de_hero__ga_42_43");
    expect(out.searchParams.get("market")).toBe("de");
    const plain = new URL(withGaPaymentLink("https://buy.stripe.com/abc?prefilled_email=a%40b.co", "site_payments"));
    expect(plain.searchParams.get("client_reference_id")).toBe("site_payments__ga_42_43");
    expect(plain.searchParams.get("prefilled_email")).toBe("a@b.co");
  });
});
