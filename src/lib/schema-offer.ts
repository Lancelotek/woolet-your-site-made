/**
 * Merchant-listings normaliser for every Product / Offer JSON-LD node.
 * Applied at serialisation time (prerender + client) so every Product has an
 * absolute image, and every Offer / AggregateOffer carries validFrom,
 * hasMerchantReturnPolicy and shippingDetails from commerce-schema.ts.
 * Existing absolute images and existing return policies are kept as-is.
 */
import { RETURN_POLICY, SHIP_COUNTRIES, shippingDetails, PRICE_VALID_FROM, priceValidUntil } from "@/seo/commerce-schema";

const SITE = "https://woolet.co";
export const PRODUCT_IMAGES = {
  "007": [`${SITE}/og-007.png`, `${SITE}/og-image.png`],
  "009": [`${SITE}/og-009.png`, `${SITE}/og-image.png`],
  generic: [`${SITE}/og-image.png`, `${SITE}/og-007.png`, `${SITE}/og-009.png`],
};

type Node = Record<string, any>;
const isType = (n: Node, t: string) => n?.["@type"] === t || (Array.isArray(n?.["@type"]) && n["@type"].includes(t));
const isAbs = (v: unknown) => typeof v === "string" && /^https?:\/\//.test(v);

function imagesFor(n: Node): string[] {
  const key = `${n.name ?? ""} ${n.sku ?? ""} ${n.productID ?? ""}`;
  if (/009/.test(key)) return PRODUCT_IMAGES["009"];
  if (/007/.test(key)) return PRODUCT_IMAGES["007"];
  return PRODUCT_IMAGES.generic;
}

function hasGoodImage(img: unknown): boolean {
  if (Array.isArray(img)) return img.length > 0 && img.every((i) => isAbs(typeof i === "object" ? i?.url : i));
  if (img && typeof img === "object") return isAbs((img as Node).url);
  return isAbs(img);
}

const iso2 = (c: unknown): string | null => {
  const v = typeof c === "object" && c ? (c as Node).name ?? (c as Node).addressCountry : c;
  return typeof v === "string" && /^[A-Z]{2}$/.test(v.trim()) ? v.trim() : null;
};

function fixShipping(details: unknown, bespoke: boolean): Node[] {
  const list = (Array.isArray(details) ? details : [details]).filter(Boolean) as Node[];
  const out: Node[] = [];
  for (const d of list) {
    const dest = d.shippingDestination;
    const dests = (Array.isArray(dest) ? dest : [dest]).filter(Boolean) as Node[];
    const countries = dests.flatMap((r) => {
      const c = r?.addressCountry;
      return (Array.isArray(c) ? c : [c]).map(iso2).filter(Boolean) as string[];
    });
    if (!countries.length) continue; // "Worldwide"/region names — replaced below if nothing valid remains
    const dt = { ...(d.deliveryTime ?? { "@type": "ShippingDeliveryTime" }) };
    const q = (min: number, max: number) => ({ "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" });
    if (!dt.handlingTime) dt.handlingTime = bespoke ? q(10, 14) : q(1, 2);
    if (!dt.transitTime) dt.transitTime = q(3, 7);
    for (const c of countries) {
      out.push({ ...d, shippingDestination: { "@type": "DefinedRegion", addressCountry: c }, deliveryTime: dt });
    }
  }
  return out.length ? out : shippingDetails(bespoke);
}

function fixReturnPolicy(p: unknown): Node {
  if (!p || typeof p !== "object") return { ...RETURN_POLICY };
  const pol = { ...(p as Node) };
  const ac = Array.isArray(pol.applicableCountry) ? pol.applicableCountry : [pol.applicableCountry];
  const codes = ac.map(iso2).filter(Boolean) as string[];
  pol.applicableCountry = codes.length ? codes : [...SHIP_COUNTRIES];
  return pol;
}

function fixOffer(o: Node, bespoke: boolean): Node {
  const out = { ...o };
  if (!out.validFrom) out.validFrom = PRICE_VALID_FROM;
  if (!out.priceValidUntil) out.priceValidUntil = priceValidUntil();
  out.hasMerchantReturnPolicy = fixReturnPolicy(out.hasMerchantReturnPolicy);
  out.shippingDetails = out.shippingDetails ? fixShipping(out.shippingDetails, bespoke) : shippingDetails(bespoke);
  return out;
}

function walk(v: any, bespoke: boolean): any {
  if (Array.isArray(v)) return v.map((x) => walk(x, bespoke));
  if (!v || typeof v !== "object") return v;
  let n: Node = { ...v };
  let isBespoke = bespoke;
  if (isType(n, "Product")) {
    isBespoke = /bespoke/i.test(`${n.name ?? ""} ${n.sku ?? ""}`);
    if (!hasGoodImage(n.image)) n.image = imagesFor(n);
  }
  for (const k of Object.keys(n)) {
    if (k === "hasMerchantReturnPolicy" || k === "shippingDetails") continue;
    n[k] = walk(n[k], isBespoke);
  }
  if (isType(n, "Offer") || isType(n, "AggregateOffer")) n = fixOffer(n, isBespoke);
  return n;
}

export function normalizeCommerceJsonLd<T>(obj: T): T {
  try {
    return walk(obj, false);
  } catch {
    return obj;
  }
}

/** JSON.stringify with merchant-listings normalisation. */
export const commerceJson = (obj: unknown) => JSON.stringify(normalizeCommerceJsonLd(obj));
