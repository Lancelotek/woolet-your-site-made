import { Link, useParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";
import { SUPPORTED_LANGS, langNames, t, isValidLang, type Lang } from "@/lib/i18n";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

const Navbar = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [langOpen, setLangOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 px-4 sm:px-5 md:px-12 py-4 sm:py-5 flex items-center justify-between bg-background/92 backdrop-blur-xl border-b border-border-sub animate-fade-down"
      style={{ borderBottomColor: 'hsl(0 0% 100% / 0.055)' }}>
      <div className="flex items-center">
        <Link to={`/${lang}`} className="flex items-center no-underline">
          <img src={wooletLogo} alt="Woolet" className="h-8" />
        </Link>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <Link to={`/${lang}/blog`} className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
          style={{ fontSize: '0.55rem' }}
          onClick={() => pushGtmEvent("nav_click", { nav_item: "blog", nav_lang: lang })}>
          {t(lang, "nav.blog")}
        </Link>
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-cream-dim uppercase tracking-[0.2em] border border-border-sub px-2.5 py-1 hover:text-primary hover:border-primary/30 transition-colors bg-transparent cursor-pointer"
            style={{ fontSize: '0.55rem', borderColor: 'hsl(0 0% 100% / 0.055)' }}
          >
            {lang.toUpperCase()}
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 bg-surface border border-border-sub flex flex-col min-w-[120px] z-50"
              style={{ borderColor: 'hsl(0 0% 100% / 0.055)' }}>
              {SUPPORTED_LANGS.map((l) => (
                <Link
                  key={l}
                  to={`/${l}`}
                  onClick={() => { setLangOpen(false); pushGtmEvent("lang_switch", { lang_from: lang, lang_to: l }); }}
                  className={`no-underline px-4 py-2.5 tracking-wider hover:bg-surface-2 transition-colors ${l === lang ? 'text-primary' : 'text-cream-dim hover:text-foreground'}`}
                  style={{ fontSize: '0.65rem' }}
                >
                  {langNames[l]}
                </Link>
              ))}
            </div>
          )}
        </div>
        <span className="hidden md:inline-block text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-1"
          style={{ fontSize: '0.55rem' }}>
          {t(lang, "nav.coming_soon")}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
