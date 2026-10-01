import { describe, expect, it } from "vitest";
import { classifyTouch } from "./journey";
describe("classifyTouch", () => {
  it("utm wins", () => expect(classifyTouch("?utm_source=meta&utm_medium=paid_social&utm_campaign=test_first", "", "/en/lp/kickstarter")).toMatchObject({ source: "meta", medium: "paid_social", campaign: "test_first" }));
  it("google organic", () => expect(classifyTouch("", "https://www.google.com/", "/en")).toMatchObject({ source: "google", medium: "organic" }));
  it("chatgpt ai", () => expect(classifyTouch("?utm_source=chatgpt.com", "", "/en")).toMatchObject({ medium: "ai" }));
  it("gclid", () => expect(classifyTouch("?gclid=x", "", "/en")).toMatchObject({ source: "google", medium: "cpc" }));
  it("self referral is direct", () => expect(classifyTouch("", "https://woolet.co/en", "/en")).toMatchObject({ source: "(direct)" }));
  it("stripe return ignored", () => expect(classifyTouch("", "https://checkout.stripe.com/x", "/en")).toBeNull());
});
