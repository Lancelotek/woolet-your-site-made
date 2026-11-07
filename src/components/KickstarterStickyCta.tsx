import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FOUNDER_EDITION, FOUNDER_SIGNUP_PATH, founderCtaActive, isKickstarterLive, kickstarterLiveHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/**
 * Mobile-only bottom bar shown site-wide while the campaign is live, once the
 * visitor has scrolled past the top bar. The mobile navbar hides its CTA in the
 * hamburger, so without this a reader deep in an article has no way to the
 * campaign. Pages with their own bottom bar or a task flow are excluded.
 */
const EXCLUDED =
  /\/(admin|crm|account|payments|creatives|thank-you|danke|reserve|oauth)(\/|$)|\/lp\/|\/bespoke(\/|$)|\/products\/bespoke(\/|$)|\/lunettes-sur-mesure(\/|$)|\/fit\/(scan|wizard|quick|manual|bespoke)/;

const SHOW_AFTER_PX = 420;

const F = FOUNDER_EDITION;
const COPY: Record<string, { note: string; cta: string }> = {
  en: { note: `$${F.price} instead of $${F.srp} · ${F.left} left`, cta: "Founder Edition →" },
  pl: { note: `$${F.price} zamiast $${F.srp} · zostało ${F.left}`, cta: "Founder Edition →" },
  de: { note: `$${F.price} statt $${F.srp} · noch ${F.left}`, cta: "Founder Edition →" },
};
const COPY_KS: Record<string, string> = {
  en: "Back us on Kickstarter →",
  pl: "Wesprzyj na Kickstarterze →",
  de: "Auf Kickstarter unterstützen →",
};

export default function KickstarterStickyCta() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const active = isKickstarterLive() && !EXCLUDED.test(pathname);

  useEffect(() => {
    if (!active) return;
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Room at the bottom so the bar never covers the last lines of the footer.
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const prev = document.body.style.paddingBottom;
    if (mobile) document.body.style.paddingBottom = "56px";
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.style.paddingBottom = prev;
    };
  }, [active, pathname]);

  if (!active) return null;
  const lang = pathname.split("/")[1] || "en";
  const copy = COPY[lang] ?? COPY.en;
  const slot = pathname.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";

  const founder = founderCtaActive();
  const Tag = (founder ? Link : "a") as React.ElementType;
  const target = founder
    ? { to: FOUNDER_SIGNUP_PATH }
    : { href: kickstarterLiveHref("sticky_mobile", slot) };

  return (
    <>
      <Tag
        {...target}
        onClick={() =>
          pushGtmEvent(founder ? "founder_cta_click" : "ks_cta_click", { placement: "sticky_mobile", page_path: pathname })
        }
        className={`sticky-mobile-cta md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-between no-underline transition-all duration-300 ease-out ${
          visible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        style={{
          background: "#CAA449",
          color: "#080807",
          padding: "12px 20px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          minHeight: 48,
          zIndex: 100,
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {founder && <span style={{ fontWeight: 400, fontSize: 11, color: "rgba(0,0,0,0.72)" }}>{copy.note}</span>}
        <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.5px", marginLeft: founder ? undefined : "auto", marginRight: founder ? undefined : "auto" }}>
          {founder ? copy.cta : COPY_KS[lang] ?? COPY_KS.en}
        </span>
      </Tag>
    </>
  );
}
