import { describe, expect, it } from "vitest";
import { isDePage, routesToDeGroup } from "../../supabase/functions/_shared/de-lead-routing";

describe("isDePage", () => {
  it("matches /de and /de/* paths", () => {
    expect(isDePage("https://woolet.co/de")).toBe(true);
    expect(isDePage("https://woolet.co/de/fit?utm_source=meta")).toBe(true);
    expect(isDePage("https://woolet.co/de/bespoke")).toBe(true);
  });
  it("ignores other languages and look-alike paths", () => {
    expect(isDePage("https://woolet.co/en/fit")).toBe(false);
    expect(isDePage("https://woolet.co/design")).toBe(false);
    expect(isDePage("https://woolet.co/en/blog/de-something")).toBe(false);
    expect(isDePage(undefined)).toBe(false);
    expect(isDePage("")).toBe(false);
  });
});

describe("routesToDeGroup", () => {
  it("routes the explicit DE source anywhere", () => {
    expect(routesToDeGroup("DE", "https://woolet.co/en")).toBe(true);
    expect(routesToDeGroup("de", undefined)).toBe(true);
  });
  it("routes shared forms used on German pages", () => {
    expect(routesToDeGroup("scan", "https://woolet.co/de/fit")).toBe(true);
    expect(routesToDeGroup("fitlens", "https://woolet.co/de/fit")).toBe(true);
    expect(routesToDeGroup("bespoke", "https://woolet.co/de/bespoke")).toBe(true);
    expect(routesToDeGroup(undefined, "https://woolet.co/de")).toBe(true);
  });
  it("keeps design saves and Kickstarter in their own groups", () => {
    expect(routesToDeGroup("bespoke_save", "https://woolet.co/de/bespoke")).toBe(false);
    expect(routesToDeGroup("kickstarter", "https://woolet.co/de/lp/kickstarter")).toBe(false);
  });
  it("leaves English pages alone", () => {
    expect(routesToDeGroup("scan", "https://woolet.co/en/fit")).toBe(false);
    expect(routesToDeGroup("bespoke", "https://woolet.co/en/bespoke")).toBe(false);
  });
});
