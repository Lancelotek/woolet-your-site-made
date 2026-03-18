import { Link, useParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";
import { SUPPORTED_LANGS, langNames, t, isValidLang, type Lang } from "@/lib/i18n";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="sticky top-0 z-50 px-4 sm:px-5 md:px-12 py-4 sm:py-5 flex items-center justify-between bg-background/92 backdrop-blur-xl border-b border-border-sub animate-fade-down"
        style={{ borderBottomColor: "hsl(0 0% 100% / 0.055)" }}
      >
        <div className="flex items-center">
          <Link to={`/${lang}`} className="flex items-center no-underline">
            <img src={wooletLogo} alt="Woolet" className="h-8" />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to={`/${lang}/blog`}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.55rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "blog", nav_lang: lang })}
          >
            {t(lang, "nav.blog")}
          </Link>
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="text-cream-dim uppercase tracking-[0.2em] bg-transparent cursor-pointer transition-colors hover:text-primary hover:border-primary/40"
              style={{
                fontSize: "0.55rem",
                border: "1px solid hsl(var(--border-sub))",
                borderRadius: "20px",
                padding: "4px 12px",
              }}
            >
              {lang.toUpperCase()}
            </button>
            {langOpen && (
              <div
                className="absolute right-0 top-full mt-1 bg-surface border flex flex-col min-w-[120px] z-50"
                style={{ borderColor: "hsl(0 0% 100% / 0.055)", borderRadius: "4px" }}
              >
                {SUPPORTED_LANGS.map((l) => (
                  <Link
                    key={l}
                    to={`/${l}`}
                    onClick={() => {
                      setLangOpen(false);
                      pushGtmEvent("lang_switch", { lang_from: lang, lang_to: l });
                    }}
                    className={`no-underline px-4 py-2.5 tracking-wider hover:bg-surface-2 transition-colors ${l === lang ? "text-primary" : "text-cream-dim hover:text-foreground"}`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {langNames[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <span
            className="text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-1"
            style={{ fontSize: "0.55rem" }}
          >
            {t(lang, "nav.coming_soon")}
          </span>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden text-foreground bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden flex flex-col pt-[72px] bg-background/98 backdrop-blur-xl animate-fade-in"
        >
          <div className="flex flex-col gap-6 px-6 py-8">
            <Link
              to={`/${lang}/blog`}
              className="text-foreground no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
              style={{ fontSize: "0.75rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "blog", nav_lang: lang });
              }}
            >
              {t(lang, "nav.blog")}
            </Link>

            <div className="woolet-divider" />

            <div className="flex flex-col gap-3">
              <span
                className="text-cream-dim uppercase tracking-[0.2em]"
                style={{ fontSize: "0.55rem" }}
              >
                Language
              </span>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_LANGS.map((l) => (
                  <Link
                    key={l}
                    to={`/${l}`}
                    onClick={() => {
                      setMenuOpen(false);
                      pushGtmEvent("lang_switch", { lang_from: lang, lang_to: l });
                    }}
                    className={`no-underline uppercase tracking-[0.2em] px-3 py-1.5 border transition-colors ${
                      l === lang
                        ? "text-primary border-primary/40"
                        : "text-cream-dim border-border-sub hover:text-foreground hover:border-primary/20"
                    }`}
                    style={{ fontSize: "0.6rem", borderRadius: "20px" }}
                  >
                    {langNames[l]}
                  </Link>
                ))}
              </div>
            </div>

            <div className="woolet-divider" />

            <span
              className="text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-2 text-center"
              style={{ fontSize: "0.6rem" }}
            >
              {t(lang, "nav.coming_soon")}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
