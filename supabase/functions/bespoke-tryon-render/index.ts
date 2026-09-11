// Renders the buyer's own photograph wearing the bespoke frame they just
// visualised. Signed-in only, hard-capped at MAX_RENDERS per account.
//
// The uploaded photograph is passed to the AI gateway for this single request
// and never stored by us; only the resulting render is recorded.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_RENDERS = 2;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface Body {
  photo?: string; // data URI, jpeg/png/webp
  shape?: string;
  frontColor?: string;
  templeColor?: string;
  finish?: string;
  selectionKey?: string;
  probe?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await anon.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "not_authenticated" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { count } = await admin
      .from("bespoke_tryon_renders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    const used = count ?? 0;
    const remaining = Math.max(0, MAX_RENDERS - used);

    const body = (await req.json()) as Body;
    if (body?.probe === true) return json({ used, remaining, max: MAX_RENDERS });

    if (remaining <= 0) {
      return json({ error: "limit_reached", used, remaining: 0, max: MAX_RENDERS }, 429);
    }

    const photo = String(body?.photo ?? "");
    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(photo)) {
      return json({ error: "Invalid photo" }, 400);
    }
    // ~8 MB of base64 payload ceiling.
    if (photo.length > 8_000_000) return json({ error: "Photo too large" }, 413);

    const shape = String(body?.shape ?? "").slice(0, 60);
    const frontColor = String(body?.frontColor ?? "").slice(0, 120);
    const templeColor = String(body?.templeColor ?? "").slice(0, 120);
    const finish = String(body?.finish ?? "").slice(0, 60);
    if (!shape || !frontColor || !templeColor || !finish) {
      return json({ error: "Missing frame selection" }, 400);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI gateway not configured" }, 500);

    const prompt = [
      `Edit this photograph so the person is wearing a single pair of premium bespoke eyeglasses,`,
      `shape: ${shape}. Frame front in Italian Mazzucchelli acetate "${frontColor}",`,
      `temples in "${templeColor}", finish: ${finish}. Wide 155 mm+ silhouette, keyhole bridge.`,
      `Keep the person's face, skin, hair, expression, pose, lighting and background exactly as they are —`,
      `change nothing except adding the glasses. Realistic placement on the nose bridge and ears,`,
      `correct perspective, natural shadows and clear lenses with subtle reflections.`,
      `No text, no logos, no watermarks. Photorealistic result.`,
    ].join(" ");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: photo } },
            ],
          },
        ],
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
    const imageUrl: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) return json({ error: "No image returned" }, 502);

    const description = `${shape} · Front: ${frontColor} · Temples: ${templeColor} · ${finish}`;
    await admin.from("bespoke_tryon_renders").insert({
      user_id: user.id,
      selection_key: String(body?.selectionKey ?? "").slice(0, 200) || null,
      image_url: imageUrl,
      description,
    });

    return json({ imageUrl, used: used + 1, remaining: remaining - 1, max: MAX_RENDERS });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unknown error" }, 500);
  }
});
