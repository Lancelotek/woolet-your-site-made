import { useEffect, useMemo, useState } from "react";
import { isValidLang, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "woolet_consent_v1";
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

type ConsentState = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ---------- GTM dataLayer helpers ----------
const dl = (payload: Record<string, unknown>) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

const gtagConsent = (state: ConsentState) => {
  window.dataLayer = window.dataLayer || [];
  // consent update via dataLayer so it works regardless of GTM load order
  window.dataLayer.push(["consent", "update", state] as unknown as Record<string, unknown>);
};

const persist = (state: ConsentState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, ts: Date.now() }));
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent("woolet-consent-updated", { detail: state }));
  } catch {
    /* ignore */
  }
};

const applyConsent = (
  state: ConsentState,
  event: "cmp_accept_all" | "cmp_reject_all" | "cmp_partial_consent" | "cmp_auto_granted",
) => {
  gtagConsent(state);
  persist(state);
  const grantedCount = Object.values(state).filter((v) => v === "granted").length;
  dl({
    event,
    cmp_ad_storage: state.ad_storage,
    cmp_analytics_storage: state.analytics_storage,
    cmp_granted_count: grantedCount,
  });
};

const readSavedConsent = (): ConsentState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state: ConsentState; ts: number };
    if (Date.now() - parsed.ts > SIX_MONTHS_MS) return null;
    return parsed.state;
  } catch {
    return null;
  }
};

// ---------- Region detection (EEA + UK + CH) ----------
// GDPR/ePrivacy applies to EEA + UK + Switzerland. Layered detection
// (country → timezone → locale) that FAILS CLOSED: any ambiguity is
// treated as GDPR region so auto-grant NEVER fires for an EEA/UK/CH user.
const GDPR_COUNTRIES = new Set([
  // EEA (EU 27)
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EEA non-EU
  "IS", "LI", "NO",
  // UK + Crown Dependencies (UK GDPR)
  "GB", "UK", "GG", "JE", "IM",
  // Switzerland (FADP — treated as GDPR-equivalent here)
  "CH",
]);

const GDPR_TIMEZONES = new Set([
  // EEA
  "Europe/Vienna", "Europe/Brussels", "Europe/Sofia", "Europe/Zagreb",
  "Asia/Nicosia", "Europe/Prague", "Europe/Copenhagen", "Europe/Tallinn",
  "Europe/Helsinki", "Europe/Paris", "Europe/Berlin", "Europe/Busingen",
  "Europe/Athens", "Europe/Budapest", "Atlantic/Reykjavik", "Europe/Dublin",
  "Europe/Rome", "Europe/Riga", "Europe/Vaduz", "Europe/Vilnius",
  "Europe/Luxembourg", "Europe/Malta", "Europe/Amsterdam", "Europe/Oslo",
  "Europe/Warsaw", "Europe/Lisbon", "Atlantic/Madeira", "Atlantic/Azores",
  "Europe/Bucharest", "Europe/Bratislava", "Europe/Ljubljana", "Europe/Madrid",
  "Atlantic/Canary", "Europe/Stockholm",
  // UK
  "Europe/London", "Europe/Belfast", "Europe/Guernsey", "Europe/Jersey", "Europe/Isle_of_Man",
  // Switzerland
  "Europe/Zurich",
]);

// Country hints from navigator.language(s) region subtag (e.g. "en-GB" → "GB").
const countriesFromNavigator = (): string[] => {
  const out: string[] = [];
  try {
    const langs = (navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language]) as string[];
    for (const l of langs) {
      const m = /-([A-Za-z]{2})\b/.exec(l || "");
      if (m) out.push(m[1].toUpperCase());
    }
  } catch { /* ignore */ }
  return out;
};

const COUNTRY_CACHE_KEY = "woolet_country_v1";

