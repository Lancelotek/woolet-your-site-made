// Public proxy that lets the FitScan page send its own result email without
// exposing send-transactional-email to arbitrary anon callers. We whitelist
// every field that reaches the template so an attacker cannot use this to
// send arbitrary content from the woolet.co domain.

import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  faceWidthMm: z.number().finite().min(80).max(300),
  noseWidthMm: z.number().finite().min(10).max(60),
  // Optional extras handed over by the FitLens widget.
  pdMm: z.number().finite().min(40).max(90).optional(),
  templeToTempleMm: z.number().finite().min(100).max(200).optional(),
  templeLengthMm: z.number().finite().min(120).max(170).optional(),
  variant: z.enum(["007", "009"]).default("007"),
  lang: z.string().regex(/^[a-z]{2}$/).default("en"),
  scanNonce: z.string().max(64).optional(),
});

const LANGS = new Set(["en", "pl", "de", "fr", "es", "ja", "nl", "ar"]);

const RECOMMENDATIONS = {
  "007": {
    title: "Woolet 007 — Round",
    body: "Based on your face width and nose bridge, the round 007 (158 mm front) sits right in your range.",
    badgeLabel: "Best fit",
    modelName: "Woolet 007",
  },
  "009": {
    title: "Woolet 009 — Square",
    body: "Based on your face width and nose bridge, the square 009 (158 mm front) sits right in your range.",
    badgeLabel: "Best fit",
    modelName: "Woolet 009",
  },
} as const;

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
    return new Response(
      JSON.stringify({ error: "invalid_input", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { email, faceWidthMm, noseWidthMm, pdMm, templeToTempleMm, templeLengthMm, variant, scanNonce } =
    parsed.data;
  const lang = LANGS.has(parsed.data.lang) ? parsed.data.lang : "en";
  const rec = RECOMMENDATIONS[variant];
  const modelUrl = `https://woolet.co/${lang}/products/${variant}`;

  const nonce = scanNonce || crypto.randomUUID().slice(0, 8);
  try {
    await sendTemplateEmailAndLog("fit-scan-result", email, {
      idempotencyKey: `fit-scan-${email}-${Math.round(faceWidthMm)}-${Math.round(noseWidthMm)}-${nonce}`,
      templateData: {
        faceWidthMm: Math.round(faceWidthMm),
        noseWidthMm: Math.round(noseWidthMm),
        pdMm: pdMm != null ? Math.round(pdMm) : undefined,
        templeToTempleMm: templeToTempleMm != null ? Math.round(templeToTempleMm) : undefined,
        templeLengthMm: templeLengthMm != null ? Math.round(templeLengthMm) : undefined,
        recommendationTitle: rec.title,
        recommendationBody: rec.body,
        recommendedModel: rec.modelName,
        modelUrl,
        badgeLabel: rec.badgeLabel,
      },
    });
  } catch (error) {
    console.error("[fit-scan-email-notify] send failed", error);
    return new Response(JSON.stringify({ error: "send_failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
