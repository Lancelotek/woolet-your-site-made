import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getBlogPost } from "@/lib/blog-data";
import { t, isValidLang, type Lang } from "@/lib/i18n";

/* ── helpers ── */

/** Extract H2 headings from HTML string */
function extractH2s(html: string): { id: string; text: string }[] {
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const results: { id: string; text: string }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, "");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    results.push({ id, text });
  }
  return results;
}

/** Detect size-breakdown lists and add IDs to H2s, inject inline CTAs after every 3rd H2 */
function processContent(html: string, lang: Lang): string {
  // Add IDs to H2s
  let h2Count = 0;
  let processed = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (full, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, "");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    h2Count++;

    const ctaText = lang === "pl"
      ? "Woolet jest projektowany dla twarzy 155mm+. Dołącz do listy oczekujących."
      : "Woolet is engineered for faces 155mm+. Join the waitlist.";
    const ctaBtn = lang === "pl" ? "Dołącz" : "Join Waitlist";

    let cta = "";
    if (h2Count > 1 && (h2Count - 1) % 3 === 0) {
      cta = `<div class="woolet-inline-cta"><p>${ctaText}</p><a href="/${lang}#waitlist-form">${ctaBtn}</a></div>`;
    }

    return `${cta}<h2 id="${id}"${attrs}>${inner}</h2>`;
  });

  // Convert size-breakdown UL (lists with mm ranges) to styled table
  processed = processed.replace(/<ul>\s*(<li>.*?<\/li>\s*){2,}<\/ul>/gis, (ulBlock) => {
    const liRegex = /<li>(.*?)<\/li>/gis;
    const items: string[] = [];
    let m;
    while ((m = liRegex.exec(ulBlock)) !== null) items.push(m[1]);

    // Check if this looks like a size breakdown (contains mm ranges)
    const isSizeTable = items.filter(i => /\d+[\s–—-]+\d*mm/i.test(i)).length >= 3;
    if (!isSizeTable) return ulBlock;

    const rows = items.map(item => {
      const clean = item.replace(/<\/?strong>/g, "");
      // Try to split on " — " or " – "
      const parts = clean.split(/\s*[—–]\s*/);
      const label = parts[0]?.trim() || "";
      const rest = parts.slice(1).join(" — ").trim();
      const isHighlight = /155mm\+|155\+/i.test(label);
      return `<div class="woolet-size-row${isHighlight ? " woolet-size-row--highlight" : ""}"><span class="woolet-size-label">${label}</span><span class="woolet-size-desc">${rest}</span></div>`;
    });

    return `<div class="woolet-size-table">${rows.join("")}</div>`;
  });

  return processed;
}

/* ── Reading Progress Bar ── */
const ReadingProgress = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setWidth(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="woolet-reading-progress" style={{ width: `${width}%` }} />;
};

/* ── Table of Contents ── */
const TableOfContents = ({ headings, lang }: { headings: { id: string; text: string }[]; lang: Lang }) => {
  const [open, setOpen] = useState(false);
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  useEffect(() => {
    if (isDesktop) setOpen(true);
  }, []);

  if (headings.length < 4) return null;

  const title = lang === "pl" ? "W tym artykule" : lang === "fr" ? "Dans ce guide" : lang === "es" ? "En esta guía" : "In this guide";

  return (
    <div className="woolet-toc">
      <div className="woolet-toc-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span style={{ fontSize: "0.7rem", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </div>
      {open && (
        <div className="woolet-toc-list">
          {headings.map(h => (
            <a key={h.id} href={`#${h.id}`} onClick={e => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
            }}>
              {h.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Blog Post Page ── */
const BlogPost = () => {
  const { lang = "en", slug = "" } = useParams<{ lang: string; slug: string }>();
  const currentLang: Lang = isValidLang(lang) ? lang : "en";
  const post = getBlogPost(currentLang, slug);

  const headings = useMemo(() => post ? extractH2s(post.content) : [], [post]);
  const processedContent = useMemo(() => post ? processContent(post.content, currentLang) : "", [post, currentLang]);

  if (!post) {
    return <Navigate to={`/${currentLang}/blog`} replace />;
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      <SEO
        title={post.title}
        description={post.excerpt}
        lang={currentLang}
        path={`/blog/${post.slug}`}
        type="article"
        publishedTime={post.date}
        article={{ readTime: post.readTime, tags: post.tags }}
      />

      <ReadingProgress />

      <div className="fixed pointer-events-none z-0 rounded-full w-[700px] h-[700px] -top-[250px] -right-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 65%)" }} />

      <Navbar />

      <article className="relative z-[1] max-w-[680px] mx-auto px-5 sm:px-8 py-10 sm:py-20 w-full"
        style={{ paddingLeft: "max(20px, env(safe-area-inset-left))", paddingRight: "max(20px, env(safe-area-inset-right))" }}>

        {/* Breadcrumb */}
        <Link
          to={`/${currentLang}/blog`}
          className="no-underline inline-flex items-center gap-1.5 mb-8 transition-colors hover:text-foreground"
          style={{ color: "hsl(var(--cream-dim))", fontSize: "0.78rem" }}
        >
          ← {currentLang === "pl" ? "Blog" : "Blog"}
        </Link>

        {/* Title */}
        <h1 className="font-display text-woolet-white leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
          {post.title}
        </h1>

        {/* Meta bar */}
        <div className="flex items-center gap-2 mb-8" style={{ color: "hsl(var(--cream-dim))", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          <span>{formattedDate}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{post.readTime} min read</span>
        </div>

        <div className="woolet-divider mb-8" />

        {/* TOC */}
        <TableOfContents headings={headings} lang={currentLang} />

        {/* Article body */}
        <div
          className="woolet-blog-content"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        <div className="woolet-divider my-12" />

        <Link to={`/${currentLang}/blog`} className="text-primary no-underline uppercase tracking-[0.22em] hover:tracking-[0.28em] transition-all" style={{ fontSize: "0.58rem" }}>
          {t(currentLang, "blog.back")}
        </Link>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
