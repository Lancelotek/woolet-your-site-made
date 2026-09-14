import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";
import {
  BRIDGE_MAX_MM,
  BRIDGE_MIN_MM,
  bespokeOrderGaps,
  bridgeOutOfRange,
  measurementDisagreements,
} from "../_shared/bespoke-gaps.ts";

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
    /** Face measurement (eye corner to eye corner) — never a frame bridge. */
    inner_canthal_mm?: number | null;
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
  shipping?: {
    name?: string | null;
    phone?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  };
  scan?: {
    source?: string | null;
    payload?: Record<string, unknown> | null;
    /** fitlens_webhook | fitlens_signed | fitlens_client — how far it was verified. */
    verification?: string | null;
    /** "scan" when the shown numbers were accepted as measured, "manual" when corrected. */
    ai_source?: string | null;
    /** The scan's own numbers, kept when the customer corrected them by hand. */
    overrides?: Record<string, unknown> | null;
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
      // Face measurement, kept apart from the frame bridge on purpose.
      ai_inner_canthal_mm: clampNum(ai.inner_canthal_mm, 25, 45),

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

    // Where the numbers came from. `scan_payload` holds the normalised
    // measurement object only — numbers, never an image or a face landmark.
    const scanSource = body.scan?.source === "fitlens" ? "fitlens" : "manual";
    const scanPayload =
      scanSource === "fitlens" && body.scan?.payload && typeof body.scan.payload === "object"
        ? Object.fromEntries(
            Object.entries(body.scan.payload)
              .filter(([, v]) => typeof v === "number" && Number.isFinite(v))
              .slice(0, 20),
          )
        : null;

    const hasAny = Object.entries(patch).some(([k, v]) => k !== "measurements_submitted_at" && v !== null && v !== undefined);
    if (!hasAny) {
      return new Response(JSON.stringify({ error: "no_measurements" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ship = body.shipping;
    if (ship) {
      const name = clampText(ship.name, 120);
      const phone = clampText(ship.phone, 40);
      const line1 = clampText(ship.line1, 200);
      const city = clampText(ship.city, 120);
      const postal = clampText(ship.postal_code, 30);
      const country = (clampText(ship.country, 2) ?? "").toUpperCase();
      if (!name || !phone || !line1 || !city || !postal || !/^[A-Z]{2}$/.test(country)) {
        return new Response(JSON.stringify({ error: "incomplete_shipping" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      patch.shipping_name = name;
      patch.shipping_phone = phone;
      patch.shipping_line1 = line1;
      patch.shipping_line2 = clampText(ship.line2, 200);
      patch.shipping_city = city;
      patch.shipping_state = clampText(ship.state, 120);
      patch.shipping_postal_code = postal;
      patch.shipping_country = country;
      patch.shipping_submitted_at = new Date().toISOString();
    }


    patch.scan_source = scanSource;
    patch.scan_payload = scanPayload;
    if (scanSource === "fitlens") patch.scan_received_at = new Date().toISOString();

    // Verified server-side, or merely reported by the browser widget? The
    // workshop must be able to tell the two apart at a glance.
    const VERIFICATION = ["fitlens_webhook", "fitlens_signed", "fitlens_client"];
    const verification =
      typeof body.scan?.verification === "string" && VERIFICATION.includes(body.scan.verification)
        ? body.scan.verification
        : null;
    patch.ai_source = body.scan?.ai_source === "manual" ? "manual" : scanSource === "fitlens" ? "scan" : "manual";
    if (body.scan?.overrides && typeof body.scan.overrides === "object") {
      patch.ai_overrides = body.scan.overrides;
    }

    const { data, error } = await supabase
      .from("bespoke_orders")
      .update(patch)
      .eq("stripe_session_id", sid)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify the workshop with the numbers themselves, not just "they arrived".
    try {
      const order = data as Record<string, any>;
      const mm = (v: unknown) => (v === null || v === undefined ? "" : `${v} mm`);
      const measurements = [
        { label: "Scan · Face width", value: mm(order.ai_face_width_mm) },
        { label: "Scan · Temple-to-temple", value: mm(order.ai_temple_to_temple_mm) },
        { label: "Scan · Frame bridge", value: mm(order.ai_bridge_width_mm) },
        { label: "Inner-canthal distance (face)", value: mm(order.ai_inner_canthal_mm) },

        { label: "Scan · Pupillary distance", value: mm(order.ai_pd_mm) },
        { label: "Scan notes", value: order.ai_notes ?? "" },
        { label: "Manual · Face width", value: mm(order.manual_face_width_mm) },
        { label: "Manual · Temple-to-temple", value: mm(order.manual_temple_to_temple_mm) },
        { label: "Manual · Bridge width", value: mm(order.manual_bridge_width_mm) },
        { label: "Manual · Pupillary distance", value: mm(order.manual_pd_mm) },
        { label: "Manual · Temple length", value: mm(order.manual_temple_length_mm) },
        { label: "Manual · Head circumference", value: mm(order.manual_head_circumference_mm) },
        { label: "Manual · Ear-to-ear over crown", value: mm(order.manual_ear_to_ear_mm) },
        { label: "Workshop notes", value: order.manual_notes ?? "" },
      ].filter((row) => row.value);

      const email = (order.customer_email as string) ?? "";
      const shippingLine = [
        order.shipping_name,
        [order.shipping_line1, order.shipping_line2].filter(Boolean).join(" "),
        order.shipping_city,
        order.shipping_postal_code,
        order.shipping_country,
      ]
        .filter(Boolean)
        .join(", ");

      await sendTemplateEmailAndLog("bespoke-measurements-admin", undefined, {
        idempotencyKey: `bespoke-measurements-${sid}-${order.measurements_submitted_at}`,
        templateData: {
          orderRef: `WLT-${String(order.id).slice(0, 8).toUpperCase()}`,
          customerEmailMasked: email ? email.replace(/^(.).*(@.*)$/, "$1***$2") : "",
          source: scanSource,
          verificationLabel:
            verification === "fitlens_webhook"
              ? "Verified scan (server-to-server)"
              : verification === "fitlens_signed"
                ? "Signed scan (token verified)"
                : verification === "fitlens_client"
                  ? "Reported by the scan widget - unverified"
                  : "",
          frameName: order.frame_name ?? "Woolet Bespoke",
          measurements,
          bridgeAlerts: bridgeOutOfRange(order),
          bridgeMin: BRIDGE_MIN_MM,
          bridgeMax: BRIDGE_MAX_MM,
          disagreements: measurementDisagreements(order),
          gaps: bespokeOrderGaps(order),
          shippingStatus: order.shipping_submitted_at
            ? "Address confirmed by the customer"
            : "Address not confirmed yet",
          shippingAddress: shippingLine,
          adminUrl: "https://woolet.co/en/admin/bespoke",
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
