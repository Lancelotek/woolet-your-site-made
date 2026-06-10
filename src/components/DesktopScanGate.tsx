import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Lang } from "@/lib/i18n";
import { tFit } from "@/lib/i18n-fitscan";
import { clarityEvent } from "@/lib/clarity";

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

      <details style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.82rem" }}>
        <summary style={{ cursor: "pointer" }}>{tFit(lang, "desktop.fallback_summary")}</summary>
        <p style={{ marginTop: 8, lineHeight: 1.55, wordBreak: "break-all" }}>
          {tFit(lang, "desktop.fallback_text")} <span style={{ color: GOLD }}>{scanUrl}</span>
        </p>
      </details>
    </div>
  );
}
