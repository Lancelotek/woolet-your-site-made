// A short, human-readable reference for one face measurement.
//
// This is ours and stays stable; FitLens's own `scan_id` keeps its own column
// and neither replaces the other. The alphabet drops O, 0, I, 1 and L because
// the reference gets read aloud over the phone and retyped into a form.

// deno-lint-ignore no-explicit-any
type Client = any;

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateMeasurementRef(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `M-${out}`;
}

/** M-XXXXXX, uppercased, with spaces and stray dashes stripped. */
export function normalizeMeasurementRef(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const cleaned = input.toUpperCase().replace(/[\s-]/g, "");
  if (!/^M[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(cleaned)) return null;
  return `M-${cleaned.slice(1)}`;
}

/**
 * Give a scan row a reference, retrying if the unique index rejects a
 * collision. Returns the reference the row ended up with.
 */
export async function assignMeasurementRef(
  supabase: Client,
  scanId: string,
  attempts = 5,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("bespoke_scan_profiles")
    .select("measurement_ref")
    .eq("scan_id", scanId)
    .maybeSingle();
  if (existing?.measurement_ref) return existing.measurement_ref as string;

  for (let i = 0; i < attempts; i += 1) {
    const ref = generateMeasurementRef();
    const { error } = await supabase
      .from("bespoke_scan_profiles")
      .update({ measurement_ref: ref })
      .eq("scan_id", scanId)
      .is("measurement_ref", null);
    if (!error) return ref;
    // 23505 = unique violation: try another reference.
    if ((error as { code?: string }).code !== "23505") {
      console.error("[measurement-ref] assign failed", error);
      return null;
    }
  }
  return null;
}
