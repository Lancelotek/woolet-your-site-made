import { Link, useParams } from "react-router-dom";

import { t, isValidLang, type Lang } from "@/lib/i18n";
import { pushGtmEvent } from "@/lib/gtm";
import wordmark from "@/assets/woolet-wordmark.svg";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
  </svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

type FooterLinkItem = { label: string; href: string; newTab?: boolean };

const Footer = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";

  const groups: { heading: string; links: FooterLinkItem[] }[] = [
    {
      heading: "Shop",
      links: [
        { label: "Collection", href: `/${lang}/collection` },
        { label: "Fit Quiz", href: `/${lang}/fit` },
        { label: "Bespoke", href: `/${lang}/bespoke` },
        { label: "Kickstarter", href: `/${lang}/lp/kickstarter`, newTab: true },
      ],
    },
    {
      heading: "Learn",
      links: [
        { label: "Process", href: `/${lang}/process` },
        { label: t(lang, "footer.why_fail"), href: `/${lang}/lp/why-glasses-fail` },
        { label: t(lang, "footer.5_reasons"), href: `/${lang}/lp/5-reasons` },
        { label: "Bridge Fit Guide", href: `/${lang}/lp/wide-bridge-fit-guide` },
      ],
    },
    {
      heading: "Guides",
      links: [
        { label: "Wide-face fit guide", href: "/en/blog/glasses-for-wide-faces-guide" },
        { label: "Measure your face", href: "/en/blog/how-to-measure-face-width-for-glasses" },
        { label: "Best wide-fit sunglasses", href: "/en/blog/best-sunglasses-for-wide-faces" },
        { label: "Wide-face collection", href: "/en/collections/wide-face-glasses" },
        { label: "Glasses for big heads", href: "/en/collections/glasses-for-big-heads" },
      ],
    },
    {
      heading: "Compare",
      links: [
        { label: "Compare", href: `/${lang}/compare` },
        { label: "Fatheadz", href: `/${lang}/compare/fatheadz-alternative` },
        { label: "EYESHELLS", href: `/${lang}/compare/eyeshells-alternative` },
        { label: "Zenni", href: `/${lang}/compare/zenni-alternative` },
        { label: "Warby Parker", href: `/${lang}/compare/warby-parker-alternative` },
        { label: "Ray-Ban", href: `/${lang}/compare/ray-ban-alternative` },
        { label: "Persol", href: `/${lang}/compare/persol-alternative` },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Blog", href: `/${lang}/blog` },
        { label: t(lang, "footer.privacy"), href: `/${lang}/privacy-policy` },
        { label: t(lang, "footer.return"), href: `/${lang}/return-policy` },
        { label: "support@woolet.co", href: "mailto:support@woolet.co" },
      ],
    },
  ];

  const socials: { label: string; href: string }[] = [
    { label: "Instagram", href: "https://www.instagram.com/frames_for_wide_faces" },
    { label: "Facebook", href: "https://www.facebook.com/WooletWideFit/" },
    { label: "YouTube", href: "https://www.youtube.com/@wooleteyewear" },
    { label: "TikTok", href: "https://www.tiktok.com/@wooletai" },
  ];

  return (
    <footer
      className="px-5 sm:px-8 md:px-12 pt-12 pb-6 border-t animate-fade-up"
      style={{ borderTopColor: "hsl(0 0% 100% / 0.055)" }}
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Top: brand + groups */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_repeat(5,1fr)] gap-10 md:gap-8 pb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link to={`/${lang}`} aria-label="Woolet home" className="self-start no-underline">
              <img
                src={wordmark}
                alt="Woolet wordmark — wide-fit eyewear brand"
                className="self-start"
                style={{ height: 24, width: "auto", display: "block" }}
                width={120}
                height={24}
              />
            </Link>

            <p
              className="text-cream-dim/70 max-w-[280px] leading-relaxed"
              style={{ fontSize: "0.78rem" }}
            >
              Italian Mazzucchelli acetate eyewear for wide faces (155–165 mm). Hand made in EU.
            </p>
            <div className="flex gap-4 mt-2">
              {socials.map((s) => (
                <SocialIconLink key={s.label} {...s} />
              ))}
            </div>
            <a
              href="/brand/woolet-brand-assets.zip"
              download
              aria-label="Download Woolet brand assets zip"
              onClick={() => pushGtmEvent("brand_assets_download", { source: "footer" })}
              className="inline-flex items-center gap-2 self-start mt-3 no-underline transition-colors hover:text-primary"
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.66rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "hsl(var(--gold-dim))",
                border: "1px solid hsl(var(--gold-dim) / 0.4)",
                borderRadius: "2px",
                padding: "8px 12px",
              }}
            >
              ↓ Brand Assets (.zip)
            </a>
          </div>


          {/* Link groups */}
          {groups.map((g) => (
            <div key={g.heading} className="flex flex-col gap-3">
              <div
                className="uppercase tracking-[0.22em]"
                style={{
                  fontSize: "0.66rem",
                  color: "hsl(var(--gold-dim))",
                  fontFamily: "Barlow, sans-serif",
                }}
              >
                {g.heading}
              </div>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink {...l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: copyright + cookie */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6 border-t"
          style={{ borderTopColor: "hsl(0 0% 100% / 0.05)" }}
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-cream-dim tracking-wider"
              style={{ fontSize: "0.7rem" }}
            >
              {t(lang, "footer.rights")}
            </span>
            <span
              className="text-cream-dim/85 tracking-wider"
              style={{ fontSize: "0.68rem", lineHeight: 1.5 }}
            >
              Woolet by JAY23 LLC · 412 N. Main Street, STE 100 · Buffalo, Wyoming 82834
            </span>
          </div>
          <button
            onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
            className="text-cream-dim/70 hover:text-primary no-underline uppercase tracking-[0.22em] transition-colors self-start md:self-auto"
            style={{
              fontSize: "0.66rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "Barlow, sans-serif",
            }}
          >
            {t(lang, "footer.cookie_settings")}
          </button>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ label, href, newTab }: FooterLinkItem) => {
  const isInternal = href.startsWith("/") && !newTab;
  const className =
    "text-cream-dim/85 hover:text-primary no-underline transition-colors";
  const style = { fontSize: "0.82rem", fontFamily: "Barlow, sans-serif" } as const;

  const handleClick = () => {
    pushGtmEvent("footer_click", { footer_item: label });
    if (label === "Bridge Fit Guide") {
      pushGtmEvent("bridge_fit_guide_click", { source: "footer", link_url: href });
    }
  };

  if (isInternal) {
    return (
      <Link to={href} className={className} style={style} onClick={handleClick}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
};

const SocialIconLink = ({ label, href }: { label: string; href: string }) => {
  const handleClick = () => pushGtmEvent("footer_click", { footer_item: label });
  const iconClass = "w-5 h-5 text-cream-dim/80 hover:text-primary transition-colors";

  return (
    <a href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {label === "Instagram" && <InstagramIcon className={iconClass} />}
      {label === "Facebook" && <FacebookIcon className={iconClass} />}
      {label === "YouTube" && <YouTubeIcon className={iconClass} />}
      {label === "TikTok" && <TikTokIcon className={iconClass} />}
    </a>
  );
};

export default Footer;
