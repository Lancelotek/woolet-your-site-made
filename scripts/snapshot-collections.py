"""Snapshot the hydrated body text of every /en/collections/* page into
src/seo/collection-snapshots.json so the prerendered HTML matches it.
Run against the dev server: python3 scripts/snapshot-collections.py [base_url]
"""
import asyncio, json, re, sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
SRC = (ROOT / "src/seo/routeRedirects.ts").read_text()
SLUGS = re.findall(r'"([a-z0-9-]+)"', SRC.split("COLLECTION_SLUGS = [")[1].split("];")[0])

SERIALIZE = r"""
() => {
  const root = document.querySelector('main') || document.querySelector('#root');
  const clone = root.cloneNode(true);
  clone.querySelectorAll('nav, header, footer, script, style, svg, img, picture, video, iframe, form, [aria-hidden="true"], .sr-only').forEach(n => n.remove());
  const KEEP = new Set(['H1','H2','H3','H4','P','UL','OL','LI','A','TABLE','THEAD','TBODY','TR','TH','TD','DL','DT','DD','STRONG','EM','BLOCKQUOTE']);
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const BLOCK = new Set(['DIV','SECTION','ARTICLE','BUTTON','SUMMARY','DETAILS','FIGURE','FIGCAPTION','ASIDE','LABEL']);
  function walk(n) {
    if (n.nodeType === 3) return esc(n.textContent.replace(/\s+/g,' '));
    if (n.nodeType !== 1) return '';
    const inner = [...n.childNodes].map(walk).join('');
    const tag = n.tagName;
    if (tag === 'A') {
      let href = n.getAttribute('href') || '';
      if (!href || href.startsWith('javascript')) return inner;
      return `<a href="${href.replace(/"/g,'&quot;')}">${inner.trim()}</a>`;
    }
    if (KEEP.has(tag)) { const t = tag.toLowerCase(); return inner.trim() ? `<${t}>${inner.trim()}</${t}>\n` : ''; }
    if (BLOCK.has(tag)) { return inner.trim() ? (/<(h\d|p|ul|ol|table|dl|div)/.test(inner) ? inner : `<p>${inner.trim()}</p>\n`) : ''; }
    return inner;
  }
  return walk(clone).replace(/\n{2,}/g,'\n').trim();
}
"""

async def main():
    out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page(viewport={"width": 1280, "height": 1800})
        for slug in SLUGS:
            route = f"/en/collections/{slug}"
            await page.goto(BASE + route, wait_until="networkidle")
            await page.wait_for_selector("h1")
            # Expand every accordion / details so FAQ answers are in the DOM.
            for _ in range(3):
                await page.evaluate("""() => {
                  document.querySelectorAll('details').forEach(d => d.open = true);
                  document.querySelectorAll('main [aria-expanded="false"]').forEach(b => b.click());
                }""")
                await page.wait_for_timeout(250)
            html = await page.evaluate(SERIALIZE)
            out[route] = html
            print(route, len(re.sub(r"<[^>]+>", " ", html).split()), "words")
        await b.close()
    (ROOT / "src/seo/collection-snapshots.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")

asyncio.run(main())
