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

    if (!shape || !frontColor || !templeColor || !finish) {
      return json({ error: "Missing shape / frontColor / templeColor / finish" }, 400);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI gateway not configured" }, 500);

    const prompt = [
      `Editorial product photograph of a single pair of premium bespoke eyeglasses,`,
      `shape: ${shape}. Frame front cut from Italian Mazzucchelli acetate in "${frontColor}".`,
      `Temples in contrasting acetate "${templeColor}". Finish: ${finish}.`,
      `Keyhole bridge, wide 155 mm+ silhouette, hand-polished acetate detail,`,
      `subtle warm studio lighting on a neutral cream background (#EFE9DF),`,
      `crisp shadow, three-quarter front angle, no face, no model, no branding,`,
      `no text, no logos, ultra-realistic, 4k product still.`,
    ].join(" ");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
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
