import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ovalHavana from "@/assets/frames-2026/oval-havana.asset.json";
import ovalBlack from "@/assets/frames-2026/oval-black.asset.json";
import ovalCrystal from "@/assets/frames-2026/oval-crystal.asset.json";
import squareHavana from "@/assets/frames-2026/square-havana.asset.json";
import squareBlack from "@/assets/frames-2026/square-black.asset.json";
import squareCrystal from "@/assets/frames-2026/square-crystal.asset.json";
import { t, isValidLang, type Lang } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

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
  waitlistAnchor?: string;
};

const ModelPills = ({ waitlistAnchor }: ModelPillsProps = {}) => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [open007, setOpen007] = useState(false);
  const [open009, setOpen009] = useState(false);
  const [idx007, setIdx007] = useState(0);
  const [idx009, setIdx009] = useState(0);
  useEffect(() => {
    const a = window.setInterval(() => setIdx007((i) => (i + 1) % slides007.length), 3500);
    const b = window.setInterval(() => setIdx009((i) => (i + 1) % slides009.length), 3500);
    return () => { window.clearInterval(a); window.clearInterval(b); };
  }, []);

  const scrollToWaitlist = (e: React.MouseEvent) => {
    if (!waitlistAnchor) return;
    e.preventDefault();
    if (typeof document === "undefined") return;
    const el = document.getElementById(waitlistAnchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cardClickHandler = (openSetter: (v: boolean) => void) =>
    waitlistAnchor ? scrollToWaitlist : () => openSetter(true);

  const waitlistCta = (
    <div
      className="mt-2 inline-flex items-center justify-center uppercase tracking-[0.22em] transition-colors"
      style={{
        background: "hsl(var(--gold))",
        color: "hsl(var(--background))",
        fontFamily: "Barlow, sans-serif",
        fontWeight: 500,
        fontSize: "0.72rem",
        padding: "12px 20px",
        alignSelf: "flex-start",
      }}
    >
      Join the waitlist
    </div>
  );

  return (
    <div>
      <div className="text-cream-dim uppercase tracking-[0.24em] mb-3" style={{ fontSize: "0.72rem" }}>
        {t(lang, "collection.title")}
      </div>
      <div className="flex gap-3 flex-col sm:flex-row">
        {/* Woolet 007 */}
        <div className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group cursor-pointer"
          style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}
          onClick={cardClickHandler(setOpen007)}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] mb-1.5 overflow-hidden rounded-sm bg-black">
            {slides007.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-in-out"
                style={{ opacity: i === idx007 ? 1 : 0 }}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                width={880}
                height={1824}
                sizes="(min-width: 640px) 480px, 90vw"
              />
            ))}
          </div>
          <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.72rem" }}>007</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.25rem" }}>Woolet 007</div>
          <div className="text-cream-dim" style={{ fontSize: "0.78rem" }}>{t(lang, "collection.007_specs")}</div>
          {waitlistAnchor && waitlistCta}
        </div>

        {/* Woolet 009 */}
        <div className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group cursor-pointer"
          style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}
          onClick={cardClickHandler(setOpen009)}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] mb-1.5 overflow-hidden rounded-sm bg-black">
            {slides009.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-in-out"
                style={{ opacity: i === idx009 ? 1 : 0 }}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                width={880}
                height={1824}
                sizes="(min-width: 640px) 480px, 90vw"
              />
            ))}
          </div>
          <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.72rem" }}>009</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.25rem" }}>Woolet 009</div>
          <div className="text-cream-dim" style={{ fontSize: "0.78rem" }}>{t(lang, "collection.009_specs")}</div>
          {waitlistAnchor && waitlistCta}
        </div>
      </div>

      {/* 007 Popup */}
      <Dialog open={open007} onOpenChange={setOpen007}>
        <DialogContent className="max-w-2xl bg-woolet-white border-primary/10 p-2">
          <DialogTitle className="sr-only">Woolet 007</DialogTitle>
          <div className="relative w-full aspect-square bg-woolet-white rounded overflow-hidden">
            {slides007.map((s, i) => (
              <img key={s.src} src={s.src} alt={s.alt} className="absolute inset-0 w-full h-full object-contain transition-opacity duration-[1400ms]" style={{ opacity: i === idx007 ? 1 : 0 }} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 009 Popup */}
      <Dialog open={open009} onOpenChange={setOpen009}>
        <DialogContent className="max-w-2xl bg-woolet-white border-primary/10 p-2">
          <DialogTitle className="sr-only">Woolet 009</DialogTitle>
          <div className="relative w-full aspect-square bg-woolet-white rounded overflow-hidden">
            {slides009.map((s, i) => (
              <img key={s.src} src={s.src} alt={s.alt} className="absolute inset-0 w-full h-full object-contain transition-opacity duration-[1400ms]" style={{ opacity: i === idx009 ? 1 : 0 }} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelPills;
