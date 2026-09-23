import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Ruler, ScanFace, Sparkles, Truck } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { STORAGE_KEY } from "@/lib/bespoke-state";
import { READING_STRENGTHS } from "@/data/bespoke-options";
import { lensWithStrength, needsReadingStrength } from "@/lib/bespoke-gaps";
import { clarityEvent, claritySet, clarityUpgrade } from "@/lib/clarity";
import { useFitLensScript } from "@/hooks/use-fitlens-script";
import { parseFitLensEvent, type FitLensMeasurements } from "@/lib/fitlens-result";
import { recordFitLensEvent, SCAN_SOURCE_LABEL, type ScanSource } from "@/lib/fitlens-verify";
import { BESPOKE_DISCOVERY_SOURCES, isBespokeDiscoverySource, type BespokeDiscoverySource } from "@/content/bespokeFacts";

/** Temple length the customer asked for at checkout — shown for reference only. */
function readRequestedTempleLength(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { templeLengthMm?: number | null; templeLengthIsCustom?: boolean };
    if (typeof parsed.templeLengthMm !== "number") return null;
    return `${parsed.templeLengthMm} mm${parsed.templeLengthIsCustom ? " (custom)" : ""}`;
  } catch {
    return null;
  }
}

type OrderSummary = {
  stripe_session_id: string;
  source?: string | null;
  order_ref?: string | null;
  session_ref?: string | null;
  ai_source?: string | null;
  scan?: {
    measurement_ref?: string | null;
    scan_id: string | null;
    source: string | null;
    status: string | null;
    temple_to_temple_mm: number | null;
    face_width_mm: number | null;
    pd_mm: number | null;
    pd_left_mm: number | null;
    pd_right_mm: number | null;
    nose_bridge_width_mm: number | null;
  } | null;
  /** Every scan taken for this order, newest first. */
  scans?: Array<{
    measurement_ref?: string | null;
    scan_id: string | null;
    source: string | null;
    status: string | null;
    created_at: string | null;
    temple_to_temple_mm: number | null;
    face_width_mm: number | null;
    pd_mm: number | null;
    nose_bridge_width_mm: number | null;
  }>;
  created_at: string | null;
  customer_email_masked: string | null;
  frame_name: string | null;
  front_code: string | null;
  temple_code: string | null;
  finish_id: string | null;
  lens_type: string | null;
  reading_strength_mode?: string | null;
  reading_strength?: string | null;
  reading_strength_left?: string | null;
  reading_strength_right?: string | null;
  engraving_text: string | null;
  amount_cents: number | null;
  currency: string | null;
  ai_preview_url: string | null;
  measurements_submitted_at: string | null;
  ai_face_width_mm: number | null;
  ai_temple_to_temple_mm: number | null;
  ai_bridge_width_mm: number | null;
  /** Face measurement (eye corner to eye corner) from the scan. */
  ai_inner_canthal_mm?: number | null;

  ai_pd_mm: number | null;
  ai_notes: string | null;
  manual_face_width_mm: number | null;
  manual_temple_to_temple_mm: number | null;
  manual_bridge_width_mm: number | null;
  manual_pd_mm: number | null;
  manual_temple_length_mm: number | null;
  manual_head_circumference_mm: number | null;
  manual_ear_to_ear_mm: number | null;
  manual_notes: string | null;
  photo_consent: {
    consent_at: string | null;
    consent_withdrawn_at: string | null;
    consent_version: string | null;
    consent_locale: string | null;
  } | null;
  try_on_url?: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_submitted_at: string | null;
};

type ShippingState = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const EMPTY_SHIPPING: ShippingState = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
};

const COUNTRY_CODES =
  "AE AR AT AU BE BG BR CA CH CL CN CO CY CZ DE DK EE EG ES FI FR GB GR HK HR HU ID IE IL IN IS IT JP KR LT LU LV MA MT MX MY NL NO NZ PE PH PL PT RO RS SA SE SG SI SK TH TR TW UA US VN ZA".split(
    " ",
  );

const countryLabel = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

type FormState = {
  ai_face_width_mm: string;
  ai_temple_to_temple_mm: string;
  ai_bridge_width_mm: string;
  /** Face measurement (eye corner to eye corner) — never a frame bridge. */
  ai_inner_canthal_mm: string;
  ai_pd_mm: string;
  ai_notes: string;
  manual_face_width_mm: string;
  manual_temple_to_temple_mm: string;
  manual_bridge_width_mm: string;
  manual_pd_mm: string;
  manual_temple_length_mm: string;
  manual_head_circumference_mm: string;
  manual_ear_to_ear_mm: string;
  manual_notes: string;
};

const EMPTY: FormState = {
  ai_face_width_mm: "",
  ai_temple_to_temple_mm: "",
  ai_bridge_width_mm: "",
  ai_inner_canthal_mm: "",
  ai_pd_mm: "",
  ai_notes: "",
  manual_face_width_mm: "",
  manual_temple_to_temple_mm: "",
  manual_bridge_width_mm: "",
  manual_pd_mm: "",
  manual_temple_length_mm: "",
  manual_head_circumference_mm: "",
  manual_ear_to_ear_mm: "",
  manual_notes: "",
};


