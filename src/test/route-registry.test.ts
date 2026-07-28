/**
 * Regression tests for src/i18n/routeRegistry.ts.
 *
 * DEFECT 1 — many-to-one anchors: /en/collection is referenced by six
 * ROUTES entries (the canonical `collection` cluster + five DE landing
 * pages). The previous PATH_TO_KEY overwrote earlier entries and left
 * only the last DE landing reachable, dropping fr/nl from the hreflang
 * block. These tests lock the corrected resolution rules.
 *
 * DEFECT 2 — EN_ONLY_PATH_PREFIXES contradicted ROUTES. `/bespoke` was
 * hand-listed as EN-only even though ROUTES.bespoke has a real `ja`
 * entry, so localePath("ja","/bespoke") silently returned /en/bespoke.
 */
import { describe, it, expect } from "vitest";
import {
  keyForPath,
  keysForPath,
  hreflangAlternates,
  localePath,
} from "@/i18n/routeRegistry";

const SITE = "https://woolet.co";

describe("routeRegistry — DEFECT 1 (many-to-one anchors)", () => {
  it("keysForPath('/en/collection') exposes the canonical cluster + every landing", () => {
    const keys = keysForPath("/en/collection");
    // canonical `collection` entry MUST be present (was clobbered before)
    expect(keys).toContain("collection");
    // and the five DE landings that also anchor /en/collection
    expect(keys).toContain("landing.collection.de.breite-brille");
    expect(keys).toContain("landing.collection.de.xxl-brille-herren");
    // NL landing too
    expect(keys).toContain("landing.collection.nl");
  });

  it("keyForPath('/en/collection') resolves to the canonical (non-landing) entry", () => {
    expect(keyForPath("/en/collection")).toBe("collection");
  });

  it("hreflangAlternates('/en/collection') emits en + fr + nl + x-default (no DE landing leaks in)", () => {
    const alts = hreflangAlternates("/en/collection", SITE);
    expect(alts).not.toBeNull();
    const langs = alts!.map((a) => a.lang).sort();
    expect(langs).toEqual(["en", "fr", "nl", "x-default"].sort());
    expect(alts!.find((a) => a.lang === "fr")?.href).toBe(`${SITE}/fr/collection`);
    expect(alts!.find((a) => a.lang === "nl")?.href).toBe(`${SITE}/nl/collection`);
    expect(alts!.find((a) => a.lang === "x-default")?.href).toBe(
      `${SITE}/en/collection`,
    );
  });

  it("hreflangAlternates('/en/bespoke') emits en + ja + x-default only", () => {
    const alts = hreflangAlternates("/en/bespoke", SITE);
    expect(alts).not.toBeNull();
    const langs = alts!.map((a) => a.lang).sort();
    expect(langs).toEqual(["en", "ja", "x-default"].sort());
  });

  it("hreflangAlternates('/de/breite-brille') → de + en + x-default (its own landing pair)", () => {
    const alts = hreflangAlternates("/de/breite-brille", SITE);
    expect(alts).not.toBeNull();
    const map = Object.fromEntries(alts!.map((a) => [a.lang, a.href]));
    expect(map.de).toBe(`${SITE}/de/breite-brille`);
    expect(map.en).toBe(`${SITE}/en/collection`);
    expect(map["x-default"]).toBe(`${SITE}/en/collection`);
    expect(Object.keys(map).sort()).toEqual(["de", "en", "x-default"].sort());
  });

  it("hreflangAlternates('/en/about') returns null (single-locale page, no cluster)", () => {
    expect(hreflangAlternates("/en/about", SITE)).toBeNull();
  });
});

describe("routeRegistry — DEFECT 2 (EN_ONLY vs ROUTES contradiction)", () => {
  it("localePath('ja','/bespoke') returns /ja/bespoke — not /en/bespoke", () => {
    expect(localePath("ja", "/bespoke")).toBe("/ja/bespoke");
  });

  it("localePath falls back to /en for locales without a translation", () => {
    expect(localePath("pl", "/bespoke")).toBe("/en/bespoke");
  });

  it("localePath honours partial clusters derived from ROUTES", () => {
    expect(localePath("fr", "/collection")).toBe("/fr/collection");
    expect(localePath("nl", "/collection")).toBe("/nl/collection");
    expect(localePath("de", "/collection")).toBe("/en/collection");
  });
});
