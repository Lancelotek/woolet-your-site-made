// Generates an AI preview render of a bespoke frame given the user's chosen
// shape, front acetate colour, temple acetate colour and finish.
// Uses the Lovable AI Gateway (google/gemini-2.5-flash-image-preview).

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
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Body;
    const shape = String(body?.shape || "").slice(0, 60);
    const frontColor = String(body?.frontColor || "").slice(0, 120);
    const templeColor = String(body?.templeColor || "").slice(0, 120);
    const finish = String(body?.finish || "").slice(0, 60);
    const patternUrl = String(body?.patternUrl || "").slice(0, 2000);
    const widthMm = Number(body?.widthMm) || 158;
    const bridgeMm = Number(body?.bridgeMm) || 22;

    if (!shape || !frontColor || !templeColor || !finish) {
      return json({ error: "Missing shape / frontColor / templeColor / finish" }, 400);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI gateway not configured" }, 500);

    // The technical drawing is the source of truth for the silhouette; the text
    // only carries material, colour and light. Without the drawing the model
    // invents its own bridge and lens shape, which is what made the render
    // drift away from the pattern the workshop actually cuts.
    const usePattern = /^https?:\/\//.test(patternUrl);

    const prompt = [
      usePattern
        ? `Use the attached technical outline drawing as the exact blueprint for the frame's geometry.`
        : `Frame pattern: ${shape}.`,
      usePattern
        ? `Reproduce that silhouette faithfully: identical lens shape and lens depth, identical bridge type and position (do not add or remove a brow bar or a second bridge), identical end-piece and temple placement, identical proportion between lens width and bridge.`
        : `Classic ${shape} silhouette.`,
      `Render it as an editorial product photograph of one real pair of premium bespoke eyeglasses,`,
      `frame front cut from Italian Mazzucchelli acetate in "${frontColor}",`,
      `temples in acetate "${templeColor}". Finish: ${finish}.`,
      `Front width about ${widthMm} mm with a bridge of about ${bridgeMm} mm, so the pair reads wide and generously proportioned.`,
      `Clear demo lenses, thin metal hinge rivets, hand-polished acetate edge detail,`,
      `soft warm studio light on a neutral cream background (#EFE9DF), crisp soft shadow,`,
      `three-quarter front angle, no face, no model, no branding, no text, no logos,`,
      `no drawing lines, no sketch, ultra-realistic 4k product still.`,
    ].join(" ");

    const content = usePattern
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: patternUrl } },
        ]
      : prompt;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
      }),
    });


    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 429) return json({ error: "Rate limit — please retry in a moment." }, 429);
      if (resp.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "AI gateway error", detail: text.slice(0, 400) }, 502);
    }

    const data = await resp.json();
    const imageUrl: string | undefined =
      data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) return json({ error: "No image returned" }, 502);

    return json({ imageUrl });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unknown error" }, 500);
  }
});
