import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBlogPost } from "@/lib/blog-data";
import { t, type Lang } from "@/lib/i18n";

const BlogPost = () => {
  const { lang = "en", slug = "" } = useParams<{ lang: string; slug: string }>();
  const post = getBlogPost(lang as Lang, slug);

  if (!post) {
    return <Navigate to={`/${lang}/blog`} replace />;
  }

  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      <div className="fixed pointer-events-none z-0 rounded-full w-[700px] h-[700px] -top-[250px] -right-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 65%)" }} />

      <Navbar />

      <article className="relative z-[1] max-w-[760px] mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
        <Link to={`/${lang}/blog`} className="text-cream-dim no-underline uppercase tracking-[0.22em] hover:text-primary transition-colors mb-8 inline-block" style={{ fontSize: "0.58rem" }}>
          {t(lang as Lang, "blog.back")}
        </Link>

        <div className="flex items-center gap-3 flex-wrap mb-5">
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

        <h1 className="font-display text-woolet-white leading-tight mb-8" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
          {post.title}
        </h1>

        <div className="woolet-divider mb-10" />

        <div
          className="woolet-blog-content text-cream-dim leading-relaxed tracking-wider space-y-4"
          style={{ fontSize: "0.88rem" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="woolet-divider my-12" />

        <Link to={`/${lang}/blog`} className="text-primary no-underline uppercase tracking-[0.22em] hover:tracking-[0.28em] transition-all" style={{ fontSize: "0.58rem" }}>
          {t(lang as Lang, "blog.back")}
        </Link>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
