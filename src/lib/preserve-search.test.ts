import { describe, expect, it } from "vitest";
import { preserveSearch } from "./preserve-search";

describe("preserveSearch", () => {
  it("keeps utm_source, gclid and fbclid exactly as they arrived", () => {
    const search = "?utm_source=facebook&utm_medium=paid&gclid=abc&fbclid=fb.1";
    expect(preserveSearch("/en", search, "#fit")).toBe(
      "/en?utm_source=facebook&utm_medium=paid&gclid=abc&fbclid=fb.1#fit",
    );
  });

  it("does not rewrite a target that already has a query", () => {
    expect(preserveSearch("/en?utm_source=meta", "?utm_source=facebook", "")).toBe("/en?utm_source=meta");
  });
});
