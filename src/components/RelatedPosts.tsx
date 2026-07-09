import { Link } from "react-router-dom";
import { getBlogPosts, type BlogPost } from "@/lib/blog-data";
import type { Lang } from "@/lib/i18n";

interface RelatedPostsProps {
  currentSlug: string;
  lang: Lang;
  limit?: number;
}

const SITE_URL = "https://woolet.co";
const HEADING_ID = "related-posts-heading";

/** Pick related posts by tag overlap, falling back to most-recent siblings. */
function pickRelated(all: BlogPost[], current: BlogPost, limit: number): BlogPost[] {
  const others = all.filter((p) => p.slug !== current.slug);
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));

  const scored = others.map((p) => {
    const overlap = p.tags.reduce(
      (n, t) => (currentTags.has(t.toLowerCase()) ? n + 1 : n),
      0,
    );
    return { p, overlap, date: new Date(p.date).getTime() };
  });

  scored.sort((a, b) => b.overlap - a.overlap || b.date - a.date);
  return scored.slice(0, limit).map((s) => s.p);
}

const RelatedPosts = ({ currentSlug, lang, limit = 3 }: RelatedPostsProps) => {
  const all = getBlogPosts(lang);
  const current = all.find((p) => p.slug === currentSlug);
  if (!current) return null;

  const related = pickRelated(all, current, limit);
  if (related.length === 0) return null;

  const heading =
    lang === "pl" ? "Powiązane wpisy"
    : lang === "fr" ? "Articles liés"
    : lang === "es" ? "Artículos relacionados"
    : lang === "de" ? "Verwandte Artikel"
    : lang === "ja" ? "関連記事"
    : lang === "ar" ? "مقالات ذات صلة"
    : "Related posts";

  const readLabel =
    lang === "pl" ? "min czytania"
    : lang === "fr" ? "min de lecture"
    : lang === "es" ? "min de lectura"
    : lang === "de" ? "Min. Lesezeit"
    : lang === "ja" ? "分で読める"
    : lang === "ar" ? "دقيقة قراءة"
    : "min read";

  const readMore =
    lang === "pl" ? "Czytaj artykuł"
    : lang === "fr" ? "Lire l'article"
    : lang === "es" ? "Leer el artículo"
    : lang === "de" ? "Artikel lesen"
    : lang === "ja" ? "記事を読む"
    : lang === "ar" ? "اقرأ المقال"
    : "Read article";

  // ItemList JSON-LD helps search engines understand the internal link
  // cluster and can qualify the page for a carousel result.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: related.length,
    itemListElement: related.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/${lang}/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <nav
      className="mt-16"
      aria-labelledby={HEADING_ID}
      role="navigation"
      style={{
        borderTop: "1px solid hsl(var(--cream-dim) / 0.18)",
        paddingTop: "2.5rem",
      }}
    >
      <h2
        id={HEADING_ID}
        className="font-display mb-8"
        style={{
          fontSize: "1.35rem",
          letterSpacing: "-0.005em",
          color: "hsl(var(--woolet-white))",
        }}
      >
        {heading}
      </h2>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
        {related.map((p) => {
          const href = `/${lang}/blog/${p.slug}`;
          return (
            <li key={p.slug}>
              <article
                itemScope
                itemType="https://schema.org/Article"
                style={{ height: "100%" }}
              >
                <Link
                  to={href}
                  rel="bookmark"
                  hrefLang={lang}
                  title={p.title}
                  aria-label={`${p.title} — ${readMore}`}
                  itemProp="url"
                  className="group block h-full no-underline transition-colors"
                  style={{
                    border: "1px solid hsl(var(--cream-dim) / 0.18)",
                    padding: "1.15rem 1.15rem 1.25rem",
                    background: "hsl(var(--panel) / 0.5)",
                    color: "inherit",
                  }}
                >
                  <div
                    className="uppercase mb-3"
                    style={{
                      fontSize: "0.66rem",
                      letterSpacing: "0.22em",
                      color: "hsl(var(--gold))",
                    }}
                    itemProp="articleSection"
                  >
                    {p.tags[0] ?? "Guide"}
                  </div>
                  <h3
                    className="font-display leading-snug mb-3 group-hover:text-primary transition-colors"
                    style={{
                      fontSize: "1.02rem",
                      color: "hsl(var(--woolet-white))",
                    }}
                    itemProp="headline"
                  >
                    {p.title}
                  </h3>
                  <p
                    className="m-0"
                    style={{
                      fontSize: "0.82rem",
                      lineHeight: 1.55,
                      color: "hsl(var(--cream-dim))",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                    itemProp="description"
                  >
                    {p.excerpt}
                  </p>
                  <div
                    className="mt-4 flex items-center justify-between uppercase"
                    style={{
                      fontSize: "0.64rem",
                      letterSpacing: "0.2em",
                      color: "hsl(var(--cream-dim) / 0.75)",
                    }}
                  >
                    <time dateTime={p.date} itemProp="datePublished">
                      {p.readTime} {readLabel}
                    </time>
                    <span
                      aria-hidden="true"
                      style={{ color: "hsl(var(--gold))" }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </nav>
  );
};

export default RelatedPosts;
