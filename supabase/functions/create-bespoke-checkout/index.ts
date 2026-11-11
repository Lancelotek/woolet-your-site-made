import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import {
  BESPOKE_FRAME_IDS,
  BESPOKE_LENS_IDS,
  applyPercentOff,
  depositPrice,
  splitDeposit,
  mergePriceRows,
  quoteBespoke,
  type BespokeSelection,
  type PriceTable,
} from "../_shared/bespoke-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  action?: "checkout" | "validate_coupon";
  /** What the buyer configured. The server prices it from table bespoke_pricing. */
  selection?: BespokeSelection;
  /** Total the browser displayed. Cross-check only - never charged. */
  amountUsd?: number;
  productName: string; // e.g. "Woolet Bespoke — Aviator"
  description?: string; // longer description for the buyer
  customerEmail?: string;
  returnUrl: string;
  environment: StripeEnv;
  metadata?: Record<string, string>;
  couponCode?: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Used only when table bespoke_coupons cannot be read (e.g. before the
// migration lands). The table is the source of truth.
const FALLBACK_COUPONS: Record<string, number> = { KICKSTARTER2026: 40 };

const db = () => (SUPABASE_URL && SERVICE_ROLE ? createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } }) : null);

async function loadPrices(): Promise<{ table: PriceTable; source: "db" | "defaults" }> {
  const client = db();
  if (!client) return { table: mergePriceRows([]), source: "defaults" };
  const { data, error } = await client.from("bespoke_pricing").select("key, amount_usd");
  if (error || !Array.isArray(data)) {
    console.warn("[create-bespoke-checkout] price table unavailable, using defaults:", error?.message);
    return { table: mergePriceRows([]), source: "defaults" };
  }
  return { table: mergePriceRows(data), source: "db" };
}

async function findCoupon(code: string): Promise<number | null> {
  if (!code) return null;
  const client = db();
  if (client) {
    const { data, error } = await client
      .from("bespoke_coupons")
      .select("percent_off, active")
      .eq("code", code)
      .maybeSingle();
    if (!error) {
      const pct = Number(data?.percent_off);
      return data?.active && Number.isFinite(pct) && pct > 0 && pct <= 100 ? pct : null;
    }
    console.warn("[create-bespoke-checkout] coupon table unavailable, using fallback:", error.message);
  }
  return FALLBACK_COUPONS[code] ?? null;
}

