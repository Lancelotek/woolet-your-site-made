import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Camera, CheckCircle2, CreditCard, Glasses, Loader2, Ruler, Sparkles, Truck, Upload } from "lucide-react";
import SEO from "@/components/SEO";
import CardPhotoCapture from "@/components/bespoke/CardPhotoCapture";
import type { CardCheck } from "@/lib/card-photo-check";
import { COUNTRY_CODES, countryLabel } from "@/data/shipping-countries";
import { supabase } from "@/integrations/supabase/client";
import { STORAGE_KEY } from "@/lib/bespoke-state";
import { READING_STRENGTHS } from "@/data/bespoke-options";
import { lensWithStrength, needsReadingStrength } from "@/lib/bespoke-gaps";
import { clarityEvent, claritySet, clarityUpgrade } from "@/lib/clarity";
import type { FitLensMeasurements } from "@/lib/fitlens-result";
import { SCAN_SOURCE_LABEL, type ScanSource } from "@/lib/fitlens-verify";
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
  lens_tint_code?: string | null;
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
    has_profile?: boolean;
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


// The fit photo replaces the camera scan (11.11.2026): one photo with a
// bank-size card for scale, plus the numbers printed on the buyer's current
// glasses. The workshop measures from the photo; nothing is computed here.
const PHOTO_CONSENT_VERSION = "bespoke-photo-v3";

// Shown verbatim above the send button and stored byte for byte with the photo.
const PHOTO_CONSENT_TEXT =
  "I agree that JAY23 LLC (Woolet) stores this photograph of my face and the measurements I entered, and shares them with its manufacturing partner in the EU for the sole purpose of measuring, producing and verifying my bespoke frame. The photograph is deleted 90 days after delivery. I can withdraw this consent at any time at support@woolet.co; withdrawal stops production of the frame.";

/** Longest edge of the photo we store. Enough to read the card and the face. */
const PHOTO_MAX_PX = 2400;

/** First line of the workshop notes: lens width has no column of its own. */
const GLASSES_NOTE_RE = /^Current glasses[^\n]*\n?/;
const NO_GLASSES_NOTE = "Current glasses: no numbers given - measure from the photo with the card.";

