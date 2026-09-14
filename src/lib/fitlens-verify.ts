// Client side of the FitLens trust chain.
//
// The `fitlens:result` CustomEvent is not evidence — any script on the page can
// dispatch it. When the event carries a `signedPayload` JWT we hand it to
// `fitlens-verify-result`, which checks the signature against FitLens's JWKS
// and stores a trusted row. Without a token we still record the numbers, but
// plainly marked as reported-by-the-widget.

import { supabase } from "@/integrations/supabase/client";
import type { FitLensEvent } from "@/lib/fitlens-result";

export type ScanSource = "fitlens_webhook" | "fitlens_signed" | "fitlens_client";

export const SCAN_SOURCE_LABEL: Record<ScanSource, string> = {
  fitlens_webhook: "Verified scan",
  fitlens_signed: "Signed scan",
  fitlens_client: "Reported by the scan widget - unverified",
};

export async function recordFitLensEvent(
  event: FitLensEvent,
  sessionRef?: string | null,
  /** Customer-quoted measurement reference — a fallback when there is no session. */
  reference?: string | null,
): Promise<{ source: ScanSource; scanId: string | null; measurementRef?: string | null }> {
  if (event.signedPayload) {
    try {
      const { data, error } = await supabase.functions.invoke("fitlens-verify-result", {
        body: { signedPayload: event.signedPayload },
      });
      if (!error && (data as any)?.ok) {
        return {
          source: ((data as any).source as ScanSource) ?? "fitlens_signed",
          scanId: (data as any).scanId ?? event.measurementId,
          measurementRef: (data as any).measurementRef ?? null,
        };
      }
      // A refused token stores nothing — fall through to the unverified path so
      // the customer still sees their numbers, correctly labelled.
      console.warn("[fitlens] signed payload refused", error ?? data);
    } catch (e) {
      console.warn("[fitlens] verification call failed", e);
    }
  }

  try {
    const { data } = await supabase.functions.invoke("fitlens-scan-client", {
      body: {
        scanId: event.measurementId,
        sessionRef: sessionRef ?? null,
        reference: reference ?? null,
        semanticsVersion: event.semanticsVersion,
        tier: event.confidence.tier,
        spreadMm: event.confidence.spreadMm,
        measurements: {
          templeToTemple: event.measurements.templeToTemple ?? event.measurements.faceWidth ?? null,
          faceWidth: event.measurements.faceWidth ?? null,
          pd: event.measurements.pd ?? null,
          bridge: event.measurements.bridge ?? null,
        },
      },
    });
    return {
      source: "fitlens_client",
      scanId: (data as any)?.scanId ?? event.measurementId,
      measurementRef: (data as any)?.measurementRef ?? null,
    };
  } catch (e) {
    console.warn("[fitlens] client-side scan store failed", e);
    return { source: "fitlens_client", scanId: event.measurementId };
  }
}
