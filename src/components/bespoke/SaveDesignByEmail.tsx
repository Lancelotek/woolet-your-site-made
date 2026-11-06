import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import { buildLeadAttribution } from "@/lib/meta-capi";
import { pushGtmEvent } from "@/lib/gtm";
import { clarityEvent } from "@/lib/clarity";
import { isEuLikeVisitor } from "@/lib/meta-pixel";
import type { BespokeConfig } from "@/lib/bespoke-state";
import { buildDesignUrl, designSummary, hasSavableDesign, readSavedEmail, writeSavedEmail } from "@/lib/bespoke-saved-design";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Only hosted renders go into emails; local/example images stay out.
const RENDER_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//;

interface Props {
  config: BespokeConfig;
  renderUrl: string | null;
  /** Where on the page it sits — reported to GTM/Clarity. */
  placement: "desktop_stage" | "mobile_preview" | "mobile_review";
}

/**
 * Optional "Email me this design" — a secondary text link next to the build,
 * never a gate. The main path (Next → Pay) is untouched; the email prefills
 * Stripe later and feeds the "Bespoke Saved Design" sequence in MailerLite.
 */
export default function SaveDesignByEmail({ config, renderUrl, placement }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(() => readSavedEmail() ?? "");
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Outside the EU the follow-ups are announced in the copy; EU visitors opt in.
  const [eu] = useState(() => isEuLikeVisitor());

  if (!hasSavableDesign(config)) return null;

  if (sentTo) {
    return (
      <p className="cfg-savedesign cfg-savedesign--done" role="status">
        <Check size={13} aria-hidden /> Sent to {sentTo}. The link opens this exact build.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="cfg-savedesign__link"
        onClick={() => {
          setOpen(true);
          pushGtmEvent("bespoke_save_design_open", { placement });
          clarityEvent("bespoke_save_design_open");
        }}
      >
        Not ready? Email me this design
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const lead = buildLeadAttribution();
      const { data, error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          ...getAttribution(),
          ...lead,
          email: clean,
          source: "bespoke_save",
          form_location: `bespoke_save_${placement}`,
          bespoke_design_url: buildDesignUrl(config),
          bespoke_design_summary: designSummary(config),
          bespoke_render_url: renderUrl && RENDER_RE.test(renderUrl) ? renderUrl : "",
          bespoke_followups: !eu || optIn ? "yes" : "no",
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error || "Could not send the email.");
      writeSavedEmail(clean);
      pushGtmEvent("bespoke_save_design", { placement, event_id: lead.meta_event_id, is_new_lead: data?.is_new !== false });
      clarityEvent("bespoke_save_design");
      // Browser half of the deduplicated Lead (server half: mailerlite-subscribe CAPI).
      if (data?.is_new !== false) {
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({
          event: "meta_lead", meta_event_name: "Lead", event_id: lead.meta_event_id,
          content_name: "bespoke_save", content_category: "bespoke_save", source: "bespoke_save",
          form_location: `bespoke_save_${placement}`,
        });
      }
      setSentTo(clean);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="cfg-savedesign" onSubmit={submit} noValidate>
      <label className="cfg-savedesign__label" htmlFor={`cfg-save-${placement}`}>
        We'll email you this build and a link that reopens it.
      </label>
      <div className="cfg-savedesign__row">
        <input
          id={`cfg-save-${placement}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="you@example.com"
          autoFocus
        />
        <button type="submit" disabled={busy} className="cfg-savedesign__send">
          {busy ? <Loader2 size={14} className="animate-spin" /> : "Send"}
        </button>
      </div>
      {eu ? (
        <label className="cfg-savedesign__optin">
          <input type="checkbox" checked={optIn} onChange={(ev) => setOptIn(ev.target.checked)} />
          <span>Also send me 2 short notes about fit and build time. Unsubscribe anytime.</span>
        </label>
      ) : (
        <p className="cfg-savedesign__note">Plus 2 short notes about fit and build time. Unsubscribe anytime.</p>
      )}
      {error && <span className="cfg-savedesign__error" role="alert">{error}</span>}
    </form>
  );
}
