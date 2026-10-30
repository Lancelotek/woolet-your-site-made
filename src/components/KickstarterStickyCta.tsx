import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isKickstarterLive, kickstarterLiveHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/**
 * Mobile-only bottom bar shown site-wide while the campaign is live, once the
 * visitor has scrolled past the top bar. The mobile navbar hides its CTA in the
 * hamburger, so without this a reader deep in an article has no way to the
 * campaign. Pages with their own bottom bar or a task flow are excluded.
 */
const EXCLUDED =
  /\/(admin|crm|account|payments|creatives|thank-you|danke|reserve|oauth)(\/|$)|\/lp\/|\/bespoke\/(checkout|configurator|measurements|photo|scan|shipping)|\/fit\/(scan|wizard|quick|manual|bespoke)/;

const SHOW_AFTER_PX = 420;

const COPY: Record<string, { note: string; cta: string }> = {
  en: { note: "Early Bird: $114, then $190", cta: "Back us on Kickstarter →" },
  pl: { note: "Early Bird: $114, potem $190", cta: "Wesprzyj na Kickstarterze →" },
  de: { note: "Early Bird: $114, danach $190", cta: "Auf Kickstarter unterstützen →" },
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

  return (
    <>
      <a
        href={kickstarterLiveHref("sticky_mobile", slot)}
        onClick={() => pushGtmEvent("ks_cta_click", { placement: "sticky_mobile", page_path: pathname })}
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
        <span style={{ fontWeight: 400, fontSize: 11, color: "rgba(0,0,0,0.72)" }}>{copy.note}</span>
        <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.5px" }}>{copy.cta}</span>
      </a>
    </>
  );
}
