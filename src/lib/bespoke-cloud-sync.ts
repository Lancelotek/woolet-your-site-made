import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { INITIAL_CONFIG, computePricing, type BespokeConfig } from "@/lib/bespoke-state";

export type CloudSyncStatus = "idle" | "loading" | "saving" | "saved" | "error" | "offline";

const isEmptyConfig = (c: BespokeConfig) =>
  !c.frameId && !c.frontColorId && !c.templeColorId && !c.engravingEnabled && !c.measurements.pd;

const stripVolatile = (c: BespokeConfig) => {
  const { updatedAt: _ignore, ...rest } = c;
  return rest;
};

const sameConfig = (a: BespokeConfig, b: BespokeConfig) =>
  JSON.stringify(stripVolatile(a)) === JSON.stringify(stripVolatile(b));

interface Options {
  config: BespokeConfig;
  setConfig: (next: BespokeConfig) => void;
}

export function useBespokeCloudSync({ config, setConfig }: Options) {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<CloudSyncStatus>("idle");
  const [rowId, setRowId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const hasHydrated = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const lastSerialised = useRef<string>("");

  // Hydrate from cloud on sign-in.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      hasHydrated.current = false;
      setRowId(null);
      setStatus("offline");
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("loading");
      const { data, error } = await supabase
        .from("bespoke_configs")
        .select("id, config, updated_at")
        .eq("user_id", user.id)
        .eq("is_current", true)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setStatus("error");
        return;
      }
      if (data?.config) {
        const remote = { ...INITIAL_CONFIG, ...(data.config as Partial<BespokeConfig>) };
        // Server wins on resume unless local is more recent and remote is empty.
        if (!sameConfig(remote, config)) setConfig(remote);
        setRowId(data.id);
        lastSerialised.current = JSON.stringify(stripVolatile(remote));
        setLastSavedAt(data.updated_at);
      } else {
        setRowId(null);
        lastSerialised.current = "";
      }
      hasHydrated.current = true;
      setStatus("saved");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  // Debounced upsert on changes.
  useEffect(() => {
    if (!user || !hasHydrated.current) return;
    if (isEmptyConfig(config) && !rowId) return;
    const serialised = JSON.stringify(stripVolatile(config));
    if (serialised === lastSerialised.current) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      setStatus("saving");
      const payload = {
        user_id: user.id,
        config: JSON.parse(JSON.stringify(config)),
        pricing_total_eur: computePricing(config).totalEur,
        is_current: true,
      };
      const query = rowId
        ? supabase.from("bespoke_configs").update(payload).eq("id", rowId).select("id, updated_at").maybeSingle()
        : supabase.from("bespoke_configs").insert(payload).select("id, updated_at").maybeSingle();
      const { data, error } = await query;
      if (error) {
        setStatus("error");
        return;
      }
      if (data) {
        setRowId(data.id);
        setLastSavedAt(data.updated_at);
      }
      lastSerialised.current = serialised;
      setStatus("saved");
    }, 800);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [config, user, rowId]);

  return { status, lastSavedAt, isSignedIn: !!user };
}
