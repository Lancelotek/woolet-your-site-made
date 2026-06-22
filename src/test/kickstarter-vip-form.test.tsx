import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
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
  beforeEach(() => {
    navigateMock.mockReset();
    (window as unknown as { dataLayer?: unknown[] }).dataLayer = [];
  });

  it("submits with only email + consent, navigates to /vip-confirmed, and pushes empty user_first_name", async () => {
    renderPage();

    // Hero form has idSuffix="-hero"
    const form = document.getElementById("vip-form-hero") as HTMLFormElement;
    expect(form).toBeTruthy();

    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const nameInput = form.querySelector('input[type="text"]') as HTMLInputElement;
    const consentCheckbox = form.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(nameInput.value).toBe(""); // no first name
    fireEvent.change(emailInput, { target: { value: "wide@example.com" } });
    fireEvent.click(consentCheckbox);

    await waitFor(() => expect(submitBtn.disabled).toBe(false));
    fireEvent.click(submitBtn);

    const { supabase } = await import("@/integrations/supabase/client");
    await waitFor(() => {
      expect((supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        "/en/lp/kickstarter/vip-confirmed",
        expect.objectContaining({
          state: expect.objectContaining({ email: "wide@example.com", name: "" }),
        }),
      );
    });

    const dl = (window as unknown as { dataLayer: Array<Record<string, unknown>> }).dataLayer;
    const signup = dl.find((e) => e.event === "waitlist_signup");
    expect(signup, "waitlist_signup event must be pushed").toBeTruthy();
    expect(signup!.user_email).toBe("wide@example.com");
    expect(signup!.user_first_name).toBe("");
    expect(typeof signup!.user_first_name).toBe("string");
  });
});
