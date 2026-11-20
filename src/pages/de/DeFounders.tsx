import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import SEO from "@/components/SEO";
import KickstarterLiveRedirect from "@/components/KickstarterLiveRedirect";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { FOUNDER_EDITION as F, isReservationOpen } from "@/config/kickstarter";
import { DE_PRICING, formatDePrice } from "@/content/de/pricing";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { buildPurchaseAttribution, trackInitiateCheckoutOnce } from "@/lib/meta-capi";
import { getAttribution, getLastTouchCheckoutMetadata } from "@/lib/attribution";
import { getGaCheckoutMetadataAsync } from "@/lib/ga-ids";
import { pushGtmEvent } from "@/lib/gtm";
import { claritySet } from "@/lib/clarity";

/**
 * /de/founders - German twin of /en/founders (20.11.2026): people who reserved
 * for 1 € buy the Founder Edition here in EUR. 009 Black, 24 mm bridge, Founder Box.
 * Ships from Poland (EU) right after the order - no customs for DE/AT.
 * Price (109 €) and the shared stock cap live server-side in create-checkout
 * (FOUNDER_DE_PRICE_ID); DE_PRICING.founderPriceEur is display only.
 */
const FOUNDER_PRICE_ID = DE_PRICING.founderCheckoutPriceId;
const PRICE = DE_PRICING.founderPriceEur;
const OPEN_TIMEOUT_MS = 8000;
const IMG = "/frames/";

const C = {
  bg: "#080807",
  surface: "#16140F",
  hair: "rgba(255,255,255,0.08)",
  body: "#EDE7D9",
  head: "#F8F8F6",
  muted: "#9A8E7E",
  gold: "#CAA449",
  ink: "#1F1B16",
};

// Real Founder batch only: no rivet dots on the front, no gold decor on the temples
// (the main-run 009 photos in /frames/ show both, so they must not be used here).
const PHOTOS = [
  { src: "/founders/woolet-founder-edition-009-black-box.jpg", alt: "Woolet 009 Black Founder Edition in der Founder Box mit Filz-Etui und Clip-On-Tuch" },
  { src: "/founders/woolet-founder-edition-009-black-hinge.jpg", alt: "Woolet 009 Black Founder Edition im Detail - schwarze Front ohne Nieten, kleines w-Logo im Bügel" },
  { src: `${IMG}woolet-box-open-frames-cloth.jpg`, alt: "Woolet Founder Box geöffnet mit Filz-Etui und Clip-On-Tuch" },
  { src: `${IMG}woolet-box-render-closed.jpg`, alt: "Woolet Magnetbox geschlossen, goldenes w auf dem Deckel" },
];

const FACTS: Array<[string, string]> = [
  ["Fassung", `Nur ${F.model} - 158 mm Front, passt für Gesichter von 155 bis 161 mm`],
  ["Steg", `${F.bridgeMm} mm - nur in der Founder-Serie (die Hauptserie hat 25 mm)`],
  ["Fertigung", "Mazzucchelli-Acetat aus Mailand, gefertigt in einer kleinen Familienwerkstatt in Bielsko-Biała, Polen"],
  ["Founder Box", "Magnetbox, Spezial-Etui und Clip-On-Tuch - im Shop nicht erhältlich"],
  ["Gläser", "Nur die Fassung - dein Optiker setzt deine Gläser ein"],
  ["Versand", "Kostenlos. Versand aus Polen (EU) direkt nach deiner Bestellung"],
  ["Zoll", "Keiner. Die Lieferung bleibt innerhalb der EU"],
  ["Rückgabe", "14 Tage ab Lieferung an Marek Ciesla, Kanadyjska 64D, 32-087 Zielonki, Polen - volle Erstattung oder 50 % Rabatt auf eine Bespoke-Fassung"],
  ["Garantie", "5 Jahre"],
];

type Touch = { touch_source?: string; touch_campaign?: string; touch_content?: string };

