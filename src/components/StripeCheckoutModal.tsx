import { useCallback, useEffect, useRef } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "./PaymentTestModeBanner";
import { rdtAddToCart } from "@/lib/reddit-pixel";

interface Props {
  priceId: string;
  customerEmail?: string;
  returnUrl: string;
  metadata?: Record<string, string>;
  onClose: () => void;
}

export function StripeCheckoutModal({ priceId, customerEmail, returnUrl, metadata, onClose }: Props) {
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        customerEmail,
        returnUrl,
        metadata,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret as string;
  }, [priceId, customerEmail, returnUrl, metadata]);

  const addToCartFired = useRef(false);
  useEffect(() => {
    if (!addToCartFired.current) {
      addToCartFired.current = true;
      rdtAddToCart({ value: 133, currency: "USD", itemCount: 1 });
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
        <div id="checkout">
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}