// Cloudflare trace: no key required, returns `loc=XX` (ISO country).
const fetchCountry = async (): Promise<string | null> => {
  try {
    const cached = sessionStorage.getItem(COUNTRY_CACHE_KEY);
    if (cached) return cached;
  } catch { /* ignore */ }
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
      signal: ctrl.signal,
      cache: "force-cache",
    });
    clearTimeout(to);
    const text = await res.text();
    const m = /(?:^|\n)loc=([A-Z]{2})/.exec(text);
    if (m) {
      const cc = m[1].toUpperCase();
      try { sessionStorage.setItem(COUNTRY_CACHE_KEY, cc); } catch { /* ignore */ }
      return cc;
    }
  } catch { /* ignore */ }
  return null;
};

const isGdprByTimezone = (): boolean => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return true;
    if (GDPR_TIMEZONES.has(tz)) return true;
    if (tz.startsWith("Europe/")) return true;
    return false;
  } catch {
    return true;
  }
};

const isGdprByNavigator = (): boolean =>
  countriesFromNavigator().some((c) => GDPR_COUNTRIES.has(c));

// Returns true if ANY signal points to EEA/UK/CH. Country lookup is
// authoritative — but unknown / failed lookup = GDPR (fail closed).
const resolveIsGdpr = async (): Promise<boolean> => {
  if (isGdprByTimezone()) return true;
  if (isGdprByNavigator()) return true;
  const cc = await fetchCountry();
  if (!cc) return true; // fail closed
  return GDPR_COUNTRIES.has(cc);
};

// ---------- Locale detection ----------
const detectLocale = (): Lang => {
  if (typeof window === "undefined") return "en";
  const path = window.location.pathname;
  const prefix = path.split("/")[1]?.toLowerCase() || "";
  if (isValidLang(prefix)) return prefix;
  const lang = (navigator.language || "en").toLowerCase();
  if (isValidLang(lang.slice(0, 2))) return lang.slice(0, 2) as Lang;
  return "en";
};