const DISCOVERY_SOURCES = new Set([
  "ChatGPT", "Other AI assistant (Perplexity, Gemini, Claude)", "Google", "Instagram",
  "TikTok", "Facebook", "Friend", "Other",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Body;
    const couponKey = (body?.couponCode ?? "").trim().toUpperCase().slice(0, 40);

    if (body?.action === "validate_coupon") {
      const percentOff = await findCoupon(couponKey);
      return new Response(JSON.stringify({ valid: percentOff !== null, percentOff: percentOff ?? 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sel = body?.selection;
    if (!sel || typeof sel !== "object") throw new Error("Missing selection");
    if (!(BESPOKE_FRAME_IDS as readonly string[]).includes(sel.frameId)) throw new Error("Invalid frame");
    if (!(BESPOKE_LENS_IDS as readonly string[]).includes(sel.lensTypeId)) throw new Error("Invalid lens option");
    if (!body?.productName || body.productName.length > 200) {
      throw new Error("Invalid productName");
    }
    if (!body?.returnUrl || !/^https?:\/\//.test(body.returnUrl)) {
      throw new Error("Invalid returnUrl");
    }
    if (body.environment !== "sandbox" && body.environment !== "live") {
      throw new Error("Invalid environment");
    }

    const stripe = createStripeClient(body.environment);

    const percentOff = couponKey ? await findCoupon(couponKey) : null;
    if (couponKey && percentOff === null) throw new Error("Invalid coupon code");

    // The charge is priced here, from the live table - never from the browser.
    const { table, source: priceSource } = await loadPrices();
    const quote = quoteBespoke(table, { frameId: sel.frameId, lensTypeId: sel.lensTypeId, engraving: Boolean(sel.engraving) });
    const grossCents = Math.round(quote.totalUsd * 100);
    const amountInCents = percentOff ? applyPercentOff(grossCents, percentOff) : grossCents;
    if (amountInCents < 100) throw new Error("Invalid amount");

    // Deposit plan: charge the deposit now, the balance after the buyer approves
    // the 3D model (bespoke-balance). `full` when the deposit row is 0 or absent.
    const split = splitDeposit(amountInCents, depositPrice(table, body.environment === "sandbox"));
    const chargeCents = split.dueNowCents;

    if (typeof body.amountUsd === "number" && Math.round(body.amountUsd * 100) !== grossCents) {
      console.warn(`[create-bespoke-checkout] browser showed $${body.amountUsd}, charging list $${quote.totalUsd}`);
    }

    const cleanMeta: Record<string, string> = { flow: "bespoke" };
    if (body.metadata) {
      for (const [k, v] of Object.entries(body.metadata)) {
        if (typeof v === "string" && v.length <= 500) cleanMeta[k] = v;
      }
    }
    if (cleanMeta.source && !DISCOVERY_SOURCES.has(cleanMeta.source)) {
      throw new Error("Invalid discovery source");
    }

    cleanMeta.payment_plan = split.plan;
    cleanMeta.order_total_usd = (split.totalCents / 100).toFixed(2);
    if (split.plan === "deposit") {
      cleanMeta.deposit_usd = (split.dueNowCents / 100).toFixed(2);
      cleanMeta.balance_usd = (split.balanceCents / 100).toFixed(2);
    }
    cleanMeta.list_price_usd = (grossCents / 100).toFixed(2);
    // Frame / lens / engraving split, e.g. "480+30+10". Stripe allows 50 keys, so one key.
    cleanMeta.price_breakdown_usd = `${quote.baseUsd}+${quote.lensUsd}+${quote.engravingUsd} (${priceSource})`;
    if (typeof body.amountUsd === "number" && Math.round(body.amountUsd * 100) !== grossCents) {
      cleanMeta.client_amount_usd = body.amountUsd.toFixed(2);
    }
    if (percentOff) {
      cleanMeta.coupon_code = couponKey;
      cleanMeta.coupon_percent_off = String(percentOff);
    }

    // Buyer IP capture (for Meta CAPI in payments-webhook).
    const xff = req.headers.get("x-forwarded-for");
    const buyerIp =
      xff?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip");
    if (buyerIp && !cleanMeta.meta_client_ip_address) {
      cleanMeta.meta_client_ip_address = buyerIp.slice(0, 64);
    }
    // OpenAI Conversions API inputs (oppref/obref/visitor id/consent come from the browser).
    if (buyerIp) cleanMeta.openai_client_ip = buyerIp.slice(0, 64);
    const buyerUa = req.headers.get("user-agent");
    if (buyerUa) cleanMeta.openai_client_ua = buyerUa.slice(0, 500);
    for (const k of ["openai_oppref", "openai_obref", "openai_consent", "openai_source_url", "wlt_visitor_id"]) {
      if (cleanMeta[k] !== undefined && !cleanMeta[k]) delete cleanMeta[k];
    }

    const baseName = percentOff ? `${body.productName} (${percentOff}% off · ${couponKey})` : body.productName;
    const usd = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
    const depositNote = `Non-refundable deposit for your fitting and 3D model. Balance ${usd(split.balanceCents)} is due only after you approve the 3D model. Order total ${usd(split.totalCents)}.`;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: split.plan === "deposit" ? `${baseName} - deposit` : baseName,
              ...(split.plan === "deposit"
                ? { description: depositNote }
                : body.description && { description: body.description.slice(0, 500) }),
            },
            unit_amount: chargeCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
      // 2 h instead of Stripe's 24 h default: payments-webhook follows up an
      // abandoned Bespoke checkout on checkout.session.expired, so the reminder
      // reaches the buyer the same day (06.11.2026).
      expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
      ...(body.customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail) && { customer_email: body.customerEmail.slice(0, 200) }),
      ...(split.plan === "deposit" && { custom_text: { submit: { message: depositNote } } }),
      payment_intent_data: {
        description: split.plan === "deposit" ? `${body.productName} - deposit` : body.productName,
        metadata: cleanMeta,
      },
      metadata: cleanMeta,
    });

    return new Response(JSON.stringify({
      clientSecret: session.client_secret,
      sessionId: session.id,
      // Charged now (the deposit on the deposit plan).
      amountCents: chargeCents,
      totalCents: split.totalCents,
      balanceCents: split.balanceCents,
      paymentPlan: split.plan,
      listPriceUsd: quote.totalUsd,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-bespoke-checkout]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
