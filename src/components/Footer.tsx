import { Link, useParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";
import { t, isValidLang, type Lang } from "@/lib/i18n";
import { pushGtmEvent } from "@/lib/gtm";

const Footer = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";

  return (
    <footer className="px-4 sm:px-5 md:px-12 py-4 sm:py-5 border-t flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-up"
      style={{ borderTopColor: 'hsl(0 0% 100% / 0.055)' }}>
      <div className="flex items-center gap-3">
        <img src={wooletLogo} alt="Woolet" className="h-6" />
        <span className="text-cream-dim opacity-40 tracking-wider" style={{ fontSize: '0.57rem' }}>
          {t(lang, "footer.rights")}
        </span>
      </div>
      <div className="flex gap-5 flex-wrap justify-center">
        {[
          { label: "Instagram", href: "https://www.instagram.com/frames_for_wide_faces" },
          { label: "Facebook", href: "https://www.facebook.com/WooletWideFit/" },
          { label: t(lang, "footer.privacy"), href: `/${lang}/privacy-policy` },
          { label: t(lang, "footer.return"), href: `/${lang}/return-policy` },
          { label: "support@woolet.co", href: "mailto:support@woolet.co" },
        ].map((link) => (
          <FooterLink key={link.label} {...link} />
        ))}
      </div>
    </footer>
  );
};

const FooterLink = ({ label, href }: { label: string; href: string }) => {
  const isInternal = href.startsWith("/");
  const className = "text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors";
  const style = { fontSize: '0.55rem' };

  const handleClick = () => pushGtmEvent("footer_click", { footer_item: label });

  if (isInternal) {
    return <Link to={href} className={className} style={style} onClick={handleClick}>{label}</Link>;
  }
  return <a href={href} className={className} style={style} onClick={handleClick}>{label}</a>;
};

export default Footer;
