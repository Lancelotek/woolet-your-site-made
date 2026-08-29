import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { FitBreadcrumbs, FitClusterNav } from "@/components/FitToolContent";
import { FIT_BANDS } from "@/seo/fit-faq";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import manualFitImg from "@/assets/manual-fit-measure.png.asset.json";

const GOLD = "#CAA449";

type Unit = "cm" | "in";

type BucketKey = "below145" | "b145_155" | "b155_160" | "above160";

interface Bucket {
  key: BucketKey;
  label: string;
  range: string;
  description: string;
  recommendation: string;
  cta: { label: string; href: string };
}

const BUCKETS: Record<BucketKey, Bucket> = {
  below145: {
    key: "below145",
    label: "Narrow",
    range: "under 145 mm",
    description:
      "Narrow to average — mainstream frames fit you. The signature Woolet at 158 mm will sit too wide on your temples.",
    recommendation: "This is not a Woolet fit. Below 145 mm, mainstream brands cover you better than we can.",
    cta: { label: "Explore bespoke →", href: "/en/bespoke" },
  },
  b145_155: {
    key: "b145_155",
    label: "Below signature",
    range: "145–154 mm",
    description:
      "Wider than average, narrower than our signature 158 mm front. Off-the-shelf wide frames rarely land here cleanly.",
    recommendation: "Bespoke, built to your millimetre — 145 to 162 mm front width with a 20–24 mm bridge.",
    cta: { label: "See bespoke options →", href: "/en/bespoke" },
  },
  b155_160: {
    key: "b155_160",
    label: "Signature fit",
    range: "155–161 mm",
    description:
      "You're squarely in our signature range. The 158 mm front width is designed for exactly this face width.",
    recommendation: "158 mm — Woolet 007 (round) or 009 (soft square), both on the Kickstarter VIP list with 40% off.",
    cta: { label: "Join the VIP list →", href: "/en/lp/kickstarter" },
  },
  above160: {
    key: "above160",
    label: "Above signature",
    range: "162 mm and above",
    description:
      "Most brands stop at 150 mm. Our signature covers up to 161 mm and made-to-measure tops out at 162 mm.",
    recommendation: "At 162 mm, bespoke is your frame. Above 162 mm we do not build — there is no frame we can make honestly.",
    cta: { label: "Join the VIP list →", href: "/en/lp/kickstarter" },
  },
};

function classify(mm: number): BucketKey {
  if (mm < 145) return "below145";
  if (mm < 155) return "b145_155";
  if (mm <= 161) return "b155_160";
  return "above160";
}

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

