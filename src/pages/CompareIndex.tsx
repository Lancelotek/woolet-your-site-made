import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { competitors } from "@/data/competitors";

type SortKey = "default" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

// Extract a numeric anchor from the price string for sorting (e.g. "≈ $75–206" → 75).
const priceAnchor = (price: string): number => {
  const m = price.match(/\d+/);
  return m ? parseInt(m[0], 10) : Number.POSITIVE_INFINITY;
};

const SITE = "https://woolet.co";

const CompareIndex = () => {
  const path = "/compare";
  const canonical = `${SITE}/en${path}`;

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("default");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? competitors.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q) ||
            c.keyword.toLowerCase().includes(q),
        )
      : competitors.slice();

    switch (sort) {
      case "name-asc":
        return base.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return base.sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return base.sort((a, b) => priceAnchor(a.table.Price) - priceAnchor(b.table.Price));
      case "price-desc":
        return base.sort((a, b) => priceAnchor(b.table.Price) - priceAnchor(a.table.Price));
      default:
        return base;
    }
  }, [query, sort]);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
      { "@type": "ListItem", position: 2, name: "Compare", item: canonical },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: competitors.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${c.name} Alternative`,
      url: `${SITE}/en/compare/${c.slug}`,
    })),
  };

  return (
    <>
      <SEO
        title="Woolet vs the Alternatives — Wide-Face Eyewear Comparisons"
        description="Head-to-head comparisons between Woolet and other wide-face eyewear brands — Fatheadz, EYESHELLS, Zenni, Warby Parker, Ray-Ban and Persol."
        lang="en"
        path={path}
        jsonLd={[breadcrumbLd, itemListLd]}
      />
      <Navbar />
      <main
        style={{
          background: "#F8F6F1",
          minHeight: "100vh",
          fontFamily: "'Barlow', sans-serif",
          color: "#111",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "16px 20px 0",
            fontSize: 11,
            color: "#888",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <Link to="/en" style={{ color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#111" }}>Compare</span>
        </nav>

        <header style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 20px", textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              color: "#A07A2A",
              marginBottom: 14,
              fontWeight: 500,
            }}
          >
            Wide-Face Eyewear Comparisons
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 40,
              lineHeight: 1.15,
              margin: "0 0 16px",
            }}
          >
            Woolet vs the Alternatives
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#555", margin: "0 auto", maxWidth: 620 }}>
            Honest side-by-side comparisons between Woolet and the brands wide-faced wearers usually consider first. Every entry covers materials, fit range, sizing, price and where the competitor still wins.
          </p>
        </header>

        <section style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px 48px" }}>
          {/* Search + sort controls */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <label htmlFor="compare-search" style={{ position: "absolute", left: -9999 }}>
              Search comparisons
            </label>
            <input
              id="compare-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by brand (e.g. Ray-Ban)"
              style={{
                flex: "1 1 260px",
                minWidth: 0,
                padding: "11px 14px",
                fontSize: 14,
                fontFamily: "'Barlow', sans-serif",
                color: "#111",
                background: "#FFF",
                border: "1px solid #E0D5C5",
                borderRadius: 4,
                outline: "none",
              }}
            />
            <label htmlFor="compare-sort" style={{ position: "absolute", left: -9999 }}>
              Sort comparisons
            </label>
            <select
              id="compare-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{
                padding: "11px 14px",
                fontSize: 13,
                fontFamily: "'Barlow', sans-serif",
                color: "#111",
                background: "#FFF",
                border: "1px solid #E0D5C5",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              <option value="default">Sort: Featured</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="price-asc">Competitor price (low → high)</option>
              <option value="price-desc">Competitor price (high → low)</option>
            </select>
          </div>

          <div
            aria-live="polite"
            style={{
              fontSize: 12,
              color: "#888",
              letterSpacing: "0.3px",
              marginBottom: 14,
            }}
          >
            {filtered.length} of {competitors.length} comparison{competitors.length === 1 ? "" : "s"}
            {query.trim() ? ` matching “${query.trim()}”` : ""}
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                background: "#FFF",
                border: "1px dashed #E0D5C5",
                borderRadius: 8,
                padding: "32px 20px",
                textAlign: "center",
                color: "#555",
                fontSize: 14,
              }}
            >
              No comparisons match “{query.trim()}”. Try another brand name.
            </div>
          ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((c) => (
              <Link
                key={c.slug}
                to={`/en/compare/${c.slug}`}
                style={{
                  display: "block",
                  padding: "22px 20px",
                  background: "#FFF",
                  border: "1px solid #E0D5C5",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#111",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#A07A2A",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  {c.name} Alternative
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: 22,
                    marginBottom: 10,
                    lineHeight: 1.25,
                  }}
                >
                  Woolet vs {c.name}
                </div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>
                  {c.metaDescription}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#A07A2A",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Read comparison →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CompareIndex;
