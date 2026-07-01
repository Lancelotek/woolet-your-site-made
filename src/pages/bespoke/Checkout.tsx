import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, ShieldCheck, Lock, RefreshCcw, Scissors, Truck } from "lucide-react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useBespokeConfig, computePricing, formatEur } from "@/lib/bespoke-state";
import { findFrame } from "@/data/frames";
import {
  COLORS,
  FINISHES,
  LENS_TYPES,
  LENS_MATERIALS,
  LENS_COATINGS,
  ENGRAVING_POSITIONS,
} from "@/data/bespoke-options";
import SEO from "@/components/SEO";
import {
  buildPreviewKey,
  getLatestPreviewUrl,
  PREVIEW_UPDATED_EVENT,
} from "@/pages/bespoke/steps";
import { pushGtmEvent } from "@/lib/gtm";
import { readConsentSnapshot } from "@/lib/consent";
import { trackMetaEvent } from "@/lib/meta-capi";
import { clarityEvent, claritySet } from "@/lib/clarity";

const PURCHASE_TRACKED_KEY = "woolet_bespoke_purchase_tracked_v1";

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-cream/10 last:border-b-0">
    <div className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">{label}</div>
    <div className="text-cream text-sm text-right">
      {value || <span className="text-cream-dim/60">—</span>}
    </div>
  </div>
);

