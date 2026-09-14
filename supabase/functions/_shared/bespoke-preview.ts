// Generates the production visualisation of a bespoke frame from the order's
// own specification (pattern, front acetate, temple acetate, finish) and stores
// it in the private `bespoke-cad` bucket. The workshop PDF embeds it from a
// short-lived signed URL, so nothing is ever publicly readable.

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
}

function buildPrompt(spec: PreviewSpec): string {
  const shape = (spec.frameName || "Woolet Bespoke").replace(/^Woolet Bespoke\s*[—-]\s*/i, "");
  return [
    `Editorial product photograph of one real pair of premium bespoke eyeglasses.`,
    `Classic ${shape} silhouette, wide and generously proportioned (about 158 mm front width, 22 mm bridge).`,
    `Frame front cut from Italian Mazzucchelli acetate in "${spec.frontCode || "dark tortoise"}",`,
    `temples in acetate "${spec.templeCode || spec.frontCode || "dark tortoise"}".`,
    `Finish: ${spec.finish || "shiny hand-polished"}.`,
    `Clear demo lenses, thin metal hinge rivets, hand-polished acetate edge detail,`,
    `soft warm studio light on a neutral cream background (#EFE9DF), crisp soft shadow,`,
    `three-quarter front angle, no face, no model, no branding, no text, no logos,`,
    `no drawing lines, no sketch, ultra-realistic 4k product still.`,
  ].join(" ");
}

async function generatePngBytes(spec: PreviewSpec): Promise<Uint8Array> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
      messages: [{ role: "user", content: buildPrompt(spec) }],
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
  order: { id: string; frame_name?: string | null; front_code?: string | null; temple_code?: string | null; finish_id?: string | null },
): Promise<string | null> {
  try {
    const bytes = await generatePngBytes({
      frameName: order.frame_name,
      frontCode: order.front_code,
      templeCode: order.temple_code,
      finish: order.finish_id,
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
