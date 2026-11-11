// The buyer's page for the 3D model of a deposit-plan Bespoke order
// (/en/bespoke/model?sid=...). Three things can happen here: approve the model
// by paying the balance, ask for a correction, or let the order close.
//
// All rules (amounts, the 14-day window, who can do what) are decided by edge
// function `bespoke-balance`; this page only shows its answer.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { CheckCircle2, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { getStripe } from "@/lib/stripe";
import { pushGtmEvent } from "@/lib/gtm";
import { BALANCE_WINDOW_DAYS, formatUsdCents, type BalanceState } from "@/lib/bespoke-balance";

interface Status {
  state: BalanceState;
  orderRef: string;
  firstName: string | null;
  frameName: string;
  frontCode: string | null;
  templeCode: string | null;
  finish: string | null;
  lens: string | null;
  engraving: string | null;
  previewUrl: string | null;
  totalCents: number | null;
  depositCents: number | null;
  balanceCents: number | null;
  dueDateLabel: string | null;
  daysLeft: number;
  revisions: Array<{ note: string; createdAt: string; answered: boolean }>;
  canRequestRevision: boolean;
  canPay?: boolean;
}

const SID_RE = /^[A-Za-z0-9_-]{20,200}$/;
const TRACKED_KEY = "wlt_bespoke_balance_tracked";

const btn =
  "inline-flex items-center justify-center min-h-[52px] px-7 text-xs uppercase tracking-[0.2em] font-medium transition disabled:opacity-60";

