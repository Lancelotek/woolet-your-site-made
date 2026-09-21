/**
 * Shared interaction shell for the Bespoke configurator.
 *
 * Everything here exists because Clarity showed the same three dead ends:
 * the preview image was inert, the reassurance copy looked tappable but was a
 * plain span, and the AI preview hid behind a sign-in that lost the build.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { pushGtmEvent } from "@/lib/gtm";

/* ───── Instrumentation ───── */

export type CfgEvent =
  | "cfg_step_view"
  | "cfg_next_click"
  | "cfg_preview_open"
  | "cfg_generate_click"
  | "cfg_render_ready"
  | "cfg_signin_gate_shown"
  | "cfg_pay_click"
  | "bespoke_reading_strength_selected"
  | "bespoke_lens_tint_selected";

export const pushCfg = (event: CfgEvent, data?: Record<string, string | number | boolean>) =>
  pushGtmEvent(event, data);

/* ───── Re-tap feedback on the sticky mobile preview ───── */

export function pulseMobilePreview() {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(".cfg-mobilepreview");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  el.classList.remove("cfg-mobilepreview--pulse");
  // force reflow so the animation restarts on every re-tap
  void el.offsetWidth;
  el.classList.add("cfg-mobilepreview--pulse");
  window.setTimeout(() => el.classList.remove("cfg-mobilepreview--pulse"), 400);
}

/* ───── Info sheet ───── */

export type CfgInfoSection = "measure" | "price" | "fit" | "plano";

const InfoCtx = createContext<(section: CfgInfoSection) => void>(() => {});
export const useCfgInfo = () => useContext(InfoCtx);

const SECTIONS: { id: CfgInfoSection; title: string; body: ReactNode }[] = [
  {
    id: "measure",
    title: "Pay first, measure after",
    body: (
      <>
        <p>
          You pay for the pattern, acetate and lens configuration you chose. The made-to-measure fit scan is
          booked <em>after</em> your payment clears — no measurements are taken until the order is confirmed.
        </p>
        <p>
          You then get a private link and measure with your phone camera. Once your numbers are confirmed, the
          frame is cut to them.
        </p>
        <p>
          If the finished frame does not sit right on your face, write to support@woolet.co. Your measurements
          stay on file under your case number, so the workshop can see exactly what was cut.
        </p>
      </>
    ),
  },
  {
    id: "price",
    title: "What $480 covers",
    body: (
      <ul>
        <li>Hand made in Greece from Italian Mazzucchelli acetate.</li>
        <li>Lenses included — reading, sun, blue light or photochromic.</li>
        <li>Free worldwide shipping.</li>
        <li>2 weeks from order to dispatch.</li>
      </ul>
    ),
  },
  {
    id: "fit",
    title: "Cut to your face · reference 158 mm",
    body: (
      <p>
        158 mm is the reference drawing only. The build range is 145–172 mm, and your frame is cut to your scan.
      </p>
    ),
  },
  {
    id: "plano",
    title: "Plano (no correction) lens",
    body: (
      <p>
        Plano means a lens with no optical correction — clear lenses cut and fitted to the frame. Choose plano if
        you plan to take the frame to your own optician for prescription lenses.
      </p>
    ),
  },
];

