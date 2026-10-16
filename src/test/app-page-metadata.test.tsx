import { describe, it, expect } from "vitest";
import { render, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Link } from "react-router-dom";
import { getAllRoutes, getMetadata, renderHeadHtml } from "@/seo/metadata";
import SEO from "@/components/SEO";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { runInNewContext } from "node:vm";
import { ALL_REDIRECTS } from "@/seo/legacyRedirects";

const prerenderSource = readFileSync("scripts/prerender.mjs", "utf8");
const injectSource = prerenderSource.match(/function injectHead\(template, headHtml, noscriptHtml, route\) \{[\s\S]*?\n\}/)?.[0];
if (!injectSource) throw new Error("Production injectHead function not found");
const injectHead = runInNewContext(`${injectSource}; injectHead`, {
  localeFromRoute: (route: string) => route.split("/")[1],
  RTL_LOCALES: new Set(["ar"]),
  getNoscriptContent: (_route: string, content: string) => content,
}) as (template: string, head: string, content: string | undefined, route: string) => string;

describe("registered app page metadata", () => {
  it("passes actual head and route audit scripts against all generated HTML", () => {
    const root = mkdtempSync(join(tmpdir(), "woolet-production-audit-"));
    const write = (path: string, content: string) => {
      const file = join(root, path);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    };
    try {
      const template = readFileSync("index.html", "utf8");
      write("src/App.tsx", readFileSync("src/App.tsx", "utf8"));
      write("dist/index.html", '<head><title data-seo="prerender">Page not found | Woolet</title></head>');
      for (const route of getAllRoutes()) {
        const meta = getMetadata(route);
        const html = injectHead(template, renderHeadHtml(meta), meta.noscriptHtml, route);
        write(`dist${route}/index.html`, html);
        write(`dist${route}.html`, html);
      }
      for (const [from, to] of Object.entries(ALL_REDIRECTS)) {
        if (from === "/index.html" || from === "/") continue;
        const target = `https://woolet.co${to}`;
        const html = `<html><head>\n<meta http-equiv="refresh" content="0; url=${target}">\n<link rel="canonical" href="${target}">\n<meta name="robots" content="noindex, follow">\n<meta name="woolet-legacy-redirect" content="1"></head></html>`;
        for (const path of new Set([from, from.toLowerCase(), encodeURI(from), encodeURI(from).toLowerCase()])) {
          if (getAllRoutes().includes(path)) continue;
          write(path.endsWith(".html") ? `dist${path}` : `dist${path}/index.html`, html);
          if (!path.endsWith(".html")) write(`dist${path}.html`, html);
        }
      }
      mkdirSync(join(root, "scripts"), { recursive: true });
      for (const script of ["audit-routes.mjs", "audit-head.mjs"]) {
        copyFileSync(`scripts/${script}`, join(root, "scripts", script));
        const result = spawnSync("node", [join(root, "scripts", script)], { encoding: "utf8" });
        expect(result.status, result.stdout + result.stderr).toBe(0);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 30000);
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
    const html = injectHead(readFileSync("index.html", "utf8"), renderHeadHtml(meta), meta.noscriptHtml, route);
    expect(html.match(/<title\b[^>]*>(.*?)<\/title>/)?.[1]).toBe(title);
    expect(html).not.toContain("Page not found | Woolet");
    expect(html).toContain(`<noscript data-route="${route}">`);
  });

  it("updates title on client navigation even when a page omitted its path prop", async () => {
    document.head.innerHTML = "";
    const view = render(<HelmetProvider><MemoryRouter initialEntries={["/en/bespoke/configurator"]}>
      <SEO title="Old collection title" description="Old description" />
      <Link to="/en/bespoke/checkout">Checkout</Link>
    </MemoryRouter></HelmetProvider>);
    await waitFor(() => expect(document.title).toBe("Bespoke Configurator - Woolet"));
    fireEvent.click(view.getByText("Checkout"));
    await waitFor(() => expect(document.title).toBe("Secure checkout · Woolet Bespoke"));
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://woolet.co/en/bespoke/checkout");
    cleanup();
  });
});