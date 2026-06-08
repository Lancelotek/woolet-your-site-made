import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";
import {
  getRecommendation,
  type Measurements,
  type Recommendation,
} from "@/lib/face-measurements";

const GOLD = "#CAA449";
const BG = "#080807";
const MUTED = "#888888";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(255);

interface Props {
  lang: Lang;
  onSessionComplete: (m: Measurements, r: Recommendation) => void;
}

type Phase = "email" | "waiting" | "connected";

export default function ScanHandoffDesktop({ lang, onSessionComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const scanUrl = useMemo(() => {
    if (!sessionId) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/${lang}/fit?s=${sessionId}`;
  }, [lang, sessionId]);

  // Realtime: listen for the phone to write its result back to this row.
  useEffect(() => {
    if (!sessionId) return;

    const finalize = (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      if (status !== "completed") return;
      const faceWidthMm = Number(row.face_width_mm);
      const noseWidthMm = Number(row.nose_width_mm);
      if (!Number.isFinite(faceWidthMm) || !Number.isFinite(noseWidthMm)) return;
      const confidence = (row.confidence as Measurements["confidence"]) ?? "medium";
      const m: Measurements = {
        faceWidthMm,
        noseWidthMm,
        confidence,
        debug: { cardPixelWidth: 0, mmPerPx: 0, facePixelWidth: 0, nosePixelWidth: 0 },
      };
      const r = getRecommendation(faceWidthMm, noseWidthMm);
      onSessionComplete(m, r);
    };

    const channel = supabase
      .channel(`scan_session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scan_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => finalize(payload.new as Record<string, unknown>),
      )
      .subscribe();

    // Also poll once on mount in case the phone finished before we subscribed.
    const poll = window.setInterval(async () => {
      const { data } = await supabase
        .from("scan_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
      if (data) finalize(data as unknown as Record<string, unknown>);
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(poll);
    };
  }, [sessionId, onSessionComplete]);

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
      const { data, error: insertErr } = await supabase
        .from("scan_sessions")
        .insert({ email: parsed.data })
        .select("id")
        .single();
      if (insertErr || !data) throw insertErr ?? new Error("insert_failed");
      setSessionId(data.id);
      setPhase("waiting");

      // Fire-and-forget MailerLite subscribe → Fit Scan group.
      supabase.functions
        .invoke("mailerlite-subscribe", {
          body: { email: parsed.data, source: "fit_scan" },
        })
        .then(({ error: mlErr }) => {
          if (mlErr) console.warn("[scan-handoff] mailerlite subscribe failed", mlErr);
        });
    } catch (err) {
      console.error("[scan-handoff] create session failed", err);
      toast.error("Couldn't start the handoff. Try again.");
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
          Scan your face on your <em className="italic" style={{ color: GOLD }}>phone</em>
        </h1>
        <p className="text-cream-dim" style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.55 }}>
          The scan needs a phone camera you can hold to your forehead with a credit card. Enter your email — we'll generate a QR code, you scan it with your phone, and the result appears here automatically.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <label
            htmlFor="scan-handoff-email"
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
            id="scan-handoff-email"
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
            {submitting ? "Generating QR…" : "Generate QR code"}
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
            We use your email only to link this scan to you across devices. No marketing without consent.
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
        {scanUrl && (
          <QRCodeSVG value={scanUrl} size={232} level="M" includeMargin={false} />
        )}
      </div>

      <ol
        className="flex flex-col gap-3 m-0 p-0"
        style={{ listStyle: "none", fontFamily: "Barlow, sans-serif" }}
      >
        {[
          "Open the camera app on your phone and aim it at the QR code.",
          "Tap the link that appears — the scan opens in your phone's browser.",
          "Hold a credit card flat on your forehead and follow the on-screen steps.",
          "Your result appears here on this screen automatically.",
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: MUTED,
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.78rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: GOLD,
            boxShadow: `0 0 8px ${GOLD}`,
            animation: "scanHandoffPulse 1.6s ease-in-out infinite",
          }}
        />
        Waiting for your phone…
      </div>

      <details style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.82rem" }}>
        <summary style={{ cursor: "pointer" }}>Can't scan the QR code?</summary>
        <p style={{ marginTop: 8, lineHeight: 1.55, wordBreak: "break-all" }}>
          Open this link on your phone: <span style={{ color: GOLD }}>{scanUrl}</span>
        </p>
      </details>

      <style>{`
        @keyframes scanHandoffPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
