import { useEffect, useState } from "react";

type Slide = { src: string; alt: string };

interface Props {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
}

const HeroSlideshow = ({ slides, intervalMs = 5000, className }: Props) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className ?? ""}`}>
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          width={800}
          height={1000}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
          className="woolet-desktop-hero-image absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-[3px] transition-all"
              style={{
                width: i === index ? 28 : 14,
                background: i === index ? "hsl(var(--gold))" : "hsl(0 0% 100% / 0.35)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlideshow;
