// Generates an AI preview render of a bespoke frame given the user's chosen
// shape, front acetate colour, temple acetate colour and finish.
// Uses the Lovable AI Gateway with a technical blueprint and, for Aviator,
// construction photography supplied by Woolet.

import {
  AVIATOR_CONSTRUCTION_REFERENCES,
  AVIATOR_REFERENCE_URLS,
  isAviatorShape,
} from "../_shared/aviator-references.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  shape: string;          // e.g. "Aviator", "Round", "Crown Panto", "Rectangle"
  frontColor: string;     // human-readable, e.g. "Dark tortoise (P632 0006)"
  templeColor: string;    // e.g. "Amber tortoise"
  finish: string;         // "Shiny hand-polished" | "Matte" | "Scratched / brushed"
  patternUrl?: string;    // the technical outline drawing of the chosen pattern
  widthMm?: number;       // front width the pattern is cut to
  bridgeMm?: number;      // reference bridge width
  lensType?: string | null; // "plano" | "sun-uv400" | "photochromic" | "blue-light" | "reading"
  lensName?: string | null;
  lensTint?: string | null;
}

// The finish is the single most visible material property in the render, and
// the model ignores a bare adjective. Describe the surface physically instead.
const FINISH_DESCRIPTIONS: Record<string, string> = {
  "shiny hand-polished":
    "Surface finish: high-gloss hand-polished acetate — mirror-bright specular highlights, sharp reflections of the softbox on the front and on the temples, glassy polished edges with visible depth in the translucent layers.",
  matte:
    "Surface finish: fully matte acetate — completely non-reflective, soft velvety diffuse surface with no specular highlight anywhere, no gloss on the edges, colour reads slightly deeper and more muted than polished acetate.",
  "scratched / brushed":
    "Surface finish: brushed / scratched acetate — a fine directional satin grain running horizontally across the front and along the temples, low semi-matte sheen that breaks the highlight into a soft streak, no mirror reflections, edges lightly satin rather than glassy.",
};

const finishInstruction = (finish: string): string =>
  FINISH_DESCRIPTIONS[finish.trim().toLowerCase()] ??
  `Surface finish: ${finish}, rendered as a physically accurate acetate surface.`;

const LENS_DESCRIPTIONS: Record<string, string> = {
  plano: "Lenses: clear neutral demo lenses, no tint, only faint anti-reflective bloom.",
  "blue-light":
    "Lenses: essentially clear lenses with a very subtle cool blue-violet anti-reflective sheen visible at grazing angles; the lenses stay transparent and the frame colour behind them is unchanged.",
  reading: "Lenses: clear lenses with a slightly thicker edge profile, no tint.",
  photochromic:
    "Lenses: photochromic lenses in a partially activated state — a light neutral grey tint, darker at the top and fading lighter toward the bottom, still transparent enough to read the temples through the lens.",
  "sun-uv400":
    "Lenses: solid tinted sun lenses in a deep neutral grey-brown, clearly darker than the frame, with a crisp specular highlight across the lens surface and the temple only faintly visible through them.",
};

const SUN_LENS_TINTS: Record<string, string> = {
  "SUN-GRY": "solid deep smoke grey (#2d2f31)",
  "SUN-BRN": "solid deep espresso brown (#3e2616)",
  "SUN-G15": "solid classic G-15 green (#2f3b2c)",
  "SUN-BGR": "brown gradient, dark espresso brown (#3a2616) at the top fading vertically to light brown (#c9b39a) at the bottom",
};
const PHOTO_LENS_TINTS: Record<string, string> = {
  "PH-BRN": "espresso brown",
  "PH-GRN": "bottle green",
  "PH-GRY": "graphite grey",
};

