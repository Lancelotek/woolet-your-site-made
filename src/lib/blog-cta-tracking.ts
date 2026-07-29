/**
 * FitLens CTA tracking for blog article bodies.
 *
 * Blog content is authored as raw HTML strings (src/lib/blog-data*.ts) and
 * injected with dangerouslySetInnerHTML, so we cannot attach React handlers
 * to individual CTAs — there are ~58 FitLens links across the English posts
 * and hand-instrumenting each one would rot the moment someone writes a new
 * article.
 *
 * Instead we instrument the rendered DOM once per article:
 *   • every anchor pointing at /{lang}/fit* is discovered and tagged
 *   • its placement (which H2 section, which ordinal, which visual variant)
 *     is derived from the DOM, not from the author
 *   • an IntersectionObserver fires one `fitlens_cta_view` per CTA
 *   • a single delegated listener fires `fitlens_cta_click`
 *
 * Emitting both view and click is what makes the data answerable: clicks
 * alone only tell you which post gets traffic, view+click gives a real CTR
 * per post AND per section, so we can see whether the CTA under
 * "How to measure" outperforms the one in the closing block.
 */

import { pushGtmEvent } from "@/lib/gtm";

export type FitCtaVariant = "fitlens_card" | "inline_cta" | "body_link";

export interface FitCtaContext {
  /** Blog post slug, e.g. "eyeglass-frame-size-chart" */
  slug: string;
  /** Locale of the article being read */
  lang: string;
}

const FIT_PATH = /^\/[a-z]{2}\/fit(?:\/|$|\?|#)/;

/** Which FitLens surface was clicked — derived from the authored markup. */
function variantOf(anchor: HTMLAnchorElement): FitCtaVariant {
  if (anchor.closest(".woolet-inline-cta")) return "inline_cta";
  // The FITLENS_CTA helper renders a dark padded card; detect it structurally
  // rather than by class so restyles don't silently break the segmentation.
  const block = anchor.parentElement;
  const isCard =
    !!block &&
    block.tagName === "DIV" &&
    anchor.style.display === "inline-block" &&
    block.querySelector("p") !== null;
  return isCard ? "fitlens_card" : "body_link";
}

/**
 * Nearest H2 above the CTA. processContent() already assigns slugified ids to
 * every H2, so this doubles as the section key used in reporting.
 */
function sectionOf(anchor: HTMLElement, root: HTMLElement): { id: string; title: string } {
  let node: HTMLElement | null = anchor;
  // Climb to the top-level block inside the article body…
  while (node && node.parentElement && node.parentElement !== root) {
    node = node.parentElement;
  }
  // …then walk backwards through siblings looking for the closest heading.
  let prev = node?.previousElementSibling ?? null;
  while (prev) {
    if (prev.tagName === "H2") {
      const title = (prev.textContent ?? "").trim();
      return { id: prev.id || slugify(title), title };
    }
    prev = prev.previousElementSibling;
  }
  return { id: "intro", title: "Intro" };
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** How far down the article the CTA sits, as a percentage of article height. */
function depthOf(anchor: HTMLElement, root: HTMLElement): number {
  const rootTop = root.getBoundingClientRect().top + window.scrollY;
  const height = root.scrollHeight || 1;
  const top = anchor.getBoundingClientRect().top + window.scrollY - rootTop;
  return Math.max(0, Math.min(100, Math.round((top / height) * 100)));
}

/**
 * Instruments every FitLens CTA inside `root`. Returns a cleanup function.
 * Safe to call repeatedly — re-running re-tags the DOM from scratch.
 */
export function trackFitCtas(root: HTMLElement, ctx: FitCtaContext): () => void {
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/fit"]')).filter(
    (a) => FIT_PATH.test(a.getAttribute("href") ?? ""),
  );
  if (anchors.length === 0) return () => {};

  const meta = new WeakMap<
    HTMLAnchorElement,
    {
      variant: FitCtaVariant;
      section: string;
      sectionTitle: string;
      position: number;
      depth: number;
      destination: string;
      label: string;
    }
  >();

  anchors.forEach((anchor, i) => {
    const section = sectionOf(anchor, root);
    meta.set(anchor, {
      variant: variantOf(anchor),
      section: section.id,
      sectionTitle: section.title,
      position: i + 1,
      depth: depthOf(anchor, root),
      destination: anchor.getAttribute("href") ?? "",
      label: (anchor.textContent ?? "").trim().slice(0, 80),
    });
    anchor.dataset.fitCta = "1";
    anchor.dataset.fitCtaSection = section.id;
  });

  const base = () => ({
    post_slug: ctx.slug,
    post_lang: ctx.lang,
    cta_total_on_page: anchors.length,
  });

  /* ── Impressions: one per CTA, when at least half of it is on screen ── */
  const seen = new WeakSet<HTMLAnchorElement>();
  let observer: IntersectionObserver | null = null;

  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const anchor = entry.target as HTMLAnchorElement;
          if (!entry.isIntersecting || seen.has(anchor)) continue;
          seen.add(anchor);
          observer?.unobserve(anchor);
          const m = meta.get(anchor);
          if (!m) continue;
          pushGtmEvent("fitlens_cta_view", {
            ...base(),
            cta_variant: m.variant,
            cta_section: m.section,
            cta_section_title: m.sectionTitle,
            cta_position: m.position,
            cta_depth_pct: m.depth,
            cta_label: m.label,
          });
        }
      },
      { threshold: 0.5 },
    );
    anchors.forEach((a) => observer?.observe(a));
  }

  /* ── Clicks: delegated, so re-rendered content keeps working ── */
  const onClick = (e: Event) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest?.('a[data-fit-cta="1"]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const m = meta.get(anchor);
    if (!m) return;
    pushGtmEvent("fitlens_cta_click", {
      ...base(),
      cta_variant: m.variant,
      cta_section: m.section,
      cta_section_title: m.sectionTitle,
      cta_position: m.position,
      cta_depth_pct: m.depth,
      cta_label: m.label,
      cta_destination: m.destination,
      // GA4 recommended-parameter aliases so the event also lands in the
      // standard "link click" reports without extra config.
      link_url: m.destination,
      link_text: m.label,
    });
  };

  root.addEventListener("click", onClick);

  return () => {
    root.removeEventListener("click", onClick);
    observer?.disconnect();
  };
}
