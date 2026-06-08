import { Link, useParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";
import { t, isValidLang, type Lang } from "@/lib/i18n";
import { pushGtmEvent } from "@/lib/gtm";

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

const Footer = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";

  return (
    <footer className="px-4 sm:px-5 md:px-12 py-4 sm:py-5 border-t flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-up"
      style={{ borderTopColor: 'hsl(0 0% 100% / 0.055)' }}>
      <div className="flex flex-col items-center md:items-start gap-1.5">
        <div className="flex items-center gap-3">
          <img src={wooletLogo} alt="Woolet eyewear logo" className="h-6" />
          <span className="text-cream-dim opacity-40 tracking-wider" style={{ fontSize: '0.57rem' }}>
            {t(lang, "footer.rights")}
          </span>
        </div>
        <span className="text-cream-dim opacity-30 tracking-wider text-center md:text-left" style={{ fontSize: '0.5rem', lineHeight: 1.5 }}>
          Woolet by JAY23 LLC · 412 N. Main Street, STE 100 · Buffalo, Wyoming 82834
        </span>
      </div>
      <div className="flex gap-5 flex-wrap justify-center items-center">
        {[
          { label: "Instagram", href: "https://www.instagram.com/frames_for_wide_faces" },
          { label: "Facebook", href: "https://www.facebook.com/WooletWideFit/" },
          { label: "YouTube", href: "https://www.youtube.com/@wooleteyewear" },
        ].map((link) => (
          <SocialIconLink key={link.label} {...link} />
        ))}
        <div className="w-px h-4 bg-cream-dim/20" />
        {[
          { label: t(lang, "footer.privacy"), href: `/${lang}/privacy-policy` },
          { label: t(lang, "footer.return"), href: `/${lang}/return-policy` },
          { label: "Why Glasses Fail", href: `/${lang}/lp/why-glasses-fail` },
          { label: "5 Reasons", href: `/${lang}/lp/5-reasons` },
          { label: "Kickstarter", href: `/${lang}/lp/kickstarter`, newTab: true },
          { label: "support@woolet.co", href: "mailto:support@woolet.co" },
        ].map((link) => (
          <FooterLink key={link.label} {...link} />
        ))}
      </div>
    </footer>
  );
};

const FooterLink = ({ label, href, newTab }: { label: string; href: string; newTab?: boolean }) => {
  const isInternal = href.startsWith("/") && !newTab;
  const className = "text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors";
  const style = { fontSize: '0.55rem' };

  const handleClick = () => pushGtmEvent("footer_click", { footer_item: label });

  if (isInternal) {
    return <Link to={href} className={className} style={style} onClick={handleClick}>{label}</Link>;
  }
  return <a href={href} className={className} style={style} onClick={handleClick} target="_blank" rel="noopener noreferrer">{label}</a>;
};

const SocialIconLink = ({ label, href }: { label: string; href: string }) => {
  const handleClick = () => pushGtmEvent("footer_click", { footer_item: label });
  const iconClass = "w-5 h-5 text-cream-dim hover:text-primary transition-colors";

  return (
    <a href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {label === "Instagram" && <InstagramIcon className={iconClass} />}
      {label === "Facebook" && <FacebookIcon className={iconClass} />}
      {label === "YouTube" && <YouTubeIcon className={iconClass} />}
    </a>
  );
};

export default Footer;