const readTouch = (): Touch => {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Touch = {};
  const s = p.get("utm_source");
  const c = p.get("utm_campaign");
  const ct = p.get("utm_content");
  if (s) out.touch_source = s.slice(0, 120);
  if (c) out.touch_campaign = c.slice(0, 120);
  if (ct) out.touch_content = ct.slice(0, 120);
  return out;
};

/** Reads the JSON error code ("sold_out", "closed") from a non-2xx edge function reply. */
async function edgeErrorCode(error: unknown): Promise<string | null> {
  const ctx = (error as { context?: Response } | null)?.context;
  if (!ctx || typeof ctx.json !== "function") return null;
  try {
    const j = await ctx.clone().json();
    return typeof j?.error === "string" ? j.error : null;
  } catch {
    return null;
  }
}

const btn: CSSProperties = {
  width: "100%",
  background: C.gold,
  color: C.ink,
  border: "none",
  borderRadius: 2,
  padding: "18px 24px",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};

function Paid() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    pushGtmEvent("founder_order_thankyou", { value: PRICE, currency: "EUR", market: "de" });
  }, []);
  return (
    <main className="fnd-wrap" style={{ textAlign: "center" }}>
      <p className="fnd-eyebrow">Founder Edition</p>
      <h1 className="fnd-h1">Deine Founder-Fassung gehört dir.</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 auto 18px", maxWidth: 460 }}>
        {F.model}, {F.bridgeMm} mm Steg, mit Founder Box. Sie geht sofort aus Polen (EU) raus. Du bekommst eine E-Mail
        mit Bestellung und Lieferadresse - prüf sie und antworte auf diese E-Mail, wenn etwas nicht stimmt.
      </p>
      <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
        Fragen? <a href="mailto:support@woolet.co" style={{ color: C.gold }}>support@woolet.co</a>
      </p>
    </main>
  );
}

