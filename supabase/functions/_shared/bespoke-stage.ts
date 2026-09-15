// Server-side guard for the bespoke stage machine. The ladder runs one
// direction only; a write that skips backwards is rejected here, not in the UI.
import { canAdvance, type BespokeStage } from "./bespoke-case.ts";

type Db = {
  from: (t: string) => any;
};

export type StageActor = "system" | "marek" | "customer" | "workshop";

/**
 * Move an order to `toStage` and log the move. Returns the stage the order
 * ended on. A rejected move leaves the order untouched and logs nothing.
 */
export async function recordStage(
  db: Db,
  orderId: string,
  toStage: BespokeStage,
  actor: StageActor,
  meta?: Record<string, unknown>,
): Promise<{ ok: boolean; stage: string; reason?: string }> {
  const { data: order, error } = await db
    .from("bespoke_orders")
    .select("id, stage")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) return { ok: false, stage: "", reason: "order_not_found" };

  const from = (order as { stage?: string }).stage ?? "paid";

  // Both mid-flow flags live in the history, so the pair rule can be checked
  // whichever order they arrived in.
  const { data: history } = await db
    .from("bespoke_stage_history")
    .select("to_stage")
    .eq("order_id", orderId);
  const seen = new Set<string>(
    ((history as { to_stage: string }[] | null) ?? []).map((r) => r.to_stage),
  );
  seen.add(from);

  const verdict = canAdvance(from, toStage, {
    scanReceived: seen.has("scan_received"),
    interviewDone: seen.has("interview_done"),
  });
  if (!verdict.ok) return { ok: false, stage: from, reason: verdict.reason };

  const { error: upErr } = await db
    .from("bespoke_orders")
    .update({ stage: toStage })
    .eq("id", orderId);
  if (upErr) return { ok: false, stage: from, reason: upErr.message };

  await db.from("bespoke_stage_history").insert({
    order_id: orderId,
    from_stage: from,
    to_stage: toStage,
    actor,
    meta: meta ?? null,
  });
  return { ok: true, stage: toStage };
}

/**
 * The first stage of a case. Idempotent: an order that already carries a
 * `paid` history row is left exactly as it is, so a replayed Stripe event
 * writes nothing.
 */
export async function ensurePaidStage(db: Db, orderId: string, meta?: Record<string, unknown>) {
  const { data: existing } = await db
    .from("bespoke_stage_history")
    .select("id")
    .eq("order_id", orderId)
    .eq("to_stage", "paid")
    .limit(1)
    .maybeSingle();
  if (existing) return;
  await db.from("bespoke_stage_history").insert({
    order_id: orderId,
    from_stage: null,
    to_stage: "paid",
    actor: "system",
    meta: meta ?? null,
  });
}
