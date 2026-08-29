import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Frame } from "@/data/frames";

interface FrameGalleryProps {
  frame: Frame | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FrameGallery = ({ frame, open, onOpenChange }: FrameGalleryProps) => {
  const [idx, setIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (open) {
      setIdx(0);
      setShowAll(false);
    }
  }, [open, frame?.id]);

  if (!frame) return null;

  const images = frame.gallery;
  const THUMB_CAP = 12;
  const visibleThumbs = showAll ? images : images.slice(0, THUMB_CAP);
  const hiddenCount = images.length - THUMB_CAP;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl p-0 gap-0 border-cream/10 bg-[#0c0c0c] text-cream overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") prev();
          if (e.key === "ArrowRight") next();
        }}
      >
        <DialogTitle className="sr-only">
          {frame.name} ({frame.id.toUpperCase()}) — photo gallery
        </DialogTitle>
        <DialogDescription className="sr-only">
          {images.length} photos of the Woolet {frame.name} frame, view {idx + 1} of {images.length}.
        </DialogDescription>

        {/* Header */}
        <div className="flex items-baseline justify-between gap-4 px-6 pt-5 pb-3 border-b border-cream/10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-gold-light/80">
              {frame.id.toUpperCase()} · {frame.shape}
            </div>
            <h2 className="font-display text-cream text-2xl font-light mt-0.5">{frame.name}</h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cream-dim">
            {frame.widthMm} mm · {frame.bridgeMm} mm bridge
          </div>
        </div>

        {/* Main image */}
        <div className="relative bg-[#f4f1ec]">
          <img
            key={images[idx]}
            src={images[idx]}
            alt={`Woolet ${frame.id} ${frame.name} — view ${idx + 1} of ${images.length}`}
            loading="eager"
            className="block w-full h-[58vh] sm:h-[62vh] object-contain animate-in fade-in duration-300"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0c0c0c]/70 text-cream backdrop-blur-sm flex items-center justify-center hover:bg-[#0c0c0c]/90 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0c0c0c]/70 text-cream backdrop-blur-sm flex items-center justify-center hover:bg-[#0c0c0c]/90 transition"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-[#0c0c0c]/70 text-cream text-[10px] tracking-[0.2em] uppercase">
                {idx + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div className="px-5 py-4 border-t border-cream/10 max-h-[26vh] overflow-y-auto">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {visibleThumbs.map((src, i) => {
              const active = i === idx;
              return (
                <button
                  key={src}
                  onClick={() => setIdx(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={`relative aspect-square bg-[#f4f1ec] overflow-hidden transition ${
                    active ? "ring-2 ring-gold" : "ring-1 ring-cream/10 hover:ring-cream/30"
                  }`}
                  style={{ borderRadius: 2 }}
                >
                  <img
                    src={src}
                    alt={`Woolet ${frame.id} ${frame.name} — thumbnail ${i + 1}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              );
            })}
            {!showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="aspect-square flex items-center justify-center text-[10px] uppercase tracking-[0.18em] text-cream-dim border border-cream/15 hover:text-cream hover:border-cream/40 transition"
                style={{ borderRadius: 2 }}
              >
                +{hiddenCount} more
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close gallery"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0c0c0c]/70 text-cream flex items-center justify-center hover:bg-[#0c0c0c]/90 transition"
        >
          <X size={16} />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default FrameGallery;
