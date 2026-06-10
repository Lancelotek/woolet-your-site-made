import { Link, useParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";
import { SUPPORTED_LANGS, langNames, t, isValidLang, type Lang } from "@/lib/i18n";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const Navbar = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { session } = useAuth();

  return (
    <>
      <nav
        className="sticky top-0 z-50 px-4 sm:px-5 md:px-12 py-4 sm:py-5 flex items-center justify-between bg-background/92 backdrop-blur-xl border-b border-border-sub animate-fade-down"
        style={{ borderBottomColor: "hsl(0 0% 100% / 0.055)" }}
      >
        <div className="flex items-center">
          <Link to={`/${lang}`} className="flex items-center no-underline">
            <img src={wooletLogo} alt="Woolet eyewear logo" className="h-8" />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to={`/${lang}#collection`}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.55rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "collection", nav_lang: lang })}
          >
            {t(lang, "nav.collection")}
          </Link>
          <Link
            to={`/${lang}/fit`}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.55rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "fit_quiz", nav_lang: lang })}
          >
            {t(lang, "nav.fit_quiz")}
          </Link>
          <Link
            to={`/${lang}/bespoke`}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.55rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "bespoke", nav_lang: lang })}
          >
            {t(lang, "nav.bespoke")}
          </Link>
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
          <Link
            to={`/${lang}/account${session ? "" : "/sign-in"}`}
            aria-label={session ? "Your account" : "Sign in"}
            className="text-cream-dim hover:text-primary transition-colors flex items-center"
            onClick={() => pushGtmEvent("nav_click", { nav_item: "account", nav_lang: lang, signed_in: !!session })}
          >
            <User size={15} strokeWidth={1.5} />
          </Link>
          <a
            href="https://shop.woolet.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.55rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "shop", nav_lang: lang })}
          >
            {t(lang, "nav.shop_label")} — {t(lang, "nav.coming_soon")}
          </a>
          <Link
            to={`/${lang}/fit`}
            className="uppercase tracking-[0.2em] no-underline transition-colors"
            style={{
              fontSize: "0.55rem",
              background: "hsl(var(--gold))",
              color: "hsl(var(--background))",
              padding: "6px 14px",
              fontWeight: 500,
            }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "scan_face", nav_lang: lang })}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
          >
            {t(lang, "nav.scan_cta")}
          </Link>
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
              to={`/${lang}#collection`}
              className="text-foreground no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
              style={{ fontSize: "0.75rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "collection", nav_lang: lang });
              }}
            >
              {t(lang, "nav.collection")}
            </Link>

            <Link
              to={`/${lang}/fit`}
              className="text-foreground no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
              style={{ fontSize: "0.75rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "fit_quiz", nav_lang: lang });
              }}
            >
              {t(lang, "nav.fit_quiz")}
            </Link>

            <Link
              to={`/${lang}/bespoke`}
              className="text-foreground no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
              style={{ fontSize: "0.75rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "bespoke", nav_lang: lang });
              }}
            >
              {t(lang, "nav.bespoke")}
            </Link>

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

            <Link
              to={`/${lang}/account${session ? "" : "/sign-in"}`}
              className="text-foreground no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
              style={{ fontSize: "0.75rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "account", nav_lang: lang, signed_in: !!session });
              }}
            >
              {session ? "Account" : "Sign in"}
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

            <a
              href="https://shop.woolet.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-2 text-center no-underline hover:bg-primary/10 transition-colors"
              style={{ fontSize: "0.6rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "shop", nav_lang: lang });
              }}
            >
              Shop — {t(lang, "nav.coming_soon")}
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
