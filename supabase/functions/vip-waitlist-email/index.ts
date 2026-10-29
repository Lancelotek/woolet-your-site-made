// Public trigger for the Kickstarter VIP early-access confirmation email.
// Fixed template, fixed content — the browser can only supply the recipient
// address, never a template name or arbitrary copy.

import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

const RESERVE_URL = "https://woolet.co/en/lp/kickstarter#vip-form";

// Keep in sync with src/config/kickstarter.ts (KICKSTARTER_LIVE_AT_MS / KICKSTARTER_SITE_REF).
const KICKSTARTER_LIVE_AT_MS = Date.UTC(2026, 9, 29, 14, 0, 0);
const CAMPAIGN_URL =
  "https://www.kickstarter.com/projects/wooletco/woolet-finally-glasses-that-actually-fit-wider-faces" +
  "?ref=4rxoly&utm_source=woolet_site&utm_medium=email&utm_campaign=ks_live&utm_term=site_lp&utm_content=vip_confirmation";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { email } = parsed.data;

  try {
    const result = await sendTemplateEmailAndLog("vip-waitlist-confirmation", email, {
      idempotencyKey: `vip-waitlist-confirmation-${email}`,
      templateData: {
        reserveUrl: RESERVE_URL,
        live: Date.now() >= KICKSTARTER_LIVE_AT_MS,
        campaignUrl: CAMPAIGN_URL,
      },
    });
    return new Response(JSON.stringify({ ok: true, sent: result.sent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[vip-waitlist-email] send failed", e);
    return new Response(JSON.stringify({ ok: false, error: "send_failed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
