// Bespoke shipping address validation - ONE rule set for the measurements page,
// the shipping form and the edge functions behind them.
//
// KEEP IN SYNC: supabase/functions/_shared/shipping-validate.ts is a copy of this
// file with a Deno import specifier. src/test/shipping-validate.test.ts fails
// when the two drift apart.
import { parsePhoneNumberFromString, type CountryCode } from "npm:libphonenumber-js@1.13.15/max";

/** Countries we ship Bespoke to (shipping form, measurements page, Stripe Checkout). */
export const SHIPPING_COUNTRY_CODES =
  "AE AR AT AU BE BG BR CA CH CL CN CO CY CZ DE DK EE EG ES FI FR GB GR HK HR HU ID IE IL IN IS IT JP KR LT LU LV MA MT MX MY NL NO NZ PE PH PL PT RO RS SA SE SG SI SK TH TR TW UA US VN ZA".split(
    " ",
  );

/** No postal codes in use - the field is optional there. */
export const NO_POSTAL_CODE = new Set(["AE", "HK"]);

/** Couriers reject parcels to these countries without a state / province. */
export const STATE_REQUIRED = new Set(["US", "CA", "AU"]);

// Formats after normalisation: upper case, single spaces, trimmed.
const POSTAL: Record<string, RegExp> = {
  AR: /^[A-Z]?\d{4}([A-Z]{3})?$/,
  AT: /^\d{4}$/,
  AU: /^\d{4}$/,
  BE: /^\d{4}$/,
  BG: /^\d{4}$/,
  BR: /^\d{5}-?\d{3}$/,
  CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/,
  CH: /^\d{4}$/,
  CL: /^\d{3}-?\d{4}$/,
  CN: /^\d{6}$/,
  CO: /^\d{6}$/,
  CY: /^\d{4}$/,
  CZ: /^\d{3} ?\d{2}$/,
  DE: /^\d{5}$/,
  DK: /^\d{4}$/,
  EE: /^\d{5}$/,
  EG: /^\d{5}$/,
  ES: /^\d{5}$/,
  FI: /^\d{5}$/,
  FR: /^\d{5}$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/,
  GR: /^\d{3} ?\d{2}$/,
  HR: /^\d{5}$/,
  HU: /^\d{4}$/,
  ID: /^\d{5}$/,
  IE: /^[A-Z]\d[\dW] ?[A-Z\d]{4}$/,
  IL: /^\d{5}(\d{2})?$/,
  IN: /^\d{3} ?\d{3}$/,
  IS: /^\d{3}$/,
  IT: /^\d{5}$/,
  JP: /^\d{3}-?\d{4}$/,
  KR: /^\d{5}$/,
  LT: /^(LT-?)?\d{5}$/,
  LU: /^(L-?)?\d{4}$/,
  LV: /^(LV-?)?\d{4}$/,
  MA: /^\d{5}$/,
  MT: /^[A-Z]{3} ?\d{2,4}$/,
  MX: /^\d{5}$/,
  MY: /^\d{5}$/,
  NL: /^\d{4} ?[A-Z]{2}$/,
  NO: /^\d{4}$/,
  NZ: /^\d{4}$/,
  PE: /^\d{5}$/,
  PH: /^\d{4}$/,
  PL: /^\d{2}-?\d{3}$/,
  PT: /^\d{4}-?\d{3}$/,
  RO: /^\d{6}$/,
  RS: /^\d{5}$/,
  SA: /^\d{5}(-?\d{4})?$/,
  SE: /^\d{3} ?\d{2}$/,
  SG: /^\d{6}$/,
  SI: /^(SI-?)?\d{4}$/,
  SK: /^\d{3} ?\d{2}$/,
  TH: /^\d{5}$/,
  TR: /^\d{5}$/,
  TW: /^\d{3}(\d{2,3})?$/,
  UA: /^\d{5}$/,
  US: /^\d{5}(-\d{4})?$/,
  VN: /^\d{6}$/,
  ZA: /^\d{4}$/,
};
const POSTAL_FALLBACK = /^[A-Z0-9][A-Z0-9 -]{1,9}$/;

export type ShippingField = "name" | "phone" | "line1" | "city" | "state" | "postal_code" | "country";

export type ShippingInput = {
  name?: unknown;
  phone?: unknown;
  line1?: unknown;
  line2?: unknown;
  city?: unknown;
  state?: unknown;
  postal_code?: unknown;
  country?: unknown;
};

export type ShippingValue = {
  name: string;
  /** E.164, e.g. +48600123456 */
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
};

/** `value` is set only when `ok` is true; `errors` is empty when `ok` is true. */
export type ShippingResult = { ok: boolean; value: ShippingValue | null; errors: ShippingField[] };

/** Customer-facing wording for each field error. */
export const SHIPPING_FIELD_ERRORS: Record<ShippingField | "consent", string> = {
  name: "full name",
  phone: "a phone number valid for the chosen country (or one starting with + and the country code)",
  line1: "street and number",
  city: "city",
  state: "state / province",
  postal_code: "postal code in the format used in your country",
  country: "country",
  consent: "consent",
};

const clean = (v: unknown, max: number): string => {
  if (v == null) return "";
  return String(v)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
};

export const normalizePostalCode = (v: unknown): string => clean(v, 20).toUpperCase();

export function isValidPostalCode(country: string, postal: string): boolean {
  if (!postal) return NO_POSTAL_CODE.has(country);
  return (POSTAL[country] ?? POSTAL_FALLBACK).test(postal);
}

/** Returns the number in E.164 or null when it is not a real number for that country. */
export function normalizePhone(raw: unknown, country: string): string | null {
  const input = clean(raw, 40);
  if (!input) return null;
  // "0048 600..." -> "+48 600..."
  const intl = input.replace(/^00(?=[1-9])/, "+");
  const parsed = /^[A-Z]{2}$/.test(country)
    ? parsePhoneNumberFromString(intl, country as CountryCode)
    : parsePhoneNumberFromString(intl);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

export function validateShipping(input: ShippingInput): ShippingResult {
  const country = clean(input.country, 2).toUpperCase();
  const name = clean(input.name, 120);
  const line1 = clean(input.line1, 200);
  const line2 = clean(input.line2, 200);
  const city = clean(input.city, 120);
  const state = clean(input.state, 120);
  const postal = normalizePostalCode(input.postal_code);
  const phone = normalizePhone(input.phone, country);

  const errors: ShippingField[] = [];
  if (name.length < 2 || !/\p{L}/u.test(name)) errors.push("name");
  if (!phone) errors.push("phone");
  if (line1.length < 3) errors.push("line1");
  if (city.length < 2 || !/\p{L}/u.test(city)) errors.push("city");
  if (STATE_REQUIRED.has(country) && state.length < 2) errors.push("state");
  if (!SHIPPING_COUNTRY_CODES.includes(country)) errors.push("country");
  else if (!isValidPostalCode(country, postal)) errors.push("postal_code");

  if (errors.length) return { ok: false, value: null, errors };
  return {
    ok: true,
    errors: [],
    value: {
      name,
      phone: phone!,
      line1,
      line2: line2 || null,
      city,
      state: state || null,
      postal_code: postal || null,
      country,
    },
  };
}
