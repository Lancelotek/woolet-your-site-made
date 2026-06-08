import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { isValidLang, type Lang } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { toast } from "sonner";

function pickModel(faceWidthMm: number, noseWidthMm: number): "007" | "009" {
  // 009 has the wider keyhole bridge; recommend it when the nose is wider.
  return noseWidthMm >= 40 ? "009" : "007";
}

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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

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
      const [{ data: p }, { data: s }, { data: o }] = await Promise.all([
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
      ]);
      if (cancelled) return;
      setProfile(p as Profile | null);
      setScans((s as Scan[] | null) ?? []);
      setOrders((o as Order[] | null) ?? []);
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