const num = (v: number | null) => (v === null || v === undefined ? "" : String(v));

function formatAmount(cents: number | null, currency: string | null) {
  if (!cents) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency ?? "usd").toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}


export default function BespokeMeasurements() {
  const [params] = useSearchParams();
  const sid = params.get("sid") ?? "";
  // Arrives from the "Measure again" button in the measurement summary email.
  const remeasure = params.get("remeasure") === "1";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [discoverySource, setDiscoverySource] = useState<BespokeDiscoverySource | "">("");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [shipping, setShipping] = useState<ShippingState>(EMPTY_SHIPPING);
  const [shippingError, setShippingError] = useState<string | null>(null);


  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reading lenses bought with "I'll confirm after payment" — the strength is
  // still owed, so we ask for it here before the workshop cuts.
  const [readingMode, setReadingMode] = useState<"same" | "different">("same");
  const [readingStrength, setReadingStrength] = useState<string>("");
  const [readingLeft, setReadingLeft] = useState<string>("");
  const [readingRight, setReadingRight] = useState<string>("");
  const requestedTempleLength = useMemo(() => readRequestedTempleLength(), []);

  const [scanResult, setScanResult] = useState<FitLensMeasurements | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [scanSource, setScanSource] = useState<ScanSource | null>(null);
  const [scanLocked, setScanLocked] = useState(false);
  const [scanOriginal, setScanOriginal] = useState<Record<string, string> | null>(null);
  /** Per-eye pupillary distance, when the scan measured it. */
  const [scanMono, setScanMono] = useState<{ left: number | null; right: number | null } | null>(null);
  /** Reference of the scan we already hold — shown when measuring a second time. */
  const [priorRef, setPriorRef] = useState<string | null>(null);
  /** Fallback only: a reference the customer types when they scanned elsewhere. */
  const [typedRef, setTypedRef] = useState("");
  const scanSectionRef = useRef<HTMLElement | null>(null);
  const remeasureOpened = useRef(false);

  const sessionRef = order?.session_ref ?? null;
  // The scan reference is the order's, not the browser's, so a customer who
  // opens the emailed link on a second device still measures against this order.
  const { openFitLens } = useFitLensScript({ sessionRef });

  // TRUST NOTE: this result arrives as a browser CustomEvent, which anyone can
  // dispatch from a devtools console — the event alone proves nothing. What we
  // trust instead: the `signedPayload` JWT (verified server-side against
  // FitLens's JWKS) and, above it, the server-to-server webhook at
  // `fitlens-webhook`. Numbers with neither are stored as `fitlens_client` /
  // unverified and labelled as such. No fake integrity check is added here.
  const handleScanResult = useCallback(
    (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const parsed = parseFitLensEvent(detail);
      const measurements = parsed.measurements;
      if (Object.keys(measurements).length === 0) {
        setScanResult(null);
        setScanError("The scan did not return usable numbers");
        setManualOpen(true);
        clarityEvent("bespoke_scan_empty");
        return;
      }
      setScanError(null);
      setScanResult(measurements);
      setScanSource("fitlens_client");
      setScanLocked(true);
      setForm((f) => {
        // The scan's `bridge` is the inner-canthal distance (a face
        // measurement). It must never land in ai_bridge_width_mm, which means
        // the bridge of a physical frame. The scan's temple length stays in the
        // scan payload so it cannot pollute the manual column.
        const next = {
          ...f,
          ai_face_width_mm: measurements.faceWidth != null ? String(measurements.faceWidth) : f.ai_face_width_mm,
          ai_temple_to_temple_mm:
            measurements.templeToTemple != null ? String(measurements.templeToTemple) : f.ai_temple_to_temple_mm,
          ai_inner_canthal_mm: measurements.bridge != null ? String(measurements.bridge) : f.ai_inner_canthal_mm,
          ai_pd_mm: measurements.pd != null ? String(measurements.pd) : f.ai_pd_mm,
        };
        setScanOriginal({
          ai_face_width_mm: next.ai_face_width_mm,
          ai_temple_to_temple_mm: next.ai_temple_to_temple_mm,
          ai_inner_canthal_mm: next.ai_inner_canthal_mm,
          ai_pd_mm: next.ai_pd_mm,
        });
        return next;
      });

      clarityEvent("bespoke_scan_completed");

      // Verify (or, failing that, record) the result server-side. The banner
      // upgrades itself once the server says which source it ended up as.
      void recordFitLensEvent(parsed, sessionRef, typedRef || null).then(({ source }) =>
        setScanSource(source),
      );
    },
    [sessionRef, typedRef],
  );

  useEffect(() => {
    window.addEventListener("fitlens:result", handleScanResult as EventListener);
    return () => window.removeEventListener("fitlens:result", handleScanResult as EventListener);
  }, [handleScanResult]);

  // The emailed "Measure again" link should need no typing: scroll to the
  // measurement section and open the scanner as soon as the order is loaded.
  useEffect(() => {
    if (!remeasure || !order || remeasureOpened.current) return;
    remeasureOpened.current = true;
    scanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = window.setTimeout(() => openFitLens(), 600);
    return () => window.clearTimeout(t);
  }, [remeasure, order, openFitLens]);

  // Clarity: paid customers only ever land here, so keep every session
  // (upgrade) instead of letting Clarity sample it away. No personal data.
  useEffect(() => {
    clarityEvent("bespoke_measurements_view");
    clarityUpgrade("bespoke_paid");
  }, []);

  useEffect(() => {
    if (!sid) {
      setLoading(false);
      setError("Missing order reference. Please open the link from your confirmation email.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `https://wmefczrhnsqicikveuhz.supabase.co/functions/v1/bespoke-order-get?sid=${encodeURIComponent(sid)}`,
        );
        if (res.status === 404) {
          setError("We couldn't find that order. Double-check the link from your confirmation email, or write to support@woolet.co.");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`http_${res.status}`);
        const data = (await res.json()) as OrderSummary;
        setOrder(data);
        if (data.order_ref) claritySet("bespoke_order_ref", data.order_ref);
        setForm({
          ai_face_width_mm: num(data.ai_face_width_mm),
          ai_temple_to_temple_mm: num(data.ai_temple_to_temple_mm),
          ai_bridge_width_mm: num(data.ai_bridge_width_mm),
          ai_inner_canthal_mm: num(data.ai_inner_canthal_mm ?? null),

          ai_pd_mm: num(data.ai_pd_mm),
          ai_notes: data.ai_notes ?? "",
          manual_face_width_mm: num(data.manual_face_width_mm),
          manual_temple_to_temple_mm: num(data.manual_temple_to_temple_mm),
          manual_bridge_width_mm: num(data.manual_bridge_width_mm),
          manual_pd_mm: num(data.manual_pd_mm),
          manual_temple_length_mm: num(data.manual_temple_length_mm),
          manual_head_circumference_mm: num(data.manual_head_circumference_mm),
          manual_ear_to_ear_mm: num(data.manual_ear_to_ear_mm),
          manual_notes: data.manual_notes ?? "",
        });

        // A scan already attached to this order (webhook, signed or client)
        // prefills the scan block read-only. `nose_bridge_width_mm` is the
        // inner-canthal distance, never a frame bridge — it is labelled as such
        // in the UI and carried through untouched.
        const scan = data.scan;
        if (scan && data.ai_source !== "manual") {
          const fit = scan.temple_to_temple_mm ?? scan.face_width_mm;
          const prefilled = {
            ai_face_width_mm: num(scan.face_width_mm ?? fit),
            ai_temple_to_temple_mm: num(fit),
            ai_inner_canthal_mm: num(scan.nose_bridge_width_mm),
            ai_pd_mm: num(scan.pd_mm),
          };

          setForm((f) => ({ ...f, ...prefilled }));
          setScanOriginal(prefilled);
          setScanSource((scan.source as ScanSource) ?? "fitlens_client");
          setScanLocked(true);
          setScanResult({
            faceWidth: scan.face_width_mm ?? undefined,
            templeToTemple: fit ?? undefined,
            bridge: scan.nose_bridge_width_mm ?? undefined,
            pd: scan.pd_mm ?? undefined,
          });
          setScanMono(
            scan.pd_left_mm != null || scan.pd_right_mm != null
              ? { left: scan.pd_left_mm, right: scan.pd_right_mm }
              : null,
          );
        }
        setPriorRef(data.scan?.measurement_ref ?? data.scans?.[0]?.measurement_ref ?? null);
        setShipping({
          name: data.shipping_name ?? "",
          phone: data.shipping_phone ?? "",
          line1: data.shipping_line1 ?? "",
          line2: data.shipping_line2 ?? "",
          city: data.shipping_city ?? "",
          state: data.shipping_state ?? "",
          postal_code: data.shipping_postal_code ?? "",
          country: (data.shipping_country ?? "").toUpperCase(),
        });
        if (data.measurements_submitted_at) setSubmitted(true);

      } catch (e) {
        console.error(e);
        setError("Something went wrong loading your order. Please refresh, or write to support@woolet.co.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sid]);

  const priceLabel = useMemo(
    () => (order ? formatAmount(order.amount_cents, order.currency) : ""),
    [order],
  );

  // Reading order that still owes us a strength.
  const needsStrength = Boolean(order && needsReadingStrength(order as unknown as Record<string, any>));
  const readingValid =
    !needsStrength ||
    (readingMode === "same" ? Boolean(readingStrength) : Boolean(readingLeft && readingRight));

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const [pdfBusy, setPdfBusy] = useState(false);

  const handleWorkshopPdf = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const mm = (v: string) => (v ? `${v} mm` : "");
      const { downloadWorkshopReport } = await import("@/lib/bespoke-workshop-pdf");
      await downloadWorkshopReport({
        sessionId: sid,
        orderCreatedAt: order?.created_at ?? null,
        frameName: order?.frame_name ?? null,
        frontCode: order?.front_code ?? null,
        templeCode: order?.temple_code ?? null,
        finishId: order?.finish_id ?? null,
        lensType: order ? lensWithStrength(order as unknown as Record<string, any>) : null,
        engravingText: order?.engraving_text ?? null,
        amountLabel: priceLabel,
        customerRef: order?.customer_email_masked ?? null,
        requestedTempleLength,
        aiPreviewUrl: order?.ai_preview_url ?? null,
        tryOnUrl: order?.try_on_url ?? null,
        shipping: {
          name: shipping.name || null,
          line1: shipping.line1 || null,
          line2: shipping.line2 || null,
          city: shipping.city || null,
          state: shipping.state || null,
          postalCode: shipping.postal_code || null,
          country: shipping.country || null,
          submittedAt: order?.shipping_submitted_at ?? null,
        },

        consent: order?.photo_consent
          ? {
              grantedAt: order.photo_consent.consent_at,
              withdrawnAt: order.photo_consent.consent_withdrawn_at,
              version: order.photo_consent.consent_version,
              locale: order.photo_consent.consent_locale,
            }
          : null,
        measurements: {
          ai: {
            "Face width": mm(form.ai_face_width_mm),
            "Temple-to-temple": mm(form.ai_temple_to_temple_mm),
            "Bridge width": mm(form.ai_bridge_width_mm),
            "Pupillary distance": mm(form.ai_pd_mm),
          },
          manual: {
            "Face width": mm(form.manual_face_width_mm),
            "Temple-to-temple": mm(form.manual_temple_to_temple_mm),
            "Bridge width": mm(form.manual_bridge_width_mm),
            "Pupillary distance": mm(form.manual_pd_mm),
            "Temple length": mm(form.manual_temple_length_mm),
            "Head circumference": mm(form.manual_head_circumference_mm),
            "Ear-to-ear over crown": mm(form.manual_ear_to_ear_mm),
          },
          aiNotes: form.ai_notes || null,
          manualNotes: form.manual_notes || null,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Couldn't build the workshop PDF. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError(null);
    if (!readingValid) {
      setError("Choose your reading strength to continue.");
      document.getElementById("reading-strength-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const shippingComplete =
      shipping.name.trim() &&
      shipping.phone.trim() &&
      shipping.line1.trim() &&
      shipping.city.trim() &&
      shipping.postal_code.trim() &&
      shipping.country.trim();
    if (!shippingComplete) {
      setShippingError("Add the full shipping address — name, phone, street, city, postal code and country.");
      document.getElementById("shipping-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      clarityEvent("bespoke_form_incomplete");
      return;
    }
    if (!order?.source && !isBespokeDiscoverySource(discoverySource)) {
      setError("Choose how you found Woolet before submitting.");
      document.getElementById("measurement-discovery-source")?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-measurements-submit", {
        body: {
          sid,
          source: order?.source || discoverySource,
          ai: {
            face_width_mm: form.ai_face_width_mm || null,
            temple_to_temple_mm: form.ai_temple_to_temple_mm || null,
            bridge_width_mm: form.ai_bridge_width_mm || null,
            inner_canthal_mm: form.ai_inner_canthal_mm || null,

            pd_mm: form.ai_pd_mm || null,
            notes: form.ai_notes || null,
          },
          manual: {
            face_width_mm: form.manual_face_width_mm || null,
            temple_to_temple_mm: form.manual_temple_to_temple_mm || null,
            bridge_width_mm: form.manual_bridge_width_mm || null,
            pd_mm: form.manual_pd_mm || null,
            temple_length_mm: form.manual_temple_length_mm || null,
            head_circumference_mm: form.manual_head_circumference_mm || null,
            ear_to_ear_mm: form.manual_ear_to_ear_mm || null,
            notes: form.manual_notes || null,
          },
          reading: needsStrength
            ? {
                mode: readingMode,
                strength: readingMode === "same" ? readingStrength : null,
                left: readingMode === "different" ? readingLeft : null,
                right: readingMode === "different" ? readingRight : null,
              }
            : null,
          shipping: {
            name: shipping.name,
            phone: shipping.phone,
            line1: shipping.line1,
            line2: shipping.line2 || null,
            city: shipping.city,
            state: shipping.state || null,
            postal_code: shipping.postal_code,
            country: shipping.country,
          },
          scan: scanResult
            ? {
                source: "fitlens",
                payload: scanResult,
                // How much the numbers can be trusted, carried into the
                // workshop email so Marek sees it without opening the panel.
                verification: scanSource,
                // Set when the customer overrode the scan by hand; the scan's
                // own numbers are kept so nothing is lost.
                ai_source: scanLocked ? "scan" : "manual",
                overrides: scanLocked ? null : scanOriginal,
              }
            : { source: "manual", payload: null, ai_source: "manual" },
        },
      });
      if (fnErr) throw fnErr;
      if ((data as any)?.error === "incomplete_shipping") {
        setShippingError("Add the full shipping address — name, phone, street, city, postal code and country.");
        setSubmitting(false);
        clarityEvent("bespoke_form_incomplete");
        return;
      }
      if ((data as any)?.error === "no_measurements") {
        setError("Please fill in at least one measurement before submitting.");
        setSubmitting(false);
        clarityEvent("bespoke_form_incomplete");
        return;
      }
      setOrder((o) =>
        o
          ? {
              ...o,
              shipping_name: shipping.name,
              shipping_line1: shipping.line1,
              shipping_city: shipping.city,
              shipping_postal_code: shipping.postal_code,
              shipping_country: shipping.country,
              shipping_submitted_at: new Date().toISOString(),
            }
          : o,
      );
      setSubmitted(true);
      clarityEvent("bespoke_shipping_saved");
      clarityEvent("bespoke_measurements_submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {

      console.error(err);
      setError("Couldn't save your measurements. Please try again, or email them to support@woolet.co.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Submit your measurements · Woolet Bespoke"
        description="Send your AI face-scan and manual measurements so we can cut your Woolet Bespoke frames to fit."
        noindex
      />
      <div className="min-h-screen bg-background text-cream">
        <header className="border-b border-cream/10">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
            <Link to="/en" className="text-cream text-[13px] tracking-[0.32em] uppercase font-medium">
              Woolet
            </Link>
            <span className="text-cream-dim text-[11px] uppercase tracking-[0.2em]">Bespoke · Measurements</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {loading ? (
            <div className="flex items-center gap-3 text-cream-dim">
              <Loader2 className="animate-spin" size={16} /> Loading your order…
            </div>
          ) : error && !order ? (
            <div className="rounded-md border border-cream/15 bg-cream/[0.03] p-6 text-cream-dim">
              <p>{error}</p>
              <Link to="/en/bespoke" className="mt-4 inline-block text-cream underline underline-offset-4">
                Back to Bespoke
              </Link>
            </div>
          ) : (
            <>
              <section className="mb-8">
                <p className="text-cream-dim text-[11px] uppercase tracking-[0.22em] mb-3">Thank you</p>
                <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">
                  One last step — your <em className="text-gold not-italic italic">measurements</em>.
                </h1>
                <p className="text-cream-dim mt-3 max-w-xl leading-relaxed">
                  Two things before the workshop cuts: where to ship, and your measurements -
                  twenty seconds with your phone camera.

                </p>

              </section>

              {needsStrength && !submitted && (
                <section
                  id="reading-strength-section"
                  className="rounded-md border border-gold/40 bg-gold/[0.06] p-5 sm:p-6 mb-8"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Reading strength</p>
                  <p className="text-cream-dim text-sm leading-relaxed mt-2 max-w-xl">
                    Reading lenses come in strengths from +0.75 to +4.00. The higher the number, the
                    stronger the lens. Your current reading glasses show it inside one arm or on the lens
                    sticker, e.g. +2.0. From an optician? Look for ADD or Near on your prescription.
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(["same", "different"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setReadingMode(m)}
                        aria-pressed={readingMode === m}
                        className={`min-h-[48px] px-3 text-sm border transition ${
                          readingMode === m
                            ? "border-gold text-gold bg-gold/10"
                            : "border-cream/20 text-cream-dim hover:border-cream/40"
                        }`}
                      >
                        {m === "same" ? "Same for both eyes" : "Different for each eye"}
                      </button>
                    ))}
                  </div>
                  {readingMode === "same" ? (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {READING_STRENGTHS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReadingStrength(s)}
                          aria-pressed={readingStrength === s}
                          className={`min-h-[48px] px-2 text-sm border transition ${
                            readingStrength === s
                              ? "border-gold text-gold bg-gold/10"
                              : "border-cream/20 text-cream-dim hover:border-cream/40"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {([
                        ["Left eye", readingLeft, setReadingLeft],
                        ["Right eye", readingRight, setReadingRight],
                      ] as const).map(([label, value, setter]) => (
                        <label key={label} className="block">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-cream-dim">{label}</span>
                          <select
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="mt-2 w-full min-h-[48px] border border-cream/20 bg-transparent px-3 text-sm text-cream"
                          >
                            <option value="">Choose strength</option>
                            {READING_STRENGTHS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {order && !order.source && (
                <section className="border border-cream/20 p-5 mb-8">
                  <label htmlFor="measurement-discovery-source" className="block text-sm text-cream mb-3">How did you find Woolet? *</label>
                  <select id="measurement-discovery-source" required value={discoverySource} onChange={(e) => setDiscoverySource(isBespokeDiscoverySource(e.target.value) ? e.target.value : "")} className="min-h-[48px] w-full border border-cream/20 bg-background px-3 text-cream">
                    <option value="">Select one</option>
                    {BESPOKE_DISCOVERY_SOURCES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </section>
              )}

              {order && (
                <section className="rounded-md border border-cream/12 bg-cream/[0.03] p-5 sm:p-6 mb-8">
                  <div className="flex items-baseline justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-cream-dim">Your order</p>
                      <p className="text-cream text-lg mt-1">{order.frame_name ?? "Woolet Bespoke"}</p>
                    </div>
                    {priceLabel && <p className="text-cream text-sm">{priceLabel}</p>}
                  </div>
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px]">
                    {order.front_code && <Spec label="Front" value={order.front_code} />}
                    {order.temple_code && <Spec label="Temple" value={order.temple_code} />}
                    {order.finish_id && <Spec label="Finish" value={order.finish_id} />}
                    {order.lens_type && (
                      <Spec label="Lenses" value={lensWithStrength(order as unknown as Record<string, any>)} />
                    )}
                    {order.engraving_text && <Spec label="Engraving" value={`"${order.engraving_text}"`} />}
                    {order.customer_email_masked && (
                      <div data-clarity-mask="true">
                        <Spec label="Confirmation" value={order.customer_email_masked} />
                      </div>
                    )}
                  </dl>
                  {order.ai_preview_url && (
                    <div className="mt-5 rounded bg-[#EFE9DF] p-3 flex items-center justify-center">
                      <img
                        src={order.ai_preview_url}
                        alt={`AI visualisation of your ${order.frame_name ?? "Woolet Bespoke"} configuration`}
                        className="max-h-40 object-contain"
                      />
                    </div>
                  )}
                </section>
              )}

              {submitted ? (
                <section className="rounded-md border border-gold/40 bg-gold/[0.06] p-6 text-cream">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-gold shrink-0 mt-0.5" size={20} />
                    <div>
                      <h2 className="text-lg font-medium mb-1">Measurements received</h2>
                      <p className="text-cream-dim text-sm leading-relaxed">
                        Our optician will review your build and confirm the spec by email within one
                        business day. You can resubmit this form any time before we start cutting.
                      </p>
                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        <a
                          href={`/en/bespoke/photo?sid=${encodeURIComponent(sid)}`}
                          className="inline-flex min-h-[48px] items-center justify-center bg-gold px-6 text-[12px] uppercase tracking-[0.18em] text-[#1F1B16] transition-colors hover:bg-gold-light"
                        >
                          Add a fit photo
                        </a>
                        <button
                          type="button"
                          onClick={handleWorkshopPdf}
                          disabled={pdfBusy}
                          className="inline-flex min-h-[48px] items-center justify-center gap-2 border border-cream/25 px-6 text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:border-gold hover:text-gold disabled:opacity-60"
                        >
                          {pdfBusy && <Loader2 size={14} className="animate-spin" />}
                          {pdfBusy ? "Preparing…" : "Workshop report (PDF)"}
                        </button>
                      </div>
                      <p className="mt-3 text-cream-dim text-xs leading-relaxed">
                        Optional. One photo with a bank card held to your cheek lets us double-check
                        your width and show you the frames on your own face before we cut them.
                      </p>
                      {shipping.line1 && (
                        <p data-clarity-mask="true" className="mt-4 text-cream-dim text-sm leading-relaxed">
                          Shipping to: {shipping.name}, {shipping.line1}, {shipping.city}{" "}
                          {shipping.postal_code}, {shipping.country}{" "}
                          <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="text-cream underline underline-offset-4 hover:text-gold"
                          >
                            Edit
                          </button>
                        </p>
                      )}

                      <button
                        onClick={() => setSubmitted(false)}
                        className="mt-4 block text-[11px] uppercase tracking-[0.2em] text-cream underline underline-offset-4 hover:text-gold"
                      >
                        Edit measurements
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div id="shipping-section">
                    <FieldGroup
                      icon={<Truck size={16} />}
                      title="1 · Where do we ship?"
                      hint="The courier delivers to this address. We can still change it before the frames leave the workshop."
                    >
                      <TextField
                        label="Full name"
                        value={shipping.name}
                        onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                        autoComplete="name"
                        required
                      />
                      <TextField
                        label="Phone"
                        value={shipping.phone}
                        onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                        autoComplete="tel"
                        inputMode="tel"
                        type="tel"
                        placeholder="+48 600 000 000"
                        note="With country code — for the courier."
                        required
                      />
                      <TextField
                        label="Street + number"
                        value={shipping.line1}
                        onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                        autoComplete="address-line1"
                        required
                        full
                      />
                      <TextField
                        label="Apartment / floor (optional)"
                        value={shipping.line2}
                        onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                        autoComplete="address-line2"
                        full
                      />
                      <TextField
                        label="City"
                        value={shipping.city}
                        onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                        autoComplete="address-level2"
                        required
                      />
                      <TextField
                        label="State / province (optional)"
                        value={shipping.state}
                        onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                        autoComplete="address-level1"
                      />
                      <TextField
                        label="Postal code"
                        value={shipping.postal_code}
                        onChange={(e) => setShipping((s) => ({ ...s, postal_code: e.target.value }))}
                        autoComplete="postal-code"
                        required
                      />
                      <CountryField
                        value={shipping.country}
                        onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                      />
                    </FieldGroup>
                    {shippingError && (
                      <p className="mt-4 text-sm text-red-300/90 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                        {shippingError}
                      </p>
                    )}
                  </div>

                  <section ref={scanSectionRef}>
                    <div className="flex items-center gap-2 text-cream mb-1">
                      <span className="text-gold"><ScanFace size={16} /></span>
                      <h2 className="text-lg font-medium">2 · Measure your face</h2>
                    </div>
                    {remeasure && (
                      <p className="mb-3 inline-flex rounded-sm bg-gold/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-gold">
                        Second measurement{priorRef ? ` for ${priorRef}` : ""}
                      </p>
                    )}
                    <p className="text-cream-dim text-sm mb-5 max-w-xl leading-relaxed">
                      Twenty seconds with your phone camera and any bank card. The workshop cuts to
                      these numbers.
                    </p>
                    <button
                      type="button"
                      onClick={() => openFitLens()}
                      className="inline-flex min-h-[48px] items-center justify-center bg-gold px-7 text-[12px] uppercase tracking-[0.18em] text-[#1F1B16] transition-colors hover:bg-gold-light"
                    >
                      Start the scan
                    </button>

                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs text-cream-dim underline underline-offset-4 hover:text-gold">
                        I have a measurement reference
                      </summary>
                      <input
                        type="text"
                        value={typedRef}
                        onChange={(e) => setTypedRef(e.target.value.toUpperCase())}
                        placeholder="M-7KQ4X2"
                        aria-label="Measurement reference"
                        className="mt-2 w-48 rounded-sm border border-cream/20 bg-transparent px-3 py-2 text-sm uppercase tracking-[0.12em] text-cream placeholder:text-cream-dim/50"
                      />
                      <p className="mt-1 text-[11px] leading-relaxed text-cream-dim/70">
                        Only needed if you scanned outside the link we emailed you.
                      </p>
                    </details>

                    {scanError && (
                      <p className="mt-4 text-sm text-red-300/90 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                        {scanError}. Enter them by hand below.
                      </p>
                    )}

                    {scanResult && (
                      <div className="mt-5 rounded-md border border-gold/40 bg-gold/[0.06] p-5">
                        {scanSource && (
                          <p
                            className={`mb-3 inline-flex items-center gap-2 rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${
                              scanSource === "fitlens_client"
                                ? "bg-cream/10 text-cream-dim"
                                : "bg-gold/15 text-gold"
                            }`}
                          >
                            {SCAN_SOURCE_LABEL[scanSource]}
                          </p>
                        )}
                        <p className="text-cream text-sm leading-relaxed">
                          Your scan:{" "}
                          {[
                            scanResult.templeToTemple != null &&
                              `temple-to-temple ${scanResult.templeToTemple} mm`,
                            scanResult.pd != null && `PD ${scanResult.pd} mm`,
                            scanMono?.left != null && `PD left ${scanMono.left} mm`,
                            scanMono?.right != null && `PD right ${scanMono.right} mm`,
                            scanResult.bridge != null &&
                              `inner-canthal distance ${scanResult.bridge} mm`,
                            scanResult.templeLength != null &&
                              `temple length ${scanResult.templeLength} mm`,

                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="mt-2 text-cream-dim/70 text-xs leading-relaxed">
                          The inner-canthal distance is a face measurement (eye corner to eye corner).
                          It is not the width of your nose where the frame rests, and not a frame
                          bridge. Your frame's bridge comes from the shape you chose.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setScanLocked(false);
                            setManualOpen(true);
                          }}
                          className="mt-3 block text-xs text-cream-dim underline underline-offset-4 hover:text-gold"
                        >
                          {scanLocked
                            ? "These numbers look wrong - correct manually"
                            : "Correcting by hand - the scan's own numbers are kept on the order"}
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="mt-4 inline-flex min-h-[48px] items-center justify-center gap-2 bg-cream px-6 text-[12px] uppercase tracking-[0.22em] font-medium text-ink transition hover:bg-gold disabled:opacity-60"
                        >
                          {submitting && <Loader2 size={14} className="animate-spin" />}
                          These are my numbers - send to the workshop
                        </button>
                        <p className="mt-3 text-cream-dim/80 text-xs leading-relaxed">
                          An optician checks these against your order before anything is cut.
                        </p>
                      </div>
                    )}

                    <details
                      open={manualOpen}
                      onToggle={(e) => setManualOpen((e.currentTarget as HTMLDetailsElement).open)}
                      className="mt-6 border-t border-cream/12 pt-5"
                    >
                      <summary className="cursor-pointer list-none text-cream text-sm underline underline-offset-4 hover:text-gold">
                        No camera? Enter the numbers by hand
                      </summary>

                      <div className="mt-6 space-y-8">
                        <FieldGroup
                          icon={<Sparkles size={16} />}
                          title="Scan values"
                          hint="If you already ran the scan somewhere else, paste the numbers it returned. Skip any you didn't get."
                        >
                          <Field label="Face width (mm)" value={form.ai_face_width_mm} onChange={update("ai_face_width_mm")} placeholder="e.g. 158" />
                          <Field label="Temple-to-temple (mm)" value={form.ai_temple_to_temple_mm} onChange={update("ai_temple_to_temple_mm")} placeholder="e.g. 160" />
                          <Field label="Frame bridge (mm)" value={form.ai_bridge_width_mm} onChange={update("ai_bridge_width_mm")} placeholder="e.g. 21" note="Bridge of a physical frame - not a face measurement." />
                          <Field label="Inner-canthal distance (mm)" value={form.ai_inner_canthal_mm} onChange={update("ai_inner_canthal_mm")} placeholder="e.g. 33" note="Eye corner to eye corner, a measurement of your face." />

                          <Field label="Pupillary distance / PD (mm)" value={form.ai_pd_mm} onChange={update("ai_pd_mm")} placeholder="e.g. 66" />
                          <Textarea label="AI scan notes" value={form.ai_notes} onChange={update("ai_notes")} placeholder="Anything the AI flagged (asymmetry, low confidence, etc.)" />
                        </FieldGroup>

                        <section>
                          <div className="flex items-center gap-2 text-cream mb-1">
                            <span className="text-gold"><Ruler size={16} /></span>
                            <h2 className="text-lg font-medium">Measured with a ruler</h2>
                          </div>
                          <ol className="text-cream-dim text-sm mb-5 max-w-xl leading-relaxed list-decimal pl-5 space-y-1.5">
                            <li>
                              Temple to temple: ruler flat across your face at eye level, from the soft
                              spot in front of one ear to the other.
                            </li>
                            <li>
                              Your best-fitting pair: front width outer edge to outer edge, arm from hinge
                              to tip. Put both in the notes with what is wrong with that pair.
                            </li>
                            <li>
                              Photo with a card: after you submit, add one photo with a bank card flat on
                              your forehead, glasses off, facing the camera in daylight.
                            </li>
                          </ol>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Face width (mm)" value={form.manual_face_width_mm} onChange={update("manual_face_width_mm")} placeholder="e.g. 155" />
                            <Field label="Temple-to-temple (mm)" value={form.manual_temple_to_temple_mm} onChange={update("manual_temple_to_temple_mm")} placeholder="e.g. 158" />
                            <Field
                              label="Bridge of your best-fitting glasses (mm)"
                              value={form.manual_bridge_width_mm}
                              onChange={update("manual_bridge_width_mm")}
                              placeholder="e.g. 20"
                              note="The number printed inside the arm, between the lenses - not a measurement of your nose."
                            />

                            <Field label="PD (mm)" value={form.manual_pd_mm} onChange={update("manual_pd_mm")} placeholder="e.g. 65" />
                            <Field
                              label="Temple length (mm)"
                              value={form.manual_temple_length_mm}
                              onChange={update("manual_temple_length_mm")}
                              placeholder="e.g. 145"
                              note={requestedTempleLength ? `Requested at checkout: ${requestedTempleLength}` : undefined}
                            />
                            <Field label="Head circumference (mm)" value={form.manual_head_circumference_mm} onChange={update("manual_head_circumference_mm")} placeholder="e.g. 580" />
                            <Field label="Ear-to-ear over crown (mm)" value={form.manual_ear_to_ear_mm} onChange={update("manual_ear_to_ear_mm")} placeholder="e.g. 200" />
                            <Textarea label="Notes for the workshop" value={form.manual_notes} onChange={update("manual_notes")} placeholder="Preferred fit (snug / relaxed), sensitivities, current frame model that fits well…" />
                          </div>
                        </section>
                      </div>
                    </details>
                  </section>



                  {error && (
                    <p className="text-sm text-red-300/90 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 bg-cream text-ink px-6 py-3 text-[12px] uppercase tracking-[0.22em] font-medium rounded-sm hover:bg-gold transition disabled:opacity-60"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      {submitting ? "Sending…" : "Submit measurements"}
                    </button>
                    <p className="text-cream-dim/70 text-[11px]">
                      You can resubmit this form later; we use the latest values.
                    </p>
                  </div>
                </form>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-cream-dim">{label}</dt>
      <dd className="text-cream mt-0.5 truncate">{value}</dd>
    </div>
  );
}

function FieldGroup({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 text-cream mb-1">
        <span className="text-gold">{icon}</span>
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <p className="text-cream-dim text-sm mb-5 max-w-xl leading-relaxed">{hint}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  note,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  note?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-cream-dim mb-1.5">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-cream/[0.04] border border-cream/15 rounded-sm px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold/60 transition"
      />
      {note && <span className="block text-[11px] text-gold-light/80 mt-1.5">{note}</span>}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  note,
  autoComplete,
  inputMode,
  type = "text",
  required,
  full,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  note?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel";
  type?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] uppercase tracking-[0.16em] text-cream-dim mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        className="w-full min-h-[48px] bg-cream/[0.04] border border-cream/15 rounded-sm px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold/60 transition"
      />
      {note && <span className="block text-[11px] text-cream-dim/80 mt-1.5">{note}</span>}
    </label>
  );
}

function CountryField({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-cream-dim mb-1.5">Country</span>
      <select
        value={value}
        onChange={onChange}
        autoComplete="country"
        required
        className="w-full min-h-[48px] bg-cream/[0.04] border border-cream/15 rounded-sm px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold/60 transition"
      >
        <option value="">Select a country</option>
        {COUNTRY_CODES.map((code) => (
          <option key={code} value={code} className="text-ink">
            {countryLabel(code)}
          </option>
        ))}
      </select>
    </label>
  );
}


function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-cream-dim mb-1.5">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-cream/[0.04] border border-cream/15 rounded-sm px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold/60 transition resize-none"
      />
    </label>
  );
}
