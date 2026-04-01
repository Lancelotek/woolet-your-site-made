import { useEffect, useRef } from "react";
import { pushGtmEvent } from "@/lib/gtm";

const guaranteeItems = [
  {
    icon: "🔄",
    title: "30 dni na zwrot — bez pytań",
    description: "Jeśli oprawki nie spełnią Twoich oczekiwań, zwracamy pieniądze. Bez komplikacji.",
  },
  {
    icon: "📏",
    title: "Fit Guarantee — gwarancja dopasowania",
    description: "Skorzystaj z naszego quizu dopasowania. Jeśli wynik wskaże Twój rozmiar, a oprawki nie pasują — wymienimy za darmo.",
  },
  {
    icon: "🏆",
    title: "Mazzucchelli od 1849 roku",
    description: "Każda oprawka jest wycięta z włoskiego octanu Mazzucchelli — tego samego materiału co Tom Ford i Oliver Peoples.",
  },
  {
    icon: "📦",
    title: "Darmowa dostawa + ubezpieczenie",
    description: "Wysyłka kurierem z pełnym ubezpieczeniem. Śledzenie przesyłki w czasie rzeczywistym.",
  },
];

interface TrustGuaranteeProps {
  productId: string;
}

const TrustGuarantee = ({ productId }: TrustGuaranteeProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pushGtmEvent("view_trust_section", {
            page_type: "product",
            product_id: productId,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [productId]);

  return (
    <div
      ref={sectionRef}
      style={{
        background: "#0F0E0C",
        border: "1px solid #2A2520",
        borderRadius: 12,
        padding: 16,
        margin: "14px 0",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 16, color: "#CAA449" }}>🛡️</span>
        <span
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: 9,
            letterSpacing: "3px",
            color: "#CAA449",
            textTransform: "uppercase",
          }}
        >
          GWARANCJA WOOLET
        </span>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {guaranteeItems.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 28,
                height: 28,
                minWidth: 28,
                background: "#1A1612",
                border: "1px solid #2A2520",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "#F8F8F6",
                  marginBottom: 2,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 11,
                  color: "#9A8E7E",
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social proof bottom row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 12,
          marginTop: 14,
          borderTop: "1px solid #2A2520",
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: 10,
            color: "#7A7570",
          }}
        >
          4,900+ osób na liście oczekujących
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ color: "#CAA449", fontSize: 11 }}>★</span>
          ))}
          <span
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: 10,
              color: "#CAA449",
              marginLeft: 2,
            }}
          >
            4.9
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrustGuarantee;