// ---------- Copy ----------
const COPY: Record<Lang, {
  headline: string;
  body: string;
  accept: string;
  reject: string;
  customize: string;
  save: string;
  analytics: string;
  ads: string;
  policy: string;
  settingsIntro: string;
}> = {
  en: {
    headline: "Get the full Woolet experience.",
    body: "Accept cookies so we can remember your fit, save your preferences, and show you frames that actually suit a wide face. You can change this anytime.",
    accept: "Accept all cookies",
    reject: "Reject",
    customize: "Manage preferences",
    save: "Save preferences",
    analytics: "Analytics — helps us improve fit and page performance",
    ads: "Marketing — lets us show you Woolet instead of generic frame ads",
    policy: "Privacy policy",
    settingsIntro: "Choose what you're comfortable with. Both options are equally valid.",
  },
  pl: {
    headline: "W pełni wykorzystaj Woolet.",
    body: "Zaakceptuj cookies, żebyśmy zapamiętali Twoje dopasowanie, preferencje i pokazywali oprawki, które faktycznie pasują do szerokiej twarzy. Zmienisz to w każdej chwili.",
    accept: "Akceptuję wszystkie cookies",
    reject: "Odrzucam",
    customize: "Zarządzaj zgodami",
    save: "Zapisz wybór",
    analytics: "Analityka — pomaga nam poprawiać dopasowanie i wydajność strony",
    ads: "Marketing — pozwala pokazywać Ci Woolet zamiast losowych reklam oprawek",
    policy: "Polityka prywatności",
    settingsIntro: "Wybierz to, co Ci pasuje. Obie opcje są tak samo poprawne.",
  },
  fr: {
    headline: "Profitez pleinement de Woolet.",
    body: "Acceptez les cookies pour que nous mémorisions votre morphologie, vos préférences, et vous proposions des montures adaptées aux visages larges. Vous pourrez modifier ce choix à tout moment.",
    accept: "Accepter tous les cookies",
    reject: "Refuser",
    customize: "Gérer les préférences",
    save: "Enregistrer les préférences",
    analytics: "Analytique — nous aide à améliorer l'ajustement et les performances",
    ads: "Marketing — nous permet de vous montrer Woolet plutôt que des publicités génériques",
    policy: "Politique de confidentialité",
    settingsIntro: "Choisissez ce qui vous convient. Les deux options sont également valides.",
  },
  es: {
    headline: "Disfruta al máximo de Woolet.",
    body: "Acepta las cookies para que recordemos tu ajuste, tus preferencias y te mostremos monturas que realmente se adapten a caras anchas. Puedes cambiarlo cuando quieras.",
    accept: "Aceptar todas las cookies",
    reject: "Rechazar",
    customize: "Gestionar preferencias",
    save: "Guardar preferencias",
    analytics: "Analítica — nos ayuda a mejorar el ajuste y el rendimiento",
    ads: "Marketing — nos permite mostrarte Woolet en lugar de anuncios genéricos",
    policy: "Política de privacidad",
    settingsIntro: "Elige lo que te resulte cómodo. Ambas opciones son igualmente válidas.",
  },
  de: {
    headline: "Das volle Woolet-Erlebnis.",
    body: "Akzeptieren Sie Cookies, damit wir Ihre Passform, Ihre Präferenzen speichern und Ihnen Brillenfassungen zeigen können, die wirklich zu breiten Gesichtern passen. Sie können dies jederzeit ändern.",
    accept: "Alle Cookies akzeptieren",
    reject: "Ablehnen",
    customize: "Präferenzen verwalten",
    save: "Präferenzen speichern",
    analytics: "Analytik — hilft uns, Passform und Seitenleistung zu verbessern",
    ads: "Marketing — ermöglicht es uns, Ihnen Woolet statt generischer Anzeigen zu zeigen",
    policy: "Datenschutzrichtlinie",
    settingsIntro: "Wählen Sie, womit Sie sich wohlfühlen. Beide Optionen sind gleichermaßen gültig.",
  },
  ar: {
    headline: "احصل على تجربة Woolet الكاملة.",
    body: "اقبل ملفات cookies حتى نتذكر قياسات وجهك وتفضيلاتك ونعرض لك إطارات تناسب الوجوه العريضة. يمكنك تغيير هذا في أي وقت.",
    accept: "قبول جميع ملفات cookies",
    reject: "رفض",
    customize: "إدارة التفضيلات",
    save: "حفظ التفضيلات",
    analytics: "التحليلات — تساعدنا على تحسين المقاس وأداء الصفحة",
    ads: "التسويق — يتيح لنا عرض Woolet بدلاً من الإعلانات العامة",
    policy: "سياسة الخصوصية",
    settingsIntro: "اختر ما تشعر بالراحة تجاهه. كلا الخيارين صحيحان.",
  },
  ja: {
    headline: "Wooletをフル活用。",
    body: "Cookieを受け入れると、お顔のサイズや好みを記憶し、ワイドフェイスに本当に合うフレームをご提案できます。いつでも変更可能です。",
    accept: "すべてのCookieを受け入れる",
    reject: "拒否",
    customize: "設定を管理",
    save: "設定を保存",
    analytics: "アナリティクス — フィット感とページパフォーマンスの向上に役立ちます",
    ads: "マーケティング — 一般的な眼鏡広告ではなくWooletをお見せできるようにします",
    policy: "プライバシーポリシー",
    settingsIntro: "ご希望に応じて選択してください。どちらの選択も同様に有効です。",
  },
  nl: {
    headline: "Haal alles uit Woolet.",
    body: "Accepteer cookies zodat we je pasvorm, voorkeuren kunnen onthouden en je monturen kunnen tonen die echt bij een breed gezicht passen. Je kunt dit altijd wijzigen.",
    accept: "Alle cookies accepteren",
    reject: "Weigeren",
    customize: "Voorkeuren beheren",
    save: "Voorkeuren opslaan",
    analytics: "Analytics — helpt ons pasvorm en paginaprestaties te verbeteren",
    ads: "Marketing — laat ons Woolet tonen in plaats van generieke montuuradvertenties",
    policy: "Privacybeleid",
    settingsIntro: "Kies wat je prettig vindt. Beide opties zijn even geldig.",
  },
};

