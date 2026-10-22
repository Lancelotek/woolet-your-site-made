import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import { pushGtmEvent } from "@/lib/gtm";
import { buildLeadAttribution } from "@/lib/meta-capi";

type Props = {
  /** Placement id, stored as utm_content so the DE sequence can be split by page. */
  placement: string;
  /** "hero" = compact primary CTA above the fold, "section" = full block lower on the page. */
  variant?: "hero" | "section";
  className?: string;
};

/**
 * DE email capture. Primary CTA on German pages since 22.10.2026: cold SEO
 * traffic converts on email first, then the German MailerLite sequence asks for 1 €.
 * Routed to MailerLite group "Woolet VIP DE" by mailerlite-subscribe (source "DE").
 */
export default function DeVipForm({ placement, variant = "section", className }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      pushGtmEvent("waitlist_signup", { form_location: `de_${placement}`, market: "de", event_id: metaEventId });
      const w = window as unknown as { dataLayer?: unknown[] };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: "meta_lead", meta_event_name: "Lead", event_id: metaEventId,
        content_name: "de_vip", content_category: "waitlist", source: "DE", form_location: `de_${placement}`,
      });
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={`max-w-xl border border-primary/25 bg-primary/5 p-5 font-body text-[15px] leading-7 text-foreground ${className ?? ""}`}>
        Du stehst auf der VIP-Liste. Schau in dein Postfach: Dort erfährst du, wie du dir den Founder-Preis von 109 € sicherst.
      </div>
    );
  }

  const isHero = variant === "hero";

  return (
    <form onSubmit={onSubmit} className={`flex w-full max-w-xl flex-col gap-3 text-left ${className ?? ""}`}>
      <div className={isHero ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3"}>
        <label className="flex flex-1 flex-col gap-2">
          <span className={isHero ? "sr-only" : "font-body text-[11px] uppercase tracking-[0.22em] text-cream-dim"}>E-Mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="du@beispiel.de"
            className={isHero
              ? "h-12 w-full rounded-sm border border-border-sub bg-transparent px-4 font-body text-[15px] text-foreground outline-none focus:border-primary"
              : "w-full border-0 border-b border-border-sub bg-transparent px-0 py-3 font-body text-[15px] text-foreground outline-none focus:border-primary"}
          />
        </label>
        <Button
          type="submit"
          disabled={loading || !consent}
          className={isHero
            ? "h-12 shrink-0 rounded-sm px-6 text-xs font-semibold uppercase tracking-[0.2em]"
            : "h-auto rounded-sm py-4 text-xs font-semibold uppercase tracking-[0.22em]"}
        >
          {loading ? "Wird gesendet..." : "Founder-Preis sichern"}
        </Button>
      </div>
      <label className="flex cursor-pointer items-start gap-3 font-body text-xs leading-5 text-cream-dim">
        <input type="checkbox" checked={consent} onChange={() => setConsent((value) => !value)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
        <span>Ja, schickt mir das Founding-Angebot (109 € statt 179 €) und Launch-Updates per E-Mail. Abmeldung jederzeit möglich.</span>
      </label>
      {error && <p className="font-body text-xs text-destructive">{error}</p>}
    </form>
  );
}