export function CfgInfoProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<CfgInfoSection | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const open = useCallback((s: CfgInfoSection) => setSection(s), []);

  useEffect(() => {
    if (!section) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSection(null);
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(`#cfg-info-${section}`)
        ?.scrollIntoView({ block: "start", behavior: "auto" });
    }, 30);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [section]);

  return (
    <InfoCtx.Provider value={open}>
      {children}
      {section && (
        <div className="cfg-sheet" role="dialog" aria-modal="true" aria-label="More about your bespoke order">
          <div className="cfg-sheet__scrim" onClick={() => setSection(null)} />
          <div className="cfg-sheet__panel" ref={panelRef}>
            <div className="cfg-sheet__head">
              <span className="cfg-sheet__eyebrow">How it works</span>
              <button type="button" onClick={() => setSection(null)} aria-label="Close" className="cfg-sheet__close">
                <X size={18} />
              </button>
            </div>
            <div className="cfg-sheet__body">
              {SECTIONS.map((s) => (
                <section key={s.id} id={`cfg-info-${s.id}`} className={s.id === section ? "is-target" : undefined}>
                  <h3>{s.title}</h3>
                  {s.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </InfoCtx.Provider>
  );
}

/** Dotted-underline info trigger with a 44px hit area that does not shift layout. */
export function CfgInfoTrigger({
  section,
  children,
  className,
  style,
}: {
  section: CfgInfoSection;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const open = useCfgInfo();
  return (
    <span
      role="button"
      tabIndex={0}
      className={`cfg-info-trigger ${className ?? ""}`}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(section);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          open(section);
        }
      }}
    >
      {children}
    </span>
  );
}

/* ───── Next-step context, so the lightbox can advance the flow ───── */

interface CfgNav {
  nextLabel: string | null;
  onNext: (() => void) | null;
}
const NavCtx = createContext<CfgNav>({ nextLabel: null, onNext: null });
export const useCfgNav = () => useContext(NavCtx);
export const CfgNavProvider = ({ value, children }: { value: CfgNav; children: ReactNode }) => (
  <NavCtx.Provider value={value}>{children}</NavCtx.Provider>
);

/* ───── Full-screen preview lightbox ───── */

export function PreviewLightbox({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption: string;
  onClose: () => void;
}) {
  const { nextLabel, onNext } = useCfgNav();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="cfg-lightbox" role="dialog" aria-modal="true" aria-label="Larger preview" onClick={onClose}>
      <div className="cfg-lightbox__scrim" />
      <button type="button" className="cfg-lightbox__close" aria-label="Close preview" onClick={onClose}>
        <X size={20} />
      </button>
      <div className="cfg-lightbox__inner">
        <img src={src} alt={alt} className="cfg-lightbox__img" onClick={(e) => e.stopPropagation()} />
        <div className="cfg-lightbox__caption">{caption}</div>
        {nextLabel && onNext && (
          <button
            type="button"
            className="cfg-lightbox__next"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onNext();
            }}
          >
            Next · {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ───── In-page sign-in (never navigates away from the build) ───── */

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

export function CfgSignInModal({ onClose, onSignedIn }: { onClose: () => void; onSignedIn?: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pushCfg("cfg_signin_gate_shown");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setBusy(true);
    const normalized = parsed.data.toLowerCase();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: true, emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setEmail(normalized);
    setSent(true);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = code.replace(/\D/g, "");
    if (token.length !== 8) {
      setError("Enter the 8-digit code from your email.");
      return;
    }
    setBusy(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (verifyError) {
      setBusy(false);
      setError("That code is no longer valid. If you received more than one email, use the newest code.");
      return;
    }
    try {
      await supabase.rpc("link_user_data_by_email");
    } catch {
      /* non-blocking */
    }
    setBusy(false);
    onSignedIn?.();
    onClose();
  };

  return (
    <div className="cfg-sheet" role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="cfg-sheet__scrim" onClick={onClose} />
      <div className="cfg-sheet__panel">
        <div className="cfg-sheet__head">
          <span className="cfg-sheet__eyebrow">{sent ? "Enter your code" : "Sign in"}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="cfg-sheet__close">
            <X size={18} />
          </button>
        </div>
        <div className="cfg-sheet__body">
          <form onSubmit={sent ? verify : sendCode} className="cfg-authform" noValidate>
            {sent ? (
              <>
                <p>
                  We sent an 8-digit code to <strong>{email}</strong>. Your build stays exactly as it is.
                </p>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={code}
                  onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="− − − − − − − −"
                  aria-label="8-digit code"
                  autoFocus
                />
              </>
            ) : (
              <>
                <p>We email you an 8-digit code. No password, and you stay on this page.</p>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="you@example.com"
                  aria-label="Your email"
                />
              </>
            )}
            {error && <span className="cfg-authform__error">{error}</span>}
            <button type="submit" disabled={busy} className="cfg-cta">
              {busy ? "Working…" : sent ? "Sign in" : "Email me a code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ───── Anonymous AI render budget, keyed to the scan session ───── */

const RENDER_CAP = 3;
const renderKey = (sessionRef: string) => `woolet:bespoke:renders:${sessionRef}`;

export function readRenderCount(sessionRef: string): number {
  try {
    return Number(localStorage.getItem(renderKey(sessionRef)) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function bumpRenderCount(sessionRef: string): number {
  const next = readRenderCount(sessionRef) + 1;
  try {
    localStorage.setItem(renderKey(sessionRef), String(next));
  } catch {
    /* private mode — the cap simply does not persist */
  }
  return next;
}

export const RENDERS_PER_SESSION = RENDER_CAP;

export function useRenderBudget(sessionRef: string) {
  const [used, setUsed] = useState(() => readRenderCount(sessionRef));
  const remaining = Math.max(0, RENDER_CAP - used);
  const consume = useCallback(() => setUsed(bumpRenderCount(sessionRef)), [sessionRef]);
  return useMemo(() => ({ used, remaining, consume }), [used, remaining, consume]);
}

/** Fired when the mini preview stage asks the AI panel to render. */
export const REQUEST_PREVIEW_EVENT = "woolet:bespoke:requestPreview";