const SINGLETON_ATTR = "data-woolet-cookie-banner";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(16);

  const locale = useMemo(detectLocale, []);
  const t = COPY[locale];
  const isDesktop = useIsDesktop();

  // Avoid overlapping fixed bottom bars (e.g. bespoke configurator mobile CTA).
  useEffect(() => {
    const selector = ".cfg-mobilebar, .sticky-mobile-cta";
    const update = () => {
      const bar = document.querySelector(selector) as HTMLElement | null;
      setBottomOffset(bar ? bar.getBoundingClientRect().height + 16 : 16);
    };
    update();
    window.addEventListener("resize", update);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.querySelectorAll(`[${SINGLETON_ATTR}]`);
    existing.forEach((n) => n.remove());
    document.documentElement.setAttribute(SINGLETON_ATTR + "-owner", "1");
    setIsPrimary(true);
    return () => {
      document.documentElement.removeAttribute(SINGLETON_ATTR + "-owner");
    };
  }, []);

  useEffect(() => {
    if (!isPrimary) return;

    const saved = readSavedConsent();
    if (saved) {
      // Re-apply on every load so GTM sees the right state in this session.
      gtagConsent(saved);
      dl({ event: "cmp_consent_restored" });
      try {
        window.dispatchEvent(new CustomEvent("woolet-consent-updated", { detail: saved }));
      } catch {
        /* ignore */
      }
      return;
    }

    let cancelled = false;
    let idleId: number | null = null;
    let timerId: number | null = null;

    const showBanner = () => {
      if (cancelled) return;
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      const show = () => {
        if (cancelled) return;
        setVisible(true);
        dl({ event: "cmp_banner_shown" });
      };
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(show, { timeout: 2000 });
      } else {
        timerId = window.setTimeout(show, 800);
      }
    };

    (async () => {
      const gdpr = await resolveIsGdpr();
      if (cancelled) return;
      // Hard safety: EEA/UK/CH users NEVER auto-grant. Show the banner.
      if (gdpr) {
        showBanner();
        return;
      }
      // Non-GDPR region: auto-grant so remarketing lists fill up.
      const auto: ConsentState = {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      };
      applyConsent(auto, "cmp_auto_granted");
    })();

    return () => {
      cancelled = true;
      if (idleId != null) {
        const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback;
        if (typeof cancel === "function") cancel(idleId);
      }
      if (timerId != null) window.clearTimeout(timerId);
    };
  }, [isPrimary]);


  useEffect(() => {
    const handleOpenSettings = () => {
      const saved = readSavedConsent();
      if (saved) {
        setAnalytics(saved.analytics_storage === "granted");
        setAds(saved.ad_storage === "granted");
      } else {
        setAnalytics(true);
        setAds(true);
      }
      setCustomizing(true);
      setVisible(true);
      dl({ event: "cmp_settings_opened", cmp_source: "footer_link" });
    };
    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const acceptAll = () => {
    applyConsent(
      {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      },
      "cmp_accept_all",
    );
    setVisible(false);
  };

  const rejectAll = () => {
    applyConsent(
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      },
      "cmp_reject_all",
    );
    setVisible(false);
  };

  const saveCustom = () => {
    const state: ConsentState = {
      ad_storage: ads ? "granted" : "denied",
      ad_user_data: ads ? "granted" : "denied",
      ad_personalization: ads ? "granted" : "denied",
      analytics_storage: analytics ? "granted" : "denied",
    };
    const allGranted = ads && analytics;
    const allDenied = !ads && !analytics;
    applyConsent(
      state,
      allGranted ? "cmp_accept_all" : allDenied ? "cmp_reject_all" : "cmp_partial_consent",
    );
    setVisible(false);
  };

  const openCustomize = () => {
    setCustomizing(true);
    dl({ event: "cmp_settings_opened", cmp_source: "banner_button" });
  };

  if (!isPrimary || !visible) return null;

  const ariaLabels: Record<Lang, string> = {
    en: "Cookie preferences",
    pl: "Preferencje cookies",
    fr: "Préférences de cookies",
    es: "Preferencias de cookies",
    de: "Cookie-Einstellungen",
    ar: "تفضيلات ملفات cookies",
    ja: "Cookieの設定",
    nl: "Cookievoorkeuren",
  };

  return (
    <div
      role="dialog"
      aria-label={ariaLabels[locale]}
      aria-modal="false"
      {...{ [SINGLETON_ATTR]: "1" }}
      style={{
        position: "fixed",
        left: isDesktop ? 24 : 16,
        right: isDesktop ? 24 : 16,
        bottom: bottomOffset,
        zIndex: 10000,
        maxWidth: isDesktop ? 640 : 460,
        margin: "0 auto",
        background: BG,
        color: TEXT,
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        padding: isDesktop ? 32 : 22,
        fontFamily: "'Archivo', system-ui, sans-serif",
        fontSize: isDesktop ? 15 : 14,
        lineHeight: 1.55,
      }}
    >
      {!customizing && (
        <>
          <p
            style={{
              margin: 0,
              marginBottom: isDesktop ? 10 : 8,
              fontFamily: "'Newsreader', 'Archivo', serif",
              fontSize: isDesktop ? 26 : 20,
              lineHeight: 1.2,
              color: TEXT,
              letterSpacing: "-0.005em",
            }}
          >
            {t.headline}
          </p>
          <p style={{ margin: 0, marginBottom: isDesktop ? 22 : 18, color: MUTED, fontSize: isDesktop ? 14.5 : 13.5 }}>
            {t.body}{" "}
            <a href={`/${locale}/privacy-policy`} style={linkStyle}>
              {t.policy}
            </a>
            .
          </p>

          <button
            onClick={acceptAll}
            style={{
              ...btnPrimary,
              width: "100%",
              padding: isDesktop ? "16px 22px" : "14px 18px",
              fontSize: isDesktop ? 14 : 13,
              marginBottom: 12,
            }}
            type="button"
          >
            {t.accept}
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={rejectAll} style={btnSecondary} type="button">
              {t.reject}
            </button>
            <button onClick={openCustomize} style={btnSecondary} type="button">
              {t.customize}
            </button>
          </div>
        </>
      )}

      {customizing && (
        <>
          <p style={{ margin: 0, marginBottom: 14, color: MUTED, fontSize: 13 }}>
            {t.settingsIntro}
          </p>

          <div style={{ marginBottom: 18, display: "grid", gap: 10 }}>
            <label style={rowStyle}>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                style={checkboxStyle}
              />
              <span>{t.analytics}</span>
            </label>
            <label style={rowStyle}>
              <input
                type="checkbox"
                checked={ads}
                onChange={(e) => setAds(e.target.checked)}
                style={checkboxStyle}
              />
              <span>{t.ads}</span>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={saveCustom} style={btnPrimary} type="button">
              {t.save}
            </button>
            <button onClick={rejectAll} style={btnSecondary} type="button">
              {t.reject}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ---------- Brand tokens (Woolet Brand Book v1.0, per-task overrides) ----------
const BG = "#080807";           // Ink
const TEXT = "#EDE7D9";         // Cream
const MUTED = "rgba(237,231,217,0.72)";
const BORDER = "rgba(202,164,73,0.22)";
const GOLD = "#CAA449";
const GOLD_INK = "#1F1B16";

const btnBase: React.CSSProperties = {
  fontFamily: "'Archivo', system-ui, sans-serif",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "1.4px",
  textTransform: "uppercase",
  padding: "12px 14px",
  borderRadius: 2, // brand: never pill
  cursor: "pointer",
  border: "1px solid transparent",
  minHeight: 44, // a11y tap target
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: GOLD,
  color: GOLD_INK,
  borderColor: GOLD,
};

// Equal weight to primary: same size, same font, high-contrast outline.
// Legal parity — reject must be as easy as accept.
const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: TEXT,
  borderColor: "rgba(237,231,217,0.55)",
};

const linkStyle: React.CSSProperties = {
  color: GOLD,
  textDecoration: "underline",
  textUnderlineOffset: 2,
};

const linkButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: MUTED,
  fontFamily: "'Archivo', system-ui, sans-serif",
  fontSize: 12,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  cursor: "pointer",
  padding: "6px 8px",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  fontSize: 13,
  color: TEXT,
  cursor: "pointer",
  lineHeight: 1.5,
};

const checkboxStyle: React.CSSProperties = {
  marginTop: 3,
  accentColor: GOLD,
  width: 16,
  height: 16,
  flexShrink: 0,
};

export default CookieBanner;
