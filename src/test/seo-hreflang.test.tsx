/**
 * Regression test: react-helmet-async does NOT traverse React Fragments as
 * direct children of <Helmet>. If SEO.tsx ever regresses back to wrapping
 * hreflang groups in <>...</>, the per-route <link rel="alternate"> tags
 * silently disappear from document.head. This test locks that behaviour.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import SEO from "@/components/SEO";

const SITE = "https://woolet.co";

const readAlternates = () =>
  Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
  ).map((l) => ({ hreflang: l.hreflang, href: l.href }));

const readCanonical = () =>
  document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;

const renderSEO = (props: React.ComponentProps<typeof SEO>) =>
  render(
    <HelmetProvider>
      <SEO {...props} />
    </HelmetProvider>
  );

beforeEach(() => {
  document.head.innerHTML = "";
});
afterEach(() => cleanup());

describe("SEO hreflang", () => {
  it("homepage (path='') emits the full 7-locale cluster + x-default → /en", async () => {
    renderSEO({ title: "Home", description: "d", lang: "en", path: "" });
    await waitFor(() => expect(readAlternates().length).toBeGreaterThan(0));

    const alts = readAlternates();
    const langs = alts.map((a) => a.hreflang).sort();
    expect(langs).toEqual(
      ["ar", "de", "en", "es", "fr", "ja", "nl", "pl", "x-default"].sort()
    );
    expect(alts.find((a) => a.hreflang === "x-default")?.href).toBe(`${SITE}/en`);
    expect(alts.find((a) => a.hreflang === "en")?.href).toBe(`${SITE}/en`);
  });

  it("non-home English-only route emits NO hreflang (single-locale cluster is noise)", async () => {
    renderSEO({
      title: "Compare Zenni",
      description: "d",
      lang: "en",
      path: "/compare/zenni-alternative",
    });
    // Give Helmet a tick to flush.
    await new Promise((r) => setTimeout(r, 50));

    const expected = `${SITE}/en/compare/zenni-alternative`;
    expect(readCanonical()).toBe(expected);
    // No hreflang block — the page has no translation cluster.
    expect(readAlternates()).toHaveLength(0);
  });

  it("shared route with availableLangs emits one link per locale + x-default", async () => {
    renderSEO({
      title: "Bespoke",
      description: "d",
      lang: "en",
      path: "/bespoke",
      availableLangs: ["en", "pl", "de"],
    });
    await waitFor(() => expect(readAlternates().length).toBeGreaterThan(0));

    const alts = readAlternates();
    expect(alts).toHaveLength(4); // 3 langs + x-default
    expect(alts.find((a) => a.hreflang === "pl")?.href).toBe(`${SITE}/pl/bespoke`);
    expect(alts.find((a) => a.hreflang === "de")?.href).toBe(`${SITE}/de/bespoke`);
    expect(alts.find((a) => a.hreflang === "x-default")?.href).toBe(
      `${SITE}/en/bespoke`
    );
  });

  it("respects per-locale slug overrides via `alternates`", async () => {
    renderSEO({
      title: "Bespoke",
      description: "d",
      lang: "en",
      path: "/bespoke",
      availableLangs: ["en", "fr"],
      alternates: { fr: "/lunettes-sur-mesure" },
    });
    await waitFor(() => expect(readAlternates().length).toBeGreaterThan(0));

    const alts = readAlternates();
    expect(alts.find((a) => a.hreflang === "fr")?.href).toBe(
      `${SITE}/fr/lunettes-sur-mesure`
    );
    expect(alts.find((a) => a.hreflang === "en")?.href).toBe(`${SITE}/en/bespoke`);
  });
});
