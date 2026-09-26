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
  lang?: "en" | "de";
}

export const RelatedGuides = ({
  variant = "dark",
  heading = "Related guides",
  excludeHref,
  className = "",
  lang = "en",
}: RelatedGuidesProps) => {
  const localizedGuides: GuideLink[] = lang === "de" ? [
    { label: "Brille Breite 160 mm", href: "/de/brille-breite-160-mm", description: "Maße und Passform für besonders breite Fassungen." },
    { label: "Brillen für große Köpfe", href: "/de/brillen-fuer-grosse-koepfe", description: "So findest du eine Fassung ohne Druck an den Schläfen." },
    { label: "XXL Brillen für Herren", href: "/de/xxl-brille-herren", description: "Breite Herrenfassungen mit klaren Größenangaben." },
  ] : defaultGuides;
  const guides = excludeHref
    ? localizedGuides.filter((g) => g.href !== excludeHref)
    : localizedGuides;

  if (guides.length === 0) return null;

  const isDark = variant === "dark";

  return (
    <aside
      className={`not-prose pt-8 ${className}`}
      style={{
        borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
        "--rg-heading": isDark ? "hsl(var(--cream))" : "#111",
        "--rg-label": "hsl(var(--gold))",
        "--rg-desc": isDark ? "hsl(var(--cream-dim))" : "#444",
        "--rg-card-bg": isDark ? "rgba(255,255,255,0.02)" : "#FFF",
        "--rg-card-border": isDark ? "rgba(255,255,255,0.10)" : "#D6CBB6",
        "--rg-card-hover-bg": isDark ? "rgba(255,255,255,0.04)" : "#FAF8F4",
        "--rg-card-hover-border": "hsl(var(--gold) / 0.55)",
      } as React.CSSProperties}
    >
      <h3
        className="font-display text-[1.15rem] font-light mb-4 text-[var(--rg-heading)]"
      >
        {lang === "de" && heading === "Related guides" ? "Passende Ratgeber" : heading}
      </h3>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {guides.map((g) => (
          <Link
            key={g.href}
            to={g.href}
            className="no-underline group flex flex-col gap-[0.35rem] p-4 rounded-[2px] border border-[var(--rg-card-border)] bg-[var(--rg-card-bg)] transition-colors duration-200 hover:border-[var(--rg-card-hover-border)] hover:bg-[var(--rg-card-hover-bg)]"
          >
            <span
              className="uppercase tracking-[0.16em] text-[0.7rem] font-body font-medium text-[var(--rg-label)]"
            >
              {g.label} →
            </span>
            <span
              className="text-[0.85rem] leading-[1.45] text-[var(--rg-desc)]"
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
