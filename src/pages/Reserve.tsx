import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { buildPurchaseAttribution, trackInitiateCheckoutOnce } from "@/lib/meta-capi";
import { getAttribution } from "@/lib/attribution";
import { pushGtmEvent } from "@/lib/gtm";
import { claritySet } from "@/lib/clarity";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

/** Same $1 reservation price as the Kickstarter landing page. */
const RESERVATION_PRICE_ID = "founding_member_deposit_1usd";
const OPEN_TIMEOUT_MS = 8000;

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

const BULLETS = [
  "158 mm standard width - bespoke 145-172 mm",
  "Italian acetate, hand made in EU",
  "10-year warranty",
];

type Touch = {
  touch_source?: string;
  touch_campaign?: string;
  touch_content?: string;
};

const readTouch = (): Touch => {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Touch = {};
  const source = p.get("utm_source");
  const campaign = p.get("utm_campaign");
  const content = p.get("utm_content");
  if (source) out.touch_source = source.slice(0, 120);
  if (campaign) out.touch_campaign = campaign.slice(0, 120);
  if (content) out.touch_content = content.slice(0, 120);
  return out;
};

export default function Reserve() {
  const [failed, setFailed] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const sessionRef = useRef<Promise<string> | null>(null);

  const touch = useMemo(readTouch, []);

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/en/thank-you/reserved`
      : "https://woolet.co/en/thank-you/reserved";

  const metadata = useMemo(() => {
    const attribution = getAttribution();
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(attribution)) {
      if (typeof v === "string" && v) flat[k] = v.slice(0, 480);
    }
    return {
      ...flat,
      campaign: "kickstarter_vip",
      form_location: "email_reserve",
      recommended_sku: "ks_reservation_1usd",
      ...touch,
    };
  }, [touch]);

  // Page view + Clarity tag, once.
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    pushGtmEvent("reserve_page_view", {
      touch_source: touch.touch_source ?? "",
      touch_campaign: touch.touch_campaign ?? "",
    });
    if (touch.touch_source) claritySet("reserve_touch_source", touch.touch_source);
    trackInitiateCheckoutOnce(`reserve:${touch.touch_source ?? "direct"}`, {
      custom: { value: 1, currency: "USD", num_items: 1 },
    });
  }, [touch]);

  const createSession = useCallback((): Promise<string> => {
    const merged = { ...metadata, ...buildPurchaseAttribution() };
    return supabase.functions
      .invoke("create-checkout", {
        body: {
          priceId: RESERVATION_PRICE_ID,
          returnUrl,
          metadata: merged,
          environment: getStripeEnvironment(),
        },
      })
      .then(({ data, error }) => {
        if (error || !data?.clientSecret) {
          throw new Error(error?.message || "Failed to create checkout session");
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
      pushGtmEvent("reserve_checkout_error", { error_message: message });
      throw e;
    });
  }, [createSession]);

  // Warm up Stripe.js as early as possible.
  useEffect(() => {
    try {
      void getStripe();
    } catch {
      /* publishable key missing — surfaced by the error state below */
    }
  }, []);

  // Wait for the Stripe iframe; fail visibly if it never mounts.
  const readyFired = useRef(false);
  useEffect(() => {
    if (failed) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const iframe = document.querySelector("#reserve-checkout iframe");
      if (iframe) {
        window.clearInterval(timer);
        window.clearTimeout(bail);
        setMounted(true);
        if (!readyFired.current) {
          readyFired.current = true;
          pushGtmEvent("reserve_checkout_ready", {
            load_ms: Math.round(performance.now() - started),
          });
        }
      }
    }, 100);
    const bail = window.setTimeout(() => {
      window.clearInterval(timer);
      if (!readyFired.current) {
        setFailed("timeout");
        pushGtmEvent("reserve_checkout_error", { error_message: "timeout" });
      }
    }, OPEN_TIMEOUT_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(bail);
    };
  }, [failed, retryKey]);

  const retry = () => {
    sessionRef.current = null;
    readyFired.current = false;
    setMounted(false);
    setFailed(null);
    setRetryKey((k) => k + 1);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.body, fontFamily: "Barlow, sans-serif" }}>
      <Helmet>
        <title>Reserve your founder price - Woolet</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <style>{`
        .rsv-wrap { max-width: 560px; margin: 0 auto; padding: 40px 20px 72px; }
        .rsv-h1 { font-family: "Cormorant Garamond", Cormorant, serif; font-weight: 300; font-size: 40px; line-height: 1.08; color: ${C.head}; margin: 0 0 14px; }
        @media (min-width: 768px) { .rsv-h1 { font-size: 52px; } .rsv-wrap { padding-top: 64px; } }
      `}</style>

      <main className="rsv-wrap">
        <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, margin: 0 }}>
          Founders Edition
        </p>
        <h1 className="rsv-h1">Lock $114 - pay $1 now</h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: C.body, margin: "0 0 20px" }}>
          $1 today = founder price locked. 30 frames at $114 on Kickstarter (regular $190).
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "grid", gap: 8 }}>
          {BULLETS.map((b) => (
            <li key={b} style={{ fontSize: 14, color: C.muted, display: "flex", gap: 10 }}>
              <span style={{ color: C.gold }}>·</span>
              {b}
            </li>
          ))}
        </ul>

        <div style={{ background: "#fff", borderRadius: 2, overflow: "hidden", position: "relative", minHeight: 320 }}>
          <PaymentTestModeBanner />
          {failed ? (
            <div style={{ background: C.surface, color: C.body, padding: "28px 22px" }}>
              <h2 style={{ fontSize: 19, fontWeight: 600, margin: "0 0 10px", color: C.head }}>
                Checkout didn't load - tap to try again
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 20px", color: C.muted }}>
                Your founder price is still available. One tap and we'll reload the secure payment form.
              </p>
              <button
                type="button"
                onClick={retry}
                style={{
                  background: C.gold,
                  color: C.ink,
                  border: "none",
                  borderRadius: 2,
                  padding: "14px 24px",
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {!mounted && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      border: "2px solid rgba(31,27,22,0.18)",
                      borderTopColor: C.gold,
                      borderRadius: "50%",
                      animation: "rsvSpin 0.8s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: 14, color: "#6B6357" }}>Loading secure checkout…</span>
                  <style>{`@keyframes rsvSpin { to { transform: rotate(360deg) } }`}</style>
                </div>
              )}
              <div id="reserve-checkout">
                <EmbeddedCheckoutProvider
                  key={retryKey}
                  stripe={getStripe()}
                  options={{ fetchClientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </>
          )}
        </div>

        <p style={{ margin: "22px 0 0", fontSize: 14 }}>
          <Link to="/en/lp/kickstarter" style={{ color: C.gold, textDecoration: "underline" }}>
            Not ready? See how the fit works →
          </Link>
        </p>
      </main>
    </div>
  );
}
