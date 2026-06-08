// Server-side card + face edge detection for FitScan.
//
// Accepts a captured frame (data URL or base64 JPEG) plus the native pixel
// dimensions of that frame. Asks Gemini 2.5 Pro (multimodal) to locate:
//   - the two endpoints of the credit card's long edge (left + right corners
//     along the same horizontal edge),
//   - the outermost left + right edge of the face (temple to temple, same y).
//
// Returns coordinates in NATIVE FRAME PIXELS so the client can feed them
// straight into calculateMeasurements(). Gemini returns normalized [0,1000]
// coords (its documented convention for spatial reasoning); we rescale here.
//
// No auth — public scan endpoint, same posture as mailerlite-subscribe.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface NormPoint { x: number; y: number } // 0..1000
interface DetectResponse {
  card: { left: NormPoint; right: NormPoint };
  face: { left: NormPoint; right: NormPoint };
  confidence: number; // 0..1
  glassesDetected?: boolean;
  notes?: string;
}

const SYSTEM_PROMPT = `You are a precise computer-vision annotator for an EYEWEAR frame-width measurement tool.

The user shows their face to a webcam with a credit/ID card held FLAT against the forehead, long edge HORIZONTAL.

Your job: return pixel-accurate coordinates for FOUR points on the supplied image:
1. card.left  — leftmost visible corner of the card's long (horizontal) edge
2. card.right — rightmost visible corner of the SAME card edge (same y as card.left)
3. face.left  — outermost LEFT edge of the HEAD silhouette at temple height (just above the ear, roughly level with the eyebrows / top of the ear). This must be the WIDEST point of the head/skull including hair — NOT the cheekbone and NOT the inner face contour. Picture where the temple tip of a pair of eyeglasses would rest against the skull; that is the point you must mark.
4. face.right — outermost RIGHT edge of the head at the SAME y as face.left

Critical: face.left and face.right define where eyewear frames sit. Marking the cheekbone or jawline gives a too-narrow result and is WRONG. Always pick the widest visible head outline at temple height, including hair.

Coordinates are normalized integers 0..1000 (x=0 is left edge of image, y=0 is top).

Rules:
- card.left.y MUST equal card.right.y (±5). Pick the most prominent horizontal card edge.
- face.left.y MUST equal face.right.y (±5). Pick the widest horizontal slice at temple height.
- If no card is visible or the face is not centred / clear, set confidence < 0.4 and still return best-guess points.
- Never refuse. Never add commentary outside the JSON.`;

const SCHEMA = {
  type: "object",
  properties: {
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
    confidence: { type: "number" },
    notes: { type: "string" },
  },
  required: ["card", "face", "confidence"],
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

  let body: { image?: string; width?: number; height?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { image, width, height } = body;
  if (!image || typeof image !== "string" || !Number.isFinite(width) || !Number.isFinite(height)) {
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if ((width as number) < 100 || (height as number) < 100) {
    return new Response(JSON.stringify({ error: "frame_too_small" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Accept either a full data URL or a raw base64 JPEG.
  const imageUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "CALIBRATION EXAMPLE. The image below is the GOLD-STANDARD reference: a credit card flat on the forehead, long edge horizontal. The correct annotation for this image is:\n{\"card\":{\"left\":{\"x\":355,\"y\":505},\"right\":{\"x\":637,\"y\":505}},\"face\":{\"left\":{\"x\":293,\"y\":458},\"right\":{\"x\":733,\"y\":458}},\"confidence\":0.95}\nNotice how face.left/face.right sit at the OUTER head silhouette at temple height (including hair), well outside the cheekbone. Use this same pattern when annotating the next image.",
            },
            { type: "image_url", image_url: { url: "https://woolet.co/__l5e/assets-v1/eb18c256-5733-4347-a94c-156105f6f42a/fit-scan-calibration.png" } },
          ],
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Now annotate THIS image using the same rules as the calibration example. Return JSON only." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "fit_scan_detection", strict: true, schema: SCHEMA },
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

  let parsed: DetectResponse;
  try {
    parsed = JSON.parse(content) as DetectResponse;
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

  const result = {
    card: { left: px(parsed.card.left), right: px(parsed.card.right) },
    face: { left: px(parsed.face.left), right: px(parsed.face.right) },
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    notes: parsed.notes ?? null,
    width,
    height,
    model: "google/gemini-2.5-pro",
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
