import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { STORAGE_KEY } from "@/lib/bespoke-state";
import { findFrame } from "@/data/frames";
import { pushGtmEvent } from "@/lib/gtm";
import { claritySet } from "@/lib/clarity";

/** Set on /en/bespoke/checkout?paid=1 — a finished order never gets a "continue" nudge. */
export const BESPOKE_PURCHASED_KEY = "woolet:bespoke:purchasedAt";
const DISMISS_KEY = "woolet:bespoke:resumeDismissed";

// Pages where the bar would be noise: the build flow itself, admin, account.
const HIDDEN = [/^\/[a-z]{2}\/bespoke\/(configurator|checkout|measurements|measure|photo)/, /\/admin/, /\/account/];

interface SavedBuild {
  frameName: string;
}

const readSavedBuild = (): SavedBuild | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as { frameId?: string | null; updatedAt?: string };
    if (!cfg.frameId) return null;
    const purchasedAt = localStorage.getItem(BESPOKE_PURCHASED_KEY);
    if (purchasedAt && cfg.updatedAt && purchasedAt >= cfg.updatedAt) return null;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return null;
    const frame = findFrame(cfg.frameId);
    return { frameName: frame?.name ?? "bespoke frame" };
  } catch {
    return null;
  }
};

/**
 * "Continue your build" strip under the navbar.
 * Clarity (Sept 2026): 25 configurator sessions ended on a click on the Woolet
 * logo — the build is saved locally, this brings people back to it.
 */
export default function ResumeBuildBar() {
  const { pathname } = useLocation();
  const [build, setBuild] = useState<SavedBuild | null>(null);

  const hidden = !pathname.startsWith("/en") || HIDDEN.some((re) => re.test(pathname));

  useEffect(() => {
    if (hidden) return;
    const b = readSavedBuild();
    setBuild(b);
    if (b) claritySet("bespoke_resume_bar", "shown");
  }, [pathname, hidden]);

  if (hidden || !build) return null;

  return (
    <div
      className="sticky top-[73px] sm:top-[81px] z-40 border-b bg-surface/95 backdrop-blur-xl"
      style={{ borderBottomColor: "hsl(var(--gold) / 0.2)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3">
        <p className="text-cream-dim text-[0.78rem] leading-snug min-w-0 truncate">
          Your <span className="text-cream">{build.frameName}</span> build is saved.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/en/bespoke/configurator"
            onClick={() => pushGtmEvent("bespoke_resume_click", { from: pathname })}
            className="uppercase tracking-[0.2em] text-gold-light hover:text-gold no-underline text-[0.68rem]"
          >
            Continue →
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              try {
                sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {
                /* private mode */
              }
              setBuild(null);
            }}
            className="text-cream-dim/70 hover:text-cream p-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
