export const DE_PRICING = {
  reservationEur: 1,
  founderPriceEur: 109,
  regularPriceEur: 179,
  // 22.10.2026: new link without Managed Payments / auto tax / invoice
  // (old plink_1UHLCg sold via "Link" as JAY23, card + Bancontact only).
  stripeReservationUrl: "https://book.stripe.com/6oUcN6eux51E3ER38xfbq0q",
  founderLimit: 30,
  priceValidUntil: "2027-12-31",
} as const;

export const formatDePrice = (value: number): string => `${value} €`;

export const deReservationUrl = (source: string): string => {
  const url = new URL(DE_PRICING.stripeReservationUrl);
  url.searchParams.set("client_reference_id", `de_${source}`);
  url.searchParams.set("market", "de");
  return url.toString();
};

const RESERVED_KEY = "wlt_de_reserved";

/** True once this browser completed the DE 1 € reservation (set on /de/danke). */
export const isDeReserved = (): boolean => {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(RESERVED_KEY) === "1";
  } catch {
    return false;
  }
};

export const markDeReserved = (): void => {
  try {
    window.localStorage.setItem(RESERVED_KEY, "1");
  } catch {
    /* storage blocked - nothing to remember */
  }
};
