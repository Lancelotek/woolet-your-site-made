import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { pushGtmEvent } from "@/lib/gtm";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "woolet_popup_dismissed";

const EmailPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => {
      setOpen(true);
      pushGtmEvent("popup_shown", { type: "email_capture" });
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      await supabase.functions.invoke("mailerlite-subscribe", {
        body: { email, name: "", width: "", source: "popup", utm_source: "popup", utm_campaign: "" },
      });
      pushGtmEvent("popup_email_submitted", { email });
      setSubmitted(true);
      setTimeout(() => handleDismiss(), 3000);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleDismiss}>
        <DialogContent className="bg-card border-border max-w-sm p-8 text-center">
          <DialogTitle className="sr-only">Subscription confirmed</DialogTitle>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display text-foreground text-lg">You're on the list!</p>
            <p className="text-muted-foreground text-sm">We'll notify you when we launch.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="bg-card border-border max-w-sm p-0 overflow-hidden">
        <DialogTitle className="sr-only">Get notified when we launch</DialogTitle>
        {/* Gold accent line */}
        <div className="h-1 w-full bg-primary" />

        <div className="p-6 pt-5 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="font-display text-foreground text-lg leading-tight">
                Don't miss the launch
              </p>
              <p className="text-muted-foreground text-xs tracking-wider leading-relaxed">
                Be the first to know when Woolet eyewear drops. Early access + exclusive founding member pricing.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-sm text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-sm text-sm font-medium tracking-wider uppercase bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "..." : "Notify Me"}
            </button>
          </form>

          <p className="text-muted-foreground text-center" style={{ fontSize: "0.6rem" }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPopup;
