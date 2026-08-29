import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import { pushGtmEvent } from "@/lib/gtm";
import { StripeCheckoutModal } from "@/components/StripeCheckoutModal";
import { persistRef, resolveReferredBy } from "@/lib/referral";
import heroManAsset from "@/assets/kickstarter-hero.png.asset.json";
import ksFit150 from "@/assets/ks-fit/woolet-150-bespoke-fit.jpg.asset.json";
import ksFit158 from "@/assets/ks-fit/woolet-158-signature.jpg.asset.json";
import ksFit162 from "@/assets/ks-fit/woolet-162-bespoke-extra-wide.jpg.asset.json";
import logoAsset from "@/assets/woolet-logo.png.asset.json";
const logo = logoAsset.url;
import w007BlackFrontAsset from "@/assets/woolet-007-black-front.jpeg.asset.json";
import w009BlackFrontAsset from "@/assets/woolet-009-black-front.png.asset.json";
import w007CardAsset from "@/assets/products/woolet-007-round-black-card.webp.asset.json";
import w009CardAsset from "@/assets/products/woolet-009-square-black-card.webp.asset.json";
import w009BlackAsset from "@/assets/woolet-009-black.png.asset.json";
import w009GreyAsset from "@/assets/woolet-009-grey.png.asset.json";
import w009TaupeAsset from "@/assets/woolet-009-taupe.png.asset.json";
import w009HavanaAsset from "@/assets/woolet-009-havana-front.png.asset.json";
import marek from "@/assets/author-marek.png";
import gregSquare from "@/assets/testimonials/greg-woolet-tester-square.webp";
import gregPortrait from "@/assets/testimonials/greg-woolet-tester.webp";
import kickstarterWordmark from "@/assets/kickstarter-wordmark-white.png";
import { RETURN_POLICY, shippingDetails, LIST_PRICE_SPEC, PRICE_VALID_UNTIL, SALE_PRICE, BESPOKE_PRICE, PRICE_CURRENCY } from "@/seo/commerce-schema";

// Bespoke gallery photos
import bespokeAviatorTortoiseSun from "@/assets/bespoke/aviator-tortoise-sun.png.asset.json";
import bespokeAviatorHavana from "@/assets/bespoke/aviator-havana.png.asset.json";
import bespokeAviatorCaramel from "@/assets/bespoke/aviator-caramel.png.asset.json";
import bespokeAviatorGreyStripe from "@/assets/bespoke/aviator-grey-stripe.png.asset.json";
import bespokeGreenRectangle from "@/assets/bespoke/green-rectangle.png.asset.json";
import bespokeGreenPinkPattern from "@/assets/bespoke/green-pink-pattern.png.asset.json";
import bespokeGreyStripeRect from "@/assets/bespoke/grey-stripe-rect.png.asset.json";
import bespokeBurgundy from "@/assets/bespoke/burgundy.png.asset.json";
import bespokePantoBlackRed from "@/assets/bespoke/panto-black-red.png.asset.json";
import bespokePantoNavy from "@/assets/bespoke/panto-navy.png.asset.json";
import bespokePantoHoney from "@/assets/bespoke/panto-honey.png.asset.json";
import bespokePantoGreenStripe from "@/assets/bespoke/panto-green-stripe.png.asset.json";
import wr29 from "@/assets/frames/wr-29.jpg.asset.json";
import wr31 from "@/assets/frames/wr-31.jpg.asset.json";
import wr34 from "@/assets/frames/wr-34.jpg.asset.json";
import wr37 from "@/assets/frames/wr-37.jpg.asset.json";

// ---------- Design tokens ----------
const INK = "#080807";
const CREAM = "#EDE9DE";
const TAUPE = "#BAAFA1";
const GOLD = "#CAA449";
const BRONZE = "#8A6E2E";
const HAIRLINE = "rgba(255,255,255,0.10)";
const HAIRLINE_STRONG = "rgba(255,255,255,0.18)";

// ---------- Kickstarter follow ----------
// Official prelaunch page. Do not alter the Kickstarter wordmark asset (brand policy).
const KICKSTARTER_URL =
  "https://www.kickstarter.com/projects/wooletco/woolet-finally-glasses-that-actually-fit-wider-faces";

const kickstarterFollowHref = (slot: string) =>
  `${KICKSTARTER_URL}?utm_source=woolet_site&utm_medium=lp&utm_campaign=ks_prelaunch&utm_content=${slot}`;

// ---------- Tester testimonial ----------
// DRAFT — quote and attribution pending written approval from the tester.
// Ship verbatim. Do not append a model name, colour or millimetre figure to the attribution.
const GREG_QUOTE =
  "Twenty years of frames that pinched. These are the first pair I forget I'm wearing.";
const GREG_ATTRIBUTION = "— Greg · Woolet tester";

// ---------- Hero gallery ----------
const heroGallery: { src: string; alt: string }[] = [
  { src: ksFit158.url, alt: "158 mm — The Signature: Woolet frames on a medium-to-large head" },
  { src: ksFit150.url, alt: "150 mm — Bespoke Fit: Woolet frames on an average-to-wide face" },
  { src: ksFit162.url, alt: "162 mm — Bespoke Extra Wide: Woolet frames on a large head and broad face" },
  { src: gregSquare, alt: "Greg, a Woolet tester, wearing a wide-fit Woolet frame in tortoise acetate" },
  { src: w009BlackAsset.url, alt: "Woolet 009 Soft-Square — black" },
  { src: w009GreyAsset.url, alt: "Woolet 009 Soft-Square — grey" },
  { src: w009TaupeAsset.url, alt: "Woolet 009 Soft-Square — taupe" },
  { src: w009HavanaAsset.url, alt: "Woolet 009 Soft-Square — havana" },
  { src: bespokeAviatorTortoiseSun.url, alt: "Woolet Bespoke Aviator — tortoise sun" },
  { src: bespokeAviatorHavana.url, alt: "Woolet Bespoke Aviator — havana" },
  { src: bespokeAviatorCaramel.url, alt: "Woolet Bespoke Aviator — caramel" },
  { src: bespokeAviatorGreyStripe.url, alt: "Woolet Bespoke Aviator — grey stripe" },
];

