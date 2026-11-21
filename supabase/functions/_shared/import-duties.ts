// Customer-facing note on import duty and taxes for frames shipped from the EU.
// Used by the order confirmation emails (Founder Edition and Bespoke) so every
// buyer outside the EU knows up front that the carrier may collect charges on
// delivery. Figures checked 2026-11-19 (FedEx from Poland, HS 9003.11).

const EU = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

/** One or two sentences for the email, in English. Empty country gets the generic text. */
export function importDutyNote(country: string | null | undefined): string {
  const c = String(country ?? "").trim().toUpperCase();
  const lead = "Your frame ships from the European Union.";
  if (c === "US") {
    return `${lead} US import duty applies to eyewear from the EU (about 15% of the order value), and the carrier usually adds a customs clearance fee. Both are charged to you by the carrier on delivery, not included in your payment to us.`;
  }
  if (c === "CA") {
    return `${lead} Under the EU-Canada trade agreement (CETA) there is no import duty on the frame, but Canada charges 5% GST, and the carrier usually adds a small brokerage fee. Both are charged to you by the carrier on delivery, not included in your payment to us.`;
  }
  if (EU.has(c)) {
    return `${lead} It stays inside the EU, so there is no import duty or customs fee.`;
  }
  return `${lead} Depending on your country, import duty, VAT or a carrier clearance fee may apply. These are charged to you by the carrier on delivery, not included in your payment to us.`;
}

/** "Name, line1, line2, postal city, state, country" without empty parts. */
export function formatShipLine(parts: Array<string | null | undefined>): string {
  return parts.filter((v): v is string => typeof v === "string" && v.trim() !== "").join(", ");
}
