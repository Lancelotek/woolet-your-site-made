import { Link, useLocation, useParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.svg";
import { SUPPORTED_LANGS, langNames, t, isValidLang, type Lang } from "@/lib/i18n";
import { hrefFor, keyForPath, hasLocalized, ROUTES } from "@/i18n/routeRegistry";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const Navbar = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const location = useLocation();
  const currentKey = keyForPath(location.pathname);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { session } = useAuth();

  // Build a target URL per locale for the language switcher.
  // If the current page has a real translation in that locale, link to it.
  // Otherwise link to that locale's homepage (labelled as "site in <lang>"),
  // never a URL that would redirect.
  const switcherHref = (targetLang: Lang): string => {
    if (currentKey && hasLocalized(currentKey, targetLang)) {
      return (ROUTES[currentKey] as Partial<Record<Lang, string>>)[targetLang]!;
    }
    return ROUTES.home[targetLang];
  };
  const switcherTitle = (targetLang: Lang): string =>
    currentKey && hasLocalized(currentKey, targetLang)
      ? `${langNames[targetLang]}`
      : `Woolet — site in ${langNames[targetLang]}`;

  return (
    <>
      <nav
        className="sticky top-0 z-50 px-4 sm:px-5 md:px-12 py-4 sm:py-5 flex items-center justify-between bg-background/92 backdrop-blur-xl border-b border-border-sub animate-fade-down"
        style={{ borderBottomColor: "hsl(0 0% 100% / 0.055)" }}
      >
        <div className="flex items-center">
          <Link to={hrefFor("home", lang)} className="flex items-center no-underline" aria-label="Woolet home">
            <img
              src={wooletLogo}
              alt="Woolet logo mark — wide-fit eyewear brand"
              className="h-10 w-auto"
              width={40}
              height={40}
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to={hrefFor("collection", lang)}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.72rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "collection", nav_lang: lang })}
          >
            {t(lang, "nav.collection")}
          </Link>
          <Link
            to={hrefFor("fit", lang)}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.72rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "fit_quiz", nav_lang: lang })}
          >
            {t(lang, "nav.fit_quiz")}
          </Link>
          <Link
            to={hrefFor("bespoke", lang)}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.72rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "bespoke", nav_lang: lang })}
          >
            {t(lang, "nav.bespoke")}
          </Link>
          <Link
            to={hrefFor("process", lang)}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.72rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "process", nav_lang: lang })}
          >
            Process
          </Link>
          <Link
            to={hrefFor("blog", lang)}
            className="text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
            style={{ fontSize: "0.72rem" }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "blog", nav_lang: lang })}
          >
            {t(lang, "nav.blog")}
          </Link>
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              aria-label="Select language"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              className="text-cream-dim uppercase tracking-[0.2em] bg-transparent cursor-pointer transition-colors hover:text-primary hover:border-primary/40"
              style={{
                fontSize: "0.72rem",
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
                role="listbox"
                aria-label="Languages"
                style={{ borderColor: "hsl(0 0% 100% / 0.055)", borderRadius: "4px" }}
              >
                {SUPPORTED_LANGS.map((l) => (
                  <Link
                    key={l}
                    to={switcherHref(l)}
                    role="option"
                    aria-selected={l === lang}
                    aria-current={l === lang ? "true" : undefined}
                    title={switcherTitle(l)}
                    onClick={() => {
                      setLangOpen(false);
                      try { window.localStorage.setItem("woolet_lang", l); } catch {}
                      pushGtmEvent("lang_switch", { lang_from: lang, lang_to: l });
                    }}
                    className={`no-underline px-4 py-2.5 tracking-wider hover:bg-surface-2 transition-colors ${l === lang ? "text-primary" : "text-cream-dim hover:text-foreground"}`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {langNames[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            to={session ? hrefFor("account", lang) : hrefFor("accountSignIn", lang)}
            aria-label={session ? "Your account" : "Sign in"}
            className="text-cream-dim hover:text-primary transition-colors flex items-center"
            onClick={() => pushGtmEvent("nav_click", { nav_item: "account", nav_lang: lang, signed_in: !!session })}
          >
            <User size={15} strokeWidth={1.5} />
          </Link>
          <Link
            to={hrefFor("lp.kickstarter", lang)}
            className="text-primary no-underline uppercase tracking-[0.2em] border border-primary/40 hover:bg-primary/10 transition-colors"
            style={{ fontSize: "0.72rem", padding: "6px 12px", borderRadius: 2 }}
            onClick={() => pushGtmEvent("nav_click", { nav_item: "vip", nav_lang: lang })}
          >
            VIP — 40% off
          </Link>
          {/* Top "Scan your face" CTA hidden — primary CTA is now waitlist */}

        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden text-foreground bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          id="mobile-nav-menu"
          className="fixed inset-0 z-40 md:hidden flex flex-col pt-[72px] bg-background/98 backdrop-blur-xl animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-6 px-6 py-8">
            <Link
              to={hrefFor("collection", lang)}
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
              to={hrefFor("fit", lang)}
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
              to={hrefFor("bespoke", lang)}
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
              to={hrefFor("process", lang)}
              className="text-foreground no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors"
              style={{ fontSize: "0.75rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "process", nav_lang: lang });
              }}
            >
              Process
            </Link>

            <Link
              to={hrefFor("blog", lang)}
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
              to={session ? hrefFor("account", lang) : hrefFor("accountSignIn", lang)}
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
                style={{ fontSize: "0.72rem" }}
              >
                Language
              </span>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_LANGS.map((l) => (
                  <Link
                    key={l}
                    to={switcherHref(l)}
                    title={switcherTitle(l)}
                    onClick={() => {
                      setMenuOpen(false);
                      try { window.localStorage.setItem("woolet_lang", l); } catch {}
                      pushGtmEvent("lang_switch", { lang_from: lang, lang_to: l });
                    }}
                    className={`no-underline uppercase tracking-[0.2em] px-3 py-1.5 border transition-colors ${
                      l === lang
                        ? "text-primary border-primary/40"
                        : "text-cream-dim border-border-sub hover:text-foreground hover:border-primary/20"
                    }`}
                    style={{ fontSize: "0.72rem", borderRadius: "20px" }}
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
              style={{ fontSize: "0.72rem" }}
              onClick={() => {
                setMenuOpen(false);
                pushGtmEvent("nav_click", { nav_item: "shop", nav_lang: lang });
              }}
            >
              {t(lang, "nav.shop_label")} — {t(lang, "nav.coming_soon")}
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
