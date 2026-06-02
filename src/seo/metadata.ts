/**
 * Pure per-route SEO metadata. No React, no DOM, no side effects.
 *
 * Consumed in two places:
 *   1. scripts/prerender.mjs — injects head HTML into dist/<route>/index.html
 *      so crawlers and LLM bots see real titles / descriptions / JSON-LD
 *      in the initial response without executing JS.
 *   2. (Optional, future) client SEO components, so the static head and
 *      the client Helmet head never drift.
 *
 * Adding a route: append it to `getAllRoutes()` and add a case in
 * `getMetadata()`. Anything not matched falls back to the homepage meta.
 */

import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { getBlogPosts } from "@/lib/blog-data";

export const SITE_URL = "https://woolet.co";
const DEFAULT_OG = `${SITE_URL}/og-image.png`;

export type RouteMeta = {
  title: string;
  description: string;
  canonical: string;
  lang: Lang;
  robots?: string;
  og: {
    title: string;
    description: string;
    image: string;
    type: "website" | "article" | "product";
    locale: string;
  };
  jsonLd: object[];
  /** Plain HTML injected into <noscript> for LLM bots and the no-JS path. */
  noscriptHtml?: string;
};

// ---------------------------------------------------------------------------
// Shared JSON-LD blocks
// ---------------------------------------------------------------------------

// Organization JSON-LD lives in index.html (single source) — do not duplicate here.

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Woolet",
  url: SITE_URL,
  description: "AI-fit eyewear for wide faces — one precise size (158 mm) per shape, plus bespoke",
  publisher: { "@type": "Organization", name: "Woolet", url: SITE_URL },
};