const lensInstruction = (lensType?: string | null, lensName?: string | null, lensTint?: string | null): string => {
  if (!lensType) return LENS_DESCRIPTIONS.plano;
  if (lensType === "sun-uv400" && lensTint && SUN_LENS_TINTS[lensTint]) {
    return `Lenses: UV400 sun lenses in ${SUN_LENS_TINTS[lensTint]}; render the selected tint visibly on both lenses, with a crisp specular highlight and temples faintly visible through them.`;
  }
  if (lensType === "photochromic" && lensTint && PHOTO_LENS_TINTS[lensTint]) {
    return `Lenses: partially activated photochromic lenses in ${PHOTO_LENS_TINTS[lensTint]}, still transparent enough to see the temples behind them.`;
  }
  return (
    LENS_DESCRIPTIONS[lensType] ??
    `Lenses: ${lensName ?? lensType}, rendered physically accurately and clearly distinguishable from the acetate.`
  );
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type ImageStreamPayload = {
  type?: string;
  b64_json?: string;
  error?: { message?: string };
};

async function readGeneratedImage(resp: Response): Promise<string> {
  if (!resp.body) throw new Error("Image generation returned no response body");
  const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let finalB64 = "";
  let streamError = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const eventName = block.match(/^event:\s*(.+)$/m)?.[1]?.trim() ?? "";
      const data = block
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data || data === "[DONE]") continue;
      let payload: ImageStreamPayload;
      try {
        payload = JSON.parse(data) as ImageStreamPayload;
      } catch {
        continue;
      }
      if (eventName === "error" || payload.type === "error") {
        streamError = payload.error?.message || "Image generation failed";
      }
      if (
        (eventName === "image_generation.completed" || payload.type === "image_generation.completed") &&
        payload.b64_json
      ) {
        finalB64 = payload.b64_json;
      }
    }
  }

  if (streamError) throw new Error(streamError);
  if (!finalB64) throw new Error("Image stream ended without a completed image");
  return `data:image/png;base64,${finalB64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Body;
    const shape = String(body?.shape || "").slice(0, 60);
    const frontColor = String(body?.frontColor || "").slice(0, 120);
    const templeColor = String(body?.templeColor || "").slice(0, 120);
    const finish = String(body?.finish || "").slice(0, 60);
    const suppliedPatternUrl = String(body?.patternUrl || "").slice(0, 2000);
    const widthMm = Number(body?.widthMm) || 158;
    const bridgeMm = Number(body?.bridgeMm) || 22;
    const lensType = body?.lensType ? String(body.lensType).slice(0, 40) : null;
    const lensName = body?.lensName ? String(body.lensName).slice(0, 60) : null;
    const lensTint = body?.lensTint ? String(body.lensTint).slice(0, 12) : null;

    if (!shape || !frontColor || !templeColor || !finish) {
      return json({ error: "Missing shape / frontColor / templeColor / finish" }, 400);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI gateway not configured" }, 500);

    // The technical drawing is the source of truth for the silhouette; the text
    // only carries material, colour and light. Without the drawing the model
    // invents its own bridge and lens shape, which is what made the render
    // drift away from the pattern the workshop actually cuts.
    const aviator = isAviatorShape(shape);
    const patternUrl = aviator
      ? AVIATOR_REFERENCE_URLS.pattern
      : /^https?:\/\//.test(suppliedPatternUrl)
        ? suppliedPatternUrl
        : suppliedPatternUrl.startsWith("/")
          ? `https://woolet.co${suppliedPatternUrl}`
          : "";
    const usePattern = Boolean(patternUrl);

    const prompt = [
      usePattern
        ? `Use the attached technical outline drawing as the exact blueprint for the frame's geometry.`
        : `Frame pattern: ${shape}.`,
      usePattern
        ? `Reproduce that silhouette faithfully: identical lens shape and lens depth, identical bridge type and position (do not add or remove a brow bar or a second bridge), identical end-piece and temple placement, identical proportion between lens width and bridge.`
        : `Classic ${shape} silhouette.`,
      ...(aviator
        ? [
            `Images 2–7 are photographs of the same physical Aviator construction from different angles. Use them only to understand real thickness, edge polish, bridge depth, end-piece geometry, hinge placement, two-pin temple attachment, temple taper and how each temple joins the front without a gap or invented connector.`,
            `The technical drawing in image 1 remains the authority for the front silhouette. The photographs are the authority for three-dimensional construction and photographic quality.`,
            `Do not copy the photographs' clear front, black temples, sunglass tint, engraving or branding. Apply the buyer's selected front acetate, temple acetate, finish and lenses stated below.`,
          ]
        : []),
      `Render it as an editorial product photograph of one real pair of premium bespoke eyeglasses,`,
      `frame front cut from Italian Mazzucchelli acetate in "${frontColor}",`,
      `temples in acetate "${templeColor}".`,
      finishInstruction(finish),
      `The finish must be unmistakable at a glance and applied consistently to the front, the temples and the edges.`,
      `Front width about ${widthMm} mm with a bridge of about ${bridgeMm} mm, so the pair reads wide and generously proportioned.`,
      lensInstruction(lensType, lensName, lensTint),
      `Correctly seated hinges and rivets, accurate acetate edge detail,`,
      `high-key professional product photography on a clean warm off-white seamless background, controlled softbox reflections, precise transparency and refraction where the acetate is translucent, crisp natural contact shadow,`,
      `three-quarter front angle with the entire frame and both temples legible, no face, no model, no branding, no text, no logos,`,
      `no drawing lines, no sketch, no floating hardware, no fused temples, no extra bridge, no asymmetry, ultra-realistic premium catalogue still.`,
    ].join(" ");

    const content = usePattern
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: patternUrl } },
          ...(aviator
            ? AVIATOR_CONSTRUCTION_REFERENCES.map((url) => ({
                type: "image_url" as const,
                image_url: { url },
              }))
            : []),
        ]
      : prompt;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
        stream: true,
      }),
    });


    if (!resp.ok) {
      const text = await resp.text();
      let message = text.slice(0, 400) || "AI gateway error";
      try {
        const parsed = JSON.parse(text) as { message?: string; error?: { message?: string } };
        message = parsed.message || parsed.error?.message || message;
      } catch { /* retain response text */ }
      return json({ error: message }, resp.status);
    }

    const imageUrl = await readGeneratedImage(resp);

    return json({ imageUrl });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unknown error" }, 500);
  }
});
