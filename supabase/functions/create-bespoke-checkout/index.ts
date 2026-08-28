import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  amountUsd: number; // total price in dollars (e.g. 500)
  productName: string; // e.g. "Woolet Bespoke — Aviator"
  description?: string; // longer description for the buyer
  customerEmail?: string;
  returnUrl: string;
  environment: StripeEnv;
  metadata?: Record<string, string>;
  couponCode?: string;
}

// Server-side coupon table — never trust a client-supplied discount.
const COUPONS: Record<string, { percentOff: number }> = {
  KICKSTARTER2026: { percentOff: 50 },
};

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
    if (typeof body?.amountUsd !== "number" || body.amountUsd < 1 || body.amountUsd > 10000) {
      throw new Error("Invalid amountUsd");
    }
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

    const couponKey = (body.couponCode ?? "").trim().toUpperCase().slice(0, 40);
    const coupon = couponKey ? COUPONS[couponKey] : undefined;
    if (couponKey && !coupon) throw new Error("Invalid coupon code");

    const grossCents = Math.round(body.amountUsd * 100);
    const amountInCents = coupon
      ? Math.max(100, Math.round((grossCents * (100 - coupon.percentOff)) / 100))
      : grossCents;

    const cleanMeta: Record<string, string> = { flow: "bespoke" };
    if (body.metadata) {
      for (const [k, v] of Object.entries(body.metadata)) {
        if (typeof v === "string" && v.length <= 500) cleanMeta[k] = v;
      }
    }

    if (coupon) {
      cleanMeta.coupon_code = couponKey;
      cleanMeta.coupon_percent_off = String(coupon.percentOff);
      cleanMeta.list_price_usd = (grossCents / 100).toFixed(2);
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

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: coupon ? `${body.productName} (${coupon.percentOff}% off · ${couponKey})` : body.productName,
              ...(body.description && { description: body.description.slice(0, 500) }),
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
      ...(body.customerEmail && { customer_email: body.customerEmail }),
      payment_intent_data: {
        description: body.productName,
        metadata: cleanMeta,
      },
      metadata: cleanMeta,
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
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
