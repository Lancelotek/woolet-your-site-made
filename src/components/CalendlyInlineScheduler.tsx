import { useEffect, useRef, useState } from "react";
import { readConsentSnapshot } from "@/lib/consent";
import { pushGtmEvent } from "@/lib/gtm";

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_ORIGIN = "https://calendly.com";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }) => void;
    };
  }
}

/** The script is third-party and sets cookies — never before consent. */
const hasConsent = () => {
  const s = readConsentSnapshot();
  return s.consent_state === "granted" || s.analytics_storage === "granted";
};

/** One tag per session, whatever the route history looks like. */
const loadWidgetScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Calendly) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("calendly_script_failed")));
      return;
    }
    const tag = document.createElement("script");
    tag.src = WIDGET_SRC;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error("calendly_script_failed"));
    document.head.appendChild(tag);
  });

/**
 * Inline Calendly on the bespoke success page. The URL always carries the case
 * number — the webhook binds the booking to the order through it. State changes
 * stay server-side; the confirmation here is only what the customer sees.
 */
export default function CalendlyInlineScheduler({
  url,
  caseNo,
}: {
  url: string;
  caseNo: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [consent, setConsent] = useState(hasConsent);
  const [booked, setBooked] = useState(false);
  const [failed, setFailed] = useState(false);

  // Swap from the fallback button to the widget the moment consent arrives.
  useEffect(() => {
    const onConsent = () => setConsent(hasConsent());
    window.addEventListener("woolet-consent-updated", onConsent);
    return () => window.removeEventListener("woolet-consent-updated", onConsent);
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== CALENDLY_ORIGIN) return;
      const data = e.data as { event?: string } | null;
      if (data?.event !== "calendly.event_scheduled") return;
      setBooked(true);
      pushGtmEvent("bespoke_interview_booked", { case_no: caseNo, placement: "thankyou_inline" });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [caseNo]);

  useEffect(() => {
    if (!consent || booked) return;
    let cancelled = false;
    const parent = ref.current;
    void loadWidgetScript()
      .then(() => {
        if (cancelled || !parent || !window.Calendly) return;
        parent.innerHTML = "";
        window.Calendly.initInlineWidget({ url, parentElement: parent, prefill: {}, utm: {} });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (parent) parent.innerHTML = "";
    };
  }, [consent, booked, url]);

  const goldButton = (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] font-medium"
      style={{ background: "#CAA449", color: "#1F1B16", borderRadius: 2 }}
    >
      Book your fitting interview
    </a>
  );

  if (booked) {
    return (
      <div
        className="mt-6 px-6 py-8 sm:px-8"
        style={{ background: "#080807", border: "1px solid rgba(202,164,73,0.35)", borderRadius: 3 }}
      >
        <div className="text-lg" style={{ color: "#EDE7D9" }}>
          You&rsquo;re booked.
        </div>
        <div
          className="mt-2 text-sm"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "#CAA449" }}
        >
          {caseNo}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "rgba(239,233,223,0.7)" }}>
          Check your inbox &mdash; your scan link is on its way. Do the scan before the call.
        </p>
      </div>
    );
  }

  if (!consent || failed) {
    return (
      <div className="mt-6">
        {goldButton}
        <p className="mt-3 text-[12px]" style={{ color: "rgba(239,233,223,0.45)" }}>
          Booking runs on Calendly. Accept cookies to book without leaving this page.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="mt-6 calendly-inline-host"
      style={{ minWidth: 320 }}
      aria-label="Calendly scheduler"
    />
  );
}
