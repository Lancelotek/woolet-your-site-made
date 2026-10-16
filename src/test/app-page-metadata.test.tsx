import { describe, it, expect } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Link } from "react-router-dom";
import { getAllRoutes, getMetadata, renderHeadHtml } from "@/seo/metadata";
import SEO from "@/components/SEO";
import { readFileSync } from "node:fs";
import { ALL_REDIRECTS } from "@/seo/legacyRedirects";

describe("registered app page metadata", () => {
  it("covers every concrete App route except root and deliberate NotFound routes", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    const routes = new Set(getAllRoutes());
    for (const [, pattern] of app.matchAll(/<Route\s+path="([^"]+)"/g)) {
      if (pattern.includes("*") || pattern === "/") continue;
      const paths = pattern.startsWith("/:lang")
        ? ["en", "pl", "fr", "es", "de", "ar", "ja", "nl", "ko"].map(l => pattern.replace("/:lang", `/${l}`))
        : [pattern];
      for (const path of paths) {
        if (path.includes(":") || /\/[a-z]{2}\/crm(?:\/|$)/.test(path) || ALL_REDIRECTS[path]) continue;
        expect(routes.has(path), path).toBe(true);
        expect(getMetadata(path).title, path).not.toMatch(/Page not found/);
      }
    }
  });

  it.each([
    ["/en/bespoke/configurator", "Bespoke Configurator - Woolet", "index, follow"],
    ["/en/bespoke/checkout", "Secure checkout · Woolet Bespoke", "noindex, follow"],
    ["/en/reserve", "Reserve your founder price - Woolet", "noindex, nofollow"],
    ["/en/bespoke/scan", "Bespoke Scan - Woolet", "noindex, follow"],
    ["/en/bespoke/measurements", "Submit your measurements · Woolet Bespoke", "noindex, follow"],
    ["/en/bespoke/photo", "Fit photo - Woolet Bespoke", "noindex, follow"],
    ["/en/bespoke/shipping", "Shipping address · Woolet Bespoke", "noindex, follow"],
    ["/en/measure", "Measurement", "noindex, nofollow"],
    ["/en/fit/wizard", "FitLens Wizard - Measure Your Face | Woolet", "noindex, follow"],
  ])("renders correct static head for %s", (route, title, robots) => {
    expect(getAllRoutes()).toContain(route);
    const meta = getMetadata(route);
    expect(meta.title).toBe(title);
    expect(meta.robots).toBe(robots);
    expect(renderHeadHtml(meta)).toContain(`<title data-seo="prerender">${title}</title>`);
    expect(meta.canonical).toBe(`https://woolet.co${route}`);
  });

  it("updates title on client navigation even when a page omitted its path prop", async () => {
    document.head.innerHTML = "";
    const view = render(<HelmetProvider><MemoryRouter initialEntries={["/en/bespoke/configurator"]}>
      <SEO title="Old collection title" description="Old description" />
      <Link to="/en/bespoke/checkout">Checkout</Link>
    </MemoryRouter></HelmetProvider>);
    await waitFor(() => expect(document.title).toBe("Bespoke Configurator - Woolet"));
    view.getByText("Checkout").click();
    await waitFor(() => expect(document.title).toBe("Secure checkout · Woolet Bespoke"));
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://woolet.co/en/bespoke/checkout");
    cleanup();
  });
});