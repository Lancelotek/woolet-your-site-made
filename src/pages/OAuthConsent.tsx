import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";

const GOLD = "#c9a84c";

// Minimal typed shim for the beta supabase.auth.oauth namespace.
type OAuthClient = {
  name?: string;
  client_name?: string;
  redirect_uri?: string;
};
type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};

export default function OAuthConsent() {
  const navigate = useNavigate();
  const [authorizationId, setAuthorizationId] = useState<string>("");
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("authorization_id") ?? "";
    setAuthorizationId(id);
    let active = true;

    (async () => {
      if (!id) {
        setError("This authorization link is missing an authorization_id.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        navigate(`/en/account/sign-in?next=${encodeURIComponent(next)}`, { replace: true });
        return;
      }
      const oauth = (supabase.auth as unknown as { oauth?: OAuthApi }).oauth;
      if (!oauth) {
        setError("This build of the auth client does not support OAuth authorization.");
        return;
      }
      const { data, error: err } = await oauth.getAuthorizationDetails(id);
      if (!active) return;
      if (err) {
        setError(err.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const oauth = (supabase.auth as unknown as { oauth?: OAuthApi }).oauth;
    if (!oauth) {
      setBusy(false);
      setError("OAuth is not available in this build.");
      return;
    }
    const { data, error: err } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect was returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an external application";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Authorize application — Woolet" description="Grant access to Woolet on your behalf." noindex />
      <Navbar />
      <main className="flex-1 px-5 py-16 flex justify-center">
        <div className="w-full max-w-[520px] flex flex-col gap-8">
          <div>
            <p className="uppercase tracking-[0.22em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
              Authorize
            </p>
            <h1 className="font-display text-foreground mt-3" style={{ fontSize: "2rem", fontWeight: 300, lineHeight: 1.15 }}>
              Connect <em className="italic" style={{ color: GOLD }}>{clientName}</em> to your Woolet account
            </h1>
            <p className="text-cream-dim mt-4" style={{ fontSize: "0.95rem", lineHeight: 1.55 }}>
              {clientName} will be able to call Woolet's read-only product tools while you are signed in.
              This does not bypass Woolet's own permissions or backend policies.
            </p>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", padding: 16 }}>
              <p style={{ color: "#fca5a5", fontFamily: "Barlow, sans-serif", fontSize: "0.9rem" }}>{error}</p>
            </div>
          )}

          {!details && !error && (
            <p className="text-cream-dim" style={{ fontSize: "0.9rem" }}>Loading authorization request…</p>
          )}

          {details && (
            <div className="flex flex-col gap-4">
              <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)", padding: 16 }}>
                <p className="text-cream-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.65rem" }}>
                  Requested access
                </p>
                <p className="text-foreground mt-2" style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>
                  Read Woolet's public product catalog and fit recommendations on your behalf.
                </p>
                {details.scope && (
                  <p className="text-cream-dim mt-3" style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    Scopes: {details.scope}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => decide(true)}
                  style={{
                    flex: 1,
                    background: busy ? "rgba(201,168,76,0.4)" : GOLD,
                    color: "#0f0f0f",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    padding: "18px 28px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: busy ? "wait" : "pointer",
                    height: 52,
                  }}
                >
                  {busy ? "Working…" : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => decide(false)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "white",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    padding: "18px 28px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    border: "1px solid rgba(255,255,255,0.25)",
                    cursor: busy ? "wait" : "pointer",
                    height: 52,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
