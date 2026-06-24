import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Lang } from "@/lib/i18n";
import { tFit } from "@/lib/i18n-fitscan";
import { clarityEvent } from "@/lib/clarity";
import fitStep6 from "@/assets/fit-steps/step-6.webp.asset.json";
import fitStep7 from "@/assets/fit-steps/step-7.webp.asset.json";
import fitStep8 from "@/assets/fit-steps/step-8.webp.asset.json";

const FLOW_STEPS = [
  { src: fitStep6.url, title: "Tap Scan", desc: "Start FitLens from the Woolet product page with one tap." },
  { src: fitStep7.url, title: "Guided face scan", desc: "In-browser guidance captures your face width in 15 seconds." },
  { src: fitStep8.url, title: "Your fit, confirmed", desc: "See your exact width and the matching Woolet model — measured, not guessed." },
];

const GOLD = "#CAA449";
const MUTED = "#888888";

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

interface Props {
  lang: Lang;
}

export default function DesktopScanGate({ lang }: Props) {
  const sid = useState(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  })[0];

  const scanUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/${lang}/fit?sid=${sid}`;
  }, [lang, sid]);

  // CLARITY EVENT: desktop QR handoff shown — fire once per mount.
  useEffect(() => {
    pushEvent("scan_qr_shown", { device: "desktop" });
    clarityEvent("scan_qr_shown");
  }, []);

  const steps = [
    tFit(lang, "desktop.step1"),
    tFit(lang, "desktop.step2"),
    tFit(lang, "desktop.step3"),
    tFit(lang, "desktop.step4"),
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">{tFit(lang, "desktop.eyebrow")}</span>
      </div>
      <h1
        className="font-display text-woolet-white"
        style={{ fontSize: "clamp(2rem, 4.2vw, 2.75rem)", fontWeight: 300, lineHeight: 1.1 }}
      >
        {tFit(lang, "desktop.h1_pre")} <em className="italic" style={{ color: GOLD }}>{tFit(lang, "desktop.h1_em")}</em>
      </h1>
      <p className="text-cream-dim" style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.55 }}>
        {tFit(lang, "desktop.desc")}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: 28,
          background: "#fff",
          borderRadius: 8,
          alignSelf: "flex-start",
        }}
      >
        {scanUrl && <QRCodeSVG value={scanUrl} size={232} level="M" includeMargin={false} />}
      </div>

      <ol
        className="flex flex-col gap-3 m-0 p-0"
        style={{ listStyle: "none", fontFamily: "Barlow, sans-serif" }}
      >
        {steps.map((line, i) => (
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ color: GOLD, fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", minWidth: 24 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.55 }}>
              {line}
            </span>
          </li>
        ))}
      </ol>

      {/* Visual flow: 3 phone shots showing the actual experience */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 8,
        }}
      >
        {FLOW_STEPS.map((s, i) => (
          <figure key={i} style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                aspectRatio: "4 / 5",
                background: "#0d0d0c",
              }}
            >
              <img
                src={s.src}
                alt={s.title}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  color: GOLD,
                  fontFamily: "Cormorant Garamond, serif",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  background: "rgba(0,0,0,0.55)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <figcaption style={{ fontFamily: "Barlow, sans-serif" }}>
              <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 500, marginBottom: 2 }}>{s.title}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", lineHeight: 1.5 }}>{s.desc}</div>
            </figcaption>
          </figure>
        ))}
      </div>


      {/* No phone handy? — explicit manual fallback link */}
      <div
        style={{
          marginTop: 4,
          paddingTop: 18,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.65)",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.85rem",
            letterSpacing: "0.02em",
          }}
        >
          No phone handy?
        </span>
        <a
          href={`/${lang}/fit/manual`}
          onClick={() =>
            pushEvent("scan_manual_fallback_click", {
              device: "desktop",
              lang,
              cta_label: tFit(lang, "welcome.manual_link"),
            })
          }
          style={{
            color: GOLD,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.9rem",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            alignSelf: "flex-start",
          }}
        >
          {tFit(lang, "welcome.manual_link")}
        </a>
      </div>

      <details style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.82rem" }}>
        <summary style={{ cursor: "pointer" }}>{tFit(lang, "desktop.fallback_summary")}</summary>
        <p style={{ marginTop: 8, lineHeight: 1.55, wordBreak: "break-all" }}>
          {tFit(lang, "desktop.fallback_text")} <span style={{ color: GOLD }}>{scanUrl}</span>
        </p>
      </details>
    </div>
  );
}
