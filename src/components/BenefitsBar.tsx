const BenefitsBar = () => {
  const benefits = [
    { icon: "%", title: "15% off launch price", sub: "Exclusive discount applied automatically at checkout" },
    { icon: "→", title: "Free shipping on your first order", sub: "Worldwide — no minimum order value" },
    { icon: "◈", title: "48h priority access before public", sub: "First pick of colours and models at launch" },
  ];

  return (
    <div className="flex flex-col border border-primary/20 overflow-hidden mb-1">
      {benefits.map((b, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-primary/5"
          style={{ borderBottom: i < benefits.length - 1 ? "1px solid hsl(0 0% 100% / 0.055)" : "none" }}
        >
          <div className="w-7 h-7 flex-shrink-0 border border-primary/20 flex items-center justify-center text-primary" style={{ fontSize: "0.75rem" }}>
            {b.icon}
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-woolet-white tracking-wider" style={{ fontSize: "0.72rem" }}>{b.title}</span>
            <span className="text-cream-dim tracking-wider" style={{ fontSize: "0.6rem" }}>{b.sub}</span>
          </div>
          <span className="bg-primary text-primary-foreground px-2 py-0.5 flex-shrink-0 font-semibold uppercase tracking-[0.2em]" style={{ fontSize: "0.48rem" }}>
            Waitlist only
          </span>
        </div>
      ))}
    </div>
  );
};

export default BenefitsBar;
