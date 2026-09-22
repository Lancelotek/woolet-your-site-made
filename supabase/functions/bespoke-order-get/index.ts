import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { buildInterviewBookingUrl } from "../_shared/bespoke-case.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const sid = new URL(req.url).searchParams.get("sid");
    if (!sid || sid.length < 20 || sid.length > 200 || !/^[A-Za-z0-9_-]+$/.test(sid)) {
      return new Response(JSON.stringify({ error: "invalid_sid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data, error } = await supabase
      .from("bespoke_orders")
      .select(
        "id, case_no, case_seq, stage, session_ref, scan_id, ai_source, ai_overrides, stripe_session_id, customer_email, customer_name, source, frame_name, front_code, temple_code, finish_id, lens_type, reading_strength_mode, reading_strength, reading_strength_left, reading_strength_right, engraving_text, amount_cents, currency, ai_preview_url, ai_preview_path, measurements_submitted_at, ai_face_width_mm, ai_temple_to_temple_mm, ai_bridge_width_mm, ai_inner_canthal_mm, ai_pd_mm, ai_notes, manual_face_width_mm, manual_temple_to_temple_mm, manual_bridge_width_mm, manual_pd_mm, manual_temple_length_mm, manual_head_circumference_mm, manual_ear_to_ear_mm, manual_notes, shipping_name, shipping_phone, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, shipping_submitted_at, created_at",
      )
      .eq("stripe_session_id", sid)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // The scan reference belongs to the order, not to the browser: the same
    // customer may open the emailed link on a phone. Mint one on first read so
    // a scan started on any device ties back to this order. Pseudonymous —
    // never the email, the name or the Stripe session id.
    let sessionRef = (data as any).session_ref as string | null;
    if (!sessionRef) {
      sessionRef = crypto.randomUUID();
      const { error: refError } = await supabase
        .from("bespoke_orders")
        .update({ session_ref: sessionRef })
        .eq("id", (data as any).id);
      if (refError) console.error("[bespoke-order-get] session_ref mint failed", refError);
    }
    // Redact full email in response — return only the masked version so a
    // guessed session ID can't leak the buyer's address.
    const em = (data as any).customer_email as string;
    const masked = em ? em.replace(/^(.).*(@.*)$/, "$1***$2") : null;
    const { data: photoConsent, error: consentError } = await supabase
      .from("bespoke_order_photos")
      .select("consent_at, consent_withdrawn_at, consent_version, consent_locale, vto_path")
      .eq("order_id", data.id)
      .order("consent_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (consentError) throw consentError;
    // Signed, short-lived link to the approved on-face visualisation so the
    // workshop report can embed it. Never returned after consent withdrawal.
    let tryOnUrl: string | null = null;
    const vtoPath = (photoConsent as any)?.vto_path as string | null | undefined;
    if (vtoPath && !photoConsent?.consent_withdrawn_at) {
      const { data: signed } = await supabase.storage
        .from("bespoke-photos")
        .createSignedUrl(vtoPath, 60 * 15);
      tryOnUrl = signed?.signedUrl ?? null;
    }
    // The frame visualisation generated from the order's own specification.
    let previewUrl: string | null = (data as any).ai_preview_url ?? null;
    const previewPath = (data as any).ai_preview_path as string | null | undefined;
    if (previewPath) {
      const { data: signed } = await supabase.storage
        .from("bespoke-cad")
        .createSignedUrl(previewPath, 60 * 15);
      previewUrl = signed?.signedUrl ?? previewUrl;
    }
    // Scan result attached to this order, if FitLens has sent one. `source`
    // tells the page (and the customer) how much the numbers can be trusted.
    let scan: Record<string, unknown> | null = null;
    let scans: Record<string, unknown>[] = [];
    {
      const SCAN_COLUMNS =
        "measurement_ref, scan_id, source, status, semantics_version, confidence_tier, spread_mm, temple_to_temple_mm, face_width_mm, pd_mm, pd_left_mm, pd_right_mm, nose_bridge_width_mm, created_at";
      const scanId = (data as any).scan_id as string | null;
      // Every scan of this order, newest first — a second scan is a new row, so
      // the page can show both instead of pretending the first never happened.
      const orFilter = [
        `order_id.eq.${(data as any).id}`,
        sessionRef ? `session_ref.eq.${sessionRef}` : null,
      ]
        .filter(Boolean)
        .join(",");
      const { data: scanRows } = await supabase
        .from("bespoke_scan_profiles")
        .select(SCAN_COLUMNS)
        .or(orFilter)
        .order("created_at", { ascending: false })
        .limit(10);
      scans = (scanRows as Record<string, unknown>[]) ?? [];
      scan =
        (scanId ? scans.find((r) => r.scan_id === scanId) : undefined) ?? scans[0] ?? null;
      if (!scan && scanId) {
        const { data: byId } = await supabase
          .from("bespoke_scan_profiles")
          .select(SCAN_COLUMNS)
          .eq("scan_id", scanId)
          .maybeSingle();
        scan = (byId as Record<string, unknown>) ?? null;
        if (scan) scans = [scan];
      }
    }

    const { id: _id, ...safeOrder } = data;
    return new Response(
      JSON.stringify({
        ...safeOrder,
        // Public order reference (same format as the shipping export) — safe
        // to show the customer and to tag analytics with; not the raw uuid.
        order_ref: `WLT-${String(_id).slice(0, 8).toUpperCase()}`,
        // The case number follows the order to delivery. The booking link is
        // built server-side so the buyer's real email never leaves this
        // function unmasked while Calendly still gets it prefilled.
        booking_url: (data as any).case_no
          ? buildInterviewBookingUrl({
              caseNo: (data as any).case_no as string,
              name: (data as any).customer_name as string | null,
              email: em,
            })
          : null,
        session_ref: sessionRef,
        scan,
        scans,
        ai_preview_url: previewUrl,
        customer_email_masked: masked,
        customer_email: undefined,
        photo_consent: photoConsent
          ? {
              consent_at: photoConsent.consent_at,
              consent_withdrawn_at: photoConsent.consent_withdrawn_at,
              consent_version: photoConsent.consent_version,
              consent_locale: photoConsent.consent_locale,
            }
          : null,
        try_on_url: tryOnUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[bespoke-order-get]", err);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
