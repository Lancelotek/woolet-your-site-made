/**
 * Stripe Payment Link client_reference_id carrying GA4 ids (fix pack 20.10.2026).
 * Format written by src/lib/ga-ids.ts withGaClientReference:
 *   "<base>__ga_<cidA>_<cidB>[_<sid>]"  ->  ga_client_id "<cidA>.<cidB>", ga_session_id "<sid>"
 * Pure TS (no Deno APIs) so vitest can cover it.
 */
export function parseGaClientReference(ref: string): { base: string; gaClientId?: string; gaSessionId?: string } {
  const m = ref.match(/^(.*?)__ga_(\d+)_(\d+)(?:_(\d+))?$/);
  if (!m) return { base: ref };
  return { base: m[1], gaClientId: `${m[2]}.${m[3]}`, gaSessionId: m[4] };
}
