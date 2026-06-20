import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import woolet007Img from "@/assets/woolet-007.png";
import woolet009BlackAsset from "@/assets/woolet-009-black.png.asset.json";
import woolet009GreyAsset from "@/assets/woolet-009-grey.png.asset.json";
import woolet009TaupeAsset from "@/assets/woolet-009-taupe.png.asset.json";
import HeroSlideshow from "@/components/HeroSlideshow";
import { t, isValidLang, type Lang } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const slides009 = [
  { src: woolet009BlackAsset.url, alt: "Woolet 009 — Black acetate" },
  { src: woolet009GreyAsset.url, alt: "Woolet 009 — Smoke Grey acetate" },
  { src: woolet009TaupeAsset.url, alt: "Woolet 009 — Taupe acetate" },
];

const ModelPills = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [open007, setOpen007] = useState(false);
  const [open009, setOpen009] = useState(false);
  const [idx009, setIdx009] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIdx009((i) => (i + 1) % slides009.length), 3500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div>
      <div className="text-cream-dim uppercase tracking-[0.24em] mb-3" style={{ fontSize: "0.56rem" }}>
        {t(lang, "collection.title")}
      </div>
      <div className="flex gap-3 flex-col sm:flex-row">
        {/* Woolet 007 */}
        <div className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group cursor-pointer"
          style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}
          onClick={() => setOpen007(true)}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />
          <div className="w-full aspect-[3/1] mb-1.5 overflow-hidden rounded-sm">
            <img src={woolet007Img} alt="Woolet 007 round glasses" className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity" />
          </div>
          <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.5rem" }}>007</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.1rem" }}>Woolet 007</div>
          <div className="text-cream-dim" style={{ fontSize: "0.6rem" }}>{t(lang, "collection.007_specs")}</div>
        </div>

        {/* Woolet 009 */}
        <div className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group cursor-pointer"
          style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}
          onClick={() => setOpen009(true)}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />
          <div className="relative w-full aspect-[3/1] mb-1.5 overflow-hidden rounded-sm bg-woolet-white">
            {slides009.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-[1400ms] ease-in-out"
                style={{ opacity: i === idx009 ? 1 : 0 }}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
          <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.5rem" }}>009</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.1rem" }}>Woolet 009</div>
          <div className="text-cream-dim" style={{ fontSize: "0.6rem" }}>{t(lang, "collection.009_specs")}</div>
        </div>
      </div>

      {/* 007 Popup */}
      <Dialog open={open007} onOpenChange={setOpen007}>
        <DialogContent className="max-w-2xl bg-surface border-primary/10 p-2">
          <DialogTitle className="sr-only">Woolet 007</DialogTitle>
          <img src={woolet007Img} alt="Woolet 007 — round acetate glasses for wide faces" className="w-full rounded" />
        </DialogContent>
      </Dialog>

      {/* 009 Popup */}
      <Dialog open={open009} onOpenChange={setOpen009}>
        <DialogContent className="max-w-2xl bg-woolet-white border-primary/10 p-2">
          <DialogTitle className="sr-only">Woolet 009</DialogTitle>
          <div className="w-full aspect-square">
            <HeroSlideshow slides={slides009} intervalMs={3500} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelPills;
