import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { isValidLang, type Lang } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { clampFaceMm, clampNoseMm } from "@/lib/scan-clamp";
import { MEASUREMENT_RANGES, type MeasurementKey } from "@/data/bespoke-options";

function pickModel(faceWidthMm: number, noseWidthMm: number): "007" | "009" {
  // 009 has the wider keyhole bridge; recommend it when the nose is wider.
  return noseWidthMm >= 40 ? "009" : "007";
}

type BespokeConfigRow = {
  id: string;
  name: string | null;
  is_current: boolean;
  updated_at: string;
  config: { measurements?: Partial<Record<MeasurementKey, number>> } & Record<string, unknown>;
};

const GOLD = "#c9a84c";

type Scan = {
  id: string;
  created_at: string;
  status: string;
  face_width_mm: number | null;
  nose_width_mm: number | null;
  recommendation_type: string | null;
  confidence: string | null;
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  locale: string | null;
  marketing_opt_in: boolean;
};

type Order = {
  id: string;
  created_at: string;
  amount_cents: number;
  currency: string;
  recommended_sku: string | null;
  environment: string;
  stripe_session_id: string;
};

export default function Account() {
  const { lang: paramLang } = useParams();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const { session, user, loading, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const cameFromFit = searchParams.get("from") === "fit";
  const emailVerified = !!user?.email_confirmed_at;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bespoke, setBespoke] = useState<BespokeConfigRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!user?.email || resendState === "sending" || resendCooldown > 0) return;
    setResendState("sending");
    setResendError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/${lang}/account/callback`,
          shouldCreateUser: false,
        },
      });
      if (error) {
        const msg = (error.message || "").toLowerCase();
        let friendly = error.message || "Couldn't send the link. Please try again.";
        if (msg.includes("rate") || msg.includes("too many") || (error as { status?: number }).status === 429) {
          friendly = "Too many requests. Please wait a minute before trying again.";
          setResendCooldown(60);
        } else if (msg.includes("invalid") && msg.includes("email")) {
          friendly = "This email looks invalid. Contact support if it's correct.";
        } else if (msg.includes("not found") || msg.includes("user not found")) {
          friendly = "We couldn't find that account. Try signing in fresh.";
        } else if (msg.includes("network") || msg.includes("fetch")) {
          friendly = "Network error. Check your connection and try again.";
        }
        setResendError(friendly);
        setResendState("idle");
        toast.error(friendly);
        return;
      }
      setResendState("sent");
      setResendCooldown(30);
      toast.success("Verification link sent. Check your inbox (and spam).");
      setTimeout(() => setResendState("idle"), 4000);
    } catch (err) {
      const friendly = "Something went wrong. Please try again.";
      setResendError(friendly);
      setResendState("idle");
      toast.error(friendly);
      console.error("[account] resend verification failed", err);
    }
  };

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const load = async () => {
      setDataLoading(true);
      // Link any guest scans/orders previously made with the same email to
      // this account. Idempotent — safe to call on every Account mount.
      try {
        await supabase.rpc("link_user_data_by_email");
      } catch (err) {
        console.warn("[account] link_user_data_by_email failed", err);
      }
      const [{ data: p }, { data: s }, { data: o }, { data: b }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
        supabase
          .from("scan_sessions")
          .select("id, created_at, status, face_width_mm, nose_width_mm, recommendation_type, confidence")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("founding_members")
          .select("id, created_at, amount_cents, currency, recommended_sku, environment, stripe_session_id")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("bespoke_configs")
          .select("id, name, is_current, updated_at, config")
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setProfile(p as Profile | null);
      // Clamp implausible scan output for display (e.g. 175 mm face → 161 mm,
      // 49 mm nose → 42 mm). The raw row is preserved in the DB.
      const clampedScans = ((s as Scan[] | null) ?? []).map((row) => ({
        ...row,
        face_width_mm: clampFaceMm(row.face_width_mm),
        nose_width_mm: clampNoseMm(row.nose_width_mm),
      }));
      setScans(clampedScans);
      setOrders((o as Order[] | null) ?? []);
      setBespoke((b as BespokeConfigRow[] | null) ?? []);
      setDataLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!session) {
    return <Navigate to={`/${lang}/account/sign-in`} replace />;
  }

  const latestCompleted = scans.find(
    (s) => s.status === "completed" && s.face_width_mm && s.nose_width_mm,
  );
  const recModel = latestCompleted
    ? pickModel(latestCompleted.face_width_mm!, latestCompleted.nose_width_mm!)
    : null;

  const saveProfile = async (patch: Partial<Profile>) => {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    setSavingProfile(false);
    if (error) {
      toast.error("Couldn't save changes.");
      return;
    }
    setProfile({ ...profile, ...patch });
    toast.success("Saved");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Your account — Woolet" description="" noindex />
      <Navbar />
      <main className="flex-1 px-5 py-12 flex justify-center">
        <div className="w-full max-w-[680px] flex flex-col gap-12">
          <header className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="uppercase tracking-[0.22em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
                Account
              </p>
              <h1 className="font-display text-foreground mt-2" style={{ fontSize: "2rem", fontWeight: 300, lineHeight: 1.1 }}>
                {profile?.full_name || user?.email}
              </h1>
              <p className="text-cream-dim mt-2" style={{ fontSize: "0.85rem" }}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="uppercase tracking-[0.2em] bg-transparent text-cream-dim hover:text-foreground"
              style={{
                fontSize: "0.6rem",
                border: "1px solid rgba(255,255,255,0.16)",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </header>

          {cameFromFit && (
            <div
              className="flex flex-col gap-2"
              style={{
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.25)",
                padding: "16px 18px",
              }}
            >
              <p className="text-foreground" style={{ fontSize: "0.95rem", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}>
                Welcome back. Your fit scan is loaded.
              </p>
              <p className="text-cream-dim" style={{ fontSize: "0.8rem", lineHeight: 1.55 }}>
                Your measurements are pre-filled below under Bespoke measurements and Measurement history. Review them, then reserve your spot when you're ready.
              </p>
            </div>
          )}

          {!emailVerified && (
            <div
              className="flex flex-col gap-3"
              style={{
                background: "rgba(252,165,165,0.06)",
                border: "1px solid rgba(252,165,165,0.35)",
                padding: "16px 18px",
              }}
              role="alert"
            >
              <p className="text-foreground" style={{ fontSize: "0.9rem", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}>
                Verify your email before checkout
              </p>
              <p className="text-cream-dim" style={{ fontSize: "0.8rem", lineHeight: 1.55 }}>
                We need to confirm <strong style={{ color: "white" }}>{user?.email}</strong> owns this account before you can place a paid order. Open the latest sign-in link we emailed you. If it expired or didn't arrive, request a new one below.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleResendVerification}
                  disabled={resendState === "sending" || resendCooldown > 0}
                  className="uppercase tracking-[0.22em]"
                  style={{
                    background: resendState === "sending" || resendCooldown > 0 ? "rgba(201,168,76,0.4)" : GOLD,
                    color: "#0f0f0f",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    padding: "10px 18px",
                    border: "none",
                    cursor: resendState === "sending" || resendCooldown > 0 ? "wait" : "pointer",
                  }}
                >
                  {resendState === "sending"
                    ? "Sending…"
                    : resendState === "sent"
                    ? "Link sent ✓"
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend verification link"}
                </button>
                {resendState === "sent" && (
                  <span className="text-cream-dim" style={{ fontSize: "0.75rem" }}>
                    Sent to {user?.email}. Check spam too.
                  </span>
                )}
              </div>
              {resendError && (
                <p style={{ color: "#fca5a5", fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", margin: 0 }}>
                  {resendError}
                </p>
              )}
            </div>
          )}



          {/* Recommendation */}
          <section className="flex flex-col gap-3">
            <h2 className="uppercase tracking-[0.2em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
              Your recommendation
            </h2>
            {recModel ? (
              <div className="p-6" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)" }}>
                <p className="font-display text-foreground" style={{ fontSize: "1.6rem", fontWeight: 300 }}>
                  Model <em className="italic" style={{ color: GOLD }}>{recModel}</em>
                </p>
                <p className="text-cream-dim mt-2" style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>
                  Based on your latest scan: face {latestCompleted!.face_width_mm} mm, nose {latestCompleted!.nose_width_mm} mm.
                </p>
                <Link
                  to={`/${lang}/products/${recModel}`}
                  className="inline-block mt-4 uppercase tracking-[0.22em] no-underline"
                  style={{
                    background: GOLD,
                    color: "#0f0f0f",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    padding: "12px 22px",
                  }}
                >
                  View model {recModel}
                </Link>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                <p className="text-cream-dim" style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>
                  No fit scan on file yet. Run a 30-second scan and we'll save
                  your measurements to this account so you always get the right
                  recommendation.
                </p>
                <Link
                  to={`/${lang}/fit`}
                  className="inline-block self-start uppercase tracking-[0.22em] no-underline"
                  style={{
                    background: GOLD,
                    color: "#0f0f0f",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    padding: "12px 22px",
                  }}
                >
                  Take the fit scan
                </Link>
              </div>
            )}
          </section>

          {/* Scan history */}
          <section className="flex flex-col gap-3">
            <h2 className="uppercase tracking-[0.2em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
              Measurement history
            </h2>
            {dataLoading ? (
              <p className="text-cream-dim" style={{ fontSize: "0.85rem" }}>Loading…</p>
            ) : scans.length === 0 ? (
              <div className="flex flex-col gap-3" style={{ border: "1px solid rgba(255,255,255,0.12)", padding: "1.25rem" }}>
                <p className="text-cream-dim" style={{ fontSize: "0.85rem", lineHeight: 1.55 }}>
                  No scans linked yet. Run the 30‑second fit scan and we'll save it here.
                </p>
                <Link
                  to={`/${lang}/fit`}
                  className="inline-block self-start uppercase tracking-[0.22em] no-underline"
                  style={{
                    background: GOLD,
                    color: "#0f0f0f",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    padding: "12px 22px",
                  }}
                >
                  Take the fit scan
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-0 m-0 p-0" style={{ listStyle: "none" }}>
                {scans.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 py-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div>
                      <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
                        {s.face_width_mm ?? "—"} mm face · {s.nose_width_mm ?? "—"} mm nose
                      </p>
                      <p className="text-cream-dim mt-1" style={{ fontSize: "0.72rem" }}>
                        {new Date(s.created_at).toLocaleDateString()} · {s.status}
                        {s.confidence ? ` · ${s.confidence} confidence` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.recommendation_type && (
                        <span
                          className="uppercase tracking-[0.18em]"
                          style={{ color: GOLD, fontSize: "0.65rem", border: `1px solid ${GOLD}`, padding: "4px 10px" }}
                        >
                          {s.recommendation_type}
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this scan result? You can run a new scan afterwards.")) return;
                          const { error } = await supabase.from("scan_sessions").delete().eq("id", s.id);
                          if (error) {
                            toast.error("Couldn't delete this scan.");
                            return;
                          }
                          setScans((prev) => prev.filter((x) => x.id !== s.id));
                          toast.success("Scan deleted");
                        }}
                        className="uppercase tracking-[0.18em] bg-transparent text-cream-dim hover:text-foreground"
                        style={{
                          fontSize: "0.6rem",
                          border: "1px solid rgba(255,255,255,0.16)",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                        aria-label="Delete scan"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Orders */}
          <section className="flex flex-col gap-3">
            <h2 className="uppercase tracking-[0.2em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
              Orders & pre-orders
            </h2>
            {dataLoading ? (
              <p className="text-cream-dim" style={{ fontSize: "0.85rem" }}>Loading…</p>
            ) : orders.length === 0 ? (
              <p className="text-cream-dim" style={{ fontSize: "0.85rem" }}>No orders linked yet.</p>
            ) : (
              <ul className="flex flex-col gap-0 m-0 p-0" style={{ listStyle: "none" }}>
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-4 py-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div>
                      <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
                        {(o.amount_cents / 100).toFixed(2)} {o.currency.toUpperCase()}
                        {o.recommended_sku ? ` · ${o.recommended_sku}` : ""}
                      </p>
                      <p className="text-cream-dim mt-1" style={{ fontSize: "0.72rem" }}>
                        {new Date(o.created_at).toLocaleDateString()} · {o.environment}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Bespoke measurements */}
          <section className="flex flex-col gap-3">
            <h2 className="uppercase tracking-[0.2em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
              Bespoke measurements
            </h2>
            {dataLoading ? (
              <p className="text-cream-dim" style={{ fontSize: "0.85rem" }}>Loading…</p>
            ) : bespoke.length === 0 ? (
              <div className="flex flex-col gap-3" style={{ border: "1px solid rgba(255,255,255,0.12)", padding: "1.25rem" }}>
                <p className="text-cream-dim" style={{ fontSize: "0.85rem", lineHeight: 1.55 }}>
                  No bespoke configurations saved yet. Start a configurator to record your measurements here.
                </p>
                <Link
                  to={`/${lang}/bespoke`}
                  className="inline-block self-start uppercase tracking-[0.22em] no-underline"
                  style={{
                    background: GOLD,
                    color: "#0f0f0f",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    padding: "12px 22px",
                  }}
                >
                  Start bespoke
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-4 m-0 p-0" style={{ listStyle: "none" }}>
                {bespoke.map((row) => (
                  <BespokeMeasurementsCard
                    key={row.id}
                    row={row}
                    onSaved={(updated) =>
                      setBespoke((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
                    }
                  />
                ))}
              </ul>
            )}
          </section>



          {/* Profile */}
          <section className="flex flex-col gap-4">
            <h2 className="uppercase tracking-[0.2em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
              Profile
            </h2>
            {profile && (
              <ProfileEditor profile={profile} onSave={saveProfile} saving={savingProfile} />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfileEditor({
  profile,
  onSave,
  saving,
}: {
  profile: Profile;
  onSave: (p: Partial<Profile>) => void;
  saving: boolean;
}) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [locale, setLocale] = useState(profile.locale ?? "en");
  const [marketingOptIn, setMarketingOptIn] = useState(profile.marketing_opt_in);

  const dirty =
    fullName !== (profile.full_name ?? "") ||
    locale !== (profile.locale ?? "en") ||
    marketingOptIn !== profile.marketing_opt_in;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-cream-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.65rem" }}>
          Full name
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          maxLength={120}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.16)",
            color: "white",
            padding: "12px 14px",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.95rem",
            borderRadius: 4,
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-cream-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.65rem" }}>
          Language
        </label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.16)",
            color: "white",
            padding: "12px 14px",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.95rem",
            borderRadius: 4,
          }}
        >
          <option value="en">English</option>
          <option value="pl">Polski</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>
      <label className="flex items-start gap-2 cursor-pointer text-cream-dim" style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          style={{ marginTop: 3, accentColor: GOLD }}
        />
        <span>Send me occasional updates about Woolet.</span>
      </label>
      <button
        disabled={!dirty || saving}
        onClick={() => onSave({ full_name: fullName.trim() || null, locale, marketing_opt_in: marketingOptIn })}
        style={{
          alignSelf: "flex-start",
          marginTop: 4,
          background: !dirty || saving ? "rgba(201,168,76,0.4)" : GOLD,
          color: "#0f0f0f",
          fontFamily: "Barlow, sans-serif",
          fontWeight: 500,
          fontSize: "0.7rem",
          padding: "12px 22px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          border: "none",
          cursor: !dirty || saving ? "default" : "pointer",
        }}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function BespokeMeasurementsCard({
  row,
  onSaved,
}: {
  row: BespokeConfigRow;
  onSaved: (next: BespokeConfigRow) => void;
}) {
  const initial = (row.config?.measurements ?? {}) as Partial<Record<MeasurementKey, number>>;
  // Clamp face/nose-derived values to anatomically plausible maxes for display.
  const sanitized: Partial<Record<MeasurementKey, number>> = {
    ...initial,
    faceWidth: initial.faceWidth != null ? clampFaceMm(initial.faceWidth) ?? undefined : undefined,
    bridge: initial.bridge != null ? clampNoseMm(initial.bridge) ?? undefined : undefined,
  };
  const [values, setValues] = useState<Partial<Record<MeasurementKey, string>>>(() => {
    const out: Partial<Record<MeasurementKey, string>> = {};
    (Object.keys(MEASUREMENT_RANGES) as MeasurementKey[]).forEach((k) => {
      const v = sanitized[k];
      out[k] = v != null ? String(v) : "";
    });
    return out;
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const keys = Object.keys(MEASUREMENT_RANGES) as MeasurementKey[];

  const save = async () => {
    setSaving(true);
    const next: Partial<Record<MeasurementKey, number>> = {};
    for (const k of keys) {
      const raw = values[k]?.trim();
      if (!raw) continue;
      const n = Number(raw);
      const range = MEASUREMENT_RANGES[k];
      if (!Number.isFinite(n)) {
        toast.error(`${range.label}: enter a number.`);
        setSaving(false);
        return;
      }
      if (n < range.min || n > range.max) {
        toast.error(`${range.label} must be ${range.min}–${range.max} mm.`);
        setSaving(false);
        return;
      }
      next[k] = Math.round(n);
    }
    const newConfig = { ...row.config, measurements: next };
    const { data, error } = await supabase
      .from("bespoke_configs")
      .update({ config: newConfig })
      .eq("id", row.id)
      .select("id, name, is_current, updated_at, config")
      .maybeSingle();
    setSaving(false);
    if (error || !data) {
      toast.error("Couldn't save measurements.");
      return;
    }
    onSaved(data as BespokeConfigRow);
    setEditing(false);
    toast.success("Measurements updated");
  };

  return (
    <li
      className="flex flex-col gap-4 p-5"
      style={{ border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
            {row.name || "Bespoke configuration"}
            {row.is_current && (
              <span
                className="ml-3 uppercase tracking-[0.18em]"
                style={{ color: GOLD, fontSize: "0.6rem", border: `1px solid ${GOLD}`, padding: "2px 8px" }}
              >
                Current
              </span>
            )}
          </p>
          <p className="text-cream-dim mt-1" style={{ fontSize: "0.72rem" }}>
            Updated {new Date(row.updated_at).toLocaleDateString()}
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="uppercase tracking-[0.2em] bg-transparent text-cream-dim hover:text-foreground"
            style={{
              fontSize: "0.6rem",
              border: "1px solid rgba(255,255,255,0.16)",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const out: Partial<Record<MeasurementKey, string>> = {};
                keys.forEach((k) => {
                  const v = sanitized[k];
                  out[k] = v != null ? String(v) : "";
                });
                setValues(out);
                setEditing(false);
              }}
              className="uppercase tracking-[0.2em] bg-transparent text-cream-dim hover:text-foreground"
              style={{
                fontSize: "0.6rem",
                border: "1px solid rgba(255,255,255,0.16)",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={save}
              className="uppercase tracking-[0.2em]"
              style={{
                fontSize: "0.6rem",
                background: saving ? "rgba(201,168,76,0.4)" : GOLD,
                color: "#0f0f0f",
                border: "none",
                padding: "8px 14px",
                cursor: saving ? "default" : "pointer",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 500,
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        {keys.map((k) => {
          const range = MEASUREMENT_RANGES[k];
          const display = values[k];
          return (
            <div key={k} className="flex flex-col gap-1">
              <label
                className="text-cream-dim uppercase tracking-[0.16em]"
                style={{ fontSize: "0.6rem" }}
              >
                {range.label}
              </label>
              {editing ? (
                <input
                  type="number"
                  inputMode="numeric"
                  min={range.min}
                  max={range.max}
                  value={display ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [k]: e.target.value }))
                  }
                  placeholder={`${range.min}–${range.max}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    color: "white",
                    padding: "10px 12px",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.9rem",
                    borderRadius: 4,
                  }}
                />
              ) : (
                <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
                  {display ? `${display} mm` : <span className="text-cream-dim">—</span>}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </li>
  );
}

