import { CSSProperties, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { buildPurchaseAttribution } from "@/lib/meta-capi";
import { pushGtmEvent } from "@/lib/gtm";
import { getLastTouchCheckoutMetadata } from "@/lib/attribution";

const StripeCheckoutModalLazy = lazy(() =>
  import("@/components/StripeCheckoutModal").then((m) => ({ default: m.StripeCheckoutModal })),
);

const OPEN_TIMEOUT_MS = 8000;

type Props = {
  priceId: string;
  customerEmail?: string;
  returnUrl: string;
  metadata?: Record<string, string>;
  label: string;
  /** Event name fired on the first (accepted) tap. */
  clickEvent: string;
  /** Event name fired once the Stripe iframe is mounted; gets load_ms. */
  readyEvent: string;
  /** Event name fired on failure or timeout; gets error_message. */
  errorEvent: string;
  eventParams?: Record<string, string | number | boolean>;
  style?: CSSProperties;
  className?: string;
  id?: string;
  onOpen?: () => void;
  onClosed?: () => void;
};

/**
 * Gold reservation button with an instant loading state.
 *
 * Stripe.js and the checkout session are warmed up as soon as the button
 * renders, so the first tap opens the embedded modal without a dead click.
 * Everything stays in the embedded modal (no window.open) so it works inside
 * the Facebook / Instagram in-app browsers.
 */
export function ReserveCheckoutButton({
  priceId,
  customerEmail,
  returnUrl,
  metadata,
  label,
  clickEvent,
  readyEvent,
  errorEvent,
  eventParams,
  style,
  className,
  id,
  onOpen,
  onClosed,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Promise<string> | null>(null);

  const createSession = useCallback((): Promise<string> => {
    const merged = { ...(metadata ?? {}), ...buildPurchaseAttribution(), ...getLastTouchCheckoutMetadata() };
    return supabase.functions
      .invoke("create-checkout", {
        body: {
          priceId,
          customerEmail,
          returnUrl,
          metadata: merged,
          environment: getStripeEnvironment(),
        },
      })
      .then(({ data, error: err }) => {
        if (err || !data?.clientSecret) {
          throw new Error(err?.message || "Failed to create checkout session");
        }
        return data.clientSecret as string;
      });
  }, [priceId, customerEmail, returnUrl, metadata]);

  const warm = useCallback(() => {
    if (sessionRef.current) return sessionRef.current;
    try {
      void getStripe();
    } catch {
      /* publishable key missing — the modal surfaces the error */
    }
    const p = createSession();
    // Swallow unhandled rejections; the click handler re-reads the promise.
    p.catch(() => undefined);
    sessionRef.current = p;
    return p;
  }, [createSession]);

  // Preload Stripe + the checkout session as soon as the button is on screen.
  useEffect(() => {
    void import("@/components/StripeCheckoutModal");
    warm();
  }, [warm]);

  const prefetchedClientSecret = useCallback(() => warm(), [warm]);

  const handleClick = async () => {
    if (loading || open) return;
    setError(null);
    setLoading(true);
    pushGtmEvent(clickEvent, { ...(eventParams ?? {}) });

    let timedOut = false;
    const timeout = new Promise<never>((_, reject) =>
      window.setTimeout(() => {
        timedOut = true;
        reject(new Error("timeout"));
      }, OPEN_TIMEOUT_MS),
    );

    try {
      await Promise.race([warm(), timeout]);
      setOpen(true);
      onOpen?.();
    } catch (e) {
      sessionRef.current = null;
      const message = timedOut ? "timeout" : e instanceof Error ? e.message : "unknown";
      setError("Checkout didn't load - tap to try again");
      pushGtmEvent(errorEvent, { ...(eventParams ?? {}), error_message: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        id={id}
        className={className}
        onClick={handleClick}
        aria-busy={loading}
        style={{ ...style, opacity: loading ? 0.85 : 1, cursor: loading ? "wait" : "pointer" }}
      >
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                border: "2px solid rgba(8,8,7,0.25)",
                borderTopColor: "#080807",
                borderRadius: "50%",
                display: "inline-block",
                animation: "wlBtnSpin 0.8s linear infinite",
              }}
            />
            Opening secure checkout…
            <style>{`@keyframes wlBtnSpin { to { transform: rotate(360deg) } }`}</style>
          </span>
        ) : (
          label
        )}
      </button>

      {error && (
        <p
          role="status"
          style={{
            margin: "10px 0 0",
            fontFamily: "Barlow, sans-serif",
            fontSize: 12.5,
            letterSpacing: "0.02em",
            color: "#CAA449",
          }}
        >
          {error}
        </p>
      )}

      {open && (
        <Suspense fallback={null}>
          <StripeCheckoutModalLazy
            priceId={priceId}
            customerEmail={customerEmail}
            returnUrl={returnUrl}
            metadata={{ ...(metadata ?? {}), ...getLastTouchCheckoutMetadata() }}
            prefetchedClientSecret={prefetchedClientSecret}
            onReady={(ms) => pushGtmEvent(readyEvent, { ...(eventParams ?? {}), load_ms: ms })}
            onClose={() => {
              setOpen(false);
              // A consumed session cannot be reused for a second attempt.
              sessionRef.current = null;
              onClosed?.();
            }}
          />
        </Suspense>
      )}
    </>
  );
}

export default ReserveCheckoutButton;
