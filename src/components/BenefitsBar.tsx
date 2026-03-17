const BenefitsBar = () => {
  const benefits = [
    { icon: "%", title: "15% off launch price", sub: "Exclusive discount applied automatically at checkout", tag: "EXCLUSIVE" },
    { icon: "→", title: "Free shipping on your first order", sub: "Worldwide — no minimum order value" },
    { icon: "◈", title: "48h priority access before public", sub: "First pick of colours and models at launch" },
  ];

  return (
    <div className="flex flex-col border border-primary/20 overflow-hidden mb-1 md:bg-transparent"
      style={{ background: "hsl(var(--gold) / 0.08)", borderTopColor: "hsl(var(--gold) / 0.3)", borderBottomColor: "hsl(var(--gold) / 0.3)" }}>
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
            <span className="text-woolet-white tracking-wider text-[11px] md:text-[0.72rem]">{b.title}</span>
            <span className="text-cream-dim tracking-wider text-[10px] md:text-[0.6rem]">{b.sub}</span>
          </div>
          {b.tag && (
            <span className="bg-primary text-primary-foreground px-2 py-0.5 flex-shrink-0 font-semibold uppercase tracking-[0.2em]" style={{ fontSize: "0.48rem" }}>
              {b.tag}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default BenefitsBar;