export default function BespokeCheckout() {
  const navigate = useNavigate();
  const { config } = useBespokeConfig();
  const pricing = computePricing(config);

  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);

  const previewKey = buildPreviewKey(config.frameId, config.frontColorId, config.templeColorId, config.finishId);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(() => getLatestPreviewUrl(previewKey));
  useEffect(() => {
    setAiPreviewUrl(getLatestPreviewUrl(previewKey));
    const onUpdate = () => setAiPreviewUrl(getLatestPreviewUrl(previewKey));
    window.addEventListener(PREVIEW_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(PREVIEW_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [previewKey]);

  const ready = Boolean(frame && front && temple && finish && lens && pricing.totalEur > 0);

  const productName = frame ? `Woolet Bespoke — ${frame.name}` : "Woolet Bespoke";
  const description = useMemo(() => {
    const parts: string[] = [];
    if (front) parts.push(`Front ${front.code}`);
    if (temple) parts.push(`Temple ${temple.code}`);
    if (finish) parts.push(finish.name);
    if (config.engravingEnabled && config.engravingText) parts.push(`Engraving "${config.engravingText}"`);
    if (lens) parts.push(lens.name);
    return parts.join(" · ");
  }, [front, temple, finish, lens, config.engravingEnabled, config.engravingText]);

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/en/bespoke/checkout?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : "";

  const metadata: Record<string, string> = {
    frame: frame?.id ?? "",
    front: front?.code ?? "",
    temple: temple?.code ?? "",
    finish: finish?.id ?? "",
    engraving: config.engravingEnabled ? config.engravingText.slice(0, 60) : "",
    lens_type: lens?.id ?? "",
  };

  // --- Analytics: shared payload builders ------------------------------------
  const buildEventPayload = useCallback(
    (extra: Record<string, string | number | boolean> = {}) => {
      const consent = readConsentSnapshot();
      return {
        flow: "bespoke",
        frame_id: frame?.id ?? "",
        frame_name: frame?.name ?? "",
        front_code: front?.code ?? "",
        temple_code: temple?.code ?? "",
        finish_id: finish?.id ?? "",
        lens_type: lens?.id ?? "",
        engraving_enabled: config.engravingEnabled,
        ai_preview_present: Boolean(aiPreviewUrl),
        value: pricing.totalEur,
        currency: "USD",
        environment: getStripeEnvironment(),
        consent_state: consent.consent_state,
        consent_ad_storage: consent.ad_storage,
        consent_ad_user_data: consent.ad_user_data,
        consent_ad_personalization: consent.ad_personalization,
        consent_analytics_storage: consent.analytics_storage,
        ...extra,
      };
    },
    [frame, front, temple, finish, lens, config.engravingEnabled, aiPreviewUrl, pricing.totalEur],
  );

  // --- Analytics: Checkout viewed (once, when ready) -------------------------
  const viewedTracked = useRef(false);
  useEffect(() => {
    if (!ready || viewedTracked.current) return;
    viewedTracked.current = true;
    const payload = buildEventPayload();
    pushGtmEvent("checkout_viewed", payload);
    claritySet("checkout_flow", "bespoke");
    claritySet("checkout_consent", payload.consent_state);
    clarityEvent("bespoke_checkout_viewed");
    void trackMetaEvent("InitiateCheckout", {
      custom: {
        value: pricing.totalEur,
        currency: "USD",
        num_items: 1,
        content_ids: frame?.id ? [frame.id] : undefined,
        content_name: productName,
        content_type: "product",
      },
    });
  }, [ready, buildEventPayload, pricing.totalEur, frame?.id, productName]);

  // --- Analytics: Purchase completed (once, on ?paid=1) ----------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;
    const sessionId = params.get("session_id") || "";
    let alreadyTracked = false;
    try {
      alreadyTracked = sessionStorage.getItem(PURCHASE_TRACKED_KEY) === sessionId;
    } catch {
      /* noop */
    }
    if (alreadyTracked) return;
    try {
      sessionStorage.setItem(PURCHASE_TRACKED_KEY, sessionId);
    } catch {
      /* noop */
    }
    const payload = buildEventPayload({ stripe_session_id: sessionId });
    pushGtmEvent("purchase_completed", payload);
    clarityEvent("bespoke_purchase_completed");
    // Purchase to Meta is fired server-side from payments-webhook (dedup by event_id).
    // We still push GTM so downstream tags (GA4 purchase) fire client-side too.
  }, [buildEventPayload]);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    // --- Analytics: Payment initiated (fires when Stripe requests secret) ---
    pushGtmEvent("payment_initiated", buildEventPayload());
    clarityEvent("bespoke_payment_initiated");

    const { data, error } = await supabase.functions.invoke("create-bespoke-checkout", {
      body: {
        amountUsd: pricing.totalEur,
        productName,
        description,
        returnUrl,
        metadata,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      pushGtmEvent("payment_initiated_error", {
        ...buildEventPayload(),
        error_message: (error?.message || "no_client_secret").slice(0, 140),
      });
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret as string;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing.totalEur, productName, description, returnUrl, buildEventPayload]);

  return (
    <>
      <SEO title="Secure checkout · Woolet Bespoke" description="Complete your Woolet Bespoke order. Free worldwide shipping." noindex />
      <PaymentTestModeBanner />

      <div className="min-h-screen bg-background text-cream">
        <header className="border-b border-cream/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/en/bespoke/configurator")}
              className="inline-flex items-center gap-2 text-cream-dim hover:text-cream text-[11px] uppercase tracking-[0.2em] transition"
            >
              <ChevronLeft size={14} /> Back to configurator
            </button>
            <div className="text-[11px] uppercase tracking-[0.22em] text-cream-dim">
              Secure checkout · <span className="text-gold-light">Free worldwide shipping</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-16">
          {!ready ? (
            <div className="max-w-xl mx-auto text-center py-24">
              <h1 className="font-display text-3xl mb-4">
                Your <em className="italic text-gold-light">build is incomplete</em>
              </h1>
              <p className="text-cream-dim text-sm mb-8">
                We couldn&rsquo;t find a finished configuration on this device. Head back to the configurator and pick a pattern, acetate and lens before checkout.
              </p>
              <Link
                to="/en/bespoke/configurator"
                className="inline-flex items-center justify-center px-8 py-3 bg-gold text-background text-xs uppercase tracking-[0.22em] font-medium hover:bg-gold-light transition"
                style={{ borderRadius: 2 }}
              >
                Open configurator
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
              {/* Payment column */}
              <section className="order-2 lg:order-1">
                <div className="mb-6">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-gold-light mb-3">Payment</div>
                  <h1 className="font-display text-3xl sm:text-4xl leading-tight">
                    Complete your <em className="italic text-gold-light">bespoke order</em>
                  </h1>
                  <p className="text-cream-dim text-sm mt-3 max-w-lg leading-relaxed">
                    You&rsquo;re paying for the pattern, acetate and lens configuration you selected. The made-to-measure fit scan is booked <span className="text-gold-light">after</span> payment.
                  </p>

                  {/* Trust row */}
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-cream-dim">
                    <li className="inline-flex items-center gap-1.5"><Lock size={12} className="text-gold-light" /> 256-bit secure</li>
                    <li className="inline-flex items-center gap-1.5"><ShieldCheck size={12} className="text-gold-light" /> Fit guaranteed</li>
                    <li className="inline-flex items-center gap-1.5"><RefreshCcw size={12} className="text-gold-light" /> 30-day remake</li>
                    <li className="inline-flex items-center gap-1.5"><Scissors size={12} className="text-gold-light" /> Cut in Italy</li>
                    <li className="inline-flex items-center gap-1.5"><Truck size={12} className="text-gold-light" /> Free shipping</li>
                  </ul>
                </div>

                <div className="bg-white text-[#0B0A09] overflow-hidden" style={{ borderRadius: 4 }}>
                  <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>

                {/* Guarantee block */}
                <div
                  className="mt-6 border border-cream/10 p-5"
                  style={{ borderRadius: 4, background: "rgba(239,233,223,0.03)" }}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-gold-light shrink-0 mt-0.5" size={20} />
                    <div>
                      <div className="text-cream text-sm font-medium">The Woolet Fit Promise</div>
                      <p className="text-cream-dim text-[12px] leading-relaxed mt-1">
                        Every bespoke pair is hand-cut in Italy from your verified measurements. If the fit isn&rsquo;t right within 30 days of delivery, we remake the frame — on us. No restocking fees, no small print.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social proof */}
                <figure className="mt-6 border-l-2 border-gold/40 pl-4">
                  <blockquote className="text-cream text-[13px] leading-relaxed italic">
                    &ldquo;First pair in ten years that actually sits on my face. The AI preview matched what arrived — I knew exactly what I was paying for.&rdquo;
                  </blockquote>
                  <figcaption className="mt-2 text-cream-dim text-[10px] uppercase tracking-[0.18em]">
                    Marco B. · Verified bespoke buyer
                  </figcaption>
                </figure>
              </section>

              {/* Summary column */}
              <aside className="order-1 lg:order-2 lg:sticky lg:top-8">
                <div className="border border-cream/10 bg-background/40" style={{ borderRadius: 4 }}>
                  {frame && (
                    <div
                      className="relative aspect-[16/10] flex items-center justify-center overflow-hidden"
                      style={{ background: "#EFE9DF", borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                    >
                      {aiPreviewUrl ? (
                        <>
                          <img
                            src={aiPreviewUrl}
                            alt={`AI visualisation of your ${frame.name} in ${front?.name} / ${temple?.name}`}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-[0.18em]"
                            style={{ background: "rgba(11,10,9,0.72)", color: "#D8B86A", borderRadius: 2 }}
                          >
                            <Sparkles size={10} /> Your AI preview
                          </div>
                        </>
                      ) : (
                        <img src={frame.url} alt={frame.name} className="max-h-full max-w-[60%] object-contain" />
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-gold-light">Order summary</div>
                    {frame && (
                      <div className="mt-2 mb-4">
                        <div className="font-display text-cream text-xl">{frame.name}</div>
                        <div className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">Pattern · {frame.shape}</div>
                      </div>
                    )}

                    <div className="mt-3">
                      <SummaryRow
                        label="Front acetate"
                        value={
                          front && (
                            <span className="inline-flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full border border-cream/20" style={{ background: front.hex }} />
                              <span className="font-mono text-[10px] text-gold-light">{front.code}</span>
                            </span>
                          )
                        }
                      />
                      <SummaryRow
                        label="Temple acetate"
                        value={
                          temple && (
                            <span className="inline-flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full border border-cream/20" style={{ background: temple.hex }} />
                              <span className="font-mono text-[10px] text-gold-light">{temple.code}</span>
                            </span>
                          )
                        }
                      />
                      <SummaryRow label="Finish" value={finish?.name} />
                      <SummaryRow
                        label="Engraving"
                        value={
                          config.engravingEnabled
                            ? `"${config.engravingText}" · ${ENGRAVING_POSITIONS.find((p) => p.id === config.engravingPositionId)?.name ?? ""}`
                            : "None"
                        }
                      />
                      <SummaryRow label="Lenses" value={lens?.name} />
                      {config.lensTypeId !== "plano" && (
                        <>
                          <SummaryRow label="Material" value={LENS_MATERIALS.find((m) => m.id === config.lensMaterialId)?.name} />
                          <SummaryRow label="Coating" value={LENS_COATINGS.find((c) => c.id === config.lensCoatingId)?.name} />
                        </>
                      )}
                      <SummaryRow label="Shipping" value={<span className="text-gold-light">Free · worldwide</span>} />
                    </div>

                    <div className="flex items-baseline justify-between gap-4 pt-4 mt-3 border-t border-cream/15">
                      <div className="text-cream text-[11px] uppercase tracking-[0.2em]">Total due today</div>
                      <div className="text-cream text-2xl font-display">{formatEur(pricing.totalEur)}</div>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 border border-gold/25 px-5 py-4"
                  style={{
                    background: "linear-gradient(180deg, rgba(194,160,90,0.06), rgba(194,160,90,0.01))",
                    borderRadius: 2,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "#C2A05A" }}>
                    After payment
                  </div>
                  <ol className="mt-2 space-y-1.5 text-cream-dim text-[12px] leading-relaxed">
                    <li>01 · Order confirmed and paid.</li>
                    <li>02 · Private link emailed for your AI fit scan.</li>
                    <li>03 · Optician verifies measurements within 24 h.</li>
                    <li>04 · Cut in Italy — 3–4 weeks to ship, free worldwide.</li>
                  </ol>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
