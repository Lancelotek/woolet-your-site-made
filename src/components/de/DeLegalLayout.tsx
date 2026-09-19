import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

type Section = { title: string; content: React.ReactNode };

export default function DeLegalLayout({ title, description, sections }: { title: string; description: string; sections: Section[] }) {
  const slug = title === "Impressum" ? "impressum" : "widerruf";
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Helmet>
        <html lang="de" />
        <title>{title} | Woolet</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://woolet.co/de/${slug}`} />
        <meta property="og:title" content={`${title} | Woolet`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://woolet.co/de/${slug}`} />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <header className="border-b border-border-sub px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/de" className="font-display text-2xl text-foreground no-underline">Woolet</Link>
          <Link to="/de" className="font-body text-xs uppercase tracking-[0.2em] text-cream-dim no-underline hover:text-primary">Zurück</Link>
        </div>
      </header>
      <article className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
        <p className="mb-4 font-body text-xs uppercase tracking-[0.24em] text-primary">Rechtliches</p>
        <h1 className="mb-12 text-5xl font-normal text-foreground md:text-6xl">{title}</h1>
        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={section.title} className="border-t border-border-sub pt-8">
              <p className="mb-3 font-body text-xs text-primary">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mb-4 text-2xl font-normal text-foreground">{section.title}</h2>
              <div className="space-y-3 font-body text-[15px] leading-7 text-cream-dim">{section.content}</div>
            </section>
          ))}
        </div>
      </article>
      <Footer lang="de" />
    </main>
  );
}