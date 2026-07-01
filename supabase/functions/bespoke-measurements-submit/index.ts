import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type Body = {
  sid?: string;
  ai?: {
    face_width_mm?: number | null;
    temple_to_temple_mm?: number | null;
    bridge_width_mm?: number | null;
    pd_mm?: number | null;
    notes?: string | null;
  };
  manual?: {
    face_width_mm?: number | null;
    temple_to_temple_mm?: number | null;
    bridge_width_mm?: number | null;
    pd_mm?: number | null;
    temple_length_mm?: number | null;
    head_circumference_mm?: number | null;
    ear_to_ear_mm?: number | null;
    notes?: string | null;
  };
};

const clampNum = (v: unknown, min = 20, max = 400): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  if (!Number.isFinite(n)) return null;
  if (n < min || n > max) return null;
  return Math.round(n * 100) / 100;
};

const clampText = (v: unknown, max = 1000): string | null => {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
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
    const sid = body.sid;
    if (!sid || sid.length < 20 || sid.length > 200 || !/^[A-Za-z0-9_-]+$/.test(sid)) {
      return new Response(JSON.stringify({ error: "invalid_sid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = body.ai ?? {};
    const manual = body.manual ?? {};

    const patch: Record<string, unknown> = {
      ai_face_width_mm: clampNum(ai.face_width_mm),
      ai_temple_to_temple_mm: clampNum(ai.temple_to_temple_mm),
      ai_bridge_width_mm: clampNum(ai.bridge_width_mm, 5, 60),
      ai_pd_mm: clampNum(ai.pd_mm, 40, 90),
      ai_notes: clampText(ai.notes),
      manual_face_width_mm: clampNum(manual.face_width_mm),
      manual_temple_to_temple_mm: clampNum(manual.temple_to_temple_mm),
      manual_bridge_width_mm: clampNum(manual.bridge_width_mm, 5, 60),
      manual_pd_mm: clampNum(manual.pd_mm, 40, 90),
      manual_temple_length_mm: clampNum(manual.temple_length_mm, 80, 200),
      manual_head_circumference_mm: clampNum(manual.head_circumference_mm, 400, 700),
      manual_ear_to_ear_mm: clampNum(manual.ear_to_ear_mm, 100, 300),
      manual_notes: clampText(manual.notes),
      measurements_submitted_at: new Date().toISOString(),
    };

    const hasAny = Object.entries(patch).some(([k, v]) => k !== "measurements_submitted_at" && v !== null && v !== undefined);
    if (!hasAny) {
      return new Response(JSON.stringify({ error: "no_measurements" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("bespoke_orders")
      .update(patch)
      .eq("stripe_session_id", sid)
      .select("stripe_session_id, customer_email, frame_name, measurements_submitted_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify admin that measurements landed.
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "bespoke-purchase-admin",
          idempotencyKey: `bespoke-measurements-${sid}`,
          templateData: {
            customerEmail: (data as any).customer_email,
            frameName: (data as any).frame_name ?? "Woolet Bespoke",
            amountFormatted: "measurements received",
            orderRef: sid,
          },
        },
      });
    } catch (e) {
      console.error("[bespoke-measurements-submit] admin notify failed", e);
    }

    return new Response(JSON.stringify({ ok: true, submitted_at: (data as any).measurements_submitted_at }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[bespoke-measurements-submit]", err);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
