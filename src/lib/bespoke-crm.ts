// The manual production pipeline shown on the Bespoke admin page. Six stages,
// moved by hand — nothing here sends an email or a message.

export const CRM_STAGES = [
  { id: 1, label: "Interview / form", short: "Interview" },
  { id: 2, label: "WhatsApp", short: "WhatsApp" },
  { id: 3, label: "Spec sent to production", short: "Spec sent" },
  { id: 4, label: "Graphics to client", short: "Graphics" },
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
  CRM_STAGES.find((s) => s.id === stage)?.label ?? "Interview / form";

export const crmStageShort = (stage: number) =>
  CRM_STAGES.find((s) => s.id === stage)?.short ?? "Interview";

/** "3/6 · Spec sent" */
export const crmStageSummary = (stage: number) =>
  `${stage}/${CRM_STAGE_COUNT} · ${crmStageShort(stage)}`;

export const crmStageReachedAt = (
  order: Record<string, unknown> | null | undefined,
  stage: number,
) => (order?.[`crm_stage_${stage}_at`] as string | null | undefined) ?? null;
