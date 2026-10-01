// Saves the post-payment "Where did you first hear about Woolet?" answer.
// Keyed by Stripe session id (reservation) or email (Bespoke onboarding).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const ALLOWED = new Set([
  "Instagram", "Facebook", "TikTok", "Google search", "ChatGPT or another AI assistant", "Kickstarter", "A friend",
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
    let emailIn = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const raw = typeof body.answer === "string" ? body.answer.trim() : "";
    let answer = "";
    if (ALLOWED.has(raw)) answer = raw;
    else if (raw.startsWith("Other")) {
      const free = raw.replace(/^Other:?\s*/, "").replace(/[\u0000-\u001f<>]/g, "").slice(0, 80).trim();
      answer = free ? `Other: ${free}` : "Other";
    }
    if (!answer) return json({ error: "Invalid answer" }, 400);
    if (sessionId && !/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) return json({ error: "Invalid session" }, 400);
    if (!sessionId && !EMAIL_RE.test(emailIn)) return json({ error: "session_id or email required" }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (sessionId) {
      // Row is created by payments-webhook; if the answer arrives first, create a stub.
      const { data: row } = await sb.from("reservation_attribution").select("email").eq("session_id", sessionId).maybeSingle();
      if (row) {
        await sb.from("reservation_attribution").update({ heard_from: answer }).eq("session_id", sessionId);
        emailIn = row.email ?? "";
      } else {
        await sb.from("reservation_attribution").insert({ session_id: sessionId, heard_from: answer });
      }
    }

    const apiKey = Deno.env.get("MAILERLITE_API_KEY");
    if (apiKey && emailIn) {
      await fetch("https://connect.mailerlite.com/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ name: "heard_from", type: "text" }),
      }).then((r) => r.text()).catch(() => "");
      // Update existing subscriber only — never subscribe someone new from here.
      const res = await fetch(`https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(emailIn)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ fields: { heard_from: answer } }),
      });
      if (!res.ok) console.error("[save-heard-from] mailerlite", res.status, await res.text());
      else await res.text();
    }
    return json({ ok: true });
  } catch (e) {
    console.error("[save-heard-from] error", e);
    return json({ error: "Failed" }, 500);
  }
});
