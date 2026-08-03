import { Link } from "react-router-dom";
import { FIT_FAQ, FIT_BANDS } from "@/seo/fit-faq";

/* ─────────────────────────────────────────────
   Shared primitives
   ───────────────────────────────────────────── */

const GOLD = "#CAA449";
const GOLD_INK = "#1F1B16";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "Barlow, sans-serif",
        fontSize: 10,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: "hsl(var(--gold))",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display text-woolet-white"
      style={{ fontSize: "clamp(1.55rem, 3.2vw, 2.1rem)", fontWeight: 300, lineHeight: 1.18, marginBottom: 18 }}
    >
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-cream-dim"
      style={{ fontFamily: "Barlow, sans-serif", fontSize: "1rem", lineHeight: 1.7, marginBottom: 14, maxWidth: "68ch" }}
    >
      {children}
    </p>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ padding: "56px 0", borderTop: "1px solid hsl(var(--gold) / 0.16)" }}>{children}</section>
  );
}

/** Anchor id on the /en/fit scan/QR panel. Shared so CTAs scroll instead of navigating. */
export const FIT_PANEL_ID = "fit-scan-panel";

/** Nearest ancestor that actually scrolls; falls back to the window. */
function getScrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const style = window.getComputedStyle(node);
    const canScroll = /(auto|scroll|overlay)/.test(style.overflowY);
    if (canScroll && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return null;
}

export function scrollToFitPanel() {
  if (typeof document === "undefined") return;
  const el = document.getElementById(FIT_PANEL_ID);
  if (!el) return;

  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

  const container = getScrollParent(el);

  const jump = () => {
    if (container) {
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      container.scrollTo({ top, behavior });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior });
    }
  };

  const before = container ? container.scrollTop : window.scrollY;
  jump();

  // Fallback: if nothing moved (smooth swallowed, interrupted, etc.), jump instantly.
  window.setTimeout(() => {
    const after = container ? container.scrollTop : window.scrollY;
    if (Math.abs(after - before) < 2) {
      if (container) {
        const top =
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop;
        container.scrollTop = top;
      } else {
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
      }
    }
  }, 250);
}


