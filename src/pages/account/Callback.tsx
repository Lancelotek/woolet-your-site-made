import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isValidLang, type Lang } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";

const GOLD = "#c9a84c";

export default function Callback() {
  const navigate = useNavigate();
  const { lang: paramLang } = useParams();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    const finalize = async () => {
      // Wait briefly for Supabase to consume the URL hash and set the session.
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Supabase auto-handles the magic link hash; small retry for race.
        await new Promise((r) => setTimeout(r, 500));
      }
      const { data: { user }, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !user) {
        setStatus("error");
        setMessage("This sign-in link is invalid or expired. Please request a new one.");
        return;
      }
      // Backfill scans + orders by email.
      try {
        await supabase.rpc("link_user_data_by_email");
      } catch (e) {
        console.warn("[auth-callback] backfill failed", e);
      }
      // Honor ?next=/... so OAuth consent (or any other pending flow) picks
      // up where it left off. Only same-origin relative paths are allowed.
      const rawNext = new URLSearchParams(window.location.search).get("next");
      const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;
      navigate(next ?? `/${lang}/account`, { replace: true });
    };

    finalize();
    return () => {
      cancelled = true;
    };
  }, [lang, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Signing in… — Woolet" description="Completing your secure sign-in to Woolet." noindex />
      <Navbar />
      <main className="flex-1 px-5 py-24 flex justify-center">
        <div className="max-w-[420px] flex flex-col gap-4 text-center">
          <p className="font-display text-foreground" style={{ fontSize: "1.6rem", fontWeight: 300 }}>
            {status === "working" ? "One moment…" : "Hmm."}
          </p>
          <p className="text-cream-dim" style={{ fontSize: "0.95rem", lineHeight: 1.55 }}>
            {message}
          </p>
          {status === "error" && (
            <a href={`/${lang}/account/sign-in`} style={{ color: GOLD, fontSize: "0.85rem" }}>
              Request a new link
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
