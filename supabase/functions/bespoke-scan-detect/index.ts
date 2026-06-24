// Bespoke multi-pose face detection.
//
// Accepts a captured frame (data URL or base64 JPEG), the native pixel
// dimensions, and a `pose` discriminator: "front" | "left" | "right".
//
// FRONT pose: requires a credit/ID card flat against the forehead. Returns
// the card edge endpoints + temple-to-temple face endpoints (same shape as
// fit-scan-detect — reused for bespoke face-width + nose-bridge calibration).
//
// LEFT / RIGHT (¾ profile): no card. Returns anatomical landmarks needed for
// bespoke geometry — outer eye corner, tragus (ear notch), nose bridge top &
// bottom, eyebrow line.
//
// All coordinates are returned in NATIVE FRAME PIXELS. Gemini returns
// normalized [0,1000] coords which we rescale here.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface NormPoint { x: number; y: number } // 0..1000

interface FrontResponse {
  pose: "front";
  card: { left: NormPoint; right: NormPoint };
  face: { left: NormPoint; right: NormPoint };
  noseBridge: { left: NormPoint; right: NormPoint };
  confidence: number;
  glassesDetected?: boolean;
}

interface ProfileResponse {
  pose: "left" | "right";
  card: { left: NormPoint; right: NormPoint };
  outerEyeCorner: NormPoint;
  tragus: NormPoint;
  noseBridgeTop: NormPoint;
  noseBridgeBottom: NormPoint;
  browLine: { inner: NormPoint; outer: NormPoint };
  confidence: number;
  glassesDetected?: boolean;
}

const FRONT_SYSTEM = `You are a precise computer-vision annotator for an EYEWEAR custom-fit measurement tool.

The user shows their face frontally with a credit/ID card held FLAT against the forehead, long edge HORIZONTAL.

Return pixel coordinates (normalized integers 0..1000) for:
1. card.left / card.right — endpoints of the card's long horizontal edge (same y ±5).
2. face.left / face.right — outermost LEFT/RIGHT edge of the head silhouette at temple height (where eyewear arms would rest). Include hair. NOT the cheekbone.
3. noseBridge.left / noseBridge.right — narrowest point of the nose bridge between the eyes (where a nose pad would sit), same y ±3.

Set glassesDetected=true if eyewear is visible. Never refuse. JSON only.`;

const PROFILE_SYSTEM = `You are a precise computer-vision annotator for an EYEWEAR custom-fit measurement tool.

The user is showing a STRICT 90° SIDE PROFILE with a credit/ID card held FLAT against the visible cheek, long edge HORIZONTAL. Both the ear and the nose bridge must be clearly visible.

Return pixel coordinates (normalized integers 0..1000) for these landmarks on the visible side of the face:

1. card.left / card.right — endpoints of the card's long horizontal edge against the cheek (same y ±5). This is the SCALE reference for this frame (85.6 mm).
2. outerEyeCorner — outer corner of the eye (lateral canthus).
3. tragus — the small cartilage notch at the FRONT of the ear opening. This is where the tip of an eyewear temple touches the ear. CRITICAL: pick the front of the ear canal, not the earlobe.
4. noseBridgeTop — highest point of the nose bridge between the eyebrows (sellion).
5. noseBridgeBottom — lowest point of the nose bridge where it meets the nose body (just above the cartilage).
6. browLine.inner / browLine.outer — inner and outer ends of the eyebrow on the same visible side. Used to compute pantoscopic angle reference.

Set glassesDetected=true if eyewear is visible (the user must remove them — measurement is invalid otherwise). Never refuse. JSON only.`;

const FRONT_SCHEMA = {
  type: "object",
  properties: {
    pose: { type: "string", enum: ["front"] },
    card: {
      type: "object",
      properties: {
        left: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
        right: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
      },
      required: ["left", "right"],
    },
    face: {
      type: "object",
      properties: {
        left: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
        right: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
      },
      required: ["left", "right"],
    },
    noseBridge: {
      type: "object",
      properties: {
        left: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
        right: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
      },
      required: ["left", "right"],
    },
    confidence: { type: "number" },
    glassesDetected: { type: "boolean" },
  },
  required: ["pose", "card", "face", "noseBridge", "confidence"],
} as const;

const PROFILE_SCHEMA = {
  type: "object",
  properties: {
    pose: { type: "string", enum: ["left", "right"] },
    outerEyeCorner: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
    tragus: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
    noseBridgeTop: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
    noseBridgeBottom: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
    browLine: {
      type: "object",
      properties: {
        inner: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
        outer: { type: "object", properties: { x: { type: "integer" }, y: { type: "integer" } }, required: ["x", "y"] },
      },
      required: ["inner", "outer"],
    },
    confidence: { type: "number" },
    glassesDetected: { type: "boolean" },
  },
  required: ["pose", "outerEyeCorner", "tragus", "noseBridgeTop", "noseBridgeBottom", "browLine", "confidence"],
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "missing_api_key" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { image?: string; width?: number; height?: number; pose?: "front" | "left" | "right" };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { image, width, height, pose } = body;
  if (
    !image || typeof image !== "string" ||
    !Number.isFinite(width) || !Number.isFinite(height) ||
    !pose || !["front", "left", "right"].includes(pose)
  ) {
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const imageUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
  const system = pose === "front" ? FRONT_SYSTEM : PROFILE_SYSTEM;
  const schema = pose === "front" ? FRONT_SCHEMA : PROFILE_SCHEMA;

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: `Annotate this ${pose} image. Return JSON only.` },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: `bespoke_scan_${pose}`, strict: true, schema },
      },
    }),
  });

  if (upstream.status === 429) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (upstream.status === 402) {
    return new Response(JSON.stringify({ error: "credits_exhausted" }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!upstream.ok) {
    const text = await upstream.text();
    console.error("ai_gateway_error", upstream.status, text);
    return new Response(JSON.stringify({ error: "ai_gateway_error", status: upstream.status }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const json = await upstream.json();
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content) {
    return new Response(JSON.stringify({ error: "empty_completion" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let parsed: FrontResponse | ProfileResponse;
  try {
    parsed = JSON.parse(content);
  } catch {
    return new Response(JSON.stringify({ error: "invalid_completion_json", raw: content }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Rescale normalized [0,1000] → native frame pixels.
  const sx = (width as number) / 1000;
  const sy = (height as number) / 1000;
  const px = (p: NormPoint) => ({ x: Math.round(p.x * sx), y: Math.round(p.y * sy) });

  let result: Record<string, unknown>;
  if (parsed.pose === "front") {
    result = {
      pose: "front",
      card: { left: px(parsed.card.left), right: px(parsed.card.right) },
      face: { left: px(parsed.face.left), right: px(parsed.face.right) },
      noseBridge: { left: px(parsed.noseBridge.left), right: px(parsed.noseBridge.right) },
      confidence: parsed.confidence,
      glassesDetected: parsed.glassesDetected === true,
    };
  } else {
    result = {
      pose: parsed.pose,
      outerEyeCorner: px(parsed.outerEyeCorner),
      tragus: px(parsed.tragus),
      noseBridgeTop: px(parsed.noseBridgeTop),
      noseBridgeBottom: px(parsed.noseBridgeBottom),
      browLine: { inner: px(parsed.browLine.inner), outer: px(parsed.browLine.outer) },
      confidence: parsed.confidence,
      glassesDetected: parsed.glassesDetected === true,
    };
  }

  return new Response(
    JSON.stringify({ ...result, width, height, model: "google/gemini-2.5-pro" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
