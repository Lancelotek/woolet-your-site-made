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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Woolet",
  url: SITE_URL,
  description:
    "AI-fit Italian Mazzucchelli acetate eyewear measured for wide faces (155 mm and above). Three sizes per shape (155 / 158 / 161 mm) plus bespoke (150–172 mm).",
  foundingLocation: "Poland",
  sameAs: ["https://www.instagram.com/woolet.eyewear"],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@woolet.co",
    contactType: "customer service",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Woolet",
  url: SITE_URL,
  description: "AI-fit eyewear for wide faces — three sizes per shape, plus bespoke",
  publisher: { "@type": "Organization", name: "Woolet", url: SITE_URL },
};

function productJsonLd(model: "007" | "009", shape: string, lensSize: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Woolet ${model} — ${shape} Italian Acetate Eyewear`,
    description: `Woolet ${model} (${shape}) in Italian Mazzucchelli acetate. Front widths 155 / 158 / 161 mm for wide faces, plus bespoke 150–172 mm. ${lensSize}.`,
    brand: { "@type": "Brand", name: "Woolet" },
    image: `${SITE_URL}/og-${model}.png`,
    sku: `WOOLET-${model}`,
    material: "Italian Mazzucchelli Acetate",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      priceCurrency: "USD",
      price: "133",
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
    title: "Woolet — AI-Fit Italian Acetate Eyewear for Wide Faces",
    description:
      "Premium eyewear engineered for wide faces (155 mm+). Italian Mazzucchelli acetate, three measured sizes per shape plus bespoke. From $133 pre-order.",
    noscriptHtml: `<h1>Woolet — AI-Fit Eyewear for Wide Faces</h1>
<p>Woolet makes premium Italian-acetate eyewear engineered for wide faces — temple-to-temple measurements of 155 mm and above. Two shapes (007 round, 009 soft square), each in three measured sizes (155 / 158 / 161 mm), plus a bespoke tier covering 150–172 mm.</p>
<p>Frames are cut from Italian Mazzucchelli cellulose acetate, hand-finished in Italy, with 5-barrel PVD Gunmetal hinges and a 21 mm keyhole bridge engineered for wider noses.</p>
<p>Pricing: $133 for founding members at pre-order, $190 at full launch. <a href="/en/fit">Run the AI Fit Wizard</a> or measure manually with a <a href="/en/fit/manual">credit card</a>.</p>`,
  },
  pl: {
    title: "Woolet — Premium okulary na szeroką twarz (155 mm+)",
    description:
      "Premium okulary z włoskiego octanu Mazzucchelli, zaprojektowane dla szerokich twarzy (155 mm+). Trzy mierzone rozmiary plus bespoke. Od $133 w przedsprzedaży.",
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
    jsonLd: [organizationJsonLd, ...jsonLd],
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
        title: "Woolet 007 — Round Italian Acetate Eyewear (155 / 158 / 161 mm)",
        description:
          "The 007 round in Italian Mazzucchelli acetate. Three measured sizes — 155, 158 and 161 mm — engineered for wide faces. From $133 pre-order.",
        noscriptHtml: `<h1>Woolet 007 — Round, 155 / 158 / 161 mm</h1>
<p>The Woolet 007 is a round-panto eyewear shape cut from Italian Mazzucchelli cellulose acetate and hand-finished in Italy. Front widths 155, 158 and 161 mm with bridges scaling 19 / 21 / 23 mm. Lens 52 × 52 mm, temples 148 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Dark Tortoise, Black, Honey. Pre-order $133 for founding members; $190 at full launch. Bespoke 150–172 mm available.</p>`,
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
        title: "Woolet 009 — Soft-Square Italian Acetate (155 / 158 / 161 mm)",
        description:
          "The 009 soft-square in Italian Mazzucchelli acetate. Three measured sizes — 155, 158 and 161 mm — engineered for wide faces. From $133 pre-order.",
        noscriptHtml: `<h1>Woolet 009 — Soft Square, 155 / 158 / 161 mm</h1>
<p>The Woolet 009 is a soft-square eyewear shape cut from Italian Mazzucchelli cellulose acetate and hand-finished in Italy. Front widths 155, 158 and 161 mm with bridges scaling 19 / 21 / 23 mm. Lens 54 × 50 mm, temples 148 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Black, Dark Tortoise, Smoke Grey. Pre-order $133 for founding members; $190 at full launch. Bespoke 150–172 mm available.</p>`,
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
      title: "About Woolet — AI-Precision Eyewear for Wide Faces",
      description:
        "Italian-acetate AI-fit eyewear for wide faces (155 mm+). Founded 2026 by JAY23 LLC. Not the discontinued Woolet smart wallet (2014–2016).",
      noscriptHtml: `<h1>About Woolet</h1>
<p>Woolet is an eyewear brand founded in 2026 by JAY23 LLC. We design and manufacture Italian-acetate frames engineered specifically for wide faces (155 mm and above). The brand is unrelated to the discontinued Woolet smart wallet (2014–2016).</p>`,
    });
  }

  // ----- Fit
  if (path === "/fit") {
    return base(route, lang, {
      title: "Find Your Fit — Woolet AI Face Measurement",
      description:
        "Scan your face. See your size. Reserve your fit for $1. Sub-millimeter AI measurement of face width, nose bridge and PD. For wide faces 152–168 mm.",
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
      title: "Wide-Face Glasses — Italian Acetate, 155 / 158 / 161 mm | Woolet",
      description:
        "Wide-face glasses engineered above 155 mm. Italian Mazzucchelli acetate, three measured sizes per shape, plus bespoke. From $133 pre-order.",
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Wide-Face Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/italian-acetate-sunglasses") {
    return base(route, lang, {
      title: "Italian Acetate Sunglasses — Mazzucchelli, Made in Italy | Woolet",
      description:
        "Italian acetate sunglasses cut from Mazzucchelli sheet and hand-finished in Italy. Wide-face sizing from 155 to 161 mm, plus bespoke. From $133 pre-order.",
    });
  }
  if (path === "/collections/oversized-sunglasses-men") {
    return base(route, lang, {
      title: "Oversized Sunglasses for Men — 155 / 158 / 161 mm Italian Acetate | Woolet",
      description:
        "Oversized sunglasses for men, engineered above 155 mm. Italian Mazzucchelli acetate, three measured sizes plus bespoke. From $133 pre-order.",
    });
  }
  if (path === "/collections/sunglasses-for-big-heads") {
    return base(route, lang, {
      title: "Sunglasses for Big Heads — 155 / 158 / 161 mm Italian Acetate | Woolet",
      description:
        "Sunglasses for big heads, measured at the front: 155, 158 and 161 mm. Italian Mazzucchelli acetate, two shapes, plus bespoke to 172 mm. From $133 pre-order.",
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Sunglasses for Big Heads", url: `${SITE_URL}${route}` },
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
      return base(
        route,
        lang,
        {
          title: `${post.title} | Woolet`,
          description: post.excerpt,
          noscriptHtml: `<h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.excerpt)}</p>`,
        },
        { type: "article" },
        [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
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
