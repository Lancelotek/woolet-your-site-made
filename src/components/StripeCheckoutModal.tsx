import { useCallback, useEffect, useRef, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "./PaymentTestModeBanner";
import { rdtAddToCart } from "@/lib/reddit-pixel";
import { trackInitiateCheckoutOnce, buildPurchaseAttribution } from "@/lib/meta-capi";

interface Props {
  priceId: string;
  customerEmail?: string;
  returnUrl: string;
  metadata?: Record<string, string>;
  onClose: () => void;
}

export function StripeCheckoutModal({ priceId, customerEmail, returnUrl, metadata, onClose }: Props) {
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    // Inject Meta attribution (fbp, fbc, UA, event_id) into Stripe metadata so
    // the payments-webhook can fire Purchase to Meta CAPI with the original
    // visitor signals attached.
    const metaAttribution = buildPurchaseAttribution();
    const mergedMetadata = { ...(metadata ?? {}), ...metaAttribution };

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
  }, [priceId, customerEmail, returnUrl, metadata]);

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
          <div id="checkout">
            <EmbeddedCheckoutProvider
              key={retryKey}
              stripe={getStripe()}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
}
