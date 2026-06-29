import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: body.quantity || 1 }],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
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
