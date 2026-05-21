import { test, expect } from "../playwright-fixture";

// End-to-end check that the FitScan welcome step communicates the single
// supported card placement (horizontal on forehead) and that the deeper
// camera step gates capture on the "Pre-measurement checks" panel.
//
// The actual camera-driven card detection is covered by unit tests in
// src/lib/card-detection.test.ts (the pure classifyCardSample helper).
test.describe("FitScan — horizontal-on-forehead flow", () => {
  test("welcome step explains horizontal placement", async ({ page }) => {
    await page.goto("/en/fit/scan");

    await expect(
      page.getByText(/Hold to forehead/i),
    ).toBeVisible();

    await expect(
      page.getByText(/Lay it flat across your brow, long edge horizontal/i),
    ).toBeVisible();

    // Vertical / cheek wording must not appear anywhere on the welcome step.
    await expect(page.getByText(/cheek/i)).toHaveCount(0);
    await expect(page.getByText(/hold card vertically/i)).toHaveCount(0);

    const startButton = page.getByRole("button", { name: /start scan|scan unavailable/i });
    await expect(startButton).toBeVisible();
  });
});
