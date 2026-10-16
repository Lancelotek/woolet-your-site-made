import { describe, it, expect, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("openai-pixel invoke patch", () => {
  it("enriches calls made through a freshly accessed functions client", async () => {
    const proto = Object.getPrototypeOf(supabase.functions);
    const spy = vi.fn(async function (this: unknown) {
      return { data: { ok: true }, error: null };
    });
    proto.invoke = spy;
    delete proto.__wltOaiq;

    const { initOpenAiPixel } = await import("@/lib/openai-pixel");
    initOpenAiPixel();

    await supabase.functions.invoke("mailerlite-subscribe", { body: { email: "a@b.co" } });

    expect(spy).toHaveBeenCalledTimes(1);
    const [name, opts] = spy.mock.calls[0] as unknown as [string, { body: Record<string, unknown> }];
    expect(name).toBe("mailerlite-subscribe");
    expect(opts.body.email).toBe("a@b.co");
    expect(opts.body).toHaveProperty("openai_consent");
    expect(["0", "1"]).toContain(opts.body.openai_consent);
  });
});