export default function FitManual() {
  const [unit, setUnit] = useState<Unit>("cm");
  const [value, setValue] = useState<string>("");
  const [result, setResult] = useState<{ mm: number; bucket: Bucket } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholder = unit === "cm" ? "e.g. 15.8" : "e.g. 6.2";
  const hint = unit === "cm"
    ? "Signature: 15.5–16.1 cm. Bespoke: 14.5–16.2 cm."
    : "Signature: 6.10–6.34 in. Bespoke: 5.71–6.38 in.";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const raw = value.replace(",", ".").trim();
    const num = parseFloat(raw);
    if (!isFinite(num) || num <= 0) {
      setError("Enter a number.");
      return;
    }
    const mm = unit === "cm" ? num * 10 : num * 25.4;
    if (mm < 100 || mm > 220) {
      setError(unit === "cm" ? "Enter a value between 10 and 22 cm." : "Enter a value between 3.9 and 8.7 in.");
      return;
    }
    const bucket = BUCKETS[classify(mm)];
    setResult({ mm, bucket });
    pushEvent("manual_fit_submit", { mm: Math.round(mm), bucket: bucket.key, unit });
  };

  const formattedMm = useMemo(() => (result ? Math.round(result.mm) : 0), [result]);

  return (
    <>
      <SEO
        title="Measure Your Face Width Manually — Woolet Fit Guide"
        description="No camera needed. Measure your face width with a tape measure and get the matching Woolet size — signature 158 mm or bespoke 145–172 mm."
        lang="en"
        path="/fit/manual"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to measure your face width for glasses",
          description:
            "Measure the width of your face temple-to-temple with a soft tape measure to find the right frame width in millimeters.",
          totalTime: "PT2M",
          tool: [
            { "@type": "HowToTool", name: "Soft tape measure (or string + ruler)" },
          ],
          step: [
            { "@type": "HowToStep", name: "Position the tape", text: "Hold a soft tape measure horizontally across your face, temple to temple, just in front of the ears and level with your eyebrows." },
            { "@type": "HowToStep", name: "Keep it flat", text: "Keep the tape straight and snug against the skin, not over the hair." },
            { "@type": "HowToStep", name: "Read the number", text: "Read the number where the tape meets — in centimeters or inches." },
            { "@type": "HowToStep", name: "Match your size", text: "Enter it in the calculator to map your measurement to the signature (158 mm) or bespoke (145–172 mm) Woolet frame." },
          ],
        }}
      />
      <Navbar />
      <main className="bg-background text-foreground min-h-screen">
        <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
          <FitBreadcrumbs current="manual" />
          <div className="woolet-eyebrow mb-5">
            <div className="woolet-eyebrow-line" />
            <span className="woolet-eyebrow-text">MANUAL FIT · TAPE MEASURE</span>
          </div>
          <h1
            className="font-display text-woolet-white mb-4"
            style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.2rem)", fontWeight: 300, lineHeight: 1.02 }}
          >
            Measure your face width <em className="italic" style={{ color: GOLD }}>manually</em>
          </h1>
          <p className="text-cream-dim max-w-2xl mb-12" style={{ fontSize: "1rem", lineHeight: 1.6, fontWeight: 300 }}>
            No phone, no scan. Grab a soft tape measure (or a piece of string and a ruler) and enter the number below —
            we'll tell you which Woolet size matches.
          </p>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Illustration + how-to */}
            <div className="flex flex-col gap-6">
              <div
                style={{
                  background: "#f0ece4",
                  border: "1px solid hsl(0 0% 100% / 0.08)",
                  padding: "20px",
                }}
              >
                <img
                  src={manualFitImg.url}
                  alt="How to measure face width with a soft tape measure — across the temples, ear to ear in front of the head."
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
              <ol
                className="flex flex-col gap-4 m-0 p-0"
                style={{ listStyle: "none", fontFamily: "Barlow, sans-serif" }}
              >
                {[
                  "Hold a soft tape measure horizontally across your face, from temple to temple — just in front of the ears, level with your eyebrows.",
                  "Keep the tape straight and snug against the skin, not over the hair.",
                  "Read the number where the tape meets — in centimeters or inches.",
                  "Enter it on the right. We'll map it to the right frame width.",
                ].map((line, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span
                      style={{
                        color: GOLD,
                        fontFamily: "Cormorant Garamond, serif",
                        fontStyle: "italic",
                        minWidth: 28,
                        fontSize: "1.1rem",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.55 }}>
                      {line}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-6">
              <form
                onSubmit={onSubmit}
                style={{
                  border: "1px solid hsl(0 0% 100% / 0.08)",
                  background: "hsl(var(--gold) / 0.025)",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  className="uppercase tracking-[0.2em]"
                  style={{ color: "hsl(var(--gold-dim))", fontSize: "0.6rem", fontFamily: "Barlow, sans-serif" }}
                >
                  Face width
                </div>

                {/* Unit toggle */}
                <div style={{ display: "flex", gap: 0, border: "1px solid hsl(0 0% 100% / 0.12)", alignSelf: "flex-start" }}>
                  {(["cm", "in"] as Unit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => { setUnit(u); setResult(null); }}
                      style={{
                        padding: "8px 18px",
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.7rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        background: unit === u ? GOLD : "transparent",
                        color: unit === u ? "hsl(var(--background))" : "rgba(255,255,255,0.7)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {u === "cm" ? "Centimeters" : "Inches"}
                    </button>
                  ))}
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.8rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Your measurement ({unit})
                  </span>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={placeholder}
                      style={{
                        flex: 1,
                        background: "rgba(0,0,0,0.35)",
                        border: "1px solid hsl(0 0% 100% / 0.15)",
                        color: "#fff",
                        padding: "14px 60px 14px 16px",
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "1.1rem",
                        outline: "none",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 16,
                        color: GOLD,
                        fontFamily: "Cormorant Garamond, serif",
                        fontStyle: "italic",
                        fontSize: "1rem",
                      }}
                    >
                      {unit}
                    </span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", fontFamily: "Barlow, sans-serif" }}>
                    {hint}
                  </span>
                </label>

                {error && (
                  <div style={{ color: "#e88", fontSize: "0.85rem", fontFamily: "Barlow, sans-serif" }}>{error}</div>
                )}

                <button
                  type="submit"
                  className="uppercase tracking-[0.22em] transition-all"
                  style={{
                    background: GOLD,
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    padding: "16px 28px",
                    border: "none",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  See my size →
                </button>
              </form>

              {/* Result */}
              {result && (
                <div
                  style={{
                    border: `1px solid ${GOLD}`,
                    padding: "24px",
                    background: "hsl(var(--gold) / 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div
                    className="uppercase tracking-[0.2em]"
                    style={{ color: "hsl(var(--gold-dim))", fontSize: "0.6rem", fontFamily: "Barlow, sans-serif" }}
                  >
                    Your match · {formattedMm} mm
                  </div>
                  <h2
                    className="font-display"
                    style={{ fontSize: "1.6rem", fontWeight: 300, color: "#fff", lineHeight: 1.15 }}
                  >
                    <em className="italic" style={{ color: GOLD }}>{result.bucket.label}</em>{" "}
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem" }}>· {result.bucket.range}</span>
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.55, fontFamily: "Barlow, sans-serif", fontWeight: 300 }}>
                    {result.bucket.description}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.95)", fontSize: "0.95rem", lineHeight: 1.55, fontFamily: "Barlow, sans-serif" }}>
                    {result.bucket.recommendation}
                  </p>
                  <Link
                    to={result.bucket.cta.href}
                    onClick={() => pushEvent("manual_fit_result_cta", { bucket: result.bucket.key, href: result.bucket.cta.href })}
                    className="uppercase tracking-[0.22em] no-underline self-start"
                    style={{
                      background: GOLD,
                      color: "hsl(var(--background))",
                      fontFamily: "Barlow, sans-serif",
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      padding: "14px 24px",
                      marginTop: 4,
                    }}
                  >
                    {result.bucket.cta.label}
                  </Link>
                </div>
              )}

              {/* Reference table */}
              <div
                style={{
                  marginTop: 8,
                  border: "1px solid hsl(0 0% 100% / 0.06)",
                  padding: "18px 20px",
                  fontFamily: "Barlow, sans-serif",
                }}
              >
                <div
                  className="uppercase tracking-[0.2em] mb-3"
                  style={{ color: "hsl(var(--gold-dim))", fontSize: "0.55rem" }}
                >
                  Reference
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0, listStyle: "none", fontSize: "0.82rem" }}>
                  {FIT_BANDS.map(({ range, size: label }) => (
                    <li key={range} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "rgba(255,255,255,0.8)" }}>
                      <span style={{ color: GOLD }}>{range}</span>
                      <span style={{ textAlign: "right" }}>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/en/fit"
                className="self-start"
                style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", fontFamily: "Barlow, sans-serif", textDecoration: "underline", textUnderlineOffset: 4 }}
              >
                ← Prefer the 20-second scan?
              </Link>
            </div>
          </div>
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid hsl(var(--gold) / 0.16)" }}>
            <FitClusterNav current="/en/fit/manual" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
