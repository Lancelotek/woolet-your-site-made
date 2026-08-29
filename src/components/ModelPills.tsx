import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ovalHavana from "@/assets/frames-2026/oval-havana.asset.json";
import ovalBlack from "@/assets/frames-2026/oval-black.asset.json";
import ovalCrystal from "@/assets/frames-2026/oval-crystal.asset.json";
import squareHavana from "@/assets/frames-2026/square-havana.asset.json";
import squareBlack from "@/assets/frames-2026/square-black.asset.json";
import squareCrystal from "@/assets/frames-2026/square-crystal.asset.json";
import { hrefFor } from "@/i18n/routeRegistry";
import { t, isValidLang, type Lang } from "@/lib/i18n";
import { pushGtmEvent } from "@/lib/gtm";

const slides007 = [
  { src: ovalHavana.url, alt: "Woolet 007 — round panto Italian acetate glasses in dark tortoise, front view" },
  { src: ovalBlack.url, alt: "Woolet 007 — round panto Italian acetate glasses in black, front view" },
  { src: ovalCrystal.url, alt: "Woolet 007 — round panto Italian acetate glasses in crystal, front view" },
];

const slides009 = [
  { src: squareHavana.url, alt: "Woolet 009 — soft-square Italian acetate glasses in havana, front view" },
  { src: squareBlack.url, alt: "Woolet 009 — soft-square Italian acetate glasses in black, front view" },
  { src: squareCrystal.url, alt: "Woolet 009 — soft-square Italian acetate glasses in crystal, front view" },
];

type ModelPillsProps = {
  /** @deprecated Collection now sends visitors to the Kickstarter LP instead of a waitlist anchor. */
  waitlistAnchor?: string;
};

const ModelPills = (_props: ModelPillsProps = {}) => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [idx007, setIdx007] = useState(0);
  const [idx009, setIdx009] = useState(0);
  useEffect(() => {
    const a = window.setInterval(() => setIdx007((i) => (i + 1) % slides007.length), 3500);
    const b = window.setInterval(() => setIdx009((i) => (i + 1) % slides009.length), 3500);
    return () => { window.clearInterval(a); window.clearInterval(b); };
  }, []);

  const modelCard = (
    sku: "007" | "009",
    slides: { src: string; alt: string }[],
    idx: number,
    name: string,
    specsKey: "collection.007_specs" | "collection.009_specs"
  ) => {
    const pdpHref = hrefFor(sku === "007" ? "products.007" : "products.009", lang);
    const track = (label: string) =>
      pushGtmEvent("collection_pdp_click", {
        location: "collection_model_pill",
        dest: "pdp",
        cta_label: label,
        sku,
      });

    return (
      <div
        className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group"
        style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />

        <Link
          to={pdpHref}
          onClick={() => track("image")}
          aria-label={`Woolet ${sku} — view product page`}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] mb-1.5 overflow-hidden rounded-sm bg-black block no-underline"
        >
          {slides.map((s, i) => (
            <img
              key={s.src}
              src={s.src}
              alt={s.alt}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-[1400ms] ease-in-out"
              style={{ opacity: i === idx ? 1 : 0 }}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
              width={1600}
              height={900}
              sizes="(min-width: 640px) 480px, 90vw"
            />
          ))}
        </Link>

        <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.72rem" }}>{sku}</div>
        <Link
          to={pdpHref}
          onClick={() => track("title")}
          className="font-display text-woolet-white no-underline hover:text-primary transition-colors"
          style={{ fontSize: "1.25rem" }}
        >
          {name}
        </Link>

        <div className="flex items-baseline gap-2" style={{ fontFamily: "Barlow, sans-serif" }}>
          <span className="text-primary" style={{ fontSize: "1rem", fontWeight: 500 }}>$114</span>
          <span className="text-cream-dim uppercase tracking-[0.16em]" style={{ fontSize: "0.66rem" }}>founding</span>
          <span className="text-cream-dim/70" style={{ fontSize: "0.78rem", textDecoration: "line-through" }}>$190</span>
          <span className="text-cream-dim/70" style={{ fontSize: "0.72rem" }}>after launch</span>
        </div>

        <div className="text-cream-dim" style={{ fontSize: "0.78rem" }}>{t(lang, specsKey)}</div>

        <Link
          to={pdpHref}
          onClick={() => track("primary_cta")}
          className="mt-2 inline-flex items-center justify-center uppercase tracking-[0.22em] transition-colors self-start no-underline"
          style={{
            background: "hsl(var(--gold))",
            color: "hsl(var(--background))",
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.72rem",
            padding: "12px 20px",
          }}
        >
          See {sku} — $114
        </Link>
      </div>
    );
  };

  return (
    <div>
      <div className="text-cream-dim uppercase tracking-[0.24em] mb-3" style={{ fontSize: "0.72rem" }}>
        {t(lang, "collection.title")}
      </div>
      <div className="flex gap-3 flex-col sm:flex-row">
        {modelCard("007", slides007, idx007, "Woolet 007", "collection.007_specs")}
        {modelCard("009", slides009, idx009, "Woolet 009", "collection.009_specs")}
      </div>
    </div>
  );
};

export default ModelPills;
