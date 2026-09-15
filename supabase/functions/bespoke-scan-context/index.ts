// Validates the (case number, scan token) pair carried by the scan link we
// email after a booking. The token is the proof — a case number alone never
// reveals a name or a stage.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const CASE_RE = /^WLT-BSP-\d{4}-\d{4}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  let caseNo = (url.searchParams.get("bsp") ?? "").trim().toUpperCase();
  let token = (url.searchParams.get("t") ?? "").trim();
  if (req.method === "POST") {
    try {
      const body = await req.json();
      caseNo = String(body?.caseNo ?? caseNo).trim().toUpperCase();
      token = String(body?.token ?? token).trim();
    } catch {
      // query params stay
    }
  }

  if (!CASE_RE.test(caseNo) || !UUID_RE.test(token)) {
    return json({ status: "unavailable" }, 200);
  }

  const { data } = await supabase
    .from("bespoke_orders")
    .select("id, case_no, stage, customer_name")
    .eq("case_no", caseNo)
    .eq("scan_token", token)
    .maybeSingle();

  if (!data) return json({ status: "unavailable" }, 200);

  const firstName = (data.customer_name ?? "").trim().split(/\s+/)[0] || null;

  // Remember which case this browser is scanning for, so a result whose
  // sessionId the widget rewrote can still be traced back to the order.
  await supabase.from("bespoke_scan_contexts").insert({
    order_id: data.id,
    case_no: data.case_no,
    session_ref: data.case_no,
  });

  return json({ status: "ready", caseNo: data.case_no, firstName, stage: data.stage });
});
