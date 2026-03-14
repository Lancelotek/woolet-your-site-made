import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getBlogPosts } from "@/lib/blog-data";
import { t, isValidLang, type Lang } from "@/lib/i18n";

const blogSeo: Record<string, { title: string; description: string }> = {
  en: {
    title: "Blog — Woolet | Wide-Face Eyewear Insights",
    description: "Expert guides on glasses for wide faces, Italian acetate, frame sizing, and finding the perfect fit for 155mm+ face widths.",
  },
  pl: {
    title: "Blog — Woolet | Wiedza o okularach na szeroką twarz",
    description: "Poradniki o okularach na szerokie twarze, włoskim octanie, doborze oprawek i idealnym dopasowaniu dla twarzy 155mm+.",
  },
  fr: {
    title: "Blog — Woolet | Conseils lunettes visages larges",
    description: "Guides experts sur les lunettes pour visages larges, l'acétate italien et le choix des montures pour 155mm+.",
  },
  es: {
    title: "Blog — Woolet | Consejos gafas caras anchas",
    description: "Guías sobre gafas para caras anchas, acetato italiano y cómo encontrar el ajuste perfecto para 155mm+.",
  },
};

const BlogIndex = () => {
  const { lang = "en" } = useParams<{ lang: string }>();
  const currentLang: Lang = isValidLang(lang) ? lang : "en";
  const posts = getBlogPosts(currentLang);
  const seo = blogSeo[currentLang] || blogSeo.en;

  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      <SEO title={seo.title} description={seo.description} lang={currentLang} path="/blog" />

      <div className="fixed pointer-events-none z-0 rounded-full w-[700px] h-[700px] -top-[250px] -right-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 65%)" }} />

      <Navbar />

      <div className="relative z-[1] max-w-[860px] mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
        <div className="woolet-eyebrow mb-5">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">{t(currentLang, "nav.blog")}</span>
        </div>
        <h1 className="font-display text-woolet-white leading-tight mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
          {t(currentLang, "blog.title")}
        </h1>
        <p className="text-cream-dim tracking-wider mb-10 pb-8" style={{ fontSize: "0.8rem", borderBottom: "1px solid hsl(0 0% 100% / 0.055)" }}>
          {t(currentLang, "blog.subtitle")}
        </p>

        {posts.length === 0 ? (
          <p className="text-cream-dim tracking-wider" style={{ fontSize: "0.85rem" }}>
            {currentLang === "fr" ? "Articles bientôt disponibles." : currentLang === "es" ? "Artículos próximamente." : "No posts yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-0">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                to={`/${currentLang}/blog/${post.slug}`}
                className="group no-underline block py-7 sm:py-9 transition-colors hover:bg-surface/40"
                style={i < posts.length - 1 ? { borderBottom: "1px solid hsl(0 0% 100% / 0.055)" } : undefined}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-cream-dim tracking-wider" style={{ fontSize: "0.6rem" }}>
                      {new Date(post.date).toLocaleDateString(currentLang, { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span className="text-cream-dim opacity-30" style={{ fontSize: "0.5rem" }}>•</span>
                    <span className="text-cream-dim tracking-wider" style={{ fontSize: "0.6rem" }}>
                      {post.readTime} {t(currentLang, "blog.min_read")}
                    </span>
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-primary/70 uppercase tracking-[0.2em] border border-primary/15 px-2 py-0.5"
                        style={{ fontSize: "0.48rem" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-woolet-white group-hover:text-gold-light transition-colors leading-snug" style={{ fontSize: "1.3rem", fontWeight: 400 }}>
                    {post.title}
                  </h2>
                  <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.8rem" }}>
                    {post.excerpt}
                  </p>
                  <span className="text-primary uppercase tracking-[0.22em] group-hover:tracking-[0.28em] transition-all" style={{ fontSize: "0.56rem" }}>
                    {t(currentLang, "blog.read_more")} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogIndex;
