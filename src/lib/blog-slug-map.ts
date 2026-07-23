import type { Lang } from "./i18n";

/**
 * Cross-language slug map for translated blog posts.
 * Each canonical group lists every locale where the post exists and the
 * slug used in that locale. Consumed by BlogPost.tsx to emit the correct
 * hreflang cluster, and by App.tsx to redirect legacy EN slugs on
 * non-EN locales to their translated slug.
 */
export type BlogSlugGroup = Partial<Record<Lang, string>>;

export const BLOG_SLUG_GROUPS: BlogSlugGroup[] = [
  {
    en: "best-glasses-for-big-heads-2026",
    pl: "najlepsze-okulary-na-duza-glowe-2026",
    de: "beste-brillen-fuer-grosse-koepfe-2026",
  },
  {
    en: "what-size-sunglasses-for-wide-faces",
    de: "welche-groesse-sonnenbrille-breites-gesicht",
  },
];

/** Return the group containing `slug` in `lang`, or undefined if not translated. */
export function findSlugGroup(lang: Lang, slug: string): BlogSlugGroup | undefined {
  return BLOG_SLUG_GROUPS.find((g) => g[lang] === slug);
}

/** Locales the given slug (in `lang`) has a translation in — always includes `lang` itself. */
export function alternateLangsFor(lang: Lang, slug: string): Lang[] {
  const group = findSlugGroup(lang, slug);
  if (!group) return [lang];
  return Object.keys(group) as Lang[];
}

/** Map of `${lang}` → `/blog/<slug>` for every locale where the post exists. */
export function alternatesFor(lang: Lang, slug: string): Partial<Record<Lang, string>> {
  const group = findSlugGroup(lang, slug);
  if (!group) return {};
  const out: Partial<Record<Lang, string>> = {};
  for (const [l, s] of Object.entries(group)) {
    out[l as Lang] = `/blog/${s}`;
  }
  return out;
}