const bespokeGallery = [
  { src: bespokeAviatorTortoiseSun.url, shape: "Aviator", alt: "Woolet Bespoke Aviator sunglasses in tortoise acetate with warm amber lenses" },
  { src: bespokeAviatorHavana.url, shape: "Aviator", alt: "Woolet Bespoke Aviator glasses in classic Havana Mazzucchelli acetate" },
  { src: bespokeAviatorCaramel.url, shape: "Aviator", alt: "Woolet Bespoke Aviator glasses in caramel translucent acetate" },
  { src: bespokeAviatorGreyStripe.url, shape: "Aviator", alt: "Woolet Bespoke Aviator glasses in grey layered stripe acetate" },
  { src: bespokeGreenRectangle.url, shape: "Rectangle", alt: "Woolet Bespoke Rectangle glasses in deep green Italian acetate" },
  { src: bespokeGreenPinkPattern.url, shape: "Rectangle", alt: "Woolet Bespoke Rectangle glasses in green and pink marbled acetate pattern" },
  { src: bespokeGreyStripeRect.url, shape: "Rectangle", alt: "Woolet Bespoke Rectangle glasses in grey pinstripe layered acetate" },
  { src: bespokeBurgundy.url, shape: "Soft-Square", alt: "Woolet Bespoke Soft-Square glasses in rich burgundy acetate" },
  { src: bespokePantoBlackRed.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in black with red interior acetate" },
  { src: bespokePantoNavy.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in navy blue Italian acetate" },
  { src: bespokePantoHoney.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in warm honey translucent acetate" },
  { src: bespokePantoGreenStripe.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in green striped Mazzucchelli acetate" },
];

// ---------- CTA button ----------
const ctaButtonStyle: React.CSSProperties = {
  background: GOLD,
  color: INK,
  border: "none",
  borderRadius: 0,
  padding: "16px 28px",
  fontFamily: "Barlow, sans-serif",
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontSize: "12px",
  cursor: "pointer",
  transition: "background 0.2s ease",
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  color: CREAM,
  border: `1px solid ${HAIRLINE_STRONG}`,
  borderRadius: 0,
  padding: "14px 16px",
  fontFamily: "Barlow, sans-serif",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "Barlow, sans-serif",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: GOLD,
};

// ---------- VIP Form (email + consent only) ----------
const RESERVATION_PRICE_ID = "founding_member_deposit_1usd";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const VIP_JOINED_KEY = "wlt_ks_vip_joined";


const StepBar = ({ step }: { step: 1 | 2 }) => {
  const steps = ["Your email", "Reserve 40% OFF"];
  return (
    <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
      {steps.map((label, i) => {
        const index = (i + 1) as 1 | 2;
        const done = step > index;
        const active = step === index;
        return (
          <div key={label} className="flex items-center gap-2" style={{ flex: 1 }}>
            <span
              style={{
                width: 20,
                height: 20,
                flex: "0 0 20px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Barlow, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: active || done ? INK : TAUPE,
                background: active || done ? GOLD : "transparent",
                border: `1px solid ${active || done ? GOLD : HAIRLINE_STRONG}`,
              }}
            >
              {done ? "✓" : index}
            </span>
            <span
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: active ? CREAM : TAUPE,
                opacity: active ? 1 : 0.65,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            <span style={{ flex: 1, height: 1, background: done ? GOLD : HAIRLINE }} />
          </div>
        );
      })}
    </div>
  );
};

const VipForm = ({
  utmSource,
  idSuffix = "",
  referredBy,
  compact = false,
  onJoined,
}: {
  utmSource: string;
  idSuffix?: string;
  referredBy?: string | null;
  compact?: boolean;
  onJoined?: () => void;
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<"invalid" | "duplicate" | "generic" | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const formLocation = idSuffix ? idSuffix.replace(/^-/, "") : "default";

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/en/lp/kickstarter/vip-confirmed?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : "https://woolet.co/en/lp/kickstarter/vip-confirmed?paid=1&session_id={CHECKOUT_SESSION_ID}";

  const markJoined = () => {
    onJoined?.();
    try {
      localStorage.setItem(VIP_JOINED_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 320) {
      setErrorKind("invalid");
      setError("That email doesn't look right. Check the address and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setErrorKind(null);
    const models = "Kickstarter VIP";
    const resolvedRef = resolveReferredBy(normalizedEmail, referredBy);

    // Fire an attempt event first — independent of success/failure/redirect,
    // so we can measure submit intent even if the network call never returns.
    pushGtmEvent("kickstarter_form_submit_attempt", {
      form_location: formLocation,
      source: utmSource,
      referred_by: resolvedRef,
    });

    try {
      const { data: statusData } = await supabase.functions.invoke("vip-reservation-status", {
        body: { email: normalizedEmail },
      });
      if (statusData?.reserved) {
        setErrorKind("duplicate");
        setError("This email already has a VIP reservation.");
        setLoading(false);
        markJoined();
        pushGtmEvent("kickstarter_form_submit_error", {
          form_location: formLocation,
          source: utmSource,
          referred_by: resolvedRef,
          provider: "mailerlite",
          error_message: "duplicate_reservation",
        });
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          ...getAttribution(),
          email: normalizedEmail,
          name: "",
          source: "kickstarter",
          referred_by: resolvedRef,
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error || "Subscription failed");

      // Confirmation email — non-blocking, never fails the signup.
      void supabase.functions
        .invoke("vip-waitlist-email", { body: { email: normalizedEmail } })
        .catch((e) => console.error("VIP confirmation email failed:", e));



      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "waitlist_signup",
          user_email: normalizedEmail,
          user_first_name: "",
          waitlist_models: models,
          referred_by: resolvedRef,
        });
        try {
          sessionStorage.setItem(
            "woolet_vip_confirm",
            JSON.stringify({ email: normalizedEmail, name: "" }),
          );
        } catch {
          /* ignore */
        }
      }
      pushGtmEvent("generate_lead", {
        awareness_stage: "solution_aware",
        source: utmSource,
      });
      pushGtmEvent("kickstarter_form_submit_success", {
        form_location: formLocation,
        source: utmSource,
        referred_by: resolvedRef,
        provider: "mailerlite",
      });

      setEmail(normalizedEmail);
      setLoading(false);
      markJoined();
      setStep(2);
    } catch (err: unknown) {
      console.error("KS VIP error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      pushGtmEvent("kickstarter_form_submit_error", {
        form_location: formLocation,
        source: utmSource,
        referred_by: resolvedRef,
        provider: "mailerlite",
        error_message: message.slice(0, 200),
      });
      setErrorKind("generic");
      setError(message);
      setLoading(false);
    }

  };

  const consent = (
    <p
      style={{
        fontFamily: "Barlow, sans-serif",
        fontSize: 12,
        color: TAUPE,
        opacity: 0.6,
        lineHeight: 1.5,
        textAlign: compact ? "center" : "left",
        margin: 0,
      }}
    >
      By joining, you accept our{" "}
      <Link
        to="/en/privacy-policy"
        style={{ color: TAUPE, textDecoration: "underline", textUnderlineOffset: 2 }}
      >
        Privacy Policy
      </Link>{" "}
      and agree to receive launch emails. Unsubscribe anytime.
    </p>
  );

  if (step === 2) {
    return (
      <div
        id={`vip-form${idSuffix}`}
        className="flex flex-col gap-3"
        style={{ maxWidth: compact ? 560 : "100%", margin: compact ? "0 auto" : undefined }}
      >
        <StepBar step={2} />
        <p
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 13,
            color: CREAM,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          You're on the VIP list. Lock your <strong style={{ color: GOLD }}>40% OFF</strong> founding
          price with a refundable <strong>$1</strong> reservation — it holds your spot when the
          campaign opens.
        </p>
        <p
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 12,
            color: TAUPE,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          This $1 reservation is with Woolet, not a Kickstarter pledge. Fully refundable, or applied
          to your order.
        </p>
        <button
          type="button"
          onClick={() => {
            setCheckoutOpen(true);
            pushGtmEvent("kickstarter_reserve_click", {
              form_location: formLocation,
              source: utmSource,
            });
          }}
          style={ctaButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = BRONZE)}
          onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
        >
          Reserve 40% OFF — $1
        </button>
        <button
          type="button"
          onClick={() => navigate("/en/lp/kickstarter/vip-confirmed", { state: { email, name: "" } })}
          style={{
            background: "transparent",
            border: "none",
            color: TAUPE,
            fontFamily: "Barlow, sans-serif",
            fontSize: 12,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
            padding: 0,
            textAlign: compact ? "center" : "left",
          }}
        >
          Skip for now — stay on the free VIP list
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <KickstarterFollowCta slot="post_signup" label="You're on the list. Now follow on" />
        </div>
        <p
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 11,
            color: TAUPE,
            letterSpacing: "0.04em",
            textAlign: compact ? "center" : "left",
            margin: 0,
          }}
        >
          $1 today · Fully refundable · Applied to your pledge.
        </p>

        {checkoutOpen && (
          <StripeCheckoutModal
            priceId={RESERVATION_PRICE_ID}
            customerEmail={email}
            returnUrl={returnUrl}
            metadata={{
              campaign: "kickstarter_vip",
              form_location: formLocation,
              utm_source: utmSource,
            }}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </div>
    );
  }

  if (errorKind === "duplicate") {
    return (
      <div
        id={`vip-form${idSuffix}`}
        role="alert"
        className="flex flex-col gap-3"
        style={{
          maxWidth: compact ? 560 : "100%",
          margin: compact ? "0 auto" : undefined,
          border: `1px solid ${HAIRLINE_STRONG}`,
          borderLeft: `2px solid ${GOLD}`,
          padding: 18,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <p
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: GOLD,
            margin: 0,
          }}
        >
          Already reserved
        </p>
        <p
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 14,
            color: CREAM,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          <strong>{email.trim().toLowerCase()}</strong> already holds a VIP reservation with 40% OFF
          locked in. There's nothing more to pay — we'll email you the moment the campaign opens.
        </p>
        <button
          type="button"
          onClick={() => navigate("/en/lp/kickstarter/vip-confirmed", { state: { email, name: "" } })}
          style={ctaButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = BRONZE)}
          onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
        >
          Go to your VIP page
        </button>
        <button
          type="button"
          onClick={() => {
            setErrorKind(null);
            setError(null);
            setEmail("");
          }}
          style={{
            background: "transparent",
            border: "none",
            color: TAUPE,
            fontFamily: "Barlow, sans-serif",
            fontSize: 12,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
            padding: 0,
            textAlign: compact ? "center" : "left",
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (

    <form
      id={`vip-form${idSuffix}`}
      onSubmit={onSubmit}
      className="flex flex-col gap-3"
      style={{ maxWidth: compact ? 560 : "100%", margin: compact ? "0 auto" : undefined }}
    >
      <StepBar step={1} />
      <div className={compact ? "flex flex-col sm:flex-row gap-2" : "flex flex-col gap-2"}>
        <label htmlFor={`vip-email${idSuffix}`} className="sr-only">
          Your email address
        </label>
        <input
          id={`vip-email${idSuffix}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email"
          required
          value={email}
          aria-invalid={errorKind === "invalid"}
          aria-describedby={error ? `vip-form-error${idSuffix}` : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorKind) {
              setErrorKind(null);
              setError(null);
            }
          }}
          style={{
            ...inputStyle,
            flex: 1,
            borderColor: errorKind === "invalid" ? "#e25555" : inputStyle.borderColor,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor =
              errorKind === "invalid" ? "#e25555" : HAIRLINE_STRONG)
          }
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...ctaButtonStyle,
            background: GOLD,
            color: INK,
            width: compact ? "auto" : "100%",
            whiteSpace: "nowrap",
            opacity: loading ? 0.55 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.background = BRONZE;
          }}
          onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
        >
          {loading ? "Sending…" : "Claim Your Early Access"}
        </button>
      </div>

      {consent}

      {error && (
        <p
          id={`vip-form-error${idSuffix}`}
          role="alert"
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 12,
            color: "#e25555",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {error}
        </p>
      )}


      <p
        style={{
          fontFamily: "Barlow, sans-serif",
          fontSize: 11,
          color: TAUPE,
          letterSpacing: "0.04em",
          textAlign: compact ? "center" : "left",
          marginTop: 2,
        }}
      >
        Step 1 of 2 · Email now, optional $1 reservation next.
      </p>
    </form>
  );
};

// ---------- Section helpers ----------
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p style={eyebrowStyle}>{children}</p>
);

const Hairline = () => (
  <div style={{ height: 1, background: HAIRLINE, width: "100%" }} />
);

// ---------- Kickstarter follow CTA ----------
// The wordmark PNG is the official white Kickstarter wordmark, used unmodified.
const KickstarterFollowCta = ({
  slot,
  variant = "outline",
  label = "Follow us on",
}: {
  slot: string;
  variant?: "outline" | "quiet";
  label?: string;
}) => {
  const quiet = variant === "quiet";
  return (
    <a
      href={kickstarterFollowHref(slot)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => pushGtmEvent("kickstarter_follow_click", { slot, source: "ks_lp" })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        minHeight: 44,
        padding: quiet ? "8px 12px" : "12px 18px",
        border: `1px solid ${quiet ? HAIRLINE : HAIRLINE_STRONG}`,
        background: "transparent",
        color: CREAM,
        textDecoration: "none",
        fontFamily: "Barlow, sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ opacity: 0.75 }}>{label}</span>
      {/* Official white Kickstarter wordmark — never recolour, crop or restyle. */}
      <img
        src={kickstarterWordmark}
        alt="Kickstarter"
        width={960}
        height={102}
        loading="lazy"
        decoding="async"
        style={{ height: 12, width: "auto", display: "block" }}
      />
    </a>
  );
};

// ---------- Market width chart ----------
// Widest published frame widths, from each brand's own size guide or product
// specs. Sources: Cubitts size guide (XL = "more than 145 mm"); the figures for
// Warby Parker, Persol, Ray-Ban, Fatheadz and EYESHELLS match the ranges already
// published on our own /en/compare pages in src/data/competitors.ts — keep them
// in sync, two different numbers for one brand on one domain is indefensible.
const MARKET_ROWS = [
  { brand: "Cubitts",       tier: "XL",            mm: 145, label: "145 mm+", material: "acetate",            open: true  },
  { brand: "Warby Parker",  tier: "Extended Fit",  mm: 148, label: "148 mm",  material: "acetate" },
  { brand: "Persol",        tier: "largest caliber", mm: 148, label: "148 mm", material: "Italian acetate" },
  { brand: "Ray-Ban",       tier: "wide fits",     mm: 150, label: "150 mm",  material: "acetate, nylon" },
  { brand: "Fatheadz",      tier: "widest",        mm: 160, label: "~160 mm", material: "TR90 nylon, monel" },
  { brand: "EYESHELLS",     tier: "widest",        mm: 160, label: "~160 mm", material: "injected plastic" },
  { brand: "Woolet",        tier: "Signature",     mm: 158, label: "158 mm",  material: "Mazzucchelli 1849, hand finished", isWoolet: true },
];
const SCALE_MIN = 130;
const SCALE_MAX = 165;
const pctOf = (mm: number) => ((mm - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

const MarketWidthChart = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section>
      <style>{`
        .mkt-row { display: grid; grid-template-columns: 190px 1fr 84px; align-items: center; column-gap: 18px; }
        .mkt-bar { width: 0; transition: width 700ms cubic-bezier(0.2,0.7,0.2,1); }
        .mkt-shown .mkt-bar { width: var(--w); }
        @media (max-width: 639px) {
          .mkt-row { grid-template-columns: 1fr auto; column-gap: 12px; row-gap: 8px; }
          .mkt-brand { grid-column: 1; }
          .mkt-value { grid-column: 2; }
          .mkt-track-cell { grid-column: 1 / -1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mkt-bar { width: var(--w); transition: none; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 md:py-28">
        <Eyebrow>The market</Eyebrow>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            lineHeight: 1.1,
            color: CREAM,
            marginTop: 12,
          }}
        >
          Premium <em style={{ color: GOLD, fontStyle: "italic" }}>and</em> 158 mm didn't exist — until Woolet
        </h2>
        <p style={{ color: TAUPE, marginTop: 20, fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "62ch" }}>
          Premium acetate stops around 150 mm. Past that the market offers nylon and injection-moulded
          plastic. Nobody had put real width and Italian acetate in the same frame.
        </p>

        <div ref={ref} className={shown ? "mkt-shown" : undefined} style={{ marginTop: 40 }}>
          {/* 155 mm threshold label, above the first row, over the track column only */}
          <div className="mkt-row" style={{ marginBottom: 10 }}>
            <div className="mkt-brand" aria-hidden="true" />
            <div className="mkt-track-cell" style={{ position: "relative" }}>
              <div
                style={{
                  ...eyebrowStyle,
                  color: TAUPE,
                  fontSize: 10,
                  marginLeft: `${pctOf(155)}%`,
                  transform: "translateX(-6px)",
                  whiteSpace: "nowrap",
                }}
              >
                155 mm — where a wide face starts
              </div>
            </div>
            <div className="mkt-value" aria-hidden="true" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {MARKET_ROWS.map((r, i) => (
              <div
                key={r.brand}
                className="mkt-row"
                style={
                  r.isWoolet
                    ? { borderTop: `1px solid ${HAIRLINE}`, paddingTop: 18 }
                    : undefined
                }
              >
                <div className="mkt-brand">
                  <span style={{ color: CREAM, fontSize: r.isWoolet ? 15 : 14, fontWeight: r.isWoolet ? 500 : 400 }}>
                    {r.brand}
                  </span>{" "}
                  <span
                    style={{
                      color: TAUPE,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {r.tier}
                  </span>
                </div>

                <div className="mkt-track-cell">
                  <div style={{ position: "relative" }}>
                    {/* threshold line, behind the bars */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: `${pctOf(155)}%`,
                        top: -10,
                        bottom: -10,
                        width: 1,
                        borderLeft: "1px dashed rgba(202,164,73,0.45)",
                        zIndex: 0,
                      }}
                    />
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        background: "rgba(237,231,217,0.06)",
                        height: r.isWoolet ? 14 : 10,
                      }}
                    >
                      <div
                        className="mkt-bar"
                        style={{
                          // @ts-expect-error custom property
                          "--w": `${pctOf(r.mm)}%`,
                          transitionDelay: `${i * 60}ms`,
                          height: "100%",
                          background: r.isWoolet ? GOLD : "rgba(237,231,217,0.28)",
                          WebkitMaskImage: r.open
                            ? "linear-gradient(to right, #000 calc(100% - 12px), transparent 100%)"
                            : undefined,
                          maskImage: r.open
                            ? "linear-gradient(to right, #000 calc(100% - 12px), transparent 100%)"
                            : undefined,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      color: TAUPE,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      marginTop: 7,
                    }}
                  >
                    {r.material}
                  </div>
                </div>

                <div
                  className="mkt-value"
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: 13,
                    color: r.isWoolet ? GOLD : CREAM,
                  }}
                >
                  {r.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: TAUPE, fontSize: 11, lineHeight: 1.6, marginTop: 24, maxWidth: "62ch" }}>
          Widest published sizes, taken from each brand's own size guide or product specifications.
          Approximate and subject to change as their ranges change.
        </p>
      </div>
      <Hairline />
    </section>
  );
};


// ---------- Page ----------
const KickstarterPrelaunch = () => {
  const [params] = useSearchParams();
  const utmSource = params.get("utm_source") || "direct";
  const referredBy = params.get("ref");

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Sticky mobile CTA — appears after the hero scrolls away, hides while typing.
  const [stickyVisible, setStickyVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Gate Kickstarter follow CTAs behind the email capture.
  const [hasJoined, setHasJoined] = useState(false);
  useEffect(() => {
    try {
      setHasJoined(localStorage.getItem(VIP_JOINED_KEY) === "1");
    } catch {
      setHasJoined(false);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
    const onIn = (e: FocusEvent) => { if (isField(e.target)) setInputFocused(true); };
    const onOut = (e: FocusEvent) => { if (isField(e.target)) setInputFocused(false); };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  useEffect(() => {
    if (referredBy) {
      persistRef(referredBy);
      pushGtmEvent("vip_referral_visit", { ref: referredBy });
    }
  }, [referredBy]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i - 1 + heroGallery.length) % heroGallery.length);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => (i + 1) % heroGallery.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  useEffect(() => {
    if (lightboxOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [lightboxOpen]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    pushGtmEvent("page_view", {
      page_type: "kickstarter_prelaunch",
      awareness_stage: "solution_aware",
    });
  }, []);

  const faqs = useMemo(
    () => [
      {
        q: "Do I pay anything now?",
        a: "No. This page only joins you to the VIP list. You'll pledge on Kickstarter at launch if you want a pair.",
      },
      {
        q: "What if 158 mm doesn't fit me?",
        a: "Bespoke covers any width from 145 to 162 mm, built to measure with FitLens — our AI fit app that measures your face with your phone camera.",
      },
      {
        q: "Can I get prescription lenses?",
        a: "Yes. Every Woolet frame is prescription-ready. You can order frame-only and take them to your optician, or add prescription lenses at checkout.",
      },
      {
        q: "Where are they made and from what?",
        a: "Mazzucchelli acetate milled in Milan, then hand made in the EU. The material comes from Milan; the craftsmanship happens in our European atelier.",
      },
      {
        q: "How is this different from a Ray-Ban or Persol XL?",
        a: "XL models are scaled-up versions of frames designed for a ~137 mm face. Woolet is engineered wide from the first millimetre — 158 mm front, 20–21 mm keyhole bridge, proportions built for 155–161 mm faces.",
      },
      {
        q: "What exactly do VIPs get?",
        a: "Four things: early access to FitLens, the Bespoke configurator, up to 40% off retail, and the private VIP Facebook group with direct access to the founder.",
      },
    ],
    []
  );

  return (
    <div
      className="min-h-screen ks-lp"
      style={{
        background: INK,
        color: CREAM,
        fontFamily: "Barlow, sans-serif",
      }}
    >
      <Helmet prioritizeSeoTags>
        <html lang="en" dir="ltr" />
        <title>Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)</title>
        <meta
          name="description"
          content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. Join the VIP list for early access and up to 40% off the $190 retail price."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://woolet.co/en/lp/kickstarter" />
        <link rel="alternate" hrefLang="en" href="https://woolet.co/en/lp/kickstarter" />
        <link rel="alternate" hrefLang="x-default" href="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:title" content="Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)" />
        <meta
          property="og:description"
          content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. VIP early access and up to 40% off."
        />
        <meta property="og:url" content="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:image" content={heroManAsset.url} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)" />
        <meta name="twitter:description" content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. VIP early access and up to 40% off." />
        <meta name="twitter:image" content={heroManAsset.url} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://woolet.co/en" },
            { "@type": "ListItem", position: 2, name: "Kickstarter VIP", item: "https://woolet.co/en/lp/kickstarter" },
          ],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Woolet Kickstarter — signature frames",
          itemListElement: [
            {
              "@type": "Product",
              name: "Woolet 007 — Round",
              description: "Round Milanese acetate frame, 158 mm wide with a 21 mm keyhole bridge. Engineered for wide faces 155–161 mm.",
              image: w007BlackFrontAsset.url,
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: "https://woolet.co/en/lp/kickstarter",
                priceCurrency: PRICE_CURRENCY,
                price: SALE_PRICE,
                availability: "https://schema.org/PreOrder",
                priceValidUntil: PRICE_VALID_UNTIL,
                priceSpecification: LIST_PRICE_SPEC,
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: "Woolet", url: "https://woolet.co" },
                hasMerchantReturnPolicy: RETURN_POLICY,
                shippingDetails: shippingDetails(false),
              },
            },
            {
              "@type": "Product",
              name: "Woolet 009 — Soft-Square",
              description: "Soft-square Milanese acetate frame, 158 mm wide with a 20 mm keyhole bridge. Engineered for wide faces 155–161 mm.",
              image: w009BlackFrontAsset.url,
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: "https://woolet.co/en/lp/kickstarter",
                priceCurrency: PRICE_CURRENCY,
                price: SALE_PRICE,
                availability: "https://schema.org/PreOrder",
                priceValidUntil: PRICE_VALID_UNTIL,
                priceSpecification: LIST_PRICE_SPEC,
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: "Woolet", url: "https://woolet.co" },
                hasMerchantReturnPolicy: RETURN_POLICY,
                shippingDetails: shippingDetails(false),
              },
            },
            {
              "@type": "Product",
              name: "Woolet Bespoke — built to measure",
              description: "Bespoke Milanese acetate frames, 4 shapes, 60 colour and size combinations, any width from 145 to 162 mm.",
              image: heroManAsset.url,
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: "https://woolet.co/en/lp/kickstarter",
                priceCurrency: PRICE_CURRENCY,
                price: BESPOKE_PRICE,
                availability: "https://schema.org/PreOrder",
                priceValidUntil: PRICE_VALID_UNTIL,
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: "Woolet", url: "https://woolet.co" },
                hasMerchantReturnPolicy: RETURN_POLICY,
                shippingDetails: shippingDetails(true),
              },
            },
          ],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        })}</script>
      </Helmet>

      {/* Mobile refinements — scoped to this LP */}
      <style>{`
        @media (min-width: 768px) {
          .ks-hero-image { aspect-ratio: 4 / 5 !important; }
        }
        @media (max-width: 767px) {
          /* Taller hero crop on phones, capped so the headline and form stay above the fold */
          .ks-hero-image { aspect-ratio: 4 / 5 !important; max-height: 42vh; }

          .ks-lp section > div.max-w-6xl,
          .ks-lp section > div.max-w-4xl,
          .ks-lp section > div.max-w-3xl { padding-top: 44px !important; padding-bottom: 44px !important; }
          .ks-lp section:first-of-type > div.max-w-6xl { padding-top: 24px !important; padding-bottom: 24px !important; }

          /* Tighter, more editorial heading rhythm on mobile */
          .ks-lp h1 { font-size: 2rem !important; line-height: 1.08 !important; margin-top: 12px !important; }
          .ks-lp h2 { font-size: 1.6rem !important; line-height: 1.12 !important; margin-top: 10px !important; }
          .ks-lp h3 { font-size: 1.2rem !important; line-height: 1.2 !important; }
          .ks-lp p  { max-width: 60ch; }

          /* Room for the sticky CTA bar */
          .ks-lp footer { padding-bottom: 88px; }
        }
      `}</style>



      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link to="/en" className="flex items-center gap-2" aria-label="Woolet home">
            <img src={logo} alt="Woolet" style={{ height: 32, width: "auto" }} />
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="hidden sm:inline-flex"
              style={{
                ...eyebrowStyle,
                color: GOLD,
                border: `1px solid ${GOLD}`,
                padding: "5px 10px",
                fontSize: 10,
                letterSpacing: "0.14em",
                whiteSpace: "nowrap",
              }}
            >
              Soon on Kickstarter
            </span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 md:items-center min-w-0">
          {/* Left on desktop, second on mobile — gallery */}
          <div className="order-2 md:order-1">
            <div
              onClick={() => openLightbox(activeImg)}
              className="ks-hero-image"
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: "#0f0e0c",
                border: `1px solid ${HAIRLINE}`,
                overflow: "hidden",
                cursor: "zoom-in",
              }}
            >
              <img
                src={heroGallery[activeImg].src}
                alt={heroGallery[activeImg].alt}
                loading="eager"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div
              className="mt-4 flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {heroGallery.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => {
                    setActiveImg(i);
                    openLightbox(i);
                  }}
                  aria-label={`Open image ${i + 1} in lightbox`}
                  style={{
                    flex: "0 0 72px",
                    width: 72,
                    height: 72,
                    padding: 0,
                    border: `1px solid ${i === activeImg ? GOLD : HAIRLINE}`,
                    background: "#0f0e0c",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
            {/* Caption sits below the thumbnails so the strip stays adjacent to the hero image */}
            <p
              style={{
                marginTop: 12,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: TAUPE,
                letterSpacing: "0.02em",
              }}
            >
              {heroGallery[activeImg].alt}
            </p>
          </div>


          {/* Right on desktop, first on mobile — headline + email field above the fold */}
          <div className="order-1 md:order-2">
            <Eyebrow>VIP Early Access</Eyebrow>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', 'Newsreader', serif",
                fontWeight: 300,
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                lineHeight: 1.05,
                color: CREAM,
                marginTop: 16,
                letterSpacing: "-0.01em",
              }}
            >
              Eyewear built for wide faces.
            </h1>
            <p
              style={{
                color: TAUPE,
                fontSize: "1.05rem",
                lineHeight: 1.6,
                marginTop: 20,
                maxWidth: 520,
              }}
            >
              Premium Milanese acetate, hand made in the EU, engineered for faces the industry forgot — 155 mm and up. Launching soon on Kickstarter. Join the VIP list for early access and up to <span style={{ color: CREAM }}>40% off</span>.
            </p>

            <div id="vip-form-hero" style={{ marginTop: 28 }}>
              <VipForm utmSource={utmSource} idSuffix="-hero" referredBy={referredBy} onJoined={() => setHasJoined(true)} />
            </div>

            {/* Trust row */}
            <div
              className="mt-8 flex flex-wrap gap-x-5 gap-y-2"
              style={{ fontSize: 12.5, color: CREAM, letterSpacing: "0.02em" }}
            >
              <span>Milanese acetate</span>
              <span style={{ color: TAUPE }}>·</span>
              <span>Hand made in the EU</span>
              <span style={{ color: TAUPE }}>·</span>
              <span>155 mm+ wide fit</span>
              <span style={{ color: TAUPE }}>·</span>
              <span>Worn by our testers</span>
            </div>

          </div>
        </div>
        <Hairline />
      </section>

      {/* WHAT VIPs GET */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
          <Eyebrow>The VIP list</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            Four things only VIPs get.
          </h2>

          <div className="grid sm:grid-cols-2 gap-px mt-10" style={{ background: HAIRLINE }}>
            {[
              {
                t: "Access to FitLens",
                d: "First access to our AI fit app — measure your face with your phone camera and get your exact Woolet size before you pledge.",
              },
              {
                t: "Bespoke configurator",
                d: "Design your own frame: 4 shapes, 60 colour and size combinations, any width from 145 to 162 mm, built to measure.",
              },
              {
                t: "Up to 40% off",
                d: "Lock the lowest price we'll ever offer — up to 40% off the $190 retail, reserved for VIPs at launch.",
              },
              {
                t: "Facebook VIP group",
                d: "Join the private VIP group: behind-the-scenes updates, early votes on colours, and a direct line to the founder.",
              },
            ].map((p, i) => (
              <div key={p.t} style={{ background: INK, padding: "36px 28px" }}>
                <div style={{ ...eyebrowStyle, marginBottom: 12 }}>0{i + 1}</div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    color: CREAM,
                    marginBottom: 10,
                  }}
                >
                  {p.t}
                </h3>
                <p style={{ color: TAUPE, fontSize: 14, lineHeight: 1.65 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
        <Hairline />
      </section>

      {/* PROBLEM / REFRAME */}
      <section style={{ background: "#0b0a09" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 md:py-28">
          <Eyebrow>The wide-face problem</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
            }}
          >
            You're not too wide.<br />
            <em style={{ color: GOLD, fontStyle: "italic" }}>The frame is too narrow.</em>
          </h2>
          <p style={{ color: TAUPE, marginTop: 20, fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 620 }}>
            Standard frames are drawn for a face around <span style={{ color: CREAM }}>137 mm</span> wide. Wide faces measure <span style={{ color: CREAM }}>155 mm+</span>. Woolet begins at <span style={{ color: CREAM }}>158 mm</span> — engineered wide from the first millimetre. Built for the faces the industry forgot.
          </p>

          <div
            className="mt-10 grid sm:grid-cols-3"
            style={{ borderTop: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}` }}
          >
            {[
              { n: "137 mm", d: "Industry standard face width" },
              { n: "155 mm+", d: "A typical wide face" },
              { n: "158 mm", d: "Where Woolet begins" },
            ].map((s, i) => (
              <div
                key={s.n}
                style={{
                  padding: "28px 8px",
                  borderRight: i < 2 ? `1px solid ${HAIRLINE}` : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 300,
                    color: i === 2 ? GOLD : CREAM,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ ...eyebrowStyle, color: TAUPE, marginTop: 6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET WIDTH CHART */}
      <MarketWidthChart />



      {/* SIGNATURE SHAPES */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>Signature shapes</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            One precise size. <em style={{ color: GOLD, fontStyle: "italic" }}>158 mm.</em> Fits 155–161 mm faces.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              {
                name: "Woolet 007",
                shape: "Round",
                photo: w007CardAsset.url,
                photoAlt: "Woolet 007 round frame in black acetate, front view",
                srp: 190,
                kickstarter: 114,
                specs: [
                  ["Front width", "158 mm"],
                  ["Bridge", "21 mm keyhole"],
                  ["Lens", "54 × 42 mm"],
                  ["Temple", "103 mm"],
                  ["Front height", "52 mm"],
                ],
              },
              {
                name: "Woolet 009",
                shape: "Soft-Square",
                photo: w009CardAsset.url,
                photoAlt: "Woolet 009 soft-square frame in black acetate, front view",
                srp: 190,
                kickstarter: 114,
                specs: [
                  ["Front width", "158 mm"],
                  ["Bridge", "20 mm keyhole"],
                  ["Lens", "51 × 45 mm"],
                  ["Temple", "103 mm"],
                  ["Front height", "54 mm"],
                ],
              },
            ].map((m) => (
              <article key={m.name} style={{ border: `1px solid ${HAIRLINE}` }}>
                <div
                  style={{
                    background: INK,
                    aspectRatio: "4 / 3",
                    overflow: "hidden",
                    borderBottom: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <img
                    src={m.photo}
                    alt={m.photoAlt}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </div>

                <div style={{ padding: "28px 24px" }}>
                  <div style={{ ...eyebrowStyle, color: TAUPE }}>{m.shape}</div>
                  <div className="flex items-start justify-between gap-4" style={{ marginTop: 4 }}>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 400,
                        fontSize: "1.75rem",
                        color: CREAM,
                      }}
                    >
                      {m.name}
                    </h3>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end" }}>
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 400,
                            fontSize: "1.5rem",
                            color: GOLD,
                          }}
                        >
                          from ${m.kickstarter}
                        </span>
                        <span
                          style={{
                            fontFamily: "Barlow, sans-serif",
                            fontSize: 13,
                            color: TAUPE,
                            textDecoration: "line-through",
                          }}
                        >
                          ${m.srp}
                        </span>
                      </div>
                      <span
                        style={{
                          ...eyebrowStyle,
                          color: GOLD,
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        Kickstarter Early Bird
                      </span>
                    </div>
                  </div>
                  {/* TODO: do not change these millimetre figures without sign-off from production. */}
                  <div className="mt-5 flex items-start gap-5">
                    {/* Schematic sits beside the numbers, where it helps read the dimensions */}
                    <div style={{ flex: "0 0 96px", opacity: 0.7, paddingTop: 4 }}>
                      <FrameOutline
                        variant={m.name === "Woolet 007" ? "round" : "square"}
                        label={`${m.name} — ${m.shape} dimension schematic`}
                      />
                    </div>
                    <dl className="grid grid-cols-2 gap-y-2 gap-x-4" style={{ flex: 1, minWidth: 0 }}>
                      {m.specs.map(([k, v]) => (
                        <div key={k} style={{ display: "contents" }}>
                          <dt style={{ ...eyebrowStyle, color: TAUPE }}>{k}</dt>
                          <dd style={{ fontSize: 14, color: CREAM, textAlign: "right" }}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <p style={{ marginTop: 16, fontSize: 12, color: TAUPE, lineHeight: 1.6 }}>
                    Early Bird pricing opens with the campaign and rises once the first tier is
                    claimed. VIPs get the link first.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <Hairline />
      </section>

      {/* WHAT MAKES A WOOLET FIT */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>What makes a Woolet fit</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            Three details. <em style={{ color: GOLD, fontStyle: "italic" }}>One frame that stays put.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            {[
              {
                t: "FitLens",
                sub: "Know your size before you pledge",
                d: "Our AI fit app measures your face temple-to-temple with your phone camera and recommends the exact Woolet size — so the frame you back is the frame that fits.",
              },
              {
                t: "Keyhole Bridge",
                sub: "20–21 mm, rests on the sides of the nose",
                d: "The bridge sits on the sides of the nose rather than the top, so the frame sits level, doesn't slide, and leaves no red marks at the end of the day.",
              },
              {
                t: "Milanese Acetate",
                sub: "Mazzucchelli, milled in Milan",
                d: "Sheet acetate from Mazzucchelli in Milan, then hand made in the EU. Denser and longer-lasting than injection-moulded plastic, with warmer colour depth.",
              },
            ].map((b) => (
              <div key={b.t}>
                <div style={{ height: 1, background: GOLD, width: 32, marginBottom: 20 }} />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    color: CREAM,
                  }}
                >
                  {b.t}
                </h3>
                <p style={{ ...eyebrowStyle, color: TAUPE, marginTop: 6 }}>{b.sub}</p>
                <p style={{ color: TAUPE, fontSize: 14, lineHeight: 1.7, marginTop: 14 }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MID CTA BAND */}
      <section style={{ background: "#0b0a09", borderTop: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
          <Eyebrow>Join the VIP list</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
              lineHeight: 1.15,
              color: CREAM,
              marginTop: 12,
              marginBottom: 24,
            }}
          >
            Early access, up to <em style={{ color: GOLD, fontStyle: "italic" }}>40% off</em>, and FitLens before launch.
          </h2>
          <div id="vip-form-mid">
            <VipForm utmSource={utmSource} idSuffix="-mid" referredBy={referredBy} compact onJoined={() => setHasJoined(true)} />
          </div>
        </div>
      </section>

      {/* BESPOKE GALLERY */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>Bespoke</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 720,
            }}
          >
            Nothing wide enough? <em style={{ color: GOLD, fontStyle: "italic" }}>We build yours to measure.</em>
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2" style={{ fontSize: 13, color: TAUPE, letterSpacing: "0.02em" }}>
            <span>4 shapes</span>
            <span>·</span>
            <span>60 colour and size combinations</span>
            <span>·</span>
            <span>Any width 145–172 mm</span>
            <span>·</span>
            <span>Built to measure with FitLens</span>
            <span style={{ color: CREAM, marginLeft: 4 }}>
              Kickstarter Early Bird <span style={{ color: GOLD, fontWeight: 600 }}>$299</span>
            </span>
            <span style={{ textDecoration: "line-through" }}>SRP $480</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {bespokeGallery.map((f, i) => (
              <div key={i} style={{ border: `1px solid ${HAIRLINE}` }}>
                <div style={{ background: CREAM, aspectRatio: "1 / 1", overflow: "hidden" }}>
                  <img
                    src={f.src}
                    alt={f.alt}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="flex items-center justify-between" style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 13, color: CREAM }}>{f.shape}</span>
                  <span
                    style={{
                      ...eyebrowStyle,
                      color: GOLD,
                      border: `1px solid ${GOLD}`,
                      padding: "3px 8px",
                      fontSize: 11,
                    }}
                  >
                    Bespoke
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Hairline />
      </section>

      {/* TESTER TESTIMONIAL — DRAFT copy, pending written approval. */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 md:items-center">
          <figure style={{ margin: 0, border: `1px solid ${HAIRLINE}`, overflow: "hidden" }}>
            <img
              src={gregPortrait}
              alt="Greg, a Woolet tester, wearing a wide-fit Woolet frame outdoors"
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "auto", display: "block", aspectRatio: "4 / 5", objectFit: "cover" }}
            />
          </figure>
          <div>
            <Eyebrow>From a tester</Eyebrow>
            <blockquote
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(1.35rem, 2.4vw, 2rem)",
                lineHeight: 1.35,
                color: CREAM,
                marginTop: 16,
                fontStyle: "italic",
              }}
            >
              “{GREG_QUOTE}”
            </blockquote>
            <p style={{ ...eyebrowStyle, color: TAUPE, marginTop: 20 }}>{GREG_ATTRIBUTION}</p>
          </div>
        </div>
        <Hairline />
      </section>

      {/* FOUNDER */}
      <section style={{ background: "#0b0a09" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 md:py-24 flex flex-col sm:flex-row gap-10 items-start">
          <Link to="/en/about" aria-label="About Woolet and its founder" style={{ flexShrink: 0 }}>
            <img
              src={marek}
              alt="Marek Ciesla — Woolet founder"
              loading="lazy"
              decoding="async"
              style={{
                width: 128,
                height: 128,
                objectFit: "cover",
                border: `1px solid ${HAIRLINE_STRONG}`,
                display: "block",
              }}
            />
          </Link>
          <div>
            <Eyebrow>A note from the founder</Eyebrow>
            <blockquote
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)",
                lineHeight: 1.35,
                color: CREAM,
                marginTop: 16,
                fontStyle: "italic",
              }}
            >
              "I'm 161 mm across. For twenty years I gave up on glasses that actually fit. So I built the brand I wanted to buy from — Milanese acetate, made wide from the first millimetre. Kickstarter is how we get the first pairs to the people who need them most."
            </blockquote>
            <p style={{ ...eyebrowStyle, color: TAUPE, marginTop: 20 }}>— Marek Ciesla, Founder</p>
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>How it works</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            Three steps.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mt-12" style={{ background: HAIRLINE }}>
            {[
              { n: "01", t: "Join the VIP list", d: "Email only — no payment, no commitment." },
              { n: "02", t: "We email you at launch", d: "You'll be first in line the moment we go live on Kickstarter." },
              { n: "03", t: "Follow now, pledge at launch", d: "Kickstarter emails you from their own domain the minute we go live." },
            ].map((s) => (
              <div key={s.n} style={{ background: INK, padding: "32px 24px" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 300,
                    color: GOLD,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: "1.35rem",
                    color: CREAM,
                    marginTop: 8,
                  }}
                >
                  {s.t}
                </h3>
                <p style={{ color: TAUPE, fontSize: 14, lineHeight: 1.65, marginTop: 10 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {hasJoined ? (
              <KickstarterFollowCta slot="how_it_works" />
            ) : (
              <span style={{ fontSize: 12.5, color: TAUPE, lineHeight: 1.5 }}>
                We'll send you the Kickstarter link the moment we launch.
              </span>
            )}
          </div>
        </div>
        <Hairline />
      </section>

      {/* FAQ */}
      <section>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>FAQ</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              marginBottom: 28,
            }}
          >
            Questions before you join.
          </h2>
          <div style={{ borderTop: `1px solid ${HAIRLINE}` }}>
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "22px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      color: CREAM,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.2rem",
                        fontWeight: 400,
                        color: CREAM,
                      }}
                    >
                      {f.q}
                    </span>
                    <span
                      style={{
                        color: GOLD,
                        fontSize: 20,
                        transform: open ? "rotate(45deg)" : "rotate(0)",
                        transition: "transform 0.25s",
                        display: "inline-block",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <p
                      style={{
                        color: TAUPE,
                        fontSize: 14,
                        lineHeight: 1.7,
                        paddingBottom: 24,
                        maxWidth: 620,
                      }}
                    >
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#0b0a09", borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
          <Eyebrow>Last thing</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              marginBottom: 20,
            }}
          >
            Be first when the campaign <em style={{ color: GOLD, fontStyle: "italic" }}>goes live.</em>
          </h2>
          <p style={{ color: TAUPE, fontSize: 15, lineHeight: 1.6, marginBottom: 28, maxWidth: 520, marginInline: "auto" }}>
            One email. Early access to FitLens, the Bespoke configurator, and Early Bird pricing from $114 against the $190 retail price.
          </p>
          <div id="vip-form-final">
            <VipForm utmSource={utmSource} idSuffix="-final" referredBy={referredBy} compact onJoined={() => setHasJoined(true)} />
          </div>
          {hasJoined ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <span style={{ ...eyebrowStyle, color: TAUPE, fontSize: 11 }}>Or follow the campaign</span>
              <KickstarterFollowCta slot="final_cta" label="Follow us on" />
            </div>
          ) : (
            <p
              className="mt-8"
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: 12.5,
                color: TAUPE,
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              We'll send you the Kickstarter link the moment we launch.
            </p>
          )}
        </div>
      </section>

      {/* Sticky mobile CTA — hidden while a field has focus so it never covers the keyboard target */}
      <div
        className="md:hidden"
        aria-hidden={!stickyVisible || inputFocused}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "rgba(8,8,7,0.94)",
          borderTop: `1px solid ${HAIRLINE_STRONG}`,
          backdropFilter: "blur(6px)",
          transform: stickyVisible && !inputFocused ? "translateY(0)" : "translateY(120%)",
          transition: "transform 0.25s ease",
          pointerEvents: stickyVisible && !inputFocused ? "auto" : "none",
        }}
      >
        {hasJoined ? (
          <KickstarterFollowCta slot="sticky_mobile" label="Follow us on" />
        ) : (
          <a
            href="#vip-form-final"
            onClick={() => pushGtmEvent("kickstarter_sticky_cta_click", { slot: "sticky_mobile" })}
            style={{
              ...ctaButtonStyle,
              flex: 1,
              textAlign: "center",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
            }}
          >
            Get Early Access
          </a>
        )}
      </div>


      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-8" style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: TAUPE, letterSpacing: "0.04em", lineHeight: 1.6 }}>
          30-day returns · Free worldwide shipping · Hand made in the EU
        </p>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div
          className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ fontSize: 12, color: TAUPE, letterSpacing: "0.04em" }}
        >
          <div className="font-wordmark" style={{ fontSize: 20, color: CREAM }}>
            WOOLET
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.6, color: TAUPE, width: "100%", textAlign: "center", order: -1 }}>
            Kickstarter is a registered trademark of Kickstarter, PBC. Woolet is not affiliated with
            or endorsed by Kickstarter.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>© {new Date().getFullYear()} Woolet · JAY23 LLC · Hand made in the EU</p>
          <div className="flex gap-2">
            <Link to="/en/privacy-policy" style={{ color: TAUPE, fontSize: 13, padding: "12px 14px", display: "inline-flex", alignItems: "center", minHeight: 44 }}>Privacy</Link>
            <Link to="/en/return-policy" style={{ color: TAUPE, fontSize: 13, padding: "12px 14px", display: "inline-flex", alignItems: "center", minHeight: 44 }}>Terms</Link>
          </div>
        </div>
      </footer>
      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(8,8,7,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 44,
              height: 44,
              background: "transparent",
              border: "none",
              color: CREAM,
              fontSize: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i - 1 + heroGallery.length) % heroGallery.length);
            }}
            aria-label="Previous image"
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${HAIRLINE}`,
              color: CREAM,
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i + 1) % heroGallery.length);
            }}
            aria-label="Next image"
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${HAIRLINE}`,
              color: CREAM,
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ›
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(100%, 900px)",
              maxHeight: "min(90vh, 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <img
              src={heroGallery[lightboxIndex].src}
              alt={heroGallery[lightboxIndex].alt}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(90vh - 80px)",
                objectFit: "contain",
                display: "block",
                border: `1px solid ${HAIRLINE}`,
              }}
            />
            <p
              style={{
                color: TAUPE,
                fontSize: 13,
                letterSpacing: "0.04em",
                fontFamily: "Barlow, sans-serif",
                textAlign: "center",
              }}
            >
              {lightboxIndex + 1} / {heroGallery.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KickstarterPrelaunch;

function FrameOutline({ variant, label }: { variant: "round" | "square"; label: string }) {
  const stroke = CREAM;
  return (
    <svg
      viewBox="0 0 320 110"
      role="img"
      aria-label={label}
      style={{ width: "100%", maxWidth: 320, height: "auto", opacity: 0.9 }}
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {variant === "round" ? (
        <>
          <circle cx="104" cy="58" r="40" />
          <circle cx="216" cy="58" r="40" />
          <path d="M144 50c6-8 26-8 32 0" />
        </>
      ) : (
        <>
          <rect x="64" y="26" width="82" height="62" rx="12" />
          <rect x="174" y="26" width="82" height="62" rx="12" />
          <path d="M146 44h28" />
        </>
      )}
      <path d="M64 46 18 32" />
      <path d="M256 46l46-14" />
    </svg>
  );
}
