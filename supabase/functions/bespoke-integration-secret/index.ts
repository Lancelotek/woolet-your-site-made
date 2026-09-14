// Set, rotate and inspect the FitLens webhook signing secret from the Bespoke
// admin panel. The value is never sent back to the browser — only whether one
// is set and when it last changed.
//
// The environment variable FITLENS_WEBHOOK_SECRET remains the preferred home;
// this table is the fallback for plans where secrets cannot be added.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ALLOWED = new Set(["fitlens_webhook_secret"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Either admin password opens this panel: the Bespoke console and the CRM
  // are the same operator, and they are not always the same string.
  const accepted = [Deno.env.get("ADMIN_CRM_PASSWORD"), Deno.env.get("BESPOKE_ADMIN_PASSWORD")].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  const supplied =
    (typeof body.password === "string" ? body.password : "") ||
    (req.headers.get("x-admin-password") ?? "");
  if (accepted.length === 0 || !accepted.includes(supplied)) return json({ error: "unauthorized" }, 401);

  const name = typeof body.name === "string" ? body.name : "fitlens_webhook_secret";
  if (!ALLOWED.has(name)) return json({ error: "unknown_secret" }, 400);

  const action = body.action === "save" ? "save" : "status";

  if (action === "save") {
    const value = typeof body.value === "string" ? body.value.trim() : "";
    if (value.length < 16 || value.length > 512) return json({ error: "invalid_value" }, 400);
    const { error } = await admin
      .from("integration_secrets")
      .upsert({ name, value, updated_at: new Date().toISOString() }, { onConflict: "name" });
    if (error) {
      console.error("[bespoke-integration-secret] save failed", error);
      return json({ error: "save_failed" }, 500);
    }
  }

  const { data } = await admin
    .from("integration_secrets")
    .select("updated_at")
    .eq("name", name)
    .maybeSingle();

  return json({
    ok: true,
    name,
    // Never the value itself.
    is_set: Boolean(data) || Boolean(Deno.env.get("FITLENS_WEBHOOK_SECRET")),
    source: Deno.env.get("FITLENS_WEBHOOK_SECRET") ? "environment" : data ? "database" : "none",
    updated_at: data?.updated_at ?? null,
  });
});
