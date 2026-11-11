import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import SEO from "@/components/SEO";
import KickstarterLiveRedirect from "@/components/KickstarterLiveRedirect";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { FOUNDER_EDITION as F, isReservationOpen } from "@/config/kickstarter";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { buildPurchaseAttribution, trackInitiateCheckoutOnce } from "@/lib/meta-capi";
import { getAttribution, getLastTouchCheckoutMetadata } from "@/lib/attribution";
import { getGaCheckoutMetadataAsync } from "@/lib/ga-ids";
import { pushGtmEvent } from "@/lib/gtm";
import { claritySet } from "@/lib/clarity";

/**
 * /en/founders - Founder Edition pre-order paid on woolet.co (decision 11.11.2026):
 * people who reserved for $1 but would not log in to Kickstarter buy here instead.
 * Same offer as the secret KS reward: 009 Black, 24 mm bridge, $114, Founder Box.
 * Unlike the KS reward, site orders ship right after purchase (decision 11.11.2026).
 * Price and stock cap live server-side in create-checkout (FOUNDER_PRICE_ID).
 */
const FOUNDER_PRICE_ID = "founder_edition_009_114";
const OPEN_TIMEOUT_MS = 8000;
const IMG = "/frames/";

const C = {
  bg: "#080807",
  surface: "#16140F",
  hair: "rgba(255,255,255,0.08)",
  body: "#EDE7D9",
  head: "#F8F8F6",
  muted: "#9A8E7E",
  gold: "#CAA449",
  ink: "#1F1B16",
};

const PHOTOS = [
  { src: `${IMG}woolet-009-soft-square-black-eyeglasses.jpg`, alt: "Woolet 009 Black Founder Edition, front view, 158 mm front" },
  { src: `${IMG}woolet-009-soft-square-black-eyeglasses-on-face.jpg`, alt: "Woolet 009 Black worn on a wide face" },
  { src: `${IMG}woolet-009-soft-square-black-angle-34.jpg`, alt: "Woolet 009 Black three-quarter view" },
  { src: `${IMG}woolet-009-soft-square-black-angle-top.jpg`, alt: "Woolet 009 Black top view showing the 158 mm front" },
  { src: `${IMG}woolet-box-open-frames-cloth.jpg`, alt: "Woolet Founder Box open with the frame and cloth" },
  { src: `${IMG}woolet-box-render-closed.jpg`, alt: "Woolet magnetic box closed, gold w on the lid" },
];

const FACTS: Array<[string, string]> = [
  ["Frame", `${F.model} only - 158 mm front, fits faces 155-161 mm`],
  ["Bridge", `${F.bridgeMm} mm - Founder batch only (the main run has 25 mm)`],
  ["Made", "Mazzucchelli acetate from Milan, made in a small family workshop in Bielsko-Biała, Poland"],
  ["Founder Box", `Magnetic box, special case and the Clip-On Cloth ($${F.boxValue} value) - not in the shop`],
  ["Lenses", "Frame only - your optician fits your prescription"],
  ["Shipping", "Free. Ships from the EU right after your order - no waiting for the campaign to end"],
  ["Customs", "Depending on your country, customs duties or import fees may apply on delivery. They are paid by the recipient"],
  ["Returns", "Send it back within 14 days of delivery to Marek Ciesla, Kanadyjska 64D, 32-087 Zielonki, Poland for a full refund - or get 50% off any Bespoke frame instead"],
  ["Warranty", "5 years"],
];

type Touch = { touch_source?: string; touch_campaign?: string; touch_content?: string };

const readTouch = (): Touch => {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Touch = {};
  const s = p.get("utm_source");
  const c = p.get("utm_campaign");
  const ct = p.get("utm_content");
  if (s) out.touch_source = s.slice(0, 120);
  if (c) out.touch_campaign = c.slice(0, 120);
  if (ct) out.touch_content = ct.slice(0, 120);
  return out;
};

/** Reads the JSON error code ("sold_out", "closed") from a non-2xx edge function reply. */
async function edgeErrorCode(error: unknown): Promise<string | null> {
  const ctx = (error as { context?: Response } | null)?.context;
  if (!ctx || typeof ctx.json !== "function") return null;
  try {
    const j = await ctx.clone().json();
    return typeof j?.error === "string" ? j.error : null;
  } catch {
    return null;
  }
}

const btn: CSSProperties = {
  width: "100%",
  background: C.gold,
  color: C.ink,
  border: "none",
  borderRadius: 2,
  padding: "18px 24px",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};

