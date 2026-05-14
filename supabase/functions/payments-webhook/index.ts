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

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
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
