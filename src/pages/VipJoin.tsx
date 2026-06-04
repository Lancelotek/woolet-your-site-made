import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isValidLang, type Lang } from "@/lib/i18n";

const GOLD = "#CAA449";
const BG = "#080807";
const MUTED = "#888888";

const KICKSTARTER_PUBLIC_URL =
  "https://www.kickstarter.com/projects/wooletco/your-public-prelaunch-url";

const SESSION_KEY = "woolet_vip_signup_fired";

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

export default function VipJoin() {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        if (sessionStorage.getItem(SESSION_KEY) === "1") return;
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    } catch {
      /* sessionStorage unavailable — fire anyway */
    }
    pushEvent("vip_signup", { source: "scan_sequence" });
  }, []);

  return (
    <>
      <SEO
        title="You're on the VIP list — Woolet"
        description="VIP confirmation: you'll get the launch-day email plus 48h early access to the founding price."
        lang={lang}
        path="/vip-join"
        noindex
      />

      <Navbar />

      <main
        className="bg-background text-foreground"
        style={{ minHeight: "100vh" }}
      >
        <div className="px-5 sm:px-8 lg:px-16 py-16 sm:py-24">
          <div className="max-w-xl mx-auto flex flex-col gap-7">
            <div className="woolet-eyebrow">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">VIP CONFIRMED</span>
            </div>

            <h1
              className="font-display text-woolet-white"
              style={{
                fontSize: "clamp(2.25rem, 4.8vw, 3.25rem)",
                fontWeight: 300,
                lineHeight: 1.05,
              }}
            >
              You're on the <em className="italic" style={{ color: GOLD }}>VIP list</em>{" "}
              <span aria-hidden style={{ color: GOLD }}>✓</span>
            </h1>

            <p
              className="text-cream-dim"
              style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.6 }}
            >
              You'll get the launch-day email plus 48h early access to the founding price.
              Nothing else to do — keep an eye on your inbox.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <a
                href={KICKSTARTER_PUBLIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "transparent",
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.74rem",
                  padding: "14px 24px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  textAlign: "center",
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Open our Kickstarter page →
              </a>

              <Link
                to={`/${lang}`}
                style={{
                  color: MUTED,
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  textDecoration: "none",
                  paddingTop: 6,
                }}
              >
                Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
