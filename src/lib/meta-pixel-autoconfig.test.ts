import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/meta-capi", () => ({
  trackMetaEvent: vi.fn(),
  uuid: () => "evt-1",
  isProdHost: () => true,
}));

vi.mock("@/lib/bot-detect", () => ({
  isLikelyBot: () => false,
}));

describe("initMetaPixelDirect", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = "";
    document.body.innerHTML = "<script></script>";
    delete (window as unknown as { fbq?: unknown }).fbq;
    delete (window as unknown as { __wooletMetaDirect?: unknown }).__wooletMetaDirect;
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      timeZone: "America/New_York",
      locale: "en-US",
      calendar: "gregory",
      numberingSystem: "latn",
    });
    Object.defineProperty(navigator, "language", { value: "en-US", configurable: true });
    Object.defineProperty(navigator, "languages", { value: ["en-US"], configurable: true });
  });

  it("disables automatic events before init", async () => {
    const { initMetaPixelDirect } = await import("./meta-pixel");
    initMetaPixelDirect();
    const fbq = window.fbq as unknown as { queue: unknown[][] };
    const commands = fbq.queue.map((entry) => entry[0]);
    const setAt = fbq.queue.findIndex((entry) => entry[0] === "set" && entry[1] === "autoConfig");
    const initAt = fbq.queue.findIndex((entry) => entry[0] === "init");
    expect(setAt).toBeGreaterThanOrEqual(0);
    expect(initAt).toBeGreaterThan(setAt);
    expect(fbq.queue[setAt]).toEqual(["set", "autoConfig", false, "1951914478320328"]);
    expect(commands).toContain("init");
    const purchase = fbq.queue.find((entry) => entry[0] === "track" && entry[1] === "Purchase");
    expect(purchase).toBeUndefined();
  });
});