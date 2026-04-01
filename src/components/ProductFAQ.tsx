import { useState, useEffect, useRef } from "react";
import { pushGtmEvent } from "@/lib/gtm";

const faqItems = [
  {
    q: "Skąd będę wiedzieć, że oprawki pasują na moją twarz?",
    a: "Zmierz szerokość twarzy od skroni do skroni. Jeśli wynik to 155mm lub więcej — Woolet jest zaprojektowany specjalnie dla Ciebie. Nasz quiz dopasowania na stronie /en/fit pomoże Ci potwierdzić rozmiar w 60 sekund. Jeśli oprawki mimo to nie pasują — wymienimy je za darmo w ramach Fit Guarantee.",
  },
  {
    q: "Czy mogę zwrócić okulary jeśli mi nie odpowiadają?",
    a: "Tak. Masz 30 dni na zwrot bez podawania przyczyny. Zwracamy pełną kwotę na oryginalną metodę płatności. Wystarczy wysłać oprawki w oryginalnym opakowaniu.",
  },
  {
    q: "Czym różni się Woolet od tańszych okularów na szerokie twarze?",
    a: "Większość marek oferujących szerokie oprawki (Fatheadz, BXL, Zenni) używa plastiku TR90 lub taniego octanu. Woolet używa włoskiego octanu Mazzucchelli — tego samego materiału co w oprawkach za $500+. Dodajemy 5-baryłkowe zawiasy PVD Gunmetal, mostek keyhole 21mm i ręczne polerowanie. To premium jakość w cenie Founding Member 499 zł.",
  },
  {
    q: "Kiedy otrzymam zamówienie?",
    a: "Jako Founding Member otrzymasz oprawki w pierwszej partii produkcyjnej. Wysyłka kurierem z pełnym ubezpieczeniem i śledzeniem. Szacowany czas dostawy: 5–7 dni roboczych (EU), 7–12 dni (reszta świata).",
  },
  {
    q: "Czy Woolet oferuje okulary korekcyjne (Rx)?",
    a: "Tak, oprawki Woolet są przystosowane do soczewek korekcyjnych. Możesz zamontować soczewki u dowolnego optyka. Bazowa krzywa 4 jest kompatybilna z większością korekt. Planujemy również wbudowaną usługę Rx w przyszłości.",
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
