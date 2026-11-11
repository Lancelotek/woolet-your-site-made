import { describe, expect, it } from "vitest";
import {
  BALANCE_REMINDER_DAY,
  BALANCE_WINDOW_DAYS,
  DEFAULT_PRICE_TABLE,
  depositPrice,
  mergePriceRows,
  splitDeposit,
} from "../../supabase/functions/_shared/bespoke-pricing";
import {
  balanceDueAt,
  balanceState,
  daysLeft,
  formatUsdCents,
  reminderDueAt,
} from "../../supabase/functions/_shared/bespoke-balance";
import { afterPaymentSteps, depositTerms } from "@/lib/bespoke-balance";
import { INITIAL_CONFIG, computePricing } from "@/lib/bespoke-state";

const DAY = 24 * 60 * 60 * 1000;

describe("bespoke deposit split", () => {
  it("is off in code until the deposit row exists in the price table", () => {
    expect(DEFAULT_PRICE_TABLE["deposit"]).toBe(0);
    expect(depositPrice(mergePriceRows([]))).toBe(0);
    expect(splitDeposit(48000, depositPrice(mergePriceRows([]))).plan).toBe("full");
  });

  it("sandbox deposit applies in test mode only", () => {
    const table = mergePriceRows([{ key: "deposit", amount_usd: 0 }, { key: "deposit_sandbox", amount_usd: 49 }]);
    expect(depositPrice(table)).toBe(0);
    expect(depositPrice(table, true)).toBe(49);
    expect(depositPrice(mergePriceRows([{ key: "deposit", amount_usd: 60 }]), true)).toBe(60);
  });

  it("charges the deposit now and the rest after approval", () => {
    const table = mergePriceRows([{ key: "deposit", amount_usd: "49.00" }]);
    expect(splitDeposit(49000, depositPrice(table))).toEqual({
      plan: "deposit",
      dueNowCents: 4900,
      balanceCents: 44100,
      totalCents: 49000,
    });
  });

  it("falls back to full payment when the deposit would leave no real balance", () => {
    expect(splitDeposit(4900, 49)).toEqual({ plan: "full", dueNowCents: 4900, balanceCents: 0, totalCents: 4900 });
    expect(splitDeposit(100, 49).plan).toBe("full"); // 100% coupon -> $1 Stripe minimum
    expect(splitDeposit(48000, 0).plan).toBe("full");
    expect(splitDeposit(48000, 0.5).plan).toBe("full");
  });

  it("the configurator shows the same split the server charges", () => {
    const config = { ...INITIAL_CONFIG, frameId: "aviator", lensTypeId: "none", engravingEnabled: true };
    const full = computePricing(config, mergePriceRows([]));
    expect(full.split.plan).toBe("full");
    const dep = computePricing(config, mergePriceRows([{ key: "deposit", amount_usd: 49 }]));
    expect(dep.totalEur).toBe(490);
    expect(dep.split).toEqual({ plan: "deposit", dueNowCents: 4900, balanceCents: 44100, totalCents: 49000 });
  });

  it("prints the terms a buyer must read before paying", () => {
    const split = splitDeposit(49000, 49);
    expect(depositTerms(split)).toBe(
      "$49 today starts your fit scan and 3D model. You pay the remaining $441 only after you approve the model. The deposit is non-refundable, and you are free to stop there.",
    );
    expect(afterPaymentSteps(split)).toHaveLength(5);
    expect(afterPaymentSteps(splitDeposit(49000, 0))).toHaveLength(4);
  });
});

describe("bespoke balance window", () => {
  const sent = new Date("2026-11-12T10:00:00Z");
  const order = {
    payment_plan: "deposit",
    model_sent_at: sent.toISOString(),
    balance_due_at: balanceDueAt(sent).toISOString(),
    balance_paid_at: null,
    balance_expired_at: null,
  };

  it("runs 14 days with a reminder on day 10", () => {
    expect(BALANCE_WINDOW_DAYS).toBe(14);
    expect(BALANCE_REMINDER_DAY).toBe(10);
    expect(balanceDueAt(sent).getTime() - sent.getTime()).toBe(14 * DAY);
    expect(reminderDueAt(sent).getTime() - sent.getTime()).toBe(10 * DAY);
  });

  it("walks through the states", () => {
    expect(balanceState({ payment_plan: "full" })).toBe("not_applicable");
    expect(balanceState({ payment_plan: "deposit" })).toBe("awaiting_model");
    expect(balanceState(order, 0, new Date(sent.getTime() + 13 * DAY))).toBe("awaiting_payment");
    expect(balanceState(order, 0, new Date(sent.getTime() + 14 * DAY + 1))).toBe("expired");
    expect(balanceState({ ...order, balance_paid_at: sent.toISOString() }, 0, new Date(sent.getTime() + 30 * DAY))).toBe("paid");
  });

  it("an open correction pauses the clock", () => {
    expect(balanceState(order, 1, new Date(sent.getTime() + 20 * DAY))).toBe("revision_requested");
  });

  it("formats amounts and days left", () => {
    expect(formatUsdCents(44100)).toBe("$441");
    expect(formatUsdCents(44150)).toBe("$441.50");
    expect(daysLeft(order.balance_due_at, new Date(sent.getTime() + 10 * DAY))).toBe(4);
    expect(daysLeft(order.balance_due_at, new Date(sent.getTime() + 15 * DAY))).toBe(0);
  });
});
