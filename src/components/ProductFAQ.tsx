import { useState, useEffect, useRef } from "react";
import { pushGtmEvent } from "@/lib/gtm";

const faqItems = [
  {
    q: "How will I know if the frames fit my face?",
    a: "Measure your face width from temple to temple. If the result is 155mm or more — Woolet is designed specifically for you. Our fit quiz at /en/fit will help you confirm your size in 60 seconds. If the frames still don't fit — we'll exchange them for free under our Fit Guarantee.",
  },
  {
    q: "Can I return the glasses if they don't suit me?",
    a: "Yes. You have 30 days to return them with no questions asked. We'll refund the full amount to your original payment method. Just send the frames back in the original packaging.",
  },
  {
    q: "How is Woolet different from cheaper wide-face glasses?",
    a: "Most brands offering wide frames (Fatheadz, BXL, Zenni) use TR90 plastic or cheap acetate. Woolet uses Italian Mazzucchelli acetate — the same material found in $500+ frames. We add 5-barrel PVD Gunmetal hinges, a 21mm keyhole bridge, and hand polishing. Premium quality at the Founding Member price of €189.",
  },
  {
    q: "When will I receive my order?",
    a: "As a Founding Member, you'll receive your frames in the first production batch. Shipped via courier with full insurance and tracking. Estimated delivery: 5–7 business days (EU), 7–12 days (rest of world).",
  },
  {
    q: "Does Woolet offer prescription lenses (Rx)?",
    a: "Yes, Woolet frames are prescription-ready. You can have lenses fitted at any optician. The base curve 4 is compatible with most corrections. We're also planning a built-in Rx service in the future.",
  },
];

interface ProductFAQProps {
  productId: string;
}

const ProductFAQ = ({ productId }: ProductFAQProps) => {
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const schemaAdded = useRef(false);

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      pushGtmEvent("faq_expand", {
        question: faqItems[index].q,
        page_type: "product",
        product_id: productId,
      });
      return [...prev, index];
    });
  };

  useEffect(() => {
    if (schemaAdded.current) return;
    schemaAdded.current = true;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div style={{ background: "#F8F6F1", padding: 20, marginTop: 0 }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: 9,
            letterSpacing: "3px",
            color: "#888888",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          CZĘSTE PYTANIA
        </div>

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
