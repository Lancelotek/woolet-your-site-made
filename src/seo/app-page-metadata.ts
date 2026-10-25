/** Shared static/runtime metadata for registered app pages, including noindex tools. */
export const APP_PAGE_METADATA: Record<string, { title: string; description: string; robots: string }> = {
  "/bespoke/configurator": { title: "Bespoke Configurator - Woolet", description: "Design your made-to-order bio-acetate eyewear for wide faces and wide bridges. Hand made in EU from Mazzucchelli acetate.", robots: "index, follow" },
  "/bespoke/checkout": { title: "Secure checkout · Woolet Bespoke", description: "Complete your Woolet Bespoke order. Free worldwide shipping.", robots: "noindex, follow" },
  "/bespoke/scan": { title: "Bespoke Scan - Woolet", description: "Custom bespoke fit scan.", robots: "noindex, follow" },
  "/bespoke/measurements": { title: "Submit your measurements · Woolet Bespoke", description: "Send your AI face-scan and manual measurements so we can cut your Woolet Bespoke frames to fit.", robots: "noindex, follow" },
  "/bespoke/photo": { title: "Fit photo - Woolet Bespoke", description: "Confirm the fit of your made-to-measure frames.", robots: "noindex, follow" },
  "/bespoke/shipping": { title: "Shipping address · Woolet Bespoke", description: "Confirm where we ship your Woolet Bespoke frame.", robots: "noindex, follow" },
  "/measure": { title: "Measurement", description: "Private measurement page for a Woolet bespoke order.", robots: "noindex, nofollow" },
  "/reserve": { title: "Reserve your founder price - Woolet", description: "Reserve your Woolet founder price with a $1 deposit.", robots: "noindex, nofollow" },
  "/fit/wizard": { title: "FitLens Wizard - Measure Your Face | Woolet", description: "Step-by-step wizard for the Woolet FitLens measurement. Face width, bridge and PD in about 60 seconds.", robots: "noindex, follow" },
  "/fit/quick": { title: "Quick fit quiz - find your eyewear size in 30 seconds | Woolet", description: "No camera, no measuring. Answer 3 quick questions about hat size and nose width to get a starting recommendation for wide-face eyewear.", robots: "noindex, follow" },
  "/account": { title: "Your account - Woolet", description: "Manage your fit scans, orders, and bespoke configurations.", robots: "noindex, follow" },
  "/account/sign-in": { title: "Sign in - Woolet", description: "Sign in to view your fit scan history and orders.", robots: "noindex, follow" },
  "/account/callback": { title: "Signing in… - Woolet", description: "Completing your secure sign-in to Woolet.", robots: "noindex, follow" },
  "/vip-join": { title: "You're on the VIP list - Woolet", description: "VIP confirmation: you'll get the launch-day email plus 48h early access to the founding price.", robots: "noindex, follow" },
  "/thank-you": { title: "Thank you - Woolet", description: "Your Woolet signup confirmation and next steps.", robots: "noindex, nofollow" },
  "/thank-you-fb": { title: "Thank you — Woolet", description: "Your Woolet early-access confirmation.", robots: "noindex, nofollow" },
  "/thank-you/reserved": { title: "Reservation confirmed - Woolet", description: "Your Woolet reservation confirmation and next steps.", robots: "noindex, nofollow" },
  "/payments": { title: "Secure Checkout — Woolet", description: "Complete your secure Woolet payment.", robots: "noindex, nofollow" },
  "/admin/bespoke": { title: "Bespoke production — Woolet", description: "Private Woolet Bespoke production administration.", robots: "noindex, nofollow" },
  "/admin/attribution": { title: "Attribution - Woolet admin", description: "Private Woolet attribution administration.", robots: "noindex, nofollow" },
  "/upvote": { title: "Woolet — Listed On", description: "Woolet directory listings.", robots: "noindex, nofollow" },
  "/shop": { title: "Woolet Shop - Wide-Face Eyewear", description: "Italian Mazzucchelli acetate eyewear engineered for wide faces. 158 mm front, 26 mm keyhole bridge, Hand made in EU.", robots: "noindex, nofollow" },
  "/unsubscribe": { title: "Unsubscribe - Woolet", description: "Manage your email preferences.", robots: "noindex, follow" },
  "/.lovable/oauth/consent": { title: "Authorize application - Woolet", description: "Grant access to Woolet on your behalf.", robots: "noindex, follow" },
  "/lp/kickstarter/vip-confirmed": { title: "You're on the VIP list — Woolet Kickstarter", description: "You're on the Woolet VIP list. Get early access, see how we build bespoke glasses for wide faces, and join the VIP group before the Kickstarter launch.", robots: "noindex, follow" },
};

export function appPageMetadata(route: string) {
  const path = route.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  if (route === "/de/fit/manual") return { title: "Gesichtsbreite manuell messen | Woolet", description: "Gesichtsbreite ohne Kamera messen und die passende Woolet Brille finden.", robots: "noindex, follow" };
  if (route === "/de/fit/quick") return { title: "Schneller Brillen-Passform-Quiz | Woolet", description: "Erhalte in wenigen Schritten eine erste Einschätzung für deine Woolet Passform.", robots: "noindex, follow" };
  return APP_PAGE_METADATA[path];
}