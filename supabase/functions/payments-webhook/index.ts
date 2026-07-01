import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

const MAILERLITE_GROUP_FOUNDING_MEMBER = "165640938657777595";
const META_GRAPH_VERSION = "v21.0";

const sha256Hex = async (input: string): Promise<string> => {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Fire a server-side Purchase event to Meta Conversions API using attribution
 * baked into Stripe session metadata at checkout creation time
 * (fbp, fbc, IP, UA, event_id). Browser-side InitiateCheckout fired with the
 * same event_id so Meta deduplicates against this Purchase too if the buyer
 * lingered on the success page long enough for a browser Purchase to fire.
 */
async function fireMetaPurchase(session: any) {
  const pixelId = Deno.env.get("META_PIXEL_ID");
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!pixelId || !accessToken) {
    console.warn("[payments-webhook] Meta CAPI not configured, skipping Purchase");
    return;
  }

  const meta = (session?.metadata ?? {}) as Record<string, string>;
  const email: string | undefined =
    session?.customer_details?.email || session?.customer_email || meta.email;
  const phone: string | undefined = session?.customer_details?.phone;
  const country: string | undefined = session?.customer_details?.address?.country;

  // Fallback attribution from waitlist signup — keyed by email — so a Purchase
  // can still be matched to fbp/fbc/IP/UA even when the buyer paid from a
  // different device or after cookies expired.
  let waitlist: Record<string, string | null> | null = null;
  if (email) {
    const { data } = await getSupabase()
      .from("waitlist_attribution")
      .select("fbp,fbc,ip_address,user_agent,event_source_url,meta_event_id,ttclid,rdt_uuid")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    waitlist = (data as Record<string, string | null> | null) ?? null;
  }

  const pick = (a?: string | null, b?: string | null) => a || b || undefined;

  const userData: Record<string, unknown> = {};
  if (email) userData.em = [await sha256Hex(email.trim().toLowerCase())];
  if (phone) userData.ph = [await sha256Hex(phone.replace(/[^\d]/g, ""))];
  if (country) userData.country = [await sha256Hex(country.trim().toLowerCase().slice(0, 2))];
  const fbp = pick(meta.meta_fbp, waitlist?.fbp);
  const fbc = pick(meta.meta_fbc, waitlist?.fbc);
  const ip = pick(meta.meta_client_ip_address, waitlist?.ip_address);
  const ua = pick(meta.meta_client_user_agent, waitlist?.user_agent);
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;

  const value = session?.amount_total ? session.amount_total / 100 : 0;
  const currency = (session?.currency ?? "usd").toLowerCase();

  const event = {
    event_name: "Purchase",
    event_id: meta.meta_event_id || session.id, // dedupes with browser pixel
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: meta.meta_event_source_url || waitlist?.event_source_url || undefined,
    user_data: userData,
    custom_data: {
      value,
      currency,
      order_id: session.id,
      content_ids: meta.recommended_sku ? [meta.recommended_sku] : undefined,
      content_type: "product",
      num_items: 1,
    },
  };

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
  let metaStatus: "sent" | "error" = "sent";
  let metaDetail: unknown = null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    const text = await res.text();
    metaDetail = { http: res.status, body: text.slice(0, 500) };
    if (!res.ok) {
      metaStatus = "error";
      console.error("[meta-capi:purchase] graph error", res.status, text);
    } else {
      console.log("[meta-capi:purchase] sent", session.id, text.slice(0, 200));
    }
  } catch (err) {
    metaStatus = "error";
    metaDetail = String(err);
    console.error("[meta-capi:purchase] fetch failed", err);
  }

  try {
    await getSupabase().from("server_event_log").insert({
      source: "payments-webhook",
      event_name: "Purchase",
      event_id: event.event_id,
      email_hash: email ? await sha256Hex(email.trim().toLowerCase()) : null,
      phone_hash: phone ? await sha256Hex(phone.replace(/[^\d]/g, "")) : null,
      event_source_url: event.event_source_url ?? null,
      client_ip: ip ?? null,
      user_agent: ua ?? null,
      fbp: fbp ?? null,
      fbc: fbc ?? null,
      custom_data: event.custom_data,
      user_data_hashed: {
        em: userData.em ?? null,
        ph: userData.ph ?? null,
        country: userData.country ?? null,
      },
      destinations: { meta: { status: metaStatus, detail: metaDetail } },
      request_summary: {
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent ?? null,
        amount_total: session.amount_total ?? null,
        currency: session.currency ?? null,
      },
      status: metaStatus,
    });
  } catch (logErr) {
    console.error("[server_event_log] insert failed", logErr);
  }
}

async function tagMailerLiteFoundingMember(email: string, recommendedSku?: string) {
  const apiKey = Deno.env.get("MAILERLITE_API_KEY");
  if (!apiKey) return;
  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        groups: [MAILERLITE_GROUP_FOUNDING_MEMBER],
        fields: recommendedSku ? { recommended_sku: recommendedSku } : undefined,
        status: "active",
      }),
    });
    if (!res.ok) {
      console.error("[mailerlite] non-ok", res.status, await res.text());
    }
  } catch (e) {
    console.error("[mailerlite] error", e);
  }
}

