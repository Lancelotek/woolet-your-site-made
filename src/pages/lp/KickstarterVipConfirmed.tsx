import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import logoAsset from "@/assets/woolet-logo.png.asset.json";
const logo = logoAsset.url;

const KS_LAUNCH_DATE_LABEL = "September 19, 2026";
const FOUNDERS_EDITION_TOTAL = 100;
const EARLY_BIRD_TOTAL = 300;
const EARLY_BIRD_LEFT = 247;
const REFERRAL_GOAL = 3;

// Deterministic short code from email
const hashCode = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 6);
};

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

  const refCode = useMemo(() => (email ? hashCode(email.toLowerCase()) : ""), [email]);
  const refLink = `https://woolet.co/en/lp/kickstarter?ref=${refCode}`;

  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(refLink).catch(() => {});
    setCopied(true);
    pushGtmEvent("vip_referral_copy", { ref: refCode });
    setTimeout(() => setCopied(false), 1800);
  };

  const shareText = encodeURIComponent(
    "I just got VIP access to Woolet — Italian acetate eyewear actually built for wide faces (155mm+). Use my link to get in before launch:"
  );
  const encodedLink = encodeURIComponent(refLink);

  const shareTargets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${shareText}%20${encodedLink}`, key: "whatsapp" },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedLink}`, key: "x" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`, key: "facebook" },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent("Woolet — wide-face eyewear, VIP early access")}&body=${shareText}%20${encodedLink}`,
      key: "email",
    },
  ];

  // Referral count is not tracked server-side yet; show honest baseline
  const referred = 0;
  const pct = Math.min(100, Math.round((referred / REFERRAL_GOAL) * 100));

  return (
    <div className="lp-scope min-h-screen bg-[#0f0f0f] text-woolet-white font-body">
      <Helmet>
        <title>You're on the VIP list — Woolet Kickstarter</title>
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

        {/* Referral block */}
        <section
          className="mt-12 border rounded-sm p-6 sm:p-8"
          style={{ borderColor: "hsl(var(--gold) / 0.25)", background: "hsl(var(--gold) / 0.04)" }}
        >
          <p className="text-primary uppercase tracking-[0.24em] text-[12px] mb-3">Move up the list</p>
          <h2 className="font-display text-woolet-white text-2xl sm:text-3xl leading-tight mb-3">
            Refer 3 friends — lock a guaranteed Founders Edition Havana.
          </h2>
          <p className="text-[#D8D4CC] text-sm leading-relaxed mb-6">
            Only <span className="text-woolet-white">{FOUNDERS_EDITION_TOTAL} numbered Founders Edition Havana</span> pairs will exist —
            and they go before the {EARLY_BIRD_TOTAL} Early Bird spots (40% off, {EARLY_BIRD_LEFT} left). Refer 3 VIPs who join with your link and we hold one for you.
          </p>

          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] uppercase tracking-[0.18em] text-[#B8B3A8]">Your referrals</span>
            <span className="font-display text-woolet-white text-sm">
              <span className="text-primary">{referred}</span>
              <span className="text-[#8A857B]"> / {REFERRAL_GOAL}</span>
            </span>
          </div>
          <div className="h-[3px] w-full bg-[#1a1612] rounded-full overflow-hidden mb-7">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Link + copy */}
          <label className="text-[12px] uppercase tracking-[0.18em] text-[#B8B3A8] block mb-2">
            Your referral link
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <input
              readOnly
              value={refLink}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 font-body text-sm bg-[#0a0908] border border-[#2a241d] text-[#D8D4CC] rounded-sm px-3"
              style={{ minHeight: 48 }}
            />
            <button
              onClick={copy}
              className="bg-primary text-primary-foreground font-body uppercase tracking-[0.22em] text-xs px-5 rounded-sm hover:bg-gold-light transition-colors"
              style={{ minHeight: 48 }}
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>

          {/* Share row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shareTargets.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => pushGtmEvent("vip_referral_share", { channel: s.key })}
                className="flex items-center justify-center border border-[#2a241d] text-[#D8D4CC] hover:text-woolet-white hover:border-primary/60 font-body uppercase tracking-[0.18em] text-[12px] rounded-sm transition-colors"
                style={{ minHeight: 48 }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </section>

        {/* What happens next */}
        <section className="mt-12">
          <p className="text-primary uppercase tracking-[0.24em] text-[12px] mb-4">What happens next</p>
          <ol className="flex flex-col divide-y divide-[#1a1612] border-y border-[#1a1612]">
            {[
              { t: "Confirmation email on its way", d: "Add hello@woolet.co to your contacts so we don't land in spam." },
              { t: "We email you on launch day", d: `September 19, 2026. You'll get the hidden-pledge link before the public sees the campaign.` },
              { t: "Pledge & lock your reward", d: "Founders Edition Havana goes first (100 numbered). Then Early Bird at 40% off." },
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
