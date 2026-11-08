import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BESPOKE_FACTS } from "@/content/bespokeFacts";
import { BESPOKE_COPY } from "@/content/bespokePrices";
import { BESPOKE_VIDEO as V, bespokeVideoJsonLd } from "@/content/bespokeVideo";

/**
 * Video watch page for the Bespoke YouTube Short. The video is the first and
 * largest element above the fold - Search Console only indexes videos that are
 * the main content of their page ("Video isn't on a watch page" otherwise).
 */
const BespokeVideo = () => {
  const jsonLd = [
    bespokeVideoJsonLd(),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://woolet.co/en" },
        { "@type": "ListItem", position: 2, name: "Bespoke", item: "https://woolet.co/en/bespoke" },
        { "@type": "ListItem", position: 3, name: "Video", item: `https://woolet.co${V.path}` },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Woolet Bespoke video - how made-to-measure glasses are built"
        description={V.metaDescription}
        lang="en"
        path="/bespoke/video"
        type="article"
        image={V.thumbnailUrl}
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="bg-background text-foreground min-h-screen">
        <section className="w-full px-5 sm:px-8 lg:px-16 pt-8 pb-14 sm:pt-14 sm:pb-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-10 lg:gap-14 items-start">
            <div
              className="relative overflow-hidden mx-auto w-full"
              style={{
                maxWidth: 420,
                aspectRatio: "9 / 16",
                maxHeight: "82vh",
                background: "hsl(var(--background))",
                boxShadow: "0 30px 80px -30px hsl(0 0% 0% / 0.6)",
              }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${V.youtubeId}?playsinline=1&rel=0`}
                title={V.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="block w-full h-full border-0"
              />
            </div>

            <div className="flex flex-col">
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">BESPOKE · VIDEO · {V.durationLabel.toUpperCase()}</span>
              </div>
              <h1
                className="font-display text-woolet-white leading-[1.02] mb-6"
                style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.8rem)", fontWeight: 300 }}
              >
                {V.h1}
              </h1>
              <p className="text-cream-dim leading-relaxed mb-8" style={{ fontSize: "1rem" }}>
                {V.description}
              </p>

              <h2 className="font-display text-woolet-white mb-4" style={{ fontSize: "1.35rem", fontWeight: 300 }}>
                What the video shows
              </h2>
              <ol className="text-cream-dim leading-relaxed mb-8 space-y-3 list-decimal pl-5" style={{ fontSize: "0.95rem" }}>
                {V.steps.map((s) => (
                  <li key={s.title}>
                    <strong className="text-gold-light font-normal">{s.title}</strong> - {s.text}
                  </li>
                ))}
              </ol>

              <p className="text-cream-dim leading-relaxed mb-8" style={{ fontSize: "0.9rem" }}>
                {BESPOKE_FACTS.name}: front width {BESPOKE_FACTS.frontWidth}, bridge {BESPOKE_FACTS.bridge}, temples{" "}
                {BESPOKE_FACTS.temples}. {BESPOKE_COPY.frame} USD with free worldwide shipping, {BESPOKE_FACTS.warranty} warranty.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-5">
                <Link
                  to="/en/bespoke/configurator"
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    padding: "18px 32px",
                  }}
                >
                  Build your frame →
                </Link>
                <Link to="/en/bespoke" className="text-gold-light underline underline-offset-4 text-sm">
                  Everything about Woolet Bespoke
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BespokeVideo;
