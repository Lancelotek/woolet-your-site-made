import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { RESERVATION_ITEM_ID, stampCheckoutMetadata } from "../_shared/checkout-metadata.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// $1 reservation reopened 05.11.2026, open until the campaign deadline (Fri 04.12.2026).
const RESERVATION_CLOSE_AT_MS = Date.UTC(2026, 11, 4, 14, 0, 0);
const DEPOSIT_PRICE_IDS = new Set(["founding_member_deposit_1usd"]);

// Founder Edition pre-order on woolet.co (11.11.2026): same offer as the secret
// Kickstarter reward, for people who won't log in to Kickstarter. Price is fixed
// here (inline price_data), never taken from the client. Stock is shared with
// the KS reward: lower the KS reward limit by every frame sold here.
const FOUNDER_PRICE_ID = "founder_edition_009_114";
const FOUNDER_AMOUNT_CENTS = 11400;
const FOUNDER_SITE_CAP = 10;
const FOUNDER_COUNTRIES = [
  "US", "CA", "GB", "IE", "DE", "AT", "CH", "FR", "BE", "NL", "LU", "IT", "ES", "PT", "PL", "CZ",
  "SK", "HU", "DK", "SE", "NO", "FI", "IS", "EE", "LV", "LT", "SI", "HR", "GR", "RO", "BG", "CY",
  "MT", "AU", "NZ", "JP", "KR", "SG", "HK", "TW", "IL", "AE", "SA", "MX", "BR", "VN",
] as const;
const KICKSTARTER_URL =
  "https://www.kickstarter.com/projects/wooletco/woolet-finally-glasses-that-actually-fit-wider-faces?ref=site_lp";

interface Body {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  returnUrl: string;
  environment: StripeEnv;
  metadata?: Record<string, string>;
}

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function createFounderSession(stripe: any, body: Body, req: Request): Promise<Response> {
  if (Date.now() >= RESERVATION_CLOSE_AT_MS) return json(410, { error: "closed" });

  // Paid site orders so far (Stripe search index lags ~1 min; fine at this volume).
  const sold = await stripe.paymentIntents.search({
    query: "metadata['flow']:'founder_edition' AND status:'succeeded'",
    limit: 100,
  });
  if (sold.data.length >= FOUNDER_SITE_CAP) return json(410, { error: "sold_out" });

  const meta: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.metadata ?? {})) {
    if (typeof v === "string" && v.length <= 500) meta[k] = v;
  }
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
  if (ip && !meta.meta_client_ip_address) meta.meta_client_ip_address = ip.slice(0, 64);
  if (ip) meta.openai_client_ip = ip.slice(0, 64);
  const ua = req.headers.get("user-agent");
  if (ua) meta.openai_client_ua = ua.slice(0, 500);
  const stamped = stampCheckoutMetadata(meta, {
    line: "founder_edition",
    sku: "founder_009_black_24",
    flow: "founder_edition",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded_page",
    customer_creation: "always",
    return_url: body.returnUrl,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: FOUNDER_AMOUNT_CENTS,
        product_data: {
          name: "Woolet Founder Edition - 009 Black",
          description: "Black only. 158 mm front, 24 mm bridge, Mazzucchelli acetate. Founder Box included (magnetic box, special case, Clip-On Cloth). Ships from the EU right after your order.",
          images: ["https://woolet.co/founders/woolet-founder-edition-009-black-box.jpg"],
        },
      },
    }],
    shipping_address_collection: { allowed_countries: [...FOUNDER_COUNTRIES] },
    phone_number_collection: { enabled: true },
    custom_text: {
      shipping_address: {
        message: "Enter the full address with apartment number - the courier needs it. Shipping from the EU is free; customs duties or import fees may apply depending on your country.",
      },
    },
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    ...(body.customerEmail && { customer_email: body.customerEmail }),
    metadata: stamped,
    payment_intent_data: {
      metadata: stamped,
      description: "Woolet Founder Edition 009 Black, 24 mm bridge (woolet.co)",
    },
  });
  return json(200, { clientSecret: session.client_secret });
}

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
    if (!body?.priceId || !/^[a-zA-Z0-9_-]+$/.test(body.priceId)) {
      throw new Error("Invalid priceId");
    }
    if (!body?.returnUrl || !/^https?:\/\//.test(body.returnUrl)) {
      throw new Error("Invalid returnUrl");
    }
    if (body.environment !== "sandbox" && body.environment !== "live") {
      throw new Error("Invalid environment");
    }

    // $1 founder reservation closes at the Kickstarter deadline
    // (keep in sync with RESERVATION_CLOSE_AT_MS in src/config/kickstarter.ts).
    if (DEPOSIT_PRICE_IDS.has(body.priceId) && Date.now() >= RESERVATION_CLOSE_AT_MS) {
      return new Response(JSON.stringify({ error: "reservation_closed", kickstarter_url: KICKSTARTER_URL }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(body.environment);

    if (body.priceId === FOUNDER_PRICE_ID) {
      return await createFounderSession(stripe, body, req);
    }

    const prices = await stripe.prices.list({ lookup_keys: [body.priceId] });
    if (!prices.data.length) throw new Error("Price not found");
    const stripePrice = prices.data[0];

    const cleanMeta: Record<string, string> = {};
    if (body.metadata) {
      for (const [k, v] of Object.entries(body.metadata)) {
        if (typeof v === "string" && v.length <= 500) cleanMeta[k] = v;
      }
    }

    // Capture the buyer's real IP at checkout creation time so the
    // payments-webhook can attach it to the Meta CAPI Purchase event.
    // (At webhook time, the request originates from Stripe — the buyer IP is
    // long gone.) Stripe metadata values are capped at 500 chars.
    const xff = req.headers.get("x-forwarded-for");
    const buyerIp =
      (xff?.split(",")[0]?.trim()) ||
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

    const line = DEPOSIT_PRICE_IDS.has(body.priceId)
      ? "reservation_1usd"
      : body.priceId === "007" || body.priceId.endsWith("_007")
        ? "007"
        : body.priceId === "009" || body.priceId.endsWith("_009")
          ? "009"
          : "reservation_1usd";
    const sku = line === "reservation_1usd" ? RESERVATION_ITEM_ID : line;
    const stamped = stampCheckoutMetadata(cleanMeta, {
      line,
      sku,
      flow: line === "reservation_1usd" ? "reservation" : line,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: body.quantity || 1 }],
      mode: "payment",
      ui_mode: "embedded_page",
      customer_creation: "always",
      return_url: body.returnUrl,
      // 1 hour, not the 24h default: the recovery URL only exists once the
      // session has expired, and the recovery email sequence starts at T+1h.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      after_expiration: {
        recovery: {
          enabled: true,
          allow_promotion_codes: false,
        },
      },
      ...(body.customerEmail && { customer_email: body.customerEmail }),
      metadata: stamped,
      payment_intent_data: { metadata: stamped },
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-checkout]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
