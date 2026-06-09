import { test, expect, devices } from "@playwright/test";

// Mobile-viewport coverage for FitScan welcome step — verifies that the
// entry point renders and the Start button is present on the device sizes
// that real iOS Safari and Android Chrome users hit.
//
// We intentionally do NOT mock getUserMedia or the MediaPipe landmarker
// here — those paths depend on real hardware and are covered by:
//   - src/lib/face-measurements.test.ts  (math + manual-fallback branches)
//   - src/lib/card-detection.test.ts     (card edge classifier)
//   - docs/fit-scan-mobile-test-checklist.md  (manual device matrix)

const MOBILE_VIEWPORTS: Array<{ name: string; width: number; height: number; ua?: string }> = [
  { name: "iPhone 13 (Safari)", width: 390, height: 844, ua: devices["iPhone 13"]?.userAgent },
  { name: "iPhone SE (Safari)", width: 375, height: 667, ua: devices["iPhone SE"]?.userAgent },
  { name: "Pixel 7 (Chrome)", width: 412, height: 915, ua: devices["Pixel 7"]?.userAgent },
  { name: "Galaxy S9+ (Chrome)", width: 360, height: 740, ua: devices["Galaxy S9+"]?.userAgent },
];

test.describe("FitScan — mobile welcome step renders across devices", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`renders Start CTA on ${vp.name}`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: vp.ua,
        hasTouch: true,
        isMobile: true,
      });
      const page = await ctx.newPage();
      await page.goto("/en/fit");

      await expect(page.getByText(/Hold to forehead/i)).toBeVisible();
      await expect(
        page.getByText(/Lay it flat across your brow, long edge horizontal/i),
      ).toBeVisible();

      const startButton = page.getByRole("button", { name: /start scan|scan unavailable/i });
      await expect(startButton).toBeVisible();

      await ctx.close();
    });
  }
});
