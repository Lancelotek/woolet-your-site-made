import { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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

  const fetchClientSecret = useCallback(async (): Promise<string> => {
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
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret as string;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing.totalEur, productName, description, returnUrl]);

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
                </div>

                <div className="bg-white text-[#0B0A09] overflow-hidden" style={{ borderRadius: 4 }}>
                  <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              </section>

              {/* Summary column */}
              <aside className="order-1 lg:order-2 lg:sticky lg:top-8">
                <div className="border border-cream/10 bg-background/40" style={{ borderRadius: 4 }}>
                  {frame && (
                    <div
                      className="aspect-[16/10] flex items-center justify-center"
                      style={{ background: "#EFE9DF", borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                    >
                      <img src={frame.url} alt={frame.name} className="max-h-full max-w-[60%] object-contain" />
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
