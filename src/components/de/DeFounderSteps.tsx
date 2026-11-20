import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DeReservationCta from "@/components/de/DeReservationCta";
import { ReserveCheckoutButton } from "@/components/ReserveCheckoutButton";
import { DE_PRICING, formatDePrice, isDeReserved } from "@/content/de/pricing";
import { isKickstarterLive, isReservationOpen } from "@/config/kickstarter";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import { pushGtmEvent } from "@/lib/gtm";
import { buildLeadAttribution } from "@/lib/meta-capi";

/**
 * German twin of the English signup LP form (20.11.2026): step 1 collects the
 * email (MailerLite group "Woolet VIP DE"), step 2 opens the embedded 1 € Stripe
 * checkout on the page (create-checkout, founding_member_deposit_1eur). Same
 * order as /en/lp/kickstarter: email first, payment second.
 */
const STEPS = ["Deine E-Mail", `${formatDePrice(DE_PRICING.founderPriceEur)} sichern`];

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {STEPS.map((label, i) => {
        const index = i + 1;
        const done = step > index;
        const active = step === index;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center font-body text-[11px] font-semibold ${
                active || done ? "border border-primary bg-primary text-primary-foreground" : "border border-border-sub text-cream-dim"
              }`}
            >
              {done ? "✓" : index}
            </span>
            <span className={`whitespace-nowrap font-body text-[11px] uppercase tracking-[0.14em] ${active ? "text-foreground" : "text-cream-dim opacity-70"}`}>
              {label}
            </span>
            <span className={`h-px flex-1 ${done ? "bg-primary" : "bg-border-sub"}`} />
          </div>
        );
      })}
    </div>
  );
}

export default function DeFounderSteps({ placement, className }: { placement: string; className?: string }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [reserved, setReserved] = useState(false);
  useEffect(() => setReserved(isDeReserved()), []);

  // Reservation closed: the shared CTA shows the live campaign link instead.
  if (isKickstarterLive() && !isReservationOpen()) {
    return <DeReservationCta source={placement} className={className} />;
  }

  if (reserved) {
    return (
      <p className={`font-body text-sm text-primary ${className ?? ""}`}>
        ✓ Du hast reserviert - Founder-Preis {formatDePrice(DE_PRICING.founderPriceEur)} gesichert
      </p>
    );
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!consent || loading) return;
    setLoading(true);
    setError(null);
    try {
      const leadAttribution = buildLeadAttribution();
      const metaEventId = leadAttribution.meta_event_id;
      const { data, error: functionError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          ...getAttribution(), ...leadAttribution, email, source: "DE", country: "Germany", country_code: "DE",
          utm_source: "de-landing", utm_campaign: "de-seo", utm_content: placement,
          meta_event_id: metaEventId, form_location: `de_${placement}`,
        },
      });
      if (functionError) throw functionError;
      if (data && !data.success) throw new Error(data.error || "Anmeldung fehlgeschlagen");
      pushGtmEvent("waitlist_signup", { form_location: `de_${placement}`, market: "de", event_id: metaEventId, is_new_lead: data?.is_new !== false });
      const w = window as unknown as { dataLayer?: unknown[] };
      w.dataLayer = w.dataLayer || [];
      if (data?.is_new !== false) w.dataLayer.push({
        event: "meta_lead", meta_event_name: "Lead", event_id: metaEventId,
        content_name: "de_vip", content_category: "waitlist", source: "DE", form_location: `de_${placement}`,
      });
      setStep(2);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/de/danke?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : "https://woolet.co/de/danke?paid=1&session_id={CHECKOUT_SESSION_ID}";

  if (step === 2) {
    return (
      <div className={`w-full max-w-xl text-left ${className ?? ""}`}>
        <StepBar step={2} />
        <p className="font-body text-[15px] leading-7 text-foreground">
          Du stehst auf der Liste. Jetzt sicherst du dir mit 1 € den Founder-Preis: {formatDePrice(DE_PRICING.founderPriceEur)} statt {formatDePrice(DE_PRICING.regularPriceEur)}.
        </p>
        {/* Same embedded Stripe checkout and event names as the English LP, so the
            existing GTM tags (Meta, GA4, Google Ads) cover the German reservation too. */}
        <ReserveCheckoutButton
          id={`de-reserve-${placement}`}
          lang="de"
          label={`Für ${formatDePrice(DE_PRICING.reservationEur)} reservieren`}
          priceId={DE_PRICING.reservationCheckoutPriceId}
          customerEmail={email}
          returnUrl={returnUrl}
          metadata={{
            campaign: "de_vip",
            form_location: `de_${placement}`,
            recommended_sku: "de_reservation_1eur",
            market: "de",
            utm_source: getAttribution().utm_source || "de-landing",
            utm_medium: getAttribution().utm_medium || "",
            utm_campaign: getAttribution().utm_campaign || "de-seo",
          }}
          clickEvent="kickstarter_reserve_click"
          readyEvent="kickstarter_reserve_modal_ready"
          errorEvent="kickstarter_reserve_error"
          eventParams={{ form_location: `de_${placement}`, source: "de-landing", market: "de" }}
          className="mt-4 h-auto w-full rounded-sm py-4 text-xs font-semibold uppercase tracking-[0.22em]"
        />
        <div className="mt-3 flex flex-col gap-1 font-body text-[13px] leading-5 text-cream-dim">
          <span>Karte, Apple Pay oder Google Pay - voll anrechenbar, jederzeit erstattbar</span>
          <span>Kostenloser Versand aus Polen (EU) nach Deutschland - kein Zoll</span>
          <span>Lieber später? Den Link bekommst du auch per E-Mail.</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`flex w-full max-w-xl flex-col gap-3 text-left ${className ?? ""}`}>
      <StepBar step={1} />
      <label className="flex flex-col gap-2">
        <span className="sr-only">E-Mail</span>
        <input
          id={`de-founder-email-${placement}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Deine E-Mail"
          className="h-12 w-full rounded-sm border border-border-sub bg-transparent px-4 font-body text-[15px] text-foreground outline-none focus:border-primary"
        />
      </label>
      <Button type="submit" disabled={loading || !consent} className="h-auto w-full rounded-sm py-4 text-xs font-semibold uppercase tracking-[0.22em]">
        {loading ? "Wird gesendet..." : "Founder Edition freischalten"}
      </Button>
      <label className="flex cursor-pointer items-start gap-3 font-body text-xs leading-5 text-cream-dim">
        <input type="checkbox" checked={consent} onChange={() => setConsent((value) => !value)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
        <span>Ja, schickt mir das Founding-Angebot ({formatDePrice(DE_PRICING.founderPriceEur)} statt {formatDePrice(DE_PRICING.regularPriceEur)}) und Updates per E-Mail. Abmeldung jederzeit möglich.</span>
      </label>
      {error && <p className="font-body text-xs text-destructive">{error}</p>}
    </form>
  );
}
