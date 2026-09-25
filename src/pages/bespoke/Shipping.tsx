import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRY_CODES, countryLabel } from "@/data/shipping-countries";

type OrderInfo = Record<string, string | null>;
type Fields = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const EMPTY: Fields = { name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "" };

const FIELD_ERRORS: Record<string, string> = {
  name: "full name",
  phone: "phone with country code (starting with +)",
  line1: "street and number",
  city: "city",
  postal_code: "postal code",
  country: "country",
  consent: "consent",
};

const inputCls =
  "w-full min-h-[48px] bg-cream/[0.04] border border-cream/15 rounded-sm px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold/60 transition";

export default function BespokeShipping() {
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "";
  const token = params.get("t") ?? "";

  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [consentText, setConsentText] = useState("");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<OrderInfo | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!ref || !token) {
        setInvalid(true);
        setLoading(false);
        return;
      }
      const { data } = await supabase.functions.invoke("bespoke-shipping-form", { body: { action: "get", ref, t: token } });
      if (!alive) return;
      const o = (data as { order?: OrderInfo } | null)?.order;
      if (!o) {
        setInvalid(true);
      } else {
        setOrder(o);
        setConsentText((data as { consent_text: string }).consent_text);
        setFields({
          name: o.shipping_name || o.customer_name || "",
          phone: o.shipping_phone || "",
          line1: o.shipping_line1 || "",
          line2: o.shipping_line2 || "",
          city: o.shipping_city || "",
          state: o.shipping_state || "",
          postal_code: o.shipping_postal_code || "",
          country: o.shipping_country || "",
        });
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [ref, token]);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-shipping-form", {
        body: { action: "save", ref, t: token, consent: true, fields },
      });
      const payload = data as { ok?: boolean; order?: OrderInfo; error?: string; fields?: string[] } | null;
      if (payload?.ok && payload.order) {
        setSaved(payload.order);
        window.scrollTo({ top: 0 });
        return;
      }
      let code = payload?.error;
      let bad = payload?.fields;
      if (!code && fnErr && "context" in fnErr) {
        const body = await (fnErr as { context: Response }).context.json().catch(() => null);
        code = body?.error;
        bad = body?.fields;
      }
      if (code === "validation" && bad?.length) {
        setError(`Please check: ${bad.map((f) => FIELD_ERRORS[f] ?? f).join(", ")}.`);
      } else if (code === "rate_limited") {
        setError("Too many attempts. Please wait an hour, or email support@woolet.co.");
      } else {
        setError("We couldn't save your address. Please try again, or email support@woolet.co.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const caseNo = order?.case_no ?? ref;
  const summary = [order?.frame_name, order?.front_code].filter(Boolean).join(" · ");

  return (
    <>
      <SEO title="Shipping address · Woolet Bespoke" description="Confirm where we ship your Woolet Bespoke frame." noindex />
      <div className="min-h-screen bg-background text-cream">
        <header className="border-b border-cream/10">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
            <Link to="/en" className="text-cream text-[13px] tracking-[0.32em] uppercase font-medium">
              Woolet
            </Link>
            <span className="text-cream-dim text-[11px] uppercase tracking-[0.2em]">Bespoke · Shipping</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {loading ? (
            <div className="flex items-center gap-3 text-cream-dim">
              <Loader2 className="animate-spin" size={16} /> Loading your order…
            </div>
          ) : invalid ? (
            <div className="rounded-sm border border-cream/15 bg-cream/[0.03] p-6 text-cream-dim">
              This link is not valid - reply to your Woolet email.
            </div>
          ) : saved ? (
            <section>
              <CheckCircle2 className="text-gold mb-4" size={28} />
              <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">
                Thank you - your shipping address for order <span className="text-gold">{caseNo}</span> is saved.
              </h1>
              <address className="not-italic mt-8 border border-cream/10 bg-cream/[0.03] rounded-sm p-5 text-cream leading-relaxed text-sm">
                {saved.shipping_name}
                <br />
                {saved.shipping_line1}
                {saved.shipping_line2 ? <><br />{saved.shipping_line2}</> : null}
                <br />
                {[saved.shipping_postal_code, saved.shipping_city].filter(Boolean).join(" ")}
                {saved.shipping_state ? `, ${saved.shipping_state}` : ""}
                <br />
                {saved.shipping_country ? countryLabel(saved.shipping_country) : ""}
                <br />
                <span className="text-cream-dim">{saved.shipping_phone}</span>
              </address>
              <p className="text-cream-dim text-sm mt-5 leading-relaxed">
                Need to change something? Open this link again and resubmit - the latest address is the one we use.
              </p>
              <button
                type="button"
                onClick={() => setSaved(null)}
                className="mt-6 text-[11px] uppercase tracking-[0.18em] text-gold border border-gold/45 rounded-[2px] px-4 py-3 hover:border-gold transition"
              >
                Edit address
              </button>
            </section>
          ) : (
            <>
              <section className="mb-8">
                <p className="text-cream-dim text-[11px] uppercase tracking-[0.22em] mb-3">Woolet Bespoke</p>
                <div className="border border-gold/30 bg-gold/[0.04] rounded-sm px-4 py-3 mb-6">
                  <div className="font-mono text-gold text-base tracking-[0.06em]">Order {caseNo}</div>
                  {summary && <div className="text-cream-dim text-sm mt-0.5">{summary}</div>}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">
                  Where do we ship your <em className="text-gold italic">frame</em>?
                </h1>
              </section>

              <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
                <Text label="Full name" value={fields.name} onChange={set("name")} autoComplete="name" required full />
                <Text
                  label="Phone with country code"
                  value={fields.phone}
                  onChange={set("phone")}
                  autoComplete="tel"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  note="The courier needs it."
                  required
                  full
                />
                <Text label="Street + number" value={fields.line1} onChange={set("line1")} autoComplete="address-line1" required full />
                <Text label="Apartment / floor (optional)" value={fields.line2} onChange={set("line2")} autoComplete="address-line2" full />
                <Text label="City" value={fields.city} onChange={set("city")} autoComplete="address-level2" required />
                <Text label="State / province (optional)" value={fields.state} onChange={set("state")} autoComplete="address-level1" />
                <Text label="Postal code" value={fields.postal_code} onChange={set("postal_code")} autoComplete="postal-code" required />
                <label className="block">
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-cream-dim mb-1.5">Country</span>
                  <select value={fields.country} onChange={set("country")} autoComplete="country" required className={inputCls}>
                    <option value="">Select a country</option>
                    {COUNTRY_CODES.map((code) => (
                      <option key={code} value={code} className="text-ink">
                        {countryLabel(code)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sm:col-span-2 flex items-start gap-3 mt-4 text-sm text-cream-dim leading-relaxed cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--gold))]"
                  />
                  <span>
                    {consentText}{" "}
                    <Link to="/en/privacy-policy" target="_blank" className="text-gold-light underline underline-offset-4">
                      Privacy policy
                    </Link>
                  </span>
                </label>

                {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}

                <div className="sm:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={!consent || submitting}
                    className="w-full sm:w-auto min-h-[48px] bg-gold text-ink px-7 py-3 rounded-[2px] text-[12px] uppercase tracking-[0.18em] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-light transition"
                  >
                    {submitting ? "Saving…" : "Confirm shipping address"}
                  </button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function Text({
  label, value, onChange, autoComplete, type = "text", placeholder, note, required, full,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  type?: string;
  placeholder?: string;
  note?: string;
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
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        inputMode={type === "tel" ? "tel" : undefined}
        className={inputCls}
      />
      {note && <span className="block text-[11px] text-gold-light/80 mt-1.5">{note}</span>}
    </label>
  );
}
