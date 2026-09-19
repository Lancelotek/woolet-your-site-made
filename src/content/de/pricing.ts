export const DE_PRICING = {
  reservationEur: 1,
  founderPriceEur: 109,
  regularPriceEur: 179,
  stripeReservationUrl: "https://buy.stripe.com/6oU3cwdqt9hUgrDbF3fbq0p",
  founderLimit: 100,
  priceValidUntil: "2027-12-31",
} as const;

export const formatDePrice = (value: number): string => `${value} €`;

export const deReservationUrl = (source: string): string => {
  const url = new URL(DE_PRICING.stripeReservationUrl);
  url.searchParams.set("client_reference_id", `de_${source}`);
  url.searchParams.set("market", "de");
  return url.toString();
};