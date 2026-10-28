import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KICKSTARTER_LIVE_AT_MS = Date.UTC(2026, 9, 29, 14, 0, 0);
const DEPOSIT_PRICE_IDS = new Set(["founding_member_deposit_1usd"]);
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

    // $1 founder reservation closes at the public Kickstarter launch:
    // 29.10.2026 15:00 Warsaw = 14:00 UTC (keep in sync with src/config/kickstarter.ts).
    if (DEPOSIT_PRICE_IDS.has(body.priceId) && Date.now() >= KICKSTARTER_LIVE_AT_MS) {
      return new Response(JSON.stringify({ error: "reservation_closed", kickstarter_url: KICKSTARTER_URL }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(body.environment);

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

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: body.quantity || 1 }],
      mode: "payment",
      ui_mode: "embedded_page",
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
      ...(Object.keys(cleanMeta).length && {
        metadata: cleanMeta,
        payment_intent_data: { metadata: cleanMeta },
      }),
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
