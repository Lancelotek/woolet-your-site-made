// Live Bespoke price table for the browser.
//
// Starts from the defaults, then loads table `bespoke_pricing` and listens for
// changes (Supabase Realtime + refetch when the tab regains focus). Every
// component that prices a configuration re-renders the moment Marek saves a new
// price in /en/admin/bespoke - no deploy, no reload.

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_PRICE_TABLE,
  mergePriceRows,
  type PriceTable,
} from "../../supabase/functions/_shared/bespoke-pricing";

export type { PriceTable } from "../../supabase/functions/_shared/bespoke-pricing";
export { framePrice, lensPrice, engravingPrice, quoteBespoke, DEFAULT_PRICE_TABLE } from "../../supabase/functions/_shared/bespoke-pricing";

let table: PriceTable = { ...DEFAULT_PRICE_TABLE };
let started = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function setTable(next: PriceTable) {
  const changed = Object.keys({ ...table, ...next }).some((k) => table[k] !== next[k]);
  if (!changed) return;
  table = next;
  emit();
}

/** Re-read prices from the database. Safe to call often; concurrent calls share one request. */
export function refreshBespokePrices(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      // Table is newer than the generated Database types.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("bespoke_pricing").select("key, amount_usd");
      if (!error && Array.isArray(data)) setTable(mergePriceRows(data));
    } catch {
      // Network or missing table: keep the current (default) prices.
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshBespokePrices();
  try {
    supabase
      .channel("bespoke-pricing")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "bespoke_pricing" }, () => {
        void refreshBespokePrices();
      })
      .subscribe();
  } catch {
    // Realtime unavailable - focus refetch still keeps prices fresh.
  }
  const onFocus = () => {
    if (document.visibilityState === "visible") void refreshBespokePrices();
  };
  document.addEventListener("visibilitychange", onFocus);
  window.addEventListener("focus", onFocus);
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Current price table (defaults until the first load lands). */
export const getPriceTable = (): PriceTable => table;

/** React hook: the live price table; re-renders on every price change. */
export function usePriceTable(): PriceTable {
  useEffect(start, []);
  return useSyncExternalStore(subscribe, getPriceTable, getPriceTable);
}

/** Test helper. */
export function __setPriceTableForTests(next: PriceTable) {
  table = next;
  emit();
}
