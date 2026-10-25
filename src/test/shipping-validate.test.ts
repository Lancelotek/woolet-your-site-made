import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizePhone, validateShipping } from "@/lib/shipping-validate";

const base = {
  name: "John Price",
  phone: "+1 415 555 2671",
  line1: "100 Market St",
  city: "San Francisco",
  state: "CA",
  postal_code: "94105",
  country: "US",
};

describe("validateShipping", () => {
  it("accepts a complete US address and stores the phone in E.164", () => {
    const r = validateShipping(base);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.phone).toBe("+14155552671");
  });

  it("adds the country code to a local number", () => {
    expect(normalizePhone("600 123 456", "PL")).toBe("+48600123456");
    expect(normalizePhone("0048 600 123 456", "DE")).toBe("+48600123456");
  });

  it("rejects fake phones, bad postal codes and a missing US state", () => {
    const r = validateShipping({ ...base, phone: "123", postal_code: "ABC", state: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.sort()).toEqual(["phone", "postal_code", "state"]);
  });

  it("checks postal formats per country", () => {
    const pl = { ...base, phone: "+48 600 123 456", country: "PL", state: "", city: "Kraków" };
    expect(validateShipping({ ...pl, postal_code: "30-427" }).ok).toBe(true);
    expect(validateShipping({ ...pl, postal_code: "30427" }).ok).toBe(true);
    expect(validateShipping({ ...pl, postal_code: "3042" }).ok).toBe(false);
    const gb = { ...base, phone: "+44 20 7946 0958", country: "GB", state: "", city: "London" };
    expect(validateShipping({ ...gb, postal_code: "sw1a 1aa" }).ok).toBe(true);
  });

  it("does not require a postal code where none exists", () => {
    const hk = { ...base, phone: "+852 5123 4567", country: "HK", state: "", city: "Hong Kong", postal_code: "" };
    expect(validateShipping(hk).ok).toBe(true);
  });

  it("rejects countries we do not ship to", () => {
    const r = validateShipping({ ...base, country: "XX" });
    expect(r.ok).toBe(false);
  });
});

describe("edge-function copy", () => {
  it("stays identical to the frontend validator apart from the import", () => {
    const front = readFileSync(resolve(__dirname, "../lib/shipping-validate.ts"), "utf8");
    const edge = readFileSync(resolve(__dirname, "../../supabase/functions/_shared/shipping-validate.ts"), "utf8");
    const strip = (s: string) => s.replace(/from "(npm:)?libphonenumber-js(@[\d.]+)?\/max"/, 'from "LIB"');
    expect(strip(edge)).toBe(strip(front));
  });
});
