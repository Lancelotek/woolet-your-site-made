import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { PRODUCT_FAQ } from "@/seo/faq-data";
import { PRODUCT_FAQ_I18N, type PdpLang } from "@/i18n/productPageCopy";

const FAQ_HEADING: Record<PdpLang, string> = {
  en: "Frequently Asked Questions",
  fr: "Questions fréquentes",
  nl: "Veelgestelde vragen",
};

interface ProductFAQProps {
  productId: string;
  lang?: PdpLang;
}

const ProductFAQ = ({ productId, lang = "en" }: ProductFAQProps) => {
  const faqItems = lang === "en" ? PRODUCT_FAQ : PRODUCT_FAQ_I18N[lang];
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      pushGtmEvent("faq_expand", {
        // analytics keep the EN question so reports stay comparable across locales
        question: PRODUCT_FAQ[index]?.q ?? faqItems[index].q,
        page_type: "product",
        product_id: productId,
      });
      return [...prev, index];
    });
  };
  // FAQPage JSON-LD is now emitted server-side via scripts/prerender.mjs
  // (see src/seo/metadata.ts) so AI crawlers see it without executing JS.

  return (
    <div style={{ background: "#F8F6F1", padding: 20, marginTop: 0 }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: "3px",
            color: "#888888",
            textTransform: "uppercase",
            marginBottom: 14,
            marginTop: 0,
          }}
        >
          {FAQ_HEADING[lang]}
        </h2>

        {faqItems.map((item, i) => {
          const isOpen = openIndices.includes(i);
          return (
            <div
              key={i}
              style={{
                borderBottom: "1px solid #E8E4DC",
                padding: "12px 0",
              }}
            >
              <button
                onClick={() => toggle(i)}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    color: "#111111",
                  }}
                >
                  {item.q}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 300,
                    fontSize: 18,
                    color: "#888",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                >
                  {isOpen ? "–" : "+"}
                </span>
              </button>
              <div
                style={{
                  maxHeight: isOpen ? 300 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 300,
                    fontSize: 13,
                    color: "#3A3A3A",
                    lineHeight: 1.7,
                    padding: "8px 0 4px",
                    maxWidth: 600,
                    margin: 0,
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductFAQ;
