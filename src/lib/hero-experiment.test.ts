import { beforeEach, describe, expect, it } from "vitest";
import { HERO_EXPERIMENT_ID, trackWaitlistSignupExperiment } from "./hero-experiment";

describe("trackWaitlistSignupExperiment", () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("sends hero_experiment_signup, not a second waitlist_signup", () => {
    localStorage.setItem("woolet_hl_variant", "b");
    const calls: unknown[][] = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (...args) => {
      calls.push(args);
    };
    trackWaitlistSignupExperiment();
    expect(calls).toEqual([[
      "event",
      "hero_experiment_signup",
      { experiment_id: HERO_EXPERIMENT_ID, variant_id: "b" },
    ]]);
    expect(calls.some((c) => c[1] === "waitlist_signup")).toBe(false);
  });
});
