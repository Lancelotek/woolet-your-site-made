import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/meta-pixel", () => ({ isEuLikeVisitor: () => false }));
vi.mock("@/lib/journey", () => ({ getJourney: () => null }));

describe("openai-pixel visitor id fallback", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "wlt_vid=; max-age=0; path=/";
    vi.resetModules();
  });

  it("creates one stable first-party id and persists it (localStorage + 2y cookie)", async () => {
    const { getVisitorId, getOpenAiServerFields } = await import("@/lib/openai-pixel");
    const first = getVisitorId();
    const second = getVisitorId();
    expect(first).toBeTruthy();
    expect(second).toBe(first);
    expect(localStorage.getItem("wlt_vid")).toBe(first);
    expect(document.cookie).toContain(`wlt_vid=${first}`);
    expect(getOpenAiServerFields().wlt_visitor_id).toBe(first);
  });

  it("reuses the attribution journey id when present", async () => {
    vi.doMock("@/lib/journey", () => ({
      getJourney: () => ({ visitor_id: "journey-123", first: {}, last: {}, touch_count: 1, first_seen_at: "" }),
    }));
    const { getVisitorId } = await import("@/lib/openai-pixel");
    expect(getVisitorId()).toBe("journey-123");
  });
});
