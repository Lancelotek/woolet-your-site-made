/**
 * Product reviews — source of truth for Schema.org Review / AggregateRating
 * rendered in product JSON-LD (src/seo/metadata.ts).
 *
 * COMPLIANCE — READ BEFORE EDITING
 * --------------------------------
 * Only paste reviews that are:
 *   1. Genuine, verifiable, and attributable to a real person who used the
 *      product (founding-member feedback, post-purchase emails, etc.).
 *   2. Stored with the customer's explicit permission to publish.
 *
 * Google issues manual actions and removes rich results for sites that mark
 * up fabricated, incentivised-but-undisclosed, or aggregate-of-zero reviews.
 * The FTC treats them as deceptive advertising.
 *
 * If `reviews` is empty (or `reviewCount` is 0), the JSON-LD generator MUST
 * omit `review` and `aggregateRating` entirely. Better no rich result than a
 * fake one.
 */

export type ProductReview = {
  author: string;
  /** 1–5 integer */
  rating: number;
  body: string;
  /** ISO 8601 date, e.g. "2026-05-12" */
  datePublished: string;
};

export type ProductReviewSet = {
  reviews: ProductReview[];
  /** Aggregate average, 1–5. Compute from real reviews; do not invent. */
  ratingValue: number;
  /** Total number of real reviews backing the aggregate. */
  reviewCount: number;
};

const empty: ProductReviewSet = { reviews: [], ratingValue: 0, reviewCount: 0 };

/**
 * Reviews per product model. Populate ONLY with verified customer feedback.
 * Until then, both sets stay empty and the JSON-LD omits review markup.
 */
export const PRODUCT_REVIEWS: Record<"007" | "009", ProductReviewSet> = {
  "007": empty,
  "009": empty,
};

export function getProductReviews(model: "007" | "009"): ProductReviewSet {
  return PRODUCT_REVIEWS[model] ?? empty;
}