function Paid() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    pushGtmEvent("founder_order_thankyou", { value: F.price, currency: "USD" });
  }, []);
  return (
    <main className="fnd-wrap" style={{ textAlign: "center" }}>
      <p className="fnd-eyebrow">Founder Edition</p>
      <h1 className="fnd-h1">Your Founder frame is yours.</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 auto 18px", maxWidth: 460 }}>
        {F.model}, {F.bridgeMm} mm bridge, with the Founder Box. It ships from the EU right away. You'll get an email
        with your order and shipping address - check it, and reply to that email when anything needs fixing.
      </p>
      <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
        Questions? <a href="mailto:support@woolet.co" style={{ color: C.gold }}>support@woolet.co</a>
      </p>
    </main>
  );
}

function Checkout() {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const sessionRef = useRef<Promise<string> | null>(null);
  const touch = useMemo(readTouch, []);

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/en/founders?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : "https://woolet.co/en/founders?paid=1&session_id={CHECKOUT_SESSION_ID}";

  const metadata = useMemo(() => {
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(getAttribution())) {
      if (typeof v === "string" && v) flat[k] = v.slice(0, 480);
    }
    return { ...flat, campaign: "founder_edition_site", form_location: "founders_page", recommended_sku: "founder_009_black_24", ...touch };
  }, [touch]);

  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    pushGtmEvent("founders_page_view", { touch_source: touch.touch_source ?? "" });
    if (touch.touch_source) claritySet("founders_touch_source", touch.touch_source);
  }, [touch]);

  useEffect(() => {
    try {
      void getStripe();
    } catch {
      /* surfaced by the error state */
    }
  }, []);

  const createSession = useCallback((): Promise<string> => {
    const base = { ...metadata, ...buildPurchaseAttribution(), ...getLastTouchCheckoutMetadata() };
    return getGaCheckoutMetadataAsync()
      .then((ga) =>
        supabase.functions.invoke("create-checkout", {
          body: {
            priceId: FOUNDER_PRICE_ID,
            returnUrl,
            metadata: { ...base, ...ga, user_initiated: "1" },
            environment: getStripeEnvironment(),
          },
        }),
      )
      .then(async ({ data, error }) => {
        if (error || !data?.clientSecret) {
          const code = error ? await edgeErrorCode(error) : null;
          throw new Error(code || error?.message || "Failed to create checkout session");
        }
        return data.clientSecret as string;
      });
  }, [metadata, returnUrl]);

  const fetchClientSecret = useCallback((): Promise<string> => {
    if (!sessionRef.current) {
      const p = createSession();
      p.catch(() => undefined);
      sessionRef.current = p;
    }
    return sessionRef.current.catch((e) => {
      sessionRef.current = null;
      const message = e instanceof Error ? e.message : "unknown";
      setFailed(message);
      pushGtmEvent("founders_checkout_error", { error_message: message });
      throw e;
    });
  }, [createSession]);

  const readyFired = useRef(false);
  useEffect(() => {
    if (failed || !started) return;
    const t0 = performance.now();
    const timer = window.setInterval(() => {
      if (document.querySelector("#founders-checkout iframe")) {
        window.clearInterval(timer);
        window.clearTimeout(bail);
        setMounted(true);
        if (!readyFired.current) {
          readyFired.current = true;
          pushGtmEvent("founders_checkout_ready", { load_ms: Math.round(performance.now() - t0) });
        }
      }
    }, 100);
    const bail = window.setTimeout(() => {
      window.clearInterval(timer);
      if (!readyFired.current) setFailed("timeout");
    }, OPEN_TIMEOUT_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(bail);
    };
  }, [failed, retryKey, started]);

  const retry = () => {
    sessionRef.current = null;
    readyFired.current = false;
    setMounted(false);
    setFailed(null);
    setRetryKey((k) => k + 1);
  };

  const soldOut = failed === "sold_out";

  return (
    <main className="fnd-wrap">
      <p className="fnd-eyebrow">Founder Edition · ships now</p>
      <h1 className="fnd-h1">Your Founder frame. No Kickstarter account needed.</h1>
      <p style={{ fontSize: 17, lineHeight: 1.55, margin: "0 0 26px" }}>
        The same Founder reward as on Kickstarter - {F.model}, ${F.price} instead of ${F.srp} in the shop, with the $
        {F.boxValue} Founder Box. It ships right away.
      </p>
      <p className="fnd-noacct">
        <strong>No account to create.</strong> Not on Kickstarter, not here. No sign-up, no password - just your card and
        your shipping address.
      </p>

      <div className="fnd-gallery">
        {PHOTOS.map((p, i) => (
          <img key={p.src} src={p.src} alt={p.alt} loading={i < 2 ? "eager" : "lazy"} decoding="async" width={800} height={800} />
        ))}
      </div>

      <dl className="fnd-facts">
        {FACTS.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "4px 0 16px" }}>
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, color: C.head, lineHeight: 1 }}>${F.price}</span>
        <span style={{ fontSize: 16, color: C.muted, textDecoration: "line-through" }}>${F.srp}</span>
        <span style={{ fontSize: 13, color: C.gold, letterSpacing: "0.08em" }}>Free shipping from the EU</span>
      </div>

      {!started ? (
        <button
          type="button"
          id="founders-pay"
          style={btn}
          onClick={() => {
            pushGtmEvent("founders_pay_click", { touch_source: touch.touch_source ?? "" });
            trackInitiateCheckoutOnce(`founders:${touch.touch_source ?? "direct"}`, {
              custom: { value: F.price, currency: "USD", num_items: 1 },
            });
            setStarted(true);
          }}
        >
          Get my Founder frame - ${F.price}
        </button>
      ) : (
        <div style={{ background: "#fff", borderRadius: 2, overflow: "hidden", position: "relative", minHeight: 320 }}>
          <PaymentTestModeBanner />
          {failed ? (
            <div style={{ background: C.surface, color: C.body, padding: "28px 22px" }}>
              <h2 style={{ fontSize: 19, fontWeight: 600, margin: "0 0 10px", color: C.head }}>
                {soldOut ? "The Founder frames sold here are gone" : failed === "closed" ? "The Founder Edition has closed" : "Checkout didn't load - tap to try again"}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 20px", color: C.muted }}>
                {soldOut || failed === "closed" ? (
                  <>
                    Write to <a href="mailto:support@woolet.co" style={{ color: C.gold }}>support@woolet.co</a> - I'll tell you what's left.
                  </>
                ) : (
                  "One tap reloads the secure payment form."
                )}
              </p>
              {!soldOut && failed !== "closed" && (
                <button type="button" onClick={retry} style={{ ...btn, width: "auto", padding: "14px 24px", fontSize: 12 }}>
                  Try again
                </button>
              )}
            </div>
          ) : (
            <>
              {!mounted && (
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                  <span style={{ fontSize: 14, color: "#6B6357" }}>Loading secure checkout…</span>
                </div>
              )}
              <div id="founders-checkout">
                <EmbeddedCheckoutProvider key={retryKey} stripe={getStripe()} options={{ fetchClientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </>
          )}
        </div>
      )}

      {!started && (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: C.muted, textAlign: "center" }}>
          Guest checkout - no account, no sign-up, no password.
        </p>
      )}

      <p style={{ margin: "22px 0 0", fontSize: 14, lineHeight: 1.6, color: C.muted }}>
        Not sure about your width?{" "}
        <Link to="/en/fit" style={{ color: C.gold }}>Measure your face in 60 seconds</Link>. Outside 155-161 mm,{" "}
        <Link to="/en/bespoke" style={{ color: C.gold }}>Bespoke</Link> is cut to your number.
      </p>
    </main>
  );
}

