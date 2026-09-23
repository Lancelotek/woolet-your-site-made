// Generates the production visualisation of a bespoke frame from the order's
// own specification (pattern, front acetate, temple acetate, finish) and stores
// it in the private `bespoke-cad` bucket. The workshop PDF embeds it from a
// short-lived signed URL, so nothing is ever publicly readable.

import {
  AVIATOR_CONSTRUCTION_REFERENCES,
  AVIATOR_REFERENCE_URLS,
  isAviatorShape,
} from "./aviator-references.ts";

type Db = {
  from: (t: string) => any;
  storage: { from: (b: string) => any };
};

export const PREVIEW_BUCKET = "bespoke-cad";

export interface PreviewSpec {
  frameName?: string | null;
  frontCode?: string | null;
  templeCode?: string | null;
  finish?: string | null;
  lensType?: string | null;
  lensTintCode?: string | null;
}

function buildPrompt(spec: PreviewSpec): string {
  const shape = (spec.frameName || "Woolet Bespoke").replace(/^Woolet Bespoke\s*[—-]\s*/i, "");
  const aviator = isAviatorShape(shape);
  return [
    ...(aviator
      ? [
          `Image 1 is the exact technical blueprint for the front silhouette. Images 2–7 show the same physical Aviator construction from several angles.`,
          `Keep the blueprint's lens outline, single bridge and top line exactly. From the photographs preserve the real acetate thickness, bridge depth, end pieces, hinge placement, two-pin temple attachment, tapered temples and the precise joint between temples and front.`,
          `Use the photographs only for construction and studio quality. Do not copy their clear front, black temples, sunglass tint, engraving or branding; use the order specification below.`,
        ]
      : []),
    `Editorial product photograph of one real pair of premium bespoke eyeglasses.`,
    `Classic ${shape} silhouette, wide and generously proportioned (about 158 mm front width, 22 mm bridge).`,
    `Frame front cut from Italian Mazzucchelli acetate in "${spec.frontCode || "dark tortoise"}",`,
    `temples in acetate "${spec.templeCode || spec.frontCode || "dark tortoise"}".`,
    `Finish: ${spec.finish || "shiny hand-polished"}.`,
    spec.lensTintCode?.startsWith("SUN-")
      ? `UV400 sun lenses in ${({ "SUN-GRY": "solid smoke grey", "SUN-BRN": "solid espresso brown", "SUN-G15": "solid G-15 green", "SUN-BGR": "brown gradient, dark on top fading to light brown at the bottom" } as Record<string, string>)[spec.lensTintCode] ?? "smoke grey"}, visibly tinted on both lenses; correctly seated hinges and rivets, hand-polished acetate edge detail,`
      : spec.lensTintCode?.startsWith("PH-")
        ? `Partially activated photochromic lenses in ${({ "PH-BRN": "espresso brown", "PH-GRN": "bottle green", "PH-GRY": "graphite grey" } as Record<string, string>)[spec.lensTintCode] ?? "grey"}; correctly seated hinges and rivets, hand-polished acetate edge detail,`
        : `Clear neutral demo lenses, correctly seated hinges and rivets, hand-polished acetate edge detail,`,
    `high-key professional product photography on a clean warm off-white seamless background, controlled softbox reflections, precise translucent acetate refraction and a crisp natural contact shadow,`,
    `three-quarter front angle with the complete frame and both temples legible, no face, no model, no branding, no text, no logos,`,
    `no drawing lines, no sketch, no floating hardware, no fused temples, no extra bridge, no asymmetry, ultra-realistic premium catalogue still.`,
  ].join(" ");
}

async function generatePngBytes(spec: PreviewSpec): Promise<Uint8Array> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const shape = (spec.frameName || "").replace(/^Woolet Bespoke\s*[—-]\s*/i, "");
  const aviator = isAviatorShape(shape);
  const content = aviator
    ? [
        { type: "text", text: buildPrompt(spec) },
        { type: "image_url", image_url: { url: AVIATOR_REFERENCE_URLS.pattern } },
        ...AVIATOR_CONSTRUCTION_REFERENCES.map((url) => ({ type: "image_url", image_url: { url } })),
      ]
    : buildPrompt(spec);

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`ai_gateway_${resp.status}: ${detail.slice(0, 300)}`);
  }

  const data = await resp.json();
  const b64: string | undefined =
    data?.data?.[0]?.b64_json ??
    data?.choices?.[0]?.message?.images?.[0]?.image_url?.url?.split(",")[1];
  if (!b64) throw new Error("no_image_returned");

  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Renders the frame for one order and records the storage path on the order.
 * Returns the stored path, or null when generation failed (never throws into
 * the payment path).
 */
export async function generateOrderPreview(
  db: Db,
  order: { id: string; frame_name?: string | null; front_code?: string | null; temple_code?: string | null; finish_id?: string | null; lens_type?: string | null; lens_tint_code?: string | null },
): Promise<string | null> {
  try {
    const bytes = await generatePngBytes({
      frameName: order.frame_name,
      frontCode: order.front_code,
      templeCode: order.temple_code,
      finish: order.finish_id,
      lensType: order.lens_type,
      lensTintCode: order.lens_tint_code,
    });
    const path = `previews/${order.id}.png`;
    const { error: upErr } = await db.storage
      .from(PREVIEW_BUCKET)
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;
    const { error: dbErr } = await db
      .from("bespoke_orders")
      .update({ ai_preview_path: path })
      .eq("id", order.id);
    if (dbErr) throw dbErr;
    return path;
  } catch (err) {
    console.error("[bespoke-preview] generation failed", err);
    return null;
  }
}
