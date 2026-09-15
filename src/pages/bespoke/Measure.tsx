// Invitation-only measurement page.
//
// The flow, in the order the customer sees it:
//   1. The link is opened. Nothing is consumed — mail scanners open links too,
//      so a visit must never burn an invitation.
//   2. The customer reads what is measured and agrees.
//   3. One deliberate click exchanges the token for a thirty-minute session.
//      The token is wiped from the address bar before any third-party script
//      is allowed to load.
//   4. FitLens runs in measurement_only / full_page and hands back a result.
//   5. The result goes to our backend, which verifies FitLens's signature and
//      decides which order it belongs to. An unsigned result is refused.
//
// The invitation token never reaches the FitLens iframe, and the order number
// never reaches the browser as something the browser could change.

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

const EMBED_ORIGIN = "https://fitlens-web-production.up.railway.app";
const EMBED_SRC = `${EMBED_ORIGIN}/v1/embed.js`;
const FITLENS_KEY = "pk_live_OuBrFjXWKeNygZku6WyJHeFW_8d55SVqIrleeFfrzuQ";
const CONSENT_VERSION = "measure-v1";
const SESSION_KEY = "woolet_measure_session";

type Stage =
  | "checking"
  | "unavailable"
  | "invite"
  | "starting"
  | "measuring"
  | "saving"
  | "done"
  | "refused";

const ERROR_COPY: Record<string, string> = {
  signature_missing:
    "The measurement came back without FitLens's signature, so we did not save it. Nothing is lost - please take the measurement again.",
  signature_invalid:
    "We could not confirm that this measurement came from FitLens, so we did not save it. Please take it again.",
  signature_stale:
    "That measurement is too old to accept. Please take a fresh one.",
  no_measurements: "The scan did not return a usable width. Please try once more in better light.",
  session_expired:
    "This measuring session has ended. Ask us for a new link and it will take twenty seconds.",
  network: "We could not reach our server. Check your connection and press save again.",
  persist_failed: "Something went wrong on our side. Please try once more.",
  forbidden: "This measurement belongs to a different order, so we did not save it.",
};

