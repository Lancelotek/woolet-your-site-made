/**
 * FitLens tool-page FAQ + result bands.
 * React/DOM-free so the SSR metadata bundle can import it.
 * Shared by:
 *   - src/components/FitToolContent.tsx (visible UI)
 *   - src/seo/metadata.ts (prerendered FAQPage JSON-LD + noscript body)
 */

export type FitFaqItem = { q: string; a: string };

export const FIT_FAQ: FitFaqItem[] = [
  {
    q: "Is FitLens a virtual try-on?",
    a: "No. A virtual try-on renders frames over your face so you can judge how they look. FitLens measures your face in millimetres and tells you whether a 158 mm frame will actually fit. Looks are subjective; fit is a number.",
  },
  {
    q: "How accurate is the measurement?",
    a: "Within about ±1.5 mm when you hold a standard card flat on your forehead. Every credit, debit and ID card is 85.6 mm wide by ISO standard, so the scan uses that known edge to convert pixels to millimetres.",
  },
  {
    q: "Do I need to download an app?",
    a: "No. FitLens runs in your phone browser at woolet.co/en/fit. There is nothing to install, no account and no appointment. The scan takes about 20 seconds.",
  },
  {
    q: "Is my photo stored?",
    a: "The camera frame is processed to extract measurements and is not kept as part of your profile. What we retain is the resulting numbers — face width, bridge width and pupillary distance — and only if you choose to save or email your result.",
  },
  {
    q: "What if the scan says I am outside the standard range?",
    a: "It will say so plainly. Below 155 mm or above 161 mm, the signature 158 mm frame is the wrong frame and we route you to bespoke, which covers 145 to 162 mm. Above 162 mm we do not build a frame and we will tell you that instead of selling you one.",
  },
  {
    q: "Can I measure without the camera?",
    a: "Yes. The manual route at /en/fit/manual walks you through your face width with a soft tape measure — no camera, no card. It gives you the same size recommendation, but only the face-width figure; for bridge width and pupillary distance you need the scan.",
  },
];

export const FIT_BANDS: { range: string; verdict: string; size: string }[] = [
  { range: "Under 145 mm", verdict: "Narrow to average — mainstream frames fit you", size: "Not a Woolet fit" },
  { range: "145–154 mm", verdict: "Wider than average, narrower than our signature", size: "Bespoke, built to your millimetre" },
  { range: "155–161 mm", verdict: "Signature range — the frame is designed for this", size: "158 mm — Woolet 007 or 009" },
  { range: "162 mm", verdict: "One millimetre above signature; ceiling of made-to-measure", size: "Bespoke 162 mm" },
  { range: "Above 162 mm", verdict: "Wider than we build — we will say so", size: "No frame we can make honestly" },
];