function Checkout() {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const sessionRef = useRef<Promise<string> | null>(null);
  const touch = useMemo(readTouch, []);

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/de/founders?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : "https://woolet.co/de/founders?paid=1&session_id={CHECKOUT_SESSION_ID}";

  const metadata = useMemo(() => {
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(getAttribution())) {
      if (typeof v === "string" && v) flat[k] = v.slice(0, 480);
    }
    return { ...flat, campaign: "founder_edition_site_de", form_location: "de_founders_page", market: "de", recommended_sku: "founder_009_black_24", ...touch };
  }, [touch]);

  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    pushGtmEvent("founders_page_view", { touch_source: touch.touch_source ?? "", market: "de" });
    if (touch.touch_source) claritySet("founders_touch_source", touch.touch_source);
  }, [touch]);

  useEffect(() => {
    try {
      void getStripe();
    } catch {
      /* surfaced by the error state */
    }
  }, []);

  const createSession = useCallback((): Promise<string> => {
    const base = { ...metadata, ...buildPurchaseAttribution(), ...getLastTouchCheckoutMetadata() };
    return getGaCheckoutMetadataAsync()
      .then((ga) =>
        supabase.functions.invoke("create-checkout", {
          body: {
            priceId: FOUNDER_PRICE_ID,
            returnUrl,
            metadata: { ...base, ...ga, user_initiated: "1" },
            environment: getStripeEnvironment(),
          },
        }),
      )
      .then(async ({ data, error }) => {
        if (error || !data?.clientSecret) {
          const code = error ? await edgeErrorCode(error) : null;
          throw new Error(code || error?.message || "Failed to create checkout session");
        }
        return data.clientSecret as string;
      });
  }, [metadata, returnUrl]);

  const fetchClientSecret = useCallback((): Promise<string> => {
    if (!sessionRef.current) {
      const p = createSession();
      p.catch(() => undefined);
      sessionRef.current = p;
    }
    return sessionRef.current.catch((e) => {
      sessionRef.current = null;
      const message = e instanceof Error ? e.message : "unknown";
      setFailed(message);
      pushGtmEvent("founders_checkout_error", { error_message: message, market: "de" });
      throw e;
    });
  }, [createSession]);

  const readyFired = useRef(false);
  useEffect(() => {
    if (failed || !started) return;
    const t0 = performance.now();
    const timer = window.setInterval(() => {
      if (document.querySelector("#founders-checkout iframe")) {
        window.clearInterval(timer);
        window.clearTimeout(bail);
        setMounted(true);
        if (!readyFired.current) {
          readyFired.current = true;
          pushGtmEvent("founders_checkout_ready", { load_ms: Math.round(performance.now() - t0), market: "de" });
        }
      }
    }, 100);
    const bail = window.setTimeout(() => {
      window.clearInterval(timer);
      if (!readyFired.current) setFailed("timeout");
    }, OPEN_TIMEOUT_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(bail);
    };
  }, [failed, retryKey, started]);

  const retry = () => {
    sessionRef.current = null;
    readyFired.current = false;
    setMounted(false);
    setFailed(null);
    setRetryKey((k) => k + 1);
  };

  const soldOut = failed === "sold_out";

  return (
    <main className="fnd-wrap">
      <p className="fnd-eyebrow">Founder Edition · sofort lieferbar</p>
      <h1 className="fnd-h1">Deine Founder-Fassung. Ohne Kickstarter-Konto.</h1>
      <p style={{ fontSize: 17, lineHeight: 1.55, margin: "0 0 26px" }}>
        {F.model} für {formatDePrice(PRICE)} statt {formatDePrice(DE_PRICING.regularPriceEur)} im Shop, inkl. MwSt., mit
        der Founder Box. Versand sofort aus Polen (EU).
      </p>
      <p className="fnd-noacct">
        <strong>Kein Konto nötig.</strong> Nicht bei Kickstarter, nicht hier. Keine Anmeldung, kein Passwort - nur deine
        Karte und deine Lieferadresse.
      </p>

      <div className="fnd-gallery">
        {PHOTOS.map((p, i) => (
          <img key={p.src} src={p.src} alt={p.alt} loading={i < 2 ? "eager" : "lazy"} decoding="async" width={800} height={800} />
        ))}
      </div>

      <dl className="fnd-facts">
        {FACTS.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "4px 0 16px" }}>
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, color: C.head, lineHeight: 1 }}>{formatDePrice(PRICE)}</span>
        <span style={{ fontSize: 16, color: C.muted, textDecoration: "line-through" }}>{formatDePrice(DE_PRICING.regularPriceEur)}</span>
        <span style={{ fontSize: 13, color: C.gold, letterSpacing: "0.08em" }}>inkl. MwSt. · Gratisversand aus Polen (EU)</span>
      </div>

      {!started ? (
        <button
          type="button"
          id="founders-pay"
          style={btn}
          onClick={() => {
            pushGtmEvent("founders_pay_click", { touch_source: touch.touch_source ?? "", market: "de" });
            trackInitiateCheckoutOnce(`de-founders:${touch.touch_source ?? "direct"}`, {
              custom: { value: PRICE, currency: "EUR", num_items: 1 },
            });
            setStarted(true);
          }}
        >
          Founder-Fassung bestellen - {formatDePrice(PRICE)}
        </button>
      ) : (
        <div style={{ background: "#fff", borderRadius: 2, overflow: "hidden", position: "relative", minHeight: 320 }}>
          <PaymentTestModeBanner />
          {failed ? (
            <div style={{ background: C.surface, color: C.body, padding: "28px 22px" }}>
              <h2 style={{ fontSize: 19, fontWeight: 600, margin: "0 0 10px", color: C.head }}>
                {soldOut ? "Die Founder-Fassungen hier sind vergriffen" : failed === "closed" ? "Die Founder Edition ist beendet" : "Der Checkout hat nicht geladen - tippe, um es noch einmal zu versuchen"}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 20px", color: C.muted }}>
                {soldOut || failed === "closed" ? (
                  <>
                    Schreib an <a href="mailto:support@woolet.co" style={{ color: C.gold }}>support@woolet.co</a> - ich sage dir, was noch da ist.
                  </>
                ) : (
                  "Ein Tipp lädt das sichere Zahlungsformular neu."
                )}
              </p>
              {!soldOut && failed !== "closed" && (
                <button type="button" onClick={retry} style={{ ...btn, width: "auto", padding: "14px 24px", fontSize: 12 }}>
                  Noch einmal versuchen
                </button>
              )}
            </div>
          ) : (
            <>
              {!mounted && (
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                  <span style={{ fontSize: 14, color: "#6B6357" }}>Sicherer Checkout wird geladen…</span>
                </div>
              )}
              <div id="founders-checkout">
                <EmbeddedCheckoutProvider key={retryKey} stripe={getStripe()} options={{ fetchClientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </>
          )}
        </div>
      )}

      {!started && (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: C.muted, textAlign: "center" }}>
          Gast-Checkout - Karte, Apple Pay oder Google Pay. Kein Konto, kein Passwort.
        </p>
      )}

      <p style={{ margin: "22px 0 0", fontSize: 14, lineHeight: 1.6, color: C.muted }}>
        Unsicher bei der Breite?{" "}
        <Link to="/de/fit" style={{ color: C.gold }}>Miss dein Gesicht in 60 Sekunden</Link>. Außerhalb von 155-161 mm fertigen wir{" "}
        <Link to="/de/bespoke" style={{ color: C.gold }}>Bespoke</Link> nach deinem Maß.
      </p>
    </main>
  );
}

