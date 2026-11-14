import { depositPrice, refreshBespokePrices, splitDeposit, usePriceTable } from "@/lib/bespoke-pricing";
import { afterPaymentSteps } from "@/lib/bespoke-balance";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGaCheckoutMetadataAsync } from "@/lib/ga-ids";
import { getOppref, oaiqBespokeCheckoutStarted, oaiqBespokeOrderCreated, oaiqIdentifyHash } from "@/lib/openai-pixel";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, ShieldCheck, Lock, Scissors, Truck } from "lucide-react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PayMeasureNotice } from "@/components/bespoke/PayMeasureNotice";
import HeardFromQuestion from "@/components/HeardFromQuestion";
import { useBespokeConfig, hasEngraving, computePricing, formatEur, formatLensWithStrength, lensOrderValue, lensTintCode, selectedLensTint, isStepComplete, readingStrengthMetaValue } from "@/lib/bespoke-state";
import { findFrame } from "@/data/frames";
import {
  COLORS,
  FINISHES,
  LENS_TYPES,
  ENGRAVING_POSITIONS,
  formatTempleLength,
} from "@/data/bespoke-options";
import SEO from "@/components/SEO";
import {
  buildPreviewKey,
  getLatestPreviewUrl,
  PREVIEW_UPDATED_EVENT,
  loadPreviewHistory,
  savePreviewHistory,
  renderRequestBody,
} from "@/pages/bespoke/steps";
import { renderAltForConfig } from "@/lib/bespoke-render-alt";
import { loadFrontRenders } from "@/lib/bespoke-front-renders";
import { pushGtmEvent } from "@/lib/gtm";
import { readConsentSnapshot } from "@/lib/consent";
import { trackInitiateCheckoutOnce } from "@/lib/meta-capi";
import { clarityEvent, claritySet } from "@/lib/clarity";
import { useAuth } from "@/lib/auth-context";
import { BESPOKE_PURCHASED_KEY } from "@/components/bespoke/ResumeBuildBar";
import { readSessionRef } from "@/lib/scan-session-ref";
import BespokeCaseHero from "@/components/BespokeCaseHero";
import { BESPOKE_DISCOVERY_SOURCES, isBespokeDiscoverySource, type BespokeDiscoverySource } from "@/content/bespokeFacts";
import { buildDesignUrl, designSummary, readSavedEmail } from "@/lib/bespoke-saved-design";

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
  const { session } = useAuth();
  const isSignedIn = Boolean(session);
  const { config } = useBespokeConfig();
  // Live prices: the summary and the Stripe session follow any price change.
  const prices = usePriceTable();
  const pricing = computePricing(config, prices);

  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);

  const baseKey = buildPreviewKey(config.frameId, config.frontColorId, config.templeColorId, config.finishId);
  const lensKey = buildPreviewKey(config.frameId, config.frontColorId, config.templeColorId, config.finishId, config.lensTypeId, lensTintCode(config));
  const previewKey = `${lensKey}::${baseKey}`;
  const resolvePreview = () => getLatestPreviewUrl(lensKey) ?? getLatestPreviewUrl(baseKey);

  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(resolvePreview);
  // Stand-in when this exact build has no render: the same build without the
  // lens tint. Never a render of another shape or acetate - the checkout once
  // showed a round frame on a Rectangle order (the newest render in history).
  const [fallbackPreviewUrl, setFallbackPreviewUrl] = useState<string | null>(() => lensTintCode(config) ? getLatestPreviewUrl(baseKey) : null);
  // Second stand-in: the pre-generated render of this shape in this front
  // acetate (black temples), so the picture always matches the pattern ordered.
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setFrontPreviewUrl(null);
    if (!config.frameId || !config.frontColorId) return;
    const { frameId, frontColorId } = config;
    void loadFrontRenders().then((map) => {
      if (!cancelled) setFrontPreviewUrl(map[frameId]?.[frontColorId]?.public_url ?? null);
    });
    return () => { cancelled = true; };
  }, [config.frameId, config.frontColorId]);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Coupon -----------------------------------------------------------
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  // Percent off as confirmed by the server (coupons live in table bespoke_coupons).
  const [couponPercent, setCouponPercent] = useState(0);
  // Deposit plan: the deposit is charged today, the balance after the buyer
  // approves the 3D model. The server prices the charge; this mirrors it.
  const split = splitDeposit(Math.round(pricing.totalEur * (100 - couponPercent)), depositPrice(prices, getStripeEnvironment() === "sandbox"));
  const dueTodayUsd = split.dueNowCents / 100;
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [source, setSource] = useState<BespokeDiscoverySource | "">(() => {
    try { const saved = localStorage.getItem("wlt_bespoke_source"); return isBespokeDiscoverySource(saved) ? saved : ""; }
    catch { return ""; }
  });
  useEffect(() => {
    const refresh = () => {
      setAiPreviewUrl(resolvePreview());
      setFallbackPreviewUrl(lensTintCode(config) ? getLatestPreviewUrl(baseKey) : null);
    };
    refresh();
    window.addEventListener(PREVIEW_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PREVIEW_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [previewKey]);


  const ready = Boolean(frame && front && temple && finish && lens && isStepComplete(6, config) && pricing.totalEur > 0);

  const productName = frame ? `Woolet Bespoke — ${frame.name}` : "Woolet Bespoke";
  const description = useMemo(() => {
    const parts: string[] = [];
    if (front) parts.push(`Front ${front.code}`);
    if (temple) parts.push(`Temple ${temple.code}`);
    if (finish) parts.push(finish.name);
    if (config.templeLengthMm) parts.push(`Temples ${config.templeLengthMm} mm${config.templeLengthIsCustom ? " (custom)" : ""}`);
    if (hasEngraving(config)) parts.push(`Engraving "${config.engravingText}"`);
    if (lens) parts.push(lensOrderValue(lens.name, config));
    return parts.join(" · ");
  }, [front, temple, finish, lens, config.lensTypeId, config.lensTintId, config.engravingEnabled, config.engravingText, config.templeLengthMm, config.templeLengthIsCustom]);

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/en/bespoke/checkout?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : "";

  const metadata: Record<string, string> = {
    frame: frame?.id ?? "",
    frame_name: frame ? `Woolet Bespoke — ${frame.name}` : "",
    front: front ? `${front.name} (${front.code})` : "",
    temple: temple ? `${temple.name} (${temple.code})` : "",
    finish: finish?.name ?? "",
    temple_length: config.templeLengthMm ? `${config.templeLengthMm} mm${config.templeLengthIsCustom ? " (custom)" : ""}` : "",
    engraving: hasEngraving(config) ? config.engravingText.trim().slice(0, 60) : "",
    lens_type: lens ? lensOrderValue(lens.name, config) : "",
    lens_id: lens?.id ?? "",
    lens_tint: lensTintCode(config),
    reading_strength: readingStrengthMetaValue(config),
    reading_strength_mode: config.lensTypeId === "reading" ? config.readingStrengthMode ?? "" : "",
    reading_strength_left: config.readingStrengthLeft ?? "",
    reading_strength_right: config.readingStrengthRight ?? "",
    ai_preview_url: (aiPreviewUrl ?? fallbackPreviewUrl ?? "").slice(0, 500),
    ai_front_preview_url: (getLatestPreviewUrl(`${lensKey}|front`) ?? "").slice(0, 500),
    // Pseudonymous link back to the fit scan. Carries no personal detail.
    scan_session_ref: readSessionRef() ?? "",
    source,
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
        temple_length_mm: config.templeLengthMm ?? "",
        lens_type: lens?.id ?? "",
        lens_tint: lensTintCode(config),
        engraving_enabled: hasEngraving(config),
        ai_preview_present: Boolean(aiPreviewUrl),
        // What is charged now. On the deposit plan that is the deposit, so the
        // browser events carry the same value as the server-side Purchase.
        value: dueTodayUsd,
        order_total: pricing.totalEur,
        payment_plan: split.plan,
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
    [frame, front, temple, finish, lens, config.engravingEnabled, aiPreviewUrl, pricing.totalEur, dueTodayUsd, split.plan],
  );

  const handleGeneratePreview = useCallback(async () => {
    if (!frame || !front || !temple || !finish) return;
    setIsGenerating(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-preview-render", {
        body: renderRequestBody(config, false),
      });
      if (fnErr) throw fnErr;
      const url = (data as { imageUrl?: string })?.imageUrl;
      if (!url) throw new Error("No preview returned");

      const history = loadPreviewHistory();
      const prev = history[previewKey] ?? [];
      const combined = [{ url, ts: Date.now() }, ...prev.filter((e) => e.url !== url)];
      const nextList = combined.slice(0, 4);
      const nextHistory = { ...history, [previewKey]: nextList };
      savePreviewHistory(nextHistory);
      setAiPreviewUrl(url);
      pushGtmEvent("ai_preview_generated", buildEventPayload({ preview_url: url }));
      clarityEvent("bespoke_ai_preview_generated_checkout");
    } catch (e) {
      pushGtmEvent("ai_preview_generation_error", {
        ...buildEventPayload(),
        error_message: ((e as Error).message || "unknown").slice(0, 140),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [frame, front, temple, finish, previewKey, buildEventPayload, config]);

  // --- Analytics: Checkout viewed (once, when ready) -------------------------
  const viewedTracked = useRef(false);
  useEffect(() => {
    if (!ready || viewedTracked.current) return;
    // Back from Stripe with ?paid=1: this is the confirmation, not a new checkout view.
    if (new URLSearchParams(window.location.search).get("paid") === "1") return;
    viewedTracked.current = true;
    const payload = buildEventPayload();
    pushGtmEvent("checkout_viewed", payload);
    claritySet("checkout_flow", "bespoke");
    claritySet("checkout_consent", payload.consent_state);
    clarityEvent("bespoke_checkout_viewed");
    trackInitiateCheckoutOnce(`bespoke:${frame?.id ?? "unknown"}`, {
      custom: {
        value: dueTodayUsd,
        currency: "USD",
        num_items: 1,
        content_ids: frame?.id ? [frame.id] : undefined,
        content_name: productName,
        content_type: "product",
      },
    });
  }, [ready, buildEventPayload, dueTodayUsd, frame?.id, productName]);

  // The case number panel shows only on the return from a completed payment.
  const paidSessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("paid") === "1" ? params.get("session_id") || "" : "";
  }, []);

  // --- OpenAI pixel: order_created once the paid order exists (webhook-confirmed).
  useEffect(() => {
    if (!paidSessionId) return;
    let cancelled = false;
    let tries = 0;
    const poll = async () => {
      if (cancelled) return;
      tries += 1;
      try {
        const base = import.meta.env.VITE_SUPABASE_URL;
        const res = await fetch(`${base}/functions/v1/bespoke-order-get?sid=${encodeURIComponent(paidSessionId)}`, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          const order = json?.order ?? json;
          const cents = Number(order?.amount_cents);
          if (order?.stripe_session_id && Number.isFinite(cents) && cents > 0) {
            if (typeof order?.customer_email_sha256 === "string") oaiqIdentifyHash(order.customer_email_sha256);
            oaiqBespokeOrderCreated(cents, paidSessionId);
            return;
          }
        }
      } catch {
        /* retry */
      }
      if (tries < 10 && !cancelled) window.setTimeout(poll, 3000);
    };
    void poll();
    return () => { cancelled = true; };
  }, [paidSessionId]);

  // --- Analytics: Purchase completed (once, on ?paid=1) ----------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;
    try {
      localStorage.setItem(BESPOKE_PURCHASED_KEY, new Date().toISOString());
    } catch {
      /* private mode */
    }
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
    // The Stripe checkout runs on Stripe's own origin, which Clarity cannot
    // see — the funnel goes dark between bespoke_checkout_start and the
    // customer's return to woolet.co.
    clarityEvent("bespoke_checkout_start");

    const { data, error } = await supabase.functions.invoke("create-bespoke-checkout", {
      body: {
        // The server prices the selection itself; amountUsd is only a cross-check.
        selection: {
          frameId: frame?.id ?? config.frameId,
          lensTypeId: config.lensTypeId ?? "none",
          engraving: hasEngraving(config),
        },
        amountUsd: pricing.totalEur,
        couponCode: appliedCoupon ?? undefined,
        productName,
        description,
        returnUrl,
        // Known email (saved design / scan) prefills Stripe: one field less for the buyer,
        // and an abandoned session can be followed up by payments-webhook.
        customerEmail: readSavedEmail() ?? config.scanContactEmail ?? undefined,
        metadata: { ...metadata, ...(await getGaCheckoutMetadataAsync()),
          bespoke_design_url: buildDesignUrl(config, "bespoke_abandoned_checkout"),
          bespoke_design_summary: designSummary(config), ...(getOppref() ? { openai_oppref: getOppref() } : {}) },
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
    if (typeof data.sessionId === "string") {
      oaiqBespokeCheckoutStarted(
        typeof data.amountCents === "number" ? data.amountCents : Math.round(pricing.totalEur * 100),
        data.sessionId,
      );
    }
    // Price changed between page load and checkout: pull the new table so the
    // summary matches what Stripe shows.
    if (typeof data.listPriceUsd === "number" && data.listPriceUsd !== pricing.totalEur) {
      void refreshBespokePrices();
    }
    return data.clientSecret as string;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing.totalEur, config.lensTypeId, config.frameId, productName, description, returnUrl, buildEventPayload, appliedCoupon, source]);

  return (
    <>
      <SEO title="Secure checkout · Woolet Bespoke" description="Complete your Woolet Bespoke order. Free worldwide shipping." noindex />
      <PaymentTestModeBanner />

      <div className="min-h-screen bg-background text-cream">
        <header className="border-b border-cream/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
            {/* Mobile: no back control above the card fields - Clarity showed a buyer
                mis-tapping it while Stripe's form was still growing. "Edit your build"
                lives under the order summary instead. */}
            <button
              onClick={() => navigate("/en/bespoke/configurator")}
              className="hidden sm:inline-flex items-center gap-2 text-cream-dim hover:text-cream text-[11px] uppercase tracking-[0.2em] transition"
            >
              <ChevronLeft size={14} /> Back to configurator
            </button>
            <div className="text-[11px] uppercase tracking-[0.22em] text-cream-dim">
              Secure checkout · <span className="text-gold-light">Free worldwide shipping</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-16">
          {paidSessionId && <BespokeCaseHero sessionId={paidSessionId} />}
          {/* Asked after payment when the optional pre-payment question was skipped. */}
          {paidSessionId && !source && <div className="max-w-xl mx-auto mb-10"><HeardFromQuestion sessionId={paidSessionId} /></div>}
          {paidSessionId ? (
            // Paid: never show the payment form again (it would open a second
            // Stripe session for an order that already exists).
            <section className="max-w-xl mx-auto text-center py-6 sm:py-10">
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold-light mb-3">
                {split.plan === "deposit" ? "Deposit received" : "Payment received"}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight">
                {split.plan === "deposit" ? <>Your order is <em className="italic text-gold-light">open</em>.</> : <>Your order is <em className="italic text-gold-light">confirmed</em>.</>}
              </h1>
              <p className="mt-4 text-cream-dim text-sm leading-relaxed">
                {split.plan === "deposit"
                  ? <>We emailed you a confirmation. Next, send us your measurements so we can prepare your 3D model. You pay the remaining {formatEur(split.balanceCents / 100)} only after you approve the model.</>
                  : <>We emailed you a confirmation. Next, send us your measurements so we can prepare your 3D model for approval.</>}
              </p>
              <Link
                to={`/en/bespoke/measurements?sid=${encodeURIComponent(paidSessionId)}`}
                className="mt-7 inline-flex items-center justify-center px-8 py-3.5 bg-gold text-background text-xs uppercase tracking-[0.22em] font-medium hover:bg-gold-light transition"
                style={{ borderRadius: 2 }}
              >
                Submit my measurements
              </Link>
            </section>
          ) : !ready ? (
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
              {/* Payment column. On mobile it comes first: the card form used to sit
                  about 1,900 px down, under the whole summary (Clarity: buyers
                  reached checkout and left without ever seeing it). */}
              <section className="order-1 min-w-0">
                {frame && (
                  <a
                    href="#order-summary"
                    className="lg:hidden mb-6 flex items-center gap-3 border border-cream/15 p-3 text-left"
                    style={{ borderRadius: 4 }}
                  >
                    <span className="h-14 w-20 shrink-0 overflow-hidden flex items-center justify-center" style={{ background: "#EFE9DF", borderRadius: 2 }}>
                      <img
                        src={aiPreviewUrl ?? fallbackPreviewUrl ?? frontPreviewUrl ?? frame.url}
                        alt=""
                        className={aiPreviewUrl || fallbackPreviewUrl || frontPreviewUrl ? "h-full w-full object-cover" : "max-h-full max-w-[80%] object-contain"}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-cream text-base leading-tight truncate">{frame.name}</span>
                      <span className="block text-cream-dim text-[11px] truncate">{[front?.name, temple?.name].filter(Boolean).join(" · ")}</span>
                      <span className="block mt-1 text-gold-light text-[10px] uppercase tracking-[0.16em] underline underline-offset-4">Order details and discount code</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-cream-dim text-[10px] uppercase tracking-[0.16em]">Due today</span>
                      <span className="block font-display text-cream text-xl">{formatEur(dueTodayUsd)}</span>
                    </span>
                  </a>
                )}
                <div className="mb-6">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-gold-light mb-3">Payment</div>
                  <h1 className="font-display text-3xl sm:text-4xl leading-tight">
                    Complete your <em className="italic text-gold-light">bespoke order</em>
                  </h1>
                  <div className="mt-3"><PayMeasureNotice split={split} /></div>

                  {/* Trust row - desktop only here; on mobile it sits under the form. */}
                  <ul className="mt-5 hidden lg:flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-cream-dim">
                    <li className="inline-flex items-center gap-1.5"><Lock size={12} className="text-gold-light" /> 256-bit secure</li>
                    <li className="inline-flex items-center gap-1.5"><ShieldCheck size={12} className="text-gold-light" /> Wrong fit? 50% off a new frame</li>
                    
                    <li className="inline-flex items-center gap-1.5"><Scissors size={12} className="text-gold-light" /> Cut in the EU</li>
                    <li className="inline-flex items-center gap-1.5"><Truck size={12} className="text-gold-light" /> Free shipping</li>
                  </ul>
                </div>

                {/* Desktop only: on mobile the same question is asked after payment
                    (HeardFromQuestion), so nothing stands between the buyer and the form. */}
                <div className="hidden lg:block mb-6 border border-cream/15 p-5" style={{ borderRadius: 4 }}>
                  <label htmlFor="bespoke-source" className="block text-[11px] uppercase tracking-[0.2em] text-cream mb-2">
                    How did you find Woolet? <span className="text-cream-dim normal-case tracking-normal">(optional)</span>
                  </label>
                  <select
                    id="bespoke-source"
                    value={source}
                    onChange={(event) => {
                      const next = event.target.value as BespokeDiscoverySource | "";
                      setSource(next);
                      try { if (next) localStorage.setItem("wlt_bespoke_source", next); }
                      catch { /* storage can be blocked */ }
                    }}
                    className="min-h-[48px] w-full border border-cream/20 bg-background px-3 text-sm text-cream outline-none focus:border-gold"
                  >
                    <option value="">Select one</option>
                    {BESPOKE_DISCOVERY_SOURCES.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                {(
                  <div
                    className="relative bg-white text-[#0B0A09] overflow-hidden min-h-[640px] sm:min-h-[560px]"
                    style={{ borderRadius: 4 }}
                  >
                    {/* Reserved height + skeleton: the embedded form loads into this box
                        instead of pushing the page down (mobile CLS was 0.21-0.27). */}
                    <div className="absolute inset-0 p-6 space-y-4 pointer-events-none" aria-hidden="true">
                      <div className="h-4 w-1/3 bg-[#0B0A09]/[0.06] rounded animate-pulse" />
                      <div className="h-11 w-full bg-[#0B0A09]/[0.06] rounded animate-pulse" />
                      <div className="h-11 w-full bg-[#0B0A09]/[0.06] rounded animate-pulse" />
                      <div className="h-11 w-2/3 bg-[#0B0A09]/[0.06] rounded animate-pulse" />
                    </div>
                    <div className="relative bg-white">
                    <EmbeddedCheckoutProvider key={`${appliedCoupon ?? "no-coupon"}:${source}:${pricing.totalEur}:${split.plan}:${split.dueNowCents}`} stripe={getStripe()} options={{ fetchClientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                    </div>
                  </div>
                )}

                <ul className="lg:hidden mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-cream-dim">
                  <li className="inline-flex items-center gap-1.5"><Lock size={12} className="text-gold-light" /> 256-bit secure</li>
                  <li className="inline-flex items-center gap-1.5"><ShieldCheck size={12} className="text-gold-light" /> Wrong fit? 50% off a new frame</li>
                  <li className="inline-flex items-center gap-1.5"><Scissors size={12} className="text-gold-light" /> Cut in the EU</li>
                  <li className="inline-flex items-center gap-1.5"><Truck size={12} className="text-gold-light" /> Free shipping</li>
                </ul>

                {/* Guarantee block */}
                <div
                  className="mt-6 border border-cream/10 p-5"
                  style={{ borderRadius: 4, background: "rgba(239,233,223,0.03)" }}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-gold-light shrink-0 mt-0.5" size={20} />
                    <div>
                      <div className="text-cream text-sm font-medium">Built from your measurements</div>
                      <p className="text-cream-dim text-[12px] leading-relaxed mt-1">
                        Every bespoke pair is hand-cut in the EU with Italian materials from your verified measurements. Production starts after you approve the 3D model and takes 2 weeks. 5-year warranty on hinges, rims and finish.
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
              <aside id="order-summary" className="order-2 min-w-0 scroll-mt-6 lg:sticky lg:top-8">
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
                            alt={renderAltForConfig(config, Boolean(getLatestPreviewUrl(lensKey)) && lensKey !== baseKey)}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-[0.18em]"
                            style={{ background: "rgba(11,10,9,0.72)", color: "#D8B86A", borderRadius: 2 }}
                          >
                            <Sparkles size={10} /> Your AI preview
                          </div>
                        </>
                      ) : fallbackPreviewUrl ? (
                        <>
                          <img
                            src={fallbackPreviewUrl}
                            alt={renderAltForConfig(config, false)}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-[0.18em]"
                            style={{ background: "rgba(11,10,9,0.72)", color: "#D8B86A", borderRadius: 2 }}
                          >
                            <Sparkles size={10} /> Preview without lens tint
                          </div>
                        </>
                      ) : frontPreviewUrl && front ? (
                        <>
                          <img
                            src={frontPreviewUrl}
                            alt={`Woolet Bespoke ${frame.name} eyeglasses, front in ${front.name} acetate, shown with black temples`}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-[0.18em]"
                            style={{ background: "rgba(11,10,9,0.72)", color: "#D8B86A", borderRadius: 2 }}
                          >
                            {frame.name} · {front.name} front
                          </div>
                        </>
                      ) : (
                        <img src={frame.url} alt={`Woolet Bespoke ${frame.name} — ${frame.shape} pattern, made-to-measure eyewear cut in the EU for wide faces`} className="max-h-full max-w-[60%] object-contain" />
                      )}
                    </div>
                  )}

                  {/* Signed-out buyers never get pushed off checkout to a sign-in page
                      just to render a preview (Clarity: half of them left there). */}
                  {!aiPreviewUrl && frame && isSignedIn && (
                    <div className="border-t border-cream/10 p-4" style={{ background: "rgba(239,233,223,0.03)" }}>
                      <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-gold-light shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-cream text-xs font-medium">
                            {fallbackPreviewUrl ? "Preview shown without your lens tint" : frontPreviewUrl ? "Preview shows your front acetate with black temples" : "No AI preview for this build yet"}
                          </div>
                          <p className="text-cream-dim text-[11px] leading-relaxed mt-1">
                            {fallbackPreviewUrl || frontPreviewUrl
                              ? "Generate a fresh AI visualisation of your current pattern and acetate choices to see exactly what you’re buying."
                              : "Generate an AI visualisation of your current pattern and colours before you pay."}
                          </p>
                          {!isSignedIn ? (
                            <Link
                              to={`/en/account/sign-in?next=${encodeURIComponent("/en/bespoke/checkout")}`}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gold text-background text-[10px] uppercase tracking-[0.18em] font-medium hover:bg-gold-light transition"
                              style={{ borderRadius: 2 }}
                            >
                              <Sparkles size={12} /> Sign in to generate AI preview
                            </Link>
                          ) : (
                          <button
                            onClick={handleGeneratePreview}
                            disabled={isGenerating}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gold text-background text-[10px] uppercase tracking-[0.18em] font-medium hover:bg-gold-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ borderRadius: 2 }}
                          >
                            {isGenerating ? (
                              <>
                                <div className="h-3 w-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                Rendering…
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} /> Generate preview for this build
                              </>
                            )}
                          </button>
                          )}
                        </div>
                      </div>
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
                              <span className="text-right">{front.name} <span className="font-mono text-[10px] text-gold-light">{front.code}</span></span>
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
                              <span className="text-right">{temple.name} <span className="font-mono text-[10px] text-gold-light">{temple.code}</span></span>
                            </span>
                          )
                        }
                      />
                      <SummaryRow
                        label="Temple length"
                        value={formatTempleLength(config.templeLengthMm, config.templeLengthIsCustom)}
                      />
                      <SummaryRow label="Finish" value={finish?.name} />
                      <SummaryRow
                        label="Engraving"
                        value={
                          hasEngraving(config)
                            ? `"${config.engravingText}" · ${ENGRAVING_POSITIONS.find((p) => p.id === config.engravingPositionId)?.name ?? ""}`
                            : "None"
                        }
                      />
                      <SummaryRow label="Lenses" value={lens ? <span className="inline-flex items-center justify-end gap-2">{selectedLensTint(config) && <span className="w-3 h-3 shrink-0 rounded-full border border-cream/20" style={{ background: selectedLensTint(config)?.hex }} />}{formatLensWithStrength(lens.name, config)}</span> : undefined} />
                      <SummaryRow label="Shipping" value={<span className="text-gold-light">Free · worldwide</span>} />
                    </div>

                    <Link
                      to="/en/bespoke/configurator"
                      className="mt-3 inline-flex items-center gap-1.5 text-cream-dim hover:text-cream text-[11px] uppercase tracking-[0.18em] underline underline-offset-4"
                    >
                      <ChevronLeft size={12} /> Edit your build
                    </Link>

                    {/* Coupon */}
                    <div className="pt-4 mt-3 border-t border-cream/15">
                      <label htmlFor="coupon" className="text-cream-dim text-[10px] uppercase tracking-[0.2em]">
                        Discount code
                      </label>
                      {appliedCoupon ? (
                        <div className="mt-2 flex items-center justify-between gap-3 border border-gold/30 px-3 py-2" style={{ borderRadius: 2, background: "rgba(194,160,90,0.07)" }}>
                          <span className="text-gold-light text-[11px] uppercase tracking-[0.16em]">
                            {appliedCoupon} · −{couponPercent}%
                          </span>
                          <button
                            type="button"
                            onClick={() => { setAppliedCoupon(null); setCouponPercent(0); setCouponInput(""); }}
                            className="text-cream-dim hover:text-cream text-[10px] uppercase tracking-[0.16em] underline underline-offset-4"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form
                          className="mt-2 flex gap-2"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const code = couponInput.trim().toUpperCase();
                            if (!code || couponChecking) return;
                            setCouponChecking(true);
                            const { data, error } = await supabase.functions.invoke("create-bespoke-checkout", {
                              body: { action: "validate_coupon", couponCode: code },
                            });
                            setCouponChecking(false);
                            const percent = Number(data?.percentOff);
                            if (error || !data?.valid || !Number.isFinite(percent)) {
                              setCouponError("This code isn’t valid.");
                              return;
                            }
                            setCouponError(null);
                            setCouponPercent(percent);
                            setAppliedCoupon(code);
                            pushGtmEvent("coupon_applied", buildEventPayload({ coupon_code: code }));
                          }}
                        >
                          <input
                            id="coupon"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value); setCouponError(null); }}
                            placeholder="Enter code"
                            maxLength={40}
                            className="flex-1 bg-transparent border border-cream/15 px-3 py-2 text-cream text-sm placeholder:text-cream-dim/50 focus:border-gold/50 outline-none"
                            style={{ borderRadius: 2 }}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 border border-gold/40 text-gold-light text-[10px] uppercase tracking-[0.18em] hover:bg-gold hover:text-background transition"
                            style={{ borderRadius: 2 }}
                          >
                            Apply
                          </button>
                        </form>
                      )}
                      {couponError && <p className="mt-2 text-[11px] text-red-400/90">{couponError}</p>}
                    </div>

                    {couponPercent > 0 && (
                      <div className="mt-4 space-y-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">Subtotal</div>
                          <div className="text-cream-dim text-sm line-through">{formatEur(pricing.totalEur)}</div>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="text-gold-light text-[11px] uppercase tracking-[0.16em]">Discount · {appliedCoupon}</div>
                          <div className="text-gold-light text-sm">−{formatEur(Math.round(pricing.totalEur * couponPercent) / 100)}</div>
                        </div>
                      </div>
                    )}

                    {split.plan === "deposit" ? (
                      <div className="pt-4 mt-3 border-t border-cream/15 space-y-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="text-cream-dim text-[11px] uppercase tracking-[0.2em]">Order total</div>
                          <div className="text-cream text-base">{formatEur(split.totalCents / 100)}</div>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="text-cream text-[11px] uppercase tracking-[0.2em]">Due today · deposit</div>
                          <div className="text-cream text-2xl font-display">{formatEur(dueTodayUsd)}</div>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">After you approve your 3D model</div>
                          <div className="text-cream-dim text-sm">{formatEur(split.balanceCents / 100)}</div>
                        </div>
                      </div>
                    ) : (
                    <div className="flex items-baseline justify-between gap-4 pt-4 mt-3 border-t border-cream/15">
                      <div className="text-cream text-[11px] uppercase tracking-[0.2em]">Total due today</div>
                      <div className="text-cream text-2xl font-display">
                        {formatEur(Math.round(pricing.totalEur * (100 - couponPercent)) / 100)}
                      </div>
                    </div>
                    )}
                    {couponPercent === 100 && (
                      <p className="mt-2 text-[11px] text-cream-dim/80">
                        Test order — a $1 minimum is charged because payments cannot be processed at zero.
                      </p>
                    )}
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
                    {afterPaymentSteps(split).map((line, i) => (
                      <li key={i}>{String(i + 1).padStart(2, "0")} · {line}</li>
                    ))}
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
