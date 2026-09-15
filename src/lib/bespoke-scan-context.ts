// The bespoke case a /en/fit scan belongs to.
//
// The case number is our pseudonymous reference: it goes to the widget as the
// session id, and nothing else does — no email, no name. Binding it to a person
// happens only on our side.

export const CASE_NO_RE = /^WLT-BSP-\d{4}-\d{4}$/;
const STORAGE_KEY = "woolet:bespoke:scanctx";

export interface BespokeScanContext {
  caseNo: string;
  firstName?: string | null;
  stage?: string | null;
  /** True when the pair in the link was checked server-side. */
  verified: boolean;
}

export function normalizeCaseNo(input: string): string | null {
  const value = input.trim().toUpperCase().replace(/\s+/g, "");
  return CASE_NO_RE.test(value) ? value : null;
}

export function readScanContext(): BespokeScanContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const caseNo = typeof parsed?.caseNo === "string" ? normalizeCaseNo(parsed.caseNo) : null;
    if (!caseNo) return null;
    return {
      caseNo,
      firstName: parsed.firstName ?? null,
      stage: parsed.stage ?? null,
      verified: !!parsed.verified,
    };
  } catch {
    return null;
  }
}

export function writeScanContext(ctx: BespokeScanContext | null) {
  if (typeof window === "undefined") return;
  try {
    if (!ctx) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    /* private mode — the scan still runs, it just will not be remembered */
  }
}
