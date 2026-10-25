// Countries offered in the Bespoke shipping address (measurements + shipping form).
import { SHIPPING_COUNTRY_CODES } from "@/lib/shipping-validate";

export const COUNTRY_CODES = SHIPPING_COUNTRY_CODES;

export const countryLabel = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};
