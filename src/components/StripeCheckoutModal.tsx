import { useCallback, useEffect, useRef, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "./PaymentTestModeBanner";
import { rdtAddToCart } from "@/lib/reddit-pixel";
import { trackInitiateCheckoutOnce, buildPurchaseAttribution } from "@/lib/meta-capi";
import { getLastTouchCheckoutMetadata } from "@/lib/attribution";

interface Props {
  priceId: string;
  customerEmail?: string;
  returnUrl: string;
  metadata?: Record<string, string>;
  onClose: () => void;
  /**
   * Optional pre-created client secret (warmed up in the background before the
   * user taps), so the embedded checkout mounts without a round trip.
   */
  prefetchedClientSecret?: () => Promise<string>;
  /** Fired once the Stripe iframe is actually mounted, with load time in ms. */
  onReady?: (loadMs: number) => void;
}

export function StripeCheckoutModal({
  priceId,
  customerEmail,
  returnUrl,
  metadata,
  onClose,
  prefetchedClientSecret,
  onReady,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    if (prefetchedClientSecret) {
      try {
        return await prefetchedClientSecret();
      } catch {
        // fall through to a fresh session below
      }
    }
    // Inject Meta attribution (fbp, fbc, UA, event_id) into Stripe metadata so
    // the payments-webhook can fire Purchase to Meta CAPI with the original
    // visitor signals attached.
    const metaAttribution = buildPurchaseAttribution();
    const mergedMetadata = { ...(metadata ?? {}), ...metaAttribution, ...getLastTouchCheckoutMetadata(), user_initiated: "1" };

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        customerEmail,
        returnUrl,
        metadata: mergedMetadata,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      setFailed(true);
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret as string;
  }, [priceId, customerEmail, returnUrl, metadata, prefetchedClientSecret]);

  const addToCartFired = useRef(false);
  useEffect(() => {
    if (!addToCartFired.current) {
      addToCartFired.current = true;
      rdtAddToCart({ value: 114, currency: "USD", itemCount: 1 });
      // Meta InitiateCheckout — one browser pixel event + one server CAPI
      // event sharing one event_id, guarded against re-mounts.
      trackInitiateCheckoutOnce(`stripe:${priceId}`, {
        user: customerEmail ? { email: customerEmail } : undefined,
        custom: { value: 114, currency: "USD", num_items: 1 },
      });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Poll for the Stripe iframe so we can hide the skeleton only once the
  // embedded checkout is genuinely painted (no empty overlay, ever).
  const readyFired = useRef(false);
  useEffect(() => {
    if (failed) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const iframe = document.querySelector("#checkout iframe");
      if (iframe) {
        window.clearInterval(timer);
        setMounted(true);
        if (!readyFired.current) {
          readyFired.current = true;
          onReady?.(Math.round(performance.now() - started));
        }
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [failed, retryKey, onReady]);



  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reserve your founding spot"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "2rem 1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 560,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        <PaymentTestModeBanner />
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            background: "transparent",
            border: "none",
            fontSize: 28,
            lineHeight: 1,
            cursor: "pointer",
            color: "#555",
            zIndex: 2,
          }}
        >
          ×
        </button>
        <p
          style={{
            background: "#F8F6F1",
            color: "#1F1B16",
            fontFamily: "Barlow, sans-serif",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.3,
            textAlign: "center",
            padding: "16px 20px",
            margin: "12px 0 0",
            borderRadius: 2,
          }}
        >
          <span style={{ color: "#CAA449" }}>$1 today</span> = founder price locked
        </p>
        {failed ? (
          <div
            style={{
              background: "#080807",
              color: "#EDE7D9",
              borderRadius: 12,
              margin: 12,
              padding: "28px 22px",
              fontFamily: "Barlow, sans-serif",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px", color: "#EDE7D9" }}>
              We couldn't open the payment window.
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 20px", color: "#EDE7D9", opacity: 0.85 }}>
              Your spot on the VIP list is already saved - this only affects the $1 reservation.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setFailed(false);
                  setRetryKey((k) => k + 1);
                }}
                style={{
                  background: "#CAA449",
                  color: "#1F1B16",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "transparent",
                  color: "#EDE7D9",
                  border: "1px solid rgba(237,231,217,0.35)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative", minHeight: 320 }}>
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
                    borderTopColor: "#CAA449",
                    borderRadius: "50%",
                    animation: "wlSpin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "#6B6357" }}>
                  Loading secure checkout…
                </span>
                <style>{`@keyframes wlSpin { to { transform: rotate(360deg) } }`}</style>
              </div>
            )}
            <div id="checkout">
              <EmbeddedCheckoutProvider
                key={retryKey}
                stripe={getStripe()}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