export function GoldCta({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: GOLD,
        color: GOLD_INK,
        fontFamily: "Barlow, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "15px 30px",
        borderRadius: 2,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

/** Same visual as GoldCta, but scrolls to the scan panel — never drops the ?sid= param. */
export function GoldScrollCta({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={scrollToFitPanel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: GOLD,
        color: GOLD_INK,
        fontFamily: "Barlow, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "15px 30px",
        borderRadius: 2,
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Breadcrumbs + tool cluster
   ───────────────────────────────────────────── */

const crumbLink: React.CSSProperties = {
  color: "hsl(var(--gold))",
  textDecoration: "none",
};

export function FitBreadcrumbs({ current }: { current: "scan" | "manual" | "bespoke" }) {
  const label = current === "scan" ? "Virtual fit" : current === "manual" ? "Manual measurement" : "Bespoke fit";
  return (
    <nav
      aria-label="Breadcrumb"
      style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", marginBottom: 20 }}
    >
      <Link to="/en" style={crumbLink}>Woolet</Link>
      <span aria-hidden="true"> / </span>
      {current === "scan" ? (
        <span>Virtual fit</span>
      ) : (
        <>
          <Link to="/en/fit" style={crumbLink}>Virtual fit</Link>
          <span aria-hidden="true"> / </span>
          <span>{label}</span>
        </>
      )}
    </nav>
  );
}

const CLUSTER = [
  { to: "/en/fit", label: "Virtual fit (camera scan)", note: "20 seconds, phone camera, ±1.5 mm." },
  { to: "/en/fit/manual", label: "Manual measurement", note: "Tape measure, no camera needed." },
  { to: "/en/fit/bespoke", label: "Bespoke fit", note: "Outside 155–161 mm? 145–162 mm built to measure." },
];

export function FitClusterNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Fit tools"
      style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
    >
      {CLUSTER.map((c) => {
        const active = c.to === current;
        return (
          <Link
            key={c.to}
            to={c.to}
            aria-current={active ? "page" : undefined}
            onClick={active ? (e) => { e.preventDefault(); scrollToFitPanel(); } : undefined}
            style={{
              display: "block",
              padding: "16px 18px",
              border: `1px solid ${active ? "hsl(var(--gold) / 0.55)" : "hsl(var(--gold) / 0.2)"}`,
              background: active ? "hsl(var(--gold) / 0.07)" : "transparent",
              textDecoration: "none",
              borderRadius: 2,
            }}
          >
            <span
              className="text-woolet-white"
              style={{ display: "block", fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 500, marginBottom: 6 }}
            >
              {c.label}
            </span>
            <span className="text-cream-dim" style={{ fontFamily: "Barlow, sans-serif", fontSize: 12.5, lineHeight: 1.5 }}>
              {c.note}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────────
   Main editorial body for /en/fit
   ───────────────────────────────────────────── */

const STEPS = [
  {
    n: "01",
    t: "Open the camera",
    d: "Tap Begin and allow camera access in your phone browser. Nothing installs, nothing uploads to a third party.",
  },
  {
    n: "02",
    t: "Hold the phone at arm's length",
    d: "Face the camera straight on and hold any credit, debit or ID card flat on your forehead. Its 85.6 mm edge is the scale reference.",
  },
  {
    n: "03",
    t: "Read your numbers",
    d: "You get your temple-to-temple face width, your bridge width, and the front width we recommend — in millimetres, with the matching Woolet size.",
  },
];

export default function FitToolContent() {
  return (
    <div className="mx-auto" style={{ maxWidth: 880, paddingBottom: 40 }}>
      {/* How it works */}
      <Section>
        <Eyebrow>How it works</Eyebrow>
        <SectionTitle>Three steps, about twenty seconds</SectionTitle>
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", marginTop: 26 }}>
          {STEPS.map((s) => (
            <div key={s.n}>
              <div
                className="font-display"
                style={{ color: "hsl(var(--gold))", fontSize: 26, fontWeight: 300, marginBottom: 8 }}
              >
                {s.n}
              </div>
              <h3
                className="text-woolet-white"
                style={{ fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 500, marginBottom: 8 }}
              >
                {s.t}
              </h3>
              <p className="text-cream-dim" style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, lineHeight: 1.65 }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* What it measures */}
      <Section>
        <Eyebrow>Scope</Eyebrow>
        <SectionTitle>What it measures — and what it does not</SectionTitle>
        <div style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: 8 }}>
          <div>
            <h3 className="text-woolet-white" style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>
              It measures
            </h3>
            <ul style={{ display: "grid", gap: 10 }}>
              {[
                "Face width, temple to temple, in millimetres",
                "Nose bridge width — 21 mm and 22 mm are our two keyhole options",
                "Pupillary distance, for your optician",
                "The front width that fits you, and whether 158 mm is it",
              ].map((x) => (
                <li key={x} className="text-cream-dim" style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, lineHeight: 1.6, display: "flex", gap: 10 }}>
                  <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, marginTop: 8, flexShrink: 0 }} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-woolet-white" style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>
              It does not
            </h3>
            <ul style={{ display: "grid", gap: 10 }}>
              {[
                "Render frames on your face — this is not a try-on mirror",
                "Replace an eye test or produce a prescription",
                "Judge whether a shape suits your taste",
                "Guess. If you fall outside 145–162 mm it says so",
              ].map((x) => (
                <li key={x} className="text-cream-dim" style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, lineHeight: 1.6, display: "flex", gap: 10 }}>
                  <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: "50%", background: "hsl(var(--muted-foreground))", marginTop: 8, flexShrink: 0 }} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Try-on vs fit */}
      <Section>
        <Eyebrow>Positioning</Eyebrow>
        <SectionTitle>Virtual try-on vs <em className="italic text-gold-light">virtual fit</em></SectionTitle>
        <Body>
          A virtual try-on overlays a 3D frame on your camera feed so you can see how it looks. It is a styling tool, and every large retailer has one. What none of them answer is the only question a 155 mm+ face actually has: will this frame reach across my head without pressing on my temples?
        </Body>
        <Body>
          FitLens is a virtual fit. It converts your face into millimetres and compares them against a real frame front width. If you have ever tried on a frame that looked right in a mirror and hurt after two hours, you already know the difference — appearance is not fit, and a rendered overlay cannot detect a frame that is 15 mm too narrow.
        </Body>
        <div style={{ overflowX: "auto", marginTop: 22 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Barlow, sans-serif", fontSize: 14 }}>
            <thead>
              <tr>
                {["", "Virtual try-on", "FitLens virtual fit"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--gold))", borderBottom: "1px solid hsl(var(--gold) / 0.3)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-cream-dim">
              {[
                ["Answers", "How does it look on me?", "Will it fit my head?"],
                ["Output", "A rendered image", "Millimetres: face width, bridge, front width"],
                ["Useful above 155 mm", "No — sizes are approximated", "Yes — that is what it is built for"],
                ["Tells you when nothing fits", "No", "Yes, including above 162 mm"],
              ].map((r) => (
                <tr key={r[0]}>
                  <th scope="row" style={{ textAlign: "left", padding: "12px", fontWeight: 500, color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--gold) / 0.12)" }}>{r[0]}</th>
                  <td style={{ padding: "12px", borderBottom: "1px solid hsl(var(--gold) / 0.12)" }}>{r[1]}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid hsl(var(--gold) / 0.12)" }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Result bands */}
      <Section>
        <Eyebrow>Your result</Eyebrow>
        <SectionTitle>What the number means</SectionTitle>
        <Body>
          FitLens returns one face-width figure. Here is exactly how it maps to what we can build, with no rounding in our favour.
        </Body>
        <div style={{ overflowX: "auto", marginTop: 18 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Barlow, sans-serif", fontSize: 14 }}>
            <thead>
              <tr>
                {["Face width", "What it means", "Your size"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--gold))", borderBottom: "1px solid hsl(var(--gold) / 0.3)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-cream-dim">
              {FIT_BANDS.map((b) => (
                <tr key={b.range}>
                  <th scope="row" style={{ textAlign: "left", padding: "12px", fontWeight: 500, color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--gold) / 0.12)", whiteSpace: "nowrap" }}>{b.range}</th>
                  <td style={{ padding: "12px", borderBottom: "1px solid hsl(var(--gold) / 0.12)" }}>{b.verdict}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid hsl(var(--gold) / 0.12)" }}>{b.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Privacy */}
      <Section>
        <Eyebrow>Privacy</Eyebrow>
        <SectionTitle>What happens to the photo</SectionTitle>
        <Body>
          The camera frame is used to detect the card edge and your facial landmarks, and to convert those into millimetres. It is not published, not sold, and not kept as part of a profile you can be identified from.
        </Body>
        <Body>
          What persists is the measurement itself — face width, bridge width, pupillary distance — and only when you choose to save it or have it emailed to you so you can bring it to an optician. You can ask us to delete it at any time; the full detail is in our <Link to="/en/privacy-policy" style={crumbLink}>privacy policy</Link>.
        </Body>
      </Section>

      {/* FAQ */}
      <Section>
        <Eyebrow>FAQ</Eyebrow>
        <SectionTitle>Questions people ask before scanning</SectionTitle>
        <div style={{ marginTop: 10 }}>
          {FIT_FAQ.map((f) => (
            <div key={f.q} style={{ padding: "20px 0", borderBottom: "1px solid hsl(var(--gold) / 0.12)" }}>
              <h3 className="text-woolet-white" style={{ fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
                {f.q}
              </h3>
              <p className="text-cream-dim" style={{ fontFamily: "Barlow, sans-serif", fontSize: 14.5, lineHeight: 1.7, maxWidth: "68ch" }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Cluster + CTA */}
      <Section>
        <Eyebrow>Fit tools</Eyebrow>
        <SectionTitle>Three ways to get your number</SectionTitle>
        <div style={{ marginTop: 20 }}>
          <FitClusterNav current="/en/fit" />
        </div>
        <div style={{ marginTop: 32 }}>
          <GoldScrollCta>Start the scan — 20 seconds</GoldScrollCta>
        </div>
      </Section>
    </div>
  );
}
