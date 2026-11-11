// Where a Bespoke order stands, in six words. The detail lives on the order
// timeline (bespoke-timeline.ts); these stages are its short name for the
// orders table and the filter. Stage 2 and 4 set themselves (fitting form
// received, model sent); reaching stage 6 emails the tracking number.

export const CRM_STAGES = [
  { id: 1, label: "Waiting for the fitting", short: "Fitting" },
  { id: 2, label: "Fitting received", short: "Received" },
  { id: 3, label: "Brief at the workshop", short: "Workshop" },
  { id: 4, label: "Model with the customer", short: "Model" },
  { id: 5, label: "In production", short: "In production" },
  { id: 6, label: "Shipped", short: "Shipped" },
] as const;

export const CRM_STAGE_COUNT = CRM_STAGES.length;

export type CrmStage = 1 | 2 | 3 | 4 | 5 | 6;

export const SHIPPED_STAGE: CrmStage = 6;

export function crmStageOf(order: Record<string, unknown> | null | undefined): CrmStage {
  const raw = Number(order?.crm_stage ?? 1);
  if (!Number.isFinite(raw)) return 1;
  return Math.min(CRM_STAGE_COUNT, Math.max(1, Math.trunc(raw))) as CrmStage;
}

export const crmStageLabel = (stage: number) =>
  CRM_STAGES.find((s) => s.id === stage)?.label ?? "Waiting for the fitting";

export const crmStageShort = (stage: number) =>
  CRM_STAGES.find((s) => s.id === stage)?.short ?? "Fitting";

/** "3/6 · Spec sent" */
export const crmStageSummary = (stage: number) =>
  `${stage}/${CRM_STAGE_COUNT} · ${crmStageShort(stage)}`;

export const crmStageReachedAt = (
  order: Record<string, unknown> | null | undefined,
  stage: number,
) => (order?.[`crm_stage_${stage}_at`] as string | null | undefined) ?? null;

/**
 * Server codes read like machine output. The panel is used under time
 * pressure, so every message here says what to do next in plain words.
 */
const CRM_ERRORS: Record<string, string> = {
  tracking_required: "Add a tracking number before marking the order shipped.",
  balance_unpaid: "The balance is not paid yet. Production starts after the customer approves the 3D model and pays the balance.",
  not_deposit_order: "This order was paid in full at checkout - there is no balance to collect.",
  balance_already_paid: "The balance for this order is already paid.",
  invalid_stage: "That stage does not exist.",
  unknown_check: "That step cannot be ticked here.",
  invalid_id: "That order could not be found.",
  order_not_found: "That order could not be found.",
  "Invalid password": "Your session expired. Reload the page and sign in again.",
  server_error: "The server could not save the change. Try again in a moment.",
};

export const crmErrorMessage = (err: unknown) => {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  return CRM_ERRORS[raw] ?? (raw ? `Could not save the change: ${raw}` : "Could not save the change.");
};
