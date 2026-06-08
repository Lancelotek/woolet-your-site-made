import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "loading" | "valid" | "invalid" | "already" | "success" | "submitting" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setState("invalid");
          return;
        }
        if (data?.status === "already_unsubscribed") {
          setEmail(data.email ?? null);
          setState("already");
        } else {
          setEmail(data.email ?? null);
          setState("valid");
        }
      } catch {
        setState("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setState("submitting");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setState("error");
    }
  };

  return (
    <div style={{ background: "#080807", minHeight: "100vh", color: "#fff" }}>
      <SEO title="Unsubscribe — Woolet" description="Manage your email preferences." noindex />
      <Navbar />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, fontWeight: 300, margin: "0 0 16px" }}>
          Unsubscribe
        </h1>

        {state === "loading" && <p style={{ color: "#aaa" }}>Checking your link…</p>}

        {state === "invalid" && (
          <p style={{ color: "#fca5a5" }}>
            This unsubscribe link is invalid or has expired. If you keep receiving emails you don't
            want, reply to any Woolet email and we'll remove you manually.
          </p>
        )}

        {(state === "valid" || state === "submitting") && (
          <>
            <p style={{ color: "#ccc", lineHeight: 1.6 }}>
              Click below to unsubscribe {email ? <strong>{email}</strong> : "this address"} from all
              Woolet emails (scan results, order updates, and product news).
            </p>
            <button
              onClick={confirm}
              disabled={state === "submitting"}
              style={{
                marginTop: 24,
                background: "#CAA449",
                color: "#080807",
                border: "none",
                padding: "16px 28px",
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: state === "submitting" ? "wait" : "pointer",
              }}
            >
              {state === "submitting" ? "Unsubscribing…" : "Confirm unsubscribe"}
            </button>
          </>
        )}

        {state === "already" && (
          <p style={{ color: "#ccc" }}>
            {email ? <strong>{email}</strong> : "This address"} is already unsubscribed. You won't get
            any further emails from us.
          </p>
        )}

        {state === "success" && (
          <p style={{ color: "#ccc" }}>
            Done — {email ? <strong>{email}</strong> : "this address"} has been unsubscribed.
          </p>
        )}

        {state === "error" && (
          <p style={{ color: "#fca5a5" }}>Something went wrong. Please try again in a moment.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
