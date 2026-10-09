import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getBlogPost } from "@/lib/blog-data";
import { BLOG_AIO_ENHANCEMENTS } from "@/content/blog-aio";
import { BESPOKE_SPEC } from "@/lib/bespoke-spec";
import { BRIDGE_SECTIONS } from "@/data/cluster-sections";
import { GUIDE_FAQS } from "@/seo/faq-data";
import { getMetadata } from "@/seo/metadata";

const scale = "A face under 138 mm is Narrow; 138–149 mm is Large-average; 150–154 mm is large-average at the upper end; 155–161 mm is a Wide face — the Woolet stock range; and 162 mm or more is a wide face beyond the range we build — our widest bespoke front is 160 mm.";

const cases = [
  ["en", "how-to-tell-if-your-face-is-wide-or-narrow", "Narrow is under 138 mm, average 138-154 mm, wide 155-161 mm, and 162 mm and above is wide beyond the range we build — our widest bespoke front is 160 mm."],
  ["en", "how-to-tell-if-your-face-is-wide-or-narrow", '>Wide — beyond our range</td><td style="padding:14px;">162 mm and above'],
  ["en", "what-size-sunglasses-for-wide-faces", "162 mm and above (beyond our range)"],
  ["en", "wide-face-glasses-for-women", "A wide face in eyewear terms means a face width of 155 mm or more measured temple-to-temple."],
  ["en", "glasses-too-tight-on-side-of-head", "Under 140 mm is average. 140–149 mm is large-average. 150–154 mm is large-average at the upper end. 155 mm and up is a wide face — and where the mainstream market has nothing at all."],
  ["en", "glasses-too-tight-on-side-of-head", "A wide face measures 155 mm or more temple to temple."],
  ["en", "eyeglass-frame-size-chart", "The important caveat: the standard industry chart ends at roughly 150 mm — well short of where wide faces begin, at 155 mm."],
  ["en", "how-wide-should-glasses-be", "For a wide face — 155 mm or more across the temples — that means a frame front around 158 mm."],
  ["pl", "okulary-na-szeroka-twarz-przewodnik", "Szeroka twarz to <strong>155 mm lub więcej</strong> mierzone w skroniach."],
  ["pl", "najlepsze-okulary-na-duza-glowe-2026", 'W terminologii okularowej "duża głowa" to szerokość twarzy <strong>155 mm lub więcej</strong>.'],
] as const;

describe("owner-approved second definition pass", () => {
  it.each(cases)("keeps %s/%s visitor and crawler copy synced", (locale, slug, text) => {
    expect(getBlogPost(locale, slug)?.content).toContain(text);
    expect(getMetadata(`/${locale}/blog/${slug}`).noscriptHtml).toContain(text);
  });

  it("updates all three quick/direct answer scales in visitor and crawler data", () => {
    expect(BLOG_AIO_ENHANCEMENTS["how-to-tell-if-your-face-is-wide-or-narrow"].directAnswer).toBe(scale);
    expect(BLOG_AIO_ENHANCEMENTS["how-to-tell-if-your-face-is-wide-or-narrow"].quickAnswer).toContain(scale[0].toLowerCase() + scale.slice(1));
    expect(BLOG_AIO_ENHANCEMENTS["how-to-measure-face-width-for-glasses"].quickAnswer).toContain(scale);
    for (const slug of ["how-to-tell-if-your-face-is-wide-or-narrow", "how-to-measure-face-width-for-glasses"]) {
      expect(getMetadata(`/en/blog/${slug}`).noscriptHtml).toContain("162 mm or more is a wide face beyond the range we build — our widest bespoke front is 160 mm");
    }
  });

  it("corrects the guide row only with authoritative 160 mm maximum", () => {
    expect(BESPOKE_SPEC.frontWidthMax).toBe(160);
    expect(BESPOKE_SPEC.stockFrontWidth).toBe(158);
    const guide = getBlogPost("en", "glasses-for-wide-faces-guide")?.content;
    expect(guide).toContain("158 mm signature · 160 mm bespoke");
    expect(guide).toContain("150–154 mm is still large-average at the upper end — where extra-wide specialist brands start.");
    expect(guide).toContain("Under 140 mm is average. 140–149 mm is large-average.");
    const override = readFileSync("scripts/prerender.mjs", "utf8").match(/"\/en\/blog\/glasses-for-wide-faces-guide": `([\s\S]*?)`,/)?.[1];
    expect(override).not.toContain("162 mm bespoke");
    expect(override).toContain("158 mm (bespoke 145-160 mm)");
  });

  it("removes the overlapping FAQ band in both JSON-LD consumers", () => {
    const text = "155–161 mm is wide — the Woolet stock range — and 162 mm and above is beyond the range we build — our widest bespoke front is 160 mm.";
    const post = getBlogPost("en", "how-to-measure-face-width-for-glasses");
    expect(post?.faq?.[0].a).toContain(text);
    expect(post?.faq?.[0].a).not.toContain("161–162 mm");
    expect(JSON.stringify(getMetadata("/en/blog/how-to-measure-face-width-for-glasses").jsonLd)).toContain(text);
  });

  it("fixes bridge prose and the fallback FAQ without expanding crawler content", () => {
    expect(BRIDGE_SECTIONS["18mm"].flatMap((section) => section.body).join(" ")).toContain("If your face width is under 155 mm as well, nothing about the wide-face category applies to you.");
    expect(GUIDE_FAQS["how-to-measure-face-width-for-glasses"][2].a).toBe("155 mm and above. Standard frames cap at 135–145 mm of total width, so a wide face — 155 mm or more — is outside what they are built for. The Woolet stock range is a 158 mm front.");
  });

  it("uses five increasing German bands in visitor and crawler content", () => {
    const slug = "beste-brillen-fuer-grosse-koepfe-2026";
    for (const html of [getBlogPost("de", slug)?.content, getMetadata(`/de/blog/${slug}`).noscriptHtml]) {
      expect(html).toContain("Unter 138 mm</strong> – Schmal.");
      expect(html).toContain("138–149 mm</strong> – Großes Durchschnittsmaß.");
      expect(html).toContain("150–154 mm</strong> – Großes Durchschnittsmaß am oberen Ende.");
      expect(html).toContain("155–161 mm</strong> – Breites Gesicht.");
      expect(html).toContain("162 mm und darüber</strong> – Breites Gesicht außerhalb unseres Fertigungsbereichs; unsere breiteste Maßanfertigung hat eine Frontbreite von 160 mm.");
      expect(html).not.toContain("Unter 145 mm</strong> – Extra-breit.");
    }
  });
});