const SITE_ORIGIN = "https://woolet.co";

function formatAmount(cents: number | null | undefined, currency: string | null | undefined): string {
  const c = cents ?? 0;
  const cur = (currency ?? "usd").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);
  } catch {
    return `${(c / 100).toFixed(2)} ${cur}`;
  }
}

async function handleBespokeCheckoutCompleted(session: any, env: StripeEnv) {
  const email: string | undefined =
    session?.customer_details?.email ||
    session?.customer_email ||
    session?.metadata?.email;
  if (!email) {
    console.error("[payments-webhook:bespoke] session without email", session?.id);
    return;
  }

  const meta = (session?.metadata ?? {}) as Record<string, string>;
  const customerName: string | undefined = session?.customer_details?.name;
  const amountCents = session.amount_total ?? null;
  const currency = (session.currency ?? "usd").toLowerCase();
  const amountFormatted = formatAmount(amountCents, currency);
  const measurementsUrl = `${SITE_ORIGIN}/en/bespoke/measurements?sid=${encodeURIComponent(session.id)}`;

  const { error: upsertErr } = await getSupabase()
    .from("bespoke_orders")
    .upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent ?? null,
        customer_email: email,
        customer_name: customerName ?? null,
        environment: env,
        amount_cents: amountCents,
        currency,
        frame_id: meta.frame ?? null,
        frame_name: meta.frame_name ?? (meta.frame ? `Woolet Bespoke — ${meta.frame}` : "Woolet Bespoke"),
        front_code: meta.front ?? null,
        temple_code: meta.temple ?? null,
        finish_id: meta.finish ?? null,
        lens_type: meta.lens_type ?? null,
        engraving_text: meta.engraving || null,
        ai_preview_url: meta.ai_preview_url ?? null,
        metadata: session.metadata ?? null,
      },
      { onConflict: "stripe_session_id" },
    );
  if (upsertErr) {
    console.error("[payments-webhook:bespoke] upsert failed", upsertErr);
  }

  const templateData = {
    customerName: customerName ?? "",
    customerEmail: email,
    frameName: meta.frame_name ?? (meta.frame ? `Woolet Bespoke — ${meta.frame}` : "Woolet Bespoke"),
    frontCode: meta.front ?? "",
    templeCode: meta.temple ?? "",
    finishName: meta.finish ?? "",
    lensName: meta.lens_type ?? "",
    engravingText: meta.engraving || "",
    amountFormatted,
    orderRef: session.id,
    paymentIntentId: session.payment_intent ?? "",
    environment: env,
    measurementsUrl,
    adminOrderUrl: session.payment_intent
      ? `https://dashboard.stripe.com/${env === "sandbox" ? "test/" : ""}payments/${session.payment_intent}`
      : "",
  };

  const invoke = async (templateName: string, recipient?: string) => {
    try {
      const { error } = await getSupabase().functions.invoke("send-transactional-email", {
        body: {
          templateName,
          recipientEmail: recipient,
          idempotencyKey: `${templateName}-${session.id}`,
          templateData,
        },
      });
      if (error) console.error(`[payments-webhook:bespoke] send ${templateName} error`, error);
    } catch (e) {
      console.error(`[payments-webhook:bespoke] send ${templateName} failed`, e);
    }
  };

  await Promise.all([
    invoke("bespoke-purchase-customer", email),
    invoke("bespoke-purchase-admin"),
  ]);
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const flow = session?.metadata?.flow;
  if (flow === "bespoke") {
    await handleBespokeCheckoutCompleted(session, env);
    await fireMetaPurchase(session);
    return;
  }

  const email: string | undefined =
    session?.customer_details?.email ||
    session?.customer_email ||
    session?.metadata?.email;
  const recommendedSku = session?.metadata?.recommended_sku || null;

  if (!email) {
    console.error("[payments-webhook] checkout.session.completed without email", session?.id);
    return;
  }

  const { error } = await getSupabase()
    .from("founding_members")
    .upsert(
      {
        email,
        recommended_sku: recommendedSku,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent ?? null,
        amount_cents: session.amount_total ?? 100,
        currency: (session.currency ?? "usd").toLowerCase(),
        environment: env,
        metadata: session.metadata ?? null,
      },
      { onConflict: "stripe_session_id" },
    );

  if (error) {
    console.error("[payments-webhook] insert failed", error);
    throw error;
  }

  const { error: updateError } = await getSupabase()
    .from("inventory")
    .update({ spots_remaining: getSupabase().rpc('decrement_spots', { amount: 1 }) })
    .eq('sku', recommendedSku);

  if (updateError) {
    console.error("[payments-webhook] inventory decrement failed", updateError);
  }

  await tagMailerLiteFoundingMember(email, recommendedSku ?? undefined);
  await fireMetaPurchase(session);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("[payments-webhook] invalid env query param:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      default:
        console.log("[payments-webhook] unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[payments-webhook] error", e);
    return new Response("Webhook error", { status: 400 });
  }
});
