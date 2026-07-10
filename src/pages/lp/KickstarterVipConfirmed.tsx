import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import logoAsset from "@/assets/woolet-logo.png.asset.json";
import vipBespokePreview from "@/assets/vip-bespoke-preview.png.asset.json";
const logo = logoAsset.url;

const KS_LAUNCH_DATE_LABEL = "September 19, 2026";

type LocationState = { email?: string; name?: string } | null;

const KickstarterVipConfirmed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || null;

  // Fall back to localStorage in case the user refreshes
  const fallback = useMemo(() => {
    if (typeof window === "undefined") return { email: "", name: "" };
    try {
      const raw = sessionStorage.getItem("woolet_vip_confirm");
      return raw ? JSON.parse(raw) : { email: "", name: "" };
    } catch {
      return { email: "", name: "" };
    }
  }, []);

  const email = state?.email || fallback.email || "";
  const name = state?.name || fallback.name || "";

  useEffect(() => {
    if (!email) {
      // No signup context — bounce back to the LP
      navigate("/en/lp/kickstarter", { replace: true });
      return;
    }
    try {
      sessionStorage.setItem("woolet_vip_confirm", JSON.stringify({ email, name }));
    } catch {
      /* ignore */
    }
    pushGtmEvent("vip_confirmed", { source: "kickstarter_lp" });
  }, [email, name, navigate]);

  const trackVipFacebookGroupClick = () => {
    // Fire once per click across handlers (click + auxClick for middle-mouse)
    const w = window as unknown as {
      __wooletVipFbTracked?: number;
      gtag?: (...args: unknown[]) => void;
    };
    const now = Date.now();
    if (w.__wooletVipFbTracked && now - w.__wooletVipFbTracked < 800) return;
    w.__wooletVipFbTracked = now;

    // GTM dataLayer event (existing pipeline)
    pushGtmEvent("vip_facebook_group_click", {
      source: "kickstarter_vip_confirmed",
      destination: "facebook_group",
      campaign: "kickstarter_vip",
    });

    // Direct GA4 event — fires even if GTM is blocked or the redirect happens fast
    if (typeof w.gtag === "function") {
      w.gtag("event", "vip_facebook_group_click", {
        event_category: "engagement",
        event_label: "kickstarter_vip_confirmed",
        source: "kickstarter_vip_confirmed",
        destination: "facebook_group",
        campaign: "kickstarter_vip",
        transport_type: "beacon",
      });
    }
  };

  return (
    <div className="lp-scope min-h-screen bg-[#0f0f0f] text-woolet-white font-body">
      <Helmet>
        <title>You're on the VIP list — Woolet Kickstarter</title>
        <meta name="description" content="You're on the Woolet VIP list. Get early access, see how we build bespoke glasses for wide faces, and join the VIP group before the Kickstarter launch." />
        <meta property="og:description" content="You're on the Woolet VIP list. Get early access, see how we build bespoke glasses for wide faces, and join the VIP group before the Kickstarter launch." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="border-b border-[#1a1612]">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link to="/en" className="flex items-center gap-2">
            <img src={logo} alt="Woolet" className="h-8 w-auto" />
          </Link>
          <span className="text-[12px] sm:text-xs uppercase tracking-[0.22em] text-primary border border-primary/40 rounded-full px-3 py-1">
            VIP Confirmed
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 lp-section">
        {/* Success */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full border border-primary/50 flex items-center justify-center text-primary text-lg mb-6">
            ✓
          </div>
          <p className="text-primary uppercase tracking-[0.28em] text-[12px] mb-4">
            You're in{name ? `, ${name}` : ""}.
          </p>
          <h1 className="font-display text-woolet-white leading-[1.1] text-[2rem] sm:text-[2.75rem] mb-4">
            You're on the VIP list.
          </h1>
          <p className="text-[#D8D4CC] text-base sm:text-lg leading-relaxed max-w-lg">
            Watch your inbox on <span className="text-woolet-white">{KS_LAUNCH_DATE_LABEL}</span> — we'll send your hidden-pledge link the moment the campaign opens.
          </p>
        </div>

        {/* Bespoke preview — what VIPs see first */}
        <section className="mt-10" aria-labelledby="bespoke-preview-heading">
          <p className="text-primary uppercase tracking-[0.24em] text-[12px] mb-3">Behind the scenes</p>
          <h2 id="bespoke-preview-heading" className="font-display text-woolet-white text-2xl sm:text-3xl leading-tight mb-4">
            How Woolet builds bespoke glasses for wide faces.
          </h2>
          <p className="text-[#D8D4CC] text-sm leading-relaxed mb-5">
            The VIP group is the only place where early backers see the full process — from AI face scan to a finished frame hand made in the EU. Click the preview to join the group.
          </p>
          <a
            href="https://www.facebook.com/groups/867413636043717/?utm_source=woolet.co&utm_medium=referral&utm_campaign=kickstarter_vip&utm_content=vip_confirmed_bespoke_preview"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch the full bespoke process in the WOOLET VIP group"
            onClick={trackVipFacebookGroupClick}
            onAuxClick={trackVipFacebookGroupClick}
            className="block rounded-sm overflow-hidden border hover:opacity-90 transition-opacity"
            style={{ borderColor: "hsl(var(--gold) / 0.25)" }}
          >
            <img
              src={vipBespokePreview.url}
              alt="Video preview: How Woolet builds bespoke glasses for wide faces"
              className="w-full h-auto"
              loading="eager"
            />
          </a>
        </section>

        {/* VIP Facebook group — single CTA */}
        <section className="mt-10 border rounded-sm p-6 sm:p-8" style={{ borderColor: "hsl(var(--gold) / 0.25)" }}>
          <p className="text-primary uppercase tracking-[0.24em] text-[12px] mb-3">Shape the product</p>
          <h2 className="font-display text-woolet-white text-2xl sm:text-3xl leading-tight mb-4">
            Join the WOOLET VIP group.
          </h2>
          <p className="text-[#D8D4CC] text-sm leading-relaxed mb-5">
            This is the only place where early backers get a direct voice before launch. No surveys, no guessing — just real conversations that decide what ships.
          </p>
          <ul className="mb-6 space-y-3">
            {[
              { t: "Vote on final colors & shapes", d: "Help us decide which acetates and frame details make it into the campaign." },
              { t: "Talk directly to the creators", d: "Ask questions, give feedback, and see behind-the-scenes samples before anyone else." },
              { t: "Get launch news first", d: "Be the first to know when the hidden-pledge link goes live and limited tiers unlock." },
            ].map((item) => (
              <li key={item.t} className="flex gap-3 items-start">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <div>
                  <p className="text-woolet-white text-sm font-medium">{item.t}</p>
                  <p className="text-[#B8B3A8] text-sm leading-relaxed">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <a
            href="https://www.facebook.com/groups/867413636043717/?utm_source=woolet.co&utm_medium=referral&utm_campaign=kickstarter_vip&utm_content=vip_confirmed_page"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join WOOLET VIP Facebook group (opens in new tab)"
            onClick={trackVipFacebookGroupClick}
            onAuxClick={trackVipFacebookGroupClick}
            className="flex items-center justify-center w-full sm:w-auto sm:inline-flex bg-primary text-primary-foreground font-body uppercase tracking-[0.22em] text-xs px-8 py-4 rounded-sm hover:bg-gold-light transition-colors touch-manipulation"
            style={{ minHeight: 56 }}
          >
            Join on Facebook
          </a>
        </section>

        {/* What happens next */}
        <section className="mt-12">
          <p className="text-primary uppercase tracking-[0.24em] text-[12px] mb-4">What happens next</p>
          <ol className="flex flex-col divide-y divide-[#1a1612] border-y border-[#1a1612]">
            {[
              { t: "Confirmation email on its way", d: "Add support@woolet.co to your contacts so we don't land in spam." },
              { t: "We email you on launch day", d: `September 19, 2026. You'll get the hidden-pledge link before the public sees the campaign.` },
              { t: "Pledge & lock your reward", d: "VIP backers get the first chance to pledge before the campaign opens to everyone." },
            ].map((s, i) => (
              <li key={s.t} className="py-5 flex gap-5">
                <span className="font-display text-primary text-base w-6 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-woolet-white text-sm font-medium">{s.t}</p>
                  <p className="text-[#B8B3A8] text-sm mt-1 leading-relaxed">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-[#1a1612] py-8 text-center">
        <p className="text-[#8A857B] text-[12px]">
          © {new Date().getFullYear()} Woolet · <Link to="/en/privacy-policy" className="hover:text-primary">Privacy</Link>
        </p>
      </footer>
    </div>
  );
};

export default KickstarterVipConfirmed;
