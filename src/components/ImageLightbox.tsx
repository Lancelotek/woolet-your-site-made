import { useEffect, useRef, useState } from "react";

/**
 * Shared fullscreen image lightbox (Kickstarter LP + product pages).
 * Square corners, quiet-luxury palette, swipe + cross-fade, optional CTA bar
 * and an end card instead of looping past the last image.
 */

const CREAM = "#EDE9DE";
const TAUPE = "#BAAFA1";
const GOLD = "#CAA449";
const BRONZE = "#8A6E2E";
const HAIRLINE = "rgba(255,255,255,0.10)";

export type LightboxImage = { src: string; alt: string };

export type ImageLightboxProps = {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  isMobile?: boolean;
  /** Gold conversion button pinned to the bottom of the lightbox. */
  cta?: { label: string; caption?: string; onClick: (index: number) => void };
  /** Shown after the last image instead of wrapping back to the first. */
  endCard?: { headline: string };
  /** Fades the overlay out while the parent keeps it mounted for the transition. */
  visible?: boolean;
};

const ImageLightbox = ({
  images,
  index,
  onIndexChange,
  onClose,
  isMobile = false,
  cta,
  endCard,
  visible = true,
}: ImageLightboxProps) => {
  const [atEnd, setAtEnd] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const showPrev = () => {
    if (atEnd) {
      setAtEnd(false);
      return;
    }
    onIndexChange((index - 1 + images.length) % images.length);
  };

  const showNext = () => {
    if (atEnd) return;
    if (index === images.length - 1) {
      if (endCard) {
        setAtEnd(true);
        return;
      }
      onIndexChange(0);
      return;
    }
    onIndexChange(index + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const current = images[Math.min(index, images.length - 1)];
  const ctaBarHeight = cta ? (cta.caption ? 118 : 86) : 0;

  const arrowStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${HAIRLINE}`,
    color: CREAM,
    fontSize: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      // Close on pointerdown, not click: on iOS the synthesized click after
      // touchend would otherwise land on the zoom-in image underneath.
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(8,8,7,0.96)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `24px 24px ${24 + ctaBarHeight}px`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 200ms ease",
      }}
    >
      <style>{`
        @keyframes wlLbFade { from { opacity: 0 } to { opacity: 1 } }
        .wl-lb-img { animation: wlLbFade 260ms ease both; }
        @media (prefers-reduced-motion: reduce) { .wl-lb-img { animation: none; } }
      `}</style>

      <button
        ref={closeButtonRef}
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close lightbox"
        style={{
          position: "absolute",
          top: "calc(12px + env(safe-area-inset-top))",
          right: 12,
          width: 48,
          height: 48,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: CREAM,
          fontSize: 28,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          borderRadius: 0,
        }}
      >
        ×
      </button>

      {!isMobile && (
        <>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous image"
            style={{ ...arrowStyle, position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
          >
            ‹
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next image"
            style={{ ...arrowStyle, position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}
          >
            ›
          </button>
        </>
      )}

      <div
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStartRef.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touchStartRef.current;
          touchStartRef.current = null;
          if (!start) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
            onClose();
            return;
          }
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) showNext();
            else showPrev();
          }
        }}
        style={{
          maxWidth: "min(100%, 900px)",
          maxHeight: "min(90vh, 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {atEnd && endCard ? (
          <div
            className="wl-lb-img"
            style={{
              border: `1px solid ${HAIRLINE}`,
              padding: "56px 28px",
              textAlign: "center",
              maxWidth: 520,
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(28px, 6vw, 40px)",
                color: CREAM,
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              {endCard.headline}
            </p>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setAtEnd(false);
                onIndexChange(0);
              }}
              style={{
                marginTop: 24,
                background: "transparent",
                border: `1px solid ${HAIRLINE}`,
                color: TAUPE,
                fontFamily: "Barlow, sans-serif",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "12px 20px",
                cursor: "pointer",
                borderRadius: 0,
              }}
            >
              See the photos again
            </button>
          </div>
        ) : (
          <img
            className="wl-lb-img"
            key={current.src}
            src={current.src}
            alt={current.alt}
            decoding="async"
            style={{
              maxWidth: "100%",
              maxHeight: isMobile ? "calc(78vh - 80px)" : "calc(88vh - 80px)",
              objectFit: "contain",
              display: "block",
              border: `1px solid ${HAIRLINE}`,
            }}
          />
        )}

        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Previous image"
              style={arrowStyle}
            >
              ‹
            </button>
            <p
              style={{
                color: TAUPE,
                fontSize: 13,
                letterSpacing: "0.04em",
                fontFamily: "Barlow, sans-serif",
                textAlign: "center",
                margin: 0,
                minWidth: 64,
              }}
            >
              {atEnd ? `${images.length} / ${images.length}` : `${index + 1} / ${images.length}`}
            </p>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
              style={arrowStyle}
            >
              ›
            </button>
          </div>
        ) : (
          <p
            style={{
              color: TAUPE,
              fontSize: 13,
              letterSpacing: "0.04em",
              fontFamily: "Barlow, sans-serif",
              textAlign: "center",
              margin: 0,
            }}
          >
            {atEnd ? `${images.length} / ${images.length}` : `${index + 1} / ${images.length}`}
          </p>
        )}
      </div>

      {cta && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "14px 16px calc(14px + env(safe-area-inset-bottom))",
            background: "rgba(8,8,7,0.96)",
            borderTop: `1px solid ${HAIRLINE}`,
            zIndex: 3,
          }}
        >
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cta.onClick(index);
              }}
              style={{
                width: "100%",
                background: GOLD,
                color: "#080807",
                border: "none",
                borderRadius: 0,
                padding: "16px 24px",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRONZE)}
              onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
            >
              {cta.label}
            </button>
            {cta.caption && (
              <p
                style={{
                  margin: "10px 0 0",
                  textAlign: "center",
                  color: TAUPE,
                  fontFamily: "Barlow, sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                }}
              >
                {cta.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