function productJsonLd(model: "007" | "009", shape: string, lensSize: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Woolet ${model} — ${shape} Italian Acetate Eyewear`,
    description: `Woolet ${model} (${shape}) in Italian Mazzucchelli acetate. One precise size — 158 mm front width with a 21 mm bridge — engineered for wide faces (155–161 mm). Bespoke 150–172 mm available. ${lensSize}.`,
    brand: { "@type": "Brand", name: "Woolet" },
    image: `${SITE_URL}/og-${model}.png`,
    sku: `WOOLET-${model}`,
    material: "Italian Mazzucchelli Acetate",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      priceCurrency: "USD",
      price: "114",
      priceValidUntil: "2026-12-31",
      url: `${SITE_URL}/en/products/${model}`,
      seller: { "@type": "Organization", name: "Woolet" },
    },
    audience: { "@type": "PeopleAudience", suggestedGender: "unisex" },
  };
}

function breadcrumbJsonLd(parts: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: parts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      item: p.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Locale helpers
// ---------------------------------------------------------------------------

function ogLocale(lang: Lang): string {
  switch (lang) {
    case "pl": return "pl_PL";
    case "fr": return "fr_FR";
    case "es": return "es_ES";
    default: return "en_US";
  }
}

function langFromRoute(route: string): Lang {
  const m = route.match(/^\/([a-z]{2})(\/|$)/);
  const lang = m?.[1];
  if (lang && (SUPPORTED_LANGS as readonly string[]).includes(lang)) return lang as Lang;
  return "en";
}

// ---------------------------------------------------------------------------
// Per-route copy
// ---------------------------------------------------------------------------

type Copy = { title: string; description: string; noscriptHtml?: string };

const homeCopy: Record<Lang, Copy> = {
  en: {
    title: "Woolet — Italian Acetate Eyewear for Wide Faces",
    description:
      "AI-fit Mazzucchelli acetate glasses for 155 mm+ faces. 158 mm front, 21 mm bridge. From $114 pre-order.",
    noscriptHtml: `<h1>Woolet — AI-Fit Eyewear for Wide Faces</h1>
<p>Woolet makes premium Italian-acetate eyewear engineered for wide faces — temple-to-temple measurements of 155 mm and above. Two shapes (007 round, 009 soft square), both built in one precise size: 158 mm front width with a 21 mm keyhole bridge. A bespoke tier covers 150–172 mm.</p>
<p>Frames are cut from Italian Mazzucchelli cellulose acetate, hand-finished in Italy, with 5-barrel PVD Gunmetal hinges and a 21 mm keyhole bridge engineered for wider noses.</p>
<p>Pricing: $114 for founding members at pre-order, $190 at full launch. <a href="/en/fit">Run the AI Fit Wizard</a> or measure manually with a <a href="/en/fit/manual">credit card</a>.</p>`,
  },
  pl: {
    title: "Woolet — Premium okulary na szeroką twarz (155 mm+)",
    description:
      "Premium okulary z włoskiego octanu Mazzucchelli, zaprojektowane dla szerokich twarzy (155 mm+). Trzy mierzone rozmiary plus bespoke. Od $114 w przedsprzedaży.",
  },
  fr: {
    title: "Woolet — Lunettes premium pour visages larges (155 mm+)",
    description:
      "Lunettes premium en acétate italien Mazzucchelli, conçues pour les visages larges (155 mm+). Trois tailles mesurées plus sur-mesure. Dès 133 $ en précommande.",
  },
  es: {
    title: "Woolet — Gafas premium para caras anchas (155 mm+)",
    description:
      "Gafas premium en acetato italiano Mazzucchelli, diseñadas para caras anchas (155 mm+). Tres tamaños medidos más a medida. Desde 133 $ en preventa.",
  },
};

// ---------------------------------------------------------------------------
// Route builder
// ---------------------------------------------------------------------------

function base(route: string, lang: Lang, copy: Copy, og: Partial<RouteMeta["og"]> = {}, jsonLd: object[] = []): RouteMeta {
  const canonical = `${SITE_URL}${route}`;
  return {
    title: copy.title,
    description: copy.description,
    canonical,
    lang,
    og: {
      title: copy.title,
      description: copy.description,
      image: og.image || DEFAULT_OG,
      type: og.type || "website",
      locale: ogLocale(lang),
    },
    jsonLd: jsonLd,
    noscriptHtml: copy.noscriptHtml,
  };
}

export function getMetadata(route: string): RouteMeta {
  const lang = langFromRoute(route);
  const path = route.replace(/^\/[a-z]{2}/, "") || "/";

  // Homepage
  if (path === "/" || path === "") {
    return base(route, lang, homeCopy[lang], { image: DEFAULT_OG }, lang === "en" ? [websiteJsonLd] : []);
  }

  // ----- Products
  if (path === "/products/007") {
    return base(
      route,
      lang,
      {
        title: "Woolet 007 — Round Panto Acetate Glasses, 158 mm",
        description:
          "Round panto Italian acetate frame, 158 mm wide with 21 mm bridge. Engineered for 155 mm+ faces. From $114 pre-order.",
        noscriptHtml: `<h1>Woolet 007 — Round, 158 mm</h1>
<p>The Woolet 007 is a round-panto eyewear shape cut from Italian Mazzucchelli cellulose acetate and hand-finished in Italy. One precise size: 158 mm front width with a 21 mm keyhole bridge. Lens 52 × 52 mm, temples 148 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Dark Tortoise, Black, Honey. Pre-order $114 for founding members; $190 at full launch. Bespoke 150–172 mm available.</p>`,
      },
      { image: `${SITE_URL}/og-007.png`, type: "product" },
      [
        productJsonLd("007", "round-panto", "52 × 52 mm"),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/en` },
          { name: "Products", url: `${SITE_URL}/en` },
          { name: "Woolet 007", url: `${SITE_URL}/en/products/007` },
        ]),
      ],
    );
  }

  if (path === "/products/009") {
    return base(
      route,
      lang,
      {
        title: "Woolet 009 — Square Acetate Glasses, 158 mm Wide",
        description:
          "Soft-square Italian acetate frame for wide faces. 158 mm front, 21 mm keyhole bridge. $114 pre-order, $190 retail.",
        noscriptHtml: `<h1>Woolet 009 — Soft Square, 158 mm</h1>
<p>The Woolet 009 is a soft-square eyewear shape cut from Italian Mazzucchelli cellulose acetate and hand-finished in Italy. One precise size: 158 mm front width with a 21 mm keyhole bridge. Lens 54 × 50 mm, temples 148 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Black, Dark Tortoise, Smoke Grey. Pre-order $114 for founding members; $190 at full launch. Bespoke 150–172 mm available.</p>`,
      },
      { image: `${SITE_URL}/og-009.png`, type: "product" },
      [
        productJsonLd("009", "soft square", "54 × 50 mm"),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/en` },
          { name: "Products", url: `${SITE_URL}/en` },
          { name: "Woolet 009", url: `${SITE_URL}/en/products/009` },
        ]),
      ],
    );
  }

  // ----- About
  if (path === "/about") {
    return base(route, lang, {
      title: "About Woolet — Eyewear Built for Wide Faces",
      description:
        "Why we make one precise size (158 mm) in Italian Mazzucchelli acetate. Founder story, factory, fit philosophy.",
      noscriptHtml: `<h1>About Woolet</h1>
<p>Woolet is an eyewear brand founded in 2026 by JAY23 LLC. We design and manufacture Italian-acetate frames engineered specifically for wide faces (155 mm and above). The brand is unrelated to the discontinued Woolet smart wallet (2014–2016).</p>`,
    });
  }

  // ----- Fit
  if (path === "/fit") {
    return base(route, lang, {
      title: "AI Face-Width Scanner — Find Your Glasses Size | Woolet",
      description:
        "Measure your face width in 30 seconds with a credit card and your camera. Confirms whether 158 mm fits.",
    });
  }
  if (path === "/fit/manual") {
    return base(route, lang, {
      title: "Manual Measurement — Woolet Fit",
      description:
        "Measure your face width, bridge and PD with a ruler and a credit card. Manual fallback for the Woolet AI Fit scan.",
    });
  }
  if (path === "/fit/scan") {
    return base(route, lang, {
      title: "Face Scan — Woolet AI Fit",
      description:
        "Measure your face width and nose width with your camera and a credit card. Local, private and accurate to about 2 mm.",
    });
  }
  if (path === "/fit/bespoke") {
    return base(route, lang, {
      title: "Bespoke Fit — Woolet (150–172 mm)",
      description:
        "If your face falls outside the standard Woolet sizes, bespoke covers 150–172 mm with a 16–26 mm bridge. Hand-crafted by an Italian atelier from your AI scan.",
    });
  }

  // ----- Collections
  if (path === "/collections/wide-face-glasses") {
    return base(route, lang, {
      title: "Wide-Face Glasses — 158 mm Italian Acetate Frames | Woolet",
      description:
        "Glasses engineered for 155 mm+ faces. Two shapes, 158 mm front, 21 mm bridge. Hand-finished Mazzucchelli acetate.",
      noscriptHtml: `<h1>Wide Face Glasses</h1>
<p>Italian Mazzucchelli acetate eyewear built for face widths of 155 mm and above. Two shapes (007 round, 009 soft square), one precise 158 mm front width with a 21 mm keyhole bridge. Bespoke 150–172 mm. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Wide-Face Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/italian-acetate-sunglasses") {
    return base(route, lang, {
      title: "Italian Acetate Sunglasses — 158 mm | Woolet",
      description:
        "Handmade Italian Mazzucchelli acetate sunglasses for wide faces. Round and square. UV400. From $114.",
      noscriptHtml: `<h1>Italian Acetate Sunglasses</h1>
<p>Sunglasses cut from Italian Mazzucchelli cellulose acetate and hand-finished in Italy. Two shapes (Woolet 007 round, 009 soft square), 158 mm front with a 21 mm keyhole bridge. UV400, optional polarised lenses. From $114 pre-order.</p>`,
    });
  }
  if (path === "/collections/oversized-sunglasses-men") {
    return base(route, lang, {
      title: "Oversized Men's Sunglasses — 158 mm Wide | Woolet",
      description:
        "Properly oversized men's sunglasses: 158 mm front, 21 mm bridge, Italian acetate. Built for 155 mm+ faces.",
      noscriptHtml: `<h1>Oversized Sunglasses for Men</h1>
<p>Properly oversized men's sunglasses for wide faces (155 mm+). 158 mm front width, 21 mm keyhole bridge, Italian Mazzucchelli acetate. Two shapes (Woolet 007 round, 009 soft square). Bespoke 150–172 mm. From $114 pre-order.</p>`,
    });
  }
  if (path === "/collections/sunglasses-for-big-heads") {
    return base(route, lang, {
      title: "Sunglasses for Big Heads — 158 mm, Italian Acetate | Woolet",
      description:
        "Sunglasses that actually fit big heads. 158 mm front, 21 mm bridge, hand-finished Mazzucchelli acetate.",
      noscriptHtml: `<h1>Sunglasses for Big Heads - 158 mm + Bespoke</h1>
<p>Built from the ground up for wide faces (155 mm+) and head circumference 58 to 64 cm, not retrofitted from standard sizes. Handmade Italian Mazzucchelli acetate, two shapes (Woolet 007 round and 009 soft square), one precise 158 mm width plus bespoke up to 172 mm. Pre-order $114 for founding members, $190 at full launch.</p>
<h2>The problem with standard sunglasses</h2>
<ul>
  <li>Frames pinch at the temples within an hour.</li>
  <li>Arms too short to reach behind the ears.</li>
  <li>Lenses sit too close to the eyes and look undersized.</li>
</ul>
<p>Standard eyewear maxes out around 145 to 148 mm of front width. Woolet starts at 158 mm with a 21 mm bridge, and bespoke covers anything from 150 to 172 mm. Temples 150 mm standard, up to 155 mm bespoke.</p>
<h2>Size guide</h2>
<table>
  <thead><tr><th>Face / head measurement</th><th>Recommended frame</th></tr></thead>
  <tbody>
    <tr><td>Face width 155–161 mm (head 58–62 cm)</td><td>Woolet 158 mm</td></tr>
    <tr><td>Face width 150–154 mm or 162–172 mm (head 56–58 cm or 62 cm+)</td><td>Bespoke</td></tr>
  </tbody>
</table>
<h2>Frequently asked</h2>
<h3>How many mm is considered wide for sunglasses?</h3>
<p>Mainstream sunglasses sit at 138 to 148 mm across the front. Anything above 150 mm is wide. Woolet's standard size is 158 mm, with bespoke up to 172 mm. The first number printed inside the temple is lens width, not front width.</p>
<h3>What head circumference is considered big?</h3>
<p>Around 58 to 60 cm is large, 60 to 62 cm is XL, and above 62 cm is XXL. Woolet's standard 158 mm covers most XL heads; bespoke handles XXL.</p>
<h3>Where do you buy sunglasses for big heads?</h3>
<p>Specialist makers like Woolet design at 158 mm front width with bespoke above. Mass-market brands mostly cap at 145 to 148 mm even on oversized models, so the lenses are larger but the front is the same.</p>
<h3>Can I get sunglasses custom-made for my head size?</h3>
<p>Yes. Bespoke covers 150 to 172 mm of front width in either shape, with temples up to 155 mm. Same Italian Mazzucchelli acetate as the standard line, made to your measurement.</p>
<h3>Are Woolet sunglasses polarized?</h3>
<p>Polarised lenses are available as an upgrade on both 007 and 009. Standard lenses are CR-39 with UV400 protection.</p>
<h3>How long is the bespoke wait time?</h3>
<p>Bespoke ships approximately 6 to 8 weeks after the standard pre-order batch.</p>
<p><a href="/en/products/007">Shop Woolet 007 (round)</a> | <a href="/en/products/009">Shop Woolet 009 (square)</a> | <a href="/en/how-to-measure-face-width">How to measure your face width</a> | <a href="/en/collections/oversized-sunglasses-men">Oversized sunglasses for men</a></p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Sunglasses for Big Heads", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/glasses-for-big-heads") {
    return base(route, lang, {
      title: "Glasses for Big Heads — 158 mm Italian Acetate | Woolet",
      description:
        "Prescription-ready optical frames for big heads. 158 mm front, 21 mm bridge, Italian Mazzucchelli acetate. Bespoke 150–172 mm.",
      noscriptHtml: `<h1>Glasses for Big Heads</h1>
<p>Prescription-ready optical frames for big heads (head circumference 58–64 cm). 158 mm front width, 21 mm keyhole bridge, Italian Mazzucchelli acetate hand-finished in Italy. Bespoke 150–172 mm. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Glasses for Big Heads", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/extra-wide-glasses") {
    return base(route, lang, {
      title: "Extra Wide Glasses — 158 mm Italian Acetate Frames | Woolet",
      description:
        "Extra wide glasses engineered for 155 mm+ faces: 158 mm front, 21 mm bridge, Italian Mazzucchelli acetate. Bespoke 150–172 mm.",
      noscriptHtml: `<h1>Extra Wide Glasses</h1>
<p>Extra wide optical frames built at 158 mm front width with a 21 mm keyhole bridge — properly extra wide, not a stretched standard size. Italian Mazzucchelli acetate, hand-finished in Italy. Bespoke 150–172 mm available. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Extra Wide Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/wide-bridge-glasses") {
    return base(route, lang, {
      title: "Wide Bridge Glasses — 21 mm Keyhole Bridge, Acetate | Woolet",
      description:
        "Wide bridge glasses for wider noses: 21 mm keyhole bridge, 158 mm front, Italian Mazzucchelli acetate. Bespoke bridge 16–26 mm.",
      noscriptHtml: `<h1>Wide Bridge Glasses</h1>
<p>Glasses with a 21 mm keyhole bridge as standard — engineered for wider noses where mainstream 17–19 mm bridges pinch or slide. 158 mm front width, Italian Mazzucchelli acetate. Bespoke bridge 16–26 mm available. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Wide Bridge Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/oversized-blue-light-glasses") {
    return base(route, lang, {
      title: "Oversized Blue Light Glasses — 158 mm Italian Acetate | Woolet",
      description:
        "Truly oversized blue light glasses for wide faces (155 mm+). 158 mm front, 21 mm bridge, Italian acetate. HEV 380–460 nm filter lens upgrade.",
      noscriptHtml: `<h1>Oversized Blue Light Glasses for Wide Faces — 158 mm</h1>
<p>Truly oversized blue-light glasses for wide faces (155 mm+). Woolet 007 (round) and 009 (soft square) ship at 158 mm front width with a 21 mm keyhole bridge, Italian Mazzucchelli acetate. The HEV 380–460 nm filter is an in-line lens upgrade (+$40), compatible with prescription or plano lenses. Bespoke 150–172 mm available.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Oversized Blue Light Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/blue-light-glasses-for-wide-faces") {
    return base(route, lang, {
      title: "Blue Light Glasses for Wide Faces — 158 mm | Woolet",
      description:
        "Blue light filter glasses for wide faces 155 mm+. 158 mm Italian acetate front, 21 mm bridge. HEV 380–460 nm coating upgrade on 007 / 009.",
      noscriptHtml: `<h1>Blue Light Glasses for Wide Faces — 158 mm Acetate</h1>
<p>Blue-light filter glasses designed for wide faces 155 mm+. 158 mm front width, 21 mm keyhole bridge, Italian Mazzucchelli acetate. HEV 380–460 nm filter is a lens upgrade (+$40) on both Woolet 007 and 009. Pairs with prescription or plano lenses. Bespoke 150–172 mm available.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Blue Light Glasses for Wide Faces", url: `${SITE_URL}${route}` },
    ])]);
  }

  // ----- Landing pages
  if (path === "/lp/why-glasses-fail") {
    return base(route, lang, {
      title: "Why Glasses Fail Wide Faces — and the Fix | Woolet",
      description:
        "Why standard 130–148 mm frames optically widen broad faces, and how 155 mm+ Italian acetate fixes the problem.",
    }, { type: "article" });
  }
  if (path === "/lp/5-reasons") {
    return base(route, lang, {
      title: "5 Reasons Standard Glasses Fail on Wide Faces | Woolet",
      description:
        "Geometry, material, hinges, bridge, market. Five engineering reasons mainstream frames fail on 155 mm+ faces — and what Woolet does differently.",
    }, { type: "article" });
  }

  // ----- Policies
  if (path === "/privacy-policy") {
    return base(route, lang, {
      title: "Privacy Policy | Woolet",
      description: "Woolet privacy policy — how we collect, use and protect your personal information. JAY23 LLC.",
    });
  }
  if (path === "/return-policy") {
    return base(route, lang, {
      title: "Return Policy | Woolet",
      description: "Woolet return and exchange policy — 30-day returns, fit guarantee and hassle-free refunds. JAY23 LLC.",
    });
  }

  // ----- Blog index
  if (path === "/blog") {
    const titles: Record<Lang, Copy> = {
      en: { title: "Blog — Woolet | Wide-Face Eyewear Insights", description: "Expert guides on glasses for wide faces, Italian acetate, frame sizing and finding the perfect fit for 155 mm+ face widths." },
      pl: { title: "Blog — Woolet | Wiedza o okularach na szeroką twarz", description: "Poradniki o okularach na szerokie twarze, włoskim octanie, doborze oprawek i idealnym dopasowaniu dla twarzy 155 mm+." },
      fr: { title: "Blog — Woolet | Conseils lunettes visages larges", description: "Guides experts sur les lunettes pour visages larges, l'acétate italien et le choix des montures pour 155 mm+." },
      es: { title: "Blog — Woolet | Consejos gafas caras anchas", description: "Guías sobre gafas para caras anchas, acetato italiano y cómo encontrar el ajuste perfecto para 155 mm+." },
    };
    return base(route, lang, titles[lang]);
  }

  // ----- Blog post
  const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = getBlogPosts(lang).find((p) => p.slug === slug);
    if (post) {
      const ogImage = post.image
        ? (post.image.startsWith("http") ? post.image : `${SITE_URL}${post.image.startsWith("/") ? post.image : `/${post.image}`}`)
        : `${SITE_URL}/og-${post.slug}.png`;
      return base(
        route,
        lang,
        {
          title: `${post.title} | Woolet`,
          description: post.excerpt,
          // Inject the full article body so Googlebot / ChatGPT-User / no-JS
          // crawlers receive real content in the first response, not the SPA
          // shell. Helmet on the client hydrates the same head on top.
          noscriptHtml: `<article>
<h1>${escapeHtml(post.title)}</h1>
<p><em>${escapeHtml(post.excerpt)}</em></p>
<p><small>Published ${escapeHtml(post.date)} · ${post.readTime} min read</small></p>
${post.content}
</article>`,
        },
        { type: "article", image: ogImage },
        [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: ogImage,
            url: `${SITE_URL}${route}`,
            datePublished: post.date,
            dateModified: post.date,
            author: { "@type": "Organization", name: "Woolet", url: SITE_URL },
            publisher: {
              "@type": "Organization",
              name: "Woolet",
              url: SITE_URL,
              logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${route}` },
            inLanguage: lang,
            ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
            wordCount: post.readTime * 220,
          },
          breadcrumbJsonLd([
            { name: "Woolet", url: `${SITE_URL}/${lang}` },
            { name: "Blog", url: `${SITE_URL}/${lang}/blog` },
            { name: post.title, url: `${SITE_URL}${route}` },
          ]),
        ],
      );
    }
  }

  // Fallback: home copy for that lang
  return base(route, lang, homeCopy[lang]);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// ---------------------------------------------------------------------------
// Route list
// ---------------------------------------------------------------------------

const STATIC_ROUTES = [
  "/en",
  "/en/about",
  "/en/products/007",
  "/en/products/009",
  "/en/fit",
  "/en/fit/manual",
  "/en/fit/bespoke",
  "/en/fit/scan",
  "/en/collections/wide-face-glasses",
  "/en/collections/italian-acetate-sunglasses",
  "/en/collections/oversized-sunglasses-men",
  "/en/collections/sunglasses-for-big-heads",
  "/en/collections/glasses-for-big-heads",
  "/en/collections/extra-wide-glasses",
  "/en/collections/wide-bridge-glasses",
  "/en/collections/oversized-blue-light-glasses",
  "/en/collections/blue-light-glasses-for-wide-faces",
  "/en/lp/why-glasses-fail",
  "/en/lp/5-reasons",
  "/en/privacy-policy",
  "/en/return-policy",
  "/en/blog",
  "/pl",
  "/pl/blog",
  "/pl/privacy-policy",
  "/pl/return-policy",
  "/fr",
  "/es",
];

export function getAllRoutes(): string[] {
  const blogRoutes: string[] = [];
  for (const lang of ["en", "pl"] as Lang[]) {
    for (const post of getBlogPosts(lang)) {
      blogRoutes.push(`/${lang}/blog/${post.slug}`);
    }
  }
  return [...STATIC_ROUTES, ...blogRoutes];
}

// ---------------------------------------------------------------------------
// HTML rendering — used by the prerender script.
// ---------------------------------------------------------------------------

export function renderHeadHtml(meta: RouteMeta): string {
  const tags: string[] = [];
  tags.push(`<title>${escapeHtml(meta.title)}</title>`);
  tags.push(`<meta name="description" content="${escapeHtml(meta.description)}" />`);
  tags.push(`<link rel="canonical" href="${meta.canonical}" />`);
  if (meta.robots) tags.push(`<meta name="robots" content="${meta.robots}" />`);

  // hreflang
  const path = meta.canonical.replace(SITE_URL, "").replace(/^\/[a-z]{2}/, "");
  for (const l of SUPPORTED_LANGS) {
    tags.push(`<link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${path}" />`);
  }
  tags.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${path}" />`);

  // OpenGraph
  tags.push(`<meta property="og:title" content="${escapeHtml(meta.og.title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(meta.og.description)}" />`);
  tags.push(`<meta property="og:url" content="${meta.canonical}" />`);
  tags.push(`<meta property="og:type" content="${meta.og.type}" />`);
  tags.push(`<meta property="og:site_name" content="Woolet" />`);
  tags.push(`<meta property="og:image" content="${meta.og.image}" />`);
  tags.push(`<meta property="og:locale" content="${meta.og.locale}" />`);

  // Twitter
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.og.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.og.description)}" />`);
  tags.push(`<meta name="twitter:image" content="${meta.og.image}" />`);
  tags.push(`<meta name="twitter:site" content="@WooletEyewear" />`);

  for (const obj of meta.jsonLd) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(obj)}</script>`);
  }

  return tags.join("\n    ");
}
