import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";

const GOLD = "#CAA449";
const BG = "#080807";
const MUTED = "#888888";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

interface Props {
  lang: Lang;
}

type Phase = "email" | "qr";

export default function DesktopScanGate({ lang }: Props) {
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sid, setSid] = useState<string | null>(null);

  const scanUrl = useMemo(() => {
    if (!sid || typeof window === "undefined") return "";
    return `${window.location.origin}/${lang}/fit?sid=${sid}`;
  }, [lang, sid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setSubmitting(true);
    try {
      const { error: mlErr } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: { email: parsed.data, source: "scan", device: "desktop" },
      });
      if (mlErr) {
        console.warn("[scan-gate desktop] mailerlite failed", mlErr);
      }
      pushEvent("scan_lead", { device: "desktop" });
      // Generate a random, non-PII session flag for the QR URL.
      const newSid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      setSid(newSid);
      setPhase("qr");
    } catch (err) {
      console.error("[scan-gate desktop] submit failed", err);
      toast.error("Couldn't continue. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "email") {
    return (
      <div className="flex flex-col gap-8">
        <div className="woolet-eyebrow">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">FIT SCAN — PHONE ONLY</span>
        </div>
        <h1
          className="font-display text-woolet-white"
          style={{ fontSize: "clamp(2.25rem, 4.8vw, 3.25rem)", fontWeight: 300, lineHeight: 1.05 }}
        >
          Finish the scan on your <em className="italic" style={{ color: GOLD }}>phone</em>
        </h1>
        <p className="text-cream-dim" style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.55 }}>
          Enter your email — we'll show a QR code to do the 30-second scan on your phone.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <label
            htmlFor="scan-gate-email"
            style={{
              color: MUTED,
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Your email
          </label>
          <input
            id="scan-gate-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "white",
              padding: "14px 16px",
              fontFamily: "Barlow, sans-serif",
              fontSize: "1rem",
              borderRadius: 4,
            }}
          />
          {error && (
            <span style={{ color: "#fca5a5", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem" }}>
              {error}
            </span>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 8,
              background: submitting ? "rgba(202,164,73,0.4)" : GOLD,
              color: BG,
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.78rem",
              padding: "18px 28px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              border: "none",
              cursor: submitting ? "wait" : "pointer",
              height: 52,
            }}
          >
            {submitting ? "Generating QR…" : "Show me the QR code"}
          </button>
          <p
            style={{
              color: MUTED,
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            No marketing without consent. The QR code never carries your email.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">SCAN ON YOUR PHONE</span>
      </div>
      <h1
        className="font-display text-woolet-white"
        style={{ fontSize: "clamp(2rem, 4.2vw, 2.75rem)", fontWeight: 300, lineHeight: 1.1 }}
      >
        Point your phone camera at the <em className="italic" style={{ color: GOLD }}>QR code</em>
      </h1>

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
        {[
          "Open the camera app on your phone and aim it at the QR code.",
          "Tap the link that appears — the scan opens in your phone's browser.",
          "Hold a credit card flat on your forehead and follow the on-screen steps.",
          "Your result appears on your phone in about 30 seconds.",
        ].map((line, i) => (
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
        <summary style={{ cursor: "pointer" }}>Can't scan the QR code?</summary>
        <p style={{ marginTop: 8, lineHeight: 1.55, wordBreak: "break-all" }}>
          Open this link on your phone: <span style={{ color: GOLD }}>{scanUrl}</span>
        </p>
      </details>
    </div>
  );
}
