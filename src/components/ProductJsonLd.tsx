import { Helmet } from "react-helmet-async";
import { buildProductJsonLd, type ProductSchemaInput } from "@/seo/product-schema";

/**
 * Reusable Product JSON-LD injector for eyewear product pages.
 * Emits one <script type="application/ld+json"> in the document head
 * with schema.org Product markup that satisfies Google's Merchant
 * listings requirements (image[], hasMerchantReturnPolicy, shippingDetails).
 *
 * Pass real product data — do not fabricate prices or images.
 */
const ProductJsonLd = ({ product }: { product: ProductSchemaInput }) => {
  const schema = buildProductJsonLd(product);
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default ProductJsonLd;
