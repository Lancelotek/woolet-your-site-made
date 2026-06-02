import { useEffect, useRef } from "react";
import { pushGtmEvent } from "@/lib/gtm";

const IconReturn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CAA449" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const IconFit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CAA449" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12L5 9l3 3" />
    <path d="M5 9v6a4 4 0 0 0 4 4h6" />
    <path d="M22 12l-3 3-3-3" />
    <path d="M19 15V9a4 4 0 0 0-4-4H9" />
  </svg>
);

const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CAA449" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const IconShipping = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CAA449" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CAA449" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const guaranteeItems = [
  {
    icon: <IconReturn />,
    title: "30-Day Returns — No Questions Asked",
    description: "If the frames don't meet your expectations, we'll refund your money. No hassle.",
  },
  {
    icon: <IconFit />,
    title: "Fit Guarantee",
    description: "Take our fit quiz. If the result indicates your size but the frames don't fit — we'll exchange them for free.",
  },
  {
    icon: <IconTrophy />,
    title: "Mazzucchelli Since 1849",
    description: "Every frame is cut from Italian Mazzucchelli acetate — the same material used by Tom Ford and Oliver Peoples.",
  },
  {
    icon: <IconShipping />,
    title: "Free Shipping + Insurance",
    description: "Courier delivery with full insurance. Real-time shipment tracking.",
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
        <IconShield />
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
          WOOLET GUARANTEE
        </span>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {guaranteeItems.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 32,
                height: 32,
                minWidth: 32,
                background: "#1A1612",
                border: "1px solid #2A2520",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
          justifyContent: "center",
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
          4,900+ people on the waitlist
        </span>
      </div>
    </div>
  );
};

export default TrustGuarantee;
