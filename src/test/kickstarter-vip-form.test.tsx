import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(globalThis as unknown as { IntersectionObserver: typeof IOStub }).IntersectionObserver = IOStub;
import { HelmetProvider } from "react-helmet-async";

// --- Mocks ---
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

import KickstarterPrelaunch from "@/pages/lp/KickstarterPrelaunch";

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/en/lp/kickstarter"]}>
        <KickstarterPrelaunch />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("Kickstarter VIP form — email-only submission", () => {
  beforeEach(async () => {
    navigateMock.mockReset();
    (window as unknown as { dataLayer?: unknown[] }).dataLayer = [];
    const { supabase } = await import("@/integrations/supabase/client");
    (supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>).mockClear();
  });

  it("submits with only email + inline consent, advances to step 2, and pushes empty user_first_name", async () => {
    renderPage();

    // Hero form lives in the vip-section-hero wrapper and has idSuffix="-hero"
    const form = document.getElementById("vip-section-hero") as HTMLFormElement;
    expect(form).toBeTruthy();

    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Email-only form: no first-name field and no consent checkbox on the page anymore
    expect(form.querySelector('input[type="text"]')).toBeNull();
    expect(form.querySelector('input[type="checkbox"]')).toBeNull();

    fireEvent.change(emailInput, { target: { value: "wide@example.com" } });

    await waitFor(() => expect(submitBtn.disabled).toBe(false));
    fireEvent.click(submitBtn);

    const { supabase } = await import("@/integrations/supabase/client");
    await waitFor(() => {
      expect((supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
    });

    // Step 2 opens in its own focused view instead of remaining inside the form.
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /\$1 today locks your/ })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Lock \$114 - pay \$1 now/ })).toBeTruthy();
    });
    expect(screen.getByRole("dialog", { name: /\$1 today locks your/ }).querySelectorAll("img")).toHaveLength(1);
    const invokeMock = supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>;
    await new Promise((r) => setTimeout(r, 50));
    expect(invokeMock.mock.calls.some(([name]) => name === "create-checkout")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /Lock \$114 - pay \$1 now/ }));
    await waitFor(() => {
      expect(invokeMock.mock.calls.some(([name]) => name === "create-checkout")).toBe(true);
    });
    const { pushGtmEvent } = await import("@/lib/gtm");
    expect((pushGtmEvent as ReturnType<typeof vi.fn>).mock.calls.filter(([name]) => name === "kickstarter_reserve_step_view")).toHaveLength(1);

    const dl = (window as unknown as { dataLayer: Array<Record<string, unknown>> }).dataLayer;
    const signup = dl.find((e) => e.event === "waitlist_signup");
    expect(signup, "waitlist_signup event must be pushed").toBeTruthy();
    expect(signup!.user_email).toBe("wide@example.com");
    expect(signup!.user_first_name).toBe("");
    expect(typeof signup!.user_first_name).toBe("string");
  });

  it("keeps UTM attribution when localStorage is blocked (iOS in-app browser)", async () => {
    // Simulate blocked storage (Instagram/Facebook in-app browser on iOS).
    const getItemSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new DOMException("Access is denied", "SecurityError");
      });
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Access is denied", "SecurityError");
      });

    // Attribution is read from the real URL, so put the UTMs there.
    window.history.pushState(
      {},
      "",
      "/en/lp/kickstarter?utm_source=ig&utm_medium=paid&utm_campaign=ks_vip&utm_content=reel_a",
    );

    try {
      render(
        <HelmetProvider>
          <MemoryRouter
            initialEntries={[
              "/en/lp/kickstarter?utm_source=ig&utm_medium=paid&utm_campaign=ks_vip&utm_content=reel_a",
            ]}
          >
            <KickstarterPrelaunch />
          </MemoryRouter>
        </HelmetProvider>,
      );

      const form = document.getElementById("vip-section-hero") as HTMLFormElement;
      const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

      fireEvent.change(emailInput, { target: { value: "ios@example.com" } });
      await waitFor(() => expect(submitBtn.disabled).toBe(false));
      fireEvent.click(submitBtn);

      const { supabase } = await import("@/integrations/supabase/client");
      const invoke = supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>;
      await waitFor(() =>
        expect(
          invoke.mock.calls.some((c) => c[0] === "mailerlite-subscribe"),
        ).toBe(true),
      );

      const mlCall = invoke.mock.calls.find((c) => c[0] === "mailerlite-subscribe");
      const body = mlCall?.[1]?.body as Record<string, unknown>;
      expect(body.utm_source).toBe("ig");
      expect(body.utm_campaign).toBe("ks_vip");
      expect(body.utm_content).toBe("reel_a");
    } finally {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
    }
  });
});