export default function DeFounders() {
  const [params] = useSearchParams();
  const paid = params.get("paid") === "1";
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);
  if (!paid && !isReservationOpen()) return <KickstarterLiveRedirect refTag="site_de" slot="de_founders_page" />;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.body, fontFamily: "Barlow, sans-serif" }}>
      <SEO
        title="Founder Edition - Woolet"
        description="Woolet 009 Black Founder Edition: 109 € statt 179 €, mit Founder Box. Direkt auf woolet.co bestellen - Versand aus Polen (EU), kein Zoll."
        path="/founders"
        noindex
        robots="noindex, nofollow"
      />
      <style>{`
        .fnd-wrap { max-width: 640px; margin: 0 auto; padding: 40px 20px 72px; }
        .fnd-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.gold}; margin: 0 0 10px; }
        .fnd-h1 { font-family: "Cormorant Garamond", Cormorant, serif; font-weight: 300; font-size: 38px; line-height: 1.08; color: ${C.head}; margin: 0 0 14px; }
        .fnd-noacct { margin: 0 0 26px; padding: 14px 16px; border-left: 2px solid ${C.gold}; background: ${C.surface}; font-size: 16px; line-height: 1.5; color: ${C.body}; }
        .fnd-noacct strong { color: ${C.head}; font-weight: 600; }
        .fnd-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0 0 28px; }
        .fnd-gallery img { width: 100%; height: auto; aspect-ratio: 1 / 1; object-fit: cover; background: ${C.surface}; border-radius: 2px; }
        .fnd-gallery img:first-child { grid-column: 1 / -1; aspect-ratio: 1 / 1; }
        .fnd-facts { margin: 0 0 24px; border-top: 1px solid ${C.hair}; }
        .fnd-facts > div { display: grid; grid-template-columns: 110px 1fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${C.hair}; }
        .fnd-facts dt { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${C.muted}; padding-top: 2px; }
        .fnd-facts dd { margin: 0; font-size: 15px; line-height: 1.5; color: ${C.body}; }
        @media (min-width: 768px) {
          .fnd-wrap { padding-top: 64px; }
          .fnd-h1 { font-size: 52px; }
        }
        @media (max-width: 767px) {
          .fnd-facts > div { grid-template-columns: 1fr; gap: 2px; }
        }
      `}</style>
      {paid ? <Paid /> : <Checkout />}
    </div>
  );
}
