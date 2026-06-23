import { describe, it, expect } from "vitest";
import { mapUtmsToFields } from "@/components/VipPopup";

describe("VipPopup · mapUtmsToFields", () => {
  it("maps known UTM keys to fields[utm_*]", () => {
    const out = mapUtmsToFields({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "launch",
      utm_content: "hero",
      utm_term: "wide-glasses",
    });
    expect(out).toEqual({
      "fields[utm_source]": "google",
      "fields[utm_medium]": "cpc",
      "fields[utm_campaign]": "launch",
      "fields[utm_content]": "hero",
      "fields[utm_term]": "wide-glasses",
    });
  });

  it("ignores unknown keys and empty values", () => {
    const out = mapUtmsToFields({
      utm_source: "google",
      utm_bogus: "x",
      utm_campaign: "",
    } as Record<string, string>);
    expect(out).toEqual({ "fields[utm_source]": "google" });
  });

  it("returns empty object when no UTMs present", () => {
    expect(mapUtmsToFields({})).toEqual({});
  });
});