export default function BespokeModel() {
  const [params] = useSearchParams();
  const sid = params.get("sid") ?? "";
  const justPaid = params.get("paid") === "1";
  const balanceSessionId = params.get("session_id") ?? "";

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisionSent, setRevisionSent] = useState(false);
  const viewedRef = useRef(false);

  const load = useCallback(async () => {
    if (!SID_RE.test(sid)) {
      setInvalid(true);
      setLoading(false);
      return null;
    }
    const { data, error } = await supabase.functions.invoke("bespoke-balance", { body: { action: "status", sid } });
    if (error || !data || data.error) {
      setInvalid(true);
      setLoading(false);
      return null;
    }
    setStatus(data as Status);
    setLoading(false);
    return data as Status;
  }, [sid]);

  useEffect(() => {
    void load();
  }, [load]);

  // Back from Stripe: the webhook can land a few seconds after the redirect.
  useEffect(() => {
    if (!justPaid || status?.state === "paid") return;
    let tries = 0;
    const t = window.setInterval(async () => {
      tries += 1;
      const s = await load();
      if (s?.state === "paid" || tries >= 8) window.clearInterval(t);
    }, 2500);
    return () => window.clearInterval(t);
  }, [justPaid, status?.state, load]);

  useEffect(() => {
    if (!status || viewedRef.current) return;
    viewedRef.current = true;
    pushGtmEvent("bespoke_model_viewed", { state: status.state });
  }, [status]);

  // Balance paid: one browser event per payment. The server sends the same
  // payment to GA4 and Meta from payments-webhook.
  useEffect(() => {
    if (!justPaid || !balanceSessionId || !status) return;
    try {
      if (sessionStorage.getItem(TRACKED_KEY) === balanceSessionId) return;
      sessionStorage.setItem(TRACKED_KEY, balanceSessionId);
    } catch {
      /* private mode: fire once per page load */
    }
    pushGtmEvent("bespoke_balance_paid", {
      flow: "bespoke_balance",
      payment_stage: "balance",
      value: (status.balanceCents ?? 0) / 100,
      order_total: (status.totalCents ?? 0) / 100,
      currency: "USD",
      stripe_session_id: balanceSessionId,
    });
  }, [justPaid, balanceSessionId, status]);

  const returnUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/en/bespoke/model?sid=${encodeURIComponent(sid)}&paid=1&session_id={CHECKOUT_SESSION_ID}`
        : "",
    [sid],
  );

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    pushGtmEvent("bespoke_balance_payment_initiated", { value: (status?.balanceCents ?? 0) / 100, currency: "USD" });
    const { data, error } = await supabase.functions.invoke("bespoke-balance", {
      body: { action: "checkout", sid, returnUrl },
    });
    if (error || !data?.clientSecret) {
      setPayError("We could not open the payment form. Reload the page or write to support@woolet.co.");
      setPaying(false);
      throw new Error(error?.message || data?.error || "no_client_secret");
    }
    return data.clientSecret as string;
  }, [sid, returnUrl, status?.balanceCents]);

  const sendRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = note.trim();
    if (text.length < 3) {
      setRevisionError("Tell us what to change - for example: make the bridge 1 mm wider.");
      return;
    }
    setSending(true);
    setRevisionError(null);
    const { data, error } = await supabase.functions.invoke("bespoke-balance", {
      body: { action: "revision", sid, note: text },
    });
    setSending(false);
    if (error || !data?.ok) {
      setRevisionError("We could not send your request. Try again, or reply to your Woolet email.");
      return;
    }
    pushGtmEvent("bespoke_model_revision_requested", {});
    setRevisionSent(true);
    setNote("");
    void load();
  };

  const s = status;
  const paid = s?.state === "paid" || (justPaid && s?.state !== "expired");
  // Approval is closed while a correction is open (older function builds send no canPay).
  const canPay = s?.state === "awaiting_payment" && s?.canPay !== false;
  const openRequest = s?.revisions.find((r) => !r.answered);

  return (
    <>
      <SEO title="Your 3D model · Woolet Bespoke" description="Approve the 3D model of your Woolet Bespoke frame or ask for a correction." noindex />
      <div className="min-h-screen bg-background text-cream">
        <header className="border-b border-cream/10">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
            <Link to="/en" className="text-cream text-[13px] tracking-[0.32em] uppercase font-medium">
              Woolet
            </Link>
            <span className="text-cream-dim text-[11px] uppercase tracking-[0.2em]">Bespoke · 3D model</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {loading ? (
            <div className="flex items-center gap-3 text-cream-dim">
              <Loader2 className="animate-spin" size={16} /> Loading your order…
            </div>
          ) : invalid || !s ? (
            <div className="rounded-sm border border-cream/15 bg-cream/[0.03] p-6 text-cream-dim">
              This link is not valid - reply to your Woolet email and we will send you a new one.
            </div>
          ) : paid ? (
            <section>
              <CheckCircle2 className="text-gold mb-4" size={28} />
              <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">
                Model approved. Order <span className="text-gold">{s.orderRef}</span> goes into production.
              </h1>
              <p className="mt-4 text-cream-dim leading-relaxed">
                We received your balance. Your frame is hand made in the EU - a 2-week build, then free worldwide
                shipping. We email you the tracking number the day it ships.
              </p>
              <Summary s={s} />
            </section>
          ) : s.state === "expired" ? (
            <section>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">
                Order <span className="text-gold">{s.orderRef}</span> is closed.
              </h1>
              <p className="mt-4 text-cream-dim leading-relaxed">
                The {BALANCE_WINDOW_DAYS} days to approve your 3D model have passed. Nothing more is charged. The{" "}
                {formatUsdCents(s.depositCents)} deposit covered your fit scan and 3D model and is not refunded.
              </p>
              <p className="mt-4 text-cream-dim leading-relaxed">
                Still want the frame? Write to{" "}
                <a href="mailto:support@woolet.co" className="text-gold-light underline underline-offset-4">
                  support@woolet.co
                </a>{" "}
                with your order number and we will reopen it.
              </p>
            </section>
          ) : s.state === "awaiting_model" ? (
            <section>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">
                Your 3D model is being prepared.
              </h1>
              <p className="mt-4 text-cream-dim leading-relaxed">
                Order <span className="text-gold">{s.orderRef}</span>. We email you as soon as the model is ready. From
                that day you have {BALANCE_WINDOW_DAYS} days to approve it or ask for a correction.
              </p>
              <Link
                to={`/en/bespoke/measurements?sid=${encodeURIComponent(sid)}`}
                className="mt-6 inline-block text-gold-light underline underline-offset-4 text-sm"
              >
                Haven't sent your measurements yet? Do it here
              </Link>
              <Summary s={s} />
            </section>
          ) : s.state === "not_applicable" ? (
            <div className="rounded-sm border border-cream/15 bg-cream/[0.03] p-6 text-cream-dim">
              Order {s.orderRef} was paid in full at checkout - there is nothing to pay here. We send your 3D model by
              email for approval.
            </div>
          ) : (
            <section>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold-light mb-3">Order {s.orderRef}</div>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">
                {s.firstName ? `${s.firstName}, your` : "Your"} 3D model is <em className="italic text-gold-light">ready</em>.
              </h1>
              <p className="mt-4 text-cream-dim leading-relaxed">
                Your 3D model - a video and a drawing with your measurements - is in the email we sent from
                support@woolet.co. Watch it first, then approve the model by paying the balance, or tell us what to
                correct.
              </p>

              {s.state === "revision_requested" && openRequest && (
                <div role="status" className="mt-6 border border-gold/30 bg-gold/5 p-4 text-sm leading-relaxed text-cream-dim">
                  <strong className="text-cream font-medium">We are correcting your model.</strong> Your request: “
                  {openRequest.note}”. We email you the corrected model, and your {BALANCE_WINDOW_DAYS} days start again
                  from that day. You approve and pay once you have seen it. Changed your mind? Reply to our email and
                  we reopen the current model for approval.
                </div>
              )}

              <Summary s={s} />

              {s.state === "awaiting_payment" && s.dueDateLabel && (
                <p className="mt-4 text-sm text-cream-dim">
                  Open until <strong className="text-cream font-medium">{s.dueDateLabel}</strong>
                  {s.daysLeft > 0 ? ` - ${s.daysLeft} day${s.daysLeft === 1 ? "" : "s"} left` : ""}. After that the
                  order closes and the deposit is not refunded.
                </p>
              )}

              {canPay && !paying && (
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPayError(null);
                      setPaying(true);
                      pushGtmEvent("bespoke_model_approve_click", { value: (s.balanceCents ?? 0) / 100 });
                    }}
                    className={`${btn} w-full bg-gold text-background hover:bg-gold-light`}
                    style={{ borderRadius: 2 }}
                  >
                    Approve model & pay {formatUsdCents(s.balanceCents)}
                  </button>
                  <p className="text-xs text-cream-dim">
                    Production starts after this payment - a 2-week build, then free worldwide shipping.
                  </p>
                </div>
              )}

              {payError && <p className="mt-4 text-sm text-red-300">{payError}</p>}

              {paying && (
                <div className="mt-8 relative bg-white text-[#0B0A09] overflow-hidden min-h-[560px]" style={{ borderRadius: 4 }}>
                  <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              )}

              {s.canRequestRevision && !paying && (
                <form onSubmit={sendRevision} className="mt-10 border-t border-cream/10 pt-8">
                  <h2 className="font-display text-2xl text-cream">Something to correct?</h2>
                  <p className="mt-2 text-sm text-cream-dim leading-relaxed">
                    Tell us what to change - the bridge, the width, the temples. We send you a corrected model and your{" "}
                    {BALANCE_WINDOW_DAYS} days start again.
                  </p>
                  <label htmlFor="model-revision" className="block mt-5 text-[11px] uppercase tracking-[0.16em] text-cream-dim mb-1.5">
                    What should we change?
                  </label>
                  <textarea
                    id="model-revision"
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setRevisionSent(false);
                    }}
                    maxLength={2000}
                    rows={4}
                    placeholder="Example: make the bridge 1 mm wider"
                    aria-invalid={Boolean(revisionError)}
                    aria-describedby={revisionError ? "model-revision-error" : undefined}
                    className="w-full border border-cream/20 bg-background px-3 py-3 text-sm text-cream outline-none focus:border-gold"
                  />
                  {revisionError && (
                    <p id="model-revision-error" className="mt-2 text-sm text-red-300">
                      {revisionError}
                    </p>
                  )}
                  {revisionSent && (
                    <p role="status" className="mt-2 text-sm text-gold-light">
                      Request sent. We email you the corrected model.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className={`${btn} mt-4 border border-gold/50 text-gold-light hover:bg-gold hover:text-background`}
                    style={{ borderRadius: 2 }}
                  >
                    {sending ? "Sending…" : "Send correction request"}
                  </button>
                </form>
              )}

              <p className="mt-10 text-xs text-cream-dim leading-relaxed">
                Not going ahead? You don't need to do anything. Nothing more is charged unless you approve the model.
                The {formatUsdCents(s.depositCents)} deposit covered your fit scan and 3D model and is not refunded.
              </p>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

function Summary({ s }: { s: Status }) {
  const rows: Array<[string, string | null]> = [
    ["Frame", s.frameName],
    ["Front acetate", s.frontCode],
    ["Temple acetate", s.templeCode],
    ["Finish", s.finish],
    ["Lenses", s.lens],
    ["Engraving", s.engraving ? `"${s.engraving}"` : null],
  ];
  return (
    <div className="mt-8 border border-cream/10 bg-cream/[0.03] p-5" style={{ borderRadius: 4 }}>
      {s.previewUrl && (
        // This is the configurator render, not the 3D model: the model (video
        // and drawing) is made in the workshop and reaches the buyer by email.
        <figure className="m-0 mb-4">
          <img
            src={s.previewUrl}
            alt={`Configurator preview of your ${s.frameName} frame`}
            loading="lazy"
            decoding="async"
            className="w-full h-auto"
            style={{ borderRadius: 2 }}
          />
          <figcaption className="mt-2 text-xs text-cream-dim leading-relaxed">
            Preview of the design you configured. Your 3D model - the video and the drawing with your measurements - is
            in the email from support@woolet.co.
          </figcaption>
        </figure>
      )}
      <dl className="space-y-2 text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">{k}</dt>
              <dd className="text-cream text-right">{v}</dd>
            </div>
          ))}
      </dl>
      <dl className="mt-4 pt-4 border-t border-cream/15 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">Order total</dt>
          <dd className="text-cream">{formatUsdCents(s.totalCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">Deposit paid</dt>
          <dd className="text-cream">{formatUsdCents(s.depositCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-cream text-[11px] uppercase tracking-[0.2em]">
            {s.state === "paid" ? "Balance paid" : "Balance on approval"}
          </dt>
          <dd className="text-cream text-xl font-display">{formatUsdCents(s.balanceCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
