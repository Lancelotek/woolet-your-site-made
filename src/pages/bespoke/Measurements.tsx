import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Ruler, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { STORAGE_KEY } from "@/lib/bespoke-state";

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
  customer_email_masked: string | null;
  frame_name: string | null;
  front_code: string | null;
  temple_code: string | null;
  finish_id: string | null;
  lens_type: string | null;
  engraving_text: string | null;
  amount_cents: number | null;
  currency: string | null;
  ai_preview_url: string | null;
  measurements_submitted_at: string | null;
  ai_face_width_mm: number | null;
  ai_temple_to_temple_mm: number | null;
  ai_bridge_width_mm: number | null;
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
};

type FormState = {
  ai_face_width_mm: string;
  ai_temple_to_temple_mm: string;
  ai_bridge_width_mm: string;
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        setForm({
          ai_face_width_mm: num(data.ai_face_width_mm),
          ai_temple_to_temple_mm: num(data.ai_temple_to_temple_mm),
          ai_bridge_width_mm: num(data.ai_bridge_width_mm),
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

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-measurements-submit", {
        body: {
          sid,
          ai: {
            face_width_mm: form.ai_face_width_mm || null,
            temple_to_temple_mm: form.ai_temple_to_temple_mm || null,
            bridge_width_mm: form.ai_bridge_width_mm || null,
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
        },
      });
      if (fnErr) throw fnErr;
      if ((data as any)?.error === "no_measurements") {
        setError("Please fill in at least one measurement before submitting.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
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
                  Bespoke is only Bespoke when it fits you. Submit your AI scan values, your
                  manual measurements, or both — the workshop uses the tighter of the two before cutting.
                </p>
              </section>

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
                    {order.lens_type && <Spec label="Lenses" value={order.lens_type} />}
                    {order.engraving_text && <Spec label="Engraving" value={`"${order.engraving_text}"`} />}
                    {order.customer_email_masked && <Spec label="Confirmation" value={order.customer_email_masked} />}
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
                      <button
                        onClick={() => setSubmitted(false)}
                        className="mt-4 text-[11px] uppercase tracking-[0.2em] text-cream underline underline-offset-4 hover:text-gold"
                      >
                        Edit measurements
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <FieldGroup
                    icon={<Sparkles size={16} />}
                    title="AI face-scan values"
                    hint="If you used the AI scan during checkout, paste the numbers it returned. Skip any you didn't get."
                  >
                    <Field label="Face width (mm)" value={form.ai_face_width_mm} onChange={update("ai_face_width_mm")} placeholder="e.g. 158" />
                    <Field label="Temple-to-temple (mm)" value={form.ai_temple_to_temple_mm} onChange={update("ai_temple_to_temple_mm")} placeholder="e.g. 160" />
                    <Field label="Bridge width (mm)" value={form.ai_bridge_width_mm} onChange={update("ai_bridge_width_mm")} placeholder="e.g. 21" />
                    <Field label="Pupillary distance / PD (mm)" value={form.ai_pd_mm} onChange={update("ai_pd_mm")} placeholder="e.g. 66" />
                    <Textarea label="AI scan notes" value={form.ai_notes} onChange={update("ai_notes")} placeholder="Anything the AI flagged (asymmetry, low confidence, etc.)" />
                  </FieldGroup>

                  <FieldGroup
                    icon={<Ruler size={16} />}
                    title="Manual measurements"
                    hint="Measured with a ruler or your current glasses. These help the optician cross-check the AI values."
                  >
                    <Field label="Face width (mm)" value={form.manual_face_width_mm} onChange={update("manual_face_width_mm")} placeholder="e.g. 155" />
                    <Field label="Temple-to-temple (mm)" value={form.manual_temple_to_temple_mm} onChange={update("manual_temple_to_temple_mm")} placeholder="e.g. 158" />
                    <Field label="Bridge width (mm)" value={form.manual_bridge_width_mm} onChange={update("manual_bridge_width_mm")} placeholder="e.g. 20" />
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
                  </FieldGroup>

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