/** Re-encode as a JPEG no larger than PHOTO_MAX_PX. Also drops EXIF (location). */
async function photoToJpeg(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode_failed"));
      el.src = url;
    });
    const scale = Math.min(1, PHOTO_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode_failed"))), "image/jpeg", 0.9),
    );
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const PHOTO_TIPS = [
  "Glasses off, face the camera straight on, both ears visible.",
  "Hold the card flat against your cheek, long edge level, the whole card in the picture.",
  "Turn the card so no numbers show - or use a loyalty, gift or ID-size card.",
  "Daylight from the front, camera at eye height, arm's length away. Do not crop it.",
];

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
  // Arrives from the "Correct my numbers" button in the measurement summary email.
  const remeasure = params.get("remeasure") === "1";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  // The fit photo with a card is required for every Bespoke order: the card
  // gives the workshop a true scale. A side photo is optional.
  // "bespoke-photo-v1" without a side photo is also what an upload that never
  // finished leaves behind, so it does not count as a photo on file.
  const hasFitPhoto = Boolean(
    order?.photo_consent &&
      !order.photo_consent.consent_withdrawn_at &&
      (order.photo_consent.has_profile || order.photo_consent.consent_version !== "bespoke-photo-v1"),
  );
  const photoHref = `/en/bespoke/photo?sid=${encodeURIComponent(sid)}`;
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
  const scanSectionRef = useRef<HTMLElement | null>(null);

  // Fit photo, held in the browser until the buyer sends the form.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  /** Open camera / photo check: the live camera, or a chosen file under review. */
  const [capture, setCapture] = useState<"camera" | File | null>(null);
  const [photoCheck, setPhotoCheck] = useState<CardCheck["status"] | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  /** Lens width printed on the current glasses (the first of the three numbers). */
  const [glassesLens, setGlassesLens] = useState("");

  const onPhotoFile = (file: File) => {
    setPhotoError(null);
    if (!file.type.startsWith("image/")) {
      setPhotoError("That file is not a photo. Choose a JPG or PNG, or take the photo with your camera.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    clarityEvent("bespoke_photo_attached");
  };
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  // The emailed "Correct my numbers" link lands on the measurement section.
  useEffect(() => {
    if (!remeasure || !order) return;
    scanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [remeasure, order]);

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
          manual_notes: (data.manual_notes ?? "").replace(GLASSES_NOTE_RE, ""),
        });
        setGlassesLens((data.manual_notes ?? "").match(/^Current glasses: lens (\d+(?:\.\d+)?)/)?.[1] ?? "");

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
        lensTint: order?.lens_tint_code ? (order.lens_type?.match(/([^()]+ \((?:SUN|PH)-[A-Z0-9]+\))$/)?.[1]?.trim() ?? order.lens_tint_code) : null,
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
    if (!hasFitPhoto && !photoFile) {
      setPhotoError("Add your photo with a card - the workshop measures your face from it.");
      scanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      clarityEvent("bespoke_form_incomplete");
      return;
    }
    setSubmitting(true);
    setError(null);
    setPhotoError(null);

    // 1. The photo. Sending the form is the consent - see PHOTO_CONSENT_TEXT.
    if (photoFile) {
      try {
        const jpeg = await photoToJpeg(photoFile);
        const { data: signed, error: signErr } = await supabase.functions.invoke("bespoke-photo-upload-url", {
          body: { sid },
        });
        const target = signed?.uploads?.photo;
        if (signErr || !target) throw new Error("upload_url_failed");
        const { error: upErr } = await supabase.storage
          .from("bespoke-photos")
          .uploadToSignedUrl(target.path, target.token, jpeg.blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { error: subErr } = await supabase.functions.invoke("bespoke-photo-submit", {
          body: {
            sid,
            consentGiven: true,
            consentText: PHOTO_CONSENT_TEXT,
            consentVersion: PHOTO_CONSENT_VERSION,
            locale: "en",
            photoPath: target.path,
            photoWidthPx: jpeg.width,
            photoHeightPx: jpeg.height,
          },
        });
        if (subErr) throw subErr;
        const now = new Date().toISOString();
        setOrder((o) =>
          o
            ? {
                ...o,
                photo_consent: {
                  consent_at: now,
                  consent_withdrawn_at: null,
                  consent_version: PHOTO_CONSENT_VERSION,
                  consent_locale: "en",
                  has_profile: o.photo_consent?.has_profile ?? false,
                },
              }
            : o,
        );
        setPhotoFile(null);
        clarityEvent("bespoke_photo_uploaded");
      } catch (err) {
        console.error("[bespoke-measurements:photo]", err);
        const decode = err instanceof Error && err.message === "decode_failed";
        setPhotoError(
          decode
            ? "We could not open that photo. Take it with your camera, or choose a JPG or PNG."
            : "We could not save your photo. Please try again, or email it to support@woolet.co.",
        );
        scanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        setSubmitting(false);
        return;
      }
    }

    // 2. The numbers. Lens width has no column, so it leads the workshop notes.
    const glassesNumbers = [
      glassesLens && `lens ${glassesLens}`,
      form.manual_bridge_width_mm && `bridge ${form.manual_bridge_width_mm}`,
      form.manual_temple_length_mm && `temple ${form.manual_temple_length_mm}`,
    ].filter(Boolean);
    const glassesNote = glassesNumbers.length ? `Current glasses: ${glassesNumbers.join(" · ")} mm` : NO_GLASSES_NOTE;
    const workshopNotes = [glassesNote, form.manual_notes.trim()].filter(Boolean).join("\n");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-measurements-submit", {
        body: {
          sid,
          // Optional: an unanswered question never blocks the form.
          source: order?.source || discoverySource || null,
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
            notes: workshopNotes,
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
        description="Send your photo with a card and the numbers from your current glasses so we can cut your Woolet Bespoke frames to fit."
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
                  Three things before the workshop cuts: where to ship, one photo with a card, and
                  the numbers printed on your current glasses.

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
                  <label htmlFor="measurement-discovery-source" className="block text-sm text-cream mb-3">How did you find Woolet? <span className="text-cream-dim">(optional)</span></label>
                  <select id="measurement-discovery-source" value={discoverySource} onChange={(e) => setDiscoverySource(isBespokeDiscoverySource(e.target.value) ? e.target.value : "")} className="min-h-[48px] w-full border border-cream/20 bg-background px-3 text-cream">
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
                      {!hasFitPhoto && (
                        <p className="mt-4 rounded-sm border border-gold/60 bg-gold/10 px-4 py-3 text-sm text-cream leading-relaxed">
                          <strong className="text-gold">One step left - required.</strong> We still need
                          your photo with a bank card held flat against your cheek. We start cutting only
                          after it arrives.{" "}
                          <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="underline underline-offset-4 hover:text-gold"
                          >
                            Add the photo
                          </button>
                        </p>
                      )}
                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
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
                      {hasFitPhoto && (
                        <p className="mt-3 text-cream-dim text-xs leading-relaxed">
                          Photo received. Optional: a{" "}
                          <a href={photoHref} className="text-cream underline underline-offset-4 hover:text-gold">
                            side photo
                          </a>{" "}
                          shows us how high your nose bridge sits.
                        </p>
                      )}
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
                      <span className="text-gold"><CreditCard size={16} /></span>
                      <h2 className="text-lg font-medium">2 · Photo with a card</h2>
                    </div>
                    {remeasure && (
                      <p className="mb-3 inline-flex rounded-sm bg-gold/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-gold">
                        Second measurement{priorRef ? ` for ${priorRef}` : ""}
                      </p>
                    )}
                    <p className="text-cream-dim text-sm mb-5 max-w-xl leading-relaxed">
                      One photo, straight on, with any bank-size card flat against your cheek. Every
                      such card is 85.6 mm wide, so the workshop reads the true width of your face
                      from it.
                    </p>

                    <figure className="flex flex-col gap-4 border border-cream/12 bg-cream/[0.03] p-4 sm:flex-row sm:items-center">
                      <img
                        src="/images/bespoke/fit-photo-example.webp"
                        width={720}
                        height={894}
                        loading="lazy"
                        alt="Example photo: a man looks straight at the camera and holds a plain bank-size card flat against his cheek, long edge level, no card numbers visible."
                        className="w-full max-w-[200px] self-center"
                      />
                      <figcaption>
                        <span className="block text-[11px] uppercase tracking-[0.18em] text-gold">Like this</span>
                        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-cream-dim">
                          {PHOTO_TIPS.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </figcaption>
                    </figure>

                    {photoPreview ? (
                      <div className="mt-5 flex items-center gap-4">
                        <img
                          src={photoPreview}
                          alt="Your photo, ready to send"
                          data-clarity-mask="true"
                          className="h-28 w-24 border border-gold/40 object-cover"
                        />
                        <div>
                          <p className="flex items-center gap-2 text-sm text-cream">
                            <CheckCircle2 size={16} className="text-gold" />{" "}
                            {photoCheck === "card" ? "Photo attached - card detected" : "Photo attached"}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-cream-dim">
                            It stays on your device until you send the form below.
                          </p>
                          <button
                            type="button"
                            onClick={() => setCapture("camera")}
                            className="mt-2 block text-xs text-cream underline underline-offset-4 hover:text-gold"
                          >
                            Retake the photo
                          </button>
                          <button
                            type="button"
                            onClick={() => uploadRef.current?.click()}
                            className="mt-2 block text-xs text-cream underline underline-offset-4 hover:text-gold"
                          >
                            Upload a different photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {hasFitPhoto && (
                          <p className="mt-5 flex items-center gap-2 text-sm text-cream">
                            <CheckCircle2 size={16} className="text-gold" /> We already have your photo.
                            Add a new one only to replace it.
                          </p>
                        )}
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => setCapture("camera")}
                            className={`inline-flex min-h-[48px] items-center justify-center gap-2 px-7 text-[12px] uppercase tracking-[0.18em] transition-colors ${
                              hasFitPhoto
                                ? "border border-cream/25 text-cream hover:border-gold hover:text-gold"
                                : "bg-gold text-[#1F1B16] hover:bg-gold-light"
                            }`}
                          >
                            <Camera size={15} aria-hidden /> Take the photo
                          </button>
                          <button
                            type="button"
                            onClick={() => uploadRef.current?.click()}
                            className="inline-flex min-h-[48px] items-center justify-center gap-2 border border-cream/25 px-7 text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:border-gold hover:text-gold"
                          >
                            <Upload size={15} aria-hidden /> Upload a photo
                          </button>
                        </div>
                      </>
                    )}
                    <input
                      ref={uploadRef}
                      type="file"
                      accept="image/*"
                      aria-label="Upload the photo with a card"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (!f) return;
                        if (!f.type.startsWith("image/")) return onPhotoFile(f);
                        setPhotoError(null);
                        setCapture(f);
                      }}
                    />
                    {capture && (
                      <CardPhotoCapture
                        // A new file is a new review.
                        key={capture === "camera" ? "camera" : `${capture.name}-${capture.lastModified}`}
                        source={capture}
                        onClose={() => setCapture(null)}
                        onUploadInstead={() => {
                          setCapture(null);
                          uploadRef.current?.click();
                        }}
                        onAccept={(photo, check) => {
                          setCapture(null);
                          setPhotoCheck(check.status);
                          onPhotoFile(photo);
                        }}
                      />
                    )}
                    {photoError && (
                      <p role="alert" className="mt-4 text-sm text-red-300/90 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                        {photoError}
                      </p>
                    )}

                    <div className="mt-10 flex items-center gap-2 text-cream mb-1">
                      <span className="text-gold"><Glasses size={16} /></span>
                      <h2 className="text-lg font-medium">3 · The numbers on your current glasses</h2>
                    </div>
                    <p className="text-cream-dim text-sm mb-5 max-w-xl leading-relaxed">
                      Look inside the arm of the glasses that fit you best. Three numbers are printed
                      there, for example <span className="text-cream">54 □ 20 150</span>: lens width,
                      bridge and arm length, in millimetres. No glasses, or the print has worn off?
                      Leave these empty.
                    </p>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                      <Field label="Lens width" value={glassesLens} onChange={(e) => setGlassesLens(e.target.value)} placeholder="54" />
                      <Field label="Bridge" value={form.manual_bridge_width_mm} onChange={update("manual_bridge_width_mm")} placeholder="20" />
                      <Field label="Arm length" value={form.manual_temple_length_mm} onChange={update("manual_temple_length_mm")} placeholder="150" />
                    </div>
                    {requestedTempleLength && (
                      <p className="mt-2 text-[11px] leading-relaxed text-cream-dim/70">
                        Arm length you asked for at checkout: {requestedTempleLength}
                      </p>
                    )}

                    {scanError && (
                      <p className="mt-4 text-sm text-red-300/90 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                        {scanError}.
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
                          Camera scan already on this order:{" "}
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
                        <p className="mt-3 text-cream-dim/80 text-xs leading-relaxed">
                          The workshop checks it against your photo before anything is cut.
                        </p>
                      </div>
                    )}

                    <details
                      id="bespoke-manual-measure"
                      open={manualOpen}
                      onToggle={(e) => setManualOpen((e.currentTarget as HTMLDetailsElement).open)}
                      className="mt-6 border-t border-cream/12 pt-5"
                    >
                      <summary className="cursor-pointer list-none text-cream text-sm underline underline-offset-4 hover:text-gold">
                        Measured yourself with a ruler? Add more numbers (optional)
                      </summary>

                      <div className="mt-6 space-y-8">
                        <FieldGroup
                          icon={<Sparkles size={16} />}
                          title="Numbers from a fit scan"
                          hint="Only if you already have numbers from a face scan or an optician. Skip any you do not have."
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
                          </ol>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Face width (mm)" value={form.manual_face_width_mm} onChange={update("manual_face_width_mm")} placeholder="e.g. 155" />
                            <Field label="Temple-to-temple (mm)" value={form.manual_temple_to_temple_mm} onChange={update("manual_temple_to_temple_mm")} placeholder="e.g. 158" />
                            <Field label="PD (mm)" value={form.manual_pd_mm} onChange={update("manual_pd_mm")} placeholder="e.g. 65" />
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

                  <div>
                    {photoFile && (
                      <div className="mb-4 max-w-xl border border-cream/12 bg-cream/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Your consent</p>
                        <p className="mt-2 text-xs leading-relaxed text-cream-dim">{PHOTO_CONSENT_TEXT}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-[48px] items-center gap-2 bg-cream text-[#1F1B16] px-6 py-3 text-[12px] uppercase tracking-[0.22em] font-medium rounded-sm hover:bg-gold transition disabled:opacity-60"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      {submitting ? "Sending…" : photoFile ? "Agree & send to the workshop" : "Send to the workshop"}
                    </button>
                    <p className="mt-3 text-cream-dim/70 text-[11px] leading-relaxed">
                      {photoFile
                        ? "Tapping the button gives the consent above. Nothing is sent before that."
                        : hasFitPhoto
                          ? "You can send this form again later; we use the latest values."
                          : "Add your photo with a card above to send."}
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
          <option key={code} value={code} className="text-[#1F1B16]">
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
