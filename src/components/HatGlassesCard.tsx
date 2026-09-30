import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pushGtmEvent } from "@/lib/gtm";
import { getAttribution } from "@/lib/attribution";
import { buildLeadAttribution } from "@/lib/meta-capi";
import { hatToGlasses, STANDARD_FRAME_MAX_MM, HAT_MIN_CM, HAT_MAX_CM } from "@/lib/hat-to-glasses";

const INK = "#0B0A09";
const PANEL = "#16140F";
const GOLD = "#C2A05A";
const CREAM = "#EFE9DF";
const DIM = "rgba(239,233,223,0.62)";
const LINE = "rgba(194,160,90,0.28)";

type Props =
  | { variant: "full"; headCm: number }
  | { variant: "compact"; headCm?: undefined };

const fitHref = (medium: string) =>
  `/en/fit?utm_source=woolet_site&utm_medium=${medium}&utm_campaign=hat_bridge`;

export default function HatGlassesCard(props: Props) {
  const compact = props.variant === "compact";
  const medium = compact ? "hat_article" : "hat_calculator";
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [raw, setRaw] = useState("60");
  const inputCm = unit === "cm" ? parseFloat(raw) : parseFloat(raw) * 2.54;
  const validInput = Number.isFinite(inputCm) && inputCm >= HAT_MIN_CM && inputCm <= HAT_MAX_CM;
  const headCm = compact ? (validInput ? inputCm : 60) : props.headCm;
  const r = hatToGlasses(headCm);
  const headRounded = Math.round(headCm * 10) / 10;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    pushGtmEvent("hat_bridge_view", { page_path: path, head_cm: headRounded });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCta = () => pushGtmEvent("hat_bridge_cta_click", { page_path: path, head_cm: headRounded });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const leadAttribution = buildLeadAttribution();
      const metaEventId = leadAttribution.meta_event_id;
      const { data, error } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          ...getAttribution(), ...leadAttribution, email, name: "",
          face_width: String(r.templeMm), models: "Woolet 007, Woolet 009",
          meta_event_id: metaEventId, hero_variant: "hat", form_location: "hat_size_card",
          head_cm: headRounded, temple_width_est: r.templeMm,
        },
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);
      pushGtmEvent("waitlist_signup", { waitlist_email: email, waitlist_models: "Woolet 007, Woolet 009", event_id: metaEventId });
      pushGtmEvent("hat_size_card_submit", { page_path: path, head_cm: headRounded });
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: "meta_lead", meta_event_name: "Lead", event_id: metaEventId,
        content_name: "hat_size_card", content_category: "waitlist", source: "hat", form_location: "hat_size_card",
      });
      setStatus("done");
    } catch (err) {
      console.error("hat size card submit error:", err);
      setStatus("error");
    }
  };

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 48,
    padding: "12px 22px", background: GOLD, color: INK, borderRadius: 2, fontFamily: "Archivo, sans-serif",
    fontSize: 14, fontWeight: 600, letterSpacing: "0.02em", textDecoration: "none", border: "none", cursor: "pointer",
  };
  const input: React.CSSProperties = {
    background: INK, border: `1px solid ${LINE}`, color: CREAM, borderRadius: 2, padding: "11px 12px",
    fontFamily: "Archivo, sans-serif", fontSize: 15, minHeight: 46, width: "100%",
  };

  return (
    <aside
      aria-label="Hat size to glasses width"
      style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 2, padding: compact ? "22px 20px" : "26px 24px", margin: compact ? "24px 0 32px" : "18px 0 0", color: CREAM, fontFamily: "Archivo, sans-serif" }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>
        Your hat size → your glasses width
      </div>

      {compact && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "stretch" }}>
          <label htmlFor="hat-card-head" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Head circumference
          </label>
          <input
            id="hat-card-head" type="number" inputMode="decimal" step="0.1" value={raw}
            onChange={(e) => setRaw(e.target.value)} style={{ ...input, flex: 1 }}
            placeholder={unit === "cm" ? "Head in cm, e.g. 60" : "Head in inches, e.g. 23.6"}
          />
          {(["cm", "in"] as const).map((u) => (
            <button key={u} type="button" onClick={() => {
              if (u === unit) return;
              const n = parseFloat(raw);
              if (Number.isFinite(n)) setRaw(u === "in" ? (n / 2.54).toFixed(1) : (n * 2.54).toFixed(0));
              setUnit(u);
            }}
              aria-pressed={unit === u}
              style={{ minWidth: 48, borderRadius: 2, border: `1px solid ${unit === u ? GOLD : LINE}`, background: unit === u ? "rgba(194,160,90,0.12)" : "transparent", color: unit === u ? GOLD : DIM, fontSize: 13, cursor: "pointer" }}
            >{u}</button>
          ))}
        </div>
      )}

      <p style={{ fontFamily: "Newsreader, serif", fontSize: compact ? 21 : 24, lineHeight: 1.3, margin: "0 0 10px", color: CREAM }}>
        Your hat: {r.row.us} US ({Math.round(headCm)} cm). Your likely temple width: <span style={{ color: GOLD }}>~{r.templeMm} mm</span>.
      </p>
      <p style={{ fontSize: 14, color: DIM, margin: "0 0 16px", lineHeight: 1.6 }}>
        Standard frames stop at ~{STANDARD_FRAME_MAX_MM} mm.
      </p>

      <div style={{ borderLeft: `2px solid ${GOLD}`, paddingLeft: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: CREAM, marginBottom: 4 }}>{r.verdict.title}</div>
        <div style={{ fontSize: 14, color: DIM, lineHeight: 1.6 }}>{r.verdict.body}</div>
      </div>

      <a href={fitHref(medium)} onClick={onCta} style={btn}>Measure your exact width in 20 seconds</a>
      <p style={{ fontSize: 12, color: DIM, margin: "10px 0 0", lineHeight: 1.6 }}>
        Estimate from head size can be off by 4–5 mm. The 20-second face scan removes that.
      </p>

      <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 20, paddingTop: 18 }}>
        {status === "done" ? (
          <p style={{ fontSize: 14, color: CREAM, margin: 0 }}>Sent. Check {email} for your size card.</p>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor={`hat-card-email-${medium}`} style={{ display: "block", fontSize: 13, color: CREAM, marginBottom: 8 }}>
              Email me my size card (hat + glasses)
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input id={`hat-card-email-${medium}`} type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={{ ...input, flex: "1 1 200px" }} />
              <button type="submit" disabled={status === "loading"}
                style={{ minHeight: 46, padding: "0 18px", borderRadius: 2, border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, fontSize: 14, cursor: status === "loading" ? "not-allowed" : "pointer" }}>
                {status === "loading" ? "Sending…" : "Send"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: DIM, lineHeight: 1.5, margin: "10px 0 0" }}>
              By getting your size card you accept our{" "}
              <a href="/en/privacy-policy" style={{ color: GOLD, textDecoration: "underline", textUnderlineOffset: 2 }}>Privacy Policy</a>{" "}
              and agree to emails from Woolet. No spam. Unsubscribe anytime.
            </p>
            {status === "error" && <p style={{ fontSize: 12, color: "#E2725B", margin: "8px 0 0" }}>Something went wrong. Try again.</p>}
          </form>
        )}
      </div>
    </aside>
  );
}