export default function Measure() {
  const [params] = useSearchParams();
  const [stage, setStage] = useState<Stage>("checking");
  const [consent, setConsent] = useState(false);
  const [greeting, setGreeting] = useState<{ firstName: string | null; orderReference: string } | null>(null);
  const [errorKey, setErrorKey] = useState<string>("network");
  const [measurementRef, setMeasurementRef] = useState<string | null>(null);

  const tokenRef = useRef<string>("");
  const csrfRef = useRef<string>("");
  const sessionRef = useRef<string>("");
  const lastResultRef = useRef<unknown>(null);

  // 1. Neutral check. No side effects, no consumption.
  useEffect(() => {
    const token = params.get("invite")?.trim() ?? "";
    if (!token) {
      setStage("unavailable");
      return;
    }
    tokenRef.current = token;
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase.functions.invoke("measure-invite-begin", { body: { token } });
      if (cancelled) return;
      if (error || (data as any)?.status !== "ready") {
        setStage("unavailable");
        return;
      }
      csrfRef.current = (data as any).csrf;
      setGreeting({
        firstName: (data as any).firstName ?? null,
        orderReference: (data as any).orderReference ?? "",
      });
      setStage("invite");
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const saveResult = useCallback(async (detail: unknown) => {
    lastResultRef.current = detail;
    setStage("saving");
    try {
      const { data, error } = await supabase.functions.invoke("measure-attach", {
        body: { sessionToken: sessionRef.current, result: detail },
      });
      const payload = (data ?? {}) as Record<string, unknown>;
      if (error && !payload.ok) {
        // Supabase wraps non-2xx as an error; read our own reason when present.
        const reason = (payload.error as string) || "network";
        setErrorKey(reason);
        setStage("refused");
        return;
      }
      if (!payload.ok) {
        setErrorKey((payload.error as string) || "network");
        setStage("refused");
        return;
      }
      setMeasurementRef((payload.measurementRef as string) ?? null);
      sessionStorage.removeItem(SESSION_KEY);
      setStage("done");
    } catch {
      setErrorKey("network");
      setStage("refused");
    }
  }, []);

  // 4. Result listener — mounted only while a session is live.
  useEffect(() => {
    if (stage !== "measuring" && stage !== "saving" && stage !== "refused") return;
    const onResult = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      void saveResult(detail);
    };
    document.addEventListener("fitlens:result", onResult as EventListener);
    return () => document.removeEventListener("fitlens:result", onResult as EventListener);
  }, [stage, saveResult]);

  // 3. The deliberate exchange.
  const start = useCallback(async () => {
    if (!consent) return;
    setStage("starting");
    try {
      const { data, error } = await supabase.functions.invoke("measure-invite-exchange", {
        body: {
          token: tokenRef.current,
          csrf: csrfRef.current,
          consent: { accepted: true, version: CONSENT_VERSION, locale: document.documentElement.lang || "en" },
        },
      });
      if (error || (data as any)?.status !== "ready") {
        setStage("unavailable");
        return;
      }
      sessionRef.current = (data as any).sessionToken;
      sessionStorage.setItem(SESSION_KEY, sessionRef.current);
      tokenRef.current = "";
      csrfRef.current = "";
      // The token leaves the URL before any external script is allowed to load.
      window.history.replaceState({}, "", `${window.location.pathname}`);

      const script = document.createElement("script");
      script.src = EMBED_SRC;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.dataset.key = FITLENS_KEY;
      script.dataset.mode = "measurement_only";
      script.dataset.layout = "full_page";
      // No `integrity`: FitLens redeploys /v1/embed.js without notice and a
      // pinned hash makes the browser refuse the new file, killing the scan
      // silently. The result is trusted by its signature, not by the script.
      document.body.appendChild(script);
      setStage("measuring");
    } catch {
      setErrorKey("network");
      setStage("refused");
    }
  }, [consent]);

  const retrySave = useCallback(() => {
    if (lastResultRef.current) void saveResult(lastResultRef.current);
  }, [saveResult]);

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-5 py-14">
      <SEO
        title="Measurement"
        exactTitle
        description="Private measurement page for a Woolet bespoke order."
        noindex
        robots="noindex, nofollow"
        path="/en/measure"
      />
      <div className="mx-auto w-full max-w-[560px]">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Woolet bespoke</p>

        {stage === "checking" && (
          <p className="mt-8 text-[15px] text-muted-foreground">Opening your measurement…</p>
        )}

        {stage === "unavailable" && (
          <section className="mt-6">
            <h1 className="font-serif text-[30px] leading-[1.15]">This link is no longer open</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Measurement links are personal and work once. Reply to your order email and we will send a fresh
              one — the measurement itself takes about twenty seconds.
            </p>
          </section>
        )}

        {(stage === "invite" || stage === "starting") && (
          <section className="mt-6">
            <h1 className="font-serif text-[32px] leading-[1.12]">
              {greeting?.firstName ? `${greeting.firstName}, ` : ""}your measurement
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              For order {greeting?.orderReference}. Your phone camera measures the width of your face in
              millimetres, and the workshop cuts to those numbers.
            </p>

            <div className="mt-8 rounded-[2px] border border-border bg-card p-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">What is measured</h2>
              <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted-foreground">
                <li>Temple-to-temple width, pupil distance, and the gap between the inner corners of your eyes.</li>
                <li>No photo and no video leaves your phone — only the millimetres reach us.</li>
                <li>The numbers are kept with your order and used to cut and fit your frame.</li>
                <li>Write to us at any time to see, correct or delete them.</li>
              </ul>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-[3px] h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span>
                I agree to my face being measured by camera for this order, on the terms above.
              </span>
            </label>

            <button
              type="button"
              onClick={() => void start()}
              disabled={!consent || stage === "starting"}
              className="mt-6 min-h-[48px] w-full rounded-[2px] bg-[hsl(var(--primary))] px-6 text-[15px] font-semibold text-[hsl(var(--primary-foreground))] transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stage === "starting" ? "Opening…" : "Start the secure measurement"}
            </button>
          </section>
        )}

        {stage === "measuring" && (
          <section className="mt-6">
            <h1 className="font-serif text-[30px] leading-[1.15]">Follow the camera</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Hold the phone at eye level and look straight ahead. When the measurement finishes we save it
              automatically — keep this page open.
            </p>
          </section>
        )}

        {stage === "saving" && <p className="mt-8 text-[15px] text-muted-foreground">Saving your measurement…</p>}

        {stage === "refused" && (
          <section className="mt-6">
            <h1 className="font-serif text-[30px] leading-[1.15]">We did not save that one</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {ERROR_COPY[errorKey] ?? ERROR_COPY.network}
            </p>
            {errorKey === "network" && (
              <button
                type="button"
                onClick={retrySave}
                className="mt-6 min-h-[48px] w-full rounded-[2px] border border-border px-6 text-[15px] font-semibold"
              >
                Try saving again
              </button>
            )}
          </section>
        )}

        {stage === "done" && (
          <section className="mt-6">
            <h1 className="font-serif text-[30px] leading-[1.15]">Measurement saved</h1>
            {measurementRef && (
              <p className="mt-5 font-mono text-[26px] tracking-[0.08em]">{measurementRef}</p>
            )}
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              That reference is yours — quote it in any reply and we will know exactly which measurement you
              mean. You can close this page.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
