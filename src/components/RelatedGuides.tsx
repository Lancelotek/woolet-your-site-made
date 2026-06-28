import { Link } from "react-router-dom";

interface GuideLink {
  label: string;
  href: string;
  description: string;
}

const defaultGuides: GuideLink[] = [
  {
    label: "Measure your face",
    href: "/en/blog/how-to-measure-face-width-for-glasses",
    description: "Temple-to-temple in 60 seconds — with or without a credit card.",
  },
  {
    label: "Best wide-fit sunglasses",
    href: "/en/blog/best-sunglasses-for-wide-faces",
    description: "Lens tints, frame widths and what to look for above 155 mm.",
  },
  {
    label: "Glasses for big heads",
    href: "/en/collections/glasses-for-big-heads",
    description: "Frame widths, head circumference and how to stop the pinching.",
  },
];

interface RelatedGuidesProps {
  variant?: "dark" | "light";
  heading?: string;
  excludeHref?: string;
  className?: string;
}

export const RelatedGuides = ({
  variant = "dark",
  heading = "Related guides",
  excludeHref,
  className = "",
}: RelatedGuidesProps) => {
  const guides = excludeHref
    ? defaultGuides.filter((g) => g.href !== excludeHref)
    : defaultGuides;

  if (guides.length === 0) return null;

  const isDark = variant === "dark";

  return (
    <aside
      className={`not-prose ${className}`}
      style={{
        borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
        paddingTop: "2rem",
      }}
    >
      <h3
        className="font-display"
        style={{
          fontSize: "1.15rem",
          fontWeight: 300,
          margin: "0 0 1rem",
          color: isDark ? "hsl(var(--cream))" : "#111",
        }}
      >
        {heading}
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {guides.map((g) => (
          <Link
            key={g.href}
            to={g.href}
            className="no-underline group"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              padding: "1rem",
              borderRadius: "2px",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #D6CBB6",
              background: isDark ? "rgba(255,255,255,0.02)" : "#FFF",
              transition: "border-color 200ms, background 200ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.55)";
              e.currentTarget.style.background = isDark
                ? "rgba(255,255,255,0.04)"
                : "#FAF8F4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark
                ? "rgba(255,255,255,0.10)"
                : "#D6CBB6";
              e.currentTarget.style.background = isDark
                ? "rgba(255,255,255,0.02)"
                : "#FFF";
            }}
          >
            <span
              className="uppercase tracking-[0.16em]"
              style={{
                fontSize: "0.7rem",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 500,
                color: "hsl(var(--gold))",
              }}
            >
              {g.label} →
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                lineHeight: 1.45,
                color: isDark ? "hsl(var(--cream-dim))" : "#444",
              }}
            >
              {g.description}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default RelatedGuides;
