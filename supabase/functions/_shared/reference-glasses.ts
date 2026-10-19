// Reference glasses from the Calendly fitting-interview form.
//
// The customer types what is printed on the temple ("cgop 1386 01 52 21-145").
// Two layers, kept apart on purpose:
//   1. parseReferenceSizes - deterministic: lens / bridge / temple read from the
//      digits. Never guessed, never touched by AI.
//   2. identifyReferenceGlasses - AI: brand, model, colour, shape, front width.
//      Always marked as unverified; the admin re-checks it before cutting.

export type ReferenceSizes = {
  lens_mm: number | null;
  bridge_mm: number | null;
  temple_mm: number | null;
};

export type ReferenceGlasses = ReferenceSizes & {
  raw: string;
  brand: string | null;
  model: string | null;
  colour_code: string | null;
  colour_name: string | null;
  shape: string | null;
  material: string | null;
  /** Total front width. Source says where the number came from. */
  front_width_mm: number | null;
  front_width_source: "ai_known" | "estimate" | "admin" | null;
  confidence: "high" | "medium" | "low" | null;
  notes: string | null;
  search_url: string;
  model_used: string | null;
  checked_at: string;
};

const inRange = (n: number, lo: number, hi: number) => Number.isFinite(n) && n >= lo && n <= hi;

/**
 * Reads the A / DBL / temple triple. Handles "52 21-145", "52□21 145",
 * "52-21-145", "52/21/145". Picks the last plausible triple so a model number
 * like "1386 01" in front of it does not get mistaken for a size.
 */
export function parseReferenceSizes(raw: string): ReferenceSizes {
  const empty: ReferenceSizes = { lens_mm: null, bridge_mm: null, temple_mm: null };
  if (!raw) return empty;
  const nums = (raw.match(/\d{2,3}/g) ?? []).map(Number);
  for (let i = nums.length - 3; i >= 0; i -= 1) {
    const [a, b, c] = nums.slice(i, i + 3);
    if (inRange(a, 38, 70) && inRange(b, 12, 28) && inRange(c, 120, 160)) {
      return { lens_mm: a, bridge_mm: b, temple_mm: c };
    }
  }
  // Two numbers only (temple missing or unreadable).
  for (let i = nums.length - 2; i >= 0; i -= 1) {
    const [a, b] = nums.slice(i, i + 2);
    if (inRange(a, 38, 70) && inRange(b, 12, 28)) return { lens_mm: a, bridge_mm: b, temple_mm: null };
  }
  return empty;
}

/** Acetate fronts run ~16-22 mm wider than 2A + DBL; 18 is the midpoint. */
export const estimateFrontWidth = (s: ReferenceSizes) =>
  s.lens_mm && s.bridge_mm ? 2 * s.lens_mm + s.bridge_mm + 18 : null;

const SYSTEM = `You identify eyeglass frames from the text printed on the inside of the temple arm.
Customers type it quickly: brand prefixes are often abbreviated (e.g. "CGOP" = Cutler and Gross optical, "RX"/"RB" = Ray-Ban, "HC" = Coach, "PR" = Prada, "VE" = Versace, "TF" = Tom Ford, "MJ" = Maui Jim, "OV" = Oliver Peoples).
Typical order: brand/model code, colour code, then lens width, bridge, temple length.
Return JSON only. Use null for anything you do not know. Never invent a front width: give it only when you know this exact model's published front width.`;

const SCHEMA_HINT = `{"brand": string|null, "model": string|null, "colour_code": string|null, "colour_name": string|null, "shape": string|null, "material": string|null, "front_width_mm": number|null, "confidence": "high"|"medium"|"low", "notes": string|null}`;

const MODEL = "google/gemini-2.5-flash";

export async function identifyReferenceGlasses(raw: string): Promise<ReferenceGlasses> {
  const text = (raw ?? "").trim().slice(0, 300);
  const sizes = parseReferenceSizes(text);
  const base: ReferenceGlasses = {
    raw: text,
    ...sizes,
    brand: null,
    model: null,
    colour_code: null,
    colour_name: null,
    shape: null,
    material: null,
    front_width_mm: estimateFrontWidth(sizes),
    front_width_source: estimateFrontWidth(sizes) ? "estimate" : null,
    confidence: null,
    notes: null,
    search_url: `https://www.google.com/search?q=${encodeURIComponent(`${text} glasses`)}`,
    model_used: null,
    checked_at: new Date().toISOString(),
  };
  if (!text) return base;

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return { ...base, notes: "AI lookup skipped: LOVABLE_API_KEY missing" };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Temple text: "${text}"\nParsed sizes (trust these): lens ${sizes.lens_mm ?? "?"} mm, bridge ${sizes.bridge_mm ?? "?"} mm, temple ${sizes.temple_mm ?? "?"} mm.\nReturn JSON matching: ${SCHEMA_HINT}`,
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[reference-glasses] gateway", res.status, await res.text());
      return { ...base, notes: `AI lookup failed (${res.status})` };
    }
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content.replace(/^```(?:json)?|```$/g, "").trim());
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 160) : null);
    const fw = Number(parsed?.front_width_mm);
    const knownFront = inRange(fw, 110, 175) ? Math.round(fw) : null;
    const conf = ["high", "medium", "low"].includes(parsed?.confidence) ? parsed.confidence : "low";
    return {
      ...base,
      brand: str(parsed?.brand),
      model: str(parsed?.model),
      colour_code: str(parsed?.colour_code),
      colour_name: str(parsed?.colour_name),
      shape: str(parsed?.shape),
      material: str(parsed?.material),
      front_width_mm: knownFront ?? base.front_width_mm,
      front_width_source: knownFront ? "ai_known" : base.front_width_source,
      confidence: conf,
      notes: str(parsed?.notes),
      model_used: MODEL,
    };
  } catch (e) {
    console.error("[reference-glasses] lookup error", e);
    return { ...base, notes: "AI lookup error - check by hand" };
  }
}

/** Calendly Q&A → the three fields we care about. Matched by question text. */
export function readInterviewAnswers(qas: unknown) {
  const list = Array.isArray(qas) ? qas : [];
  const pick = (re: RegExp) => {
    const hit = list.find((q: any) => typeof q?.question === "string" && re.test(q.question));
    return typeof hit?.answer === "string" ? hit.answer.trim() : null;
  };
  return {
    answers: list
      .filter((q: any) => typeof q?.question === "string")
      .map((q: any) => ({ question: String(q.question), answer: q?.answer == null ? null : String(q.answer) })),
    order_number: pick(/order number|WLT-BSP/i),
    glasses: pick(/glasses|temple|brand/i),
    fitlens: pick(/fitlens|scan/i),
  };
}