export default function Founders() {
  const [params] = useSearchParams();
  const paid = params.get("paid") === "1";
  if (!paid && !isReservationOpen()) return <KickstarterLiveRedirect refTag="site_founders" slot="founders_page" />;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.body, fontFamily: "Barlow, sans-serif" }}>
      <SEO
        title="Founder Edition - Woolet"
        description="Woolet 009 Black Founder Edition: $114 instead of $190, with the Founder Box. Order on woolet.co, no Kickstarter account needed - ships right away."
        path="/founders"
        noindex
        robots="noindex, nofollow"
      />
      <style>{`
        .fnd-wrap { max-width: 640px; margin: 0 auto; padding: 40px 20px 72px; }
        .fnd-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.gold}; margin: 0 0 10px; }
        .fnd-h1 { font-family: "Cormorant Garamond", Cormorant, serif; font-weight: 300; font-size: 38px; line-height: 1.08; color: ${C.head}; margin: 0 0 14px; }
        .fnd-noacct { margin: 0 0 26px; padding: 14px 16px; border-left: 2px solid ${C.gold}; background: ${C.surface}; font-size: 16px; line-height: 1.5; color: ${C.body}; }
        .fnd-noacct strong { color: ${C.head}; font-weight: 600; }
        .fnd-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 0 0 28px; }
        .fnd-gallery img { width: 100%; height: auto; aspect-ratio: 1 / 1; object-fit: cover; background: ${C.surface}; border-radius: 2px; }
        .fnd-gallery img:first-child { grid-column: 1 / -1; aspect-ratio: 4 / 3; }
        .fnd-facts { margin: 0 0 24px; border-top: 1px solid ${C.hair}; }
        .fnd-facts > div { display: grid; grid-template-columns: 110px 1fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${C.hair}; }
        .fnd-facts dt { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${C.muted}; padding-top: 2px; }
        .fnd-facts dd { margin: 0; font-size: 15px; line-height: 1.5; color: ${C.body}; }
        @media (min-width: 768px) {
          .fnd-wrap { padding-top: 64px; }
          .fnd-h1 { font-size: 52px; }
          .fnd-gallery { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 767px) {
          .fnd-facts > div { grid-template-columns: 1fr; gap: 2px; }
        }
      `}</style>
      {paid ? <Paid /> : <Checkout />}
    </div>
  );
}
