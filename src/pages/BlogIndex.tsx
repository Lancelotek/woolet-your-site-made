import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBlogPosts } from "@/lib/blog-data";
import { t, type Lang } from "@/lib/i18n";

const BlogIndex = () => {
  const { lang = "en" } = useParams<{ lang: string }>();
  const posts = getBlogPosts(lang as Lang);

  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      <div className="fixed pointer-events-none z-0 rounded-full w-[700px] h-[700px] -top-[250px] -right-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 65%)" }} />

      <Navbar />

      <div className="relative z-[1] max-w-[860px] mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
        <div className="woolet-eyebrow mb-5">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">{t(lang as Lang, "nav.blog")}</span>
        </div>
        <h1 className="font-display text-woolet-white leading-tight mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
          {t(lang as Lang, "blog.title")}
        </h1>
        <p className="text-cream-dim tracking-wider mb-10 pb-8" style={{ fontSize: "0.8rem", borderBottom: "1px solid hsl(0 0% 100% / 0.055)" }}>
          {t(lang as Lang, "blog.subtitle")}
        </p>

        {posts.length === 0 ? (
          <p className="text-cream-dim tracking-wider" style={{ fontSize: "0.85rem" }}>
            {lang === "fr" ? "Articles bientôt disponibles." : lang === "es" ? "Artículos próximamente." : "No posts yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-0">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                to={`/${lang}/blog/${post.slug}`}
                className="group no-underline block py-7 sm:py-9 transition-colors hover:bg-surface/40"
                style={i < posts.length - 1 ? { borderBottom: "1px solid hsl(0 0% 100% / 0.055)" } : undefined}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-cream-dim tracking-wider" style={{ fontSize: "0.6rem" }}>
                      {new Date(post.date).toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span className="text-cream-dim opacity-30" style={{ fontSize: "0.5rem" }}>•</span>
                    <span className="text-cream-dim tracking-wider" style={{ fontSize: "0.6rem" }}>
                      {post.readTime} {t(lang as Lang, "blog.min_read")}
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
                    {t(lang as Lang, "blog.read_more")} →
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
